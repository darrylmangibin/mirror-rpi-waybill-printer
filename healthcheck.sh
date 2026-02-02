#!/bin/bash

# Docker Health Check Script
# Used by Docker to verify container health

set -e

# Check if Flask server is responding
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health 2>/dev/null || echo "000")

if [ "$response" = "200" ]; then
    echo "✅ Backend is healthy"
    exit 0
else
    echo "❌ Backend health check failed (HTTP $response)"
    exit 1
fi
