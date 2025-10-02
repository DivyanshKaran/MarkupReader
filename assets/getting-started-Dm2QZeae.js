const n=`# Getting Started

This guide will help you set up the RailConnect India development environment and get started with development.

## Prerequisites

### Required Software
- **Node.js** 18.0 or higher
- **pnpm** 8.0 or higher (recommended package manager)
- **Docker** 20.10 or higher
- **Docker Compose** 2.0 or higher
- **Git** 2.30 or higher

### Optional Software
- **AWS CLI** 2.0 or higher (for AWS services)
- **Terraform** 1.0 or higher (for infrastructure)
- **kubectl** 1.20 or higher (for Kubernetes)
- **PostgreSQL** 15 or higher (for local database)
- **Redis** 7.0 or higher (for local caching)

### System Requirements
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **OS**: macOS, Linux, or Windows with WSL2

## Installation

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/railconnect/railconnect-india.git
cd railconnect-india
\`\`\`

### 2. Install Node.js Dependencies
\`\`\`bash
# Install pnpm if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
\`\`\`

### 3. Environment Configuration
\`\`\`bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
\`\`\`

### 4. Start Development Environment
\`\`\`bash
# Start all services with Docker Compose
docker-compose up -d

# Verify services are running
docker-compose ps
\`\`\`

## Development Setup

### Project Structure
\`\`\`
railconnect-india/
├── apps/                    # Applications
│   ├── web/                # Next.js frontend
│   ├── api/                # Express.js API
│   ├── api-gateway/        # API Gateway service
│   ├── route-service/      # Route planning service
│   ├── booking-service/    # Booking service
│   ├── payment-service/    # Payment service
│   ├── notification-service/ # Notification service
│   └── tracking-service/   # Real-time tracking service
├── packages/               # Shared packages
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── ui-components/     # Reusable UI components
│   ├── config/            # Configuration files
│   └── security/          # Security utilities
├── database/              # Database configurations
├── infrastructure/        # Infrastructure as Code
├── tests/                 # Test files
└── docs/                  # Documentation
\`\`\`

### Available Scripts

#### Root Level Scripts
\`\`\`bash
# Install all dependencies
pnpm install

# Build all applications
pnpm build

# Start all applications in development mode
pnpm dev

# Run tests across all applications
pnpm test

# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Clean build artifacts
pnpm clean
\`\`\`

#### Application-Specific Scripts
\`\`\`bash
# Frontend (Next.js)
cd apps/web
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests
pnpm lint         # Run ESLint

# API Gateway
cd apps/api-gateway
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests

# Route Service
cd apps/route-service
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests
\`\`\`

## Database Setup

### Local Development Databases
The development environment includes the following databases:

- **PostgreSQL** (port 5432) - Primary database
- **Redis** (port 6379) - Caching and sessions
- **Neo4j** (port 7474) - Graph database
- **MongoDB** (port 27017) - Document store
- **Elasticsearch** (port 9200) - Search engine

### Database Initialization
\`\`\`bash
# Run database migrations
pnpm db:migrate

# Seed development data
pnpm db:seed

# Reset databases (development only)
pnpm db:reset
\`\`\`

### Database Access
\`\`\`bash
# PostgreSQL
psql -h localhost -p 5432 -U railconnect_user -d railconnect_dev

# Redis
redis-cli -h localhost -p 6379

# Neo4j Browser
open http://localhost:7474

# MongoDB
mongosh mongodb://localhost:27017/railconnect_dev

# Elasticsearch
curl http://localhost:9200/_cluster/health
\`\`\`

## Development Workflow

### 1. Feature Development
\`\`\`bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... edit files ...

# Run tests
pnpm test

# Run linting
pnpm lint

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name
\`\`\`

### 2. Code Quality Checks
\`\`\`bash
# Run all quality checks
pnpm quality:check

# This includes:
# - TypeScript compilation
# - ESLint linting
# - Prettier formatting
# - Unit tests
# - Integration tests
\`\`\`

### 3. Pull Request Process
1. Create a pull request from your feature branch
2. Ensure all CI checks pass
3. Request code review from team members
4. Address review feedback
5. Merge after approval

## Testing

### Running Tests
\`\`\`bash
# Run all tests
pnpm test

# Run tests for specific application
cd apps/web && pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run performance tests
pnpm test:performance
\`\`\`

### Test Structure
\`\`\`
tests/
├── unit/                  # Unit tests
├── integration/           # Integration tests
├── e2e/                  # End-to-end tests
├── performance/          # Performance tests
└── fixtures/             # Test data and fixtures
\`\`\`

## Debugging

### Frontend Debugging
\`\`\`bash
# Start with debugging enabled
cd apps/web
pnpm dev --inspect

# Use browser dev tools
# - React DevTools extension
# - Redux DevTools extension
# - Network tab for API calls
\`\`\`

### Backend Debugging
\`\`\`bash
# Start with debugging enabled
cd apps/api
pnpm dev --inspect

# Use VS Code debugger
# - Set breakpoints in code
# - Use debug console
# - Step through code execution
\`\`\`

### Database Debugging
\`\`\`bash
# Enable query logging
export DEBUG=railconnect:database

# View database logs
docker-compose logs -f postgres

# Use database GUI tools
# - pgAdmin for PostgreSQL
# - RedisInsight for Redis
# - Neo4j Browser for Neo4j
\`\`\`

## Common Issues and Solutions

### Port Conflicts
\`\`\`bash
# Check what's using a port
lsof -i :3000

# Kill process using port
kill -9 <PID>

# Use different port
PORT=3001 pnpm dev
\`\`\`

### Database Connection Issues
\`\`\`bash
# Check if databases are running
docker-compose ps

# Restart databases
docker-compose restart postgres redis neo4j

# Check database logs
docker-compose logs postgres
\`\`\`

### Memory Issues
\`\`\`bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Check memory usage
docker stats

# Restart containers
docker-compose restart
\`\`\`

### Dependency Issues
\`\`\`bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Clear pnpm cache
pnpm store prune

# Update dependencies
pnpm update
\`\`\`

## IDE Configuration

### VS Code Setup
Install the following extensions:
- **TypeScript and JavaScript Language Features**
- **ESLint**
- **Prettier - Code formatter**
- **Tailwind CSS IntelliSense**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**
- **Thunder Client** (for API testing)

### VS Code Settings
\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
\`\`\`

### WebStorm Setup
1. Install Node.js plugin
2. Configure ESLint and Prettier
3. Set up TypeScript compiler
4. Configure database connections
5. Set up run configurations

## Performance Optimization

### Development Performance
\`\`\`bash
# Use faster file watcher
export CHOKIDAR_USEPOLLING=true

# Increase file watcher limits
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Use turbo for faster builds
pnpm add -D turbo
\`\`\`

### Bundle Analysis
\`\`\`bash
# Analyze bundle size
cd apps/web
ANALYZE=true pnpm build

# View bundle analyzer report
open .next/analyze/client.html
\`\`\`

## Security Considerations

### Environment Variables
- Never commit \`.env\` files
- Use different secrets for different environments
- Rotate secrets regularly
- Use AWS Secrets Manager for production

### Dependencies
\`\`\`bash
# Check for security vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit --fix

# Update dependencies
pnpm update
\`\`\`

### Code Security
- Use TypeScript for type safety
- Validate all inputs
- Sanitize user data
- Use parameterized queries
- Implement proper authentication

## Getting Help

### Documentation
- Check the [Architecture Documentation](../architecture/)
- Read the [API Documentation](../api/)
- Review [Troubleshooting Guide](../operations/troubleshooting.md)

### Community
- **GitHub Issues** - Report bugs and request features
- **Discussions** - Ask questions and share ideas
- **Slack** - Join our development community
- **Email** - Contact the development team

### Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [AWS Documentation](https://docs.aws.amazon.com/)

## Next Steps

1. **Explore the Codebase** - Familiarize yourself with the project structure
2. **Run the Application** - Start the development environment
3. **Make Your First Change** - Follow the development workflow
4. **Write Tests** - Add tests for your changes
5. **Submit a Pull Request** - Contribute to the project

Welcome to RailConnect India development! 🚀
`;export{n as default};
