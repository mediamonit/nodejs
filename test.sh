#!/bin/bash

# Colors for output formatting
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Store PIDs for cleanup
API_PID=""
FRONTEND_PID=""

# Cleanup function
cleanup() {
    echo -e "\n${BLUE}Cleaning up services...${NC}"
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
}

# Set up trap for cleanup on script exit
trap cleanup EXIT

echo -e "${BLUE}Starting test suite...${NC}\n"

# Ensure environment is set up
echo -e "${BLUE}Setting up environment...${NC}"
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file from .env.example...${NC}"
    cp .env.example .env
fi

# Set default environment variables if not present
export NODE_ENV=test
export API_PORT=3000
export FRONTEND_PORT=8080
export TEST_TIMEOUT=10000
export FFMPEG_PATH=$(which ffmpeg)
export FFPROBE_PATH=$(which ffprobe)
export THUMBNAILS_DIR="./thumbnails"
export PREVIEWS_DIR="./previews"
export TEST_STREAM_URL="test://stream"

# Create required directories
mkdir -p thumbnails previews

# Start services
echo -e "${BLUE}Starting services...${NC}"

# Start API server
echo -e "${BLUE}Starting API server...${NC}"
NODE_ENV=test npm run start:api &
API_PID=$!

# Start Frontend server
echo -e "${BLUE}Starting Frontend server...${NC}"
NODE_ENV=test npm run start:frontend &
FRONTEND_PID=$!

# Wait for services to be ready
echo -e "${BLUE}Waiting for services to start...${NC}"
sleep 15  # Increased wait time to ensure services are fully ready

# Function to check if a service is running
check_service() {
    local url=$1
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null; then
            return 0
        fi
        echo -e "${BLUE}Attempt $attempt: Waiting for service at $url...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    return 1
}

# Check if services are running
if ! check_service "http://localhost:3000/health"; then
    echo -e "${RED}API server failed to start${NC}"
    exit 1
fi

if ! check_service "http://localhost:8080"; then
    echo -e "${RED}Frontend server failed to start${NC}"
    exit 1
fi

# Track overall success
FAILED=0

# Run all tests with coverage
echo -e "${BLUE}Running all tests with coverage...${NC}\n"
if ! npm test -- --coverage; then
    FAILED=1
fi

# Run E2E tests specifically
echo -e "\n${BLUE}Running E2E tests...${NC}\n"
if ! npm run test:e2e; then
    FAILED=1
fi

# Final status report
echo -e "\n${BLUE}Test Suite Summary${NC}"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All test suites completed successfully!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please check the output above for details.${NC}"
    exit 1
fi
