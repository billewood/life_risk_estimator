"""
Data Acquisition Module for Mortality Calculator
Downloads and processes ONLY real data from official sources
"""

import requests
import pandas as pd
import numpy as np
import json
import os
from datetime import datetime
from typing import Dict, Any, Optional, Tuple
import sys
import os
# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_logger import data_logger

class DataAcquisition:
    def __init__(self, data_dir: str = None):
        if data_dir is None:
            # Use relative path from current working directory
            self.data_dir = os.path.join(os.path.dirname(__file__))
        else:
            self.data_dir = data_dir
        os.makedirs(self.data_dir, exist_ok=True)
        
        # Register known data sources
        self._register_sources()
    
    def _register_sources(self):
        """Register all known data sources in the database"""
        
        # SSA Life Tables
        data_logger.register_source(
            source_name="SSA Period Life Tables",
            source_type="mortality_tables",
            url="https://www.ssa.gov/oact/STATS/table4c6.html",
            description="Official U.S. period life tables with 1-year probability of death by age and sex",
            version="2021",
            last_updated="2023-01-01"
        )
        
        # CDC Cause of Death
        data_logger.register_source(
            source_name="CDC/NCHS Cause of Death",
            source_type="cause_mortality",
            url="https://www.cdc.gov/nchs/nvss/mortality/lewk3.htm",
            description="Age-specific cause-of-death patterns from CDC/NCHS",
            version="2022",
            last_updated="2024-01-01"
        )
        
        # GBD Risk Factors
        data_logger.register_source(
            source_name="Global Burden of Disease",
            source_type="risk_factors",
            url="https://www.healthdata.org/gbd",
            description="Comprehensive relative risk estimates for modifiable risk factors",
            version="2019",
            last_updated="2021-01-01"
        )
        
        # ePrognosis Validation
        data_logger.register_source(
            source_name="ePrognosis",
            source_type="validation_models",
            url="https://eprognosis.ucsf.edu/",
            description="Validated short-term mortality models for older adults",
            version="2020",
            last_updated="2020-01-01"
        )
    
    def download_ssa_life_tables(self, force_download: bool = False) -> pd.DataFrame:
        """
        Download and parse SSA life tables from HTML, or load from cache if available
        """
        # Check if we already have recent data
        ssa_file = f"{self.data_dir}/ssa_life_tables_2021.csv"
        metadata_file = f"{self.data_dir}/ssa_life_tables_metadata.json"
        
        if not force_download and os.path.exists(ssa_file) and os.path.exists(metadata_file):
            # Check if data is recent (less than 30 days old)
            try:
                with open(metadata_file, 'r') as f:
                    metadata = json.load(f)
                
                download_date = datetime.fromisoformat(metadata['download_date'])
                days_old = (datetime.now() - download_date).days
                
                if days_old < 30:
                    print(f"Using cached SSA data (downloaded {days_old} days ago)")
                    df = pd.read_csv(ssa_file)
                    
                    # Log usage of cached data
                    data_hash = data_logger.get_data_hash(df.to_dict())
                    source_id = data_logger.register_source(
                        source_name="SSA Period Life Tables",
                        source_type="mortality_tables",
                        url=metadata['source_url'],
                        version="2021"
                    )
                    
                    import_id = data_logger.log_import(
                        source_id=source_id,
                        file_path=ssa_file,
                        data_hash=data_hash,
                        record_count=len(df),
                        import_notes=f"Using cached data downloaded on {metadata['download_date']}"
                    )
                    
                    print(f"✓ Loaded cached SSA data (Import ID: {import_id})")
                    return df
                else:
                    print(f"SSA data is {days_old} days old, re-downloading...")
            except Exception as e:
                print(f"Error reading metadata: {e}, re-downloading...")
        
        print("Downloading SSA life tables from HTML...")
        
        # Try to download from SSA
        url = "https://www.ssa.gov/oact/STATS/table4c6.html"
        
        try:
            # Use a more realistic user agent to avoid blocking
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            print("✓ Successfully downloaded SSA HTML data")
            
            # Parse HTML to extract life table data
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for life table data in HTML tables
            tables = soup.find_all('table')
            print(f"Found {len(tables)} tables in HTML")
            
            # Find the life table (usually the first or second table)
            life_table = None
            for i, table in enumerate(tables):
                # Look for tables with mortality data
                rows = table.find_all('tr')
                if len(rows) > 10:  # Life tables have many rows
                    first_row = rows[0].get_text().lower()
                    if any(term in first_row for term in ['age', 'qx', 'probability', 'death']):
                        life_table = table
                        print(f"Found life table in table {i+1}")
                        break
            
            if life_table is None:
                raise ValueError("Could not find life table in HTML")
            
            # Parse the table data
            rows = life_table.find_all('tr')
            data = []
            
            # SSA table has complex header structure
            # Row 0: ['Exact age', 'Male', 'Female'] 
            # Row 1: ['Death probability', 'Number of lives', 'Life expectancy', 'Death probability', 'Number of lives', 'Life expectancy']
            # Row 2+: Data rows
            
            # Based on the structure we observed:
            # Column 0: Age
            # Column 1: Male death probability (qx)
            # Column 4: Female death probability (qx)
            
            male_qx_col = 1
            female_qx_col = 4
            
            print(f"Using fixed column positions: male_qx in column {male_qx_col}, female_qx in column {female_qx_col}")
            
            # Parse data rows
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) > max(male_qx_col, female_qx_col):
                    try:
                        age_text = cells[0].get_text().strip()
                        
                        # Clean and parse age
                        if age_text.isdigit():
                            age = int(age_text)
                            if 0 <= age <= 110:  # Valid age range
                                # Get the correct qx columns
                                male_text = cells[male_qx_col].get_text().strip()
                                female_text = cells[female_qx_col].get_text().strip()
                                
                                # Clean and parse mortality rates
                                male_qx = float(male_text.replace(',', ''))
                                female_qx = float(female_text.replace(',', ''))
                                
                                data.append({
                                    'age': age,
                                    'male_qx': male_qx,
                                    'female_qx': female_qx
                                })
                    except (ValueError, IndexError):
                        continue  # Skip invalid rows
            
            if not data:
                raise ValueError("No valid life table data found in HTML")
            
            # Create DataFrame
            df = pd.DataFrame(data)
            print(f"✓ Parsed {len(df)} age groups from SSA life tables")
            
            # Save to file
            output_file = f"{self.data_dir}/ssa_life_tables_2021.csv"
            df.to_csv(output_file, index=False)
            print(f"✓ Saved SSA data to {output_file}")
            
            # Save metadata
            metadata = {
                'source_url': url,
                'download_date': datetime.now().isoformat(),
                'record_count': len(df),
                'columns': list(df.columns),
                'age_range': f"{df['age'].min()}-{df['age'].max()}",
                'data_hash': data_logger.get_data_hash(df.to_dict()),
                'description': 'SSA Period Life Tables with age-specific mortality probabilities'
            }
            
            metadata_file = f"{self.data_dir}/ssa_life_tables_metadata.json"
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)
            print(f"✓ Saved metadata to {metadata_file}")
            
            # Log the import
            data_hash = data_logger.get_data_hash(df.to_dict())
            source_id = data_logger.register_source(
                source_name="SSA Period Life Tables",
                source_type="mortality_tables",
                url=url,
                version="2021"
            )
            
            import_id = data_logger.log_import(
                source_id=source_id,
                file_path=output_file,
                data_hash=data_hash,
                record_count=len(df),
                import_notes=f"Downloaded and parsed from HTML: {url}"
            )
            
            print(f"✓ SSA life tables processed successfully (Import ID: {import_id})")
            return df
            
        except requests.RequestException as e:
            print(f"✗ Failed to download SSA data: {e}")
            # Try to use existing cached data if available
            if os.path.exists(ssa_file):
                print(f"Using existing cached data: {ssa_file}")
                df = pd.read_csv(ssa_file)
                
                # Log the import
                data_hash = data_logger.get_data_hash(df.to_dict())
                source_id = data_logger.register_source(
                    source_name="SSA Period Life Tables",
                    source_type="mortality_tables",
                    version="2021"
                )
                
                import_id = data_logger.log_import(
                    source_id=source_id,
                    file_path=ssa_file,
                    data_hash=data_hash,
                    record_count=len(df),
                    import_notes="Using existing cached SSA data due to download failure"
                )
                
                return df
            else:
                raise Exception(f"Failed to download SSA data and no cached data available: {e}")
        except Exception as e:
            print(f"✗ Error parsing SSA data: {e}")
            # Try to use existing cached data if available
            if os.path.exists(ssa_file):
                print(f"Using existing cached data after parsing error: {ssa_file}")
                df = pd.read_csv(ssa_file)
                
                # Log the import
                data_hash = data_logger.get_data_hash(df.to_dict())
                source_id = data_logger.register_source(
                    source_name="SSA Period Life Tables",
                    source_type="mortality_tables",
                    version="2021"
                )
                
                import_id = data_logger.log_import(
                    source_id=source_id,
                    file_path=ssa_file,
                    data_hash=data_hash,
                    record_count=len(df),
                    import_notes="Using existing cached SSA data after parsing error"
                )
                
                return df
            else:
                raise Exception(f"Failed to parse SSA life tables and no cached data available: {e}")
    
    def download_cdc_cause_data(self) -> pd.DataFrame:
        """
        Process manually downloaded CDC cause of death data
        Due to access restrictions, user must manually download the data
        """
        print("Processing CDC cause of death data...")
        
        # Check for manually downloaded file
        manual_file = f"{self.data_dir}/cdc_cause_death_manual.csv"
        if os.path.exists(manual_file):
            print(f"Found manually downloaded CDC data: {manual_file}")
            df = pd.read_csv(manual_file)
            
            # Validate required columns
            required_columns = ['age_group', 'heart_disease_pct', 'cancer_pct', 'accidents_pct', 'stroke_pct', 'diabetes_pct']
            if not all(col in df.columns for col in required_columns):
                raise ValueError(f"CDC data must contain columns: {required_columns}")
            
            # Log the import
            data_hash = data_logger.get_data_hash(df.to_dict())
            source_id = data_logger.register_source(
                source_name="CDC/NCHS Cause of Death",
                source_type="cause_mortality",
                version="2022"
            )
            
            import_id = data_logger.log_import(
                source_id=source_id,
                file_path=manual_file,
                data_hash=data_hash,
                record_count=len(df),
                import_notes="Manually downloaded CDC cause data due to access restrictions"
            )
            
            print(f"CDC cause data processed successfully (Import ID: {import_id})")
            return df
        else:
            raise FileNotFoundError(
                f"CDC cause data not found at {manual_file}. "
                "Please manually download from CDC WONDER or NCHS data portal "
                "and save as CSV with columns: age_group, heart_disease_pct, cancer_pct, accidents_pct, stroke_pct, diabetes_pct"
            )
    
    def download_gbd_risk_factors(self) -> Dict[str, Any]:
        """
        Process manually downloaded GBD risk factor data
        Due to access restrictions, user must manually download the data
        """
        print("Processing GBD risk factor data...")
        
        # Check for manually downloaded file
        manual_file = f"{self.data_dir}/gbd_risk_factors_manual.json"
        if os.path.exists(manual_file):
            print(f"Found manually downloaded GBD data: {manual_file}")
            with open(manual_file, 'r') as f:
                data = json.load(f)
            
            # Validate required structure
            required_keys = ['smoking', 'blood_pressure', 'bmi', 'fitness', 'alcohol']
            if not all(key in data for key in required_keys):
                raise ValueError(f"GBD data must contain keys: {required_keys}")
            
            # Log the import
            data_hash = data_logger.get_data_hash(data)
            source_id = data_logger.register_source(
                source_name="Global Burden of Disease",
                source_type="risk_factors",
                version="2019"
            )
            
            import_id = data_logger.log_import(
                source_id=source_id,
                file_path=manual_file,
                data_hash=data_hash,
                record_count=len(data),
                import_notes="Manually downloaded GBD risk factors due to access restrictions"
            )
            
            print(f"GBD risk factors processed successfully (Import ID: {import_id})")
            return data
        else:
            raise FileNotFoundError(
                f"GBD risk factors not found at {manual_file}. "
                "Please manually download from GBD Results Tool at healthdata.org "
                "and save as JSON with risk factor relative risks"
            )
    
    def download_eprognosis_data(self) -> Dict[str, Any]:
        """
        Download ePrognosis validation data
        Returns real data or raises exception if download fails
        """
        print("Downloading ePrognosis validation data...")
        
        # ePrognosis provides validation models
        # This would need to be implemented to access real ePrognosis data
        raise NotImplementedError(
            "ePrognosis data download not yet implemented. "
            "Must implement proper access to ePrognosis validation models."
        )
    
    def download_all_sources(self) -> Dict[str, Any]:
        """
        Download all required data sources
        Returns only real data or raises exception
        """
        print("Downloading all mortality calculator data sources...")
        print("WARNING: This will only work with real data sources.")
        print("No placeholder or fake data will be used.")
        
        results = {}
        
        try:
            results['ssa_life_tables'] = self.download_ssa_life_tables()
            results['cdc_cause_data'] = self.download_cdc_cause_data()
            results['gbd_risk_factors'] = self.download_gbd_risk_factors()
            results['eprognosis_data'] = self.download_eprognosis_data()
            
            print("All real data sources downloaded successfully!")
            return results
            
        except Exception as e:
            print(f"Error downloading real data sources: {e}")
            print("This is expected until real data download methods are implemented.")
            raise

if __name__ == "__main__":
    # Test the data acquisition
    acquirer = DataAcquisition()
    try:
        data = acquirer.download_all_sources()
        print("Real data acquisition completed successfully!")
    except Exception as e:
        print(f"Data acquisition failed as expected: {e}")
        print("This confirms no fake data is being used.")
