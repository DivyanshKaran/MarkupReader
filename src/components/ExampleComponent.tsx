import React from 'react';

interface ExampleComponentProps {
  title?: string;
  children?: React.ReactNode;
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({ 
  title = 'Example Component', 
  children 
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md border">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      {children && (
        <div className="text-gray-600">
          {children}
        </div>
      )}
    </div>
  );
};
