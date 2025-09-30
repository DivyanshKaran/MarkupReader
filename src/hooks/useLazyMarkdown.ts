import { useState, useCallback } from 'react';
import { loadMarkdownContent } from '../utils/docsManifest';

interface UseLazyMarkdownOptions {
  enabled?: boolean;
  threshold?: number;
  rootMargin?: string;
}

interface UseLazyMarkdownReturn {
  content: string;
  loading: boolean;
  error: string | null;
  ref: (node: HTMLElement | null) => void;
}

export const useLazyMarkdown = (
  markdownPath: string,
  options: UseLazyMarkdownOptions = {}
): UseLazyMarkdownReturn => {
  const { enabled = true, threshold = 0.1, rootMargin = '50px' } = options;
  
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  const loadContent = useCallback(async () => {
    if (hasLoaded || !enabled) return;
    
    try {
      setLoading(true);
      setError(null);
      const markdownContent = await loadMarkdownContent(markdownPath);
      setContent(markdownContent);
      setHasLoaded(true);
    } catch (err) {
      console.error('Failed to load markdown content:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [markdownPath, hasLoaded, enabled]);

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node || !enabled || hasLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadContent();
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [loadContent, enabled, hasLoaded, threshold, rootMargin]);

  return {
    content,
    loading,
    error,
    ref,
  };
};
