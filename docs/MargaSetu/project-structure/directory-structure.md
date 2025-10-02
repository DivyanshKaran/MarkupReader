# Directory Structure

## Overview

RailConnect India follows a monorepo structure using pnpm workspaces and Turborepo for efficient package management and build orchestration. The project is organized into logical sections for better maintainability and scalability.

## Root Directory Structure

```
railconnect-india/
├── apps/                          # Applications
│   ├── web/                      # Next.js web application
│   ├── api/                      # Main API service
│   ├── api-gateway/              # API Gateway service
│   ├── route-service/            # Route planning service
│   ├── tracking-service/         # Real-time tracking service
│   ├── payment-service/          # Payment processing service
│   └── notification-service/     # Notification service
├── packages/                     # Shared packages
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   ├── ui-components/            # Shared UI components
│   ├── config/                   # Configuration files
│   └── security/                 # Security utilities
├── database/                     # Database configurations
│   ├── postgresql/               # PostgreSQL setup
│   ├── neo4j/                    # Neo4j setup
│   ├── redis/                    # Redis setup
│   ├── mongodb/                  # MongoDB setup
│   ├── elasticsearch/            # Elasticsearch setup
│   └── scripts/                  # Database scripts
├── infrastructure/               # Infrastructure as Code
│   ├── terraform/                # Terraform configurations
│   └── scripts/                  # Deployment scripts
├── tests/                        # Test files
│   ├── integration/              # Integration tests
│   ├── e2e/                      # End-to-end tests
│   ├── load/                     # Load testing scripts
│   └── security/                 # Security testing
├── docs/                         # Documentation
├── scripts/                      # Build and utility scripts
├── .github/                      # GitHub Actions workflows
├── docker-compose.yml            # Local development setup
├── package.json                  # Root package.json
├── pnpm-workspace.yaml           # pnpm workspace configuration
├── turbo.json                    # Turborepo configuration
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
├── README.md                     # Project overview
└── LICENSE                       # License file
```

## Applications (`apps/`)

### Web Application (`apps/web/`)

```
apps/web/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Auth route group
│   │   ├── (dashboard)/         # Dashboard route group
│   │   ├── api/                 # API routes
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/              # React components
│   │   ├── ui/                  # Base UI components
│   │   ├── forms/               # Form components
│   │   ├── layout/              # Layout components
│   │   ├── search/              # Search components
│   │   ├── booking/             # Booking components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── performance/         # Performance components
│   │   └── __tests__/           # Component tests
│   ├── hooks/                   # Custom React hooks
│   ├── stores/                  # Zustand stores
│   ├── utils/                   # Utility functions
│   ├── types/                   # TypeScript types
│   ├── styles/                  # CSS and styling
│   ├── mocks/                   # Mock data and handlers
│   └── lib/                     # Library configurations
├── public/                      # Static assets
├── tests/                       # Test files
├── jest.config.js               # Jest configuration
├── jest.setup.js                # Jest setup
├── next.config.js               # Next.js configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── README.md                    # Web app documentation
```

### API Services

#### Main API Service (`apps/api/`)

```
apps/api/
├── src/
│   ├── controllers/             # Request handlers
│   ├── services/                # Business logic
│   ├── models/                  # Data models
│   ├── middleware/              # Express middleware
│   ├── routes/                  # API routes
│   ├── utils/                   # Utility functions
│   ├── types/                   # TypeScript types
│   ├── config/                  # Configuration
│   ├── test/                    # Test setup
│   └── index.ts                 # Application entry point
├── tests/                       # Test files
├── vitest.config.ts             # Vitest configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── README.md                    # API documentation
```

#### API Gateway (`apps/api-gateway/`)

