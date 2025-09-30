import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { getInstallPrompt, installPWA, isPWA, canInstallPWA } from '../utils/serviceWorker';

interface PWAInstallPromptProps {
  className?: string;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className = '' }) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (isPWA()) {
      setIsInstalled(true);
      return;
    }

    // Check if PWA can be installed
    if (!canInstallPWA()) {
      return;
    }

    // Get install prompt
    getInstallPrompt().then((prompt) => {
      if (prompt) {
        setInstallPrompt(prompt);
        setShowPrompt(true);
      }
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      const success = await installPWA(installPrompt);
      if (success) {
        setShowPrompt(false);
        setIsInstalled(true);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt || !installPrompt) {
    return null;
  }

  // Check if dismissed in this session
  if (sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 ${className}`}>
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              Install Documentation Hub
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Add to your home screen for quick access and offline reading.
            </p>

            {/* Benefits */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2 text-xs text-neutral-600 dark:text-neutral-400">
                <Smartphone className="h-3 w-3" />
                <span>Works offline</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-neutral-600 dark:text-neutral-400">
                <Monitor className="h-3 w-3" />
                <span>Faster loading</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 mt-4">
              <button
                onClick={handleInstall}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors duration-200"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
