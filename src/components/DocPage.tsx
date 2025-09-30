import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { docsManifest, loadMarkdownContent, findMarkdownFile } from '../utils/docsManifest';
import { FileText, ArrowLeft } from 'lucide-react';
import LazyMarkdownRenderer from './LazyMarkdownRenderer';
import Breadcrumb from './Breadcrumb';
import LoadingSpinner from './LoadingSpinner';
import NotFoundPage from './NotFoundPage';

const DocPage: React.FC = () => {
  const { projectName, fileName } = useParams<{ projectName: string; fileName: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadContent = async () => {
      if (!projectName || !fileName) {
        setError('Project name and file name are required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Find the markdown file
        const markdownFile = findMarkdownFile(projectName, fileName, docsManifest);
        
        if (!markdownFile) {
          setError(`Document "${fileName}" not found in project "${projectName}"`);
          setLoading(false);
          return;
        }

        // Load the content
        const markdownContent = await loadMarkdownContent(markdownFile.path);
        setContent(markdownContent);
      } catch (err) {
        console.error('Failed to load markdown content:', err);
        setError('Failed to load the document. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [projectName, fileName]);

  // Smooth scroll to top when content changes
  useEffect(() => {
    if (!loading && !error && content) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [content, loading, error]);

  // Generate breadcrumb items
  const breadcrumbItems = [
    { label: 'Documentation', href: '/' },
    ...(projectName ? [{ 
      label: projectName.replace(/-/g, ' '), 
      href: `/${projectName}` 
    }] : []),
    ...(fileName ? [{ 
      label: fileName.replace(/-/g, ' '), 
      isActive: true 
    }] : [])
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner 
          size="lg" 
          text="Loading document..." 
          className="py-16"
        />
      </div>
    );
  }

  if (error) {
    // Check if it's a "not found" error
    if (error.includes('not found') || error.includes('doesn\'t exist')) {
      return (
        <NotFoundPage
          type="file"
          projectName={projectName}
          fileName={fileName}
          message={error}
        />
      );
    }

    // For other errors, show a generic error page
    return (
      <NotFoundPage
        type="page"
        message={`Failed to load document: ${error}`}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Document Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
              {fileName?.replace(/-/g, ' ')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              From {projectName?.replace(/-/g, ' ')} project
            </p>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <LazyMarkdownRenderer 
          content={content} 
          fallback={
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Rendering content..." />
            </div>
          }
        />
      </div>

      {/* Navigation and Info Footer */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            
            {projectName && (
              <button
                onClick={() => navigate(`/${projectName}`)}
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
              >
                View all {projectName.replace(/-/g, ' ')} docs
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Last updated: {new Date().toLocaleDateString()}</span>
            <span>•</span>
            <span>{Math.ceil(content.length / 1000)} min read</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocPage;
