# Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying RailConnect India to production environments. The deployment process includes infrastructure provisioning, application deployment, database setup, and monitoring configuration.

## Prerequisites

### Required Tools

- **AWS CLI**: For AWS resource management
- **Terraform**: For infrastructure provisioning
- **Docker**: For containerization
- **kubectl**: For Kubernetes management (future)
- **Node.js 18+**: For build processes
- **pnpm**: For package management

### Required Accounts

- **AWS Account**: For cloud infrastructure
- **Docker Hub**: For container registry
- **GitHub**: For source code and CI/CD
- **Domain Registrar**: For custom domain

### Required Permissions

- **AWS IAM**: Administrator access for initial setup
- **Docker Hub**: Push permissions for images
- **GitHub**: Repository access and secrets management

## Environment Setup

### 1. Local Development Environment

```bash
# Clone the repository
git clone https://github.com/your-org/railconnect-india.git
cd railconnect-india

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start local development
pnpm dev
```

### 2. Environment Variables

Create environment-specific configuration files:

#### Development (`.env.local`)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/railconnect_dev
REDIS_URL=redis://localhost:6379
MONGODB_URI=mongodb://localhost:27017/railconnect_dev
NEO4J_URI=bolt://localhost:7687
ELASTICSEARCH_URL=http://localhost:9200

# Authentication
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Payment Gateways
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret

# External Services
RAILWAY_API_KEY=your-railway-api-key
SMS_API_KEY=your-sms-api-key
EMAIL_API_KEY=your-email-api-key
```

#### Staging (`.env.staging`)
```bash
# Database
DATABASE_URL=postgresql://user:password@staging-db.railconnect.in:5432/railconnect_staging
REDIS_URL=redis://staging-redis.railconnect.in:6379
MONGODB_URI=mongodb://staging-mongo.railconnect.in:27017/railconnect_staging
NEO4J_URI=bolt://staging-neo4j.railconnect.in:7687
ELASTICSEARCH_URL=http://staging-elasticsearch.railconnect.in:9200

# Authentication
JWT_SECRET=your-staging-jwt-secret
JWT_REFRESH_SECRET=your-staging-refresh-secret

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-staging-access-key
AWS_SECRET_ACCESS_KEY=your-staging-secret-key

# Payment Gateways (Test Mode)
RAZORPAY_KEY_ID=your-staging-razorpay-key
RAZORPAY_KEY_SECRET=your-staging-razorpay-secret
STRIPE_PUBLISHABLE_KEY=your-staging-stripe-key
STRIPE_SECRET_KEY=your-staging-stripe-secret
```

#### Production (`.env.production`)
```bash
# Database
DATABASE_URL=postgresql://user:password@prod-db.railconnect.in:5432/railconnect_prod
REDIS_URL=redis://prod-redis.railconnect.in:6379
MONGODB_URI=mongodb://prod-mongo.railconnect.in:27017/railconnect_prod
NEO4J_URI=bolt://prod-neo4j.railconnect.in:7687
ELASTICSEARCH_URL=http://prod-elasticsearch.railconnect.in:9200

# Authentication
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-production-access-key
AWS_SECRET_ACCESS_KEY=your-production-secret-key

# Payment Gateways (Live Mode)
RAZORPAY_KEY_ID=your-production-razorpay-key
RAZORPAY_KEY_SECRET=your-production-razorpay-secret
STRIPE_PUBLISHABLE_KEY=your-production-stripe-key
STRIPE_SECRET_KEY=your-production-stripe-secret
```

## Infrastructure Deployment

### 1. AWS Infrastructure Setup

#### Prerequisites
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
```

#### Terraform Setup
```bash
# Install Terraform
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Navigate to infrastructure directory
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Create terraform.tfvars
cp terraform.tfvars.example terraform.tfvars
```

#### Configure terraform.tfvars
```hcl
# Project Configuration
project_name = "railconnect"
environment = "production"
region = "us-east-1"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"
availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]

# Database Configuration
db_instance_class = "db.r5.large"
db_allocated_storage = 100
db_max_allocated_storage = 1000

# Redis Configuration
redis_node_type = "cache.r5.large"
redis_num_cache_nodes = 2

# ECS Configuration
ecs_cluster_name = "railconnect-cluster"
ecs_service_desired_count = 3
ecs_task_cpu = 512
ecs_task_memory = 1024

# Load Balancer Configuration
alb_name = "railconnect-alb"
alb_internal = false
alb_idle_timeout = 60

# S3 Configuration
s3_bucket_name = "railconnect-assets"
s3_versioning = true
s3_encryption = true

# CloudFront Configuration
cloudfront_distribution = true
cloudfront_price_class = "PriceClass_100"

# Monitoring Configuration
enable_cloudwatch = true
enable_xray = true
log_retention_days = 30
```

