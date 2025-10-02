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
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-16 animate-slide-in">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-8">
            <BookOpen className="h-8 w-8 text-neutral-600 dark:text-neutral-400" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-clean mb-6">
            Documentation Hub
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-12 leading-relaxed max-w-3xl mx-auto">
            Clean, organized documentation for modern developers. 
            Everything you need to build amazing projects.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
            <div className="flex items-center px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <Folder className="h-4 w-4 mr-2 accent-green" />
              <span className="text-clean">{projects.length} Projects</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <FileText className="h-4 w-4 mr-2 accent-green" />
              <span className="text-clean">{docsManifest.allFiles.length} Documents</span>
            </div>
            <div className="flex items-center px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <Clock className="h-4 w-4 mr-2 accent-red" />
              <span className="text-clean">Always Updated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-clean">
            Available Projects
          </h2>
        </div>
        
        {projects.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => {
              const firstFile = getFirstFile(project);
              const projectName = formatProjectName(project.name);
              const description = getProjectDescription(project.name);
              const readingTime = getProjectReadingTime(project);
              
              return (
                <div
                  key={project.name}
                  className="card-minimal bg-clean border border-clean rounded-lg overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg mr-3">
                          <Folder className="h-6 w-6 accent-green" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-clean">
                            {projectName}
                          </h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {project.files.length} {project.files.length === 1 ? 'document' : 'documents'}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                        {readingTime}m
                      </div>
                    </div>
                    
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-6">
                      {description}
                    </p>
                  </div>

                  {/* File Preview */}
                  <div className="px-6 pb-4">
                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 mb-4">
                      <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3 flex items-center">
                        <FileText className="h-3 w-3 mr-2" />
                        Available Documents
                      </h4>
                      <div className="space-y-2">
                        {project.files.slice(0, 3).map((file) => (
                          <div key={file.fileName} className="flex items-center text-sm">
                            <div className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full mr-3"></div>
                            <span className="text-neutral-600 dark:text-neutral-400 capitalize">
                              {file.fileName.replace(/-/g, ' ')}
                            </span>
                          </div>
                        ))}
                        {project.files.length > 3 && (
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            +{project.files.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex gap-3">
                      {firstFile ? (
                        <Link
                          to={firstFile.fullPath}
                          className="flex-1 btn-clean inline-flex items-center justify-center px-4 py-3 bg-clean text-neutral-900 dark:text-neutral-100 text-sm font-medium border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                        >
                          <span>Start Reading</span>
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      ) : (
                        <div className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 text-sm font-medium rounded cursor-not-allowed">
                          No Documents
                        </div>
                      )}
                      
                      <Link
                        to={`/${project.name}`}
                        className="min-h-[44px] min-w-[44px] btn-clean inline-flex items-center justify-center px-4 py-3 border border-neutral-300 dark:border-neutral-600 text-clean hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
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
          <div className="text-center py-16 bg-clean border border-clean rounded-lg">
            <BookOpen className="mx-auto h-16 w-16 text-neutral-400 dark:text-neutral-600 mb-4" />
            <h3 className="text-xl font-medium text-clean mb-2">
              No Projects Found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
              Add markdown files to the <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-sm">/docs</code> folder to get started.
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-clean border border-clean rounded-lg p-8">
        <h3 className="text-xl font-bold text-clean mb-6 text-center">
          Documentation Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold accent-green mb-1">
              {projects.length}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Projects
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold accent-green mb-1">
              {docsManifest.allFiles.length}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Documents
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold accent-red mb-1">
              {Math.round(docsManifest.allFiles.length / Math.max(projects.length, 1))}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Avg per Project
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold accent-green mb-1">
              {projects.reduce((total, project) => total + getProjectReadingTime(project), 0)}m
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Reading Time
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;