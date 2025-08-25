# Project Setup

This guide shows how to set up a modern D3.js development environment using Vite and proper documentation tools.

## Prerequisites

- Node.js (version 14 or higher)
- Basic knowledge of HTML, CSS, and JavaScript
- A code editor (VS Code recommended)

## Project Structure

Our project uses a dual documentation approach:

```
D3_tutorial/
├── src/                    # Source code
│   ├── script.js          # Main D3 visualization code
│   ├── style.css          # Styles
│   └── index.html         # HTML page
├── docs/                  # JSDoc API documentation (generated)
├── tutorial/              # VitePress tutorial site
├── package.json           # Dependencies and scripts
└── vite.config.js         # Vite configuration
```

## Installation Steps

### 1. Initialize Project
```bash
npm init -y
```

### 2. Install Dependencies
```bash
# Main dependencies
npm install d3

# Development tools
npm install --save-dev vite jsdoc vitepress
```

### 3. Configure Package Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "docs": "jsdoc script.js -d docs/",
    "tutorial:dev": "vitepress dev tutorial",
    "tutorial:build": "vitepress build tutorial"
  }
}
```

## Development Workflow

### Start Development Server
```bash
npm run dev
```
Opens your visualization at `http://localhost:3000`

### Generate API Documentation
```bash
npm run docs
```
Creates technical documentation from your code comments

### Start Tutorial Site
```bash
npm run tutorial:dev
```
Opens the tutorial website at `http://localhost:5173`

## Code Documentation Strategy

We use two complementary documentation approaches:

### JSDoc (for developers)
- Documents functions, parameters, return types
- Generates technical API reference
- Helps with IDE autocomplete and type checking

```javascript
/**
 * Creates a bar chart
 * @param {Array<Object>} data - Chart data
 * @param {string} selector - CSS selector
 * @returns {d3.Selection} SVG selection
 */
function createChart(data, selector) {
  // implementation
}
```

### VitePress (for learners)
- Step-by-step tutorials
- Visual examples and explanations
- Beginner-friendly guides

## Next Steps

Now that your environment is ready:

1. **[Create Your First Chart](/guide/first-chart)** - Build a simple bar chart
2. **[Learn About Scales](/guide/scales)** - Understand D3's coordinate mapping
3. **[Explore Examples](/examples/)** - See different visualization types

Your development environment is ready! 🚀