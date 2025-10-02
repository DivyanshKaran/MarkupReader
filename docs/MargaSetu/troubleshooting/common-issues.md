# Common Issues & Troubleshooting

## Overview

This guide provides solutions to common issues encountered during development, deployment, and operation of RailConnect India. Each issue includes detailed troubleshooting steps and preventive measures.

## Development Issues

### 1. Build and Compilation Errors

#### TypeScript Compilation Errors
**Problem**: TypeScript compilation fails with type errors
```
error TS2307: Cannot find module '@railconnect/types' or its corresponding type declarations.
```

**Solution**:
```bash
# Check if packages are properly linked
pnpm list --depth=0

# Reinstall dependencies
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install

# Check TypeScript configuration
npx tsc --noEmit

# Verify package exports
cat packages/types/package.json
```

**Prevention**:
- Ensure all packages are properly configured in `package.json`
- Use consistent TypeScript versions across packages
- Check import paths and module resolution

#### Next.js Build Errors
**Problem**: Next.js build fails with module resolution errors
```
Module not found: Can't resolve '@railconnect/ui-components'
```

**Solution**:
```bash
# Check Next.js configuration
cat apps/web/next.config.js

# Verify module resolution
npx next build --debug

# Check package.json dependencies
cat apps/web/package.json

# Rebuild packages
pnpm build --filter=@railconnect/ui-components
```

**Prevention**:
- Use proper import paths
- Ensure all dependencies are declared
- Check Next.js configuration for module resolution

#### Docker Build Errors
**Problem**: Docker build fails with dependency issues
```
npm ERR! peer dep missing: react@^18.0.0, required by @railconnect/ui-components@0.1.0
```

**Solution**:
```bash
# Check Dockerfile
cat apps/web/Dockerfile

# Build with verbose output
docker build -t railconnect/web:latest -f apps/web/Dockerfile . --no-cache

# Check package.json in container
docker run --rm railconnect/web:latest cat package.json

# Fix dependency issues
# Update package.json with correct peer dependencies
```

**Prevention**:
- Use multi-stage builds
- Install dependencies in correct order
- Check peer dependency requirements

### 2. Database Connection Issues

#### PostgreSQL Connection Errors
**Problem**: Cannot connect to PostgreSQL database
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**:
```bash
# Check if PostgreSQL is running
docker-compose -f database/docker-compose.yml ps

# Check PostgreSQL logs
docker-compose -f database/docker-compose.yml logs postgres

# Restart PostgreSQL
docker-compose -f database/docker-compose.yml restart postgres

# Check connection string
echo $DATABASE_URL

# Test connection manually
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT 1;"
```

**Prevention**:
- Use connection pooling
- Implement retry logic
- Monitor database health
- Use proper error handling

#### Redis Connection Errors
**Problem**: Cannot connect to Redis
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution**:
```bash
# Check Redis status
docker-compose -f database/docker-compose.yml ps redis

# Check Redis logs
docker-compose -f database/docker-compose.yml logs redis

# Restart Redis
docker-compose -f database/docker-compose.yml restart redis

# Test Redis connection
redis-cli -h localhost -p 6379 ping

# Check Redis configuration
redis-cli -h localhost -p 6379 config get "*"
```

**Prevention**:
- Use Redis Sentinel for high availability
- Implement connection retry logic
- Monitor Redis memory usage
- Use proper Redis configuration

#### Neo4j Connection Errors
**Problem**: Cannot connect to Neo4j
```
Error: Failed to connect to server
```

**Solution**:
```bash
# Check Neo4j status
docker-compose -f database/docker-compose.yml ps neo4j

# Check Neo4j logs
docker-compose -f database/docker-compose.yml logs neo4j

# Restart Neo4j
docker-compose -f database/docker-compose.yml restart neo4j

# Test Neo4j connection
cypher-shell -u neo4j -p password -a bolt://localhost:7687

# Check Neo4j configuration
cat database/neo4j/neo4j.conf
```

**Prevention**:
- Use proper Neo4j configuration
- Implement connection pooling
- Monitor Neo4j performance
- Use proper authentication

### 3. API and Service Issues

#### API Gateway Errors
**Problem**: API Gateway returns 502 Bad Gateway
```
502 Bad Gateway: The server returned an invalid or incomplete response
```

**Solution**:
```bash
# Check API Gateway logs
docker logs railconnect-api-gateway

# Check upstream services
curl -f http://localhost:3002/health
curl -f http://localhost:3003/health

# Check load balancer configuration
cat infrastructure/terraform/modules/api_gateway/main.tf

# Restart API Gateway
docker restart railconnect-api-gateway

# Check service discovery
curl http://localhost:3001/api/health
```

