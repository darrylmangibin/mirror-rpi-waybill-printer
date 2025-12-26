#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}⚠️  SYSTEM-LEVEL CLEANUP SCRIPT${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Confirmation prompt
echo -e "${YELLOW}This will:${NC}"
echo "  1. 🗑️  Truncate the entire 'waybill_prints' database table"
echo "  2. 🗑️  Delete ALL files in app/storage/waybills/ folder"
echo "  3. 🗑️  Clear app/logs/app.log file"
echo ""
echo -e "${RED}⚠️  WARNING: This action CANNOT be undone!${NC}"
echo ""
read -p "Are you absolutely sure you want to proceed? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
    echo -e "${YELLOW}❌ Cleanup cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}🔄 Starting cleanup process...${NC}"
echo ""

# Check if virtual environment exists
if [ ! -d "$PROJECT_ROOT/venv" ]; then
    echo -e "${RED}❌ Virtual environment not found at $PROJECT_ROOT/venv${NC}"
    exit 1
fi

# Activate virtual environment
source "$PROJECT_ROOT/venv/bin/activate"

# Step 1: Clear app.log
echo -e "${BLUE}[1/3]${NC} Clearing app/logs/app.log..."
if [ -f "$PROJECT_ROOT/app/logs/app.log" ]; then
    > "$PROJECT_ROOT/app/logs/app.log"
    echo -e "${GREEN}✓ Log file cleared${NC}"
else
    echo -e "${YELLOW}⚠️  Log file not found, skipping${NC}"
fi

echo ""

# Step 2: Delete all files in storage/waybills
echo -e "${BLUE}[2/3]${NC} Removing all files from app/storage/waybills/..."
if [ -d "$PROJECT_ROOT/app/storage/waybills" ]; then
    FILE_COUNT=$(find "$PROJECT_ROOT/app/storage/waybills" -type f | wc -l)
    if [ "$FILE_COUNT" -gt 0 ]; then
        rm -rf "$PROJECT_ROOT/app/storage/waybills"/*
        echo -e "${GREEN}✓ Deleted $FILE_COUNT file(s) from storage${NC}"
    else
        echo -e "${YELLOW}⚠️  No files found in storage directory${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Storage directory not found, skipping${NC}"
fi

echo ""

# Step 3: Truncate database table using Python
echo -e "${BLUE}[3/3]${NC} Truncating 'waybill_prints' database table..."

python3 << EOF
import sys
sys.path.insert(0, '$PROJECT_ROOT')

try:
    from app import create_app
    from app.database import db
    from app.services.waybills.models.WaybillPrint import WaybillPrint
    
    app = create_app()
    
    with app.app_context():
        # Get count before deletion
        count_before = db.session.query(WaybillPrint).count()
        
        # Truncate table
        WaybillPrint.query.delete()
        db.session.commit()
        
        # Verify deletion
        count_after = db.session.query(WaybillPrint).count()
        
        print(f"✓ Database table truncated successfully")
        print(f"  Records deleted: {count_before}")
        print(f"  Records remaining: {count_after}")
        
except Exception as e:
    print(f"✗ Error truncating database: {str(e)}", file=sys.stderr)
    sys.exit(1)
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database table truncated${NC}"
else
    echo -e "${RED}✗ Failed to truncate database table${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ System cleanup completed successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo "  ✓ App logs cleared"
echo "  ✓ Storage files deleted"
echo "  ✓ Database table truncated"
echo ""
echo -e "${BLUE}The system is now clean and ready for fresh data.${NC}"

