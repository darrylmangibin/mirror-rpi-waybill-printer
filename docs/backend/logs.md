# Log Management

## Location

All log files are stored in:

```
backend/storage/logs/
```

## Log File Format

Log files are created automatically with the naming format:

```
MM_DD_YYYY.log
```

Examples:
- `10_17_2025.log` - October 17, 2025
- `10_18_2025.log` - October 18, 2025

One file is created per day automatically.

## Viewing Logs

### View today's logs in real-time

```bash
tail -f backend/storage/logs/$(date +%m_%d_%Y).log
```

### View a specific day's logs

```bash
cat backend/storage/logs/10_18_2025.log
```

### View last 50 lines

```bash
tail -50 backend/storage/logs/10_18_2025.log
```

### Search for errors

```bash
grep "ERROR" backend/storage/logs/10_18_2025.log
```

## Cleaning Up Old Logs

### Clean logs older than 7 days (default)

```bash
python3 cleanup_logs.py
```

### Clean logs older than 14 days

```bash
python3 cleanup_logs.py --days 14
```

### Clean logs older than 30 days

```bash
python3 cleanup_logs.py --days 30
```

### Show help

```bash
python3 cleanup_logs.py --help
```

## Example Output

```
🧹 Cleaning up log files older than 7 days...
📁 Logs directory: backend/storage/logs

✅ Deleted 2 log file(s):
   - 10_10_2025.log
   - 10_09_2025.log
```

## Log Entry Format

Each line in a log file follows this format:

```
YYYY-MM-DD HH:MM:SS,mmm - LEVEL - Message
```

Example:

```
2025-10-18 07:51:25,490 - INFO - Created print job - ID: 1, Tenant: etaily, Invoice: 1040812389838967
2025-10-18 07:51:26,065 - INFO - File downloaded successfully - ID: 1, Size: 93635 bytes
```