```
apps/api-gateway/
├── src/
│   ├── middleware/              # Gateway middleware
│   │   ├── auth.ts              # Authentication
│   │   ├── rateLimit.ts         # Rate limiting
│   │   ├── validation.ts        # Request validation
│   │   ├── logging.ts           # Request logging
│   │   ├── monitoring.ts        # Metrics collection
│   │   ├── security.ts          # Security headers
│   │   ├── csrf.ts              # CSRF protection
│   │   └── xss.ts               # XSS prevention
│   ├── services/                # Gateway services
│   │   ├── redis.ts             # Redis client
│   │   ├── device.ts            # Device fingerprinting
│   │   └── circuitBreaker.ts    # Circuit breaker
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Utility functions
│   └── index.ts                 # Gateway entry point
├── tests/                       # Test files
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── README.md                    # Gateway documentation
```

#### Route Service (`apps/route-service/`)

```
apps/route-service/
├── src/
│   ├── algorithms/              # Route finding algorithms
│   │   ├── routeFinder.ts       # A* and Dijkstra
│   │   └── priorityQueue.ts     # Priority queue
│   ├── database/                # Neo4j database
│   │   └── neo4j.ts             # Database connection
│   ├── services/                # Business services
│   │   ├── cache.ts             # Caching service
│   │   ├── businessLogic.ts     # Business rules
│   │   └── monitoring.ts        # Performance monitoring
│   ├── routes/                  # API routes
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Utility functions
│   └── index.ts                 # Service entry point
├── tests/                       # Test files
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── README.md                    # Route service documentation
```

#### Tracking Service (`apps/tracking-service/`)

```
apps/tracking-service/
├── src/
│   ├── services/                # Tracking services
│   │   ├── socketService.ts     # WebSocket service
│   │   ├── authService.ts       # Authentication
│   │   ├── roomService.ts       # Room management
│   │   ├── messageQueue.ts      # Message queuing
│   │   ├── compressionService.ts # Message compression
│   │   └── dataIngestion.ts     # Data ingestion
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Utility functions
│   └── index.ts                 # Service entry point
├── tests/                       # Test files
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── README.md                    # Tracking service documentation
```

#### Payment Service (`apps/payment-service/`)

```
apps/payment-service/
├── src/
│   ├── services/                # Payment services
│   │   ├── razorpayService.ts   # Razorpay integration
│   │   ├── payuService.ts       # PayU integration
│   │   ├── stripeService.ts     # Stripe integration
│   │   ├── fraudDetection.ts    # Fraud detection
│   │   ├── paymentService.ts    # Payment orchestration
│   │   ├── reconciliation.ts    # Payment reconciliation
│   │   └── monitoring.ts        # Payment monitoring
│   ├── routes/                  # API routes
│   │   ├── payments.ts          # Payment endpoints
│   │   └── webhooks.ts          # Webhook handlers
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Utility functions
│   └── index.ts                 # Service entry point
├── tests/                       # Test files
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── README.md                    # Payment service documentation
```

#### Notification Service (`apps/notification-service/`)

```
apps/notification-service/
├── src/
│   ├── services/                # Notification services
│   │   ├── queueService.ts      # Message queuing
│   │   ├── emailService.ts      # Email notifications
│   │   ├── smsService.ts        # SMS notifications
│   │   ├── pushService.ts       # Push notifications
│   │   ├── whatsappService.ts   # WhatsApp notifications
│   │   ├── inAppService.ts      # In-app notifications
│   │   └── templateService.ts   # Template management
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Utility functions
│   └── index.ts                 # Service entry point
├── tests/                       # Test files
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── README.md                    # Notification service documentation
```

## Shared Packages (`packages/`)

### Types Package (`packages/types/`)

```
packages/types/
├── src/
│   ├── auth.ts                  # Authentication types
│   ├── user.ts                  # User types
│   ├── train.ts                 # Train types
│   ├── booking.ts               # Booking types
│   ├── payment.ts               # Payment types
│   ├── notification.ts          # Notification types
│   ├── tracking.ts              # Tracking types
│   ├── api.ts                   # API types
│   └── index.ts                 # Type exports
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── README.md                    # Types documentation
```

### Utils Package (`packages/utils/`)

