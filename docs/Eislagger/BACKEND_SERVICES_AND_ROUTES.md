# EisLager Backend Services & API Routes Analysis

## Overview

This document outlines all the backend services and API routes required to support the EisLager frontend application. Based on the frontend analysis, I've identified the necessary microservices architecture and their corresponding endpoints.

## Frontend Architecture Summary

The EisLager frontend is structured with:
- **4 Main User Roles**: Executive, Manufacturer, Clerk, Patron
- **Role-based Dashboards**: Each role has specific features and permissions
- **Real-time Features**: Chat, notifications, live analytics
- **PWA Capabilities**: Offline support, mobile optimization
- **Multi-service Integration**: Dashboard, analytics, inventory, communications

## Required Backend Services

### 1. **Authentication Service** (Port: 3002)
*Manages user authentication, authorization, and JWT token handling*

#### API Routes (`/api/v1/auth`)
```
POST   /register                    - User registration (default: PATRON role)
POST   /login                       - User authentication & JWT generation
POST   /logout                      - User logout (token blacklisting)
GET    /me                          - Get current user profile
POST   /verify                      - Verify JWT token
POST   /refresh                     - Refresh JWT tokens
POST   /forgot-password             - Password reset request
POST   /reset-password              - Password reset confirmation
PUT    /change-password             - Change user password
PUT    /profile                     - Update user profile
GET    /users                       - List all users (Admin only)
PUT    /users/:userId/role          - Update user role (Admin only)
DELETE /users/:userId                - Delete user (Admin only)
```

#### Database Tables
- `users` (id, email, password_hash, name, role, phone, created_at, updated_at)
- `password_reset_tokens` (id, user_id, token, expires_at)
- `user_sessions` (id, user_id, token, expires_at, ip_address)

### 2. **Sales Service** (Port: 3004)
*Handles shop operations, inventory levels, and transaction processing*

#### API Routes (`/api/v1/sales`)
```
# Shop Management
GET    /shops                       - List all shops (public)
POST   /shops                       - Create new shop (Executive only)
GET    /shops/:shopId               - Get shop details (public)
PUT    /shops/:shopId               - Update shop (Executive only)
DELETE /shops/:shopId               - Delete shop (Executive only)

# Shop Operations
GET    /shops/:shopId/menu          - Public menu listing
GET    /shops/:shopId/inventory     - Internal inventory (Clerk+)
PUT    /shops/:shopId/inventory     - Update inventory levels
GET    /shops/:shopId/analytics     - Shop performance metrics

# Transaction Processing
POST   /shops/:shopId/pos-transactions     - Process POS sale
GET    /shops/:shopId/transactions         - Transaction history
POST   /shops/:shopId/purchase-orders     - Create purchase order
GET    /shops/:shopId/orders              - Shop orders
PUT    /orders/:orderId/status            - Update order status

# Customer Feedback
POST   /feedback                    - Submit review/feedback
GET    /shops/:shopId/reviews       - Shop reviews
PUT    /reviews/:reviewId           - Update/delete review
```

#### Kafka Events Produced
- `SALE_COMPLETED` - When POS transaction completes
- `PURCHASE_ORDER_CREATED` - When clerk requests stock
- `INVENTORY_LOW` - When stock drops below threshold
- `REVIEW_SUBMITTED` - When customer submits feedback

### 3. **Inventory Service** (Port: 3003)
*Manages factories, stock items, flavors, and delivery operations*

#### API Routes (`/api/v1/inventory`)
```
# Factory Management
GET    /factories                   - List factories
GET    /factories/:factoryId        - Factory details
PUT    /factories/:factoryId/budget - Update budget allocation (Executive)
GET    /factories/:factoryId/analytics - Production metrics

# Stock Management  
POST   /factories/:factoryId/stock-items  - Register new stock
GET    /factories/:factoryId/stock-items - View factory inventory
PUT    /stock-items/:itemId        - Update stock item
DELETE /stock-items/:itemId        - Remove from inventory
POST   /stock-items/:itemId/expiry - Update expiry notifications

# Flavor Catalog
GET    /flavors                     - List all flavors
POST   /flavors                     - Create new flavor (Manufacturer)
GET    /flavors/:flavorId           - Flavor details
PUT    /flavors/:flavorId          - Update flavor (Manufacturer)
DELETE /flavors/:flavorId           - Archive flavor

# Invoice Management
POST   /invoices                    - Create invoice for purchase order
GET    /invoices/:invoiceId         - Invoice details
PUT    /invoices/:invoiceId/status - Update payment status
GET    /invoices                    - List invoices with filters

# Supplier Management
GET    /suppliers                   - List suppliers
POST   /suppliers                   - Add new supplier
PUT    /suppliers/:supplierId       - Update supplier info
```

