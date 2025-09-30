import React from 'react';
import { Link } from 'react-router-dom';
import { docsManifest } from '../utils/docsManifest';
import { BookOpen, FileText, ArrowRight, Folder, Clock } from 'lucide-react';

const HomePage: React.FC = () => {
  const projects = Object.values(docsManifest.projects);

  // Helper function to get the first markdown file in a project
  const getFirstFile = (project: typeof projects[0]) => {
    return project.files.length > 0 ? project.files[0] : null;
  };

  // Helper function to format project name for display
  const formatProjectName = (name: string) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to get project description based on name
  const getProjectDescription = (name: string) => {
    const descriptions: Record<string, string> = {
      'react-guide': 'Comprehensive guide to React development, covering components, hooks, and best practices.',
      'typescript-basics': 'Essential TypeScript concepts and patterns for modern web development.',
      'vite-setup': 'Complete guide to setting up and configuring Vite for your projects.',
    };
    return descriptions[name] || `Documentation and guides for ${formatProjectName(name)}.`;
  };

  // Helper function to estimate reading time for entire project
  const getProjectReadingTime = (project: typeof projects[0]) => {
    // Rough estimate: average 200 words per minute, 5 characters per word
    const totalChars = project.files.reduce((total, file) => total + (file.fileName.length * 100), 0);
    const minutes = Math.ceil(totalChars / (200 * 5));
    return Math.max(1, minutes);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl border border-primary-100 dark:border-neutral-700 animate-slide-in">
        <div className="max-w-3xl mx-auto px-6">
          <BookOpen className="mx-auto h-16 w-16 text-blue-600 dark:text-blue-400 mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Documentation Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Explore our comprehensive collection of guides, tutorials, and documentation. 
            Everything you need to build amazing projects, organized and ready to dive into.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Folder className="h-4 w-4 mr-2" />
              <span>{projects.length} Projects</span>
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <span>{docsManifest.allFiles.length} Documents</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>Always up-to-date</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Available Projects
        </h2>
        
        {projects.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const firstFile = getFirstFile(project);
              const projectName = formatProjectName(project.name);
              const description = getProjectDescription(project.name);
              const readingTime = getProjectReadingTime(project);
              
              return (
                <div
                  key={project.name}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden hover:scale-[1.02]"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                          <Folder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {projectName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {project.files.length} {project.files.length === 1 ? 'document' : 'documents'}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {readingTime} min read
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                      {description}
                    </p>
                  </div>

                  {/* File Preview */}
                  <div className="px-6 pb-4">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-4">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        Available Documents
                      </h4>
                      <div className="space-y-1">
                        {project.files.slice(0, 3).map((file) => (
                          <div key={file.fileName} className="flex items-center text-sm">
                            <FileText className="h-3 w-3 text-gray-400 dark:text-gray-500 mr-2" />
                            <span className="text-gray-600 dark:text-gray-400 capitalize">
                              {file.fileName.replace(/-/g, ' ')}
                            </span>
                          </div>
                        ))}
                        {project.files.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                            +{project.files.length - 3} more documents
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="px-6 pb-6">
                    <div className="flex space-x-3">
                      {firstFile ? (
                        <Link
                          to={firstFile.fullPath}
                          className="flex-1 inline-flex items-center justify-center min-h-[44px] px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 active:bg-blue-800 dark:active:bg-blue-500 transition-all duration-150 group touch-manipulation"
                        >
                          Start Reading
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </Link>
                      ) : (
                        <div className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed">
                          No documents
                        </div>
                      )}
                      
                      <Link
                        to={`/${project.name}`}
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-all duration-150 touch-manipulation"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No Projects Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              It looks like there are no documentation projects available yet. 
              Add some markdown files to the <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">/docs</code> folder to get started.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Expected structure:</p>
              <code className="block bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mt-2 text-left max-w-xs mx-auto">
                docs/<br />
                ├── project-name/<br />
                │   ├── file1.md<br />
                │   └── file2.md<br />
                └── another-project/<br />
                &nbsp;&nbsp;&nbsp;&nbsp;└── guide.md
              </code>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Documentation Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {projects.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Projects
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {docsManifest.allFiles.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Documents
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {Math.round(docsManifest.allFiles.length / Math.max(projects.length, 1))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Avg per Project
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {projects.reduce((total, project) => total + getProjectReadingTime(project), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Min to Read
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
