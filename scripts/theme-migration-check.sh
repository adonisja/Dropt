#!/bin/bash

# Theme Migration Script for Dropt App
# This script helps identify files that need theme migration

echo "=========================================="
echo "Dropt Theme Migration Analysis"
echo "=========================================="
echo ""

# Find all TypeScript/TSX files that use NativeWind theme classes
echo "📊 Finding files using NativeWind theme classes..."
echo ""

# Search for files with bg-background, bg-card, text-foreground, etc.
files=$(grep -rl --include="*.tsx" --include="*.ts" "className.*bg-\(background\|card\)" app/ components/ 2>/dev/null)

if [ -z "$files" ]; then
    echo "✅ No files found using NativeWind theme classes!"
    echo "All files may already be migrated."
else
    echo "Found files that need migration:"
    echo "================================"
    echo "$files" | while read file; do
        count=$(grep -c "className.*bg-\(background\|card\)" "$file" 2>/dev/null || echo "0")
        echo "  📄 $file ($count theme classes)"
    done
fi

echo ""
echo "----------------------------------------"
echo "🔍 Checking theme hook usage..."
echo "----------------------------------------"
echo ""

# Find files that import useTheme
theme_files=$(grep -rl "useTheme" app/ components/ 2>/dev/null)

echo "Files using useTheme hook:"
echo "$theme_files" | while read file; do
    if [ -n "$file" ]; then
        # Check if they destructure hexColors
        if grep -q "hexColors" "$file" 2>/dev/null; then
            echo "  ✅ $file (uses hexColors)"
        else
            echo "  ⚠️  $file (missing hexColors)"
        fi
    fi
done

echo ""
echo "----------------------------------------"
echo "📋 Migration Summary"
echo "----------------------------------------"
echo ""

total_files=$(echo "$files" | grep -c "" 2>/dev/null || echo "0")
echo "Total files to migrate: $total_files"

echo ""
echo "Next steps:"
echo "1. Review the files listed above"
echo "2. For each file, follow docs/THEME_MIGRATION_GUIDE.md"
echo "3. Replace NativeWind classes with hexColors inline styles"
echo "4. Test on both light/dark modes"
echo ""
echo "Example migration:"
echo "  ❌ <View className=\"bg-background\">"
echo "  ✅ <View style={{ backgroundColor: hexColors.background }}>"
echo ""