**Prevention**:
- Implement proper health checks
- Use circuit breaker pattern
- Monitor service dependencies
- Implement graceful degradation

#### Microservice Communication Errors
**Problem**: Services cannot communicate with each other
```
Error: connect ECONNREFUSED service-name:port
```

**Solution**:
```bash
# Check service discovery
docker network ls
docker network inspect railconnect_default

# Check service endpoints
curl http://localhost:3001/api/services

# Check DNS resolution
nslookup service-name

# Restart services
docker-compose restart

# Check service configuration
cat docker-compose.yml
```

**Prevention**:
- Use service discovery
- Implement proper networking
- Use health checks
- Monitor service dependencies

### 4. Authentication and Authorization Issues

#### JWT Token Errors
**Problem**: JWT token validation fails
```
Error: invalid token
```

**Solution**:
```bash
# Check JWT secret
echo $JWT_SECRET

# Verify token format
node -e "console.log(JSON.parse(Buffer.from('token'.split('.')[1], 'base64')))"

# Check token expiration
node -e "console.log(new Date(JSON.parse(Buffer.from('token'.split('.')[1], 'base64')).exp * 1000))"

# Regenerate tokens
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "your-refresh-token"}'
```

**Prevention**:
- Use secure JWT secrets
- Implement proper token rotation
- Monitor token usage
- Use short-lived access tokens

#### Permission Denied Errors
**Problem**: User gets permission denied for authorized actions
```
Error: insufficient permissions
```

**Solution**:
```bash
# Check user roles
curl -H "Authorization: Bearer token" http://localhost:3001/api/user/profile

# Check RBAC configuration
cat apps/api-gateway/src/middleware/auth.ts

# Verify permission mapping
grep -r "permissions" apps/api-gateway/src/

# Check database permissions
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT * FROM user_roles WHERE user_id = 'user-id';"
```

**Prevention**:
- Implement proper RBAC
- Use principle of least privilege
- Regular permission audits
- Implement permission caching

## Deployment Issues

### 1. Infrastructure Deployment

#### Terraform Deployment Errors
**Problem**: Terraform apply fails with resource conflicts
```
Error: resource already exists
```

**Solution**:
```bash
# Check Terraform state
terraform state list

# Import existing resource
terraform import aws_instance.example i-1234567890abcdef0

# Remove from state if not needed
terraform state rm aws_instance.example

# Plan and apply
terraform plan
terraform apply
```

**Prevention**:
- Use proper resource naming
- Implement state locking
- Use remote state storage
- Regular state cleanup

#### AWS Resource Creation Errors
**Problem**: AWS resource creation fails due to limits
```
Error: VPC limit exceeded
```

**Solution**:
```bash
# Check AWS limits
aws service-quotas get-service-quota --service-code vpc --quota-code L-F678F1CE

# Request limit increase
aws service-quotas request-service-quota-increase \
  --service-code vpc \
  --quota-code L-F678F1CE \
  --desired-value 10

# Use existing resources
terraform import aws_vpc.existing vpc-12345678
```

**Prevention**:
- Monitor AWS limits
- Use resource tagging
- Implement proper resource management
- Regular cleanup of unused resources

### 2. Container Deployment

#### ECS Deployment Errors
**Problem**: ECS service fails to start
```
Error: task failed to start
```

**Solution**:
```bash
# Check ECS service status
aws ecs describe-services --cluster railconnect-cluster --services web-service

# Check task definition
aws ecs describe-task-definition --task-definition railconnect-web:latest

# Check task logs
aws logs get-log-events --log-group-name /aws/ecs/railconnect/web --log-stream-name web-service/web-task/1234567890

# Check service events
aws ecs describe-services --cluster railconnect-cluster --services web-service --query 'services[0].events'
```

**Prevention**:
- Use proper health checks
- Implement proper logging
- Monitor resource usage
- Use proper task definitions

#### Docker Image Issues
**Problem**: Docker image fails to build or run
```
Error: failed to solve: failed to compute cache key
```

**Solution**:
```bash
# Clear Docker cache
docker system prune -a

# Build with no cache
docker build --no-cache -t railconnect/web:latest .

# Check Dockerfile
cat apps/web/Dockerfile

# Test image locally
docker run --rm railconnect/web:latest

# Check image layers
docker history railconnect/web:latest
```

**Prevention**:
- Use multi-stage builds
- Optimize Dockerfile
- Use proper base images
- Implement proper caching

### 3. Database Migration Issues

#### Migration Failures
**Problem**: Database migration fails
```
Error: migration failed: relation already exists
```

**Solution**:
```bash
# Check migration status
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT * FROM schema_migrations;"

# Rollback migration
psql -h localhost -U railconnect_user -d railconnect_dev -f rollback.sql

# Check database schema
psql -h localhost -U railconnect_user -d railconnect_dev -c "\dt"

# Re-run migration
psql -h localhost -U railconnect_user -d railconnect_dev -f migration.sql
```

