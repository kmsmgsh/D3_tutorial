# D3 Learning Journey Project

## Project Overview
This is a comprehensive D3.js learning environment with multiple integrated components for studying data visualization. The project includes documentation systems, interactive playgrounds, and professional development tools.

## Project Structure
```
D3_tutorial/
├── index.html              # Main navigation dashboard
├── navigation.js           # Dashboard controller with mini chart previews
├── style.css               # Comprehensive styling for all components
├── sandbox.html            # Basic playground with textarea editor
├── simple-sandbox.js       # Basic sandbox functionality
├── monaco-sandbox.html     # Professional Monaco Editor interface
├── monaco-sandbox.js       # Advanced sandbox with VS Code editor
├── script.js               # Original bar chart with JSDoc documentation
├── package.json            # Dependencies and build scripts
├── tutorial/               # VitePress tutorial documentation
├── docs/                   # JSDoc API documentation
└── CLAUDE.md              # This file - project memory for Claude
```

## Key Features Implemented

### 1. Navigation Dashboard (index.html)
- **Interactive example cards** with completion status (completed/upcoming)
- **Mini chart previews** generated with D3
- **Progress tracking** showing learning statistics
- **Modal system** for detailed chart views
- **Professional gradient design** with responsive layout

### 2. Dual Documentation System
- **JSDoc**: Technical API documentation (`npm run docs:api`)
- **VitePress**: User-friendly tutorial guides (`npm run docs:tutorial`)
- **Build scripts**: Automated documentation generation

### 3. Sandbox Environments
#### Basic Sandbox (sandbox.html)
- Simple textarea editor with syntax highlighting
- Live preview with error handling
- Template system with D3 examples
- Auto-run functionality with debouncing

#### Monaco Editor Sandbox (monaco-sandbox.html) ⭐ **MAIN FEATURE**
- **Professional VS Code editor** with full Monaco integration
- **D3-specific IntelliSense** with autocomplete for D3 methods
- **Advanced templates** including dual-axis charts with mathematical arrows
- **File upload functionality** - users can upload .js files directly
- **Resizable panels** with professional toolbar
- **Error detection** and status bar with editor info
- **Code formatting** and save functionality

### 4. Chart Templates Available
1. **Empty Canvas** - Basic D3 setup
2. **Basic D3 Setup** - Margin convention template
3. **Bar Chart** - Simple bar chart with scales
4. **Bar Chart with Axis** - Enhanced with detailed formatting, grid lines, labels
5. **Bar + Line Dual Axis** - Complex chart with mathematical arrows, dual scales
6. **Upload JS File** - File upload functionality for custom code ⭐ **NEW**

### 5. Advanced Chart Features
- **Mathematical arrows** on axes (like academic papers)
- **Dual-axis support** with different scales (revenue vs growth rate)
- **Professional styling** with proper margins, labels, legends
- **Color coding** and value labels on data points
- **Grid lines** and enhanced axis formatting

## Technical Implementation

### Dependencies
```json
{
  "dependencies": {
    "d3": "^7.9.0",
    "monaco-editor": "^0.52.2"
  },
  "devDependencies": {
    "jsdoc": "^4.0.4",
    "vite": "^7.1.3",
    "vitepress": "^1.6.4"
  }
}
```

### Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run docs:api` - Generate JSDoc documentation
- `npm run docs:tutorial` - Start VitePress dev server
- `npm run docs:all` - Build all documentation

### Monaco Editor Integration
- **Worker configuration** for syntax highlighting
- **D3 autocompletion** with 20+ D3 methods and patterns
- **Global instance exposure** (`window.monacoSandbox`) for file upload
- **Professional themes** and editor settings
- **Real-time error detection** and status updates

### File Upload System ⭐ **LATEST ADDITION**
- Hidden file input accepting `.js` and `.txt` files
- FileReader API for loading file contents
- Dynamic toolbar button injection
- Integration with Monaco Editor setValue
- User feedback with status messages

## Problem-Solving History

### Resolved Issues
1. **JavaScript syntax errors**: Fixed template literal escaping in sandbox.js
2. **CSS layout overlaps**: Resolved "Back to Dashboard" link covering toolbar buttons
3. **Legend positioning**: Fixed legend covering chart elements in dual-axis template
4. **Growth Rate label**: Positioned close to right axis with proper spacing
5. **Monaco Editor workers**: Configured proper worker setup for syntax highlighting

### Design Decisions
- **Progressive complexity**: Basic sandbox → Monaco Editor for learning progression
- **Template system**: Organized by complexity (Quick Start → Basic Charts → Interactive)
- **Dual documentation**: JSDoc for developers, VitePress for learners
- **Professional styling**: VS Code-like interface for familiarity

## Current Status
✅ **Fully functional D3 learning environment**
✅ **Professional Monaco Editor with D3 IntelliSense** 
✅ **File upload functionality for custom JavaScript code**
✅ **Comprehensive template library**
✅ **Mathematical charts with arrows and dual axes**
✅ **Hot-reloading development environment**

### 6. Chart Builder ⭐ **NEW MAJOR FEATURE**
- **Drag-and-drop visual chart builder** similar to JMP Chart Builder/Plotly Chart Studio
- **Multi-format data support**: CSV, JSON, TSV file upload + sample datasets
- **Interactive column mapping**: Drag columns to X/Y axes, color, size encodings
- **Real-time Vega-Lite chart rendering** with professional theming
- **Chart specification export**: JSON format for dashboard integration
- **Modular vanilla JS architecture** for future Vue dashboard integration

#### Chart Builder Features
- **Data Management**: Automatic type inference (quantitative/nominal/ordinal/temporal)
- **Chart Types**: Bar, scatter, line, area, histogram, box plot support
- **Visual Encodings**: X/Y axes, color, size with validation
- **Export Options**: Full specification JSON, Vega-Lite spec, chart images
- **Sample Datasets**: Sales data, Iris dataset, stock prices for testing

#### Architecture Design
- **Hybrid Architecture**: Vanilla JS chart builder → Vue dashboard (future)
- **Modular Structure**: DataManager, DragDropManager, ChartRenderer, SpecBuilder
- **Output Format**: Standardized JSON for framework-agnostic integration
- **Professional UI**: Three-panel layout with drag-and-drop interactions

## Next Possible Enhancements
- **Vue Dashboard Builder**: Multi-chart dashboard with layout management
- Interactive charts with hover effects and animations
- More advanced D3 examples (force-directed graphs, geographic maps)  
- Database connectivity for live data sources
- Computed columns and data transformations
- Chart templates and sharing functionality

## Development Notes
- Use `npm run dev` to start the development server
- Monaco sandbox is the primary development interface
- All changes are hot-reloaded automatically
- File upload works with both .js and .txt files
- Templates are organized by learning progression

---
*Last updated: August 24, 2025*
*Project status: Production-ready learning environment*