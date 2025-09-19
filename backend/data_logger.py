"""
Data Logger for Mortality Calculator
Tracks all data sources, imports, and usage with timestamps and metadata
"""

import sqlite3
import json
import datetime
from typing import Dict, Any, List, Optional
import hashlib

class DataLogger:
    def __init__(self, db_path: str = "mortality_data_log.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Data sources table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS data_sources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_name TEXT NOT NULL,
                source_type TEXT NOT NULL,
                url TEXT,
                description TEXT,
                version TEXT,
                last_updated TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(source_name, version)
            )
        ''')
        
        # Data imports table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS data_imports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_id INTEGER,
                import_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                file_path TEXT,
                data_hash TEXT,
                record_count INTEGER,
                import_notes TEXT,
                FOREIGN KEY (source_id) REFERENCES data_sources (id)
            )
        ''')
        
        # Data usage table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS data_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                import_id INTEGER,
                usage_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                usage_context TEXT,
                data_subset TEXT,
                calculation_type TEXT,
                result_summary TEXT,
                FOREIGN KEY (import_id) REFERENCES data_imports (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def register_source(self, source_name: str, source_type: str, url: str = None, 
                       description: str = None, version: str = None, 
                       last_updated: str = None) -> int:
        """Register a new data source"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR IGNORE INTO data_sources 
            (source_name, source_type, url, description, version, last_updated)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (source_name, source_type, url, description, version, last_updated))
        
        # Get the source ID
        cursor.execute('SELECT id FROM data_sources WHERE source_name = ? AND version = ?', 
                      (source_name, version))
        source_id = cursor.fetchone()[0]
        
        conn.commit()
        conn.close()
        return source_id
    
    def log_import(self, source_id: int, file_path: str, data_hash: str, 
                   record_count: int, import_notes: str = None) -> int:
        """Log a data import"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO data_imports 
            (source_id, file_path, data_hash, record_count, import_notes)
            VALUES (?, ?, ?, ?, ?)
        ''', (source_id, file_path, data_hash, record_count, import_notes))
        
        import_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return import_id
    
    def log_usage(self, import_id: int, usage_context: str, data_subset: str = None,
                  calculation_type: str = None, result_summary: str = None):
        """Log usage of imported data"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO data_usage 
            (import_id, usage_context, data_subset, calculation_type, result_summary)
            VALUES (?, ?, ?, ?, ?)
        ''', (import_id, usage_context, data_subset, calculation_type, result_summary))
        
        conn.commit()
        conn.close()
    
    def get_data_hash(self, data: Any) -> str:
        """Generate a hash for data integrity checking"""
        data_str = json.dumps(data, sort_keys=True, default=str)
        return hashlib.md5(data_str.encode()).hexdigest()
    
    def get_usage_report(self) -> List[Dict]:
        """Get a comprehensive usage report"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                ds.source_name,
                ds.source_type,
                ds.url,
                ds.version,
                di.import_timestamp,
                di.record_count,
                du.usage_timestamp,
                du.usage_context,
                du.calculation_type,
                du.result_summary
            FROM data_sources ds
            JOIN data_imports di ON ds.id = di.source_id
            JOIN data_usage du ON di.id = du.import_id
            ORDER BY du.usage_timestamp DESC
        ''')
        
        columns = [description[0] for description in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        return results

# Initialize global logger instance
data_logger = DataLogger()

