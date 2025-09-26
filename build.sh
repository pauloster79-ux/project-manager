#!/bin/bash
set -e

echo "Building AI PM Hub..."

# Navigate to web app directory
cd apps/web

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the app
echo "Building Next.js app..."
npm run build

echo "Build completed successfully!"
