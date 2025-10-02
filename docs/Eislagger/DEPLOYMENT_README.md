# EisLager Production Deployment Guide 🚀

## 🏗️ Architecture Overview

EisLager is deployed as a containerized microservices architecture with the following components:

### 📊 **Services Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│                    (Next.js - Port 3000)                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                   Nginx Proxy                             │
│                (Port 80/443)                               │
└─┬──────┬──────┬──────┬──────┬──────┬──────────────────────┘
  │      │      │      │      │      │
  ▼      ▼      ▼      ▼      ▼      ▼
┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐┌─────────────┐
│ Auth││Sales││Store││Admin ││Comm ││ Analytics   │
│3002 ││3004 ││ 3003││3001 ││3005 ││   3006      │
└─────┘└─────┘└─────┘└─────┘└─────┘└─────────────┘
                  │                    │                    │
                  ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                Infrastructure                               │
│  PostgreSQL + Redis + Kafka + Zookeeper                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Deployment with Docker Compose

### 1️⃣ **Prerequisites**
```bash
# Install Docker and Docker Compose
# Docker: https://docs.docker.com/get-docker/
# Docker Compose: https://docs.docker.com/compose/install/

# Verify installation
docker --version
docker-compose --version
```

### 2️⃣ **Clone and Setup**
```bash
# Clone the repository
git clone <repository-url>
cd eislagger

# Make deployment script executable
chmod +x scripts/deploy.sh

# Copy environment template and edit
cp env.production.example .env
nano .env  # Edit with your production values
```

### 3️⃣ **Deploy**
```bash
# Run automated deployment
./scripts/deploy.sh

# Or manual deployment
docker-compose up -d
```

### 4️⃣ **Verify Deployment**
```bash
# Check all services are running
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl http://localhost/
curl http://localhost/api/auth/health
curl http://localhost/api/sales/health
```

---

## 🔧 Manual Step-by-Step Deployment

### **Step 1: Install Dependencies**
```bash
# Install Docker and Docker Compose
sudo apt update
sudo apt install docker.io docker-compose-plugin

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again
```

### **Step 2: Environment Configuration**
```bash
# Copy environment template
cp env.production.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL="postgresql://eislagger_user:eislagger_password_2024@postgres:5432/eislagger_main"

# JWT Secrets (CHANGE THESE!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# SMTP Configuration
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"

# Domain Configuration
DOMAIN="your-domain.com"
FRONTEND_URL="http://your-domain.com"
```

### **Step 3: Build and Deploy Services**
```bash
# Build all images
docker-compose build --no-cache

# Start infrastructure first
docker-compose up -d postgres redis zookeeper kafka

# Wait for infrastructure (30 seconds)
sleep 30

# Start backend services
docker-compose up -d auth-service sales-service inventory-service admin-service communications-service analytics-service

# Wait for backend services (45 seconds)
sleep 45

# Start frontend and proxy
docker-compose up -d frontend nginx

# Run database migrations
docker exec eislagger-auth-service npx prisma migrate deploy
docker exec eislagger-sales-service npx prisma migrate deploy
```

### **Step 4: Health Checks**
```bash
# Check individual services
curl http://localhost:3002/  # Auth Service
curl http://localhost:3004/  # Sales Service
curl http://localhost:3003/  # Inventory Service
curl http://localhost:3001/  # Admin Service
curl http://localhost:3005/  # Communications Service
curl http://localhost:3006/  # Analytics Service
curl http://localhost:3000/  # Frontend
curl http://localhost/       # Nginx Proxy

# Check container health
docker-compose ps
```

---

## 📋 Environment-Specific Deployment

### **Development Environment**
```bash
# Development setup
./scripts/dev-setup.sh

# Start development services
cd services/AuthService && npm run dev
cd services/SalesService && npm run dev
cd services/InventoryService && npm run dev
cd services/AdminService && npm run dev
cd services/CommunicationsService && npm run dev
cd services/AnalyticsService && npm run dev
cd frontend && npm run dev
```

### **Staging Environment**
```bash
# Use staging environment file
cp env.staging.example .env

# Deploy with staging configuration
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```

### **Production Environment**
```bash
# Use production environment file
cp env.production.example .env

# Deploy with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🔐 Security Configuration

### **SSL/HTTPS Setup**
```bash
# Generate SSL certificates (Let's Encrypt)
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com