**Prevention**:
- Use proper migration tools
- Implement rollback procedures
- Test migrations in staging
- Use version control for migrations

#### Data Corruption
**Problem**: Database data corruption
```
Error: checksum verification failed
```

**Solution**:
```bash
# Check database integrity
psql -h localhost -U railconnect_user -d railconnect_dev -c "VACUUM ANALYZE;"

# Check for corruption
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT * FROM pg_stat_database;"

# Restore from backup
pg_restore -h localhost -U railconnect_user -d railconnect_dev backup.sql

# Check replication status
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT * FROM pg_stat_replication;"
```

**Prevention**:
- Regular backups
- Monitor database health
- Use proper replication
- Implement data validation

## Performance Issues

### 1. Application Performance

#### Slow API Response Times
**Problem**: API endpoints respond slowly
```
Response time: 5000ms (target: <200ms)
```

**Solution**:
```bash
# Check application logs
tail -f logs/app.log

# Monitor database queries
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT * FROM pg_stat_activity;"

# Check Redis performance
redis-cli -h localhost -p 6379 --latency

# Profile application
node --prof apps/api/src/index.js

# Check memory usage
ps aux | grep node
```

**Prevention**:
- Implement proper caching
- Optimize database queries
- Use connection pooling
- Monitor performance metrics

#### High Memory Usage
**Problem**: Application consumes excessive memory
```
Memory usage: 2GB (limit: 512MB)
```

**Solution**:
```bash
# Check memory usage
ps aux | grep node

# Generate heap dump
node --heapsnapshot-signal=SIGUSR2 apps/api/src/index.js

# Analyze heap dump
node --inspect apps/api/src/index.js

# Check for memory leaks
node --trace-gc apps/api/src/index.js

# Monitor garbage collection
node --trace-gc --trace-gc-verbose apps/api/src/index.js
```

**Prevention**:
- Implement proper memory management
- Use streaming for large data
- Implement proper cleanup
- Monitor memory usage

### 2. Database Performance

#### Slow Database Queries
**Problem**: Database queries are slow
```
Query time: 5000ms (target: <100ms)
```

**Solution**:
```bash
# Check slow queries
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Analyze query plans
psql -h localhost -U railconnect_user -d railconnect_dev -c "EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';"

# Check indexes
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT * FROM pg_indexes WHERE tablename = 'users';"

# Update statistics
psql -h localhost -U railconnect_user -d railconnect_dev -c "ANALYZE;"
```

**Prevention**:
- Use proper indexing
- Optimize query plans
- Use connection pooling
- Monitor query performance

#### Database Connection Issues
**Problem**: Database connection pool exhausted
```
Error: too many connections
```

**Solution**:
```bash
# Check connection count
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT count(*) FROM pg_stat_activity;"

# Check connection limits
psql -h localhost -U railconnect_user -d railconnect_dev -c "SHOW max_connections;"

# Check PgBouncer status
psql -h localhost -U railconnect_user -d railconnect_dev -c "SHOW POOLS;"

# Restart PgBouncer
docker-compose -f database/docker-compose.yml restart pgbouncer
```

**Prevention**:
- Use connection pooling
- Implement proper connection management
- Monitor connection usage
- Use read replicas

## Security Issues

### 1. Authentication Issues

#### Login Failures
**Problem**: Users cannot log in
```
Error: invalid credentials
```

**Solution**:
```bash
# Check user account status
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT * FROM users WHERE email = 'user@example.com';"

# Check password hash
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT password_hash FROM users WHERE email = 'user@example.com';"

# Check account lockout
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT * FROM user_sessions WHERE user_id = 'user-id';"

# Reset password
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Prevention**:
- Implement proper password policies
- Use secure password hashing
- Implement account lockout
- Monitor login attempts

#### Session Management Issues
**Problem**: Sessions expire unexpectedly
```
Error: session expired
```

**Solution**:
```bash
# Check session configuration
grep -r "session" apps/api-gateway/src/

# Check Redis session storage
redis-cli -h localhost -p 6379 keys "session:*"

# Check session expiration
redis-cli -h localhost -p 6379 ttl "session:session-id"

# Check JWT expiration
node -e "console.log(new Date(JSON.parse(Buffer.from('token'.split('.')[1], 'base64')).exp * 1000))"
```

**Prevention**:
- Implement proper session management
- Use secure session storage
- Implement session refresh
- Monitor session usage

### 2. Authorization Issues

#### Permission Denied
**Problem**: Authorized users get permission denied
```
Error: insufficient permissions
```

**Solution**:
```bash
# Check user roles
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT * FROM user_roles WHERE user_id = 'user-id';"