#### Deploy Infrastructure
```bash
# Plan the deployment
terraform plan

# Apply the infrastructure
terraform apply

# Save the outputs
terraform output -json > terraform-outputs.json
```

### 2. Database Setup

#### PostgreSQL Setup
```bash
# Connect to RDS instance
psql -h prod-db.railconnect.in -U postgres -d postgres

# Create database
CREATE DATABASE railconnect_prod;

# Create user
CREATE USER railconnect_user WITH PASSWORD 'secure_password';

# Grant permissions
GRANT ALL PRIVILEGES ON DATABASE railconnect_prod TO railconnect_user;

# Run migrations
cd database/scripts
./migrate.sh production
```

#### Redis Setup
```bash
# Connect to Redis
redis-cli -h prod-redis.railconnect.in -p 6379

# Test connection
PING

# Set up Redis configuration
CONFIG SET requirepass "secure_redis_password"
CONFIG SET maxmemory 2gb
CONFIG SET maxmemory-policy allkeys-lru
```

#### Neo4j Setup
```bash
# Connect to Neo4j
cypher-shell -u neo4j -p "secure_password" -a bolt://prod-neo4j.railconnect.in:7687

# Create database
CREATE DATABASE railconnect;

# Run schema setup
:use railconnect
CALL apoc.schema.assert({}, {});
```

#### MongoDB Setup
```bash
# Connect to MongoDB
mongo mongodb://prod-mongo.railconnect.in:27017/railconnect_prod

# Create collections
db.createCollection("notifications");
db.createCollection("user_profiles");
db.createCollection("train_positions");

# Create indexes
db.notifications.createIndex({ "userId": 1, "createdAt": -1 });
db.user_profiles.createIndex({ "email": 1 }, { unique: true });
db.train_positions.createIndex({ "trainId": 1, "timestamp": 1 });
```

#### Elasticsearch Setup
```bash
# Create indices
curl -X PUT "prod-elasticsearch.railconnect.in:9200/stations" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "name": { "type": "text", "analyzer": "standard" },
      "code": { "type": "keyword" },
      "location": { "type": "geo_point" }
    }
  }
}'

# Create index templates
curl -X PUT "prod-elasticsearch.railconnect.in:9200/_index_template/station_template" -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["stations-*"],
  "template": {
    "mappings": {
      "properties": {
        "name": { "type": "text" },
        "code": { "type": "keyword" },
        "location": { "type": "geo_point" }
      }
    }
  }
}'
```

## Application Deployment

### 1. Docker Image Building

#### Build Images
```bash
# Build web application
docker build -t railconnect/web:latest -f apps/web/Dockerfile .

# Build API services
docker build -t railconnect/api:latest -f apps/api/Dockerfile .
docker build -t railconnect/api-gateway:latest -f apps/api-gateway/Dockerfile .
docker build -t railconnect/route-service:latest -f apps/route-service/Dockerfile .
docker build -t railconnect/tracking-service:latest -f apps/tracking-service/Dockerfile .
docker build -t railconnect/payment-service:latest -f apps/payment-service/Dockerfile .
docker build -t railconnect/notification-service:latest -f apps/notification-service/Dockerfile .

# Tag images for registry
docker tag railconnect/web:latest your-registry/railconnect/web:latest
docker tag railconnect/api:latest your-registry/railconnect/api:latest
docker tag railconnect/api-gateway:latest your-registry/railconnect/api-gateway:latest
docker tag railconnect/route-service:latest your-registry/railconnect/route-service:latest
docker tag railconnect/tracking-service:latest your-registry/railconnect/tracking-service:latest
docker tag railconnect/payment-service:latest your-registry/railconnect/payment-service:latest
docker tag railconnect/notification-service:latest your-registry/railconnect/notification-service:latest
```

#### Push Images
```bash
# Login to registry
docker login your-registry.com

# Push images
docker push your-registry/railconnect/web:latest
docker push your-registry/railconnect/api:latest
docker push your-registry/railconnect/api-gateway:latest
docker push your-registry/railconnect/route-service:latest
docker push your-registry/railconnect/tracking-service:latest
docker push your-registry/railconnect/payment-service:latest
docker push your-registry/railconnect/notification-service:latest
```