```
packages/utils/
├── src/
│   ├── validation.ts            # Validation utilities
│   ├── formatting.ts            # Data formatting
│   ├── date.ts                  # Date utilities
│   ├── string.ts                # String utilities
│   ├── array.ts                 # Array utilities
│   ├── object.ts                # Object utilities
│   ├── crypto.ts                # Cryptographic utilities
│   └── index.ts                 # Utility exports
├── tests/                       # Test files
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── README.md                    # Utils documentation
```

### UI Components Package (`packages/ui-components/`)

```
packages/ui-components/
├── src/
│   ├── components/              # UI components
│   │   ├── Button/              # Button component
│   │   ├── Input/               # Input component
│   │   ├── Modal/               # Modal component
│   │   ├── Card/                # Card component
│   │   ├── Table/               # Table component
│   │   ├── Form/                # Form components
│   │   └── Layout/              # Layout components
│   ├── hooks/                   # Custom hooks
│   ├── styles/                  # Component styles
│   └── index.ts                 # Component exports
├── stories/                     # Storybook stories
├── tests/                       # Test files
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── README.md                    # UI components documentation
```

### Config Package (`packages/config/`)

```
packages/config/
├── src/
│   ├── database.ts              # Database configuration
│   ├── redis.ts                 # Redis configuration
│   ├── jwt.ts                   # JWT configuration
│   ├── email.ts                 # Email configuration
│   ├── payment.ts               # Payment configuration
│   ├── aws.ts                   # AWS configuration
│   └── index.ts                 # Configuration exports
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── README.md                    # Config documentation
```

### Security Package (`packages/security/`)

```
packages/security/
├── src/
│   ├── services/                # Security services
│   │   ├── oauth2.ts            # OAuth 2.0 service
│   │   ├── biometric.ts         # Biometric authentication
│   │   ├── mfa.ts               # Multi-factor authentication
│   │   ├── session.ts           # Session management
│   │   ├── password.ts          # Password security
│   │   ├── jwt.ts               # JWT service
│   │   ├── encryption.ts        # Encryption service
│   │   ├── secrets.ts           # Secrets management
│   │   └── securityEvents.ts    # Security event logging
│   ├── middleware/              # Security middleware
│   │   ├── rateLimiting.ts      # Rate limiting
│   │   ├── security.ts          # Security headers
│   │   └── validation.ts        # Input validation
│   ├── types/                   # Security types
│   ├── utils/                   # Security utilities
│   └── index.ts                 # Security exports
├── tests/                       # Test files
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
└── README.md                    # Security documentation
```

## Database Configurations (`database/`)

```
database/
├── postgresql/                  # PostgreSQL setup
│   ├── schema.sql               # Database schema
│   ├── postgresql.conf          # PostgreSQL configuration
│   └── pgbouncer.ini            # PgBouncer configuration
├── neo4j/                       # Neo4j setup
│   ├── neo4j.conf               # Neo4j configuration
│   └── schema.cypher            # Graph schema
├── redis/                       # Redis setup
│   ├── redis.conf               # Redis configuration
│   └── sentinel.conf            # Redis Sentinel configuration
├── mongodb/                     # MongoDB setup
│   ├── mongod.conf              # MongoDB configuration
│   └── schema.js                # MongoDB schema
├── elasticsearch/               # Elasticsearch setup
│   ├── elasticsearch.yml        # Elasticsearch configuration
│   └── indices.json             # Index templates
├── scripts/                     # Database scripts
│   ├── setup.sh                 # Database setup
│   ├── migrate.sh               # Migration scripts
│   └── seed.sh                  # Data seeding
└── docker-compose.yml           # Database services
```

## Infrastructure (`infrastructure/`)

