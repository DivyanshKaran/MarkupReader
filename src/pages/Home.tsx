import React from 'react';
import { ExampleComponent, MarkdownExample } from '../components';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 space-y-8">
        <ExampleComponent title="Welcome to Your Vite + React + TypeScript App">
          <p>This project includes:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>⚡ Vite for fast development</li>
            <li>⚛️ React with TypeScript</li>
            <li>🎨 Tailwind CSS for styling</li>
            <li>📱 React Router for navigation</li>
            <li>📝 React Markdown for content</li>
            <li>🔍 Lucide React for icons</li>
          </ul>
        </ExampleComponent>
        
        <MarkdownExample />
      </div>
    </div>
  );
};