### 2. ECS Deployment

#### Create ECS Cluster
```bash
# Create cluster
aws ecs create-cluster --cluster-name railconnect-cluster

# Create task definitions
aws ecs register-task-definition --cli-input-json file://task-definitions/web-task-definition.json
aws ecs register-task-definition --cli-input-json file://task-definitions/api-task-definition.json
aws ecs register-task-definition --cli-input-json file://task-definitions/api-gateway-task-definition.json
aws ecs register-task-definition --cli-input-json file://task-definitions/route-service-task-definition.json
aws ecs register-task-definition --cli-input-json file://task-definitions/tracking-service-task-definition.json
aws ecs register-task-definition --cli-input-json file://task-definitions/payment-service-task-definition.json
aws ecs register-task-definition --cli-input-json file://task-definitions/notification-service-task-definition.json
```

#### Create ECS Services
```bash
# Create services
aws ecs create-service --cli-input-json file://services/web-service.json
aws ecs create-service --cli-input-json file://services/api-service.json
aws ecs create-service --cli-input-json file://services/api-gateway-service.json
aws ecs create-service --cli-input-json file://services/route-service.json
aws ecs create-service --cli-input-json file://services/tracking-service.json
aws ecs create-service --cli-input-json file://services/payment-service.json
aws ecs create-service --cli-input-json file://services/notification-service.json
```

### 3. Load Balancer Configuration

#### Application Load Balancer
```bash
# Create target groups
aws elbv2 create-target-group --cli-input-json file://target-groups/web-target-group.json
aws elbv2 create-target-group --cli-input-json file://target-groups/api-target-group.json

# Create listeners
aws elbv2 create-listener --cli-input-json file://listeners/web-listener.json
aws elbv2 create-listener --cli-input-json file://listeners/api-listener.json

# Create rules
aws elbv2 create-rule --cli-input-json file://rules/api-rule.json
```

### 4. Domain and SSL Setup

#### Route 53 Configuration
```bash
# Create hosted zone
aws route53 create-hosted-zone --name railconnect.in --caller-reference $(date +%s)

# Create DNS records
aws route53 change-resource-record-sets --hosted-zone-id Z123456789 --change-batch file://dns-records.json
```

#### SSL Certificate
```bash
# Request SSL certificate
aws acm request-certificate --domain-name railconnect.in --subject-alternative-names "*.railconnect.in" --validation-method DNS

# Validate certificate
aws acm describe-certificate --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012
```

## CI/CD Pipeline

### 1. GitHub Actions Setup

#### Repository Secrets
Add the following secrets to your GitHub repository:

- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `DOCKER_USERNAME`: Docker Hub username
- `DOCKER_PASSWORD`: Docker Hub password
- `DATABASE_URL`: Production database URL
- `REDIS_URL`: Production Redis URL
- `JWT_SECRET`: JWT secret key
- `RAZORPAY_KEY_ID`: Razorpay key ID
- `RAZORPAY_KEY_SECRET`: Razorpay key secret

#### Workflow Configuration
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install pnpm
        run: npm install -g pnpm
        
      - name: Install dependencies
        run: pnpm install
        
      - name: Run tests
        run: pnpm test:ci
        
      - name: Build applications
        run: pnpm build
        
      - name: Build Docker images
        run: pnpm docker:build
        
      - name: Push Docker images
        run: pnpm docker:push
        
      - name: Deploy to ECS
        run: pnpm deploy:production
```

### 2. Deployment Scripts

#### Production Deployment Script
```bash
#!/bin/bash
# scripts/deploy-production.sh

set -e

echo "🚀 Starting production deployment..."

# Build applications
echo "📦 Building applications..."
pnpm build

# Build Docker images
echo "🐳 Building Docker images..."
pnpm docker:build

# Push images to registry
echo "📤 Pushing images to registry..."
pnpm docker:push

# Update ECS services
echo "🔄 Updating ECS services..."
aws ecs update-service --cluster railconnect-cluster --service web-service --force-new-deployment
aws ecs update-service --cluster railconnect-cluster --service api-service --force-new-deployment
aws ecs update-service --cluster railconnect-cluster --service api-gateway-service --force-new-deployment
aws ecs update-service --cluster railconnect-cluster --service route-service --force-new-deployment
aws ecs update-service --cluster railconnect-cluster --service tracking-service --force-new-deployment
aws ecs update-service --cluster railconnect-cluster --service payment-service --force-new-deployment
aws ecs update-service --cluster railconnect-cluster --service notification-service --force-new-deployment

