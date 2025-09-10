#!/usr/bin/env bash
set -euo pipefail

for i in {1..100}; do
    echo "Iteration $i/100"
    claude --dangerously-skip-permissions -p "Read documentation in @specs/001-fixyourprompts-com-is then do the following in parallel: run tests, linter, type-check, and build. Resolve all errors. Think hardest."
    sleep 1800
done