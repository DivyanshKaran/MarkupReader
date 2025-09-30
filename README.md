# Vite + React + TypeScript + Tailwind CSS Project

A modern React application built with Vite, TypeScript, Tailwind CSS, and additional libraries for enhanced functionality.

## 🚀 Features

- ⚡ **Vite** - Lightning fast build tool and dev server
- ⚛️ **React 18** - Latest React with hooks and modern features
- 📘 **TypeScript** - Type-safe JavaScript development
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧭 **React Router DOM** - Client-side routing
- 📝 **React Markdown** - Render Markdown in React components
- ✨ **GitHub Flavored Markdown** - Extended markdown support
- 🎯 **Syntax Highlighting** - Code highlighting with rehype-highlight
- 🔍 **Lucide React** - Beautiful & consistent SVG icons

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ExampleComponent.tsx
│   ├── MarkdownExample.tsx
│   └── index.ts
├── pages/              # Route components
│   ├── Home.tsx
│   ├── About.tsx
│   └── index.ts
├── utils/              # Utility functions
│   └── index.ts
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles with Tailwind
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 📦 Included Libraries

| Library | Description | Purpose |
|---------|-------------|---------|
| `react-router-dom` | Routing library | Client-side navigation |
| `react-markdown` | Markdown renderer | Render markdown content |
| `remark-gfm` | GitHub Flavored Markdown | Extended markdown features |
| `rehype-highlight` | Syntax highlighter | Code block highlighting |
| `lucide-react` | Icon library | Consistent SVG icons |

## 🎨 Styling

This project uses Tailwind CSS for styling. Key configurations:

- **Tailwind Config**: `tailwind.config.js`
- **PostCSS Config**: `postcss.config.js`
- **Global Styles**: `src/index.css` with Tailwind directives

### Custom Utility Function

The project includes a utility function for conditional class names:

```typescript
import { cn } from './utils';

// Usage
<div className={cn('base-class', condition && 'conditional-class')}>
```

## 📝 Components

### ExampleComponent
A flexible component demonstrating React + TypeScript + Tailwind patterns.

### MarkdownExample
Demonstrates React Markdown with:
- GitHub Flavored Markdown support
- Syntax highlighting
- Custom styled components
- Responsive design

## 🧭 Routing

The app uses React Router for navigation with two routes:
- `/` - Home page
- `/about` - About page

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

## 📚 Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)