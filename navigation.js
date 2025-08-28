import * as d3 from 'd3';

/**
 * Navigation controller for D3 learning examples
 * Handles example cards, previews, and modal interactions
 */
class D3Navigator {
    constructor() {
        this.examples = new Map();
        this.init();
    }

    /**
     * Initialize the navigation system
     */
    init() {
        this.createMiniPreviews();
        this.setupEventListeners();
        this.loadExampleData();
    }

    /**
     * Create mini chart previews for each example card
     */
    createMiniPreviews() {
        // Bar chart preview
        this.createBarPreview();
        
        // Line chart preview (placeholder)
        this.createLinePreview();
        
        // Scatter plot preview (placeholder)
        this.createScatterPreview();
        
        // Python playground preview
        this.createPythonPreview();
    }

    /**
     * Creates a mini bar chart preview
     */
    createBarPreview() {
        const data = [
            { name: 'A', value: 30 },
            { name: 'B', value: 80 },
            { name: 'C', value: 45 },
            { name: 'D', value: 60 }
        ];

        const svg = d3.select('#bar-preview');
        const margin = { top: 10, right: 10, bottom: 20, left: 20 };
        const width = 200 - margin.left - margin.right;
        const height = 120 - margin.top - margin.bottom;

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, width])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([height, 0]);

        // Create mini bars
        g.selectAll('.mini-bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'mini-bar')
            .attr('x', d => xScale(d.name))
            .attr('width', xScale.bandwidth())
            .attr('y', d => yScale(d.value))
            .attr('height', d => height - yScale(d.value));

        // Add mini axes
        g.append('g')
            .attr('class', 'mini-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickSize(0));

        g.append('g')
            .attr('class', 'mini-axis')
            .call(d3.axisLeft(yScale).ticks(3).tickSize(0));
    }

    /**
     * Creates a mini line chart preview (placeholder)
     */
    createLinePreview() {
        const svg = d3.select('#line-preview');
        const margin = { top: 10, right: 10, bottom: 20, left: 20 };
        const width = 200 - margin.left - margin.right;
        const height = 120 - margin.top - margin.bottom;

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Sample line data
        const data = d3.range(10).map((d, i) => ({
            x: i,
            y: Math.sin(i * 0.5) * 30 + 50
        }));

        const xScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.x))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.y))
            .range([height, 0]);

        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
            .curve(d3.curveMonotoneX);

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
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('r', 3)
            .attr('fill', '#667eea');
    }

    /**
     * Creates a mini scatter plot preview (placeholder)
     */
    createScatterPreview() {
        const svg = d3.select('#scatter-preview');
        const margin = { top: 10, right: 10, bottom: 20, left: 20 };
        const width = 200 - margin.left - margin.right;
        const height = 120 - margin.top - margin.bottom;

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Generate random scatter data
        const data = d3.range(20).map(() => ({
            x: Math.random() * 100,
            y: Math.random() * 100
        }));

        const xScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        g.selectAll('.scatter-dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'scatter-dot')
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('r', 4)
            .attr('fill', '#667eea')
            .attr('opacity', 0.7);
    }

    /**
     * Creates a Python code visualization preview
     */
    createPythonPreview() {
        const svg = d3.select('#python-preview');
        const margin = { top: 10, right: 10, bottom: 20, left: 20 };
        const width = 200 - margin.left - margin.right;
        const height = 120 - margin.top - margin.bottom;

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create a code-like visualization with rectangles representing code blocks
        const codeBlocks = [
            { x: 0, y: 10, width: 80, height: 8, color: '#f7931e' },   // import statement
            { x: 0, y: 25, width: 60, height: 8, color: '#569cd6' },   // function def
            { x: 10, y: 40, width: 100, height: 8, color: '#4ec9b0' }, // code line
            { x: 10, y: 55, width: 75, height: 8, color: '#4ec9b0' },  // code line
            { x: 0, y: 70, width: 45, height: 8, color: '#ce9178' },   // print statement
        ];

        g.selectAll('.code-block')
            .data(codeBlocks)
            .enter()
            .append('rect')
            .attr('class', 'code-block')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('fill', d => d.color)
            .attr('rx', 2);

        // Add Python logo-inspired elements (simplified)
        g.append('circle')
            .attr('cx', width - 15)
            .attr('cy', 20)
            .attr('r', 8)
            .attr('fill', '#3776ab')
            .attr('opacity', 0.8);

        g.append('circle')
            .attr('cx', width - 15)
            .attr('cy', 35)
            .attr('r', 6)
            .attr('fill', '#ffd43b')
            .attr('opacity', 0.8);

        // Add some "data" visualization dots
        const dataPoints = d3.range(8).map((d, i) => ({
            x: 20 + (i * 15),
            y: 95,
            size: 3 + Math.random() * 2
        }));

        g.selectAll('.data-dot')
            .data(dataPoints)
            .enter()
            .append('circle')
            .attr('class', 'data-dot')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', d => d.size)
            .attr('fill', '#f7931e')
            .attr('opacity', 0.7);
    }

    /**
     * Set up event listeners for navigation
     */
    setupEventListeners() {
        // Example card clicks
        document.querySelectorAll('.example-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const exampleType = card.dataset.example;
                this.handleExampleClick(exampleType, card);
            });
        });

        // Modal close
        const modal = document.getElementById('chart-modal');
        const closeBtn = document.querySelector('.close-button');
        
        closeBtn?.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Handle example card clicks
     * @param {string} exampleType - Type of example clicked
     * @param {HTMLElement} cardElement - The clicked card element
     */
    handleExampleClick(exampleType, cardElement) {
        if (cardElement.classList.contains('completed')) {
            this.showExample(exampleType);
        } else if (cardElement.classList.contains('upcoming')) {
            this.showComingSoon(exampleType);
        }
    }

    /**
     * Show completed example in modal
     * @param {string} exampleType - Type of example to show
     */
    showExample(exampleType) {
        const modal = document.getElementById('chart-modal');
        const title = document.getElementById('modal-title');
        const chartContainer = document.getElementById('modal-chart');

        // Clear previous content
        chartContainer.innerHTML = '';
        
        // Set title
        title.textContent = this.getExampleTitle(exampleType);
        
        // Load the example
        if (exampleType === 'bar-chart') {
            this.loadBarChart(chartContainer);
        } else if (exampleType === 'python-playground') {
            // Redirect to Python playground instead of showing modal
            window.open('python-sandbox.html', '_blank');
            return; // Don't show modal for external links
        }
        
        // Show modal
        modal.style.display = 'block';
    }

    /**
     * Show coming soon message
     * @param {string} exampleType - Type of example
     */
    showComingSoon(exampleType) {
        const modal = document.getElementById('chart-modal');
        const title = document.getElementById('modal-title');
        const chartContainer = document.getElementById('modal-chart');

        title.textContent = this.getExampleTitle(exampleType);
        chartContainer.innerHTML = `
            <div style=\"text-align: center; padding: 3rem; color: #666;\">
                <h3>🚧 Coming Soon!</h3>
                <p>This example is part of your learning journey.<br>
                Keep working through the basics first!</p>
                <div style=\"margin-top: 2rem;\">
                    <a href=\"tutorial/index.html\" target=\"_blank\" style=\"
                        display: inline-block;
                        padding: 0.8rem 1.5rem;
                        background: #667eea;
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 500;
                    \">📚 Continue Learning</a>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    /**
     * Load the full bar chart in modal
     * @param {HTMLElement} container - Container element for the chart
     */
    loadBarChart(container) {
        // Import and run the bar chart code
        import('./script.js').then(() => {
            // The bar chart code will run and create the chart
            // We need to modify it to target the modal container
            container.innerHTML = '<div id=\"modal-chart-svg\"></div>';
            
            // Create a new instance of the bar chart for the modal
            this.createModalBarChart('#modal-chart-svg');
        }).catch(err => {
            console.error('Error loading bar chart:', err);
            container.innerHTML = '<p>Error loading chart example.</p>';
        });
    }

    /**
     * Create bar chart specifically for modal display
     * @param {string} selector - CSS selector for container
     */
    createModalBarChart(selector) {
        const data = [
            { name: 'A', value: 30 },
            { name: 'B', value: 80 },
            { name: 'C', value: 45 },
            { name: 'D', value: 60 },
            { name: 'E', value: 20 },
            { name: 'F', value: 90 }
        ];

        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select(selector)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([height, 0]);

        // Create bars
        svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.name))
            .attr('width', xScale.bandwidth())
            .attr('y', d => yScale(d.value))
            .attr('height', d => height - yScale(d.value));

        // Add axes
        svg.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        svg.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(yScale));
    }

    /**
     * Get human-readable title for example type
     * @param {string} exampleType - Example type identifier
     * @returns {string} Human-readable title
     */
    getExampleTitle(exampleType) {
        const titles = {
            'bar-chart': 'Bar Chart',
            'line-chart': 'Line Chart',
            'scatter-plot': 'Scatter Plot',
            'interactive-bar': 'Interactive Bar Chart',
            'animated-chart': 'Animated Transitions',
            'force-layout': 'Force-Directed Graph',
            'choropleth': 'Choropleth Map',
            'python-playground': 'Python Playground'
        };
        return titles[exampleType] || 'D3 Example';
    }

    /**
     * Load example metadata and progress data
     */
    loadExampleData() {
        // This could load from localStorage or API in the future
        console.log('D3 Navigator initialized with examples');
    }
}

// Initialize the navigation system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new D3Navigator();
});