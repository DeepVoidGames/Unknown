#!/bin/bash

# Get the latest git short hash or a timestamp
BUILD_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "dev-$(date +%s)")

# Path to the file
SETTINGS_FILE="src/pages/Settings.tsx"

# Use sed to replace the hash
# It looks for the pattern: Build: <span className="text-primary">ANYTHING</span>
# And replaces it with the new hash
sed -i "s/Build: <span className=\"text-primary\">[^<]*<\/span>/Build: <span className=\"text-primary\">$BUILD_HASH<\/span>/g" "$SETTINGS_FILE"

echo "✅ Build hash updated to: $BUILD_HASH"
