# Bar Chart Example

This example demonstrates how to create a basic bar chart using D3.js. It covers the fundamental concepts you'll use in most D3 visualizations.

## Live Demo

<iframe src="../index.html" width="100%" height="500" frameborder="0"></iframe>

## Complete Code

```javascript
import * as d3 from 'd3';

// Sample data
const data = [
    { name: 'A', value: 30 },
    { name: 'B', value: 80 },
    { name: 'C', value: 45 },
    { name: 'D', value: 60 },
    { name: 'E', value: 20 },
    { name: 'F', value: 90 }
];

// Chart dimensions
const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 760 - margin.left - margin.right;
const height = 360 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create scales
const xScale = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, width])
    .padding(0.1);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height, 0]);

// Create bars
svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.name))
    .attr("width", xScale.bandwidth())
    .attr("y", d => yScale(d.value))
    .attr("height", d => height - yScale(d.value));

// Add axes
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

svg.append("g")
    .call(d3.axisLeft(yScale));
```

## Step-by-Step Breakdown

### 1. Data Structure
```javascript
const data = [
    { name: 'A', value: 30 },
    { name: 'B', value: 80 },
    // ...
];
```
Each object represents one bar with a category name and numeric value.

### 2. Chart Dimensions
```javascript
const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 760 - margin.left - margin.right;
const height = 360 - margin.top - margin.bottom;
```
Margins provide space for axes and labels around the actual chart area.

### 3. SVG Container
```javascript
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
```
Creates an SVG element and positions the chart within the margins.

### 4. Scales
**X Scale (categories)**:
```javascript
const xScale = d3.scaleBand()
    .domain(data.map(d => d.name))  // ['A', 'B', 'C', ...]
    .range([0, width])              // 0 to chart width
    .padding(0.1);                  // 10% padding between bars
```

**Y Scale (values)**:
```javascript
const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])  // 0 to max value
    .range([height, 0]);                      // bottom to top
```

### 5. Data Binding and Bar Creation
```javascript
svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.name))
    .attr("width", xScale.bandwidth())
    .attr("y", d => yScale(d.value))
    .attr("height", d => height - yScale(d.value));
```

This is D3's **data binding pattern**:
- `selectAll(".bar")` - Select all elements with class "bar"
- `data(data)` - Bind our data array to the selection
- `enter()` - Handle new data points that don't have elements yet
- `append("rect")` - Create rectangle elements for each data point
- `attr()` calls - Set position and size using our scales

### 6. Axes
```javascript
// X-axis
svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

// Y-axis  
svg.append("g")
    .call(d3.axisLeft(yScale));
```

## Key Concepts Demonstrated

1. **Data Binding**: Connecting data to visual elements
2. **Scales**: Converting data values to pixel coordinates
3. **SVG Elements**: Using rectangles to represent data
4. **Axes**: Adding reference lines and labels
5. **Method Chaining**: Linking D3 operations together

## Customization Ideas

Try modifying the chart:
- Change colors by adding `.style("fill", "steelblue")`
- Add hover effects with `.on("mouseover", ...)`
- Animate bars with `.transition().duration(1000)`
- Add data labels above each bar

This bar chart demonstrates the fundamental D3 pattern you'll use for most visualizations!