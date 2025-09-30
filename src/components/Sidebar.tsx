import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { docsManifest } from '../utils/docsManifest';
import { useTheme } from '../contexts/ThemeContext';
import VirtualizedList from './VirtualizedList';
import { 
  ChevronDown, 
  ChevronRight, 
  ChevronLeft,
  FileText, 
  Folder, 
  Sun, 
  Moon, 
  X,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  isTablet?: boolean;
  isMiniSidebar?: boolean;
  onToggleMini?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onToggle, 
  isMobile = false, 
  isTablet = false, 
  isMiniSidebar = false, 
  onToggleMini 
}) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Auto-expand project if current route is within it
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const currentProject = pathSegments[0];
      setExpandedProjects(prev => new Set([...prev, currentProject]));
    }
  }, [location.pathname]);

  const toggleProject = (projectName: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectName)) {
        newSet.delete(projectName);
      } else {
        newSet.add(projectName);
      }
      return newSet;
    });
  };

  const isActiveFile = (projectName: string, fileName: string) => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    return pathSegments.length === 2 && 
           pathSegments[0] === projectName && 
           pathSegments[1] === fileName;
  };

  const isActiveProject = (projectName: string) => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    return pathSegments.length === 1 && pathSegments[0] === projectName;
  };

  const projects = Object.values(docsManifest.projects);
  
  // Flatten all files for virtual scrolling when there are many projects
  const allFiles = useMemo(() => {
    const files: Array<{ project: typeof projects[0]; file: typeof projects[0]['files'][0] }> = [];
    projects.forEach(project => {
      project.files.forEach(file => {
        files.push({ project, file });
      });
    });
    return files;
  }, [projects]);

  const shouldUseVirtualization = allFiles.length > 50; // Use virtualization for 50+ files

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-neutral-900">
      {/* Header */}
      <div className={`flex items-center border-b border-neutral-200 dark:border-neutral-700 ${
        isMiniSidebar ? 'justify-center p-2' : 'justify-between p-4'
      }`}>
        <Link 
          to="/" 
          className={`flex items-center font-semibold text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 hover:scale-105 ${
            isMiniSidebar ? 'text-sm' : 'text-lg'
          }`}
          onClick={() => {
            if (isMobile || isTablet) {
              onToggle();
            }
          }}
          title={isMiniSidebar ? 'Documentation Hub' : undefined}
        >
          <BookOpen className={`${isMiniSidebar ? 'h-4 w-4' : 'h-5 w-5 mr-2'}`} />
          {!isMiniSidebar && 'Documentation'}
        </Link>

        {!isMiniSidebar && (
          <div className="flex items-center space-x-2">
            {/* Mini sidebar toggle (tablet only) */}
            {isTablet && onToggleMini && (
              <button
                onClick={onToggleMini}
                className="min-h-[44px] min-w-[44px] p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 active:bg-neutral-300 dark:active:bg-neutral-600 transition-all duration-150 hover:scale-105 active:scale-95 touch-manipulation"
                aria-label="Toggle mini sidebar"
                title="Toggle mini sidebar"
              >
                <ChevronLeft className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="min-h-[44px] min-w-[44px] p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 active:bg-neutral-300 dark:active:bg-neutral-600 transition-all duration-150 hover:scale-105 active:scale-95 touch-manipulation"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
              ) : (
                <Sun className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
              )}
            </button>

            {/* Close button (mobile/tablet only) */}
            {(isMobile || isTablet) && (
              <button
                onClick={onToggle}
                className="min-h-[44px] min-w-[44px] p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 active:bg-neutral-300 dark:active:bg-neutral-600 transition-all duration-150 hover:scale-105 active:scale-95 touch-manipulation"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isMiniSidebar ? 'p-2' : 'p-4'}`}>
        {shouldUseVirtualization ? (
          <VirtualizedList
            items={allFiles}
            itemHeight={44}
            containerHeight={400}
            className="space-y-2"
            renderItem={({ project, file }) => {
              const isActive = isActiveFile(project.name, file.fileName);
              return (
                <Link
                  key={file.fullPath}
                  to={file.fullPath}
                  className={`flex items-center min-h-[44px] px-3 py-3 rounded-lg text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] touch-manipulation ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-primary-600 dark:hover:text-primary-400 active:bg-neutral-200 dark:active:bg-neutral-700'
                  }`}
                  onClick={() => {
                    if (isMobile || isTablet) {
                      onToggle();
                    }
                  }}
                >
                  <FileText className="h-3 w-3 mr-3" />
                  <span className="capitalize">
                    {file.fileName.replace(/-/g, ' ')}
                  </span>
                </Link>
              );
            }}
          />
        ) : (
          <div className="space-y-2">
            {/* Home link */}
            <Link
              to="/"
              className={`flex items-center min-h-[44px] rounded-lg font-medium transition-all duration-150 touch-manipulation ${
                isMiniSidebar ? 'justify-center px-2 py-3' : 'px-3 py-3'
              } ${
                location.pathname === '/'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-primary-600 dark:hover:text-primary-400 active:bg-neutral-200 dark:active:bg-neutral-700'
              }`}
              onClick={() => {
                if (isMobile || isTablet) {
                  onToggle();
                }
              }}
              title={isMiniSidebar ? 'All Projects' : undefined}
            >
              <BookOpen className={`${isMiniSidebar ? 'h-4 w-4' : 'h-4 w-4 mr-3'}`} />
              {!isMiniSidebar && 'All Projects'}
            </Link>

            {/* Projects */}
            {projects.map((project) => {
              const isExpanded = expandedProjects.has(project.name);
              const isProjectActive = isActiveProject(project.name);

            return (
              <div key={project.name} className="space-y-1">
                {/* Project header */}
                <div className="flex items-center">
                  {isMiniSidebar ? (
                    // Mini sidebar: icon only with tooltip
                    <Link
                      to={`/${project.name}`}
                      className={`flex items-center justify-center min-h-[44px] w-full rounded-lg font-medium transition-all duration-150 touch-manipulation ${
                        isProjectActive
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 shadow-sm'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-primary-600 dark:hover:text-primary-400 active:bg-neutral-200 dark:active:bg-neutral-700'
                      }`}
                      title={`${project.name.replace(/-/g, ' ')} (${project.files.length} files)`}
                      onClick={() => {
                        if (isTablet) {
                          onToggle();
                        }
                      }}
                    >
                      <Folder className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    </Link>
                  ) : (
                    // Full sidebar: expandable project
                    <>
                      <button
                        onClick={() => toggleProject(project.name)}
                        className="flex items-center flex-1 min-h-[44px] px-3 py-3 rounded-lg text-sm font-medium text-left transition-all duration-150 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:scale-[1.02] active:bg-neutral-200 dark:active:bg-neutral-700 active:scale-[0.98] touch-manipulation"
                      >
                        <div className="flex items-center flex-1">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 mr-2 text-neutral-500 dark:text-neutral-400 transition-transform duration-200" />
                            ) : (
                              <ChevronRight className="h-4 w-4 mr-2 text-neutral-500 dark:text-neutral-400 transition-transform duration-200" />
                            )}
                            <Folder className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                            <span className={`capitalize ${
                              isProjectActive
                                ? 'text-primary-700 dark:text-primary-300 font-semibold'
                                : 'text-neutral-700 dark:text-neutral-300'
                            }`}>
                              {project.name.replace(/-/g, ' ')}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-full">
                            {project.files.length}
                          </span>
                        </button>

                        {/* Project link */}
                        <Link
                          to={`/${project.name}`}
                          className={`min-h-[44px] min-w-[44px] p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-700 transition-all duration-150 hover:scale-110 active:scale-95 touch-manipulation ${
                            isProjectActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                          title={`View ${project.name} overview`}
                          onClick={() => {
                            if (isMobile || isTablet) {
                              onToggle();
                            }
                          }}
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Project files - only show in full sidebar */}
                  {!isMiniSidebar && isExpanded && (
                    <div className="ml-6 space-y-1">
                      {project.files.map((file) => {
                        const isActive = isActiveFile(project.name, file.fileName);
                        
                        return (
                          <Link
                            key={file.fullPath}
                            to={file.fullPath}
                            className={`flex items-center min-h-[44px] px-3 py-3 rounded-lg text-sm transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] touch-manipulation ${
                              isActive
                                ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium shadow-sm'
                                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-primary-600 dark:hover:text-primary-400 active:bg-neutral-200 dark:active:bg-neutral-700'
                            }`}
                            onClick={() => {
                              if (isMobile || isTablet) {
                                onToggle();
                              }
                            }}
                          >
                            <FileText className="h-3 w-3 mr-3" />
                            <span className="capitalize">
                              {file.fileName.replace(/-/g, ' ')}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Empty state */}
            {projects.length === 0 && (
              <div className="text-center py-8">
                <Folder className="h-8 w-8 text-neutral-400 dark:text-neutral-600 mx-auto mb-2" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  No projects found
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  Add markdown files to /docs
                </p>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      {!isMiniSidebar && (
        <div className="border-t border-neutral-200 dark:border-neutral-700 p-4">
          <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} • {' '}
            {docsManifest.allFiles.length} {docsManifest.allFiles.length === 1 ? 'file' : 'files'}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
