#!/bin/bash

# Build script for DigitalOcean App Platform
echo "🚀 Starting build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build output
echo "✅ Build completed. Checking dist folder..."
ls -la dist/

echo "🎉 Build process completed successfully!" 