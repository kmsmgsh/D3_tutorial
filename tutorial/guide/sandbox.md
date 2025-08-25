# D3 Playground - Interactive Sandbox

The D3 Playground is your **interactive coding environment** for experimenting, testing, and learning D3.js concepts hands-on.

## 🎮 Accessing the Playground

Visit the playground at: **[Playground](../sandbox.html)** or click the 🎮 Playground link in the main navigation.

## Features Overview

### 📝 Code Editor
- **Live editing** with syntax highlighting
- **Tab indentation** for clean code formatting
- **Line/column tracking** for navigation
- **Keyboard shortcuts** for efficiency

### 📊 Live Preview
- **Real-time updates** as you type
- **Error handling** with clear messages
- **Resizable panels** for comfortable coding
- **Clear preview** button to reset

### 📚 Template Library
Ready-to-use templates organized by category:

**🚀 Quick Start**
- Empty Canvas - Start from scratch
- Basic D3 Setup - Pre-configured SVG container

**📊 Basic Charts**
- Bar Chart - Column visualization
- Line Chart - Time series data
- Scatter Plot - Two-dimensional relationships
- Pie Chart - Part-to-whole comparisons

**🎯 Interactive**
- Hover Effects - Mouse interactions
- Animations - Smooth transitions
- Brush & Zoom - User navigation

**🔧 Utilities**
- Scales Demo - Different scale types
- Data Binding - Core D3 concept
- SVG Basics - Foundation elements

## How to Use the Playground

### 1. Choose a Template
- Click any template from the sidebar
- Code loads automatically in the editor
- Preview updates immediately

### 2. Edit and Experiment
- Modify the code in the left panel
- See changes live in the right panel
- Errors appear in the bottom panel

### 3. Save Your Work
- **💾 Save** button stores code locally
- **🔄 Reset** button returns to template
- **▶️ Run Code** button forces re-execution

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Add indentation |
| `Ctrl+Enter` | Run code |
| `Ctrl+S` | Save to localStorage |

## Example Workflow

### Learning Scales
1. Select **"Scales Demo"** template
2. See different D3 scale types in action
3. Modify the ranges and domains
4. Observe how the visualization changes

### Building Custom Charts
1. Start with **"Basic D3 Setup"** template
2. Add your own data
3. Create scales for your data
4. Build visualization elements
5. Save your work for later

### Experimenting with Interactions
1. Load **"Hover Effects"** template
2. Try different event handlers
3. Modify the visual feedback
4. Test various interaction patterns

## Code Templates Explained

### Bar Chart Template
```javascript
// Sample data structure
const data = [
    { name: 'A', value: 30 },
    { name: 'B', value: 80 },
    // ...
];

// Standard D3 pattern:
// 1. Set up dimensions and margins
// 2. Create SVG container
// 3. Define scales
// 4. Bind data and create elements
// 5. Add axes and labels
```

### Interactive Template
```javascript
// Adding hover effects
bars
    .on('mouseenter', function(event, d) {
        // Highlight on hover
        d3.select(this).attr('opacity', 0.8);
    })
    .on('mouseleave', function(event, d) {
        // Return to normal
        d3.select(this).attr('opacity', 1);
    });
```

## Tips for Effective Learning

### 1. Start Simple
- Begin with basic templates
- Understand each line of code
- Make small changes first

### 2. Experiment Freely
- Change colors, sizes, positions
- Try different data values
- Break things and fix them

### 3. Build Incrementally
- Add one feature at a time
- Test after each change
- Save working versions

### 4. Use the Console
- Open browser dev tools (F12)
- Check console for additional errors
- Use `console.log()` for debugging

## Common Patterns to Practice

### Data Binding
```javascript
// The fundamental D3 pattern
svg.selectAll('circle')
    .data(myData)
    .enter()
    .append('circle')
    .attr('r', d => d.value);
```

### Scales
```javascript
// Convert data to visual properties
const scale = d3.scaleLinear()
    .domain([0, 100])    // data range
    .range([0, 400]);    // pixel range
```

### Transitions
```javascript
// Smooth animations
selection
    .transition()
    .duration(1000)
    .attr('opacity', 1);
```

## Advanced Usage

### Custom Data
Replace template data with your own:
```javascript
// CSV data
d3.csv('mydata.csv').then(data => {
    // Process and visualize
});

// JSON data
const myData = [
    { category: 'Sales', value: 120 },
    { category: 'Marketing', value: 80 },
    // ...
];
```

### Multiple Visualizations
Create complex dashboards:
```javascript
// Create multiple SVG containers
const chart1 = d3.select('#preview')
    .append('div').attr('id', 'chart1');
    
const chart2 = d3.select('#preview')
    .append('div').attr('id', 'chart2');
```

The playground is your **safe space to experiment** with D3.js. Make mistakes, try wild ideas, and discover what's possible with data visualization!

## Next Steps

1. **Try each template** to understand different chart types
2. **Modify existing examples** to match your ideas  
3. **Combine techniques** from multiple templates
4. **Save your favorites** for future reference
5. **Share your creations** with the D3 community

Happy coding in the D3 Playground! 🚀