# Wait for deployment to complete
echo "⏳ Waiting for deployment to complete..."
aws ecs wait services-stable --cluster railconnect-cluster --services web-service api-service api-gateway-service route-service tracking-service payment-service notification-service

# Run health checks
echo "🏥 Running health checks..."
pnpm health-check

echo "✅ Production deployment completed successfully!"
```

#### Health Check Script
```bash
#!/bin/bash
# scripts/health-check.sh

set -e

echo "🏥 Running health checks..."

# Check web application
echo "Checking web application..."
curl -f https://railconnect.in/health || exit 1

# Check API endpoints
echo "Checking API endpoints..."
curl -f https://api.railconnect.in/health || exit 1

# Check database connections
echo "Checking database connections..."
node scripts/check-database.js || exit 1

# Check Redis connection
echo "Checking Redis connection..."
node scripts/check-redis.js || exit 1

echo "✅ All health checks passed!"
```

## Monitoring and Logging

### 1. CloudWatch Setup

#### Log Groups
```bash
# Create log groups
aws logs create-log-group --log-group-name /aws/ecs/railconnect/web
aws logs create-log-group --log-group-name /aws/ecs/railconnect/api
aws logs create-log-group --log-group-name /aws/ecs/railconnect/api-gateway
aws logs create-log-group --log-group-name /aws/ecs/railconnect/route-service
aws logs create-log-group --log-group-name /aws/ecs/railconnect/tracking-service
aws logs create-log-group --log-group-name /aws/ecs/railconnect/payment-service
aws logs create-log-group --log-group-name /aws/ecs/railconnect/notification-service
```

#### Alarms
```bash
# Create alarms
aws cloudwatch put-metric-alarm --cli-input-json file://alarms/high-cpu-alarm.json
aws cloudwatch put-metric-alarm --cli-input-json file://alarms/high-memory-alarm.json
aws cloudwatch put-metric-alarm --cli-input-json file://alarms/error-rate-alarm.json
aws cloudwatch put-metric-alarm --cli-input-json file://alarms/response-time-alarm.json
```

### 2. X-Ray Tracing

#### Enable X-Ray
```bash
# Create X-Ray daemon task definition
aws ecs register-task-definition --cli-input-json file://task-definitions/xray-daemon-task-definition.json

# Create X-Ray daemon service
aws ecs create-service --cli-input-json file://services/xray-daemon-service.json
```

## Security Configuration

### 1. Security Groups

#### Web Security Group
```bash
# Create security group
aws ec2 create-security-group --group-name railconnect-web-sg --description "Security group for web application"

# Allow HTTP and HTTPS
aws ec2 authorize-security-group-ingress --group-id sg-12345678 --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id sg-12345678 --protocol tcp --port 443 --cidr 0.0.0.0/0
```

#### API Security Group
```bash
# Create security group
aws ec2 create-security-group --group-name railconnect-api-sg --description "Security group for API services"

# Allow internal communication
aws ec2 authorize-security-group-ingress --group-id sg-87654321 --protocol tcp --port 3001 --source-group sg-12345678
```

### 2. IAM Roles

#### ECS Task Role
```bash
# Create task role
aws iam create-role --role-name railconnect-ecs-task-role --assume-role-policy-document file://policies/ecs-task-role-policy.json

# Attach policies
aws iam attach-role-policy --role-name railconnect-ecs-task-role --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
aws iam attach-role-policy --role-name railconnect-ecs-task-role --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
```

#### ECS Execution Role
```bash
# Create execution role
aws iam create-role --role-name railconnect-ecs-execution-role --assume-role-policy-document file://policies/ecs-execution-role-policy.json

# Attach policies
aws iam attach-role-policy --role-name railconnect-ecs-execution-role --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

## Backup and Recovery

### 1. Database Backups

#### Automated Backups
```bash
# Enable automated backups for RDS
aws rds modify-db-instance --db-instance-identifier railconnect-prod --backup-retention-period 7 --preferred-backup-window "03:00-04:00"
```

#### Manual Backups
```bash
# Create manual backup
aws rds create-db-snapshot --db-instance-identifier railconnect-prod --db-snapshot-identifier railconnect-prod-$(date +%Y%m%d)
```

