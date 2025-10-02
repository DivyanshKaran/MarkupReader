# API Documentation

## Overview

RailConnect India provides a comprehensive RESTful API for train search, booking, payment processing, and real-time tracking. The API follows REST principles with proper HTTP status codes, error handling, and authentication.

## Base URL

```
Production: https://api.railconnect.in/v1
Staging: https://staging-api.railconnect.in/v1
Development: http://localhost:3001/v1
```

## Authentication

### JWT Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

### Token Refresh

When the access token expires, use the refresh token to get a new access token:

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "your_refresh_token"
}
```

## Rate Limiting

API requests are rate limited per user and IP address:

- **Authenticated users**: 1000 requests per hour
- **Unauthenticated users**: 100 requests per hour
- **Search endpoints**: 100 requests per minute
- **Booking endpoints**: 10 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req_123456789"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## API Endpoints

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Logout User

```http
POST /auth/logout
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Get Current User

```http
GET /auth/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+919876543210",
    "isActive": true,
    "roles": ["user"],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Station Endpoints

#### Get All Stations

```http
GET /stations?search=mumbai&limit=10&offset=0
```

**Query Parameters:**
- `search` (optional): Search term for station name or code
- `limit` (optional): Number of results (default: 20, max: 100)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "stations": [
    {
      "id": "station_123",
      "code": "MUM",
      "name": "Mumbai Central",
      "city": "Mumbai",
      "state": "Maharashtra",
      "latitude": 18.9667,
      "longitude": 72.8333,
      "facilities": ["waiting_room", "food_court", "parking"],
      "platforms": 12
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

#### Get Station by ID

```http
GET /stations/{station_id}
```

**Response:**
```json
{
  "success": true,
  "station": {
    "id": "station_123",
    "code": "MUM",
    "name": "Mumbai Central",
    "city": "Mumbai",
    "state": "Maharashtra",
    "latitude": 18.9667,
    "longitude": 72.8333,
    "facilities": ["waiting_room", "food_court", "parking"],
    "platforms": 12,
    "address": "Mumbai Central, Mumbai, Maharashtra 400001",
    "contact": {
      "phone": "+91-22-22620000",
      "email": "mumbai.central@irctc.co.in"
    }
  }
}
```

### Train Search Endpoints

#### Search Trains

```http
POST /trains/search
Content-Type: application/json

