const n=`# SkillSync Component Interactions and Data Flow

## Visual Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Chrome Browser Environment                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐                    ┌─────────────────┐                    │
│  │   Web Pages     │                    │   Extension UI  │                    │
│  │                 │                    │                 │                    │
│  │  ┌───────────┐  │                    │  ┌───────────┐  │                    │
│  │  │ LinkedIn  │  │                    │  │   Popup   │  │                    │
│  │  │ Indeed    │  │                    │  │           │  │                    │
│  │  │ Glassdoor │  │                    │  │  Profile  │  │                    │
│  │  └───────────┘  │                    │  │ Selector  │  │                    │
│  │                 │                    │  │           │  │                    │
│  │  ┌───────────┐  │                    │  │ Auto-fill │  │                    │
│  │  │ Content   │  │                    │  │ Controls  │  │                    │
│  │  │ Scripts   │  │                    │  │           │  │                    │
│  │  │           │  │                    │  └───────────┘  │                    │
│  │  │ Form      │  │                    │                 │                    │
│  │  │ Detection │  │                    │  ┌───────────┐  │                    │
│  │  │           │  │                    │  │ Options   │  │                    │
│  │  │ Form      │  │                    │  │ Page      │  │                    │
│  │  │ Filling   │  │                    │  │           │  │                    │
│  │  │           │  │                    │  │ Profile   │  │                    │
│  │  │ Job       │  │                    │  │ Editor    │  │                    │
│  │  │ Analysis  │  │                    │  │           │  │                    │
│  │  └───────────┘  │                    │  │ Profile   │  │                    │
│  └─────────────────┘                    │  │ List      │  │                    │
│                                         │  └───────────┘  │                    │
│                                         └─────────────────┘                    │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                           Service Worker (Background)                          │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                    Message Handler Registry                             │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │   PING      │  │ PROFILE_*   │  │ FILL_FORM   │  │ ANALYZE_JOB │    │   │
│  │  │ GET_INFO    │  │ CREATE      │  │             │  │             │    │   │
│  │  │ HEALTH      │  │ GET         │  │             │  │             │    │   │
│  │  │             │  │ UPDATE      │  │             │  │             │    │   │
│  │  │             │  │ DELETE      │  │             │  │             │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        Core Services                                    │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │ Profile     │  │ AI          │  │ Error       │  │ Logger      │    │   │
│  │  │ Manager     │  │ Service     │  │ Handler     │  │             │    │   │
│  │  │             │  │             │  │             │  │             │    │   │
│  │  │ CRUD        │  │ OpenAI      │  │ Recovery    │  │ Debug       │    │   │
│  │  │ Operations  │  │ Claude      │  │ Strategies  │  │ Info        │    │   │
│  │  │ Validation  │  │ Generation  │  │ User        │  │ Error       │    │   │
│  │  │ Statistics  │  │ Analysis    │  │ Feedback    │  │ Warning     │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                      Storage Services                                   │   │
│  │                                                                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │ Chrome      │  │ IndexedDB   │  │ Encryption  │  │ Key         │    │   │
│  │  │ Storage     │  │ Service     │  │ Service     │  │ Manager     │    │   │
│  │  │             │  │             │  │             │  │             │    │   │
│  │  │ Settings    │  │ Profiles    │  │ AES-256     │  │ Key         │    │   │
│  │  │ Cache       │  │ Jobs        │  │ Encryption  │  │ Generation  │    │   │
│  │  │ Temp Data   │  │ Analytics   │  │ Decryption  │  │ Rotation    │    │   │
│  │  │             │  │             │  │ Key Mgmt    │  │ Storage     │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
\`\`\`

## Message Flow Examples

### 1. Profile Creation Flow

\`\`\`
User clicks "Create Profile" in Options Page
                    ↓
Options Page → ServiceWorkerClient → Service Worker
                    ↓
Service Worker → ProfileManager → IndexedDBService
                    ↓
IndexedDBService saves profile to IndexedDB
                    ↓
Service Worker → ProfileManager → Options Page
                    ↓
Options Page updates UI with new profile
\`\`\`

### 2. Form Filling Flow

\`\`\`
User clicks "Fill Form" in Popup
                    ↓
Popup → ServiceWorkerClient → Service Worker
                    ↓
Service Worker → ProfileManager → Get Active Profile
                    ↓
Service Worker → Content Script (on current tab)
                    ↓
Content Script → FormDetector → Find Forms
                    ↓
Content Script → FormFiller → Fill Forms with Profile Data
                    ↓
Content Script → Service Worker → Success/Error Response
                    ↓
Service Worker → Popup → Update UI Status
\`\`\`

### 3. Job Analysis Flow

\`\`\`
User clicks "Analyze Job" in Popup
                    ↓
Popup → ServiceWorkerClient → Service Worker
                    ↓
Service Worker → Content Script (on current tab)
                    ↓
Content Script → JobContentExtractor → Extract Job Data
                    ↓
Content Script → Service Worker → Send Job Data
                    ↓
Service Worker → AIService → Analyze Job Requirements
                    ↓
AIService → Service Worker → Analysis Results
                    ↓
Service Worker → Popup → Display Analysis
\`\`\`

## Component Communication Patterns

### 1. Service Worker Client Pattern

\`\`\`typescript
// ServiceWorkerClient.ts - Centralized communication
export class ServiceWorkerClient {
  private async sendMessage<T>(type: string, payload?: any): Promise<ServiceWorkerResponse<T>> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type, payload }, (response) => {
        resolve(response || { success: false, error: 'No response' });
      });
    });
  }

  // Profile operations
  async createProfile(profileData: any) {
    return this.sendMessage('PROFILE_CREATE', { profileData });
  }

  async getAllProfiles() {
    return this.sendMessage('PROFILE_GET_ALL');
  }
}
\`\`\`

### 2. Message Handler Registry Pattern

\`\`\`typescript
// service-worker.ts - Centralized message handling
class MessageHandler {
  private handlers = new Map<string, Function>();

  register(type: string, handler: Function) {
    this.handlers.set(type, handler);
  }

  async handle(message: ServiceWorkerMessage) {
    const handler = this.handlers.get(message.type);
    if (handler) {
      return await handler(message.payload);
    }
  }
}

// Register all handlers
messageHandler.register('PROFILE_CREATE', handleProfileCreate);
messageHandler.register('PROFILE_GET_ALL', handleGetAllProfiles);
messageHandler.register('FILL_FORM', handleFillForm);
\`\`\`

### 3. Service Initialization Pattern

\`\`\`typescript
// service-worker.ts - Service initialization
const storageService = StorageService.getInstance();
const indexedDBService = IndexedDBService.getInstance();
const profileManager = ProfileManager.getInstance(storageService, indexedDBService);

// Initialize on extension install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await storageService.initialize();
    await indexedDBService.initialize();
    await profileManager.initialize();
  }
});
\`\`\`

## Data Flow Through Storage

### 1. Profile Data Flow

\`\`\`
User Input (ProfileEditor)
        ↓
ServiceWorkerClient
        ↓
Service Worker (Message Handler)
        ↓
ProfileManager
        ↓
IndexedDBService
        ↓
IndexedDB (Persistent Storage)
        ↓
ProfileManager (on retrieval)
        ↓
Service Worker (Response)
        ↓
UI Components (Display)
\`\`\`

### 2. Settings Data Flow

\`\`\`
User Input (Settings Panel)
        ↓
ServiceWorkerClient
        ↓
Service Worker (Message Handler)
        ↓
StorageService
        ↓
Chrome Storage API
        ↓
StorageService (on retrieval)
        ↓
Service Worker (Response)
        ↓
UI Components (Display)
\`\`\`

## Error Handling Flow

### 1. Error Propagation

\`\`\`
Component Error
        ↓
ServiceWorkerClient (catch)
        ↓
Service Worker (Error Handler)
        ↓
ErrorHandler Service
        ↓
Logger Service
        ↓
User Feedback (UI)
        ↓
Recovery Strategy (if available)
\`\`\`

### 2. Error Recovery

\`\`\`typescript
// ErrorHandler.ts - Centralized error handling
export class ErrorHandler {
  async handleError(error: Error, context: string) {
    // Log error
    await this.logger.error(error, context);
    
    // Try recovery
    const recovery = await this.tryRecovery(error, context);
    
    // Return user-friendly message
    return {
      error: this.getUserFriendlyMessage(error),
      recovered: recovery.success,
      recoveryResult: recovery.result
    };
  }
}
\`\`\`

## Security and Privacy Flow

### 1. Data Encryption

\`\`\`
Sensitive Data (API Keys, Personal Info)
        ↓
EncryptionService
        ↓
AES-256-GCM Encryption
        ↓
Encrypted Data
        ↓
StorageService
        ↓
Chrome Storage (Encrypted)
        ↓
StorageService (on retrieval)
        ↓
EncryptionService
        ↓
Decrypted Data
        ↓
Application Use
\`\`\`

### 2. Privacy Controls

\`\`\`
User Data
        ↓
PrivacyService
        ↓
Consent Check
        ↓
Data Retention Policy
        ↓
Encrypted Storage
        ↓
Automatic Cleanup (if expired)
\`\`\`

## Performance Optimization Flow

### 1. Caching Strategy

\`\`\`
Data Request
        ↓
Cache Check (StorageService)
        ↓
Cache Hit? → Return Cached Data
        ↓
Cache Miss → Fetch from Source
        ↓
Update Cache
        ↓
Return Data
\`\`\`

### 2. Lazy Loading

\`\`\`
Component Load
        ↓
Check if Data Needed
        ↓
Load Only Required Data
        ↓
Load Additional Data on Demand
        ↓
Cache for Future Use
\`\`\`

## Testing and Debugging Flow

### 1. Development Testing

\`\`\`
Code Change
        ↓
Build Process (Vite)
        ↓
Load Extension (Chrome)
        ↓
Test Functionality
        ↓
Chrome DevTools Debug
        ↓
Fix Issues
        ↓
Repeat
\`\`\`

### 2. Production Monitoring

\`\`\`
User Action
        ↓
Service Worker
        ↓
Logger Service
        ↓
Error Tracking
        ↓
Performance Metrics
        ↓
Analytics Dashboard
\`\`\`

This comprehensive view shows how all components in SkillSync interact with each other, with the Service Worker acting as the central gateway that coordinates all functionality while maintaining proper separation of concerns.
`;export{n as default};
