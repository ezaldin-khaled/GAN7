# 🚀 DigitalOcean App Platform Deployment Guide

## Prerequisites

1. **DigitalOcean Account**: Sign up at [digitalocean.com](https://digitalocean.com)
2. **GitHub Repository**: Your code should be in `ezaldin-khaled/GAN7`
3. **Domain**: You have `gan7club.com` in Hostinger
4. **doctl CLI**: DigitalOcean's command-line tool

## Step 1: Install doctl CLI

### On Linux/macOS:
```bash
# Download and install doctl
curl -sL https://github.com/digitalocean/doctl/releases/latest/download/doctl-1.xx.x-linux-amd64.tar.gz | tar -xzv
sudo mv doctl /usr/local/bin

# Verify installation
doctl version
```

### On Windows:
Download from: https://github.com/digitalocean/doctl/releases

## Step 2: Authenticate with DigitalOcean

```bash
# Initialize authentication
doctl auth init

# Enter your DigitalOcean API token when prompted
# Get your API token from: https://cloud.digitalocean.com/account/api/tokens
```

## Step 3: Test Local Build

```bash
# Make sure the build works locally
npm run build

# If successful, you'll see a 'dist' folder created
```

## Step 4: Deploy to DigitalOcean App Platform

### Option A: Using the deployment script
```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Option B: Manual deployment
```bash
# Deploy using the app.yaml configuration
doctl apps create --spec .do/app.yaml
```

## Step 5: Configure Custom Domain

After deployment, you'll get a DigitalOcean URL like: `https://gan-website-xxxxx.ondigitalocean.app`

### In DigitalOcean Dashboard:
1. Go to your app in the DigitalOcean dashboard
2. Click on "Settings" tab
3. Scroll to "Domains" section
4. Add your domains:
   - `gan7club.com`
   - `www.gan7club.com`

### In Hostinger DNS Settings:
1. Log into your Hostinger control panel
2. Go to "Domains" → "DNS Zone Editor"
3. Add these DNS records:

```
Type: CNAME
Name: www
Value: gan-website-xxxxx.ondigitalocean.app
TTL: 300

Type: A
Name: @
Value: [DigitalOcean IP Address]
TTL: 300
```

## Step 6: SSL Certificate

DigitalOcean will automatically provision SSL certificates for your custom domains.

## Step 7: Environment Variables

The app is configured with:
- `NODE_ENV=production`
- `VITE_API_URL=https://api.gan7club.com:8000`

## Step 8: Monitor Deployment

```bash
# Check app status
doctl apps list

# Get app details
doctl apps get [APP_ID]

# View logs
doctl apps logs [APP_ID]
```

## Troubleshooting

### Build Failures:
- Check that all dependencies are in `package.json`
- Ensure `npm run build` works locally
- Check the build logs in DigitalOcean dashboard

### Domain Issues:
- DNS propagation can take up to 48 hours
- Verify DNS records are correct
- Check SSL certificate status

### Performance:
- The app uses static site hosting for optimal performance
- Assets are cached for 1 year
- React Router is properly configured for SPA routing

## Cost Estimation

- **Static Site**: ~$5/month
- **Custom Domain**: Free
- **SSL Certificate**: Free
- **Bandwidth**: Included in plan

## Next Steps

1. Set up monitoring and alerts
2. Configure CI/CD for automatic deployments
3. Set up staging environment
4. Monitor performance and optimize

## Support

- DigitalOcean Documentation: https://docs.digitalocean.com/products/app-platform/
- Hostinger DNS Guide: https://www.hostinger.com/tutorials/dns
- React Deployment Best Practices: https://create-react-app.dev/docs/deployment/ 