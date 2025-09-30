import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { docsManifest } from '../utils/docsManifest';
import { ArrowLeft, FileText, Folder } from 'lucide-react';
import NotFoundPage from './NotFoundPage';

const ProjectView: React.FC = () => {
  const { projectName } = useParams<{ projectName: string }>();
  
  if (!projectName) {
    return (
      <NotFoundPage
        type="page"
        message="Project name is required"
      />
    );
  }

  const project = docsManifest.projects[projectName];

  if (!project) {
    return (
      <NotFoundPage
        type="project"
        projectName={projectName}
        message={`The project "${projectName}" doesn't exist or has no documentation files.`}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documentation Hub
        </Link>

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Folder className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
              {project.name.replace(/-/g, ' ')}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {project.files.length} {project.files.length === 1 ? 'document' : 'documents'} in this project
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {project.files.map((file) => (
            <Link
              key={file.fullPath}
              to={file.fullPath}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 dark:border-gray-700 group"
            >
              <div className="flex items-start">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 mt-1 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors duration-200" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 capitalize group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors duration-200">
                    {file.fileName.replace(/-/g, ' ')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Click to read this document
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors duration-200">
                <span className="text-sm font-medium">Read more</span>
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {project.files.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Documents Found</h3>
            <p className="text-gray-600 dark:text-gray-300">
              This project doesn't have any markdown files yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectView;
