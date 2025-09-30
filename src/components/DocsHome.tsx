import React from 'react';
import { Link } from 'react-router-dom';
import { docsManifest } from '../utils/docsManifest';
import { BookOpen, FileText, Folder } from 'lucide-react';

const DocsHome: React.FC = () => {
  const projects = Object.values(docsManifest.projects);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <BookOpen className="mx-auto h-16 w-16 text-blue-600 dark:text-blue-400 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Documentation Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our comprehensive documentation organized by project. 
            Each project contains detailed guides and references to help you get started.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center mb-4">
                <Folder className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                  {project.name.replace(/-/g, ' ')}
                </h2>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {project.files.length} {project.files.length === 1 ? 'document' : 'documents'} available
              </p>
              
              <div className="space-y-2">
                {project.files.slice(0, 3).map((file) => (
                  <Link
                    key={file.fullPath}
                    to={file.fullPath}
                    className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="capitalize">{file.fileName.replace(/-/g, ' ')}</span>
                  </Link>
                ))}
                
                {project.files.length > 3 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    +{project.files.length - 3} more documents
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to={`/${project.name}`}
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  View all documents
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Documentation Found</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Add markdown files to the <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">/docs</code> folder to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocsHome;
