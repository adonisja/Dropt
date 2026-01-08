#!/usr/bin/env python3
"""
Theme Migration Script for Dropt
Replaces NativeWind theme classes with hexColors inline styles
"""

import re
import os
import glob

def migrate_file(filepath):
    """Migrate a single file to use hexColors"""
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Pattern 1: bg-background
    content = re.sub(
        r'className="([^"]*)\s*bg-background([^"]*)"',
        r'className="\1\2" style={{ backgroundColor: hexColors.background }}',
        content
    )
    
    # Pattern 2: bg-card with borders
    content = re.sub(
        r'className="([^"]*)bg-card([^"]*)border\s+border-border([^"]*)"',
        r'className="\1\2\3" style={{ backgroundColor: hexColors.card, borderWidth: 1, borderColor: hexColors.border }}',
        content
    )
    
    # Pattern 3: bg-card without borders (add inline)
    content = re.sub(
        r'className="([^"]*)bg-card([^"]*)"(?!\s*style)',
        r'className="\1\2" style={{ backgroundColor: hexColors.card }}',
        content
    )
    
    # Pattern 4: text-foreground
    content = re.sub(
        r'className="([^"]*)text-foreground([^"]*)"',
        r'className="\1\2" style={{ color: hexColors.foreground }}',
        content
    )
    
    # Pattern 5: text-muted-foreground
    content = re.sub(
        r'className="([^"]*)text-muted-foreground([^"]*)"',
        r'className="\1\2" style={{ color: hexColors.mutedForeground }}',
        content
    )
    
    # Pattern 6: border-border (standalone)
    content = re.sub(
        r'border\s+border-border',
        r'borderWidth: 1, borderColor: hexColors.border',
        content
    )
    
    # Clean up extra spaces in className
    content = re.sub(r'className="\s+', 'className="', content)
    content = re.sub(r'\s+"', '"', content)
    
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    base_path = "/Users/akkeem/Documents/ClassAssignments/CS360/Dropt"
    
    patterns = [
        "app/(student)/courses/*.tsx",
        "app/(student)/tools/*.tsx",
        "app/(student)/assignments/*.tsx"
    ]
    
    modified = []
    for pattern in patterns:
        full_pattern = os.path.join(base_path, pattern)
        files = glob.glob(full_pattern)
        
        for filepath in files:
            if migrate_file(filepath):
                modified.append(filepath)
                print(f"✓ {os.path.basename(filepath)}")
    
    print(f"\n{len(modified)} files migrated")

if __name__ == "__main__":
    main()