```
infrastructure/
├── terraform/                   # Terraform configurations
│   ├── main.tf                  # Main Terraform file
│   ├── variables.tf             # Input variables
│   ├── outputs.tf               # Output values
│   ├── versions.tf              # Provider versions
│   ├── terraform.tfvars.example # Example variables
│   └── modules/                 # Terraform modules
│       ├── vpc/                 # VPC module
│       ├── ecs/                 # ECS module
│       ├── rds/                 # RDS module
│       ├── elasticache/         # ElastiCache module
│       ├── s3/                  # S3 module
│       ├── api_gateway/         # API Gateway module
│       └── monitoring/          # Monitoring module
└── scripts/                     # Deployment scripts
    ├── deploy.sh                # Deployment script
    ├── rollback.sh              # Rollback script
    └── health-check.sh          # Health check script
```

## Tests (`tests/`)

```
tests/
├── integration/                 # Integration tests
│   ├── api.test.ts              # API integration tests
│   ├── websocket.test.ts        # WebSocket tests
│   └── database.test.ts         # Database tests
├── e2e/                         # End-to-end tests
│   ├── tests/                   # Test files
│   ├── pages/                   # Page objects
│   ├── fixtures/                # Test fixtures
│   ├── playwright.config.ts     # Playwright configuration
│   ├── global-setup.ts          # Global setup
│   └── global-teardown.ts       # Global teardown
├── load/                        # Load testing
│   └── k6-scripts/              # K6 load test scripts
│       ├── api-load-test.js     # API load tests
│       ├── websocket-load-test.js # WebSocket load tests
│       └── database-load-test.js # Database load tests
└── security/                    # Security testing
    ├── owasp-zap-scan.js        # OWASP ZAP scanning
    ├── penetration-tests.js     # Penetration tests
    └── security-validation.js   # Security validation
```

## Configuration Files

### Root Configuration

```
railconnect-india/
├── package.json                 # Root package.json
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── turbo.json                   # Turborepo configuration
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── .eslintrc.js                 # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── tsconfig.json                # Root TypeScript configuration
├── docker-compose.yml           # Local development setup
├── docker-compose.test.yml      # Test environment setup
└── README.md                    # Project overview
```

### GitHub Actions (`.github/`)

```
.github/
├── workflows/                   # GitHub Actions workflows
│   ├── build.yml                # Build pipeline
│   ├── test.yml                 # Test pipeline
│   ├── deploy.yml               # Deployment pipeline
│   ├── security.yml             # Security pipeline
│   └── release.yml              # Release pipeline
├── dependabot.yml               # Dependabot configuration
└── ISSUE_TEMPLATE/              # Issue templates
    ├── bug_report.md            # Bug report template
    ├── feature_request.md       # Feature request template
    └── security_report.md       # Security report template
```

## Scripts (`scripts/`)

```
scripts/
├── performance-budget.js        # Performance budget checking
├── bundle-analyzer.js           # Bundle analysis
├── database-optimizer.js        # Database optimization
├── memory-profiler.js           # Memory profiling
├── performance-monitor.sh       # Performance monitoring
└── optimize.sh                  # Optimization script
```

## Documentation (`docs/`)

