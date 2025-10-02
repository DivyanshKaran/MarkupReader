# Frontend Architecture

## Overview

RailConnect India's frontend is built with Next.js 14, TypeScript, and Tailwind CSS, following modern React patterns and best practices for performance, accessibility, and maintainability.

## Architecture Principles

### Component-Based Architecture
- **Atomic Design**: Components organized by complexity (atoms, molecules, organisms)
- **Composition over Inheritance**: Favor component composition
- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Components designed for reuse across the application

### State Management
- **Local State**: React hooks for component-level state
- **Global State**: Zustand for application-wide state
- **Server State**: TanStack Query for API data management
- **Form State**: React Hook Form for form management

### Performance Optimization
- **Code Splitting**: Dynamic imports for route-based splitting
- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Caching**: Service Worker for offline functionality

## Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth route group
│   │   ├── (dashboard)/       # Dashboard route group
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   ├── forms/            # Form components
│   │   ├── layout/           # Layout components
│   │   └── features/         # Feature-specific components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── stores/               # Zustand stores
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Helper functions
├── public/                   # Static assets
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Component Architecture

### Base UI Components

#### Button Component
```typescript
// components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

#### Input Component
```typescript
// components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
```

### Feature Components

#### TrainSearch Component
```typescript
// components/features/TrainSearch.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StationAutocomplete } from './StationAutocomplete';
import { DatePicker } from './DatePicker';
import { PassengerSelector } from './PassengerSelector';
import { useTrainSearch } from '@/hooks/useTrainSearch';

const searchSchema = z.object({
  from: z.string().min(1, 'Source station is required'),
  to: z.string().min(1, 'Destination station is required'),
  date: z.date(),
  passengers: z.number().min(1).max(6),
  class: z.string().optional(),
});

type SearchForm = z.infer<typeof searchSchema>;