# Update nginx configuration
cp nginx/nginx.conf nginx/nginx-ssl.conf
# Edit nginx-ssl.conf to uncomment HTTPS server block
# Update docker-compose.yml to use nginx-ssl.conf
```

### **Firewall Configuration**
```bash
# UFW configuration
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw deny 3000-3007  # Block direct access to services
```

### **Environment Security**
```bash
# Secure .env file
chmod 600 .env
chown root:root .env

# Update secrets
openssl rand -base64 32  # Generate JWT secret
openssl rand -base64 32  # Generate refresh secret
```

---

## 📚 Service-Specific Deployment

### **Auth Service**
```bash
cd services/AuthService
docker build -t eislagger-auth-service .
docker run -d \
  --name auth-service \
  -p 3002:3002 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  eislagger-auth-service
```

### **Sales Service**
```bash
cd services/SalesService
docker build -t eislagger-sales-service .
docker run -d \
  --name sales-service \
  -p 3004:3004 \
  --link kafka:kafka \
  ---link postgres:postgres \
  eislagger-sales-service
```

### **All Services Pattern**
```bash
# Build example for any service
cd services/[ServiceName]
docker build -t eislagger/[service-name] .
docker run -d \
  --name [service-name] \
  -p [port]:[port] \
  --network eislagger-network \
  -e DATABASE_URL="postgresql://..." \
  -e KAFKA_BROKERS="kafka:29092" \
  -e JWT_SECRET="..." \
  eislagger/[service-name]
```

---

## 🔄 Scaling and Monitoring

### **Horizontal Scaling**
```bash
# Scale specific services
docker-compose up -d --scale auth-service=3
docker-compose up -d --scale sales-service=2
docker-compose up -d --scale analytics-service=2
```

### **Load Balancer Configuration**
```bash
# Update docker-compose.yml for multiple instances
auth-service-1:
  extends:
    service: auth-service
  ports:
    - "3002:3002"

auth-service-2:
  extends:
    service: auth-service
  ports:
    - "3003:3002"
```

### **Health Monitoring**
```bash
# Monitor service health
watch 'docker-compose ps'

# Monitor logs
docker-compose logs -f --tail=100

# Monitor resource usage
docker stats
```

---

## 🗄️ Database Management

### **Database Migrations**
```bash
# Run migrations for each service
docker exec eislagger-auth-service npx prisma migrate deploy
docker exec eislagger-sales-service npx prisma migrate deploy
docker exec eislagger-inventory-service npx prisma migrate deploy
docker exec eislagger-admin-service npx prisma migrate deploy
docker exec eislagger-communications-service npx prisma migrate deploy
docker exec eislagger-analytics-service npx prisma migrate deploy

# Generate new migration
docker exec eislagger-auth-service npx prisma migrate dev --name "migration_name"
```

### **Database Backup**
```bash
# Backup all databases
docker exec eislagger-postgres pg_dump -U eislagger_user eislagger_main > backup_main.sql
docker exec eislagger-postgres pg_dump -U eislagger_user eislagger_auth > backup_auth.sql
docker exec eislagger-postgres pg_dump -U eislagger_user eislagger_sales > backup_sales.sql
docker exec eislagger-postgres pg_dump -U eislagger_user eislagger_inventory > backup_inventory.sql
docker exec eislagger-postgres pg_dump -U eislagger_user eislagger_admin > backup_admin.sql
docker exec eislagger-postgres pg_dump -U eislagger_user eislagger_communications > backup_communications.sql
docker exec eislagger-postgres pg_dump -U eislagger_user eislagger_analytics > backup_analytics.sql
```

### **Database Restore**
```bash
# Restore databases
docker exec -i eislagger-postgres psql -U eislagger_user -d eislagger_main < backup_main.sql
docker exec -i eislagger-postgres psql -U eislagger_user -d eislagger_auth < backup_auth.sql
# ... repeat for other databases
```

---

## 🔧 Troubleshooting

### **Common Issues**

**🚨 Service Won't Start**
```bash
# Check logs
docker-compose logs [service-name]

# Check container status
docker-compose ps

# Restart service
docker-compose restart [service-name]

# Rebuild service
docker-compose up -d --build [service-name]
```

**🚨 Database Connection Issues**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check database connectivity
docker exec eislagger-postgres pg_isready -U eislagger_user

# Check connection from service
docker exec eislagger-auth-service nc -zv postgres 5432
```