# Check role permissions
psql -h localhost -U railconnect_user -d railconnect_dev -c "SELECT * FROM role_permissions WHERE role_id = 'role-id';"

# Check RBAC configuration
cat apps/api-gateway/src/middleware/auth.ts

# Test permissions
curl -H "Authorization: Bearer token" http://localhost:3001/api/admin/users
```

**Prevention**:
- Implement proper RBAC
- Use principle of least privilege
- Regular permission audits
- Implement permission caching

## Monitoring and Logging Issues

### 1. Logging Issues

#### Missing Logs
**Problem**: Application logs are not being generated
```
No log files found
```

**Solution**:
```bash
# Check log configuration
grep -r "winston" apps/api/src/

# Check log directory
ls -la logs/

# Check log permissions
ls -la logs/app.log

# Check log rotation
cat /etc/logrotate.d/railconnect

# Restart logging service
systemctl restart rsyslog
```

**Prevention**:
- Implement proper logging configuration
- Use structured logging
- Implement log rotation
- Monitor log disk usage

#### Log Volume Issues
**Problem**: Logs are consuming too much disk space
```
Disk usage: 95% (logs: 80%)
```

**Solution**:
```bash
# Check log sizes
du -sh logs/*

# Compress old logs
gzip logs/app.log.1

# Remove old logs
find logs/ -name "*.log.*" -mtime +30 -delete

# Configure log rotation
cat > /etc/logrotate.d/railconnect << EOF
/var/log/railconnect/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 railconnect railconnect
}
EOF
```

**Prevention**:
- Implement log rotation
- Use log compression
- Monitor disk usage
- Implement log retention policies

### 2. Monitoring Issues

#### Metrics Not Collected
**Problem**: Application metrics are not being collected
```
No metrics in Prometheus
```

**Solution**:
```bash
# Check Prometheus configuration
cat prometheus.yml

# Check metrics endpoint
curl http://localhost:3001/metrics

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Restart Prometheus
docker restart prometheus

# Check Grafana dashboards
curl http://localhost:3000/api/dashboards
```

**Prevention**:
- Implement proper metrics collection
- Use consistent metric naming
- Monitor metric collection
- Implement alerting

#### Alerting Issues
**Problem**: Alerts are not being triggered
```
No alerts for critical issues
```

**Solution**:
```bash
# Check alert rules
cat alerts.yml

# Check alert manager
curl http://localhost:9093/api/v1/alerts

# Test alert rules
promtool test rules alerts.yml

# Check notification channels
curl http://localhost:9093/api/v1/receivers
```

**Prevention**:
- Implement proper alert rules
- Test alert configurations
- Monitor alert delivery
- Implement alert escalation

## Recovery Procedures

### 1. Application Recovery

#### Service Restart
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart web-service

# Check service status
docker-compose ps

# Check service logs
docker-compose logs -f web-service
```

#### Database Recovery
```bash
# Restore from backup
pg_restore -h localhost -U railconnect_user -d railconnect_dev backup.sql

# Check database integrity
psql -h localhost -U railconnect_user -d railconnect_dev -c "VACUUM ANALYZE;"

# Rebuild indexes
psql -h localhost -U railconnect_user -d railconnect_dev -c "REINDEX DATABASE railconnect_dev;"
```

### 2. Infrastructure Recovery

#### AWS Resource Recovery
```bash
# Check resource status
aws ec2 describe-instances --instance-ids i-1234567890abcdef0

# Restart instance
aws ec2 reboot-instances --instance-ids i-1234567890abcdef0

# Check load balancer
aws elbv2 describe-load-balancers --names railconnect-alb

# Check RDS instance
aws rds describe-db-instances --db-instance-identifier railconnect-prod
```

#### Container Recovery
```bash
# Check container status
docker ps -a

# Restart container
docker restart container-id

# Check container logs
docker logs container-id

# Recreate container
docker-compose up -d --force-recreate
```

## Prevention Strategies

### 1. Proactive Monitoring
- Implement comprehensive monitoring
- Set up alerting for critical issues
- Regular health checks
- Performance monitoring

### 2. Regular Maintenance
- Regular database maintenance
- Log rotation and cleanup
- Security updates
- Dependency updates

### 3. Testing and Validation
- Regular testing of recovery procedures
- Load testing
- Security testing
- Disaster recovery testing

### 4. Documentation and Training
- Keep documentation updated
- Regular team training
- Incident response procedures
- Knowledge sharing sessions

---

This troubleshooting guide provides comprehensive solutions for common issues in RailConnect India. Regular maintenance, monitoring, and testing are essential to prevent and quickly resolve issues.
