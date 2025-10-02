const n=`# Database Architecture

## Overview

RailConnect India uses a polyglot persistence approach with multiple databases optimized for different use cases. This architecture ensures high performance, scalability, and data consistency across the application.

## Database Strategy

### Polyglot Persistence
- **PostgreSQL**: Primary transactional database for user data, bookings, and payments
- **Neo4j**: Graph database for route planning and complex relationships
- **Redis**: Cache and session store for high-performance data access
- **MongoDB**: Document store for flexible data like notifications and analytics
- **Elasticsearch**: Search engine for full-text search and analytics

## PostgreSQL - Primary Database

### Schema Design

#### Core Tables
\`\`\`sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15),
    date_of_birth DATE,
    gender CHAR(1) CHECK (gender IN ('M', 'F', 'O')),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    backup_codes TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stations table
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    platform_count INTEGER DEFAULT 1,
    facilities TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trains table
CREATE TABLE trains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    source_station_id UUID REFERENCES stations(id),
    destination_station_id UUID REFERENCES stations(id),
    total_seats INTEGER NOT NULL,
    available_classes TEXT[] NOT NULL,
    running_days TEXT[] NOT NULL,
    amenities TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table (partitioned by date)
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    train_id UUID REFERENCES trains(id),
    journey_date DATE NOT NULL,
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL CHECK (status IN ('confirmed', 'pending', 'cancelled', 'waitlist', 'rac')),
    pnr_number VARCHAR(100) UNIQUE NOT NULL,
    total_fare NUMERIC(10, 2) NOT NULL,
    payment_id UUID,
    passenger_details JSONB NOT NULL,
    seat_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (journey_date);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL,
    payment_gateway VARCHAR(50) NOT NULL,
    gateway_transaction_id VARCHAR(255),
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Partitioning Strategy
\`\`\`sql
-- Create monthly partitions for bookings
CREATE TABLE bookings_2024_01 PARTITION OF bookings
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE bookings_2024_02 PARTITION OF bookings
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Create indexes on partitions
CREATE INDEX idx_bookings_2024_01_user_id ON bookings_2024_01(user_id);
CREATE INDEX idx_bookings_2024_01_train_id ON bookings_2024_01(train_id);
CREATE INDEX idx_bookings_2024_01_status ON bookings_2024_01(status);
\`\`\`

#### Indexing Strategy
\`\`\`sql
-- Primary indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_stations_code ON stations(code);
CREATE INDEX idx_trains_number ON trains(number);

-- Composite indexes
CREATE INDEX idx_bookings_user_status_date ON bookings(user_id, status, journey_date);
CREATE INDEX idx_bookings_train_date_status ON bookings(train_id, journey_date, status);
CREATE INDEX idx_payments_booking_status ON payments(booking_id, status);

-- Partial indexes
CREATE INDEX idx_users_active ON users(id) WHERE is_active = true;
CREATE INDEX idx_bookings_confirmed ON bookings(id) WHERE status = 'confirmed';

-- GIN indexes for JSONB
CREATE INDEX idx_bookings_passenger_details ON bookings USING GIN(passenger_details);
CREATE INDEX idx_payments_gateway_response ON payments USING GIN(gateway_response);

-- Text search indexes
CREATE INDEX idx_stations_name_search ON stations USING GIN(to_tsvector('english', name));
CREATE INDEX idx_trains_name_search ON trains USING GIN(to_tsvector('english', name));
\`\`\`

### Performance Optimization

#### Connection Pooling
\`\`\`typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of connections
  min: 5,  // Minimum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Connection pool monitoring
pool.on('connect', (client) => {
  console.log('New client connected');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});
\`\`\`

#### Query Optimization
\`\`\`sql
-- Use EXPLAIN ANALYZE for query optimization
EXPLAIN ANALYZE SELECT * FROM bookings 
WHERE user_id = 'user-id' 
  AND status = 'confirmed' 
  AND journey_date >= CURRENT_DATE;

-- Create materialized views for complex queries
CREATE MATERIALIZED VIEW user_booking_stats AS
SELECT 
    user_id,
    COUNT(*) as total_bookings,
    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_bookings,
    SUM(total_fare) as total_spent,
    AVG(total_fare) as avg_fare
FROM bookings
GROUP BY user_id;

-- Refresh materialized view
REFRESH MATERIALIZED VIEW user_booking_stats;
\`\`\`

#### Read Replicas
\`\`\`typescript
// Primary database for writes
const primaryPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10
});

// Read replica for reads
const readReplicaPool = new Pool({
  connectionString: process.env.DATABASE_READ_URL,
  max: 20
});

class DatabaseService {
  async writeQuery(query: string, params: any[]) {
    const client = await primaryPool.connect();
    try {
      return await client.query(query, params);
    } finally {
      client.release();
    }
  }

  async readQuery(query: string, params: any[]) {
    const client = await readReplicaPool.connect();
    try {
      return await client.query(query, params);
    } finally {
      client.release();
    }
  }
}
\`\`\`

## Neo4j - Graph Database

### Graph Schema

#### Node Labels
\`\`\`cypher
// Station nodes
CREATE (s:Station {
  code: 'MUM',
  name: 'Mumbai Central',
  city: 'Mumbai',
  state: 'Maharashtra',
  latitude: 18.9667,
  longitude: 72.8333,
  facilities: ['waiting_room', 'food_court', 'parking']
});

// Train nodes
CREATE (t:Train {
  number: '12951',
  name: 'Mumbai Rajdhani Express',
  type: 'Superfast',
  totalSeats: 1000,
  classes: ['AC1', 'AC2', 'AC3']
});

// Route nodes
CREATE (r:Route {
  distance: 1384,
  duration: 'PT16H30M',
  fare: 2500,
  departureTime: '17:00',
  arrivalTime: '09:30',
  dayOffset: 1
});
\`\`\`

#### Relationship Types
\`\`\`cypher
// Station connections
CREATE (mumbai:Station {code: 'MUM', name: 'Mumbai Central'})
CREATE (delhi:Station {code: 'DEL', name: 'New Delhi'})
CREATE (mumbai)-[:CONNECTED_TO {
  trainId: 'train-123',
  trainNumber: '12951',
  distance: 1384,
  duration: 'PT16H30M',
  fare: 2500,
  departureTime: '17:00',
  arrivalTime: '09:30',
  dayOffset: 1
}]->(delhi);

// Train routes
CREATE (train:Train {number: '12951', name: 'Mumbai Rajdhani Express'})
CREATE (train)-[:OPERATES_ON]->(route:Route {
  distance: 1384,
  duration: 'PT16H30M',
  fare: 2500
});
\`\`\`

### Route Planning Queries

#### Shortest Path
\`\`\`cypher
// Find shortest route between stations
MATCH (source:Station {code: 'MUM'}), (destination:Station {code: 'DEL'})
CALL gds.shortestPath.dijkstra.stream('railwayGraph', {
  sourceNode: source,
  targetNode: destination,
  relationshipWeightProperty: 'distance'
})
YIELD path, totalCost
RETURN path, totalCost
ORDER BY totalCost
LIMIT 5;
\`\`\`

#### Multi-criteria Optimization
\`\`\`cypher
// Find optimal route considering time, cost, and comfort
MATCH (source:Station {code: 'MUM'}), (destination:Station {code: 'DEL'})
CALL gds.shortestPath.dijkstra.stream('railwayGraph', {
  sourceNode: source,
  targetNode: destination,
  relationshipWeightProperty: 'compositeScore'
})
YIELD path, totalCost
RETURN path, totalCost
ORDER BY totalCost
LIMIT 10;
\`\`\`

#### Alternative Routes
\`\`\`cypher
// Find alternative routes with different criteria
MATCH (source:Station {code: 'MUM'}), (destination:Station {code: 'DEL'})
CALL gds.allShortestPaths.dijkstra.stream('railwayGraph', {
  sourceNode: source,
  targetNode: destination,
  relationshipWeightProperty: 'distance'
})
YIELD path, totalCost
RETURN path, totalCost
ORDER BY totalCost
LIMIT 20;
\`\`\`

### Performance Optimization

#### Indexes and Constraints
\`\`\`cypher
// Create constraints for uniqueness
CREATE CONSTRAINT station_code_unique FOR (s:Station) REQUIRE s.code IS UNIQUE;
CREATE CONSTRAINT train_number_unique FOR (t:Train) REQUIRE t.number IS UNIQUE;

// Create indexes for performance
CREATE INDEX station_name_index FOR (s:Station) ON (s.name);
CREATE INDEX station_location_index FOR (s:Station) ON (s.latitude, s.longitude);
CREATE INDEX train_name_index FOR (t:Train) ON (t.name);

// Create full-text search indexes
CREATE FULLTEXT INDEX station_search FOR (s:Station) ON EACH [s.name, s.code];
CREATE FULLTEXT INDEX train_search FOR (t:Train) ON EACH [t.name, t.number];
\`\`\`

#### Graph Algorithms
\`\`\`cypher
// Create graph projection for algorithms
CALL gds.graph.project(
  'railwayGraph',
  ['Station', 'Train'],
  {
    CONNECTED_TO: {
      properties: ['distance', 'duration', 'fare', 'departureTime', 'arrivalTime']
    },
    OPERATES_ON: {
      properties: ['distance', 'duration', 'fare']
    }
  }
);

// Run PageRank algorithm for station importance
CALL gds.pageRank.stream('railwayGraph')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS station, score
ORDER BY score DESC
LIMIT 10;
\`\`\`

## Redis - Cache and Session Store

### Cache Strategy

#### Application Cache
\`\`\`typescript
import Redis from 'ioredis';

class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: 0,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }
}
\`\`\`

#### Cache Patterns
\`\`\`typescript
// Cache-aside pattern
class TrainService {
  private cache: CacheService;

  async getTrain(trainNumber: string): Promise<Train | null> {
    const cacheKey = \`train:\${trainNumber}\`;
    
    // Try to get from cache first
    let train = await this.cache.get<Train>(cacheKey);
    
    if (!train) {
      // Cache miss - get from database
      train = await this.database.getTrain(trainNumber);
      
      if (train) {
        // Store in cache for 1 hour
        await this.cache.set(cacheKey, train, 3600);
      }
    }
    
    return train;
  }

  async updateTrain(trainNumber: string, updates: Partial<Train>): Promise<void> {
    // Update database
    await this.database.updateTrain(trainNumber, updates);
    
    // Invalidate cache
    const cacheKey = \`train:\${trainNumber}\`;
    await this.cache.del(cacheKey);
  }
}
\`\`\`

#### Session Management
\`\`\`typescript
class SessionService {
  private redis: Redis;

  async createSession(userId: string, deviceId: string): Promise<string> {
    const sessionId = generateSessionId();
    const sessionData = {
      userId,
      deviceId,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      isActive: true
    };

    await this.redis.setex(
      \`session:\${sessionId}\`,
      86400, // 24 hours
      JSON.stringify(sessionData)
    );

    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const sessionData = await this.redis.get(\`session:\${sessionId}\`);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  async updateSession(sessionId: string, updates: Partial<SessionData>): Promise<void> {
    const sessionData = await this.getSession(sessionId);
    if (sessionData) {
      const updatedData = { ...sessionData, ...updates };
      await this.redis.setex(
        \`session:\${sessionId}\`,
        86400,
        JSON.stringify(updatedData)
      );
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.redis.del(\`session:\${sessionId}\`);
  }
}
\`\`\`

### Performance Optimization

#### Redis Clustering
\`\`\`typescript
import { Cluster } from 'ioredis';

const cluster = new Cluster([
  { host: 'redis-node-1', port: 6379 },
  { host: 'redis-node-2', port: 6379 },
  { host: 'redis-node-3', port: 6379 }
], {
  redisOptions: {
    password: process.env.REDIS_PASSWORD
  },
  enableOfflineQueue: false,
  maxRetriesPerRequest: 3
});
\`\`\`

#### Memory Optimization
\`\`\`bash
# Redis configuration for memory optimization
maxmemory 2gb
maxmemory-policy allkeys-lru
hash-max-ziplist-entries 512
hash-max-ziplist-value 64
list-max-ziplist-size -2
set-max-intset-entries 512
\`\`\`

## MongoDB - Document Store

### Schema Design

#### Collections
\`\`\`javascript
// Notifications collection
db.notifications.createIndex({ "userId": 1, "createdAt": -1 });
db.notifications.createIndex({ "type": 1, "status": 1 });
db.notifications.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

// User profiles collection
db.user_profiles.createIndex({ "email": 1 }, { unique: true });
db.user_profiles.createIndex({ "preferences.travelClass": 1 });
db.user_profiles.createIndex({ "preferences.berthPreference": 1 });

// Train positions collection
db.train_positions.createIndex({ "trainId": 1, "timestamp": 1 });
db.train_positions.createIndex({ "location": "2dsphere" });
db.train_positions.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 604800 }); // 7 days TTL

// Booking analytics collection
db.booking_analytics.createIndex({ "date": 1 });
db.booking_analytics.createIndex({ "userId": 1, "date": 1 });
db.booking_analytics.createIndex({ "trainId": 1, "date": 1 });
\`\`\`

#### Document Structure
\`\`\`javascript
// Notification document
{
  _id: ObjectId("..."),
  userId: "user-123",
  type: "booking_confirmation",
  title: "Booking Confirmed",
  message: "Your booking PNR123456 has been confirmed",
  data: {
    pnr: "PNR123456",
    trainNumber: "12951",
    journeyDate: "2024-02-01"
  },
  status: "unread",
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  readAt: null
}

// User profile document
{
  _id: ObjectId("..."),
  userId: "user-123",
  email: "user@example.com",
  preferences: {
    travelClass: "AC2",
    berthPreference: "LB",
    mealPreference: "vegetarian",
    notifications: {
      email: true,
      sms: true,
      push: true
    }
  },
  frequentTravelers: [
    {
      name: "John Doe",
      age: 30,
      gender: "M",
      idProof: "Aadhaar",
      idNumber: "123456789012"
    }
  ],
  addressBook: [
    {
      type: "home",
      street: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    }
  ],
  createdAt: ISODate("2024-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-01T00:00:00Z")
}

// Train position document
{
  _id: ObjectId("..."),
  trainId: "train-123",
  trainNumber: "12951",
  location: {
    type: "Point",
    coordinates: [72.8333, 18.9667]
  },
  speed: 80,
  direction: "North",
  delay: 15,
  nextStation: "Vadodara Junction",
  eta: ISODate("2024-01-01T22:30:00Z"),
  timestamp: ISODate("2024-01-01T20:00:00Z")
}
\`\`\`

### Performance Optimization

#### Sharding Strategy
\`\`\`javascript
// Enable sharding
sh.enableSharding("railconnect");

// Shard collections
sh.shardCollection("railconnect.notifications", { "userId": 1 });
sh.shardCollection("railconnect.train_positions", { "trainId": 1, "timestamp": 1 });
sh.shardCollection("railconnect.booking_analytics", { "date": 1 });
\`\`\`

#### Aggregation Pipelines
\`\`\`javascript
// User booking statistics
db.bookings.aggregate([
  {
    $match: {
      userId: "user-123",
      status: "confirmed"
    }
  },
  {
    $group: {
      _id: "$userId",
      totalBookings: { $sum: 1 },
      totalSpent: { $sum: "$totalFare" },
      avgFare: { $avg: "$totalFare" },
      lastBooking: { $max: "$bookingDate" }
    }
  }
]);

// Popular routes analysis
db.bookings.aggregate([
  {
    $match: {
      status: "confirmed",
      journeyDate: { $gte: new Date("2024-01-01") }
    }
  },
  {
    $group: {
      _id: {
        source: "$sourceStation",
        destination: "$destinationStation"
      },
      bookingCount: { $sum: 1 },
      totalRevenue: { $sum: "$totalFare" }
    }
  },
  {
    $sort: { bookingCount: -1 }
  },
  {
    $limit: 10
  }
]);
\`\`\`

## Elasticsearch - Search Engine

### Index Configuration

#### Station Index
\`\`\`json
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "keyword": {
            "type": "keyword"
          },
          "suggest": {
            "type": "completion"
          }
        }
      },
      "code": {
        "type": "keyword"
      },
      "city": {
        "type": "text",
        "analyzer": "standard"
      },
      "state": {
        "type": "keyword"
      },
      "location": {
        "type": "geo_point"
      },
      "facilities": {
        "type": "keyword"
      }
    }
  },
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "station_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "asciifolding"]
        }
      }
    }
  }
}
\`\`\`

#### Train Index
\`\`\`json
{
  "mappings": {
    "properties": {
      "name": {
        "type": "text",
        "analyzer": "standard"
      },
      "number": {
        "type": "keyword"
      },
      "type": {
        "type": "keyword"
      },
      "sourceStation": {
        "type": "keyword"
      },
      "destinationStation": {
        "type": "keyword"
      },
      "classes": {
        "type": "keyword"
      },
      "amenities": {
        "type": "keyword"
      },
      "runningDays": {
        "type": "keyword"
      }
    }
  }
}
\`\`\`

### Search Queries

#### Station Search
\`\`\`javascript
// Fuzzy station search
const searchStations = async (query) => {
  const response = await client.search({
    index: 'stations',
    body: {
      query: {
        bool: {
          should: [
            {
              match: {
                name: {
                  query: query,
                  fuzziness: 'AUTO'
                }
              }
            },
            {
              match: {
                code: {
                  query: query,
                  boost: 2
                }
              }
            },
            {
              match: {
                city: {
                  query: query,
                  fuzziness: 'AUTO'
                }
              }
            }
          ]
        }
      },
      highlight: {
        fields: {
          name: {},
          city: {}
        }
      }
    }
  });

  return response.body.hits.hits;
};
\`\`\`

#### Geospatial Search
\`\`\`javascript
// Find nearby stations
const findNearbyStations = async (latitude, longitude, radius) => {
  const response = await client.search({
    index: 'stations',
    body: {
      query: {
        geo_distance: {
          distance: \`\${radius}km\`,
          location: {
            lat: latitude,
            lon: longitude
          }
        }
      },
      sort: [
        {
          _geo_distance: {
            location: {
              lat: latitude,
              lon: longitude
            },
            order: 'asc',
            unit: 'km'
          }
        }
      ]
    }
  });

  return response.body.hits.hits;
};
\`\`\`

## Data Consistency and Transactions

### Distributed Transactions

#### Saga Pattern
\`\`\`typescript
class BookingSaga {
  async executeBooking(bookingData: BookingData): Promise<void> {
    const sagaId = generateSagaId();
    
    try {
      // Step 1: Reserve seats
      await this.reserveSeats(sagaId, bookingData);
      
      // Step 2: Create booking
      await this.createBooking(sagaId, bookingData);
      
      // Step 3: Process payment
      await this.processPayment(sagaId, bookingData);
      
      // Step 4: Send confirmation
      await this.sendConfirmation(sagaId, bookingData);
      
    } catch (error) {
      // Compensate for completed steps
      await this.compensate(sagaId, error);
      throw error;
    }
  }

  private async compensate(sagaId: string, error: Error): Promise<void> {
    // Implement compensation logic
    await this.releaseSeats(sagaId);
    await this.cancelBooking(sagaId);
    await this.refundPayment(sagaId);
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
    // Store events in event store
    await this.storeEvents(aggregateId, events);
    
    // Publish events for other services
    await this.publishEvents(events);
  }

  async getEvents(aggregateId: string, fromVersion: number = 0): Promise<DomainEvent[]> {
    return await this.retrieveEvents(aggregateId, fromVersion);
  }
}
\`\`\`

## Backup and Recovery

### Backup Strategy

#### PostgreSQL Backup
\`\`\`bash
#!/bin/bash
# PostgreSQL backup script

BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="railconnect_prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Full backup
pg_dump -h localhost -U railconnect_user -d $DB_NAME \\
  --format=custom \\
  --compress=9 \\
  --file="$BACKUP_DIR/full_backup_$DATE.dump"

# Incremental backup (WAL files)
pg_basebackup -h localhost -U railconnect_user \\
  -D "$BACKUP_DIR/incremental_$DATE" \\
  -Ft -z -P

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.dump" -mtime +30 -delete
find $BACKUP_DIR -name "incremental_*" -mtime +30 -exec rm -rf {} \\;
\`\`\`

#### Redis Backup
\`\`\`bash
#!/bin/bash
# Redis backup script

BACKUP_DIR="/backups/redis"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# RDB backup
redis-cli -h localhost -p 6379 BGSAVE
cp /var/lib/redis/dump.rdb "$BACKUP_DIR/redis_backup_$DATE.rdb"

# AOF backup
cp /var/lib/redis/appendonly.aof "$BACKUP_DIR/redis_aof_$DATE.aof"

# Cleanup old backups
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete
find $BACKUP_DIR -name "*.aof" -mtime +7 -delete
\`\`\`

### Recovery Procedures

#### Point-in-Time Recovery
\`\`\`bash
#!/bin/bash
# PostgreSQL point-in-time recovery

BACKUP_FILE="/backups/postgresql/full_backup_20240101_120000.dump"
TARGET_TIME="2024-01-01 15:30:00"

# Stop PostgreSQL
systemctl stop postgresql

# Restore from backup
pg_restore -h localhost -U railconnect_user -d railconnect_prod \\
  --clean --if-exists \\
  $BACKUP_FILE

# Apply WAL files up to target time
pg_receivewal -h localhost -U railconnect_user \\
  --directory=/var/lib/postgresql/wal_archive \\
  --until="$TARGET_TIME"

# Start PostgreSQL
systemctl start postgresql
\`\`\`

## Monitoring and Maintenance

### Database Monitoring

#### Performance Metrics
\`\`\`typescript
class DatabaseMonitor {
  async collectMetrics(): Promise<DatabaseMetrics> {
    const metrics = {
      postgresql: await this.getPostgreSQLMetrics(),
      redis: await this.getRedisMetrics(),
      mongodb: await this.getMongoDBMetrics(),
      neo4j: await this.getNeo4jMetrics(),
      elasticsearch: await this.getElasticsearchMetrics()
    };

    return metrics;
  }

  private async getPostgreSQLMetrics(): Promise<PostgreSQLMetrics> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(\`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity
      \`);
      
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}
\`\`\`

#### Health Checks
\`\`\`typescript
class DatabaseHealthCheck {
  async checkPostgreSQL(): Promise<HealthStatus> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      return { status: 'healthy', responseTime: Date.now() - startTime };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkRedis(): Promise<HealthStatus> {
    try {
      const startTime = Date.now();
      await this.redis.ping();
      return { status: 'healthy', responseTime: Date.now() - startTime };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}
\`\`\`

### Maintenance Tasks

#### Automated Maintenance
\`\`\`typescript
class DatabaseMaintenance {
  async runMaintenanceTasks(): Promise<void> {
    // PostgreSQL maintenance
    await this.vacuumPostgreSQL();
    await this.analyzePostgreSQL();
    await this.reindexPostgreSQL();
    
    // Redis maintenance
    await this.cleanupRedis();
    
    // MongoDB maintenance
    await this.optimizeMongoDB();
    
    // Neo4j maintenance
    await this.optimizeNeo4j();
    
    // Elasticsearch maintenance
    await this.optimizeElasticsearch();
  }

  private async vacuumPostgreSQL(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('VACUUM ANALYZE');
    } finally {
      client.release();
    }
  }

  private async cleanupRedis(): Promise<void> {
    // Remove expired keys
    await this.redis.eval(\`
      local keys = redis.call('keys', '*')
      for i=1,#keys do
        local ttl = redis.call('ttl', keys[i])
        if ttl == -1 then
          redis.call('del', keys[i])
        end
      end
    \`, 0);
  }
}
\`\`\`

---

This database architecture provides a robust, scalable, and high-performance foundation for RailConnect India. The polyglot persistence approach ensures optimal performance for different use cases while maintaining data consistency and reliability.
`;export{n as default};
