#!/bin/bash

# DigitalOcean App Platform Deployment Script
echo "🚀 Starting GAN Website Deployment to DigitalOcean App Platform..."

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "❌ doctl CLI is not installed. Please install it first:"
    echo "   https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Check if user is authenticated
if ! doctl auth list &> /dev/null; then
    echo "❌ Please authenticate with DigitalOcean first:"
    echo "   doctl auth init"
    exit 1
fi

# Build the project locally to test
echo "📦 Building project locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the build errors first."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to DigitalOcean App Platform
echo "🌊 Deploying to DigitalOcean App Platform..."
doctl apps create --spec .do/app.yaml

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🔗 Your app should be available at the URL provided by DigitalOcean"
    echo "📊 You can monitor the deployment in the DigitalOcean dashboard"
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi 