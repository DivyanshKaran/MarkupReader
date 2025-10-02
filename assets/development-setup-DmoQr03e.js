const n=`# Development Setup

## Overview

This guide provides comprehensive instructions for setting up the RailConnect India development environment. Follow these steps to get the project running locally on your machine.

## Prerequisites

### Required Software

#### Node.js and Package Manager
\`\`\`bash
# Install Node.js 18+ (recommended: use nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install pnpm
npm install -g pnpm@8.10.0

# Verify installations
node --version  # Should be v18.x.x or higher
pnpm --version  # Should be 8.10.0 or higher
\`\`\`

#### Git
\`\`\`bash
# Install Git
sudo apt update
sudo apt install git

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
\`\`\`

#### Docker and Docker Compose
\`\`\`bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
\`\`\`

#### Database Tools
\`\`\`bash
# Install PostgreSQL client
sudo apt install postgresql-client

# Install Redis client
sudo apt install redis-tools

# Install MongoDB client
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install mongodb-mongosh
\`\`\`

#### Neo4j Desktop
\`\`\`bash
# Download Neo4j Desktop from https://neo4j.com/download/
# Install and start Neo4j Desktop
# Create a new project and database
\`\`\`

#### Elasticsearch
\`\`\`bash
# Install Elasticsearch
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list
sudo apt update
sudo apt install elasticsearch

# Start Elasticsearch
sudo systemctl start elasticsearch
sudo systemctl enable elasticsearch
\`\`\`

### Optional Tools

#### VS Code Extensions
\`\`\`bash
# Install VS Code
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install code

# Recommended extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension ms-vscode.vscode-json
code --install-extension ms-vscode.vscode-docker
code --install-extension ms-vscode.vscode-gitlens
\`\`\`

#### Additional Development Tools
\`\`\`bash
# Install curl and wget
sudo apt install curl wget

# Install jq for JSON processing
sudo apt install jq

# Install tree for directory visualization
sudo apt install tree

# Install htop for system monitoring
sudo apt install htop
\`\`\`

## Project Setup

### 1. Clone the Repository

\`\`\`bash
# Clone the repository
git clone https://github.com/your-org/railconnect-india.git
cd railconnect-india

# Verify the repository structure
tree -L 2
\`\`\`

### 2. Install Dependencies

\`\`\`bash
# Install all dependencies
pnpm install

# Verify installation
pnpm list --depth=0
\`\`\`

### 3. Environment Configuration

#### Create Environment Files
\`\`\`bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
\`\`\`

#### Environment Variables
\`\`\`bash
# Database Configuration
DATABASE_URL=postgresql://railconnect_user:password@localhost:5432/railconnect_dev
REDIS_URL=redis://localhost:6379
MONGODB_URI=mongodb://localhost:27017/railconnect_dev
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
ELASTICSEARCH_URL=http://localhost:9200

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AWS Configuration (for development)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=railconnect-dev-assets

# Payment Gateways (Test Mode)
RAZORPAY_KEY_ID=your-razorpay-test-key
RAZORPAY_KEY_SECRET=your-razorpay-test-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-test-key
STRIPE_SECRET_KEY=your-stripe-test-secret

# External Services
RAILWAY_API_KEY=your-railway-api-key
SMS_API_KEY=your-sms-api-key
EMAIL_API_KEY=your-email-api-key

# Application Configuration
NODE_ENV=development
PORT=3001
API_PORT=3001
WEB_PORT=3000

# Logging
LOG_LEVEL=debug
LOG_FORMAT=pretty

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
\`\`\`

### 4. Database Setup

#### Start Database Services
\`\`\`bash
# Start all database services using Docker Compose
docker-compose -f database/docker-compose.yml up -d

# Verify services are running
docker-compose -f database/docker-compose.yml ps
\`\`\`

#### Initialize Databases
\`\`\`bash
# Wait for databases to be ready
sleep 30

# Run database setup script
cd database/scripts
chmod +x setup.sh
./setup.sh

# Verify database connections
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT 1;"
redis-cli -h localhost -p 6379 ping
mongosh mongodb://localhost:27017/railconnect_dev --eval "db.runCommand('ping')"
\`\`\`

#### Run Database Migrations
\`\`\`bash
# Run PostgreSQL migrations
cd database/scripts
chmod +x migrate.sh
./migrate.sh

# Verify migrations
psql -h localhost -U railconnect_user -d railconnect_dev -c "\\dt"
\`\`\`

#### Seed Development Data
\`\`\`bash
# Run database seeding
cd database/scripts
chmod +x seed.sh
./seed.sh

# Verify seeded data
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT COUNT(*) FROM users;"
\`\`\`

### 5. Build Applications

\`\`\`bash
# Build all applications
pnpm build

# Verify builds
ls -la apps/*/dist
ls -la apps/*/.next
\`\`\`

### 6. Start Development Servers

#### Start All Services
\`\`\`bash
# Start all development servers
pnpm dev

# This will start:
# - Web application on http://localhost:3000
# - API Gateway on http://localhost:3001
# - Route Service on http://localhost:3002
# - Tracking Service on http://localhost:3003
# - Payment Service on http://localhost:3004
# - Notification Service on http://localhost:3005
\`\`\`

#### Start Individual Services
\`\`\`bash
# Start web application only
cd apps/web
pnpm dev

# Start API service only
cd apps/api
pnpm dev

# Start API Gateway only
cd apps/api-gateway
pnpm dev

# Start Route Service only
cd apps/route-service
pnpm dev

# Start Tracking Service only
cd apps/tracking-service
pnpm dev

# Start Payment Service only
cd apps/payment-service
pnpm dev

# Start Notification Service only
cd apps/notification-service
pnpm dev
\`\`\`

## Development Workflow

### 1. Code Quality Setup

#### Pre-commit Hooks
\`\`\`bash
# Install Husky hooks
pnpm prepare

# Verify hooks are installed
ls -la .husky/
\`\`\`

#### Linting and Formatting
\`\`\`bash
# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Run formatting
pnpm format

# Check formatting
pnpm format:check
\`\`\`

#### Type Checking
\`\`\`bash
# Run type checking
pnpm type-check

# Type check specific package
cd apps/web
pnpm type-check
\`\`\`

### 2. Testing Setup

#### Unit Tests
\`\`\`bash
# Run all unit tests
pnpm test:unit

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test apps/web/src/components/__tests__/SearchForm.test.tsx
\`\`\`

#### Integration Tests
\`\`\`bash
# Run integration tests
pnpm test:integration

# Run specific integration test
pnpm test tests/integration/api.test.ts
\`\`\`

#### E2E Tests
\`\`\`bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
pnpm test:e2e

# Run E2E tests in headed mode
pnpm test:e2e --headed

# Run E2E tests with UI
pnpm test:e2e --ui
\`\`\`

### 3. Development Tools

#### Database Management
\`\`\`bash
# Connect to PostgreSQL
psql -h localhost -U railconnect_user -d railconnect_dev

# Connect to Redis
redis-cli -h localhost -p 6379

# Connect to MongoDB
mongosh mongodb://localhost:27017/railconnect_dev

# Connect to Neo4j
cypher-shell -u neo4j -p password -a bolt://localhost:7687
\`\`\`

#### Log Monitoring
\`\`\`bash
# View application logs
tail -f logs/app.log

# View database logs
docker-compose -f database/docker-compose.yml logs -f postgres

# View Redis logs
docker-compose -f database/docker-compose.yml logs -f redis
\`\`\`

#### Performance Monitoring
\`\`\`bash
# Monitor system resources
htop

# Monitor Docker containers
docker stats

# Monitor database performance
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT * FROM pg_stat_activity;"
\`\`\`

## Troubleshooting

### Common Issues

#### Port Conflicts
\`\`\`bash
# Check if ports are in use
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :3001

# Kill processes using ports
sudo kill -9 $(sudo lsof -t -i:3000)
sudo kill -9 $(sudo lsof -t -i:3001)
\`\`\`

#### Database Connection Issues
\`\`\`bash
# Check database status
docker-compose -f database/docker-compose.yml ps

# Restart database services
docker-compose -f database/docker-compose.yml restart

# Check database logs
docker-compose -f database/docker-compose.yml logs postgres
\`\`\`

#### Dependency Issues
\`\`\`bash
# Clear node_modules and reinstall
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install

# Clear pnpm cache
pnpm store prune
\`\`\`

#### Build Issues
\`\`\`bash
# Clear build artifacts
pnpm clean

# Rebuild applications
pnpm build

# Check for TypeScript errors
pnpm type-check
\`\`\`

### Performance Issues

#### Slow Development Server
\`\`\`bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Use faster file watcher
export CHOKIDAR_USEPOLLING=true

# Disable source maps in development
export GENERATE_SOURCEMAP=false
\`\`\`

#### Database Performance
\`\`\`bash
# Check database connections
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT count(*) FROM pg_stat_activity;"

# Optimize database settings
psql -h localhost -U railconnect_user -d railconnect_dev -c "VACUUM ANALYZE;"
\`\`\`

## Development Best Practices

### 1. Code Organization
- Follow the established directory structure
- Use TypeScript for all new code
- Write tests for new features
- Follow naming conventions
- Use meaningful commit messages

### 2. Git Workflow
\`\`\`bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push branch
git push origin feature/new-feature

# Create pull request
# Merge after review
\`\`\`

### 3. Testing Strategy
- Write unit tests for components and functions
- Write integration tests for API endpoints
- Write E2E tests for critical user journeys
- Maintain test coverage above 80%
- Run tests before committing

### 4. Performance Considerations
- Optimize images and assets
- Use lazy loading for components
- Implement proper caching strategies
- Monitor bundle sizes
- Profile application performance

## IDE Configuration

### VS Code Settings
Create \`.vscode/settings.json\`:
\`\`\`json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
\`\`\`

### VS Code Extensions
Create \`.vscode/extensions.json\`:
\`\`\`json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "ms-vscode.vscode-docker",
    "ms-vscode.vscode-gitlens"
  ]
}
\`\`\`

## Additional Resources

### Documentation
- [API Documentation](./api-documentation.md)
- [Testing Guide](./testing-guide.md)
- [Deployment Guide](../deployment/deployment-guide.md)
- [Architecture Overview](../architecture/system-architecture.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Redis Documentation](https://redis.io/documentation)

### Community
- [GitHub Issues](https://github.com/your-org/railconnect-india/issues)
- [Discord Community](https://discord.gg/railconnect)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/railconnect)

---

This development setup guide provides everything needed to start contributing to RailConnect India. Follow the steps carefully and refer to the troubleshooting section if you encounter any issues.
`;export{n as default};
