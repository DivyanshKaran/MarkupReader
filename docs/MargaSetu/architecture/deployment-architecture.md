# Deployment Architecture

## Overview

RailConnect India uses a cloud-native deployment architecture with containerization, orchestration, and infrastructure as code to ensure scalable, reliable, and maintainable deployments.

## Deployment Strategy

### Infrastructure as Code (IaC)
- **Terraform**: Infrastructure provisioning and management
- **AWS CloudFormation**: AWS-specific resource management
- **Kubernetes**: Container orchestration
- **Helm**: Package management for Kubernetes

### CI/CD Pipeline
- **GitHub Actions**: Continuous integration and deployment
- **Docker**: Containerization
- **AWS ECR**: Container registry
- **AWS ECS/Fargate**: Container orchestration
- **AWS CodeDeploy**: Deployment automation

## Containerization

### Docker Configuration

#### Multi-stage Dockerfile
```dockerfile
# Dockerfile for Node.js application
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose for Development
```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@db:5432/railconnect
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./apps/web:/app
      - /app/node_modules
      - /app/.next

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@db:5432/railconnect
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./apps/api:/app
      - /app/node_modules

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=railconnect
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  neo4j:
    image: neo4j:5-community
    environment:
      - NEO4J_AUTH=neo4j/password
      - NEO4J_PLUGINS=["apoc"]
    ports:
      - "7474:7474"
      - "7687:7687"
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs

volumes:
  postgres_data:
  redis_data:
  neo4j_data:
  neo4j_logs:
```

### Container Security

#### Security Scanning
```yaml
# .github/workflows/security.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t railconnect/web:latest ./apps/web
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'railconnect/web:latest'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

## Kubernetes Deployment

### Cluster Configuration

#### EKS Cluster Setup
```typescript
// infrastructure/kubernetes/cluster.ts
import * as eks from '@aws-cdk/aws-eks';
import * as ec2 from '@aws-cdk/aws-ec2';

export class EKSCluster extends eks.Cluster {
  constructor(scope: Construct, id: string, props: EKSClusterProps) {
    super(scope, id, {
      version: eks.KubernetesVersion.V1_28,
      vpc: props.vpc,
      vpcSubnets: [
        { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      ],
      defaultCapacity: 2,
      defaultCapacityInstance: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      endpointAccess: eks.EndpointAccess.PRIVATE,
      clusterLogging: [
        eks.ClusterLoggingTypes.API,
        eks.ClusterLoggingTypes.AUDIT,
        eks.ClusterLoggingTypes.AUTHENTICATOR,
        eks.ClusterLoggingTypes.CONTROLLER_MANAGER,
        eks.ClusterLoggingTypes.SCHEDULER,
      ],
    });

    this.addNodeGroup('railconnect-nodes', {
      instanceTypes: [ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE)],
      minSize: 2,
      maxSize: 10,
      desiredSize: 3,
      nodeGroupCapacityType: eks.CapacityType.ON_DEMAND,
    });
  }
}
```

#### Namespace Configuration
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: railconnect
  labels:
    name: railconnect
    environment: production
---
apiVersion: v1
kind: ResourceQuota
metadata:
  name: railconnect-quota
  namespace: railconnect
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "20"
    services: "10"
    persistentvolumeclaims: "5"
```

### Application Deployment

#### Web Application Deployment
```yaml
# k8s/web-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: railconnect-web
  namespace: railconnect
  labels:
    app: railconnect-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: railconnect-web
  template:
    metadata:
      labels:
        app: railconnect-web
    spec:
      containers:
      - name: web
        image: railconnect/web:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          runAsUser: 1001
          capabilities:
            drop:
            - ALL
---
apiVersion: v1
kind: Service
metadata:
  name: railconnect-web-service
  namespace: railconnect
spec:
  selector:
    app: railconnect-web
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

#### API Service Deployment
```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: railconnect-api
  namespace: railconnect
  labels:
    app: railconnect-api
spec:
  replicas: 5
  selector:
    matchLabels:
      app: railconnect-api
  template:
    metadata:
      labels:
        app: railconnect-api
    spec:
      containers:
      - name: api
        image: railconnect/api:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: railconnect-api-service
  namespace: railconnect
spec:
  selector:
    app: railconnect-api
  ports:
  - port: 80
    targetPort: 3001
  type: ClusterIP
```