{
  "from": "MUM",
  "to": "DEL",
  "date": "2024-02-01",
  "passengers": 2,
  "class": "AC2",
  "quota": "General",
  "returnDate": "2024-02-05"
}
```

**Request Body:**
- `from` (required): Source station code
- `to` (required): Destination station code
- `date` (required): Journey date (YYYY-MM-DD)
- `passengers` (optional): Number of passengers (default: 1, max: 6)
- `class` (optional): Travel class preference
- `quota` (optional): Quota type (General, Tatkal, Ladies, etc.)
- `returnDate` (optional): Return journey date for round trip

**Response:**
```json
{
  "success": true,
  "routes": [
    {
      "id": "route_123",
      "train": {
        "id": "train_123",
        "number": "12951",
        "name": "Mumbai Rajdhani Express",
        "type": "Superfast",
        "source": "MUM",
        "destination": "DEL"
      },
      "departure": {
        "station": "Mumbai Central",
        "time": "17:00",
        "platform": "1",
        "date": "2024-02-01"
      },
      "arrival": {
        "station": "New Delhi",
        "time": "09:30",
        "platform": "2",
        "date": "2024-02-02"
      },
      "duration": "16h 30m",
      "distance": 1384,
      "fare": {
        "AC1": 2500,
        "AC2": 1500,
        "AC3": 1000,
        "SL": 500
      },
      "availability": {
        "AC1": 5,
        "AC2": 10,
        "AC3": 20,
        "SL": 50
      },
      "amenities": ["wifi", "food", "bedding"]
    }
  ],
  "total": 1,
  "searchId": "search_123456"
}
```

#### Get Train Details

```http
GET /trains/{train_id}
```

**Response:**
```json
{
  "success": true,
  "train": {
    "id": "train_123",
    "number": "12951",
    "name": "Mumbai Rajdhani Express",
    "type": "Superfast",
    "source": "MUM",
    "destination": "DEL",
    "runningDays": ["Monday", "Wednesday", "Friday"],
    "classes": ["AC1", "AC2", "AC3"],
    "amenities": ["wifi", "food", "bedding", "newspaper"],
    "route": [
      {
        "station": "Mumbai Central",
        "arrival": null,
        "departure": "17:00",
        "platform": "1",
        "distance": 0
      },
      {
        "station": "New Delhi",
        "arrival": "09:30",
        "departure": null,
        "platform": "2",
        "distance": 1384
      }
    ]
  }
}
```

### Booking Endpoints

#### Create Booking

```http
POST /bookings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "trainId": "train_123",
  "journeyDate": "2024-02-01",
  "class": "AC2",
  "quota": "General",
  "passengers": [
    {
      "name": "John Doe",
      "age": 30,
      "gender": "M",
      "berthPreference": "LB",
      "idProof": "Aadhaar",
      "idNumber": "123456789012"
    }
  ],
  "contact": {
    "phone": "+919876543210",
    "email": "john@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "booking_123",
    "pnr": "PNR123456",
    "train": {
      "id": "train_123",
      "number": "12951",
      "name": "Mumbai Rajdhani Express"
    },
    "journeyDate": "2024-02-01",
    "class": "AC2",
    "quota": "General",
    "passengers": [
      {
        "name": "John Doe",
        "age": 30,
        "gender": "M",
        "berth": "LB1",
        "coach": "B1"
      }
    ],
    "fare": {
      "baseFare": 1500,
      "taxes": 150,
      "total": 1650
    },
    "status": "confirmed",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Get User Bookings

```http
GET /bookings?status=confirmed&limit=10&offset=0
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (optional): Booking status filter
- `limit` (optional): Number of results (default: 20, max: 100)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "bookings": [
    {
      "id": "booking_123",
      "pnr": "PNR123456",
      "train": {
        "number": "12951",
        "name": "Mumbai Rajdhani Express"
      },
      "journeyDate": "2024-02-01",
      "status": "confirmed",
      "totalFare": 1650,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

#### Get Booking by ID

```http
GET /bookings/{booking_id}
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "booking_123",
    "pnr": "PNR123456",
    "train": {
      "id": "train_123",
      "number": "12951",
      "name": "Mumbai Rajdhani Express"
    },
    "journeyDate": "2024-02-01",
    "class": "AC2",
    "quota": "General",
    "passengers": [
      {
        "name": "John Doe",
        "age": 30,
        "gender": "M",
        "berth": "LB1",
        "coach": "B1"
      }
    ],
    "fare": {
      "baseFare": 1500,
      "taxes": 150,
      "total": 1650
    },
    "status": "confirmed",
    "payment": {
      "id": "payment_123",
      "status": "completed",
      "method": "card",
      "transactionId": "TXN123456"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Booking by PNR

```http
GET /bookings/pnr/{pnr}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "booking_123",
    "pnr": "PNR123456",
    "train": {
      "id": "train_123",
      "number": "12951",
      "name": "Mumbai Rajdhani Express"
    },
    "journeyDate": "2024-02-01",
    "class": "AC2",
    "quota": "General",
    "passengers": [
      {
        "name": "John Doe",
        "age": 30,
        "gender": "M",
        "berth": "LB1",
        "coach": "B1"
      }
    ],
    "fare": {
      "baseFare": 1500,
      "taxes": 150,
      "total": 1650
    },
    "status": "confirmed",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Cancel Booking

```http
PUT /bookings/{booking_id}/cancel
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "Change of plans",
  "refundMethod": "original"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "refund": {
    "amount": 1320,
    "method": "original",
    "processingTime": "3-5 business days"
  }
}
```

### Payment Endpoints

#### Create Payment

```http
POST /payments
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "bookingId": "booking_123",
  "amount": 1650,
  "method": "card",
  "paymentDetails": {
    "cardNumber": "4111111111111111",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123",
    "cardholderName": "John Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "payment_123",
    "bookingId": "booking_123",
    "amount": 1650,
    "method": "card",
    "status": "processing",
    "transactionId": "TXN123456",
    "gateway": "razorpay",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Payment Status

```http
GET /payments/{payment_id}
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "payment_123",
    "bookingId": "booking_123",
    "amount": 1650,
    "method": "card",
    "status": "completed",
    "transactionId": "TXN123456",
    "gateway": "razorpay",
    "gatewayResponse": {
      "id": "pay_1234567890",
      "status": "captured",
      "amount": 165000,
      "currency": "INR"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "completedAt": "2024-01-01T00:05:00Z"
  }
}
```

### User Profile Endpoints

#### Get User Profile

```http
GET /user/profile
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+919876543210",
    "dateOfBirth": "1990-01-01",
    "gender": "M",
    "address": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    },
    "preferences": {
      "travelClass": "AC2",
      "berthPreference": "LB",
      "mealPreference": "vegetarian",
      "notifications": {
        "email": true,
        "sms": true,
        "push": true
      }
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Update User Profile

```http
PUT /user/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+919876543210",
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": {
    "id": "user_123",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+919876543210",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Real-time Tracking Endpoints

#### Get Train Status

```http
GET /trains/{train_number}/status?date=2024-02-01
```

**Query Parameters:**
- `date` (required): Journey date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "train": {
    "number": "12951",
    "name": "Mumbai Rajdhani Express",
    "date": "2024-02-01",
    "status": "running",
    "currentPosition": {
      "station": "Vadodara Junction",
      "arrival": "22:30",
      "departure": "22:35",
      "platform": "3",
      "delay": 15
    },
    "route": [
      {
        "station": "Mumbai Central",
        "scheduledArrival": null,
        "scheduledDeparture": "17:00",
        "actualArrival": null,
        "actualDeparture": "17:00",
        "platform": "1",
        "status": "departed"
      },
      {
        "station": "Vadodara Junction",
        "scheduledArrival": "22:15",
        "scheduledDeparture": "22:20",
        "actualArrival": "22:30",
        "actualDeparture": "22:35",
        "platform": "3",
        "status": "arrived",
        "delay": 15
      }
    ]
  }
}
```

#### Get Station Updates

```http
GET /stations/{station_code}/updates?date=2024-02-01
```

**Query Parameters:**
- `date` (required): Date for updates (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "station": {
    "code": "MUM",
    "name": "Mumbai Central",
    "date": "2024-02-01",
    "updates": [
      {
        "trainNumber": "12951",
        "trainName": "Mumbai Rajdhani Express",
        "scheduledArrival": null,
        "scheduledDeparture": "17:00",
        "actualArrival": null,
        "actualDeparture": "17:00",
        "platform": "1",
        "status": "on_time"
      }
    ]
  }
}
```

### Notification Endpoints

#### Get Notifications

```http
GET /notifications?limit=20&offset=0
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "notif_123",
      "type": "booking_confirmation",
      "title": "Booking Confirmed",
      "message": "Your booking PNR123456 has been confirmed",
      "data": {
        "pnr": "PNR123456",
        "trainNumber": "12951"
      },
      "read": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

#### Mark Notification as Read

```http
PUT /notifications/{notification_id}/read
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

## WebSocket API

### Connection

```javascript
const socket = io('wss://api.railconnect.in', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events

#### Train Tracking

```javascript
// Join train tracking room
socket.emit('join_train_tracking', { trainId: 'train_123' });

// Listen for position updates
socket.on('train_position_update', (data) => {
  console.log('Train position:', data);
});

// Listen for delay notifications
socket.on('train_delay_notification', (data) => {
  console.log('Train delay:', data);
});
```

#### Station Updates

```javascript
// Join station updates room
socket.emit('join_station_updates', { stationCode: 'MUM' });

// Listen for platform changes
socket.on('platform_change', (data) => {
  console.log('Platform change:', data);
});

// Listen for crowd density updates
socket.on('crowd_density_update', (data) => {
  console.log('Crowd density:', data);
});
```

#### Booking Updates

```javascript
// Join booking updates room
socket.emit('join_booking_updates', { bookingId: 'booking_123' });

// Listen for booking status updates
socket.on('booking_status_update', (data) => {
  console.log('Booking status:', data);
});

// Listen for payment status updates
socket.on('payment_status_update', (data) => {
  console.log('Payment status:', data);
});
```

## SDKs and Libraries

### JavaScript/TypeScript SDK

```bash
npm install @railconnect/sdk
```

```javascript
import { RailConnectAPI } from '@railconnect/sdk';

const api = new RailConnectAPI({
  baseURL: 'https://api.railconnect.in/v1',
  apiKey: 'your_api_key'
});

// Search trains
const routes = await api.trains.search({
  from: 'MUM',
  to: 'DEL',
  date: '2024-02-01'
});

// Create booking
const booking = await api.bookings.create({
  trainId: 'train_123',
  journeyDate: '2024-02-01',
  passengers: [{
    name: 'John Doe',
    age: 30,
    gender: 'M'
  }]
});
```

### Python SDK

```bash
pip install railconnect-sdk
```

```python
from railconnect import RailConnectAPI

api = RailConnectAPI(
    base_url='https://api.railconnect.in/v1',
    api_key='your_api_key'
)

# Search trains
routes = api.trains.search(
    from_station='MUM',
    to_station='DEL',
    date='2024-02-01'
)

# Create booking
booking = api.bookings.create(
    train_id='train_123',
    journey_date='2024-02-01',
    passengers=[{
        'name': 'John Doe',
        'age': 30,
        'gender': 'M'
    }]
)
```

## Postman Collection

Download our Postman collection for easy API testing:

[Download Postman Collection](https://api.railconnect.in/docs/postman-collection.json)

## API Changelog

### Version 1.0.0 (2024-01-01)
- Initial API release
- Authentication endpoints
- Train search and booking
- Payment processing
- Real-time tracking
- User management

### Version 1.1.0 (2024-02-01)
- Added return journey support
- Enhanced search filters
- Improved error handling
- WebSocket API updates

## Support

For API support and questions:
- 📧 Email: api-support@railconnect.in
- 📖 Documentation: [docs.railconnect.in](https://docs.railconnect.in)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/railconnect-india/issues)
- 💬 Discord: [RailConnect Community](https://discord.gg/railconnect)
