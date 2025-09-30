import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check } from 'lucide-react';

// Import custom highlight.js CSS for both light and dark themes
import '../styles/highlight.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  inline?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className, inline }) => {
  const [copied, setCopied] = React.useState(false);
  
  // Extract language from className (format: "language-javascript")
  const language = className?.replace('language-', '') || 'text';
  
  const handleCopy = async () => {
    if (typeof children === 'string') {
      try {
        await navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }
  };

  if (inline) {
    return (
      <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200 dark:border-gray-700">
        {children}
      </code>
    );
  }

  return (
    <div className="relative group mb-6">
      {/* Language label and copy button */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg px-4 py-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="min-h-[32px] min-w-[32px] opacity-0 group-hover:opacity-100 transition-all duration-150 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 touch-manipulation"
          title="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>
      
      {/* Code content */}
      <pre className="bg-white dark:bg-gray-900 border-x border-b border-gray-200 dark:border-gray-700 rounded-b-lg p-4 overflow-x-auto touch-pan-x">
        <code className={className}>
          {children}
        </code>
      </pre>
    </div>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <article className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700 pb-2 sm:pb-3 mt-6 sm:mt-8 first:mt-0 leading-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 sm:mt-10 mb-3 sm:mb-4 border-b border-gray-100 dark:border-gray-800 pb-2 leading-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg sm:text-xl font-medium text-gray-800 dark:text-gray-200 mt-6 sm:mt-8 mb-2 sm:mb-3 leading-tight">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 sm:mt-6 mb-2 leading-tight">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 mt-3 sm:mt-4 mb-2 leading-tight">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mt-3 sm:mt-4 mb-2 uppercase tracking-wide leading-tight">
              {children}
            </h6>
          ),

          // Paragraphs and text
          p: ({ children }) => (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base max-w-none">
              {children}
            </p>
          ),

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-200 dark:decoration-blue-800 hover:decoration-blue-400 dark:hover:decoration-blue-600 transition-colors duration-200"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-4 sm:ml-6 space-y-1 sm:space-y-2 mb-3 sm:mb-4 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-4 sm:ml-6 space-y-1 sm:space-y-2 mb-3 sm:mb-4 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),

          // Code blocks and inline code
          code: CodeBlock as any,
          pre: ({ children }) => children, // We handle pre in CodeBlock

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 my-3 sm:my-6 italic rounded-r-lg">
              <div className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                {children}
              </div>
            </blockquote>
          ),

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto touch-pan-x my-4 sm:my-6">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg text-sm sm:text-base">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50 dark:bg-gray-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              {children}
            </td>
          ),

          // Horizontal rule
          hr: () => (
            <hr className="my-4 sm:my-8 border-t border-gray-200 dark:border-gray-700" />
          ),

          // Images
          img: ({ src, alt }) => {
            // Lazy load the ProgressiveImage component
            const ProgressiveImage = React.lazy(() => import('./ProgressiveImage'));
            return (
              <React.Suspense fallback={
                <div className="my-3 sm:my-4 w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-gray-400 dark:text-gray-600">Loading image...</div>
                </div>
              }>
                <ProgressiveImage
                  src={src || ''}
                  alt={alt || ''}
                  className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 my-3 sm:my-4 w-full"
                  loading="lazy"
                />
              </React.Suspense>
            );
          },

          // Strong and emphasis
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800 dark:text-gray-200">
              {children}
            </em>
          ),

          // Task lists (GitHub Flavored Markdown)
          input: ({ type, checked, disabled }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  className="mr-2 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                  readOnly
                />
              );
            }
            return <input type={type} checked={checked} disabled={disabled} />;
          },

          // Delete/strikethrough
          del: ({ children }) => (
            <del className="line-through text-gray-500 dark:text-gray-400">
              {children}
            </del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};

export default MarkdownRenderer;
