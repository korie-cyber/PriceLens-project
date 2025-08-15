#!/usr/bin/env bash
set -euo pipefail
# Build for Linux/Render
javac -cp gson-2.8.9.jar:. *.java -d out
jar cfm PriceLensBackend.jar manifest.txt -C out .
echo "Build OK: PriceLensBackend.jar"
