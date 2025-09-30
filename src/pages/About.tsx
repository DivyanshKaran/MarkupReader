import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About This Project</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 leading-relaxed mb-4">
              This is a Vite + React + TypeScript project with Tailwind CSS configured and ready to use.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              The project structure includes organized directories for components, pages, and utilities,
              making it easy to scale and maintain as your application grows.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
