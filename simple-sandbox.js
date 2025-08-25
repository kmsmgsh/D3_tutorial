import * as d3 from 'd3';

// Simple D3 Sandbox - Working version
class D3Sandbox {
    constructor() {
        this.editor = document.getElementById('code-editor');
        this.preview = document.getElementById('preview');
        this.errorPanel = document.getElementById('error-panel');
        this.errorMessage = document.getElementById('error-message');
        this.statusText = document.getElementById('status-text');
        this.currentTemplate = document.getElementById('current-template');
        
        this.templates = this.initializeTemplates();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTemplate('empty');
        this.setStatus('Sandbox ready!');
    }

    initializeTemplates() {
        return {
            'empty': {
                name: 'Empty Canvas',
                code: `// Welcome to D3 Sandbox!

const svg = d3.select('#preview')
    .append('svg')
    .attr('width', 400)
    .attr('height', 300)
    .style('border', '1px solid #ddd');

svg.append('text')
    .attr('x', 200)
    .attr('y', 150)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .style('fill', '#667eea')
    .text('Start coding!');`
            },
            
            'basic-setup': {
                name: 'Basic D3 Setup',
                code: `// Basic D3 setup template
const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 400 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

const svg = d3.select('#preview')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

g.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#f8f9fa')
    .attr('stroke', '#dee2e6');

g.append('text')
    .attr('x', width / 2)
    .attr('y', height / 2)
    .attr('text-anchor', 'middle')
    .text('Ready for your D3 magic!');`
            },
            
            'bar-chart': {
                name: 'Bar Chart',
                code: `// Sample data
const data = [
    { name: 'A', value: 30 },
    { name: 'B', value: 80 },
    { name: 'C', value: 45 },
    { name: 'D', value: 60 },
    { name: 'E', value: 20 },
    { name: 'F', value: 90 }
];

const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 400 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

const svg = d3.select('#preview')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

const xScale = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, width])
    .padding(0.1);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height, 0]);

g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.name))
    .attr('width', xScale.bandwidth())
    .attr('y', d => yScale(d.value))
    .attr('height', d => height - yScale(d.value))
    .attr('fill', '#667eea');

g.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScale));

g.append('g')
    .call(d3.axisLeft(yScale));`
            },
            
            'bar-chart-axis': {
                name: 'Bar Chart with Axis',
                code: `// Enhanced bar chart with detailed axis formatting
const data = [
    { category: 'Apples', sales: 120, color: '#ff6b6b' },
    { category: 'Bananas', sales: 180, color: '#4ecdc4' },
    { category: 'Cherries', sales: 90, color: '#45b7d1' },
    { category: 'Dates', sales: 150, color: '#f9ca24' },
    { category: 'Elderberry', sales: 200, color: '#6c5ce7' }
];

const margin = { top: 40, right: 40, bottom: 60, left: 80 };
const width = 500 - margin.left - margin.right;
const height = 350 - margin.top - margin.bottom;

const svg = d3.select('#preview')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Create scales
const xScale = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([0, width])
    .padding(0.2);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.sales) * 1.1]) // Add 10% padding
    .range([height, 0]);

// Create bars
g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.category))
    .attr('width', xScale.bandwidth())
    .attr('y', d => yScale(d.sales))
    .attr('height', d => height - yScale(d.sales))
    .attr('fill', d => d.color)
    .attr('stroke', '#fff')
    .attr('stroke-width', 1);

// Add value labels on bars
g.selectAll('.label')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => xScale(d.category) + xScale.bandwidth() / 2)
    .attr('y', d => yScale(d.sales) - 5)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .style('fill', '#333')
    .text(d => d.sales);

// Enhanced X-axis
g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .style('font-size', '12px')
    .style('fill', '#666');

// Enhanced Y-axis with grid lines
const yAxis = g.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale)
        .tickSize(-width) // Create grid lines
        .tickFormat(d => d + ' units')
    );

// Style the grid lines
yAxis.selectAll('.tick line')
    .style('stroke', '#e0e0e0')
    .style('stroke-dasharray', '2,2');

// Style axis text
yAxis.selectAll('text')
    .style('font-size', '12px')
    .style('fill', '#666');

// Add axis labels
g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left + 20)
    .attr('x', 0 - (height / 2))
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .style('fill', '#333')
    .text('Sales (units)');

g.append('text')
    .attr('transform', 'translate(' + (width / 2) + ',' + (height + margin.bottom - 10) + ')')
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .style('fill', '#333')
    .text('Product Categories');

// Add chart title
g.append('text')
    .attr('x', width / 2)
    .attr('y', 0 - margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .style('fill', '#333')
    .text('Product Sales by Category');`
            },
            
            'dual-axis': {
                name: 'Bar + Line Dual Axis',
                code: `// Dual axis chart: bars (revenue) + line (growth rate)
const data = [
    { month: 'Jan', revenue: 4500, growth: 5.2 },
    { month: 'Feb', revenue: 5200, growth: 8.1 },
    { month: 'Mar', revenue: 4800, growth: 3.8 },
    { month: 'Apr', revenue: 6100, growth: 12.3 },
    { month: 'May', revenue: 7200, growth: 18.0 },
    { month: 'Jun', revenue: 6800, growth: 15.6 },
    { month: 'Jul', revenue: 8100, growth: 22.4 },
    { month: 'Aug', revenue: 7500, growth: 19.2 }
];

const margin = { top: 40, right: 100, bottom: 60, left: 80 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3.select('#preview')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Define arrow markers for axes
const defs = svg.append('defs');

defs.append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 8)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#333');

// Scales
const xScale = d3.scaleBand()
    .domain(data.map(d => d.month))
    .range([0, width])
    .padding(0.2);

// Left Y-axis scale (for bars - revenue)
const yScaleLeft = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.revenue) * 1.1])
    .range([height, 0]);

// Right Y-axis scale (for line - growth rate)
const yScaleRight = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.growth) * 1.1])
    .range([height, 0]);

// Create bars (revenue)
g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.month))
    .attr('width', xScale.bandwidth())
    .attr('y', d => yScaleLeft(d.revenue))
    .attr('height', d => height - yScaleLeft(d.revenue))
    .attr('fill', '#4a90e2')
    .attr('opacity', 0.7);

// Create line generator
const line = d3.line()
    .x(d => xScale(d.month) + xScale.bandwidth() / 2)
    .y(d => yScaleRight(d.growth))
    .curve(d3.curveMonotoneX);

// Add the line (growth rate)
g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#e74c3c')
    .attr('stroke-width', 3)
    .attr('d', line);

// Add line points
g.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => xScale(d.month) + xScale.bandwidth() / 2)
    .attr('cy', d => yScaleRight(d.growth))
    .attr('r', 5)
    .attr('fill', '#e74c3c');

// Add value labels on bars
g.selectAll('.bar-label')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'bar-label')
    .attr('x', d => xScale(d.month) + xScale.bandwidth() / 2)
    .attr('y', d => yScaleLeft(d.revenue) - 5)
    .attr('text-anchor', 'middle')
    .style('font-size', '11px')
    .style('fill', '#4a90e2')
    .style('font-weight', 'bold')
    .text(d => '$' + (d.revenue / 1000).toFixed(1) + 'K');

// Add value labels on line points
g.selectAll('.line-label')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'line-label')
    .attr('x', d => xScale(d.month) + xScale.bandwidth() / 2)
    .attr('y', d => yScaleRight(d.growth) - 10)
    .attr('text-anchor', 'middle')
    .style('font-size', '11px')
    .style('fill', '#e74c3c')
    .style('font-weight', 'bold')
    .text(d => d.growth.toFixed(1) + '%');

// X-axis
g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .style('font-size', '12px')
    .style('fill', '#666');

// Left Y-axis (revenue)
g.append('g')
    .attr('class', 'y-axis-left')
    .call(d3.axisLeft(yScaleLeft)
        .tickFormat(d => '$' + (d / 1000) + 'K')
    )
    .selectAll('text')
    .style('font-size', '12px')
    .style('fill', '#4a90e2');

// Right Y-axis (growth rate)
g.append('g')
    .attr('class', 'y-axis-right')
    .attr('transform', 'translate(' + width + ',0)')
    .call(d3.axisRight(yScaleRight)
        .tickFormat(d => d + '%')
    )
    .selectAll('text')
    .style('font-size', '12px')
    .style('fill', '#e74c3c');

// Add arrow lines for axes
// X-axis arrow line
g.append('line')
    .attr('x1', -5)
    .attr('x2', width + 15)
    .attr('y1', height)
    .attr('y2', height)
    .attr('stroke', '#333')
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#arrowhead)');

// Left Y-axis arrow line
g.append('line')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', height + 5)
    .attr('y2', -15)
    .attr('stroke', '#333')
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#arrowhead)');

// Right Y-axis arrow line
g.append('line')
    .attr('x1', width)
    .attr('x2', width)
    .attr('y1', height + 5)
    .attr('y2', -15)
    .attr('stroke', '#333')
    .attr('stroke-width', 2)
    .attr('marker-end', 'url(#arrowhead)');

// Axis labels
g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left + 20)
    .attr('x', 0 - (height / 2))
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .style('fill', '#4a90e2')
    .text('Revenue ($)');

// Right Y-axis label (positioned close to the right axis)
g.append('text')
    .attr('transform', 'rotate(90)')
    .attr('y', 0 - width - 40) // Proper spacing from the right axis
    .attr('x', height / 2)
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .style('fill', '#e74c3c')
    .text('Growth Rate (%)');

g.append('text')
    .attr('transform', 'translate(' + (width / 2) + ',' + (height + margin.bottom - 10) + ')')
    .style('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .style('fill', '#333')
    .text('Month');

// Chart title
g.append('text')
    .attr('x', width / 2)
    .attr('y', 0 - margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('font-weight', 'bold')
    .style('fill', '#333')
    .text('Revenue vs Growth Rate');

// Simple legend at the bottom
const legendY = height + 50;
const legend = g.append('g')
    .attr('transform', 'translate(' + (width / 2 - 80) + ',' + legendY + ')');

// Revenue legend item
legend.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 15)
    .attr('height', 12)
    .attr('fill', '#4a90e2')
    .attr('opacity', 0.7);

legend.append('text')
    .attr('x', 20)
    .attr('y', 10)
    .style('font-size', '12px')
    .style('fill', '#333')
    .text('Revenue');

// Growth rate legend item
legend.append('line')
    .attr('x1', 80)
    .attr('x2', 95)
    .attr('y1', 6)
    .attr('y2', 6)
    .attr('stroke', '#e74c3c')
    .attr('stroke-width', 3);

legend.append('circle')
    .attr('cx', 87.5)
    .attr('cy', 6)
    .attr('r', 3)
    .attr('fill', '#e74c3c');

legend.append('text')
    .attr('x', 100)
    .attr('y', 10)
    .style('font-size', '12px')
    .style('fill', '#333')
    .text('Growth Rate');`
            }
        };
    }

