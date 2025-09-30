import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileX, Home, ArrowLeft, Search } from 'lucide-react';
import { docsManifest } from '../utils/docsManifest';

interface NotFoundPageProps {
  type?: 'project' | 'file' | 'page';
  projectName?: string;
  fileName?: string;
  message?: string;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ 
  type = 'page', 
  projectName, 
  fileName, 
  message 
}) => {
  const navigate = useNavigate();
  const projects = Object.values(docsManifest.projects);

  const getTitle = () => {
    switch (type) {
      case 'project':
        return `Project "${projectName}" not found`;
      case 'file':
        return `Document "${fileName}" not found`;
      default:
        return 'Page not found';
    }
  };

  const getDescription = () => {
    if (message) return message;
    
    switch (type) {
      case 'project':
        return `The project "${projectName}" doesn't exist or has no documentation files.`;
      case 'file':
        return `The document "${fileName}" doesn't exist in the "${projectName}" project.`;
      default:
        return "The page you're looking for doesn't exist or has been moved.";
    }
  };

  const getSuggestions = () => {
    const suggestions = [];

    if (type === 'project' && projectName) {
      // Find similar project names
      const similarProjects = projects.filter(project => 
        project.name.toLowerCase().includes(projectName.toLowerCase()) ||
        project.name.replace(/-/g, ' ').toLowerCase().includes(projectName.toLowerCase())
      );
      
      if (similarProjects.length > 0) {
        suggestions.push({
          title: 'Similar projects:',
          items: similarProjects.map(project => ({
            name: project.name.replace(/-/g, ' '),
            href: `/${project.name}`,
            description: `${project.files.length} documents`
          }))
        });
      }
    }

    if (type === 'file' && projectName) {
      const project = projects.find(p => p.name === projectName);
      if (project && project.files.length > 0) {
        suggestions.push({
          title: `Available documents in ${projectName}:`,
          items: project.files.slice(0, 5).map(file => ({
            name: file.fileName.replace(/-/g, ' '),
            href: file.fullPath,
            description: 'Document'
          }))
        });
      }
    }

    // Always show all projects
    if (projects.length > 0) {
      suggestions.push({
        title: 'All available projects:',
        items: projects.map(project => ({
          name: project.name.replace(/-/g, ' '),
          href: `/${project.name}`,
          description: `${project.files.length} documents`
        }))
      });
    }

    return suggestions;
  };

  const suggestions = getSuggestions();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-2xl mx-auto text-center p-6">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
          <FileX className="mx-auto h-16 w-16 text-neutral-400 dark:text-neutral-600 mb-6" />
          
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
            {getTitle()}
          </h1>
          
          <p className="text-neutral-600 dark:text-neutral-300 mb-8 text-lg">
            {getDescription()}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
            
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white text-sm font-medium rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="text-left">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center">
                <Search className="h-5 w-5 mr-2" />
                What you might be looking for:
              </h2>
              
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <div key={index}>
                    <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      {suggestion.title}
                    </h3>
                    <div className="grid gap-2">
                      {suggestion.items.map((item, itemIndex) => (
                        <Link
                          key={itemIndex}
                          to={item.href}
                          className="block p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors duration-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-neutral-900 dark:text-white capitalize">
                                {item.name}
                              </div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                {item.description}
                              </div>
                            </div>
                            <div className="text-neutral-400 dark:text-neutral-500">
                              →
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              If you believe this is an error, please check the URL or try navigating from the{' '}
              <Link to="/" className="text-primary-600 dark:text-primary-400 hover:underline">
                home page
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
