# Financial Application - Production Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB (or use Docker)

### Environment Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure environment variables:**
   ```env
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=mongodb://username:password@localhost:27017/financial-agent
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000
   CLIENT_URL=https://yourdomain.com
   ```

## 🐳 Docker Deployment (Recommended)

### 1. Build and Start
```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up --build

# Run in background
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

### 2. Services Overview
- **mongodb**: MongoDB 6.0 database
- **app**: Node.js application server
- **redis**: Redis cache (optional)
- **nginx**: Reverse proxy (optional)

### 3. Health Checks
```bash
# Check application health
curl http://localhost:5001/health

# Check MongoDB
docker exec financial-app-db mongosh --eval "db.adminCommand('ping')"
```

## 🛠️ Manual Deployment

### 1. Install Dependencies
```bash
npm ci --production
```

### 2. Build Application
```bash
npm run build
```

### 3. Start Application
```bash
npm start
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | development |
| `PORT` | Server port | No | 5001 |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `ALLOWED_ORIGINS` | CORS allowed origins | No | http://localhost:3000 |
| `CLIENT_URL` | Client application URL | No | - |

### Security Best Practices

1. **Use strong JWT secret** (minimum 32 characters)
2. **Enable HTTPS in production**
3. **Set secure CORS origins**
4. **Use environment-specific configurations**
5. **Regular dependency updates**

## 📊 Monitoring

### Health Endpoints
- `GET /health` - Application health check

### Logs
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs app

# View all logs
docker-compose -f docker-compose.prod.yml logs
```

## 🔒 Security Features

- **Helmet.js** - Security headers
- **Rate limiting** - API protection
- **CORS** - Cross-origin protection
- **Input sanitization** - XSS prevention
- **JWT authentication** - Secure auth
- **Password hashing** - bcrypt

## 🚀 Scaling

### Horizontal Scaling
```bash
# Scale application instances
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Load balancer configuration needed for multiple instances
```

### Database Scaling
- Consider MongoDB replica sets for production
- Use connection pooling
- Implement caching with Redis

## 🔄 CI/CD Pipeline Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: ./server
          file: ./server/Dockerfile.prod
          push: true
          tags: your-registry/app:latest

      - name: Deploy
        run: |
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Change port in .env
   PORT=5002
   ```

2. **MongoDB connection issues**
   ```bash
   # Check MongoDB status
   docker ps | grep mongodb
   docker logs financial-app-db
   ```

3. **Environment variables not loaded**
   ```bash
   # Check .env file exists and has correct format
   ls -la .env
   ```

### Logs Location
- Docker: `docker-compose logs [service-name]`
- Local: Application logs to stdout/stderr

## 📝 API Documentation

Once deployed, access the API documentation at:
- Swagger UI: `http://localhost:5001/api-docs` (if implemented)
- Health check: `http://localhost:5001/health`

## 🔧 Maintenance

### Updates
```bash
# Update application
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --build

# Update database
docker exec financial-app-db mongosh --eval "db.adminCommand('listDatabases')"
```

### Backups
```bash
# MongoDB backup
docker exec financial-app-db mongodump --out /data/backup

# Restore
docker exec -i financial-app-db mongorestore /data/backup
```

## 📞 Support

For production issues:
1. Check application logs: `docker-compose logs app`
2. Verify environment variables
3. Test database connectivity
4. Check resource usage: `docker stats`

---

**Note**: This deployment guide assumes basic Docker knowledge. For production deployments, consider using managed services like AWS RDS for MongoDB, AWS ECS for containers, and CloudFlare for CDN/security.
