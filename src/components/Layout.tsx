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
    <div className="min-h-screen bg-clean">
      {/* Mobile/Tablet backdrop overlay */}
      {(isMobile || isTablet) && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <div className="flex h-screen">
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
            className={`fixed top-0 left-0 h-full bg-clean border-r border-clean transform transition-all duration-200 ease-out z-50 ${
              isMiniSidebar ? 'w-16' : 'w-64'
            } ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
            className={`fixed top-0 left-0 h-full w-80 bg-clean border-r border-clean transform transition-transform duration-200 ease-out z-50 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
          <main className="flex-1 overflow-y-auto bg-clean">
            <div className={`mx-auto px-6 py-8 ${
              isTablet ? 'max-w-4xl' : 
              'max-w-5xl lg:px-8 lg:py-12'
            }`}>
              <div className={`animate-fade-in ${
                isTablet ? 'max-w-3xl' : 
                'max-w-none lg:max-w-4xl'
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