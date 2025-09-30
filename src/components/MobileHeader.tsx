import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { docsManifest } from '../utils/docsManifest';

interface MobileHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  isTablet?: boolean;
  isMiniSidebar?: boolean;
  onToggleMini?: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  sidebarOpen, 
  onToggleSidebar,
  isTablet = false,
  isMiniSidebar = false,
  onToggleMini
}) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Get current page title based on route
  const getPageTitle = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) {
      return 'Documentation Hub';
    }
    
    if (pathSegments.length === 1) {
      const projectName = pathSegments[0];
      const project = docsManifest.projects[projectName];
      if (project) {
        return project.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      return 'Project';
    }
    
    if (pathSegments.length === 2) {
      const [projectName, fileName] = pathSegments;
      const project = docsManifest.projects[projectName];
      if (project) {
        const file = project.files.find(f => f.fileName === fileName);
        if (file) {
          return file.fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
      }
      return 'Document';
    }
    
    return 'Documentation Hub';
  };

  const pageTitle = getPageTitle();

  return (
    <header className="lg:hidden bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700 transition-colors duration-300 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left side - Menu and Mini Toggle */}
        <div className="flex items-center space-x-2">
          {/* Hamburger Menu Button */}
          <button
            onClick={onToggleSidebar}
            className="min-h-[44px] min-w-[44px] p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 active:bg-neutral-300 dark:active:bg-neutral-500 transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 touch-manipulation"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
            ) : (
              <Menu className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
            )}
          </button>

          {/* Mini Sidebar Toggle (Tablet only) */}
          {isTablet && onToggleMini && (
            <button
              onClick={onToggleMini}
              className="min-h-[44px] min-w-[44px] p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 active:bg-neutral-300 dark:active:bg-neutral-500 transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 touch-manipulation"
              aria-label={isMiniSidebar ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isMiniSidebar ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isMiniSidebar ? (
                <ChevronRight className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
              )}
            </button>
          )}
        </div>

        {/* Page Title */}
        <div className="flex-1 text-center px-4">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
            {pageTitle}
          </h1>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="min-h-[44px] min-w-[44px] p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 active:bg-neutral-300 dark:active:bg-neutral-500 transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 touch-manipulation"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
          ) : (
            <Sun className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
          )}
        </button>
      </div>
    </header>
  );
};

export default MobileHeader;

