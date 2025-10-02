const n=`# Microservices Architecture

## Overview

RailConnect India follows a microservices architecture pattern to ensure scalability, maintainability, and independent deployment of services. Each service is responsible for a specific business domain and communicates through well-defined APIs.

## Architecture Principles

### Service Decomposition
- **Domain-Driven Design**: Services are organized around business capabilities
- **Single Responsibility**: Each service has one clear purpose
- **Loose Coupling**: Services communicate through APIs, not direct database access
- **High Cohesion**: Related functionality is grouped within the same service

### Communication Patterns
- **Synchronous**: REST APIs for request-response patterns
- **Asynchronous**: Message queues for event-driven communication
- **Real-time**: WebSockets for live updates
- **Service Discovery**: Dynamic service registration and discovery

## Service Architecture

### API Gateway
**Purpose**: Single entry point for all client requests

**Responsibilities**:
- Request routing and load balancing
- Authentication and authorization
- Rate limiting and throttling
- Request/response transformation
- API versioning
- Monitoring and logging

**Technology Stack**:
- Node.js with Express
- JWT for authentication
- Redis for session management
- Prometheus for metrics
- Winston for logging

**Key Features**:
\`\`\`typescript
// Authentication middleware
app.use('/api', authenticateToken);

// Rate limiting
app.use('/api', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Request logging
app.use('/api', requestLogger);

// Error handling
app.use('/api', errorHandler);
\`\`\`

### User Service
**Purpose**: User management and authentication

**Responsibilities**:
- User registration and profile management
- Authentication and authorization
- Password management and MFA
- User preferences and settings
- KYC verification

**Database**: PostgreSQL
**API Endpoints**:
\`\`\`
POST /api/v1/users/register
POST /api/v1/users/login
GET /api/v1/users/profile
PUT /api/v1/users/profile
POST /api/v1/users/verify-email
POST /api/v1/users/verify-phone
POST /api/v1/users/enable-mfa
POST /api/v1/users/verify-mfa
\`\`\`

**Key Features**:
\`\`\`typescript
class UserService {
  async registerUser(userData: RegisterUserRequest): Promise<User> {
    // Validate input
    await this.validateUserData(userData);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    // Create user
    const user = await this.userRepository.create({
      ...userData,
      password: hashedPassword
    });
    
    // Send verification email
    await this.notificationService.sendVerificationEmail(user.email);
    
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new AuthenticationError('Invalid credentials');
    }
    
    // Generate JWT tokens
    const accessToken = this.jwtService.generateAccessToken(user);
    const refreshToken = this.jwtService.generateRefreshToken(user);
    
    // Store refresh token in Redis
    await this.redisService.set(\`refresh:\${user.id}\`, refreshToken, 7 * 24 * 60 * 60);
    
    return { user, accessToken, refreshToken };
  }
}
\`\`\`

### Route Planning Service
**Purpose**: Train route planning and optimization

**Responsibilities**:
- Route search and optimization
- Multi-criteria route planning
- Alternative route suggestions
- Route comparison and analysis
- Real-time route updates

**Database**: Neo4j (graph database)
**API Endpoints**:
\`\`\`
GET /api/v1/routes/search
GET /api/v1/routes/alternatives
POST /api/v1/routes/compare
GET /api/v1/routes/suggestions
GET /api/v1/routes/optimize
\`\`\`

**Key Features**:
\`\`\`typescript
class RoutePlanningService {
  async searchRoutes(request: RouteSearchRequest): Promise<Route[]> {
    const { source, destination, date, preferences } = request;
    
    // Find all possible routes
    const routes = await this.neo4jService.findRoutes(source, destination);
    
    // Apply filters
    const filteredRoutes = this.applyFilters(routes, preferences);
    
    // Optimize routes based on criteria
    const optimizedRoutes = this.optimizeRoutes(filteredRoutes, preferences);
    
    // Cache results
    await this.cacheService.set(\`routes:\${source}:\${destination}\`, optimizedRoutes, 3600);
    
    return optimizedRoutes;
  }

  private optimizeRoutes(routes: Route[], preferences: RoutePreferences): Route[] {
    return routes
      .map(route => ({
        ...route,
        score: this.calculateRouteScore(route, preferences)
      }))
      .sort((a, b) => b.score - a.score);
  }

  private calculateRouteScore(route: Route, preferences: RoutePreferences): number {
    let score = 0;
    
    // Time preference (0-40 points)
    score += this.calculateTimeScore(route, preferences.timePreference);
    
    // Cost preference (0-30 points)
    score += this.calculateCostScore(route, preferences.costPreference);
    
    // Comfort preference (0-20 points)
    score += this.calculateComfortScore(route, preferences.comfortPreference);
    
    // Convenience preference (0-10 points)
    score += this.calculateConvenienceScore(route, preferences.conveniencePreference);
    
    return score;
  }
}
\`\`\`

### Booking Service
**Purpose**: Train booking management

**Responsibilities**:
- Seat availability checking
- Booking creation and management
- Seat selection and allocation
- Booking modifications and cancellations
- PNR generation and management

**Database**: PostgreSQL
**API Endpoints**:
\`\`\`
GET /api/v1/bookings/availability
POST /api/v1/bookings
GET /api/v1/bookings/{bookingId}
PUT /api/v1/bookings/{bookingId}
DELETE /api/v1/bookings/{bookingId}
GET /api/v1/bookings/pnr/{pnr}
\`\`\`

**Key Features**:
\`\`\`typescript
class BookingService {
  async checkAvailability(request: AvailabilityRequest): Promise<AvailabilityResult> {
    const { trainId, date, class: travelClass, passengers } = request;
    
    // Check seat availability
    const availableSeats = await this.seatRepository.findAvailableSeats(
      trainId, date, travelClass
    );
    
    // Check quota availability
    const quotaAvailability = await this.quotaRepository.checkQuota(
      trainId, date, travelClass, passengers
    );
    
    return {
      availableSeats: availableSeats.length,
      quotaAvailable: quotaAvailability.available,
      waitlistPosition: quotaAvailability.waitlistPosition,
      lastUpdated: new Date()
    };
  }

  async createBooking(request: CreateBookingRequest): Promise<Booking> {
    const transaction = await this.database.beginTransaction();
    
    try {
      // Reserve seats
      const seats = await this.reserveSeats(request, transaction);
      
      // Create booking
      const booking = await this.bookingRepository.create({
        ...request,
        seats,
        pnr: this.generatePNR(),
        status: 'confirmed'
      }, transaction);
      
      // Update seat status
      await this.seatRepository.updateStatus(seats, 'reserved', transaction);
      
      // Commit transaction
      await transaction.commit();
      
      // Send confirmation notification
      await this.notificationService.sendBookingConfirmation(booking);
      
      return booking;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
\`\`\`

### Payment Service
**Purpose**: Payment processing and management

**Responsibilities**:
- Payment gateway integration
- Payment processing and validation
- Refund processing
- Payment method management
- Fraud detection and prevention

**Database**: PostgreSQL
**API Endpoints**:
\`\`\`
POST /api/v1/payments/process
GET /api/v1/payments/{paymentId}
POST /api/v1/payments/{paymentId}/refund
GET /api/v1/payments/methods
POST /api/v1/payments/validate
\`\`\`

**Key Features**:
\`\`\`typescript
class PaymentService {
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Validate payment data
    await this.validatePaymentData(request);
    
    // Check fraud risk
    const fraudRisk = await this.fraudDetectionService.assessRisk(request);
    if (fraudRisk.score > 0.8) {
      throw new FraudRiskError('High fraud risk detected');
    }
    
    // Process payment based on method
    let result: PaymentResult;
    
    switch (request.method) {
      case 'card':
        result = await this.cardPaymentService.process(request);
        break;
      case 'upi':
        result = await this.upiPaymentService.process(request);
        break;
      case 'netbanking':
        result = await this.netbankingService.process(request);
        break;
      default:
        throw new UnsupportedPaymentMethodError(request.method);
    }
    
    // Store payment record
    await this.paymentRepository.create({
      ...request,
      status: result.status,
      gatewayTransactionId: result.gatewayTransactionId,
      gatewayResponse: result.gatewayResponse
    });
    
    return result;
  }

  async processRefund(paymentId: string, amount: number): Promise<RefundResult> {
    const payment = await this.paymentRepository.findById(paymentId);
    
    if (!payment) {
      throw new PaymentNotFoundError(paymentId);
    }
    
    if (payment.status !== 'completed') {
      throw new InvalidPaymentStatusError(payment.status);
    }
    
    // Process refund with gateway
    const refundResult = await this.paymentGatewayService.refund(
      payment.gatewayTransactionId,
      amount
    );
    
    // Update payment status
    await this.paymentRepository.update(paymentId, {
      status: 'refunded',
      refundAmount: amount,
      refundDate: new Date()
    });
    
    return refundResult;
  }
}
\`\`\`

### Notification Service
**Purpose**: Multi-channel notification delivery

**Responsibilities**:
- Email notifications
- SMS notifications
- Push notifications
- WhatsApp notifications
- In-app notifications

**Database**: MongoDB
**API Endpoints**:
\`\`\`
POST /api/v1/notifications/send
GET /api/v1/notifications/history
POST /api/v1/notifications/templates
PUT /api/v1/notifications/preferences
GET /api/v1/notifications/status/{notificationId}
\`\`\`

**Key Features**:
\`\`\`typescript
class NotificationService {
  async sendNotification(request: NotificationRequest): Promise<NotificationResult> {
    const { userId, type, channel, data } = request;
    
    // Get user preferences
    const preferences = await this.userPreferenceService.getPreferences(userId);
    
    // Check if user has opted out
    if (!preferences[channel]) {
      throw new NotificationOptedOutError(channel);
    }
    
    // Get template
    const template = await this.templateService.getTemplate(type, channel);
    
    // Render content
    const content = await this.templateService.render(template, data);
    
    // Send notification
    let result: NotificationResult;
    
    switch (channel) {
      case 'email':
        result = await this.emailService.send(content);
        break;
      case 'sms':
        result = await this.smsService.send(content);
        break;
      case 'push':
        result = await this.pushService.send(content);
        break;
      case 'whatsapp':
        result = await this.whatsappService.send(content);
        break;
      default:
        throw new UnsupportedChannelError(channel);
    }
    
    // Store notification record
    await this.notificationRepository.create({
      userId,
      type,
      channel,
      content,
      status: result.status,
      sentAt: new Date()
    });
    
    return result;
  }
}
\`\`\`

### Tracking Service
**Purpose**: Real-time train tracking and updates

**Responsibilities**:
- Real-time train position tracking
- Station arrival/departure updates
- Delay notifications
- Platform change alerts
- Live train status

**Database**: MongoDB (time-series data)
**API Endpoints**:
\`\`\`
GET /api/v1/tracking/train/{trainNumber}
GET /api/v1/tracking/station/{stationCode}
POST /api/v1/tracking/subscribe
DELETE /api/v1/tracking/unsubscribe
GET /api/v1/tracking/alerts
\`\`\`

**Key Features**:
\`\`\`typescript
class TrackingService {
  async getTrainStatus(trainNumber: string): Promise<TrainStatus> {
    // Get current position
    const position = await this.positionRepository.getLatest(trainNumber);
    
    // Get schedule
    const schedule = await this.scheduleRepository.getSchedule(trainNumber);
    
    // Calculate delays
    const delays = this.calculateDelays(position, schedule);
    
    // Get next stations
    const nextStations = this.getNextStations(position, schedule);
    
    return {
      trainNumber,
      currentPosition: position,
      schedule,
      delays,
      nextStations,
      lastUpdated: new Date()
    };
  }

  async subscribeToUpdates(userId: string, trainNumber: string): Promise<void> {
    // Add user to tracking room
    await this.socketService.joinRoom(userId, \`train:\${trainNumber}\`);
    
    // Store subscription
    await this.subscriptionRepository.create({
      userId,
      trainNumber,
      subscribedAt: new Date()
    });
  }

  async updateTrainPosition(trainNumber: string, position: TrainPosition): Promise<void> {
    // Store position update
    await this.positionRepository.create({
      trainNumber,
      ...position,
      timestamp: new Date()
    });
    
    // Notify subscribers
    await this.socketService.broadcastToRoom(
      \`train:\${trainNumber}\`,
      'position_update',
      position
    );
    
    // Check for delays and send alerts
    const delay = this.calculateDelay(position);
    if (delay > 30) { // More than 30 minutes delay
      await this.alertService.sendDelayAlert(trainNumber, delay);
    }
  }
}
\`\`\`

## Service Communication

### Synchronous Communication

#### REST APIs
\`\`\`typescript
// Service-to-service communication
class ServiceClient {
  private baseUrl: string;
  private httpClient: AxiosInstance;

  constructor(serviceName: string) {
    this.baseUrl = this.getServiceUrl(serviceName);
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Name': 'booking-service'
      }
    });
  }

  async get<T>(endpoint: string, params?: any): Promise<T> {
    try {
      const response = await this.httpClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw new ServiceCommunicationError(error.message);
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await this.httpClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw new ServiceCommunicationError(error.message);
    }
  }
}
\`\`\`

#### Circuit Breaker Pattern
\`\`\`typescript
import CircuitBreaker from 'opossum';

class ResilientServiceClient {
  private circuitBreaker: CircuitBreaker;

  constructor(serviceName: string) {
    this.circuitBreaker = new CircuitBreaker(this.callService.bind(this), {
      timeout: 5000,
      errorThresholdPercentage: 50,
      resetTimeout: 30000
    });

    this.circuitBreaker.on('open', () => {
      console.log(\`Circuit breaker opened for \${serviceName}\`);
    });

    this.circuitBreaker.on('halfOpen', () => {
      console.log(\`Circuit breaker half-opened for \${serviceName}\`);
    });

    this.circuitBreaker.on('close', () => {
      console.log(\`Circuit breaker closed for \${serviceName}\`);
    });
  }

  async callService(endpoint: string, data: any): Promise<any> {
    // Actual service call implementation
    return await this.httpClient.post(endpoint, data);
  }

  async execute(endpoint: string, data: any): Promise<any> {
    return await this.circuitBreaker.fire(endpoint, data);
  }
}
\`\`\`

### Asynchronous Communication

#### Message Queues
\`\`\`typescript
import Bull from 'bull';

class MessageQueueService {
  private queues: Map<string, Bull.Queue> = new Map();

  constructor() {
    this.initializeQueues();
  }

  private initializeQueues(): void {
    // Booking events queue
    const bookingQueue = new Bull('booking-events', {
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });

    // Payment events queue
    const paymentQueue = new Bull('payment-events', {
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });

    // Notification queue
    const notificationQueue = new Bull('notifications', {
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });

    this.queues.set('booking', bookingQueue);
    this.queues.set('payment', paymentQueue);
    this.queues.set('notification', notificationQueue);
  }

  async publishEvent(queueName: string, event: DomainEvent): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(\`Queue \${queueName} not found\`);
    }

    await queue.add(event.type, event, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });
  }

  async subscribeToEvents(queueName: string, handler: EventHandler): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(\`Queue \${queueName} not found\`);
    }

    queue.process(handler);
  }
}
\`\`\`

#### Event Sourcing
\`\`\`typescript
interface DomainEvent {
  eventId: string;
  aggregateId: string;
  eventType: string;
  eventData: any;
  timestamp: Date;
  version: number;
}

class EventStore {
  async appendEvents(aggregateId: string, events: DomainEvent[]): Promise<void> {
    const transaction = await this.database.beginTransaction();
    
    try {
      for (const event of events) {
        await this.eventRepository.create(event, transaction);
      }
      
      await transaction.commit();
      
      // Publish events for other services
      await this.publishEvents(events);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private async publishEvents(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.messageQueue.publishEvent('domain-events', event);
    }
  }
}
\`\`\`

### Real-time Communication

#### WebSocket Service
\`\`\`typescript
import { Server as SocketIOServer } from 'socket.io';

class WebSocketService {
  private io: SocketIOServer;

  constructor(server: any) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST']
      }
    });

    this.setupAuthentication();
    this.setupEventHandlers();
  }

  private setupAuthentication(): void {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const user = await this.authService.verifyToken(token);
        socket.userId = user.id;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(\`User \${socket.userId} connected\`);

      // Join user-specific room
      socket.join(\`user:\${socket.userId}\`);

      // Handle train tracking subscription
      socket.on('subscribe_train', (trainNumber) => {
        socket.join(\`train:\${trainNumber}\`);
      });

      // Handle station updates subscription
      socket.on('subscribe_station', (stationCode) => {
        socket.join(\`station:\${stationCode}\`);
      });

      socket.on('disconnect', () => {
        console.log(\`User \${socket.userId} disconnected\`);
      });
    });
  }

  async broadcastToRoom(room: string, event: string, data: any): Promise<void> {
    this.io.to(room).emit(event, data);
  }

  async sendToUser(userId: string, event: string, data: any): Promise<void> {
    this.io.to(\`user:\${userId}\`).emit(event, data);
  }
}
\`\`\`

## Service Discovery and Configuration

### Service Registry
\`\`\`typescript
class ServiceRegistry {
  private services: Map<string, ServiceInfo> = new Map();

  async registerService(serviceInfo: ServiceInfo): Promise<void> {
    this.services.set(serviceInfo.name, serviceInfo);
    
    // Register with external service discovery (e.g., Consul, Eureka)
    await this.externalRegistry.register(serviceInfo);
  }

  async discoverService(serviceName: string): Promise<ServiceInfo> {
    const service = this.services.get(serviceName);
    if (service) {
      return service;
    }

    // Fallback to external service discovery
    return await this.externalRegistry.discover(serviceName);
  }

  async healthCheck(serviceName: string): Promise<boolean> {
    const service = await this.discoverService(serviceName);
    
    try {
      const response = await fetch(\`\${service.url}/health\`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
\`\`\`

### Configuration Management
\`\`\`typescript
class ConfigurationService {
  private config: Map<string, any> = new Map();

  async loadConfiguration(): Promise<void> {
    // Load from environment variables
    this.loadFromEnvironment();
    
    // Load from configuration files
    await this.loadFromFiles();
    
    // Load from external configuration service
    await this.loadFromExternalService();
  }

  get(key: string, defaultValue?: any): any {
    return this.config.get(key) ?? defaultValue;
  }

  set(key: string, value: any): void {
    this.config.set(key, value);
  }

  private loadFromEnvironment(): void {
    const envConfig = {
      database: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        name: process.env.DB_NAME,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD
      },
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD
      },
      services: {
        userService: process.env.USER_SERVICE_URL,
        bookingService: process.env.BOOKING_SERVICE_URL,
        paymentService: process.env.PAYMENT_SERVICE_URL
      }
    };

    this.config.set('app', envConfig);
  }
}
\`\`\`

## Monitoring and Observability

### Distributed Tracing
\`\`\`typescript
import { trace, context } from '@opentelemetry/api';

class TracingService {
  private tracer = trace.getTracer('railconnect-service');

  async traceOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const span = this.tracer.startSpan(operationName);
    
    try {
      const result = await context.with(trace.setSpan(context.active(), span), operation);
      span.setStatus({ code: 1 }); // OK
      return result;
    } catch (error) {
      span.setStatus({ code: 2, message: error.message }); // ERROR
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }

  addSpanAttributes(attributes: Record<string, any>): void {
    const span = trace.getActiveSpan();
    if (span) {
      span.setAttributes(attributes);
    }
  }
}
\`\`\`

### Metrics Collection
\`\`\`typescript
import { Counter, Histogram, Gauge } from 'prom-client';

class MetricsService {
  private requestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
  });

  private requestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route']
  });

  private activeConnections = new Gauge({
    name: 'active_connections',
    help: 'Number of active connections'
  });

  recordRequest(method: string, route: string, statusCode: number, duration: number): void {
    this.requestCounter.inc({ method, route, status_code: statusCode });
    this.requestDuration.observe({ method, route }, duration);
  }

  setActiveConnections(count: number): void {
    this.activeConnections.set(count);
  }
}
\`\`\`

### Logging
\`\`\`typescript
import winston from 'winston';

class LoggingService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ]
    });
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error, meta?: any): void {
    this.logger.error(message, { error: error?.stack, ...meta });
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }
}
\`\`\`

## Deployment and Scaling

### Containerization
\`\`\`dockerfile
# Dockerfile for microservice
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
\`\`\`

### Kubernetes Deployment
\`\`\`yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: booking-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: booking-service
  template:
    metadata:
      labels:
        app: booking-service
    spec:
      containers:
      - name: booking-service
        image: railconnect/booking-service:latest
        ports:
        - containerPort: 3000
        env:
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
---
apiVersion: v1
kind: Service
metadata:
  name: booking-service
spec:
  selector:
    app: booking-service
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
\`\`\`

### Auto-scaling
\`\`\`yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: booking-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: booking-service
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
\`\`\`

---

This microservices architecture provides a robust, scalable, and maintainable foundation for RailConnect India. Each service is independently deployable, scalable, and focused on specific business capabilities, ensuring high availability and performance.
`;export{n as default};
