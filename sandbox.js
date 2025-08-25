import * as d3 from 'd3';

/**
 * D3 Sandbox - Interactive playground for testing and learning D3.js
 * Features live code editing, templates, and real-time preview
 */
class D3Sandbox {
    constructor() {
        this.editor = document.getElementById('code-editor');
        this.preview = document.getElementById('preview');
        this.errorPanel = document.getElementById('error-panel');
        this.errorMessage = document.getElementById('error-message');
        this.statusText = document.getElementById('status-text');
        this.currentTemplate = document.getElementById('current-template');
        
        this.templates = this.initializeTemplates();
        this.currentCode = '';
        this.debounceTimer = null;
        
        this.init();
    }

    /**
     * Initialize the sandbox
     */
    init() {
        this.setupEventListeners();
        this.setupResizer();
        this.loadTemplate('empty');
        this.updateLineColumn();
        this.setStatus('Sandbox ready! Start coding...');
    }

    /**
     * Initialize code templates for different D3 concepts
     */
    initializeTemplates() {
        return {
            'empty': {
                name: 'Empty Canvas',
                code: `// Welcome to D3 Sandbox! 🎮
// Write your D3 code here and see it live

import * as d3 from 'd3';

// Create your visualization here
const svg = d3.select('#preview')
    .append('svg')
    .attr('width', 400)
    .attr('height', 300)
    .style('border', '1px solid #ddd');

// Add some example elements
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
                code: `import * as d3 from 'd3';

// Basic D3 setup template
const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 400 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select('#preview')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

// Create main group
const g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Add background
g.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#f8f9fa')
    .attr('stroke', '#dee2e6');

// Ready to build your visualization!
g.append('text')
    .attr('x', width / 2)
    .attr('y', height / 2)
    .attr('text-anchor', 'middle')
    .text('Ready for your D3 magic ✨');`
            },
            
            'bar-chart': {
                name: 'Bar Chart',
                code: `import * as d3 from 'd3';

// Sample data
const data = [
    { name: 'A', value: 30 },
    { name: 'B', value: 80 },
    { name: 'C', value: 45 },
    { name: 'D', value: 60 },
    { name: 'E', value: 20 },
    { name: 'F', value: 90 }
];

// Set dimensions
const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 400 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select('#preview')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Create scales
const xScale = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, width])
    .padding(0.1);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height, 0]);

// Create bars
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

// Add axes
g.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(d3.axisBottom(xScale));

g.append('g')
    .call(d3.axisLeft(yScale));`
            },

            'line-chart': {
                name: 'Line Chart',
                code: `import * as d3 from 'd3';

// Generate time series data
const data = d3.range(20).map(i => ({
    date: new Date(2024, 0, i + 1),
    value: Math.random() * 100 + Math.sin(i * 0.5) * 30
}));

const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 400 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

