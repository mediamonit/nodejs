#!/bin/bash

# Kill any existing Node.js processes
echo "Stopping existing Node.js processes..."
pkill -f node || true

# Wait a moment to ensure ports are released
sleep 2

# Check if ports are available
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null; then
        echo "Port $port is still in use"
        return 1
    fi
    return 0
}

# Check critical ports
for port in 3000 8080; do
    if ! check_port $port; then
        echo "Failed to free port $port. Please check manually."
        exit 1
    fi
done

echo "All ports are available"

# Start services
echo "Starting services..."
npm run dev

exit 0
