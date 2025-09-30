import React, { Suspense, lazy } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Lazy load the MarkdownRenderer component
const MarkdownRenderer = lazy(() => import('./MarkdownRenderer'));

interface LazyMarkdownRendererProps {
  content: string;
  className?: string;
  fallback?: React.ReactNode;
}

const LazyMarkdownRenderer: React.FC<LazyMarkdownRendererProps> = ({
  content,
  className,
  fallback = (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" text="Loading content..." />
    </div>
  ),
}) => {
  return (
    <Suspense fallback={fallback}>
      <MarkdownRenderer content={content} className={className} />
    </Suspense>
  );
};

export default LazyMarkdownRenderer;
