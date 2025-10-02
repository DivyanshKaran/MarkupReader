const n=`# Security Architecture

## Overview

RailConnect India implements a comprehensive security architecture that protects user data, ensures secure transactions, and maintains system integrity across all components.

## Security Principles

### Defense in Depth
- **Multiple Layers**: Security controls at network, application, and data layers
- **Fail-Safe Defaults**: Secure by default configurations
- **Least Privilege**: Minimal access rights for users and services
- **Separation of Concerns**: Isolated security domains

### Zero Trust Architecture
- **Never Trust, Always Verify**: All requests are authenticated and authorized
- **Micro-segmentation**: Network isolation between services
- **Continuous Monitoring**: Real-time security monitoring and alerting
- **Identity-Centric**: Security based on user and device identity

## Authentication & Authorization

### Multi-Factor Authentication (MFA)

#### TOTP Implementation
\`\`\`typescript
// services/auth/mfaService.ts
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export class MFAService {
  async generateSecret(userId: string): Promise<string> {
    const secret = authenticator.generateSecret();
    
    // Store secret securely
    await this.encryptedStorage.set(\`mfa:\${userId}\`, secret);
    
    return secret;
  }

  async generateQRCode(userId: string, email: string): Promise<string> {
    const secret = await this.getSecret(userId);
    const otpauth = authenticator.keyuri(email, 'RailConnect India', secret);
    
    return await QRCode.toDataURL(otpauth);
  }

  async verifyToken(userId: string, token: string): Promise<boolean> {
    const secret = await this.getSecret(userId);
    return authenticator.verify({ token, secret });
  }

  async generateBackupCodes(userId: string): Promise<string[]> {
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    
    // Store hashed backup codes
    const hashedCodes = await Promise.all(
      codes.map(code => bcrypt.hash(code, 12))
    );
    
    await this.encryptedStorage.set(\`backup:\${userId}\`, hashedCodes);
    
    return codes;
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const hashedCodes = await this.encryptedStorage.get(\`backup:\${userId}\`);
    
    for (const hashedCode of hashedCodes) {
      if (await bcrypt.compare(code, hashedCode)) {
        // Remove used backup code
        await this.removeBackupCode(userId, hashedCode);
        return true;
      }
    }
    
    return false;
  }
}
\`\`\`

#### Biometric Authentication
\`\`\`typescript
// services/auth/biometricService.ts
export class BiometricService {
  async registerBiometric(userId: string, biometricData: string): Promise<void> {
    // Encrypt biometric data
    const encryptedData = await this.encrypt(biometricData);
    
    // Store in secure hardware (if available)
    await this.secureStorage.set(\`biometric:\${userId}\`, encryptedData);
  }

  async verifyBiometric(userId: string, biometricData: string): Promise<boolean> {
    const storedData = await this.secureStorage.get(\`biometric:\${userId}\`);
    
    if (!storedData) {
      return false;
    }
    
    const decryptedData = await this.decrypt(storedData);
    
    // Compare biometric data (implementation depends on biometric type)
    return this.compareBiometric(biometricData, decryptedData);
  }

  private async encrypt(data: string): Promise<string> {
    const key = await this.getEncryptionKey();
    return await this.aesEncrypt(data, key);
  }

  private async decrypt(encryptedData: string): Promise<string> {
    const key = await this.getEncryptionKey();
    return await this.aesDecrypt(encryptedData, key);
  }
}
\`\`\`

### JWT Token Management

#### Token Generation and Validation
\`\`\`typescript
// services/auth/tokenService.ts
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

export class TokenService {
  private readonly accessTokenSecret = process.env.JWT_ACCESS_SECRET!;
  private readonly refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '7d';

  generateAccessToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'railconnect-api',
      audience: 'railconnect-client',
    });
  }

  generateRefreshToken(user: User): string {
    const jti = randomBytes(16).toString('hex');
    
    const payload = {
      sub: user.id,
      jti,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
      issuer: 'railconnect-api',
      audience: 'railconnect-client',
    });

    // Store refresh token metadata
    this.storeRefreshTokenMetadata(user.id, jti);

    return token;
  }

  async verifyAccessToken(token: string): Promise<JWTPayload> {
    try {
      const payload = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'railconnect-api',
        audience: 'railconnect-client',
      }) as JWTPayload;

      // Check if token is blacklisted
      if (await this.isTokenBlacklisted(token)) {
        throw new Error('Token is blacklisted');
      }

      return payload;
    } catch (error) {
      throw new AuthenticationError('Invalid access token');
    }
  }

  async verifyRefreshToken(token: string): Promise<JWTPayload> {
    try {
      const payload = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'railconnect-api',
        audience: 'railconnect-client',
      }) as JWTPayload;

      // Verify token metadata
      if (!await this.verifyRefreshTokenMetadata(payload.sub, payload.jti)) {
        throw new Error('Invalid refresh token metadata');
      }

      return payload;
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  async revokeToken(token: string): Promise<void> {
    // Add token to blacklist
    await this.blacklistToken(token);
    
    // Remove refresh token metadata
    const payload = jwt.decode(token) as JWTPayload;
    if (payload.jti) {
      await this.removeRefreshTokenMetadata(payload.sub, payload.jti);
    }
  }

  private async blacklistToken(token: string): Promise<void> {
    const payload = jwt.decode(token) as JWTPayload;
    const expiry = payload.exp - Math.floor(Date.now() / 1000);
    
    if (expiry > 0) {
      await this.redis.setex(\`blacklist:\${token}\`, expiry, '1');
    }
  }

  private async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.redis.get(\`blacklist:\${token}\`);
    return result === '1';
  }
}
\`\`\`

### Role-Based Access Control (RBAC)

#### Permission System
\`\`\`typescript
// services/auth/rbacService.ts
export class RBACService {
  private permissions: Map<string, Permission[]> = new Map();

  constructor() {
    this.initializePermissions();
  }

  private initializePermissions(): void {
    // User permissions
    this.permissions.set('user', [
      { resource: 'bookings', actions: ['read', 'create', 'update'] },
      { resource: 'profile', actions: ['read', 'update'] },
      { resource: 'payments', actions: ['read', 'create'] },
    ]);

    // Admin permissions
    this.permissions.set('admin', [
      { resource: '*', actions: ['*'] },
    ]);

    // Station manager permissions
    this.permissions.set('station_manager', [
      { resource: 'stations', actions: ['read', 'update'] },
      { resource: 'trains', actions: ['read'] },
      { resource: 'bookings', actions: ['read'] },
    ]);
  }

  async checkPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const user = await this.userService.getUser(userId);
    const userPermissions = this.permissions.get(user.role) || [];

    return userPermissions.some(permission => {
      const resourceMatch = permission.resource === '*' || 
                           permission.resource === resource;
      const actionMatch = permission.actions.includes('*') || 
                         permission.actions.includes(action);
      
      return resourceMatch && actionMatch;
    });
  }

  async enforcePermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<void> {
    const hasPermission = await this.checkPermission(userId, resource, action);
    
    if (!hasPermission) {
      throw new AuthorizationError(
        \`Access denied: \${action} on \${resource}\`
      );
    }
  }
}
\`\`\`

## Data Security

### Encryption at Rest

#### Database Encryption
\`\`\`typescript
// services/encryption/databaseEncryption.ts
import { createCipher, createDecipher, randomBytes } from 'crypto';

export class DatabaseEncryption {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    this.key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  }

  encrypt(data: string): EncryptedData {
    const iv = randomBytes(16);
    const cipher = createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('railconnect-db'));

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      data: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  decrypt(encryptedData: EncryptedData): string {
    const decipher = createDecipher(this.algorithm, this.key);
    decipher.setAAD(Buffer.from('railconnect-db'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Encrypt sensitive fields before database storage
  async encryptSensitiveFields(user: User): Promise<User> {
    const encryptedUser = { ...user };

    if (user.phone) {
      encryptedUser.phone = this.encrypt(user.phone);
    }

    if (user.dateOfBirth) {
      encryptedUser.dateOfBirth = this.encrypt(user.dateOfBirth);
    }

    return encryptedUser;
  }

  // Decrypt sensitive fields after database retrieval
  async decryptSensitiveFields(user: User): Promise<User> {
    const decryptedUser = { ...user };

    if (user.phone && typeof user.phone === 'object') {
      decryptedUser.phone = this.decrypt(user.phone);
    }

    if (user.dateOfBirth && typeof user.dateOfBirth === 'object') {
      decryptedUser.dateOfBirth = this.decrypt(user.dateOfBirth);
    }

    return decryptedUser;
  }
}
\`\`\`

#### File Encryption
\`\`\`typescript
// services/encryption/fileEncryption.ts
export class FileEncryption {
  async encryptFile(filePath: string, outputPath: string): Promise<void> {
    const key = await this.getFileEncryptionKey();
    const iv = randomBytes(16);
    
    const cipher = createCipher('aes-256-cbc', key);
    cipher.setAAD(Buffer.from('railconnect-files'));

    const input = fs.createReadStream(filePath);
    const output = fs.createWriteStream(outputPath);
    
    // Write IV to output file
    output.write(iv);
    
    input.pipe(cipher).pipe(output);
    
    return new Promise((resolve, reject) => {
      output.on('finish', resolve);
      output.on('error', reject);
    });
  }

  async decryptFile(encryptedFilePath: string, outputPath: string): Promise<void> {
    const key = await this.getFileEncryptionKey();
    
    const input = fs.createReadStream(encryptedFilePath);
    const output = fs.createWriteStream(outputPath);
    
    // Read IV from input file
    const iv = Buffer.alloc(16);
    await new Promise((resolve, reject) => {
      input.read(iv, 0, 16, 0, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });
    
    const decipher = createDecipher('aes-256-cbc', key);
    decipher.setAAD(Buffer.from('railconnect-files'));
    
    input.pipe(decipher).pipe(output);
    
    return new Promise((resolve, reject) => {
      output.on('finish', resolve);
      output.on('error', reject);
    });
  }
}
\`\`\`

### Encryption in Transit

#### TLS Configuration
\`\`\`typescript
// config/tls.ts
import { createServer } from 'https';
import { readFileSync } from 'fs';

export const tlsOptions = {
  key: readFileSync(process.env.TLS_KEY_PATH!),
  cert: readFileSync(process.env.TLS_CERT_PATH!),
  ca: readFileSync(process.env.TLS_CA_PATH!),
  secureProtocol: 'TLSv1_3_method',
  ciphers: [
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-SHA384',
    'ECDHE-RSA-AES128-SHA256',
  ].join(':'),
  honorCipherOrder: true,
  secureOptions: require('constants').SSL_OP_NO_SSLv2 | 
                 require('constants').SSL_OP_NO_SSLv3 |
                 require('constants').SSL_OP_NO_TLSv1 |
                 require('constants').SSL_OP_NO_TLSv1_1,
};

// Create HTTPS server
const server = createServer(tlsOptions, app);
\`\`\`

#### Certificate Management
\`\`\`typescript
// services/security/certificateService.ts
export class CertificateService {
  async generateSelfSignedCert(): Promise<Certificate> {
    const { generateKeyPairSync } = require('crypto');
    
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    const cert = this.generateCertificate(publicKey, privateKey);
    
    return {
      cert,
      key: privateKey,
      publicKey,
    };
  }

  async validateCertificate(cert: string): Promise<boolean> {
    try {
      const x509 = new X509Certificate(cert);
      
      // Check expiry
      if (x509.validTo < new Date()) {
        return false;
      }
      
      // Check issuer
      if (!x509.issuer.includes('RailConnect CA')) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async rotateCertificate(): Promise<void> {
    const newCert = await this.generateSelfSignedCert();
    
    // Update certificate in load balancer
    await this.loadBalancer.updateCertificate(newCert);
    
    // Update certificate in application
    await this.app.updateCertificate(newCert);
    
    // Clean up old certificate
    await this.cleanupOldCertificate();
  }
}
\`\`\`

## API Security

### Rate Limiting

#### Redis-based Rate Limiting
\`\`\`typescript
// middleware/rateLimiter.ts
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

export class RateLimiter {
  private redis: Redis;
  private rateLimiter: RateLimiterRedis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });

    this.rateLimiter = new RateLimiterRedis({
      storeClient: this.redis,
      keyPrefix: 'rl',
      points: 100, // Number of requests
      duration: 60, // Per 60 seconds
      blockDuration: 60, // Block for 60 seconds if limit exceeded
    });
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    try {
      await this.rateLimiter.consume(identifier);
      return { allowed: true };
    } catch (rejRes) {
      return {
        allowed: false,
        remainingPoints: rejRes.remainingPoints,
        msBeforeNext: rejRes.msBeforeNext,
        totalHits: rejRes.totalHits,
      };
    }
  }

  async checkLimitByUser(userId: string): Promise<RateLimitResult> {
    return this.checkLimit(\`user:\${userId}\`);
  }

  async checkLimitByIP(ip: string): Promise<RateLimitResult> {
    return this.checkLimit(\`ip:\${ip}\`);
  }
}

// Express middleware
export const rateLimitMiddleware = (rateLimiter: RateLimiter) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.user?.id || req.ip;
    const result = await rateLimiter.checkLimit(identifier);
    
    if (!result.allowed) {
      res.set({
        'Retry-After': Math.round(result.msBeforeNext / 1000),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': result.remainingPoints,
        'X-RateLimit-Reset': new Date(Date.now() + result.msBeforeNext),
      });
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: Math.round(result.msBeforeNext / 1000),
      });
    }
    
    next();
  };
};
\`\`\`

### Input Validation and Sanitization

#### Request Validation
\`\`\`typescript
// middleware/validation.ts
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
  
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .escape()
    .withMessage('First name is required and must be less than 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .escape()
    .withMessage('Last name is required and must be less than 50 characters'),
  
  body('phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Valid Indian mobile number is required'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }
    next();
  },
];

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize string inputs
  const sanitizeString = (str: string): string => {
    return str
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\\w+=/gi, '') // Remove event handlers
      .trim();
  };

  // Recursively sanitize object
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  
  next();
};
\`\`\`

### CSRF Protection

#### CSRF Token Implementation
\`\`\`typescript
// middleware/csrf.ts
import { randomBytes } from 'crypto';

export class CSRFProtection {
  private tokenStore: Map<string, string> = new Map();

  generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  setToken(sessionId: string, token: string): void {
    this.tokenStore.set(sessionId, token);
  }

  getToken(sessionId: string): string | undefined {
    return this.tokenStore.get(sessionId);
  }

  verifyToken(sessionId: string, token: string): boolean {
    const storedToken = this.getToken(sessionId);
    return storedToken === token;
  }

  removeToken(sessionId: string): void {
    this.tokenStore.delete(sessionId);
  }
}

// Express middleware
export const csrfMiddleware = (csrfProtection: CSRFProtection) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      // Generate and set CSRF token for GET requests
      const token = csrfProtection.generateToken();
      csrfProtection.setToken(req.sessionID, token);
      res.locals.csrfToken = token;
      return next();
    }

    // Verify CSRF token for other methods
    const token = req.headers['x-csrf-token'] as string;
    if (!token || !csrfProtection.verifyToken(req.sessionID, token)) {
      return res.status(403).json({
        error: 'CSRF token mismatch',
        message: 'Invalid or missing CSRF token',
      });
    }

    next();
  };
};
\`\`\`

## Infrastructure Security

### Network Security

#### VPC Configuration
\`\`\`typescript
// infrastructure/security/vpc.ts
export const vpcConfig = {
  cidr: '10.0.0.0/16',
  subnets: {
    public: [
      { cidr: '10.0.1.0/24', az: 'us-east-1a' },
      { cidr: '10.0.2.0/24', az: 'us-east-1b' },
    ],
    private: [
      { cidr: '10.0.10.0/24', az: 'us-east-1a' },
      { cidr: '10.0.20.0/24', az: 'us-east-1b' },
    ],
    database: [
      { cidr: '10.0.100.0/24', az: 'us-east-1a' },
      { cidr: '10.0.200.0/24', az: 'us-east-1b' },
    ],
  },
  securityGroups: {
    web: {
      ingress: [
        { protocol: 'tcp', port: 80, source: '0.0.0.0/0' },
        { protocol: 'tcp', port: 443, source: '0.0.0.0/0' },
      ],
      egress: [
        { protocol: 'tcp', port: 443, destination: '0.0.0.0/0' },
      ],
    },
    api: {
      ingress: [
        { protocol: 'tcp', port: 3000, source: '10.0.1.0/24' },
        { protocol: 'tcp', port: 3000, source: '10.0.2.0/24' },
      ],
      egress: [
        { protocol: 'tcp', port: 5432, destination: '10.0.100.0/24' },
        { protocol: 'tcp', port: 6379, destination: '10.0.100.0/24' },
      ],
    },
    database: {
      ingress: [
        { protocol: 'tcp', port: 5432, source: '10.0.10.0/24' },
        { protocol: 'tcp', port: 5432, source: '10.0.20.0/24' },
      ],
      egress: [],
    },
  },
};
\`\`\`

#### WAF Configuration
\`\`\`typescript
// infrastructure/security/waf.ts
export const wafRules = [
  {
    name: 'SQLInjectionRule',
    priority: 1,
    action: 'BLOCK',
    conditions: [
      {
        field: 'QUERY_STRING',
        operator: 'CONTAINS',
        value: ['union select', 'drop table', 'insert into', 'delete from'],
      },
    ],
  },
  {
    name: 'XSSRule',
    priority: 2,
    action: 'BLOCK',
    conditions: [
      {
        field: 'QUERY_STRING',
        operator: 'CONTAINS',
        value: ['<script', 'javascript:', 'onload=', 'onerror='],
      },
    ],
  },
  {
    name: 'RateLimitRule',
    priority: 3,
    action: 'BLOCK',
    conditions: [
      {
        field: 'RATE_LIMIT',
        operator: 'GREATER_THAN',
        value: 100,
      },
    ],
  },
  {
    name: 'GeoBlockingRule',
    priority: 4,
    action: 'BLOCK',
    conditions: [
      {
        field: 'COUNTRY',
        operator: 'NOT_IN',
        value: ['IN', 'US', 'GB', 'CA', 'AU'],
      },
    ],
  },
];
\`\`\`

### Container Security

#### Docker Security
\`\`\`dockerfile
# Dockerfile with security best practices
FROM node:18-alpine AS base

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Install security updates
RUN apk update && apk upgrade

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY --chown=nextjs:nodejs . .

# Build application
RUN npm run build

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
\`\`\`

#### Kubernetes Security
\`\`\`yaml
# security-context.yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    runAsGroup: 1001
    fsGroup: 1001
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: railconnect/app:latest
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
    resources:
      requests:
        memory: "256Mi"
        cpu: "250m"
      limits:
        memory: "512Mi"
        cpu: "500m"
    volumeMounts:
    - name: tmp
      mountPath: /tmp
    - name: var-cache
      mountPath: /var/cache
  volumes:
  - name: tmp
    emptyDir: {}
  - name: var-cache
    emptyDir: {}
\`\`\`

## Monitoring and Incident Response

### Security Monitoring

#### SIEM Integration
\`\`\`typescript
// services/security/siemService.ts
export class SIEMService {
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType: event.type,
      severity: event.severity,
      source: event.source,
      user: event.user,
      ip: event.ip,
      userAgent: event.userAgent,
      details: event.details,
      correlationId: event.correlationId,
    };

    // Send to SIEM system
    await this.sendToSIEM(logEntry);
    
    // Store locally for backup
    await this.storeLocally(logEntry);
    
    // Alert if high severity
    if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
      await this.sendAlert(event);
    }
  }

  async detectAnomalies(): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    
    // Detect unusual login patterns
    const loginAnomalies = await this.detectLoginAnomalies();
    anomalies.push(...loginAnomalies);
    
    // Detect unusual API usage
    const apiAnomalies = await this.detectAPIAnomalies();
    anomalies.push(...apiAnomalies);
    
    // Detect unusual payment patterns
    const paymentAnomalies = await this.detectPaymentAnomalies();
    anomalies.push(...paymentAnomalies);
    
    return anomalies;
  }

  private async detectLoginAnomalies(): Promise<Anomaly[]> {
    // Check for multiple failed login attempts
    const failedLogins = await this.getFailedLogins(5); // Last 5 minutes
    
    if (failedLogins.length > 5) {
      return [{
        type: 'MULTIPLE_FAILED_LOGINS',
        severity: 'HIGH',
        description: \`Multiple failed login attempts detected: \${failedLogins.length}\`,
        timestamp: new Date(),
        details: failedLogins,
      }];
    }
    
    return [];
  }
}
\`\`\`

#### Threat Detection
\`\`\`typescript
// services/security/threatDetection.ts
export class ThreatDetectionService {
  async analyzeRequest(req: Request): Promise<ThreatAnalysis> {
    const analysis: ThreatAnalysis = {
      riskScore: 0,
      threats: [],
      recommendations: [],
    };

    // Check for SQL injection patterns
    if (this.detectSQLInjection(req)) {
      analysis.riskScore += 80;
      analysis.threats.push({
        type: 'SQL_INJECTION',
        severity: 'HIGH',
        description: 'Potential SQL injection attempt detected',
      });
    }

    // Check for XSS patterns
    if (this.detectXSS(req)) {
      analysis.riskScore += 70;
      analysis.threats.push({
        type: 'XSS',
        severity: 'HIGH',
        description: 'Potential XSS attempt detected',
      });
    }

    // Check for suspicious user agent
    if (this.detectSuspiciousUserAgent(req)) {
      analysis.riskScore += 30;
      analysis.threats.push({
        type: 'SUSPICIOUS_USER_AGENT',
        severity: 'MEDIUM',
        description: 'Suspicious user agent detected',
      });
    }

    // Check for rate limiting violations
    if (await this.checkRateLimitViolation(req)) {
      analysis.riskScore += 50;
      analysis.threats.push({
        type: 'RATE_LIMIT_VIOLATION',
        severity: 'MEDIUM',
        description: 'Rate limit violation detected',
      });
    }

    return analysis;
  }

  private detectSQLInjection(req: Request): boolean {
    const sqlPatterns = [
      /union\\s+select/i,
      /drop\\s+table/i,
      /insert\\s+into/i,
      /delete\\s+from/i,
      /update\\s+set/i,
      /or\\s+1\\s*=\\s*1/i,
      /and\\s+1\\s*=\\s*1/i,
    ];

    const queryString = JSON.stringify(req.query);
    const bodyString = JSON.stringify(req.body);
    const paramsString = JSON.stringify(req.params);

    return sqlPatterns.some(pattern => 
      pattern.test(queryString) || 
      pattern.test(bodyString) || 
      pattern.test(paramsString)
    );
  }

  private detectXSS(req: Request): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\\/script>/gi,
      /javascript:/gi,
      /on\\w+\\s*=/gi,
      /<iframe[^>]*>.*?<\\/iframe>/gi,
      /<object[^>]*>.*?<\\/object>/gi,
      /<embed[^>]*>.*?<\\/embed>/gi,
    ];

    const queryString = JSON.stringify(req.query);
    const bodyString = JSON.stringify(req.body);
    const paramsString = JSON.stringify(req.params);

    return xssPatterns.some(pattern => 
      pattern.test(queryString) || 
      pattern.test(bodyString) || 
      pattern.test(paramsString)
    );
  }
}
\`\`\`

### Incident Response

#### Automated Response
\`\`\`typescript
// services/security/incidentResponse.ts
export class IncidentResponseService {
  async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
    // Log incident
    await this.logIncident(incident);
    
    // Determine response based on severity
    switch (incident.severity) {
      case 'CRITICAL':
        await this.handleCriticalIncident(incident);
        break;
      case 'HIGH':
        await this.handleHighSeverityIncident(incident);
        break;
      case 'MEDIUM':
        await this.handleMediumSeverityIncident(incident);
        break;
      case 'LOW':
        await this.handleLowSeverityIncident(incident);
        break;
    }
  }

  private async handleCriticalIncident(incident: SecurityIncident): Promise<void> {
    // Immediate actions
    await this.blockSuspiciousIP(incident.sourceIP);
    await this.disableAffectedUser(incident.userId);
    await this.alertSecurityTeam(incident);
    
    // Escalate to management
    await this.escalateToManagement(incident);
    
    // Create incident ticket
    await this.createIncidentTicket(incident);
  }

  private async handleHighSeverityIncident(incident: SecurityIncident): Promise<void> {
    // Rate limit the source
    await this.rateLimitSource(incident.sourceIP);
    
    // Alert security team
    await this.alertSecurityTeam(incident);
    
    // Create incident ticket
    await this.createIncidentTicket(incident);
  }

  private async blockSuspiciousIP(ip: string): Promise<void> {
    // Add to WAF block list
    await this.wafService.blockIP(ip);
    
    // Add to firewall block list
    await this.firewallService.blockIP(ip);
    
    // Log the action
    await this.logAction('IP_BLOCKED', { ip, reason: 'Security incident' });
  }

  private async disableAffectedUser(userId: string): Promise<void> {
    // Disable user account
    await this.userService.disableUser(userId);
    
    // Invalidate all user sessions
    await this.sessionService.invalidateUserSessions(userId);
    
    // Log the action
    await this.logAction('USER_DISABLED', { userId, reason: 'Security incident' });
  }
}
\`\`\`

## Compliance and Auditing

### Audit Logging
\`\`\`typescript
// services/audit/auditService.ts
export class AuditService {
  async logAuditEvent(event: AuditEvent): Promise<void> {
    const auditEntry = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      oldValues: event.oldValues,
      newValues: event.newValues,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      sessionId: event.sessionId,
      success: event.success,
      errorMessage: event.errorMessage,
    };

    // Store in audit database
    await this.auditRepository.create(auditEntry);
    
    // Send to SIEM
    await this.siemService.logSecurityEvent({
      type: 'AUDIT_EVENT',
      severity: 'INFO',
      source: 'audit-service',
      user: event.userId,
      ip: event.ipAddress,
      userAgent: event.userAgent,
      details: auditEntry,
    });
  }

  async getAuditTrail(
    userId?: string,
    resource?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditEntry[]> {
    return await this.auditRepository.find({
      userId,
      resource,
      startDate,
      endDate,
    });
  }
}
\`\`\`

### Compliance Monitoring
\`\`\`typescript
// services/compliance/complianceService.ts
export class ComplianceService {
  async checkGDPRCompliance(): Promise<ComplianceReport> {
    const report: ComplianceReport = {
      framework: 'GDPR',
      status: 'COMPLIANT',
      issues: [],
      recommendations: [],
    };

    // Check data retention policies
    const retentionIssues = await this.checkDataRetention();
    report.issues.push(...retentionIssues);

    // Check consent management
    const consentIssues = await this.checkConsentManagement();
    report.issues.push(...consentIssues);

    // Check data portability
    const portabilityIssues = await this.checkDataPortability();
    report.issues.push(...portabilityIssues);

    // Check right to be forgotten
    const deletionIssues = await this.checkRightToBeForgotten();
    report.issues.push(...deletionIssues);

    if (report.issues.length > 0) {
      report.status = 'NON_COMPLIANT';
    }

    return report;
  }

  async checkPCIDSSCompliance(): Promise<ComplianceReport> {
    const report: ComplianceReport = {
      framework: 'PCI DSS',
      status: 'COMPLIANT',
      issues: [],
      recommendations: [],
    };

    // Check network security
    const networkIssues = await this.checkNetworkSecurity();
    report.issues.push(...networkIssues);

    // Check data protection
    const dataProtectionIssues = await this.checkDataProtection();
    report.issues.push(...dataProtectionIssues);

    // Check access control
    const accessControlIssues = await this.checkAccessControl();
    report.issues.push(...accessControlIssues);

    // Check monitoring
    const monitoringIssues = await this.checkMonitoring();
    report.issues.push(...monitoringIssues);

    if (report.issues.length > 0) {
      report.status = 'NON_COMPLIANT';
    }

    return report;
  }
}
\`\`\`

---

This security architecture provides comprehensive protection for RailConnect India, covering authentication, authorization, data security, API security, infrastructure security, and compliance requirements. The multi-layered approach ensures that security is maintained at all levels of the application stack.
`;export{n as default};
