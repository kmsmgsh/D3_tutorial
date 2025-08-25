# D3.js Learning Journey & Chart Builder

A comprehensive D3.js learning environment with an integrated drag-and-drop chart builder, similar to JMP Chart Builder or Plotly Chart Studio.

## 🚀 Live Demo

Visit the live application: **[Your GitHub Pages URL will be here]**

## ✨ Features

### 📚 Learning Environment
- **Interactive Monaco Editor** with D3-specific IntelliSense
- **Comprehensive tutorials** with VitePress documentation
- **Code templates** from basic to advanced D3 visualizations
- **Hot-reload development** environment

### 🏗️ Chart Builder (NEW)
- **Drag-and-drop interface** for visual chart creation
- **Multi-format data support**: CSV, JSON, TSV file upload
- **Real-time Vega-Lite rendering** with professional themes
- **Interactive column mapping** to chart encodings (X/Y, color, size)
- **Chart specification export** for dashboard integration
- **Sample datasets** included for testing

### 📊 Supported Chart Types
- Bar Charts
- Scatter Plots
- Line Charts
- Area Charts
- Histograms
- Box Plots

## 🛠️ Technology Stack

- **Frontend**: Vanilla JS with ES6 modules
- **Build Tool**: Vite
- **Visualization**: D3.js, Vega-Lite
- **Editor**: Monaco Editor (VS Code engine)
- **Documentation**: VitePress, JSDoc
- **Deployment**: GitHub Pages

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/D3_tutorial.git
cd D3_tutorial
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:4173`

## 📁 Project Structure

```
D3_tutorial/
├── index.html              # Main navigation dashboard
├── chart-builder.html      # Chart builder interface
├── monaco-sandbox.html     # Advanced code editor
├── sandbox.html            # Basic playground
├── modules/                # Chart builder modules
│   ├── data-manager.js     # Data parsing and management
│   ├── drag-drop.js        # Drag-and-drop interactions
│   ├── chart-renderer.js   # Vega-Lite chart rendering
│   ├── spec-builder.js     # Chart specification generation
│   └── ui-components.js    # Reusable UI components
├── sample-data/            # Sample datasets
├── tutorial/               # VitePress documentation
├── docs/                   # JSDoc API documentation
└── style.css              # Main styling
```

## 🎯 Chart Builder Usage

### 1. Upload Data
- Drag and drop CSV, JSON, or TSV files
- Or use provided sample datasets (Sales, Iris, Stocks)

### 2. Configure Chart
- Select chart type from available options
- Drag columns to encoding zones (X-axis, Y-axis, Color, Size)
- Adjust chart dimensions and title

### 3. Export Results
- **JSON Specification**: Full chart configuration for dashboards
- **Vega-Lite Spec**: Raw visualization specification
- **Image Export**: PNG/SVG chart downloads (coming soon)

## 🏗️ Architecture

### Hybrid Design
- **Chart Builder**: Vanilla JS for maximum compatibility
- **Output Format**: Framework-agnostic JSON specifications
- **Future Integration**: Ready for Vue.js dashboard builder

### Modular Structure
```javascript
// Main application
import { DataManager } from './modules/data-manager.js';
import { DragDropManager } from './modules/drag-drop.js';
import { ChartRenderer } from './modules/chart-renderer.js';
import { SpecBuilder } from './modules/spec-builder.js';
```

## 📊 Chart Specification Format

The chart builder outputs standardized JSON specifications:

```json
{
  "id": "chart_123",
  "version": "1.0",
  "metadata": {
    "created": "2025-08-24T10:30:00Z",
    "title": "Sales by Region"
  },
  "chart": {
    "type": "bar",
    "encoding": {
      "x": {"field": "region", "type": "nominal"},
      "y": {"field": "sales", "type": "quantitative"}
    }
  },
  "vegaLiteSpec": { /* Full Vega-Lite specification */ }
}
```

## 🚀 Deployment

### Automatic Deployment (Recommended)
Push to the main branch triggers automatic deployment via GitHub Actions.

### Manual Deployment
```bash
npm run build
npm run deploy
```

## 📚 Documentation

- **API Documentation**: Run `npm run docs:api` 
- **Tutorial Guides**: Run `npm run docs:tutorial`
- **Build All Docs**: Run `npm run docs:all`

## 🛣️ Roadmap

- [ ] **Vue Dashboard Builder** - Multi-chart dashboard creator
- [ ] **Database Connectivity** - Connect to live data sources
- [ ] **Advanced Interactions** - Brushing, linking, filtering
- [ ] **Chart Templates** - Pre-built visualization patterns
- [ ] **Collaboration Features** - Share and embed charts
- [ ] **TypeScript Migration** - Better type safety

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **D3.js** - Data visualization framework
- **Vega-Lite** - Grammar of interactive graphics
- **Monaco Editor** - VS Code editor engine
- **VitePress** - Documentation framework

---

**Built with ❤️ for the D3.js community**