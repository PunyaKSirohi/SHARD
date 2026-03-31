#!/bin/bash
PYTHON="/c/Users/Punya K Sirohi/AppData/Local/Programs/Python/Python313/python.exe"
for i in 1 2 3 4 5; do
    PORT=$((5000 + i)) NODE_ID="node-$i" "$PYTHON" server.py &
    echo "Started node-$i on port $((5000 + i))"
done
wait