const svg = d3.select('#preview')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const g = svg.append('g')
    .attr('transform', \`translate(\${margin.left},\${margin.top})\`);

// Create scales
const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.date))
    .range([0, width]);

const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.value))
    .range([height, 0]);

// Create line generator
const line = d3.line()
    .x(d => xScale(d.date))
    .y(d => yScale(d.value))
    .curve(d3.curveMonotoneX);

// Add the line
g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#667eea')
    .attr('stroke-width', 2)
    .attr('d', line);

// Add dots
g.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => xScale(d.date))
    .attr('cy', d => yScale(d.value))
    .attr('r', 4)
    .attr('fill', '#667eea');

// Add axes
g.append('g')
    .attr('transform', \`translate(0,\${height})\`)
    .call(d3.axisBottom(xScale));

g.append('g')
    .call(d3.axisLeft(yScale));`
            },

            'scatter-plot': {
                name: 'Scatter Plot',
                code: `import * as d3 from 'd3';

// Generate scatter plot data
const data = d3.range(50).map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 10 + 3
}));

const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 400 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

const svg = d3.select('#preview')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const g = svg.append('g')
    .attr('transform', \`translate(\${margin.left},\${margin.top})\`);

// Create scales
const xScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, width]);

const yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);

const sizeScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.size))
    .range([3, 12]);

// Create scatter points
g.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', d => sizeScale(d.size))
    .attr('fill', '#667eea')
    .attr('opacity', 0.7);

// Add axes
g.append('g')
    .attr('transform', \`translate(0,\${height})\`)
    .call(d3.axisBottom(xScale));

g.append('g')
    .call(d3.axisLeft(yScale));`
            },

            'hover-effects': {
                name: 'Hover Effects',
                code: `import * as d3 from 'd3';

const data = [
    { name: 'A', value: 30, color: '#ff6b6b' },
    { name: 'B', value: 80, color: '#4ecdc4' },
    { name: 'C', value: 45, color: '#45b7d1' },
    { name: 'D', value: 60, color: '#f9ca24' },
    { name: 'E', value: 20, color: '#6c5ce7' }
];

const margin = { top: 20, right: 30, bottom: 40, left: 40 };
const width = 400 - margin.left - margin.right;
const height = 300 - margin.top - margin.bottom;

const svg = d3.select('#preview')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const g = svg.append('g')
    .attr('transform', \`translate(\${margin.left},\${margin.top})\`);

const xScale = d3.scaleBand()
    .domain(data.map(d => d.name))
    .range([0, width])
    .padding(0.1);

const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height, 0]);

// Create interactive bars
const bars = g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.name))
    .attr('width', xScale.bandwidth())
    .attr('y', d => yScale(d.value))
    .attr('height', d => height - yScale(d.value))
    .attr('fill', d => d.color)
    .style('cursor', 'pointer');

// Add hover effects
bars
    .on('mouseenter', function(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.8)
            .attr('transform', 'scale(1.05)');
    })
    .on('mouseleave', function(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1)
            .attr('transform', 'scale(1)');
    });

// Add axes
g.append('g')
    .attr('transform', \`translate(0,\${height})\`)
    .call(d3.axisBottom(xScale));

g.append('g')
    .call(d3.axisLeft(yScale));`
            },

            'scales-demo': {
                name: 'Scales Demo',
                code: `import * as d3 from 'd3';

// Different scale types demonstration
const svg = d3.select('#preview')
    .append('svg')
    .attr('width', 400)
    .attr('height', 300);

// Linear scale demo
const linearScale = d3.scaleLinear()
    .domain([0, 10])
    .range([50, 350]);

svg.append('text')
    .attr('x', 20)
    .attr('y', 30)
    .text('Linear Scale:')
    .style('font-weight', 'bold');

for (let i = 0; i <= 10; i++) {
    svg.append('circle')
        .attr('cx', linearScale(i))
        .attr('cy', 50)
        .attr('r', 4)
        .attr('fill', '#667eea');
        
    svg.append('text')
        .attr('x', linearScale(i))
        .attr('y', 70)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .text(i);
}

// Ordinal scale demo
const ordinalScale = d3.scaleBand()
    .domain(['A', 'B', 'C', 'D', 'E'])
    .range([50, 350])
    .padding(0.1);

svg.append('text')
    .attr('x', 20)
    .attr('y', 110)
    .text('Band Scale:')
    .style('font-weight', 'bold');

['A', 'B', 'C', 'D', 'E'].forEach(letter => {
    svg.append('rect')
        .attr('x', ordinalScale(letter))
        .attr('y', 120)
        .attr('width', ordinalScale.bandwidth())
        .attr('height', 30)
        .attr('fill', '#4ecdc4');
        
    svg.append('text')
        .attr('x', ordinalScale(letter) + ordinalScale.bandwidth() / 2)
        .attr('y', 140)
        .attr('text-anchor', 'middle')
        .style('fill', 'white')
        .text(letter);
});

// Color scale demo
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

svg.append('text')
    .attr('x', 20)
    .attr('y', 190)
    .text('Color Scale:')
    .style('font-weight', 'bold');

[0, 1, 2, 3, 4, 5].forEach((d, i) => {
    svg.append('rect')
        .attr('x', 50 + i * 50)
        .attr('y', 200)
        .attr('width', 40)
        .attr('height', 40)
        .attr('fill', colorScale(d));
});`
            }
        };
    }

    /**
     * Set up event listeners for the sandbox
     */
    setupEventListeners() {
        // Template selection
        document.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectTemplate(e.target);
            });
        });

        // Code editor events
        this.editor.addEventListener('input', () => {
            this.debouncePreview();
            this.updateLineColumn();
        });

        this.editor.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        this.editor.addEventListener('scroll', () => {
            this.updateLineColumn();
        });

        // Toolbar buttons
        document.getElementById('run-btn').addEventListener('click', () => {
            this.runCode();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetToTemplate();
        });

        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveCode();
        });

        document.getElementById('clear-preview').addEventListener('click', () => {
            this.clearPreview();
        });

        // Auto-run on initial load
        this.debouncePreview();
    }

    /**
     * Set up the resizer for split panels
     */
    setupResizer() {
        const resizer = document.getElementById('resizer');
        const leftPanel = document.querySelector('.code-panel');
        const rightPanel = document.querySelector('.preview-panel');
        
        let isResizing = false;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        });

        function resize(e) {
            if (!isResizing) return;
            
            const containerRect = document.querySelector('.split-view').getBoundingClientRect();
            const leftWidth = e.clientX - containerRect.left;
            const totalWidth = containerRect.width;
            const rightWidth = totalWidth - leftWidth - 4; // 4px for resizer
            
            if (leftWidth > 200 && rightWidth > 200) {
                leftPanel.style.flex = \`0 0 \${leftWidth}px\`;
                rightPanel.style.flex = \`0 0 \${rightWidth}px\`;
            }
        }

        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        }
    }

    /**
     * Handle keyboard shortcuts and tab indentation
     */
    handleKeydown(e) {
        // Tab key for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.editor.selectionStart;
            const end = this.editor.selectionEnd;
            
            this.editor.value = this.editor.value.substring(0, start) + 
                               '  ' + 
                               this.editor.value.substring(end);
            this.editor.selectionStart = this.editor.selectionEnd = start + 2;
        }
        
        // Ctrl+Enter to run code
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            this.runCode();
        }
        
        // Ctrl+S to save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.saveCode();
        }
    }

    /**
     * Select and load a template
     */
    selectTemplate(templateElement) {
        // Update active state
        document.querySelectorAll('.template-item').forEach(item => {
            item.classList.remove('active');
        });
        templateElement.classList.add('active');
        
        // Load template
        const templateId = templateElement.dataset.template;
        this.loadTemplate(templateId);
    }

    /**
     * Load a code template
     */
    loadTemplate(templateId) {
        const template = this.templates[templateId];
        if (template) {
            this.editor.value = template.code;
            this.currentTemplate.textContent = template.name;
            this.currentCode = template.code;
            this.debouncePreview();
            this.setStatus('Loaded template: ' + template.name);
        }
    }

    /**
     * Debounced preview update
     */
    debouncePreview() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.runCode();
        }, 500);
    }

    /**
     * Execute the code in the editor
     */
    runCode() {
        try {
            this.clearPreview();
            this.hideError();
            
            let code = this.editor.value;
            
            // Remove the import statement and use the global d3
            code = code.replace(/import \* as d3 from 'd3';\s*\n?/g, '');
            
            // Create a new function to execute the code with d3 in scope
            const func = new Function('d3', code);
            func(d3);
            
            this.setStatus('Code executed successfully ✅');
            
        } catch (error) {
            this.showError(error.message);
            this.setStatus('Error in code ❌');
            console.error('Sandbox execution error:', error);
        }
    }

    /**
     * Clear the preview area
     */
    clearPreview() {
        this.preview.innerHTML = '';
    }

    /**
     * Show error message
     */
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorPanel.classList.add('show');
    }

    /**
     * Hide error panel
     */
    hideError() {
        this.errorPanel.classList.remove('show');
    }

    /**
     * Update line and column display
     */
    updateLineColumn() {
        const textarea = this.editor;
        const text = textarea.value;
        const cursorPos = textarea.selectionStart;
        
        const lines = text.substring(0, cursorPos).split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        
        document.getElementById('line-col').textContent = 'Line ' + line + ', Col ' + col;
    }

    /**
     * Set status message
     */
    setStatus(message) {
        this.statusText.textContent = message;
        setTimeout(() => {
            this.statusText.textContent = 'Ready';
        }, 3000);
    }

    /**
     * Reset to current template
     */
    resetToTemplate() {
        const activeTemplate = document.querySelector('.template-item.active');
        if (activeTemplate) {
            const templateId = activeTemplate.dataset.template;
            this.loadTemplate(templateId);
        }
    }

    /**
     * Save code to localStorage
     */
    saveCode() {
        const code = this.editor.value;
        const timestamp = new Date().toISOString();
        
        let savedCodes = JSON.parse(localStorage.getItem('d3-sandbox-saves') || '[]');
        savedCodes.unshift({
            code: code,
            timestamp: timestamp,
            name: 'Sandbox ' + new Date().toLocaleString()
        });
        
        // Keep only last 10 saves
        savedCodes = savedCodes.slice(0, 10);
        
        localStorage.setItem('d3-sandbox-saves', JSON.stringify(savedCodes));
        this.setStatus('Code saved! 💾');
    }
}

// Initialize sandbox when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new D3Sandbox();
});