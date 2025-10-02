const n=`# Security Implementation

## Overview

RailConnect India implements comprehensive security measures to protect user data, ensure secure transactions, and maintain system integrity. This document outlines the security architecture, implementation details, and best practices.

## Security Architecture

### Security Layers

\`\`\`mermaid
graph TB
    subgraph "Client Security"
        CSP[Content Security Policy]
        HTTPS[HTTPS/TLS 1.3]
        XSS[XSS Protection]
        CSRF[CSRF Protection]
    end
    
    subgraph "Network Security"
        WAF[Web Application Firewall]
        DDoS[DDoS Protection]
        VPC[VPC Isolation]
        SG[Security Groups]
    end
    
    subgraph "Application Security"
        AUTH[Authentication]
        AUTHZ[Authorization]
        VALID[Input Validation]
        RATE[Rate Limiting]
    end
    
    subgraph "Data Security"
        ENCRYPT[Encryption at Rest]
        TRANSPORT[Encryption in Transit]
        MASK[Data Masking]
        BACKUP[Secure Backups]
    end
    
    subgraph "Infrastructure Security"
        IAM[IAM Roles]
        SECRETS[Secrets Management]
        MONITOR[Security Monitoring]
        AUDIT[Audit Logging]
    end
\`\`\`

## Authentication & Authorization

### JWT Implementation

#### Token Structure
\`\`\`typescript
interface JWTPayload {
  sub: string;           // User ID
  email: string;         // User email
  roles: string[];       // User roles
  sessionId: string;     // Session identifier
  deviceId: string;      // Device fingerprint
  iat: number;          // Issued at
  exp: number;          // Expires at
  jti: string;          // JWT ID
}

interface RefreshTokenPayload {
  sub: string;           // User ID
  sessionId: string;     // Session identifier
  deviceId: string;      // Device fingerprint
  iat: number;          // Issued at
  exp: number;          // Expires at
  jti: string;          // JWT ID
}
\`\`\`

#### Token Generation
\`\`\`typescript
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

class JWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string = '15m';
  private readonly refreshTokenExpiry: string = '7d';

  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET!;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;
  }

  generateTokens(user: User, sessionId: string, deviceId: string) {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      sessionId,
      deviceId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
      jti: uuidv4()
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      sessionId,
      deviceId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 604800, // 7 days
      jti: uuidv4()
    };

    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      algorithm: 'HS256'
    });

    const refreshToken = jwt.sign(refreshPayload, this.refreshTokenSecret, {
      algorithm: 'HS256'
    });

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as RefreshTokenPayload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
\`\`\`

### Multi-Factor Authentication (MFA)

#### TOTP Implementation
\`\`\`typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

class MFAService {
  generateSecret(userEmail: string): { secret: string; qrCode: string } {
    const secret = speakeasy.generateSecret({
      name: \`RailConnect (\${userEmail})\`,
      issuer: 'RailConnect India',
      length: 32
    });

    const qrCode = QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode
    };
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps tolerance
    });
  }

  generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }
}
\`\`\`

### Biometric Authentication

#### WebAuthn Implementation
\`\`\`typescript
interface WebAuthnCredential {
  id: string;
  publicKey: string;
  counter: number;
  transports: string[];
  userAgent: string;
  createdAt: Date;
}

class BiometricAuthService {
  async registerCredential(userId: string, credential: any): Promise<void> {
    const credentialData: WebAuthnCredential = {
      id: credential.id,
      publicKey: credential.publicKey,
      counter: credential.counter || 0,
      transports: credential.transports || [],
      userAgent: credential.userAgent,
      createdAt: new Date()
    };

    await this.storeCredential(userId, credentialData);
  }

  async verifyCredential(userId: string, credentialId: string): Promise<boolean> {
    const credential = await this.getCredential(userId, credentialId);
    if (!credential) {
      return false;
    }

    // Verify credential using WebAuthn API
    return this.verifyWebAuthnCredential(credential);
  }

  private async verifyWebAuthnCredential(credential: WebAuthnCredential): Promise<boolean> {
    // Implementation depends on WebAuthn library
    // This is a simplified example
    return true;
  }
}
\`\`\`

## Input Validation & Sanitization

### Request Validation

#### Zod Schemas
\`\`\`typescript
import { z } from 'zod';

// User registration schema
const userRegistrationSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must be less than 100 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\\s]+$/, 'Last name can only contain letters and spaces'),
  phone: z.string()
    .regex(/^\\+91[6-9]\\d{9}$/, 'Invalid Indian phone number format')
});

// Train search schema
const trainSearchSchema = z.object({
  from: z.string()
    .min(3, 'Source station code must be at least 3 characters')
    .max(10, 'Source station code must be less than 10 characters')
    .regex(/^[A-Z]+$/, 'Station code must be uppercase letters'),
  to: z.string()
    .min(3, 'Destination station code must be at least 3 characters')
    .max(10, 'Destination station code must be less than 10 characters')
    .regex(/^[A-Z]+$/, 'Station code must be uppercase letters'),
  date: z.string()
    .regex(/^\\d{4}-\\d{2}-\\d{2}$/, 'Invalid date format')
    .refine((date) => {
      const inputDate = new Date(date);
      const today = new Date();
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 120); // 120 days in advance
      return inputDate >= today && inputDate <= maxDate;
    }, 'Date must be between today and 120 days in advance'),
  passengers: z.number()
    .int('Passengers must be an integer')
    .min(1, 'At least 1 passenger required')
    .max(6, 'Maximum 6 passengers allowed'),
  class: z.enum(['AC1', 'AC2', 'AC3', 'SL', 'CC', '2S'])
    .optional(),
  quota: z.enum(['General', 'Tatkal', 'Ladies', 'Senior Citizen', 'Divyang'])
    .optional()
});

// Booking schema
const bookingSchema = z.object({
  trainId: z.string()
    .uuid('Invalid train ID format'),
  journeyDate: z.string()
    .regex(/^\\d{4}-\\d{2}-\\d{2}$/, 'Invalid date format'),
  class: z.enum(['AC1', 'AC2', 'AC3', 'SL', 'CC', '2S']),
  quota: z.enum(['General', 'Tatkal', 'Ladies', 'Senior Citizen', 'Divyang']),
  passengers: z.array(z.object({
    name: z.string()
      .min(1, 'Passenger name is required')
      .max(100, 'Passenger name must be less than 100 characters')
      .regex(/^[a-zA-Z\\s]+$/, 'Passenger name can only contain letters and spaces'),
    age: z.number()
      .int('Age must be an integer')
      .min(1, 'Age must be at least 1')
      .max(120, 'Age must be less than 120'),
    gender: z.enum(['M', 'F', 'O']),
    berthPreference: z.enum(['LB', 'MB', 'UB', 'SL', 'SU']).optional(),
    idProof: z.enum(['Aadhaar', 'PAN', 'Passport', 'Driving License']),
    idNumber: z.string()
      .min(10, 'ID number must be at least 10 characters')
      .max(20, 'ID number must be less than 20 characters')
  })).min(1, 'At least 1 passenger required').max(6, 'Maximum 6 passengers allowed')
});
\`\`\`

#### Validation Middleware
\`\`\`typescript
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        });
      }
      next(error);
    }
  };
}
\`\`\`

### SQL Injection Prevention

#### Parameterized Queries
\`\`\`typescript
import { Pool } from 'pg';

class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production'
    });
  }

  async getUserById(userId: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1 AND is_active = true';
    const values = [userId];
    
    try {
      const result = await this.pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error('Database query failed');
    }
  }

  async searchTrains(from: string, to: string, date: string): Promise<Train[]> {
    const query = \`
      SELECT t.*, r.departure_time, r.arrival_time, r.duration, r.fare
      FROM trains t
      JOIN routes r ON t.id = r.train_id
      WHERE r.source_station = $1 
        AND r.destination_station = $2
        AND r.journey_date = $3
        AND t.is_active = true
      ORDER BY r.departure_time
    \`;
    const values = [from, to, date];
    
    try {
      const result = await this.pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw new Error('Database query failed');
    }
  }
}
\`\`\`

### XSS Prevention

#### Input Sanitization
\`\`\`typescript
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

class SanitizationService {
  sanitizeHtml(input: string): string {
    return purify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }

  sanitizeText(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\\w+=/gi, '') // Remove event handlers
      .trim();
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email) && email.length <= 100;
  }

  validatePhone(phone: string): boolean {
    const phoneRegex = /^\\+91[6-9]\\d{9}$/;
    return phoneRegex.test(phone);
  }
}
\`\`\`

## Rate Limiting & DDoS Protection

### Redis-based Rate Limiting

#### Sliding Window Implementation
\`\`\`typescript
import Redis from 'ioredis';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
}

class RateLimitService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
  }

  async checkRateLimit(
    key: string, 
    windowMs: number, 
    maxRequests: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Remove expired entries
    await this.redis.zremrangebyscore(key, 0, windowStart);
    
    // Count current requests
    const currentRequests = await this.redis.zcard(key);
    
    if (currentRequests >= maxRequests) {
      const oldestRequest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
      const resetTime = oldestRequest.length > 0 ? 
        parseInt(oldestRequest[1]) + windowMs : now + windowMs;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime
      };
    }
    
    // Add current request
    await this.redis.zadd(key, now, now);
    await this.redis.expire(key, Math.ceil(windowMs / 1000));
    
    return {
      allowed: true,
      remaining: maxRequests - currentRequests - 1,
      resetTime: now + windowMs
    };
  }

  async checkUserRateLimit(userId: string, endpoint: string): Promise<boolean> {
    const key = \`rate_limit:user:\${userId}:\${endpoint}\`;
    const result = await this.checkRateLimit(key, 900000, 1000); // 15 minutes, 1000 requests
    return result.allowed;
  }

  async checkIPRateLimit(ip: string, endpoint: string): Promise<boolean> {
    const key = \`rate_limit:ip:\${ip}:\${endpoint}\`;
    const result = await this.checkRateLimit(key, 900000, 100); // 15 minutes, 100 requests
    return result.allowed;
  }
}
\`\`\`

#### Rate Limiting Middleware
\`\`\`typescript
import { Request, Response, NextFunction } from 'express';
import { RateLimitService } from '../services/RateLimitService';

const rateLimitService = new RateLimitService();

export function rateLimit(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = config.keyGenerator ? 
        config.keyGenerator(req) : 
        \`rate_limit:\${req.ip}:\${req.path}\`;
      
      const result = await rateLimitService.checkRateLimit(
        key,
        config.windowMs,
        config.maxRequests
      );
      
      if (!result.allowed) {
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
          }
        });
      }
      
      res.set({
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetTime.toString()
      });
      
      next();
    } catch (error) {
      next(error);
    }
  };
}
\`\`\`

## Data Encryption

### Encryption at Rest

#### Database Encryption
\`\`\`typescript
import crypto from 'crypto';

class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    this.key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);
  }

  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('railconnect', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(this.algorithm, this.key);
    decipher.setAAD(Buffer.from('railconnect', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  hashPassword(password: string): string {
    return crypto.pbkdf2Sync(password, process.env.PASSWORD_SALT!, 100000, 64, 'sha512').toString('hex');
  }

  verifyPassword(password: string, hash: string): boolean {
    const passwordHash = this.hashPassword(password);
    return crypto.timingSafeEqual(Buffer.from(passwordHash), Buffer.from(hash));
  }
}
\`\`\`

### Encryption in Transit

#### TLS Configuration
\`\`\`typescript
import https from 'https';
import fs from 'fs';

const tlsOptions = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem'),
  ca: fs.readFileSync('path/to/ca-bundle.pem'),
  secureProtocol: 'TLSv1_3_method',
  ciphers: [
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-SHA384',
    'ECDHE-RSA-AES128-SHA256'
  ].join(':'),
  honorCipherOrder: true,
  secureOptions: require('constants').SSL_OP_NO_SSLv2 | require('constants').SSL_OP_NO_SSLv3
};

const server = https.createServer(tlsOptions, app);
\`\`\`

## Security Headers

### Helmet Configuration
\`\`\`typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.railconnect.in"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'"],
      childSrc: ["'none'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: ['self'],
    payment: ['self']
  }
}));
\`\`\`

## Security Monitoring

### Security Event Logging
\`\`\`typescript
import winston from 'winston';

interface SecurityEvent {
  eventType: 'AUTHENTICATION' | 'AUTHORIZATION' | 'DATA_ACCESS' | 'SECURITY_VIOLATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: any;
}

class SecurityLogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'logs/security.log' }),
        new winston.transports.Console()
      ]
    });
  }

  logSecurityEvent(event: SecurityEvent): void {
    this.logger.info('Security Event', {
      ...event,
      timestamp: event.timestamp.toISOString()
    });
  }

  logAuthenticationAttempt(userId: string, ipAddress: string, success: boolean): void {
    this.logSecurityEvent({
      eventType: 'AUTHENTICATION',
      severity: success ? 'LOW' : 'MEDIUM',
      userId,
      ipAddress,
      userAgent: 'Unknown',
      timestamp: new Date(),
      details: { success }
    });
  }

  logAuthorizationFailure(userId: string, resource: string, action: string): void {
    this.logSecurityEvent({
      eventType: 'AUTHORIZATION',
      severity: 'HIGH',
      userId,
      ipAddress: 'Unknown',
      userAgent: 'Unknown',
      timestamp: new Date(),
      details: { resource, action }
    });
  }

  logSecurityViolation(ipAddress: string, violationType: string, details: any): void {
    this.logSecurityEvent({
      eventType: 'SECURITY_VIOLATION',
      severity: 'CRITICAL',
      ipAddress,
      userAgent: 'Unknown',
      timestamp: new Date(),
      details: { violationType, ...details }
    });
  }
}
\`\`\`

### Intrusion Detection
\`\`\`typescript
class IntrusionDetectionService {
  private securityLogger: SecurityLogger;
  private rateLimitService: RateLimitService;

  constructor() {
    this.securityLogger = new SecurityLogger();
    this.rateLimitService = new RateLimitService();
  }

  async detectSuspiciousActivity(req: Request): Promise<boolean> {
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent') || '';
    
    // Check for common attack patterns
    const suspiciousPatterns = [
      /script/i,
      /javascript/i,
      /onload/i,
      /onerror/i,
      /eval/i,
      /expression/i,
      /vbscript/i,
      /<script/i,
      /<\\/script>/i
    ];

    const url = req.url;
    const body = JSON.stringify(req.body);

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url) || pattern.test(body)) {
        this.securityLogger.logSecurityViolation(
          ipAddress,
          'XSS_ATTEMPT',
          { url, userAgent }
        );
        return true;
      }
    }

    // Check for SQL injection patterns
    const sqlPatterns = [
      /union\\s+select/i,
      /drop\\s+table/i,
      /delete\\s+from/i,
      /insert\\s+into/i,
      /update\\s+set/i,
      /'\\s*or\\s*'/i,
      /"\\s*or\\s*"/i,
      /'\\s*and\\s*'/i,
      /"\\s*and\\s*"/i
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(url) || pattern.test(body)) {
        this.securityLogger.logSecurityViolation(
          ipAddress,
          'SQL_INJECTION_ATTEMPT',
          { url, userAgent }
        );
        return true;
      }
    }

    return false;
  }

  async checkBruteForceAttempt(ipAddress: string, userId?: string): Promise<boolean> {
    const key = userId ? 
      \`brute_force:user:\${userId}\` : 
      \`brute_force:ip:\${ipAddress}\`;
    
    const result = await this.rateLimitService.checkRateLimit(key, 300000, 5); // 5 minutes, 5 attempts
    
    if (!result.allowed) {
      this.securityLogger.logSecurityViolation(
        ipAddress,
        'BRUTE_FORCE_ATTEMPT',
        { userId, attempts: 5 }
      );
      return true;
    }

    return false;
  }
}
\`\`\`

## Compliance & Auditing

### GDPR Compliance
\`\`\`typescript
class GDPRComplianceService {
  async exportUserData(userId: string): Promise<any> {
    // Export all user data
    const userData = {
      profile: await this.getUserProfile(userId),
      bookings: await this.getUserBookings(userId),
      payments: await this.getUserPayments(userId),
      preferences: await this.getUserPreferences(userId),
      auditLog: await this.getUserAuditLog(userId)
    };

    return userData;
  }

  async deleteUserData(userId: string): Promise<void> {
    // Anonymize user data instead of hard delete
    await this.anonymizeUserProfile(userId);
    await this.anonymizeUserBookings(userId);
    await this.anonymizeUserPayments(userId);
    await this.deleteUserPreferences(userId);
    await this.deleteUserAuditLog(userId);
  }

  async anonymizeUserProfile(userId: string): Promise<void> {
    const anonymizedData = {
      email: \`deleted_\${userId}@deleted.com\`,
      username: \`deleted_\${userId}\`,
      firstName: 'Deleted',
      lastName: 'User',
      phone: null,
      address: null
    };

    await this.updateUserProfile(userId, anonymizedData);
  }
}
\`\`\`

### PCI DSS Compliance
\`\`\`typescript
class PCIDSSComplianceService {
  async processPayment(paymentData: any): Promise<any> {
    // Never store sensitive payment data
    const sanitizedData = {
      amount: paymentData.amount,
      currency: paymentData.currency,
      description: paymentData.description,
      // Remove sensitive fields
      cardNumber: undefined,
      cvv: undefined,
      expiryDate: undefined
    };

    // Use tokenization for card data
    if (paymentData.cardToken) {
      sanitizedData.cardToken = paymentData.cardToken;
    }

    return this.processPaymentWithGateway(sanitizedData);
  }

  async maskCardNumber(cardNumber: string): string {
    if (cardNumber.length < 8) {
      return '****';
    }
    
    const firstFour = cardNumber.substring(0, 4);
    const lastFour = cardNumber.substring(cardNumber.length - 4);
    const middle = '*'.repeat(cardNumber.length - 8);
    
    return \`\${firstFour}\${middle}\${lastFour}\`;
  }
}
\`\`\`

## Security Testing

### Automated Security Testing
\`\`\`typescript
import { SecurityScanner } from '../tests/security/owasp-zap-scan';

class SecurityTestingService {
  async runSecurityTests(): Promise<void> {
    const scanner = new SecurityScanner();
    
    // Run OWASP ZAP scan
    await scanner.runFullSecurityScan();
    
    // Run dependency vulnerability scan
    await this.runDependencyScan();
    
    // Run SAST scan
    await this.runSASTScan();
    
    // Run container security scan
    await this.runContainerScan();
  }

  async runDependencyScan(): Promise<void> {
    // Use npm audit or similar tool
    const { exec } = require('child_process');
    
    return new Promise((resolve, reject) => {
      exec('npm audit --audit-level moderate', (error, stdout, stderr) => {
        if (error) {
          console.error('Dependency vulnerabilities found:', error);
          reject(error);
        } else {
          console.log('Dependency scan completed:', stdout);
          resolve();
        }
      });
    });
  }
}
\`\`\`

## Security Best Practices

### 1. Authentication
- Use strong password policies
- Implement account lockout after failed attempts
- Use multi-factor authentication
- Implement session management
- Use secure token storage

### 2. Authorization
- Implement role-based access control
- Use principle of least privilege
- Validate permissions on every request
- Implement resource-level authorization
- Use attribute-based access control

### 3. Data Protection
- Encrypt sensitive data at rest
- Use TLS 1.3 for data in transit
- Implement data masking for logs
- Use secure key management
- Implement data retention policies

### 4. Input Validation
- Validate all input data
- Use whitelist validation
- Implement input sanitization
- Use parameterized queries
- Implement output encoding

### 5. Security Monitoring
- Log all security events
- Implement real-time monitoring
- Use automated threat detection
- Implement incident response procedures
- Regular security audits

### 6. Compliance
- Follow GDPR requirements
- Implement PCI DSS compliance
- Use SOC 2 controls
- Implement ISO 27001 standards
- Regular compliance audits

---

This security implementation provides comprehensive protection for RailConnect India, ensuring user data security, secure transactions, and system integrity. Regular security audits and updates are essential to maintain the security posture.
`;export{n as default};