```
docs/
├── README.md                    # Documentation index
├── architecture/                # Architecture documentation
│   ├── system-architecture.md   # System architecture
│   ├── database-architecture.md # Database architecture
│   ├── api-architecture.md      # API architecture
│   └── security-architecture.md # Security architecture
├── project-structure/           # Project structure documentation
│   ├── directory-structure.md   # Directory structure
│   ├── monorepo-management.md   # Monorepo management
│   └── code-organization.md     # Code organization
├── deployment/                  # Deployment documentation
│   ├── deployment-guide.md      # Deployment guide
│   ├── aws-infrastructure.md    # AWS infrastructure
│   ├── docker-configuration.md  # Docker configuration
│   └── ci-cd-pipeline.md        # CI/CD pipeline
├── development/                 # Development documentation
│   ├── development-setup.md     # Development setup
│   ├── api-documentation.md     # API documentation
│   ├── testing-guide.md         # Testing guide
│   └── performance-optimization.md # Performance optimization
├── technologies/                # Technology documentation
│   ├── technology-stack.md      # Technology stack
│   ├── frontend-technologies.md # Frontend technologies
│   ├── backend-technologies.md  # Backend technologies
│   ├── database-technologies.md # Database technologies
│   └── devops-tools.md          # DevOps tools
├── monitoring/                  # Monitoring documentation
│   ├── monitoring-setup.md      # Monitoring setup
│   ├── performance-monitoring.md # Performance monitoring
│   └── security-monitoring.md   # Security monitoring
├── security/                    # Security documentation
│   ├── security-implementation.md # Security implementation
│   ├── authentication-authorization.md # Authentication & authorization
│   └── data-protection.md       # Data protection
├── features/                    # Features documentation
│   ├── core-features.md         # Core features
│   ├── user-management.md       # User management
│   ├── train-search-booking.md  # Train search & booking
│   ├── payment-processing.md    # Payment processing
│   └── real-time-features.md    # Real-time features
├── troubleshooting/             # Troubleshooting documentation
│   ├── common-issues.md         # Common issues
│   ├── debugging-guide.md       # Debugging guide
│   └── performance-issues.md    # Performance issues
└── scaling/                     # Scaling documentation
    ├── scaling-strategies.md    # Scaling strategies
    ├── caching-strategies.md    # Caching strategies
    └── database-optimization.md # Database optimization
```

## Key Design Principles

### 1. Monorepo Structure
- **Single Repository**: All code in one repository for better collaboration
- **Workspace Management**: pnpm workspaces for efficient package management
- **Build Orchestration**: Turborepo for optimized build pipelines
- **Shared Dependencies**: Common dependencies managed at root level

### 2. Microservices Architecture
- **Service Separation**: Each service has a specific responsibility
- **Independent Deployment**: Services can be deployed independently
- **Technology Flexibility**: Different services can use different technologies
- **Scalability**: Services can be scaled independently

### 3. Shared Packages
- **Code Reuse**: Common code shared across applications
- **Type Safety**: Shared TypeScript types for consistency
- **Utility Functions**: Common utilities for all services
- **UI Components**: Reusable UI components

### 4. Configuration Management
- **Environment Variables**: Centralized environment configuration
- **Infrastructure as Code**: Terraform for infrastructure management
- **Docker**: Containerization for consistent deployments
- **CI/CD**: Automated testing and deployment

### 5. Testing Strategy
- **Unit Tests**: Component and service level testing
- **Integration Tests**: API and database integration testing
- **E2E Tests**: End-to-end user journey testing
- **Load Tests**: Performance and scalability testing
- **Security Tests**: Security vulnerability testing

## File Naming Conventions

### 1. Files and Directories
- **kebab-case**: For directories and file names
- **PascalCase**: For React components
- **camelCase**: For JavaScript/TypeScript files
- **UPPER_CASE**: For environment variables and constants

### 2. Code Organization
- **Barrel Exports**: Use `index.ts` files for clean imports
- **Feature-based**: Group related functionality together
- **Layer-based**: Separate concerns (controllers, services, models)
- **Test Co-location**: Keep tests close to the code they test

### 3. Import/Export Patterns
- **Named Exports**: Prefer named exports over default exports
- **Barrel Imports**: Use index files for clean import statements
- **Relative Imports**: Use relative imports within the same package
- **Absolute Imports**: Use absolute imports for cross-package imports

## Best Practices

### 1. Code Organization
- Keep related functionality together
- Use clear and descriptive names
- Follow consistent patterns across the codebase
- Maintain separation of concerns

### 2. Package Management
- Use workspace dependencies for internal packages
- Keep external dependencies up to date
- Use exact versions for critical dependencies
- Regular dependency audits and updates

### 3. Build and Deployment
- Use Turborepo for efficient builds
- Implement proper caching strategies
- Use Docker for consistent environments
- Automate testing and deployment

### 4. Documentation
- Keep documentation up to date
- Use clear and concise language
- Include examples and code snippets
- Document architectural decisions

This directory structure provides a solid foundation for a scalable and maintainable train routing application. The modular design allows for independent development and deployment while maintaining code quality and consistency across the entire project.