#### Kafka Events Consumed
- `POS_TRANSACTION` - Updates stock after sale
- `PURCHASE_ORDER_CREATED` - Creates invoice automatically
- `BUDGET_ALLOCATION_UPDATED` - Adjusts factory budgets

### 4. **Admin Service** (Port: 3001)
*Provides administrative functions and system monitoring*

#### API Routes (`/api/v1/admin`)
```
# User Management
GET    /users                       - List all users (paginated)
PUT    /users/:userId/role          - Change user role
PUT    /users/:userId/status        - Activate/deactivate user
DELETE /users/:userId               - Soft delete user
GET    /users/machines              - User analytics summary

# System Monitoring
GET    /system/health               - Service health check
GET    /system/metrics              - System performance metrics
GET    /system/logs                 - Application logs
POST   /system/logs/clear          - Clear old logs

# Audit & Compliance
GET    /audit-logs                  - Platform audit trail
POST   /audit-logs/search          - Advanced audit search
GET    /compliance/report           - Generate compliance report

# System Configuration
GET    /config                      - System configuration
PUT    /config                     - Update configuration
GET    /config/themes              - Available themes
POST   /config/maintenance         - Schedule maintenance window

# Broadcasts & Announcements
POST   /broadcasts                 - System-wide broadcasts
GET    /broadcasts                 - List broadcasts
PUT    /broadcasts/:id/status      - Update broadcast status
```

### 5. **Communication Service** (Port: 3005)
*Handles chat, email, and notifications*

#### API Routes (`/api/v1/communications`)
```
# Chat System
GET    /chat/conversations          - List conversations
POST   /chat/conversations          - Start new conversation
GET    /chat/conversations/:id/messages - Get messages
POST   /chat/conversations/:id/messages  - Send message
POST   /chat/messages/:id/read     - Mark message as read
GET    /chat/online-users          - List online users

# Email System
GET    /emails                      - List emails (paginated)
POST   /emails                      - Send email
GET    /emails/:id                  - Email details
PUT    /emails/:id/read            - Mark as read
PUT    /emails/:id/star            - Star/unstar email
POST   /emails/:id/reply           - Reply to email

# Notifications
GET    /notifications              - List notifications
POST   /notifications              - Create notification
PUT    /notifications/:id/read     - Mark as read
DELETE /notifications/:id          - Delete notification
POST   /notifications/mark-all    - Mark all as read

# Real-time Setup
WS     /socket                      - WebSocket connection
POST   /upload/chat-attachments    - Upload chat files/images
```

#### WebSocket Events
```
# Client → Server
USER_ONLINE                    - User comes online
USER_OFFLINE                   - User goes offline
TYPING_START                   - User starts typing
TYPING_STOP                    - User stops typing
JOIN_CONVERSATION             - Join chat room
LEAVE_CONVERSATION            - Leave chat room

# Server → Client
NEW_MESSAGE                   - Incoming message
MESSAGE_DELIVERED            - Message delivery confirmation
CONVERSATION_UPDATED         - Conversation metadata changed
USER_STATUS_CHANGE           - User online/offline status
NOTIFICATION_RECEIVED        - New notification
SYSTEM_ANNOUNCEMENT          - System broadcast
```

### 6. **Analytics Service** (Port: 3006)
*Provides data analytics, reporting, and business intelligence*

#### API Routes (`/api/v1/analytics`)
```
# Dashboard Data
GET    /dashboard/:role            - Role-specific dashboard data
GET    /dashboard/kpis             - KPI metrics
GET    /dashboard/real-time       - Live dashboard updates

# Sales Analytics
GET    /analytics/sales           - Sales performance data
GET    /analytics/sales/trends    - Sales trend analysis
GET    /analytics/sales/products  - Product performance
GET    /analytics/revenue         - Revenue analytics

# Inventory Analytics  
GET    /analytics/inventory       - Inventory insights
GET    /analytics/inventory/turnover - Stock turnover rates
GET    /analytics/inventory/waste - Waste analysis
GET    /analytics/suppliers       - Supplier performance

# Location Analytics
GET    /analytics/locations       - Shop performance by location
GET    /analytics/locations/map   - Geographic analytics
GET    /analytics/locations/heatmap - Performance heatmap

# Custom Reports
POST   /reports/generate          - Generate custom report
GET    /reports/:reportId         - Get report
POST   /reports/schedule          - Schedule recurring reports
GET    /reports/scheduled         - List scheduled reports
```

