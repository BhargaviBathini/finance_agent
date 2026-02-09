# Deployment Guide

## Quick Start (Development)

### Option 1: Local Development

1. **Install dependencies**
```bash
# Windows
.\setup.ps1

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

2. **Start MongoDB**
```bash
# If you have MongoDB installed locally
mongod --dbpath ./data
```

3. **Update server/.env**
```env
MONGODB_URI=mongodb://localhost:27017/financial-agent
```

4. **Start development servers**
```bash
npm run dev
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Option 2: Docker Compose (Recommended)

1. **Start all services**
```bash
docker-compose up -d
```

2. **View logs**
```bash
docker-compose logs -f
```

3. **Stop services**
```bash
docker-compose down
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

## Production Deployment

### Prerequisites
- Domain name with SSL certificate
- MongoDB Atlas account (or self-hosted MongoDB)
- Vercel account (for frontend) or any static hosting
- Render/Heroku account (for backend) or VPS

### 1. Database Setup (MongoDB Atlas)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (Free tier available)
3. Create database user
4. Whitelist IP addresses (or allow from anywhere for testing)
5. Get connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/financial-agent?retryWrites=true&w=majority
```

### 2. Backend Deployment (Render)

1. **Create account** at https://render.com

2. **Create new Web Service**
   - Connect your GitHub repository
   - Root directory: `server`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

3. **Set environment variables**
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<generate-new-secret>
AES_256_KEY=<generate-new-key>
PLAID_CLIENT_ID=68d819151059f3002356b26e
PLAID_SECRET=096bde63d0169f4ffe0db91d238ea7
PLAID_ENV=sandbox
GEMINI_API_KEY=AIzaSyBfIAxzpYVcblQ3Fl90RBqdWp4g_laVq_g
RP_NAME=Financial Agent
RP_ID=yourdomain.com
ORIGIN=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
```

4. **Deploy** - Render will automatically build and deploy

### 3. Frontend Deployment (Vercel)

1. **Create account** at https://vercel.com

2. **Import project**
   - Connect GitHub repository
   - Root directory: `client`
   - Framework: Vite

3. **Set environment variables**
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

4. **Deploy** - Vercel will automatically build and deploy

### 4. Alternative: VPS Deployment

#### Using Docker on VPS

1. **SSH into your VPS**
```bash
ssh user@your-server-ip
```

2. **Install Docker and Docker Compose**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Clone repository**
```bash
git clone <your-repo-url>
cd wind
```

4. **Update .env file**
```bash
nano .env
# Add your production values
```

5. **Start services**
```bash
docker-compose up -d
```

6. **Set up Nginx reverse proxy**
```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/financial-agent
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

7. **Enable site and get SSL**
```bash
sudo ln -s /etc/nginx/sites-available/financial-agent /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Security Checklist

### Before Going Live

- [ ] Generate new JWT_SECRET and AES_256_KEY
- [ ] Use strong MongoDB password
- [ ] Enable MongoDB encryption at rest
- [ ] Set up SSL/TLS (HTTPS)
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Review and update RP_ID for WebAuthn
- [ ] Test WebAuthn on production domain
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure environment-specific settings
- [ ] Remove console.logs in production
- [ ] Enable security headers
- [ ] Set up firewall rules
- [ ] Regular security audits

## Generating Secrets

### JWT Secret (64 characters)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### AES-256 Key (32 bytes = 64 hex characters)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Monitoring

### Health Checks

Backend health endpoint:
```
GET https://your-backend.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-09-29T18:24:00.000Z"
}
```

### Logging

View Docker logs:
```bash
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f mongodb
```

### Database Backup

Backup MongoDB:
```bash
docker exec financial-agent-db mongodump --out /backup
docker cp financial-agent-db:/backup ./backup
```

Restore MongoDB:
```bash
docker cp ./backup financial-agent-db:/backup
docker exec financial-agent-db mongorestore /backup
```

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or cloud load balancer
2. **Multiple Backend Instances**: Scale backend containers
3. **Database Replication**: Set up MongoDB replica set
4. **CDN**: Use Cloudflare or similar for frontend assets

### Performance Optimization

1. **Enable caching**: Redis for session storage
2. **Database indexing**: Ensure proper indexes on queries
3. **Compression**: Enable gzip compression
4. **Image optimization**: Compress and lazy-load images
5. **Code splitting**: Implement lazy loading in React

## Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify all environment variables are set
- Check logs: `docker-compose logs server`

### Frontend can't connect to backend
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Ensure backend is running and accessible

### WebAuthn not working
- Must use HTTPS (except localhost)
- Verify RP_ID matches domain
- Check browser compatibility

### Plaid connection fails
- Verify Plaid credentials
- Check PLAID_ENV setting
- Ensure backend can reach Plaid API

## Support

For deployment issues:
1. Check logs first
2. Review environment variables
3. Test health endpoints
4. Check firewall/security groups
5. Verify SSL certificates

## Cost Estimation

### Free Tier (Development/Testing)
- MongoDB Atlas: Free (512MB)
- Render: Free (750 hours/month)
- Vercel: Free (100GB bandwidth)
- **Total: $0/month**

### Production (Small Scale)
- MongoDB Atlas: $9/month (Shared M2)
- Render: $7/month (Starter)
- Vercel: Free or $20/month (Pro)
- Domain: $12/year
- **Total: ~$16-36/month**

### Production (Medium Scale)
- MongoDB Atlas: $57/month (M10)
- Render: $25/month (Standard)
- Vercel: $20/month (Pro)
- Domain: $12/year
- **Total: ~$102/month**

## Maintenance

### Regular Tasks
- Monitor error logs daily
- Review security alerts weekly
- Update dependencies monthly
- Backup database weekly
- Review analytics monthly
- Rotate secrets quarterly

### Updates
```bash
# Update dependencies
cd server && npm update
cd ../client && npm update

# Rebuild and redeploy
docker-compose build
docker-compose up -d
```

---

For more information, see README.md