export function TrainSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const { searchTrains } = useTrainSearch();

  const form = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      date: new Date(),
      passengers: 1,
    },
  });

  const onSubmit = async (data: SearchForm) => {
    setIsSearching(true);
    try {
      await searchTrains(data);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Search Trains</h2>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">From</label>
            <StationAutocomplete
              value={form.watch('from')}
              onChange={(value) => form.setValue('from', value)}
              placeholder="Source station"
            />
            {form.formState.errors.from && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.from.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">To</label>
            <StationAutocomplete
              value={form.watch('to')}
              onChange={(value) => form.setValue('to', value)}
              placeholder="Destination station"
            />
            {form.formState.errors.to && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.to.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Journey Date</label>
            <DatePicker
              value={form.watch('date')}
              onChange={(date) => form.setValue('date', date)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Passengers</label>
            <PassengerSelector
              value={form.watch('passengers')}
              onChange={(count) => form.setValue('passengers', count)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Class</label>
            <select
              {...form.register('class')}
              className="w-full h-10 px-3 py-2 border border-input rounded-md"
            >
              <option value="">Any Class</option>
              <option value="AC1">AC First Class</option>
              <option value="AC2">AC 2 Tier</option>
              <option value="AC3">AC 3 Tier</option>
              <option value="SL">Sleeper</option>
            </select>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSearching}
          className="w-full"
        >
          {isSearching ? 'Searching...' : 'Search Trains'}
        </Button>
      </form>
    </div>
  );
}
```

## State Management

### Zustand Stores

#### Booking Store
```typescript
// stores/bookingStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface BookingState {
  // Search state
  searchParams: SearchParams | null;
  searchResults: TrainRoute[];
  
  // Booking state
  selectedRoute: TrainRoute | null;
  passengers: Passenger[];
  seats: Seat[];
  addOns: AddOn[];
  
  // Payment state
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  
  // UI state
  currentStep: BookingStep;
  isLoading: boolean;
  error: string | null;
}

interface BookingActions {
  setSearchParams: (params: SearchParams) => void;
  setSearchResults: (results: TrainRoute[]) => void;
  selectRoute: (route: TrainRoute) => void;
  addPassenger: (passenger: Passenger) => void;
  removePassenger: (id: string) => void;
  selectSeats: (seats: Seat[]) => void;
  addAddOn: (addOn: AddOn) => void;
  removeAddOn: (id: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCurrentStep: (step: BookingStep) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState & BookingActions>()(
  persist(
    immer((set, get) => ({
      // Initial state
      searchParams: null,
      searchResults: [],
      selectedRoute: null,
      passengers: [],
      seats: [],
      addOns: [],
      paymentMethod: null,
      paymentStatus: 'pending',
      currentStep: 'search',
      isLoading: false,
      error: null,

      // Actions
      setSearchParams: (params) => set((state) => {
        state.searchParams = params;
      }),

      setSearchResults: (results) => set((state) => {
        state.searchResults = results;
      }),

      selectRoute: (route) => set((state) => {
        state.selectedRoute = route;
        state.currentStep = 'passengers';
      }),

      addPassenger: (passenger) => set((state) => {
        state.passengers.push(passenger);
      }),

      removePassenger: (id) => set((state) => {
        state.passengers = state.passengers.filter(p => p.id !== id);
      }),

      selectSeats: (seats) => set((state) => {
        state.seats = seats;
        state.currentStep = 'addons';
      }),

      addAddOn: (addOn) => set((state) => {
        state.addOns.push(addOn);
      }),

      removeAddOn: (id) => set((state) => {
        state.addOns = state.addOns.filter(a => a.id !== id);
      }),

      setPaymentMethod: (method) => set((state) => {
        state.paymentMethod = method;
        state.currentStep = 'payment';
      }),

      setCurrentStep: (step) => set((state) => {
        state.currentStep = step;
      }),

      setLoading: (loading) => set((state) => {
        state.isLoading = loading;
      }),

      setError: (error) => set((state) => {
        state.error = error;
      }),

      resetBooking: () => set((state) => {
        state.searchParams = null;
        state.searchResults = [];
        state.selectedRoute = null;
        state.passengers = [];
        state.seats = [];
        state.addOns = [];
        state.paymentMethod = null;
        state.paymentStatus = 'pending';
        state.currentStep = 'search';
        state.isLoading = false;
        state.error = null;
      }),
    })),
    {
      name: 'booking-store',
      partialize: (state) => ({
        searchParams: state.searchParams,
        selectedRoute: state.selectedRoute,
        passengers: state.passengers,
        seats: state.seats,
        addOns: state.addOns,
        currentStep: state.currentStep,
      }),
    }
  )
);
```

### TanStack Query

#### API Hooks
```typescript
// hooks/useTrainSearch.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainApi } from '@/lib/api';

export function useTrainSearch() {
  const queryClient = useQueryClient();

  const searchMutation = useMutation({
    mutationFn: trainApi.searchTrains,
    onSuccess: (data) => {
      // Update booking store
      useBookingStore.getState().setSearchResults(data.routes);
    },
    onError: (error) => {
      useBookingStore.getState().setError(error.message);
    },
  });

  const searchTrains = async (params: SearchParams) => {
    useBookingStore.getState().setLoading(true);
    useBookingStore.getState().setError(null);
    
    try {
      await searchMutation.mutateAsync(params);
      useBookingStore.getState().setSearchParams(params);
    } finally {
      useBookingStore.getState().setLoading(false);
    }
  };

  return {
    searchTrains,
    isLoading: searchMutation.isPending,
    error: searchMutation.error,
  };
}

export function useTrainDetails(trainNumber: string) {
  return useQuery({
    queryKey: ['train', trainNumber],
    queryFn: () => trainApi.getTrainDetails(trainNumber),
    enabled: !!trainNumber,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useStationSuggestions(query: string) {
  return useQuery({
    queryKey: ['stations', query],
    queryFn: () => trainApi.searchStations(query),
    enabled: query.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

## Performance Optimization

### Code Splitting
```typescript
// Dynamic imports for route-based code splitting
const TrainSearch = dynamic(() => import('@/components/features/TrainSearch'), {
  loading: () => <SearchSkeleton />,
  ssr: false,
});

const BookingFlow = dynamic(() => import('@/components/features/BookingFlow'), {
  loading: () => <BookingSkeleton />,
  ssr: false,
});

const Dashboard = dynamic(() => import('@/components/features/Dashboard'), {
  loading: () => <DashboardSkeleton />,
  ssr: false,
});
```

### Image Optimization
```typescript
// components/ui/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={85}
        onLoad={() => setIsLoading(false)}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
}
```

### Virtual Scrolling
```typescript
// components/features/VirtualizedRouteList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { RouteCard } from './RouteCard';

interface VirtualizedRouteListProps {
  routes: TrainRoute[];
}

export function VirtualizedRouteList({ routes }: VirtualizedRouteListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: routes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className="h-96 overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <RouteCard route={routes[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Accessibility

### ARIA Labels and Roles
```typescript
// components/ui/AccessibleButton.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Button } from './Button';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ ariaLabel, ariaDescribedBy, ariaExpanded, ariaControls, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        {...props}
      />
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';
```

### Keyboard Navigation
```typescript
// hooks/useKeyboardNavigation.ts
import { useEffect, useCallback } from 'react';

export function useKeyboardNavigation(
  onEscape?: () => void,
  onEnter?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onEscape?.();
          break;
        case 'Enter':
          onEnter?.();
          break;
        case 'ArrowUp':
          event.preventDefault();
          onArrowUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          onArrowDown?.();
          break;
      }
    },
    [onEscape, onEnter, onArrowUp, onArrowDown]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
```

## Testing

### Component Testing
```typescript
// __tests__/components/TrainSearch.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TrainSearch } from '@/components/features/TrainSearch';
import { useTrainSearch } from '@/hooks/useTrainSearch';

// Mock the hook
jest.mock('@/hooks/useTrainSearch');
const mockUseTrainSearch = useTrainSearch as jest.MockedFunction<typeof useTrainSearch>;

describe('TrainSearch', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseTrainSearch.mockReturnValue({
      searchTrains: jest.fn(),
      isLoading: false,
      error: null,
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TrainSearch />
      </QueryClientProvider>
    );
  };

  it('renders search form', () => {
    renderComponent();
    
    expect(screen.getByText('Search Trains')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Source station')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Destination station')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search Trains' })).toBeInTheDocument();
  });

  it('calls searchTrains when form is submitted', async () => {
    const mockSearchTrains = jest.fn();
    mockUseTrainSearch.mockReturnValue({
      searchTrains: mockSearchTrains,
      isLoading: false,
      error: null,
    });

    renderComponent();

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Source station'), {
      target: { value: 'Mumbai' },
    });
    fireEvent.change(screen.getByPlaceholderText('Destination station'), {
      target: { value: 'Delhi' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: 'Search Trains' }));

    await waitFor(() => {
      expect(mockSearchTrains).toHaveBeenCalledWith({
        from: 'Mumbai',
        to: 'Delhi',
        date: expect.any(Date),
        passengers: 1,
        class: '',
      });
    });
  });

  it('shows loading state during search', () => {
    mockUseTrainSearch.mockReturnValue({
      searchTrains: jest.fn(),
      isLoading: true,
      error: null,
    });

    renderComponent();

    expect(screen.getByRole('button', { name: 'Searching...' })).toBeDisabled();
  });

  it('displays error message when search fails', () => {
    mockUseTrainSearch.mockReturnValue({
      searchTrains: jest.fn(),
      isLoading: false,
      error: new Error('Search failed'),
    });

    renderComponent();

    expect(screen.getByText('Search failed')).toBeInTheDocument();
  });
});
```

### Integration Testing
```typescript
// __tests__/integration/booking-flow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BookingFlow } from '@/components/features/BookingFlow';

describe('Booking Flow Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderBookingFlow = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BookingFlow />
      </QueryClientProvider>
    );
  };

  it('completes full booking flow', async () => {
    const user = userEvent.setup();
    renderBookingFlow();

    // Step 1: Search trains
    await user.type(screen.getByPlaceholderText('Source station'), 'Mumbai');
    await user.type(screen.getByPlaceholderText('Destination station'), 'Delhi');
    await user.click(screen.getByRole('button', { name: 'Search Trains' }));

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Select a train')).toBeInTheDocument();
    });

    // Step 2: Select train
    await user.click(screen.getByText('Mumbai Rajdhani Express'));

    // Step 3: Add passenger details
    await waitFor(() => {
      expect(screen.getByText('Passenger Details')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.type(screen.getByLabelText('Age'), '30');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 4: Select seats
    await waitFor(() => {
      expect(screen.getByText('Select Seats')).toBeInTheDocument();
    });

    await user.click(screen.getByText('A1'));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    // Step 5: Review and pay
    await waitFor(() => {
      expect(screen.getByText('Review & Payment')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Pay Now' }));

    // Verify booking completion
    await waitFor(() => {
      expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
    });
  });
});
```

## Error Handling

### Error Boundaries
```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
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
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Something went wrong
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                We're sorry, but something unexpected happened. Please try again.
              </p>
              
              <div className="mt-6">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Global Error Handler
```typescript
// lib/errorHandler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR');
  }

  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR');
}

export function logError(error: Error, context?: Record<string, any>) {
  console.error('Application Error:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });

  // Send to error reporting service
  if (typeof window !== 'undefined') {
    // Sentry.captureException(error, { extra: context });
  }
}
```

---

This frontend architecture provides a solid foundation for building a modern, performant, and accessible React application. The component-based architecture, combined with proper state management and performance optimizations, ensures a great user experience while maintaining code quality and maintainability.