### 7. **File Upload Service** (Port: 3007)

#### API Routes (`/api/v1/files`)
```
POST   /upload                     - Upload file
GET    /files/:fileId              - Get file info
DELETE /files/:fileId              - Delete file
POST   /upload/batch              - Batch upload
GET    /files/user/:userId         - User's files
POST   /files/compress            - Compress video/images
```

## Cross-Service Integration

### Kafka Event Topics

#### Event Flows
```
Sales Service:
├── pos-transaction (→ Inventory Service)
├── purchase-order (→ Inventory Service)
├── low-stock-alert (→ All Services)

Inventory Service:
├── stock-registered (→ Analytics Service)
├── invoice-generated (→ Sales Service)
├── expiry-warning (→ Communications Service)

Auth Service:
├── user-login (→ All Services)
├── user-role-changed (→ All Services)

Communications Service:
├── message-received (→ Real-time clients)
├── notification-sent (→ Real-time clients)
```

### API Gateway Routes (Port: 3000)
```
POST   /auth/*           → Auth Service (3002)
GET    /api/sales/*      → Sales Service (3004)
GET    /api/inventory/*  → Inventory Service (3003)
GET    /api/admin/*      → Admin Service (3001)
GET    /api/communications/* → Communications Service (3005)
GET    /api/analytics/*  → Analytics Service (3006)
POST   /api/files/*      → File Upload Service (3007)
WS     /socket.io/*      → Communications Service (3005)
```

## Database Schema Requirements

### Core Tables
```sql
-- Users & Authentication
users (id, email, password_hash, name, role, phone, preferences, created_at)
sessions (id, user_id, token, expires_at, ip_address)

-- Sales & Shops  
shops (id, name, address, phone, manager_id, hours, capacity, status)
transactions (id, shop_id, items, total_amount, payment_method, clerk_id, patron_id)
orders (id, shop_id, items, status, created_at, updated_at)
reviews (id, shop_id, patron_id, rating, comment, created_at)

-- Inventory & Production
factories (id, name, location, manager_id, budget_allocated, status)
stock_items (id, factory_id, flavor_id, batch_id, quantity, expiry_date, cost)
flavors (id, name, description, category, price, ingredients, allergens, images)
suppliers (id, name, contact, specialties, rating)
invoices (id, factory_id, shop_id, items, total_amount, status, due_date)

-- Communications
conversations (id, participants, type, last_message_at)
messages (id, conversation_id, sender_id, content, message_type, created_at)
emails (id, sender_id, receiver_id, subject, content, status, created_at)
notifications (id, user_id, type, message, read_status, created_at)

-- Analytics (Aggregated Tables)
daily_sales (shop_id, date, total_sales, transaction_count)
product_performance (flavor_id, period, sales_volume, revenue)
user_activity (user_id, type, metadata, timestamp)
```

## Security Requirements

### Authentication & Authorization
- JWT tokens for stateless authentication
- Role-based access control (RBAC) with 4 main roles
- Token refresh mechanism
- OAuth2 integration for Google login
- Rate limiting per user/role

### Data Security
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- File upload security
- Encryption for sensitive data

### API Security
- CORS configuration
- Request rate limiting
- API key authentication for service-to-service calls
- Audit logging for all operations

## Performance & Scalability

### Caching Strategy
- Redis for session storage
- Database query caching
- API response caching
- File caching for static assets

### Database Optimization
- Connection pooling
- Read replicas strategies
- Query optimization
- Indexing strategy

### Real-time Features
- Socket.IO for bidirectional communication
- Kafka for event streaming
- WebSocket connection pooling
- Message queuing for reliability

## Mobile & PWA Support

### API Enhancements
- Mobile-optimized endpoints
- Offline data synchronization
- Push notification support
- Camera upload capabilities
- Gesture-based endpoints

### Performance Optimization
- Image compression
- Progressive image loading
- Response compression
- CDN integration for static assets

## Monitoring & Observability

### Metrics Collection
- Application performance metrics
- Business metrics (sales, inventory)
- Error tracking and logging
- Real-time monitoring dashboard

### Health Checks
- Service health endpoints
- Dependency monitoring
- Automated alerts
- Performance benchmarking

## Deployment Architecture

### Docker Containers
- Each service in separate container
- PostgreSQL databases
- Redis cache
- Kafka event streams
- Nginx reverse proxy

### Environment Configuration
- Development environment
- Staging environment  
- Production environment
- Environment-specific configurations

---

*This analysis provides a comprehensive foundation for implementing the EisLager backend services. Each service should be developed independently while maintaining proper API contracts and event-driven integration patterns.*
