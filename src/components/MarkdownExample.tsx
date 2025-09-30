import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface MarkdownExampleProps {
  content?: string;
}

const defaultMarkdown = `# Markdown Example

This component demonstrates **React Markdown** with:

- **GitHub Flavored Markdown** (GFM) support
- **Syntax highlighting** with rehype-highlight
- **Tailwind CSS** styling

## Code Example

\`\`\`typescript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

### Features

| Feature | Status |
|---------|--------|
| React Router | ✅ |
| Tailwind CSS | ✅ |
| TypeScript | ✅ |
| React Markdown | ✅ |

> This is a blockquote example.

Visit [Vite](https://vitejs.dev/) for more information!
`;

export const MarkdownExample: React.FC<MarkdownExampleProps> = ({ 
  content = defaultMarkdown 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Markdown Rendering</h2>
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            pre: ({ children }) => (
              <pre className="bg-gray-100 rounded-md p-4 overflow-x-auto">
                {children}
              </pre>
            ),
            code: ({ children, className }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                    {children}
                  </code>
                );
              }
              return <code className={className}>{children}</code>;
            },
            table: ({ children }) => (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {children}
              </td>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-200 pl-4 italic text-gray-600">
                {children}
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
