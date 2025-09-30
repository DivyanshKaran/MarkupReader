export interface MarkdownFile {
  path: string;
  projectName: string;
  fileName: string;
  fullPath: string;
}

export interface Project {
  name: string;
  files: MarkdownFile[];
}

export interface DocsManifest {
  projects: Record<string, Project>;
  allFiles: MarkdownFile[];
}

// Use Vite's import.meta.glob to dynamically import all markdown files
const markdownModules = import.meta.glob('/docs/**/*.md', { 
  query: '?raw',
  import: 'default',
  eager: false 
});

// Function to parse file path and extract project name and file name
function parseFilePath(filePath: string): { projectName: string; fileName: string } {
  // Remove '/docs/' prefix and '.md' suffix
  const cleanPath = filePath.replace('/docs/', '').replace('.md', '');
  const pathParts = cleanPath.split('/');
  
  if (pathParts.length < 2) {
    throw new Error(`Invalid file path structure: ${filePath}`);
  }
  
  const projectName = pathParts[0];
  const fileName = pathParts[pathParts.length - 1];
  
  return { projectName, fileName };
}

// Create the docs manifest
export function createDocsManifest(): DocsManifest {
  const projects: Record<string, Project> = {};
  const allFiles: MarkdownFile[] = [];
  
  // Process each markdown file
  Object.keys(markdownModules).forEach(filePath => {
    try {
      const { projectName, fileName } = parseFilePath(filePath);
      
      const markdownFile: MarkdownFile = {
        path: filePath,
        projectName,
        fileName,
        fullPath: `/${projectName}/${fileName}`
      };
      
      // Add to all files array
      allFiles.push(markdownFile);
      
      // Add to projects object
      if (!projects[projectName]) {
        projects[projectName] = {
          name: projectName,
          files: []
        };
      }
      
      projects[projectName].files.push(markdownFile);
    } catch (error) {
      console.warn(`Skipping invalid file path: ${filePath}`, error);
    }
  });
  
  // Sort files within each project
  Object.values(projects).forEach(project => {
    project.files.sort((a, b) => a.fileName.localeCompare(b.fileName));
  });
  
  return {
    projects,
    allFiles: allFiles.sort((a, b) => 
      a.projectName.localeCompare(b.projectName) || a.fileName.localeCompare(b.fileName)
    )
  };
}

// Function to load markdown content
export async function loadMarkdownContent(filePath: string): Promise<string> {
  const moduleLoader = markdownModules[filePath];
  if (!moduleLoader) {
    throw new Error(`Markdown file not found: ${filePath}`);
  }
  
  try {
    const content = await moduleLoader();
    return content as string;
  } catch (error) {
    console.error(`Failed to load markdown file: ${filePath}`, error);
    throw error;
  }
}

// Function to find a specific file
export function findMarkdownFile(projectName: string, fileName: string, manifest: DocsManifest): MarkdownFile | null {
  const project = manifest.projects[projectName];
  if (!project) {
    return null;
  }
  
  return project.files.find(file => file.fileName === fileName) || null;
}

// Export the manifest instance
export const docsManifest = createDocsManifest();
