import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Setting up SPA routing for DigitalOcean App Platform...');

// Create a simple .htaccess file for Apache fallback
const htaccessContent = `
RewriteEngine On
RewriteBase /

# Handle API and media proxy
RewriteRule ^api/(.*)$ https://api.gan7club.com/api/$1 [P,L]
RewriteRule ^media/(.*)$ https://api.gan7club.com/media/$1 [P,L]

# Handle React Router - serve index.html for all routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"
`;

// Write .htaccess to public directory
fs.writeFileSync(path.join(__dirname, '../public/.htaccess'), htaccessContent);
console.log('✅ Created .htaccess file');

// Create a simple nginx.conf for DigitalOcean
const nginxContent = `
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass https://api.gan7club.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Media proxy
    location /media/ {
        proxy_pass https://api.gan7club.com;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
`;

// Write nginx.conf to public directory
fs.writeFileSync(path.join(__dirname, '../public/nginx.conf'), nginxContent);
console.log('✅ Created nginx.conf file');

console.log('🎉 SPA routing setup complete!'); 