**🚨 Kafka Connection Issues**
```bash
# Check Kafka is running
docker-compose ps kafka

# Check Kafka topics
docker exec eislagger-kafka kafka-topics --bootstrap-server localhost:9092 --list

# Check Kafka connectivity
docker exec eislagger-sales-service nc -zv kafka 29092
```

**🚨 Port Conflicts**
```bash
# Check port usage
netstat -tulpn | grep :3000

# Kill process using port
sudo fuser -k 3000/tcp

# Use different external ports
# Edit docker-compose.yml ports section
```

### **Performance Optimization**

**📈 Memory Optimization**
```bash
# Limit container memory
docker-compose up -d --memory=512m auth-service

# Monitor memory usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

**🚀 CPU Optimization**
```bash
# Limit container CPU
docker-compose up -d --cpus=1 auth-service

# Check CPU usage
top -p $(docker exec eislagger-auth-service pgrep node)
```

---

## 📊 Monitoring and Logs

### **Application Logs**
```bash
# Follow all logs
docker-compose logs -f

# Follow specific service logs
docker-compose logs -f auth-service
docker-compose logs -f sales-series
docker-compose logs -f frontend

# Log levels per service
# Auth Service: PORT=3002 LOG_LEVEL=debug
# Sales Service: PORT=3004 LOG_LEVEL=info
# Analytics Service: PORT=3006 LOG_LEVEL=info
```

### **Performance Monitoring**
```bash
# Real-time resource monitoring
watch docker stats

# Service health checks
curl http://localhost/api/auth/health
curl http://localhost/api/sales/health
curl http://localhost/health  # Nginx health check
```

### **Log Rotation**
```bash
# Configure log rotation
sudo nano /etc/logrotate.d/eislagger

# Add configuration:
# /var/lib/docker/containers/*/*.log {
#   rotate 7
#   daily
#   compress
#   size=100M
#   missingok
#   delaycompress
#   copytruncate
# }
```

---

## 🎯 Production Best Practices

### **🔒 Security**
- ✅ Change all default passwords and secrets
- ✅ Use HTTPS in production
- ✅ Configure firewall rules
- ✅ Regular security updates
- ✅ Environment file permissions (600)
- ✅ Database backup encryption

### **📈 Performance**
- ✅ Resource limits on containers
- ✅ Database connection pooling
- ✅ Redis caching implementation
- ✅ CDN for static assets
- ✅ Log rotation and cleanup

### **🔍 Monitoring**
- ✅ Health check endpoints
- ✅ Log aggregation setup
- ✅ Metrics collection
- ✅ Alert configuration
- ✅ Performance monitoring

### **🔄 Maintenance**
- ✅ Regular database backups
- ✅ Service updates and patches
- ✅ Dependency security audits
- ✅ Performance optimization reviews

---

## 📞 Support and Maintenance

### **Development Team**
- **Lead Developer:** EisLager Team
- **DevOps Engineer:** Infrastructure Team
- **Database Admin:** Data Team

### **Emergency Procedures**
```bash
# Emergency service restart
docker-compose restart

# Emergency stop
docker-compose down

# Emergency data backup
docker exec eislagger-postgres pg_dump -U eislagger_user --all > emergency_backup.sql
```

### **Update Procedure**
```bash
# Pull latest changes
git pull origin main

# Rebuild images
docker-compose build --no-cache

# Graceful restart
docker-compose up -d --force-recreate

# Test functionality
curl http://localhost/health
```

---

## 🎉 Success Verification

### **✅ Deployment Checklist**
- [ ] All services are running (`docker-compose ps`)
- [ ] Database connections are established
- [ ] API endpoints are responding
- [ ] Frontend application loads
- [ ] Authentication flow works
- [ ] Services can communicate via Kafka
- [ ] Health checks are passing
- [ ] Logs show no critical errors

### **🌐 Access Points**
- **Frontend:** http://localhost
- **API Docs:** http://localhost/api/docs (if implemented)
- **Health:** http://localhost/health
- **Individual Services:** Direct port access for debugging

---

**🎊 Congratulations! EisLager is now deployed and ready for production use!**

**Next Steps:**
1. Configure your domain name and SSL certificates
2. Set up monitoring and alerting
3. Configure automated backups
4. Perform load testing
5. Train your team on the new system

**💡 Remember:** Always test in a staging environment before production deployment!
