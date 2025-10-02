import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isMiniSidebar, setIsMiniSidebar] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Handle responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      const tablet = width >= 768 && width < 1024;
      const desktop = width >= 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      // Auto-close sidebar on mobile/tablet when switching to desktop
      if (desktop) {
        setSidebarOpen(false);
      }
      
      // Auto-enable mini sidebar on tablet landscape
      if (tablet && window.innerHeight < window.innerWidth) {
        setIsMiniSidebar(true);
      } else {
        setIsMiniSidebar(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close sidebar on route change for mobile/tablet
  useEffect(() => {
    if ((isMobile || isTablet) && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile, isTablet, sidebarOpen]);

  // Swipe gesture support for mobile/tablet
  useSwipeGesture({
    onSwipeRight: () => {
      if ((isMobile || isTablet) && !sidebarOpen) {
        setSidebarOpen(true);
      }
    },
    onSwipeLeft: () => {
      if ((isMobile || isTablet) && sidebarOpen) {
        setSidebarOpen(false);
      }
    },
    threshold: 50,
  });

  return (
    <div className="min-h-screen relative">
      {/* Animated background pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow animation-delay-4000"></div>
        </div>
        <div className="dark:absolute dark:inset-0 dark:bg-gradient-to-br dark:from-purple-900/20 dark:to-blue-900/20 dark:opacity-40"></div>
      </div>

      {/* Mobile/Tablet backdrop overlay */}
      {(isMobile || isTablet) && sidebarOpen && (
        <div
          className="fixed inset-0 glass-dark z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <div className="flex h-screen relative z-10">
        {/* Desktop Sidebar - Fixed */}
        <div className="hidden lg:flex lg:flex-shrink-0 lg:fixed lg:inset-y-0 lg:left-0 lg:w-80 lg:z-30">
          <div className="flex flex-col w-full">
            <Sidebar 
              isOpen={true} 
              onToggle={() => {}} 
              isMobile={false} 
              isTablet={false}
              isMiniSidebar={false}
              onToggleMini={() => {}}
            />
          </div>
        </div>

        {/* Tablet Sidebar - Overlay */}
        {isTablet && (
          <div
            className={`fixed top-0 left-0 h-full glass transform transition-all duration-300 ease-in-out z-50 ${
              isMiniSidebar ? 'w-16' : 'w-64'
            } ${
              sidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <Sidebar 
              isOpen={sidebarOpen} 
              onToggle={closeSidebar} 
              isMobile={false}
              isTablet={true}
              isMiniSidebar={isMiniSidebar}
              onToggleMini={() => setIsMiniSidebar(!isMiniSidebar)}
            />
          </div>
        )}

        {/* Mobile Sidebar - Overlay */}
        {isMobile && (
          <div
            className={`fixed top-0 left-0 h-full w-80 glass transform transition-all duration-300 ease-in-out z-50 ${
              sidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <Sidebar 
              isOpen={sidebarOpen} 
              onToggle={closeSidebar} 
              isMobile={true}
              isTablet={false}
              isMiniSidebar={false}
              onToggleMini={() => {}}
            />
          </div>
        )}

        {/* Main content area */}
        <div className={`flex-1 flex flex-col ${
          isTablet && isMiniSidebar ? 'md:pl-16' : 
          isTablet ? 'md:pl-64' : 
          'lg:pl-80'
        }`}>
          {/* Mobile/Tablet header */}
          <MobileHeader 
            sidebarOpen={sidebarOpen} 
            onToggleSidebar={toggleSidebar}
            isTablet={isTablet}
            isMiniSidebar={isMiniSidebar}
            onToggleMini={() => setIsMiniSidebar(!isMiniSidebar)}
          />

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto">
            <div className={`mx-auto px-4 sm:px-6 py-8 ${
              isTablet ? 'max-w-4xl md:px-8' : 
              'max-w-6xl lg:px-8 lg:py-12'
            }`}>
              <div className={`animate-fade-in ${
                isTablet ? 'max-w-3xl' : 
                'max-w-none lg:max-w-5xl'
              }`}>
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