### 2. Application Backups

#### S3 Backups
```bash
# Create backup bucket
aws s3 mb s3://railconnect-backups

# Enable versioning
aws s3api put-bucket-versioning --bucket railconnect-backups --versioning-configuration Status=Enabled

# Create lifecycle policy
aws s3api put-bucket-lifecycle-configuration --bucket railconnect-backups --lifecycle-configuration file://lifecycle-policy.json
```

## Troubleshooting

### 1. Common Issues

#### ECS Service Issues
```bash
# Check service status
aws ecs describe-services --cluster railconnect-cluster --services web-service

# Check task definitions
aws ecs describe-task-definition --task-definition railconnect-web:latest

# Check logs
aws logs get-log-events --log-group-name /aws/ecs/railconnect/web --log-stream-name web-service/web-task/1234567890
```

#### Database Connection Issues
```bash
# Test database connection
psql -h prod-db.railconnect.in -U railconnect_user -d railconnect_prod -c "SELECT 1;"

# Check database status
aws rds describe-db-instances --db-instance-identifier railconnect-prod
```

#### Load Balancer Issues
```bash
# Check target group health
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/railconnect-web/1234567890123456

# Check listener rules
aws elbv2 describe-rules --listener-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:listener/app/railconnect-alb/1234567890123456/1234567890123456
```

### 2. Performance Issues

#### High CPU Usage
```bash
# Check ECS service metrics
aws cloudwatch get-metric-statistics --namespace AWS/ECS --metric-name CPUUtilization --dimensions Name=ServiceName,Value=web-service Name=ClusterName,Value=railconnect-cluster --start-time 2024-01-01T00:00:00Z --end-time 2024-01-01T23:59:59Z --period 300 --statistics Average
```

#### High Memory Usage
```bash
# Check ECS service metrics
aws cloudwatch get-metric-statistics --namespace AWS/ECS --metric-name MemoryUtilization --dimensions Name=ServiceName,Value=web-service Name=ClusterName,Value=railconnect-cluster --start-time 2024-01-01T00:00:00Z --end-time 2024-01-01T23:59:59Z --period 300 --statistics Average
```

## Rollback Procedures

### 1. Application Rollback

#### ECS Service Rollback
```bash
# List task definitions
aws ecs list-task-definitions --family-prefix railconnect-web --status ACTIVE

# Update service to previous task definition
aws ecs update-service --cluster railconnect-cluster --service web-service --task-definition railconnect-web:previous-version
```

#### Database Rollback
```bash
# List available snapshots
aws rds describe-db-snapshots --db-instance-identifier railconnect-prod

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot --db-instance-identifier railconnect-prod-rollback --db-snapshot-identifier railconnect-prod-20240101
```

### 2. Infrastructure Rollback

#### Terraform Rollback
```bash
# List Terraform state
terraform state list

# Rollback to previous state
terraform apply -target=aws_ecs_service.web_service -var="desired_count=2"
```

## Maintenance

### 1. Regular Maintenance

#### Database Maintenance
```bash
# Update database statistics
psql -h prod-db.railconnect.in -U railconnect_user -d railconnect_prod -c "ANALYZE;"

# Vacuum database
psql -h prod-db.railconnect.in -U railconnect_user -d railconnect_prod -c "VACUUM;"
```

#### Application Updates
```bash
# Update dependencies
pnpm update

# Run security audit
pnpm audit

# Update Docker images
pnpm docker:build
pnpm docker:push
```

### 2. Monitoring Maintenance

#### Log Rotation
```bash
# Set up log rotation
aws logs put-retention-policy --log-group-name /aws/ecs/railconnect/web --retention-in-days 30
```

#### Metric Cleanup
```bash
# Clean up old metrics
aws cloudwatch delete-metrics --namespace Custom/RailConnect --metric-name OldMetric
```

## Support and Documentation

### 1. Deployment Documentation
- Keep deployment scripts updated
- Document any custom configurations
- Maintain runbooks for common operations

### 2. Monitoring and Alerting
- Set up comprehensive monitoring
- Configure appropriate alerts
- Regular review of metrics and logs

### 3. Backup and Recovery Testing
- Regular backup testing
- Disaster recovery drills
- Documentation of recovery procedures

---

This deployment guide provides comprehensive instructions for deploying RailConnect India to production. Follow the steps carefully and ensure all prerequisites are met before starting the deployment process.
