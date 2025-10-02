const n=`# Development Guidelines

This document outlines the coding standards, best practices, and guidelines for developing RailConnect India.

## Code Style and Formatting

### TypeScript/JavaScript Standards

#### General Rules
- Use **TypeScript** for all new code
- Prefer **const** over let, avoid var
- Use **arrow functions** for callbacks and short functions
- Use **template literals** for string interpolation
- Use **destructuring** for object and array access
- Use **async/await** over Promises for asynchronous code

#### Naming Conventions
\`\`\`typescript
// Variables and functions - camelCase
const userName = 'john_doe';
const getUserProfile = async (id: string) => {};

// Constants - UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.railconnect.com';

// Classes - PascalCase
class UserService {
  private readonly apiClient: ApiClient;
}

// Interfaces and Types - PascalCase
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// Enums - PascalCase
enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

// Files and directories - kebab-case
// user-service.ts
// booking-management/
\`\`\`

#### Type Definitions
\`\`\`typescript
// Use interfaces for object shapes
interface TrainRoute {
  id: string;
  trainNumber: string;
  source: Station;
  destination: Station;
  departureTime: Date;
  arrivalTime: Date;
  fare: number;
}

// Use type aliases for unions and computed types
type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

// Use enums for fixed sets of values
enum TravelClass {
  AC1 = 'AC1',
  AC2 = 'AC2',
  AC3 = 'AC3',
  SL = 'SL',
}

// Use generics for reusable types
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}
\`\`\`

### React/Next.js Standards

#### Component Structure
\`\`\`typescript
// components/features/TrainSearch.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Types
interface TrainSearchProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

interface SearchParams {
  from: string;
  to: string;
  date: Date;
  passengers: number;
}

// Schema
const searchSchema = z.object({
  from: z.string().min(1, 'Source station is required'),
  to: z.string().min(1, 'Destination station is required'),
  date: z.date(),
  passengers: z.number().min(1).max(6),
});

// Component
export function TrainSearch({ onSearch, isLoading = false }: TrainSearchProps) {
  // Hooks
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SearchParams>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      date: new Date(),
      passengers: 1,
    },
  });

  // Event handlers
  const handleSubmit = async (data: SearchParams) => {
    setIsSubmitting(true);
    try {
      await onSearch(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      {/* Form fields */}
    </form>
  );
}
\`\`\`

#### Hooks Guidelines
\`\`\`typescript
// Custom hooks - use prefix
export function useTrainSearch() {
  const [results, setResults] = useState<TrainRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTrains = useCallback(async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await trainApi.searchTrains(params);
      setResults(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    results,
    isLoading,
    error,
    searchTrains,
  };
}

// Effect cleanup
useEffect(() => {
  const subscription = eventBus.subscribe('train-update', handleTrainUpdate);
  
  return () => {
    subscription.unsubscribe();
  };
}, []);
\`\`\`

### CSS and Styling

#### Tailwind CSS Guidelines
\`\`\`typescript
// Use Tailwind utility classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Train Search</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
    Search
  </button>
</div>

// Create reusable component classes
const buttonVariants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

// Use CSS modules for complex styles
// styles/TrainCard.module.css
.card {
  @apply bg-white rounded-lg shadow-md p-6;
}

.cardHeader {
  @apply flex items-center justify-between mb-4;
}

.cardTitle {
  @apply text-xl font-semibold text-gray-900;
}
\`\`\`

#### Responsive Design
\`\`\`typescript
// Mobile-first responsive design
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4 
  p-4
">
  {/* Content */}
</div>

// Use responsive utilities
<button className="
  w-full 
  md:w-auto 
  px-4 
  py-2 
  text-sm 
  md:text-base
">
  Search Trains
</button>
\`\`\`

## File Organization

### Directory Structure
\`\`\`
src/
├── components/           # Reusable components
│   ├── ui/              # Base UI components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── stores/              # State management
├── types/               # TypeScript type definitions
├── utils/               # Helper functions
├── constants/           # Application constants
└── styles/              # Global styles
\`\`\`

### File Naming
\`\`\`
// Components - PascalCase
TrainSearch.tsx
BookingForm.tsx
UserProfile.tsx

// Hooks - camelCase with use prefix
useTrainSearch.ts
useBookingForm.ts
useUserProfile.ts

// Utilities - camelCase
formatDate.ts
validateEmail.ts
apiClient.ts

// Types - PascalCase
User.ts
Booking.ts
TrainRoute.ts

// Constants - camelCase
apiEndpoints.ts
errorMessages.ts
validationRules.ts
\`\`\`

### Import Organization
\`\`\`typescript
// 1. React and Next.js imports
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

// 2. Third-party libraries
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui/Button';
import { useTrainSearch } from '@/hooks/useTrainSearch';
import { TrainRoute } from '@/types/TrainRoute';

// 4. Relative imports
import './TrainSearch.css';
import { validateStation } from '../utils/validation';
\`\`\`

## Error Handling

### Frontend Error Handling
\`\`\`typescript
// Error boundaries
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to error reporting service
    if (typeof window !== 'undefined') {
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// API error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error handling in components
const handleApiCall = async () => {
  try {
    const result = await api.getTrains();
    setTrains(result.data);
  } catch (error) {
    if (error instanceof ApiError) {
      setError(error.message);
    } else {
      setError('An unexpected error occurred');
    }
  }
};
\`\`\`

### Backend Error Handling
\`\`\`typescript
// Custom error classes
export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(\`\${resource} with id \${id} not found\`);
    this.name = 'NotFoundError';
  }
}

// Error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: error.message,
      field: error.field,
    });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({
      error: 'Not Found',
      message: error.message,
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
};
\`\`\`

## Testing Guidelines

### Unit Testing
\`\`\`typescript
// Test file naming - *.test.ts or *.spec.ts
// TrainSearch.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TrainSearch } from './TrainSearch';

describe('TrainSearch', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders search form', () => {
    render(<TrainSearch onSearch={mockOnSearch} />);
    
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted', async () => {
    render(<TrainSearch onSearch={mockOnSearch} />);
    
    fireEvent.change(screen.getByLabelText('From'), { target: { value: 'Mumbai' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: 'Delhi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith({
        from: 'Mumbai',
        to: 'Delhi',
        date: expect.any(Date),
        passengers: 1,
      });
    });
  });

  it('shows loading state during search', () => {
    render(<TrainSearch onSearch={mockOnSearch} isLoading={true} />);
    
    expect(screen.getByRole('button', { name: 'Searching...' })).toBeDisabled();
  });
});
\`\`\`

### Integration Testing
\`\`\`typescript
// API integration tests
describe('Train API', () => {
  it('should search trains successfully', async () => {
    const searchParams = {
      from: 'Mumbai',
      to: 'Delhi',
      date: new Date('2024-02-01'),
      passengers: 1,
    };

    const response = await request(app)
      .get('/api/trains/search')
      .query(searchParams)
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should handle validation errors', async () => {
    const response = await request(app)
      .get('/api/trains/search')
      .query({ from: '', to: 'Delhi' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Validation Error');
  });
});
\`\`\`

### E2E Testing
\`\`\`typescript
// E2E tests with Playwright
import { test, expect } from '@playwright/test';

test('complete booking flow', async ({ page }) => {
  // Navigate to home page
  await page.goto('/');

  // Search for trains
  await page.fill('[data-testid="from-station"]', 'Mumbai');
  await page.fill('[data-testid="to-station"]', 'Delhi');
  await page.click('[data-testid="search-button"]');

  // Wait for results
  await page.waitForSelector('[data-testid="train-results"]');

  // Select a train
  await page.click('[data-testid="train-card"]:first-child');

  // Fill passenger details
  await page.fill('[data-testid="passenger-name"]', 'John Doe');
  await page.fill('[data-testid="passenger-age"]', '30');

  // Proceed to payment
  await page.click('[data-testid="proceed-to-payment"]');

  // Verify booking confirmation
  await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
});
\`\`\`

## Performance Guidelines

### Frontend Performance
\`\`\`typescript
// Code splitting
const TrainSearch = lazy(() => import('./TrainSearch'));
const BookingFlow = lazy(() => import('./BookingFlow'));

// Memoization
const ExpensiveComponent = memo(({ data }: { data: ComplexData }) => {
  const processedData = useMemo(() => {
    return processComplexData(data);
  }, [data]);

  return <div>{/* Render processed data */}</div>;
});

// Virtual scrolling for large lists
import { FixedSizeList as List } from 'react-window';

const VirtualizedList = ({ items }: { items: any[] }) => (
  <List
    height={600}
    itemCount={items.length}
    itemSize={100}
    itemData={items}
  >
    {({ index, style, data }) => (
      <div style={style}>
        <ItemComponent item={data[index]} />
      </div>
    )}
  </List>
);
\`\`\`

### Backend Performance
\`\`\`typescript
// Database query optimization
export class TrainRepository {
  async findTrainsWithStations(trainIds: string[]): Promise<Train[]> {
    // Use JOIN instead of N+1 queries
    return this.db.query(\`
      SELECT t.*, s1.name as source_name, s2.name as destination_name
      FROM trains t
      JOIN stations s1 ON t.source_station_id = s1.id
      JOIN stations s2 ON t.destination_station_id = s2.id
      WHERE t.id = ANY($1)
    \`, [trainIds]);
  }

  // Use connection pooling
  private pool = new Pool({
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
  });
}

// Caching
export class CacheService {
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    let value = await this.redis.get(key);
    
    if (!value) {
      value = await fetcher();
      await this.redis.setex(key, ttl, JSON.stringify(value));
    }
    
    return JSON.parse(value);
  }
}
\`\`\`

## Security Guidelines

### Input Validation
\`\`\`typescript
// Frontend validation
const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().min(18, 'Must be at least 18 years old'),
});

// Backend validation
export const validateUserInput = (req: Request, res: Response, next: NextFunction) => {
  const { error } = userSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details,
    });
  }
  
  next();
};
\`\`\`

### Authentication and Authorization
\`\`\`typescript
// JWT token validation
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  });
};

// Role-based access control
export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles.includes(role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};
\`\`\`

## Documentation Guidelines

### Code Documentation
\`\`\`typescript
/**
 * Searches for trains between two stations
 * @param params - Search parameters
 * @param params.from - Source station code
 * @param params.to - Destination station code
 * @param params.date - Journey date
 * @param params.passengers - Number of passengers
 * @returns Promise resolving to array of train routes
 * @throws {ValidationError} When search parameters are invalid
 * @throws {ApiError} When API request fails
 * 
 * @example
 * \`\`\`typescript
 * const routes = await searchTrains({
 *   from: 'MUM',
 *   to: 'DEL',
 *   date: new Date('2024-02-01'),
 *   passengers: 2
 * });
 * \`\`\`
 */
export async function searchTrains(params: SearchParams): Promise<TrainRoute[]> {
  // Implementation
}
\`\`\`

### README Files
\`\`\`markdown
# Component Name

Brief description of what this component does.

## Usage

\`\`\`typescript
import { ComponentName } from './ComponentName';

<ComponentName
  prop1="value1"
  prop2="value2"
  onEvent={handleEvent}
/>
\`\`\`

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| prop1 | string | Yes | - | Description of prop1 |
| prop2 | number | No | 0 | Description of prop2 |

## Examples

### Basic Usage
[Example code]

### Advanced Usage
[Example code]

## Notes

- Important notes about usage
- Known limitations
- Performance considerations
\`\`\`

## Git Workflow

### Commit Messages
\`\`\`bash
# Format: type(scope): description
feat(auth): add multi-factor authentication
fix(booking): resolve seat selection issue
docs(api): update endpoint documentation
style(ui): improve button styling
refactor(utils): extract common validation logic
test(booking): add integration tests
chore(deps): update dependencies

# Breaking changes
feat(api)!: change user endpoint response format

BREAKING CHANGE: The user endpoint now returns user data in a different format.
\`\`\`

### Branch Naming
\`\`\`bash
# Feature branches
feature/user-authentication
feature/train-search
feature/booking-flow

# Bug fix branches
fix/seat-selection-bug
fix/payment-processing-error

# Hotfix branches
hotfix/security-vulnerability
hotfix/critical-booking-bug

# Release branches
release/v1.2.0
release/v2.0.0
\`\`\`

### Pull Request Guidelines
1. **Title**: Clear, descriptive title
2. **Description**: Detailed description of changes
3. **Testing**: List of tests added/updated
4. **Screenshots**: For UI changes
5. **Breaking Changes**: Document any breaking changes
6. **Checklist**: Complete the PR checklist

## Code Review Guidelines

### Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Error handling is proper
- [ ] Code is readable and maintainable

### Review Process
1. **Self Review**: Review your own code first
2. **Automated Checks**: Ensure CI checks pass
3. **Peer Review**: Request review from team members
4. **Address Feedback**: Make necessary changes
5. **Approval**: Get approval from reviewers
6. **Merge**: Merge after approval

## Continuous Integration

### Pre-commit Hooks
\`\`\`json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "*.{json,md}": [
      "prettier --write",
      "git add"
    ]
  }
}
\`\`\`

### CI Pipeline
\`\`\`yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      - run: pnpm build
\`\`\`

---

Following these guidelines ensures consistent, maintainable, and high-quality code across the RailConnect India project. Regular reviews and updates of these guidelines help maintain code quality as the project evolves.
`;export{n as default};
