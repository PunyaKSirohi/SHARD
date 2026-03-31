#!/bin/bash

OUTPUT_FILE="project_structure.md"

echo "Clear old file..."
echo "# Project File Structure" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

find . \
  -type f \
  -not \( \
      -path "*/node_modules/*" -o \
      -path "*/dist/*" -o \
      -path "*/build/*" -o \
      -path "*/.vite/*" -o \
      -path "*/.git/*" -o \
      -path "*/__pycache__/*" -o \
      -path "*/venv/*" -o \
      -path "*/.venv/*" -o \
      -path "*/env/*" -o \
      -path "*/.vscode/*" -o \
      -path "*/migrations/*" -o \
      -name "*.pyc" -o \
      -name "*.dll" -o \
      -name "*.exe" -o \
      -name "package-lock.json" -o \
      -name "yarn.lock" -o \
      -name ".DS_Store" \
    \) >> "$OUTPUT_FILE"

echo "✅ Done! Cleaned structure saved to $OUTPUT_FILE"