#!/usr/bin/env python3
"""
Log cleanup utility for RPI Waybill Printer

This script removes log files older than a specified number of days.

Usage:
    python cleanup_logs.py                 # Keep last 7 days (default)
    python cleanup_logs.py --days 14       # Keep last 14 days
    python cleanup_logs.py --help          # Show help
"""

import sys
import argparse
import os
import glob
from datetime import datetime, timedelta


def cleanup_old_logs(logs_dir='storage/logs', days=7):
    """
    Remove log files older than specified number of days.
    
    Args:
        logs_dir (str): Directory containing log files. Default: 'storage/logs'
        days (int): Number of days to keep logs. Default: 7
    
    Returns:
        dict: Dictionary with 'deleted' list and 'error' message if any
    
    Example:
        cleanup_old_logs(days=7)  # Keep last 7 days of logs
    """
    result = {
        'deleted': [],
        'error': None
    }
    
    if not os.path.exists(logs_dir):
        result['error'] = f"Logs directory not found: {logs_dir}"
        return result
    
    try:
        cutoff_time = datetime.now() - timedelta(days=days)
        log_files = glob.glob(os.path.join(logs_dir, '*.log'))
        
        for log_file in log_files:
            file_mtime = datetime.fromtimestamp(os.path.getmtime(log_file))
            
            if file_mtime < cutoff_time:
                try:
                    os.remove(log_file)
                    result['deleted'].append(os.path.basename(log_file))
                except OSError as e:
                    if result['error'] is None:
                        result['error'] = []
                    result['error'].append(f"Failed to delete {os.path.basename(log_file)}: {str(e)}")
        
        return result
    
    except Exception as e:
        result['error'] = str(e)
        return result


def main():
    parser = argparse.ArgumentParser(
        description='Clean up old log files from storage/logs directory'
    )
    parser.add_argument(
        '--days',
        type=int,
        default=7,
        help='Number of days to keep logs (default: 7)'
    )
    parser.add_argument(
        '--logs-dir',
        type=str,
        default='backend/storage/logs',
        help='Path to logs directory (default: backend/storage/logs)'
    )
    
    args = parser.parse_args()
    
    print(f"🧹 Cleaning up log files older than {args.days} days...")
    print(f"📁 Logs directory: {args.logs_dir}")
    print()
    
    result = cleanup_old_logs(logs_dir=args.logs_dir, days=args.days)
    
    if result['error']:
        print(f"❌ Error: {result['error']}")
        return 1
    
    if result['deleted']:
        print(f"✅ Deleted {len(result['deleted'])} log file(s):")
        for file in result['deleted']:
            print(f"   - {file}")
    else:
        print("ℹ️  No log files to delete (all files are within retention period)")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
