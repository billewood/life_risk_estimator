"""
Data Management Utility
Handles data caching, updates, and provides information about data sources
"""

import os
import json
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import sys
sys.path.append('/Users/williamwood/Code/mortality_calculator')
from data_logger import data_logger

class DataManager:
    def __init__(self, data_dir: str = "/Users/williamwood/Code/mortality_calculator/data_sources"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
    
    def get_data_status(self) -> Dict[str, Dict[str, Any]]:
        """
        Get status of all data sources including age, size, and metadata
        """
        status = {}
        
        # Check SSA data
        ssa_file = f"{self.data_dir}/ssa_life_tables_2021.csv"
        ssa_metadata = f"{self.data_dir}/ssa_life_tables_metadata.json"
        
        if os.path.exists(ssa_file):
            try:
                df = pd.read_csv(ssa_file)
                metadata = {}
                if os.path.exists(ssa_metadata):
                    with open(ssa_metadata, 'r') as f:
                        metadata = json.load(f)
                
                download_date = metadata.get('download_date', 'Unknown')
                if download_date != 'Unknown':
                    download_date = datetime.fromisoformat(download_date)
                    days_old = (datetime.now() - download_date).days
                else:
                    days_old = 'Unknown'
                
                status['ssa_life_tables'] = {
                    'available': True,
                    'file_path': ssa_file,
                    'record_count': len(df),
                    'columns': list(df.columns),
                    'age_range': f"{df['age'].min()}-{df['age'].max()}",
                    'download_date': metadata.get('download_date', 'Unknown'),
                    'days_old': days_old,
                    'source_url': metadata.get('source_url', 'Unknown'),
                    'data_hash': metadata.get('data_hash', 'Unknown'),
                    'file_size_mb': round(os.path.getsize(ssa_file) / (1024*1024), 2)
                }
            except Exception as e:
                status['ssa_life_tables'] = {
                    'available': False,
                    'error': str(e)
                }
        else:
            status['ssa_life_tables'] = {
                'available': False,
                'reason': 'File not found'
            }
        
        # Check CDC data
        cdc_file = f"{self.data_dir}/cdc_cause_death_manual.csv"
        if os.path.exists(cdc_file):
            try:
                df = pd.read_csv(cdc_file)
                status['cdc_cause_data'] = {
                    'available': True,
                    'file_path': cdc_file,
                    'record_count': len(df),
                    'columns': list(df.columns),
                    'file_size_mb': round(os.path.getsize(cdc_file) / (1024*1024), 2)
                }
            except Exception as e:
                status['cdc_cause_data'] = {
                    'available': False,
                    'error': str(e)
                }
        else:
            status['cdc_cause_data'] = {
                'available': False,
                'reason': 'File not found - requires manual download'
            }
        
        # Check GBD data
        gbd_file = f"{self.data_dir}/gbd_risk_factors_manual.json"
        if os.path.exists(gbd_file):
            try:
                with open(gbd_file, 'r') as f:
                    data = json.load(f)
                status['gbd_risk_factors'] = {
                    'available': True,
                    'file_path': gbd_file,
                    'risk_factors': list(data.keys()),
                    'file_size_mb': round(os.path.getsize(gbd_file) / (1024*1024), 2)
                }
            except Exception as e:
                status['gbd_risk_factors'] = {
                    'available': False,
                    'error': str(e)
                }
        else:
            status['gbd_risk_factors'] = {
                'available': False,
                'reason': 'File not found - requires manual download'
            }
        
        return status
    
    def print_data_status(self):
        """
        Print a comprehensive status report of all data sources
        """
        print("Mortality Calculator Data Status")
        print("=" * 50)
        
        status = self.get_data_status()
        
        for source_name, info in status.items():
            print(f"\n{source_name.replace('_', ' ').title()}:")
            print("-" * 30)
            
            if info['available']:
                print(f"  ✓ Available: Yes")
                print(f"  📁 File: {info['file_path']}")
                print(f"  📊 Records: {info['record_count']}")
                print(f"  📏 Size: {info['file_size_mb']} MB")
                
                if 'download_date' in info and info['download_date'] != 'Unknown':
                    print(f"  📅 Downloaded: {info['download_date']}")
                    if info['days_old'] != 'Unknown':
                        if info['days_old'] < 30:
                            print(f"  ✅ Age: {info['days_old']} days (current)")
                        else:
                            print(f"  ⚠️  Age: {info['days_old']} days (consider updating)")
                
                if 'columns' in info:
                    print(f"  📋 Columns: {', '.join(info['columns'])}")
                
                if 'age_range' in info:
                    print(f"  🎯 Age Range: {info['age_range']}")
                
                if 'source_url' in info:
                    print(f"  🔗 Source: {info['source_url']}")
            else:
                print(f"  ✗ Available: No")
                if 'reason' in info:
                    print(f"  📝 Reason: {info['reason']}")
                if 'error' in info:
                    print(f"  ❌ Error: {info['error']}")
    
    def update_data(self, source: str = "all", force: bool = False):
        """
        Update data sources
        """
        from data_acquisition import DataAcquisition
        
        acquirer = DataAcquisition()
        
        if source in ["all", "ssa"]:
            print("Updating SSA life tables...")
            try:
                acquirer.download_ssa_life_tables(force_download=force)
                print("✓ SSA data updated successfully")
            except Exception as e:
                print(f"✗ Failed to update SSA data: {e}")
        
        if source in ["all", "cdc"]:
            print("CDC data requires manual download - see DATA_DOWNLOAD_GUIDE.md")
        
        if source in ["all", "gbd"]:
            print("GBD data requires manual download - see DATA_DOWNLOAD_GUIDE.md")
    
    def get_data_usage_report(self) -> List[Dict]:
        """
        Get comprehensive data usage report from the logger
        """
        return data_logger.get_usage_report()
    
    def cleanup_old_data(self, days_old: int = 90):
        """
        Clean up old data files (optional - for maintenance)
        """
        print(f"Cleaning up data older than {days_old} days...")
        
        cutoff_date = datetime.now() - timedelta(days=days_old)
        cleaned_files = []
        
        for filename in os.listdir(self.data_dir):
            file_path = os.path.join(self.data_dir, filename)
            if os.path.isfile(file_path):
                file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                if file_time < cutoff_date and filename.endswith('.csv'):
                    print(f"Would clean up old file: {filename}")
                    cleaned_files.append(file_path)
        
        if cleaned_files:
            print(f"Found {len(cleaned_files)} old files to clean up")
            # Uncomment the following lines to actually delete files
            # for file_path in cleaned_files:
            #     os.remove(file_path)
            #     print(f"Deleted: {file_path}")
        else:
            print("No old files found to clean up")

def main():
    """
    Command-line interface for data management
    """
    import sys
    
    manager = DataManager()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "status":
            manager.print_data_status()
        elif command == "update":
            source = sys.argv[2] if len(sys.argv) > 2 else "all"
            force = "--force" in sys.argv
            manager.update_data(source, force)
        elif command == "usage":
            report = manager.get_data_usage_report()
            print("Data Usage Report:")
            print("=" * 30)
            for entry in report:
                print(f"Source: {entry['source_name']}")
                print(f"  Usage: {entry['usage_context']}")
                print(f"  Calculation: {entry['calculation_type']}")
                print(f"  Timestamp: {entry['usage_timestamp']}")
                print()
        elif command == "cleanup":
            days = int(sys.argv[2]) if len(sys.argv) > 2 else 90
            manager.cleanup_old_data(days)
        else:
            print(f"Unknown command: {command}")
            print("Available commands: status, update, usage, cleanup")
    else:
        manager.print_data_status()

if __name__ == "__main__":
    main()
