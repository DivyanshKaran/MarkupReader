const e=`# Chrome Extension Learning Guide for SkillSync

## Getting Started with Chrome Extension Development

### Prerequisites
- Basic TypeScript knowledge ✅ (you mentioned you understand TypeScript)
- Basic React knowledge (helpful but not required)
- Chrome browser for testing
- Node.js and npm installed

### Step 1: Understanding the Extension Structure

Let's start by exploring the key files in SkillSync:

#### 1.1 Manifest File (\`manifest.json\`)
This is the **configuration file** that tells Chrome what your extension can do:

\`\`\`json
{
  "manifest_version": 3,
  "name": "SkillSync",
  "version": "1.0.0",
  "description": "AI-powered Chrome extension for automated job application form filling",
  
  // What permissions does your extension need?
  "permissions": ["storage", "activeTab", "scripting"],
  
  // Which websites can your extension access?
  "host_permissions": [
    "https://www.linkedin.com/*",
    "https://www.indeed.com/*",
    "https://www.glassdoor.com/*"
  ],
  
  // Background script (runs continuously)
  "background": {
    "service_worker": "background/service-worker.js"
  },
  
  // Scripts that run on web pages
  "content_scripts": [{
    "matches": ["https://www.linkedin.com/*"],
    "js": ["content/content-script.js"],
    "run_at": "document_end"
  }],
  
  // UI components
  "action": {
    "default_popup": "src/popup/popup.html"
  },
  "options_page": "src/options/options.html"
}
\`\`\`

**Key Learning Points:**
- \`manifest_version: 3\` is the latest Chrome extension API
- \`permissions\` define what browser APIs you can use
- \`host_permissions\` define which websites you can access
- \`background.service_worker\` is your main background process
- \`content_scripts\` run on specific websites
- \`action.default_popup\` is the UI that appears when you click the extension icon

#### 1.2 Service Worker (\`src/background/service-worker.ts\`)
This is the **central hub** of your extension:

\`\`\`typescript
// Import all the services your extension needs
import { StorageService } from '../services/storage/StorageService';
import { ProfileManager } from '../services/ProfileManager';

// Initialize services
const storageService = StorageService.getInstance();
let profileManager: ProfileManager;

// Handle messages from other parts of your extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  switch (message.type) {
    case 'PING':
      sendResponse({ status: 'pong', timestamp: Date.now() });
      break;
      
    case 'PROFILE_CREATE':
      // Handle profile creation
      handleProfileCreate(message.payload)
        .then(result => sendResponse({ success: true, data: result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      break;
  }
  
  return true; // Indicate we will send a response asynchronously
});

// Initialize when extension is installed
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('Extension installed!');
    
    // Initialize your services
    await storageService.initialize();
    profileManager = ProfileManager.getInstance(storageService);
    await profileManager.initialize();
  }
});
\`\`\`

**Key Learning Points:**
- Service worker runs in the background
- It handles all communication between different parts of your extension
- It initializes and manages all your services
- It's the "gateway" that coordinates everything

#### 1.3 Popup (\`src/popup/popup.tsx\`)
This is the UI that appears when you click the extension icon:

\`\`\`typescript
import React, { useState, useEffect } from 'react';

const Popup = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load profiles when popup opens
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      // Send message to service worker
      const response = await chrome.runtime.sendMessage({
        type: 'PROFILE_GET_ALL'
      });
      
      if (response.success) {
        setProfiles(response.data);
      }
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    // Open options page
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/options/options.html')
    });
  };

  return (
    <div style={{ width: '350px', padding: '20px' }}>
      <h2>SkillSync</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h3>Profiles ({profiles.length})</h3>
          {profiles.map(profile => (
            <div key={profile.id}>
              <strong>{profile.name}</strong> - {profile.email}
            </div>
          ))}
          
          <button onClick={handleCreateProfile}>
            Create New Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default Popup;
\`\`\`

**Key Learning Points:**
- Popup is a React component
- It communicates with the service worker using \`chrome.runtime.sendMessage\`
- It can open other pages using \`chrome.tabs.create\`
- It's temporary - closes when you click away

#### 1.4 Content Script (\`src/content/content-script.ts\`)
This runs on web pages (like LinkedIn, Indeed):

\`\`\`typescript
// This script runs on job sites
console.log('SkillSync content script loaded on:', window.location.href);

// Listen for messages from the service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  switch (message.type) {
    case 'FILL_FORM':
      fillForm(message.profileData);
      sendResponse({ success: true });
      break;
      
    case 'ANALYZE_JOB':
      const jobData = analyzeJob();
      sendResponse({ success: true, data: jobData });
      break;
  }
});

function fillForm(profileData) {
  // Find form fields and fill them
  const nameField = document.querySelector('input[name="name"]');
  if (nameField) {
    nameField.value = profileData.name;
  }
  
  const emailField = document.querySelector('input[name="email"]');
  if (emailField) {
    emailField.value = profileData.email;
  }
  
  console.log('Form filled with profile data');
}

function analyzeJob() {
  // Extract job information from the page
  const jobTitle = document.querySelector('h1')?.textContent || '';
  const company = document.querySelector('.company-name')?.textContent || '';
  const description = document.querySelector('.job-description')?.textContent || '';
  
  return {
    title: jobTitle,
    company: company,
    description: description,
    url: window.location.href
  };
}
\`\`\`

**Key Learning Points:**
- Content scripts run on web pages
- They can access and modify the DOM
- They communicate with the service worker
- They're isolated from the page's JavaScript

### Step 2: Understanding the Data Flow

Let's trace how data flows through the extension:

#### 2.1 Profile Creation Flow

\`\`\`
1. User clicks "Create Profile" in popup
   ↓
2. Popup opens options page
   ↓
3. User fills profile form in options page
   ↓
4. Options page sends message to service worker
   ↓
5. Service worker saves profile to storage
   ↓
6. Service worker responds with success
   ↓
7. Options page updates UI
\`\`\`

#### 2.2 Form Filling Flow

\`\`\`
1. User clicks "Fill Form" in popup
   ↓
2. Popup sends message to service worker
   ↓
3. Service worker gets active profile
   ↓
4. Service worker sends message to content script
   ↓
5. Content script fills form on the page
   ↓
6. Content script responds with success
   ↓
7. Service worker responds to popup
   ↓
8. Popup shows success message
\`\`\`

### Step 3: Hands-On Learning Exercises

#### Exercise 1: Add a Simple Message Handler

1. **Open the service worker** (\`src/background/service-worker.ts\`)

2. **Add a new message handler**:
\`\`\`typescript
messageHandler.register('GET_CURRENT_TIME', async () => {
  return {
    success: true,
    data: {
      time: new Date().toISOString(),
      timestamp: Date.now()
    }
  };
});
\`\`\`

3. **Test it from the popup**:
\`\`\`typescript
const getCurrentTime = async () => {
  const response = await chrome.runtime.sendMessage({
    type: 'GET_CURRENT_TIME'
  });
  
  if (response.success) {
    console.log('Current time:', response.data.time);
  }
};
\`\`\`

#### Exercise 2: Add a Simple Storage Operation

1. **Add a message handler for storing data**:
\`\`\`typescript
messageHandler.register('STORE_DATA', async (payload) => {
  await storageService.set('myData', payload.data);
  return { success: true };
});

messageHandler.register('GET_DATA', async () => {
  const data = await storageService.get('myData', null);
  return { success: true, data };
});
\`\`\`

2. **Test it**:
\`\`\`typescript
// Store data
await chrome.runtime.sendMessage({
  type: 'STORE_DATA',
  payload: { data: 'Hello World!' }
});

// Retrieve data
const response = await chrome.runtime.sendMessage({
  type: 'GET_DATA'
});
console.log('Stored data:', response.data);
\`\`\`

#### Exercise 3: Add a Content Script Feature

1. **Add a new function to the content script**:
\`\`\`typescript
function highlightJobTitle() {
  const jobTitle = document.querySelector('h1');
  if (jobTitle) {
    jobTitle.style.backgroundColor = 'yellow';
    jobTitle.style.padding = '5px';
  }
}
\`\`\`

2. **Add a message handler**:
\`\`\`typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'HIGHLIGHT_JOB_TITLE':
      highlightJobTitle();
      sendResponse({ success: true });
      break;
  }
});
\`\`\`

3. **Test it from the popup**:
\`\`\`typescript
const highlightJob = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, {
    type: 'HIGHLIGHT_JOB_TITLE'
  });
};
\`\`\`

### Step 4: Understanding the Build Process

#### 4.1 Vite Configuration

The extension uses Vite to build all the TypeScript and React code:

\`\`\`typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        'popup/popup': 'src/popup/popup.html',
        'options/options': 'src/options/options.html',
        'background/service-worker': 'src/background/service-worker.ts',
        'content/content-script': 'src/content/content-script.ts'
      }
    }
  }
});
\`\`\`

#### 4.2 Build Commands

\`\`\`bash
# Development build (with source maps)
npm run build:dev

# Production build (minified)
npm run build:prod

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the "dist" folder
\`\`\`

### Step 5: Debugging Your Extension

#### 5.1 Chrome DevTools

- **Service Worker**: Go to \`chrome://extensions/\` → Click "Inspect views: service worker"
- **Popup**: Right-click extension icon → "Inspect popup"
- **Options**: Right-click extension icon → "Options" → F12
- **Content Scripts**: F12 on any web page where content script runs

#### 5.2 Console Logging

\`\`\`typescript
// Service worker
console.log('Service worker message received:', message);

// Popup/Options
console.log('Profile loaded:', profile);

// Content script
console.log('Content script running on:', window.location.href);
\`\`\`

#### 5.3 Error Handling

\`\`\`typescript
// Always wrap async operations in try-catch
try {
  const response = await chrome.runtime.sendMessage({ type: 'PROFILE_CREATE' });
  if (response.success) {
    console.log('Profile created successfully');
  } else {
    console.error('Failed to create profile:', response.error);
  }
} catch (error) {
  console.error('Error communicating with service worker:', error);
}
\`\`\`

### Step 6: Common Patterns and Best Practices

#### 6.1 Message Passing Pattern

\`\`\`typescript
// Always use this pattern for async operations
chrome.runtime.sendMessage({ type: 'SOME_ACTION' }, (response) => {
  if (chrome.runtime.lastError) {
    console.error('Error:', chrome.runtime.lastError);
    return;
  }
  
  if (response.success) {
    console.log('Success:', response.data);
  } else {
    console.error('Failed:', response.error);
  }
});
\`\`\`

#### 6.2 Service Initialization Pattern

\`\`\`typescript
// Always initialize services in the service worker
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    try {
      await storageService.initialize();
      await profileManager.initialize();
      console.log('All services initialized');
    } catch (error) {
      console.error('Failed to initialize services:', error);
    }
  }
});
\`\`\`

#### 6.3 Error Handling Pattern

\`\`\`typescript
// Always handle errors gracefully
messageHandler.register('SOME_ACTION', async (payload) => {
  try {
    const result = await someOperation(payload);
    return { success: true, data: result };
  } catch (error) {
    console.error('Operation failed:', error);
    return { success: false, error: error.message };
  }
});
\`\`\`

### Step 7: Next Steps for Learning

1. **Start with simple features**: Add basic message handlers and test them
2. **Understand the data flow**: Trace how data moves between components
3. **Experiment with storage**: Try storing and retrieving different types of data
4. **Add content script features**: Modify web pages and interact with forms
5. **Learn about permissions**: Understand what each permission allows
6. **Study the existing code**: Look at how SkillSync implements complex features
7. **Build your own features**: Add new functionality to the extension

### Step 8: Resources for Further Learning

- **Chrome Extension Documentation**: https://developer.chrome.com/docs/extensions/
- **Manifest V3 Migration Guide**: https://developer.chrome.com/docs/extensions/mv3/intro/
- **Chrome Extension Samples**: https://github.com/GoogleChrome/chrome-extensions-samples
- **Chrome DevTools**: Learn to use the debugging tools effectively

### Step 9: Common Mistakes to Avoid

1. **Don't forget to return \`true\`** in message listeners for async responses
2. **Always check \`chrome.runtime.lastError\`** when using \`sendMessage\`
3. **Don't access \`chrome\` APIs** from content scripts without proper permissions
4. **Always validate input data** before processing
5. **Don't forget to handle errors** in async operations
6. **Test on different websites** to ensure content scripts work properly

This learning guide should give you a solid foundation for understanding Chrome extension development using the SkillSync project as your learning platform. Start with the simple exercises and gradually work your way up to more complex features!
`;export{e as default};
