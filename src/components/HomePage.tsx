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
      <div className="relative overflow-hidden glass rounded-4xl p-8 md:p-12 text-center animate-slide-in">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-secondary-500/5 to-accent-500/10"></div>
        <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-br from-primary-400/20 to-secondary-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-32 h-32 bg-gradient-to-br from-accent-400/20 to-primary-400/20 rounded-full blur-xl"></div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-lg mb-8">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
            Documentation Hub
          </h1>
          <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Discover, learn, and build with our comprehensive collection of guides and tutorials.
            Everything you need to create amazing projects, beautifully organized and ready to explore.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium">
            <div className="flex items-center glass rounded-full px-4 py-2">
              <Folder className="h-4 w-4 mr-2 text-primary-500" />
              <span className="text-neutral-700 dark:text-neutral-300">{projects.length} Projects</span>
            </div>
            <div className="flex items-center glass rounded-full px-4 py-2">
              <FileText className="h-4 w-4 mr-2 text-secondary-500" />
              <span className="text-neutral-700 dark:text-neutral-300">{docsManifest.allFiles.length} Documents</span>
            </div>
            <div className="flex items-center glass rounded-full px-4 py-2">
              <Clock className="h-4 w-4 mr-2 text-accent-500" />
              <span className="text-neutral-700 dark:text-neutral-300">Always Updated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text">
            Available Projects
          </h2>
          <div className="hidden md:flex items-center glass rounded-full px-4 py-2">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
              {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
            </span>
          </div>
        </div>
        
        {projects.length > 0 ? (
          <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => {
              const firstFile = getFirstFile(project);
              const projectName = formatProjectName(project.name);
              const description = getProjectDescription(project.name);
              const readingTime = getProjectReadingTime(project);
              
              return (
                <div
                  key={project.name}
                  className="group glass card-hover rounded-2xl overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Card Header */}
                  <div className="relative p-8">
                    {/* Background accent */}
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${
                      index % 3 === 0 ? 'bg-primary-400' :
                      index % 3 === 1 ? 'bg-secondary-400' : 'bg-accent-400'
                    }`}></div>
                    
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`p-3 rounded-xl mr-4 ${
                            index % 3 === 0 ? 'bg-primary-500/10' :
                            index % 3 === 1 ? 'bg-secondary-500/10' : 'bg-accent-500/10'
                          }`}>
                            <Folder className={`h-8 w-8 ${
                              index % 3 === 0 ? 'text-primary-500' :
                              index % 3 === 1 ? 'text-secondary-500' : 'text-accent-500'
                            }`} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold gradient-text group-hover:scale-105 transition-transform">
                              {projectName}
                            </h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                              {project.files.length} {project.files.length === 1 ? 'Document' : 'Documents'}
                            </p>
                          </div>
                        </div>
                        <div className={`text-xs font-semibold glass rounded-full px-3 py-1 ${
                          index % 3 === 0 ? 'text-primary-600 bg-primary-500/10' :
                          index % 3 === 1 ? 'text-secondary-600 bg-secondary-500/10' : 'text-accent-600 bg-accent-500/10'
                        }`}>
                          {readingTime} min
                        </div>
                      </div>
                      
                      <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
                        {description}
                      </p>
                    </div>
                  </div>

                  {/* File Preview */}
                  <div className="px-8 pb-6">
                    <div className="glass rounded-xl p-4 mb-6">
                      <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-primary-500" />
                        Available Documents
                      </h4>
                      <div className="space-y-3">
                        {project.files.slice(0, 3).map((file) => (
                          <div key={file.fileName} className="flex items-center text-sm group/item">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-400 to-secondary-400 mr-3 group-hover/item:scale-125 transition-transform"></div>
                            <span className="text-neutral-600 dark:text-neutral-400 capitalize group-hover/item:text-neutral-900 dark:group-hover/item:text-white transition-colors">
                              {file.fileName.replace(/-/g, ' ')}
                            </span>
                          </div>
                        ))}
                        {project.files.length > 3 && (
                          <div className="text-sm text-primary-500 dark:text-primary-400 font-medium">
                            +{project.files.length - 3} more documents
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex gap-3">
                      {firstFile ? (
                        <Link
                          to={firstFile.fullPath}
                          className={`flex-1 btn-modern inline-flex items-center justify-center min-h-[48px] px-6 py-3 text-white text-sm font-semibold rounded-xl transition-all duration-300 group ${
                            index % 3 === 0 ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700' :
                            index % 3 === 1 ? 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700' :
                            'bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700'
                          }`}
                        >
                          <span>Start Reading</span>
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                      ) : (
                        <div className={`flex-1 inline-flex items-center justify-center px-6 py-3 glass text-neutral-400 dark:text-neutral-500 text-sm font-semibold rounded-xl cursor-not-allowed`}>
                          No Documents
                        </div>
                      )}
                      
                      <Link
                        to={`/${project.name}`}
                        className="min-h-[48px] min-w-[48px] btn-modern inline-flex items-center justify-center px-6 py-3 glass text-neutral-700 dark:text-neutral-300 text-sm font-semibold rounded-xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300"
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
      <div className="glass rounded-2xl p-8">
        <h3 className="text-2xl font-bold gradient-text mb-8 text-center">
          Documentation Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <Folder className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold gradient-text mb-2">
              {projects.length}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
              Active Projects
            </div>
          </div>
          
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold gradient-text mb-2">
              {docsManifest.allFiles.length}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
              Total Documents
            </div>
          </div>
          
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold gradient-text mb-2">
              {Math.round(docsManifest.allFiles.length / Math.max(projects.length, 1))}
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
              Avg per Project
            </div>
          </div>
          
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold gradient-text mb-2">
              {projects.reduce((total, project) => total + getProjectReadingTime(project), 0)}m
            </div>
            <div className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
              Reading Time
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