    setupEventListeners() {
        // Template selection
        document.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectTemplate(e.target);
            });
        });

        // Code editor
        this.editor.addEventListener('input', () => {
            this.debouncePreview();
        });

        // Buttons
        document.getElementById('run-btn').addEventListener('click', () => {
            this.runCode();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetToTemplate();
        });

        document.getElementById('clear-preview').addEventListener('click', () => {
            this.clearPreview();
        });

        // Auto-run on load
        this.debouncePreview();
    }

    selectTemplate(templateElement) {
        document.querySelectorAll('.template-item').forEach(item => {
            item.classList.remove('active');
        });
        templateElement.classList.add('active');
        
        const templateId = templateElement.dataset.template;
        this.loadTemplate(templateId);
    }

    loadTemplate(templateId) {
        const template = this.templates[templateId];
        if (template) {
            this.editor.value = template.code;
            this.currentTemplate.textContent = template.name;
            this.debouncePreview();
            this.setStatus('Loaded: ' + template.name);
        }
    }

    debouncePreview() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.runCode();
        }, 500);
    }

    runCode() {
        try {
            this.clearPreview();
            this.hideError();
            
            const code = this.editor.value;
            const func = new Function('d3', code);
            func(d3);
            
            this.setStatus('Code executed successfully!');
            
        } catch (error) {
            this.showError(error.message);
            this.setStatus('Error in code');
        }
    }

    clearPreview() {
        this.preview.innerHTML = '';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorPanel.classList.add('show');
    }

    hideError() {
        this.errorPanel.classList.remove('show');
    }

    setStatus(message) {
        this.statusText.textContent = message;
        setTimeout(() => {
            this.statusText.textContent = 'Ready';
        }, 3000);
    }

    resetToTemplate() {
        const activeTemplate = document.querySelector('.template-item.active');
        if (activeTemplate) {
            const templateId = activeTemplate.dataset.template;
            this.loadTemplate(templateId);
        }
    }
}

// Initialize sandbox when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new D3Sandbox();
});