# Documentation Routing System

This project implements a dynamic routing system using React Router that scans a `/docs` folder for project directories and their markdown files.

## Features

✅ **Dynamic File Discovery**: Uses Vite's `import.meta.glob()` to automatically discover all markdown files in `/docs/**/*.md`
✅ **Project-based Organization**: Groups files by project directories
✅ **Clean URL Structure**: Routes follow the pattern `/project-name/file-name`
✅ **Manifest System**: Creates a comprehensive map of all projects and their files
✅ **Beautiful UI**: Modern, responsive design with Tailwind CSS
✅ **Markdown Rendering**: Full markdown support with syntax highlighting
✅ **Error Handling**: Graceful handling of missing files and projects

## Route Structure

- `/` - Home page showing all projects
- `/:projectName` - Project overview showing all files in a project
- `/:projectName/:fileName` - Individual markdown file viewer

## How It Works

### 1. File Discovery (`src/utils/docsManifest.ts`)

The system uses Vite's `import.meta.glob()` to scan for markdown files:

```typescript
const markdownModules = import.meta.glob('/docs/**/*.md', { 
  as: 'raw',
  eager: false 
});
```

### 2. Manifest Creation

The `createDocsManifest()` function processes all discovered files and creates:
- A projects map organized by directory name
- A flat array of all files for easy searching
- Parsed project and file names from file paths

### 3. Dynamic Content Loading

Files are loaded on-demand using dynamic imports:

```typescript
export async function loadMarkdownContent(filePath: string): Promise<string> {
  const moduleLoader = markdownModules[filePath];
  const content = await moduleLoader();
  return content as string;
}
```

### 4. React Router Integration

The routing system uses dynamic routes:

```tsx
<Routes>
  <Route path="/" element={<DocsHome />} />
  <Route path="/:projectName" element={<ProjectView />} />
  <Route path="/:projectName/:fileName" element={<MarkdownView />} />
</Routes>
```

## File Structure

```
docs/
├── react-guide/
│   ├── introduction.md
│   ├── components.md
│   └── hooks.md
├── typescript-basics/
│   ├── introduction.md
│   └── interfaces.md
└── vite-setup/
    ├── getting-started.md
    └── configuration.md
```

## Components

### DocsHome
- Displays all projects with file counts
- Provides navigation to individual projects
- Shows preview of first 3 files per project

### ProjectView
- Shows all files within a specific project
- Provides navigation back to home
- Handles project not found errors

### MarkdownView
- Renders markdown content with syntax highlighting
- Supports GitHub Flavored Markdown (GFM)
- Includes breadcrumb navigation
- Handles file loading states and errors

## Technologies Used

- **React Router DOM**: Client-side routing
- **react-markdown**: Markdown rendering
- **remark-gfm**: GitHub Flavored Markdown support
- **rehype-highlight**: Syntax highlighting for code blocks
- **highlight.js**: Code syntax highlighting themes
- **Lucide React**: Beautiful icons
- **Tailwind CSS**: Styling and responsive design

## Adding New Documentation

1. Create a new directory in `/docs/` for your project
2. Add markdown files to the directory
3. The system will automatically discover and route to your files
4. Access via `http://localhost:5173/your-project-name/your-file-name`

## Example URLs

- `http://localhost:5173/` - Home page
- `http://localhost:5173/react-guide` - React Guide project
- `http://localhost:5173/react-guide/components` - React Components guide
- `http://localhost:5173/typescript-basics/interfaces` - TypeScript Interfaces guide

The system is fully dynamic - no manual route configuration needed when adding new projects or files!
