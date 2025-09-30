import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { docsManifest, loadMarkdownContent, findMarkdownFile } from '../utils/docsManifest';
import { ArrowLeft, FileText, AlertCircle, Loader } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

const MarkdownView: React.FC = () => {
  const { projectName, fileName } = useParams<{ projectName: string; fileName: string }>();
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin mr-3" />
            <span className="text-lg text-gray-600 dark:text-gray-300">Loading document...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documentation Hub
          </Link>
          
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 dark:text-red-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Document Not Found</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <div className="space-x-4">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
              >
                View All Projects
              </Link>
              {projectName && (
                <Link
                  to={`/${projectName}`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  Back to {projectName.replace(/-/g, ' ')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to={projectName ? `/${projectName}` : '/'}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {projectName ? projectName.replace(/-/g, ' ') : 'Documentation Hub'}
          </Link>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FileText className="h-4 w-4 mr-1" />
            <span className="capitalize">{projectName?.replace(/-/g, ' ')} / {fileName?.replace(/-/g, ' ')}</span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <MarkdownRenderer content={content} />
        </div>
      </div>
    </div>
  );
};

export default MarkdownView;