### Auto-scaling Configuration

#### Horizontal Pod Autoscaler
```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: railconnect-web-hpa
  namespace: railconnect
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: railconnect-web
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: railconnect-api-hpa
  namespace: railconnect
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: railconnect-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Vertical Pod Autoscaler
```yaml
# k8s/vpa.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: railconnect-web-vpa
  namespace: railconnect
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: railconnect-web
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: web
      minAllowed:
        cpu: 100m
        memory: 128Mi
      maxAllowed:
        cpu: 1000m
        memory: 1Gi
      controlledResources: ["cpu", "memory"]
---
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: railconnect-api-vpa
  namespace: railconnect
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: railconnect-api
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: api
      minAllowed:
        cpu: 200m
        memory: 256Mi
      maxAllowed:
        cpu: 2000m
        memory: 2Gi
      controlledResources: ["cpu", "memory"]
```

## AWS Infrastructure

### ECS/Fargate Deployment

#### Task Definition
```json
{
  "family": "railconnect-web",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "railconnect-web",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/railconnect/web:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:railconnect/database-url"
        },
        {
          "name": "REDIS_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:railconnect/redis-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/railconnect-web",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

#### Service Configuration
```json
{
  "serviceName": "railconnect-web-service",
  "cluster": "railconnect-cluster",
  "taskDefinition": "railconnect-web",
  "desiredCount": 3,
  "launchType": "FARGATE",
  "platformVersion": "LATEST",
  "networkConfiguration": {
    "awsvpcConfiguration": {
      "subnets": [
        "subnet-12345678",
        "subnet-87654321"
      ],
      "securityGroups": [
        "sg-12345678"
      ],
      "assignPublicIp": "DISABLED"
    }
  },
  "loadBalancers": [
    {
      "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/railconnect-web-tg/1234567890123456",
      "containerName": "railconnect-web",
      "containerPort": 3000
    }
  ],
  "deploymentConfiguration": {
    "maximumPercent": 200,
    "minimumHealthyPercent": 50,
    "deploymentCircuitBreaker": {
      "enable": true,
      "rollback": true
    }
  },
  "healthCheckGracePeriodSeconds": 60,
  "enableExecuteCommand": true
}
```

### Load Balancer Configuration

#### Application Load Balancer
```yaml
# infrastructure/load-balancer.yaml
Resources:
  RailConnectALB:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: railconnect-alb
      Scheme: internet-facing
      Type: application
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
      SecurityGroups:
        - !Ref ALBSecurityGroup
      Tags:
        - Key: Name
          Value: railconnect-alb
        - Key: Environment
          Value: !Ref Environment

  ALBSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for ALB
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0
      Tags:
        - Key: Name
          Value: railconnect-alb-sg

  WebTargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Name: railconnect-web-tg
      Port: 3000
      Protocol: HTTP
      VpcId: !Ref VPC
      TargetType: ip
      HealthCheckPath: /health
      HealthCheckProtocol: HTTP
      HealthCheckIntervalSeconds: 30
      HealthCheckTimeoutSeconds: 5
      HealthyThresholdCount: 2
      UnhealthyThresholdCount: 3
      Tags:
        - Key: Name
          Value: railconnect-web-tg

  APITargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Name: railconnect-api-tg
      Port: 3001
      Protocol: HTTP
      VpcId: !Ref VPC
      TargetType: ip
      HealthCheckPath: /health
      HealthCheckProtocol: HTTP
      HealthCheckIntervalSeconds: 30
      HealthCheckTimeoutSeconds: 5
      HealthyThresholdCount: 2
      UnhealthyThresholdCount: 3
      Tags:
        - Key: Name
          Value: railconnect-api-tg

  WebListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref WebTargetGroup
      LoadBalancerArn: !Ref RailConnectALB
      Port: 80
      Protocol: HTTP

  APIListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    Properties:
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref APITargetGroup
      LoadBalancerArn: !Ref RailConnectALB
      Port: 80
      Protocol: HTTP
      Conditions:
        - Field: path-pattern
          Values: ["/api/*"]
```

## CI/CD Pipeline

### GitHub Actions Workflow

#### Build and Deploy Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECR_REGISTRY: 123456789012.dkr.ecr.us-east-1.amazonaws.com
  ECS_SERVICE: railconnect-web-service
  ECS_CLUSTER: railconnect-cluster
  ECS_TASK_DEFINITION: railconnect-web

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: ${{ env.AWS_REGION }}

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

    - name: Build, tag, and push image to Amazon ECR
      id: build-image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        # Build a docker container and push it to ECR
        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./apps/web
        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
        echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

    - name: Fill in the new image ID in the Amazon ECS task definition
      id: task-def
      uses: aws-actions/amazon-ecs-render-task-definition@v1
      with:
        task-definition: task-definition.json
        container-name: railconnect-web
        image: ${{ steps.build-image.outputs.image }}

    - name: Deploy Amazon ECS task definition
      uses: aws-actions/amazon-ecs-deploy-task-definition@v1
      with:
        task-definition: ${{ steps.task-def.outputs.task-definition }}
        service: ${{ env.ECS_SERVICE }}
        cluster: ${{ env.ECS_CLUSTER }}
        wait-for-service-stability: true

    - name: Run smoke tests
      run: |
        # Wait for deployment to complete
        sleep 60
        
        # Run smoke tests
        curl -f https://railconnect.com/health || exit 1
        curl -f https://railconnect.com/api/health || exit 1

    - name: Notify deployment status
      if: always()
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

#### Database Migration Pipeline
```yaml
# .github/workflows/migrate.yml
name: Database Migration

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1

    - name: Install Flyway
      run: |
        wget -qO- https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/9.0.0/flyway-commandline-9.0.0-linux-x64.tar.gz | tar xvz
        sudo ln -s `pwd`/flyway-9.0.0/flyway /usr/local/bin

    - name: Run database migrations
      run: |
        flyway -url=${{ secrets.DATABASE_URL }} \
               -user=${{ secrets.DATABASE_USER }} \
               -password=${{ secrets.DATABASE_PASSWORD }} \
               -locations=filesystem:./database/migrations \
               migrate

    - name: Verify migration
      run: |
        flyway -url=${{ secrets.DATABASE_URL }} \
               -user=${{ secrets.DATABASE_USER }} \
               -password=${{ secrets.DATABASE_PASSWORD }} \
               info
```

### Blue-Green Deployment

#### Blue-Green Deployment Script
```bash
#!/bin/bash
# scripts/blue-green-deploy.sh

set -e

ENVIRONMENT=${1:-staging}
SERVICE_NAME=${2:-railconnect-web}
CLUSTER_NAME="railconnect-cluster"

echo "Starting blue-green deployment for $SERVICE_NAME in $ENVIRONMENT"

# Get current task definition
CURRENT_TASK_DEF=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --query 'services[0].taskDefinition' \
  --output text)

echo "Current task definition: $CURRENT_TASK_DEF"

# Create new task definition with new image
NEW_TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition $CURRENT_TASK_DEF \
  --query 'taskDefinition' > /tmp/task-def.json)

# Update image in task definition
sed -i "s|railconnect/web:.*|railconnect/web:$IMAGE_TAG|g" /tmp/task-def.json

# Register new task definition
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
  --cli-input-json file:///tmp/task-def.json \
  --query 'taskDefinition.taskDefinitionArn' \
  --output text)

echo "New task definition: $NEW_TASK_DEF_ARN"

# Update service with new task definition
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition $NEW_TASK_DEF_ARN

# Wait for deployment to complete
echo "Waiting for deployment to complete..."
aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME

# Run health checks
echo "Running health checks..."
HEALTH_CHECK_URL="https://railconnect.com/health"
for i in {1..30}; do
  if curl -f $HEALTH_CHECK_URL; then
    echo "Health check passed"
    break
  fi
  echo "Health check failed, retrying in 10 seconds..."
  sleep 10
done

# If health checks fail, rollback
if ! curl -f $HEALTH_CHECK_URL; then
  echo "Health checks failed, rolling back..."
  aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --task-definition $CURRENT_TASK_DEF
  exit 1
fi

echo "Blue-green deployment completed successfully"
```

## Monitoring and Observability

### Prometheus Configuration

#### Prometheus Setup
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'railconnect-web'
    static_configs:
      - targets: ['railconnect-web:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'railconnect-api'
    static_configs:
      - targets: ['railconnect-api:3001']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'kubernetes'
    kubernetes_sd_configs:
      - role: endpoints
    relabel_configs:
      - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
        action: keep
        regex: railconnect;.*;http
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "id": null,
    "title": "RailConnect India - Production Dashboard",
    "tags": ["railconnect", "production"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "id": 2,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "id": 3,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ]
      },
      {
        "id": 4,
        "title": "CPU Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(container_cpu_usage_seconds_total[5m])",
            "legendFormat": "{{pod}}"
          }
        ]
      },
      {
        "id": 5,
        "title": "Memory Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "container_memory_usage_bytes",
            "legendFormat": "{{pod}}"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

### Logging Configuration

#### Fluentd Configuration
```yaml
# monitoring/fluentd-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
  namespace: railconnect
data:
  fluent.conf: |
    <source>
      @type tail
      path /var/log/containers/*railconnect*.log
      pos_file /var/log/fluentd-containers.log.pos
      tag kubernetes.*
      format json
      time_key time
      time_format %Y-%m-%dT%H:%M:%S.%NZ
    </source>

    <filter kubernetes.**>
      @type kubernetes_metadata
    </filter>

    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch.logging.svc.cluster.local
      port 9200
      index_name railconnect-logs
      type_name _doc
      include_tag_key true
      tag_key @log_name
      flush_interval 1s
    </match>
```

## Disaster Recovery

### Backup Strategy

#### Database Backup
```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="railconnect_prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Full backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/full_backup_$DATE.dump"

# Upload to S3
aws s3 cp "$BACKUP_DIR/full_backup_$DATE.dump" \
  s3://railconnect-backups/database/full_backup_$DATE.dump

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.dump" -mtime +30 -delete

echo "Database backup completed: full_backup_$DATE.dump"
```

#### Application Backup
```bash
#!/bin/bash
# scripts/backup-application.sh

set -e

BACKUP_DIR="/backups/application"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application code
tar -czf "$BACKUP_DIR/app_code_$DATE.tar.gz" \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=.next \
  /app

# Backup configuration files
tar -czf "$BACKUP_DIR/config_$DATE.tar.gz" \
  /etc/railconnect

# Upload to S3
aws s3 cp "$BACKUP_DIR/app_code_$DATE.tar.gz" \
  s3://railconnect-backups/application/app_code_$DATE.tar.gz

aws s3 cp "$BACKUP_DIR/config_$DATE.tar.gz" \
  s3://railconnect-backups/application/config_$DATE.tar.gz

# Cleanup old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Application backup completed"
```

### Recovery Procedures

#### Database Recovery
```bash
#!/bin/bash
# scripts/restore-database.sh

set -e

BACKUP_FILE=${1:-"latest"}
DB_NAME="railconnect_prod"

if [ "$BACKUP_FILE" = "latest" ]; then
  # Get latest backup from S3
  BACKUP_FILE=$(aws s3 ls s3://railconnect-backups/database/ | \
    grep "full_backup_" | \
    sort | \
    tail -n 1 | \
    awk '{print $4}')
  
  # Download backup
  aws s3 cp "s3://railconnect-backups/database/$BACKUP_FILE" "/tmp/$BACKUP_FILE"
  BACKUP_FILE="/tmp/$BACKUP_FILE"
fi

echo "Restoring database from: $BACKUP_FILE"

# Stop application
kubectl scale deployment railconnect-api --replicas=0 -n railconnect

# Restore database
pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME \
  --clean --if-exists \
  "$BACKUP_FILE"

# Start application
kubectl scale deployment railconnect-api --replicas=3 -n railconnect

echo "Database restoration completed"
```

---

This deployment architecture provides a robust, scalable, and maintainable foundation for deploying RailConnect India. The combination of containerization, orchestration, and infrastructure as code ensures consistent deployments across environments while maintaining high availability and performance.
