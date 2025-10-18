# Logs Management

Simple guide for cleaning application logs.

## Where are logs stored?

```text
backend/storage/logs/
```

## Option 1: Clean logs older than 7 days

Keep the last 7 days of logs. Delete older files automatically.

```bash
python3 cleanup_logs.py
```

## Option 2: Clean logs older than custom days

Keep logs for a specific number of days.

```bash
python3 cleanup_logs.py --days 14
```

Replace `14` with any number of days you want to keep.

## Option 3: Clean ALL logs

Delete all log files immediately.

```bash
python3 cleanup_logs.py --days 0
```

## Option 4: Force clean (manual delete)

Delete the current day's log file directly.

```bash
rm backend/storage/logs/10_18_2025.log
```

Replace the date `10_18_2025` with the actual log file date.

## Common commands

| Task | Command |
|------|---------|
| Keep last 7 days | `python3 cleanup_logs.py` |
| Keep last 14 days | `python3 cleanup_logs.py --days 14` |
| Keep last 30 days | `python3 cleanup_logs.py --days 30` |
| Delete all logs | `python3 cleanup_logs.py --days 0` |
| Delete one file | `rm backend/storage/logs/DATE.log` |
| List all logs | `ls backend/storage/logs/` |

## Recommended schedule

- Run cleanup script **daily** to keep logs organized
- Use `--days 7` to balance storage and log retention
