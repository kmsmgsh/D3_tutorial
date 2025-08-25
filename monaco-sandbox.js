import * as monaco from 'monaco-editor';
import * as d3 from 'd3';

// Configure Monaco Editor with proper worker setup
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') {
            return new jsonWorker();
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return new cssWorker();
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return new htmlWorker();
        }
        if (label === 'typescript' || label === 'javascript') {
            return new tsWorker();
        }
        return new editorWorker();
    }
};

/**
 * D3 Monaco Sandbox - Professional code editor for D3.js learning
 * Features Monaco Editor (VS Code) with syntax highlighting and autocompletion
 */
class D3MonacoSandbox {
    constructor() {
        this.editor = null;
        this.preview = document.getElementById('preview');
        this.errorPanel = document.getElementById('error-panel');
        this.errorMessage = document.getElementById('error-message');
        this.statusText = document.getElementById('status-text');
        this.editorInfo = document.getElementById('editor-info');
        this.currentTemplate = document.getElementById('current-template');
        
        this.templates = this.initializeTemplates();
        this.debounceTimer = null;
        
        // Expose instance globally for file upload functionality
        window.monacoSandbox = this;
        
        this.init();
    }

    /**
     * Initialize the Monaco sandbox
     */
    async init() {
        await this.setupMonacoEditor();
        this.setupEventListeners();
        this.setupResizer();
        this.loadTemplate('empty');
        this.setStatus('Monaco Editor ready! Professional D3 coding environment loaded.');
    }

    /**
     * Set up Monaco Editor with D3 support
     */
    async setupMonacoEditor() {
        // Create the Monaco editor
        this.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
            value: '// Loading...',
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: {
                enabled: true
            },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: 'Monaco, "Cascadia Code", "Fira Code", Consolas, "Courier New", monospace',
            lineNumbers: 'on',
            rulers: [80, 120],
            wordWrap: 'bounded',
            wordWrapColumn: 120,
            folding: true,
            foldingHighlight: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            unfoldOnClickAfterEndOfLine: false,
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: false,
            bracketPairColorization: {
                enabled: true
            },
            guides: {
                bracketPairs: true,
                bracketPairsHorizontal: true,
                highlightActiveBracketPair: true,
                indentation: true
            },
            suggest: {
                showKeywords: true,
                showSnippets: true,
                showFunctions: true,
                showConstructors: true,
                showFields: true,
                showVariables: true,
                showClasses: true,
                showStructs: true,
                showInterfaces: true,
                showModules: true,
                showProperties: true,
                showEvents: true,
                showOperators: true,
                showUnits: true,
                showValues: true,
                showConstants: true,
                showEnums: true,
                showEnumMembers: true,
                showColors: true,
                showFiles: true,
                showReferences: true,
                showFolders: true,
                showTypeParameters: true
            }
        });

        // Add D3 type definitions for better IntelliSense
        this.setupD3IntelliSense();

        // Set up editor events
        this.editor.onDidChangeModelContent(() => {
            this.debouncePreview();
            this.updateEditorInfo();
        });

        this.editor.onDidChangeCursorPosition(() => {
            this.updateEditorInfo();
        });
    }

    /**
     * Set up D3 IntelliSense and autocompletion
     */
    setupD3IntelliSense() {
        // Add D3 suggestions
        monaco.languages.registerCompletionItemProvider('javascript', {
            provideCompletionItems: (model, position) => {
                const suggestions = [
                    // D3 Core Methods
                    {
                        label: 'd3.select',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'd3.select("${1:#selector}")',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Select the first element matching the selector'
                    },
                    {
                        label: 'd3.selectAll',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'd3.selectAll("${1:.class}")',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Select all elements matching the selector'
                    },
                    // Scales
                    {
                        label: 'd3.scaleLinear',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'd3.scaleLinear()\\n\\t.domain([${1:0, 100}])\\n\\t.range([${2:0, width}])',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Create a linear scale'
                    },
                    {
                        label: 'd3.scaleBand',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'd3.scaleBand()\\n\\t.domain(${1:data.map(d => d.key)})\\n\\t.range([${2:0, width}])\\n\\t.padding(${3:0.1})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Create a band scale for ordinal data'
                    },
                    {
                        label: 'd3.scaleTime',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'd3.scaleTime()\\n\\t.domain(d3.extent(${1:data}, d => d.date))\\n\\t.range([${2:0, width}])',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Create a time scale'
                    },
                    // Data functions
                    {
                        label: 'd3.max',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'd3.max(${1:data}, d => d.${2:value})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Get the maximum value from an array'
                    },
                    {
                        label: 'd3.min',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'd3.min(${1:data}, d => d.${2:value})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Get the minimum value from an array'
                    },
                    {
                        label: 'd3.extent',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'd3.extent(${1:data}, d => d.${2:value})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Get the minimum and maximum values from an array'
                    },
                    // Axes
                    {
                        label: 'd3.axisBottom',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'd3.axisBottom(${1:xScale})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Create a bottom-oriented axis'
                    },
                    {
                        label: 'd3.axisLeft',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'd3.axisLeft(${1:yScale})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Create a left-oriented axis'
                    },
                    {
                        label: 'd3.axisRight',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'd3.axisRight(${1:yScale})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Create a right-oriented axis'
                    },
                    // Shapes
                    {
                        label: 'd3.line',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'd3.line()\\n\\t.x(d => ${1:xScale(d.x)})\\n\\t.y(d => ${2:yScale(d.y)})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Create a line generator'
                    },
                    // Common snippets
                    {
                        label: 'data-binding-pattern',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'svg.selectAll("${1:.item}")\\n\\t.data(${2:data})\\n\\t.enter()\\n\\t.append("${3:rect}")\\n\\t.attr("${4:x}", d => ${5:xScale(d.key)})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'D3 data binding pattern'
                    }
                ];

                return { suggestions: suggestions };
            }
        });
    }

    /**
     * Initialize code templates
     */
    initializeTemplates() {
        return {
            'empty': {
                name: 'Empty Canvas',
                code: `// Welcome to D3 Monaco Sandbox! 🚀
// Professional VS Code editor with syntax highlighting and autocompletion

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
    .text('Monaco Editor Ready! 🎮');`
            },
            
            'basic-setup': {
                name: 'Basic D3 Setup',
                code: `// Basic D3 setup with Monaco Editor
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
    .text('Ready for your D3 visualization! ✨');`
            },
            
            'file-upload': {
                name: 'Upload JS File',
                code: `// 📁 File Upload Template
// Click the "Upload File" button below to load a JavaScript file

const svg = d3.select('#preview')
    .append('svg')
    .attr('width', 500)
    .attr('height', 300)
    .style('border', '1px solid #ddd')
    .style('background', '#f9f9f9');

// Instructions
const g = svg.append('g')
    .attr('transform', 'translate(250, 150)');

g.append('text')
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .style('font-weight', 'bold')
    .style('fill', '#667eea')
    .text('📁 Upload a JavaScript file');

g.append('text')
    .attr('y', 25)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('fill', '#666')
    .text('Use the Upload File button in the toolbar');

g.append('text')
    .attr('y', 45)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('fill', '#999')
    .text('Supports .js files with D3 code');

// Add file input (hidden)
if (!document.getElementById('file-input')) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'file-input';
    fileInput.accept = '.js,.txt';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                // Access the Monaco editor instance from the sandbox
                if (window.monacoSandbox && window.monacoSandbox.editor) {
                    window.monacoSandbox.editor.setValue(content);
                    window.monacoSandbox.setStatus('File loaded: ' + file.name + ' ✅');
                }
            };
            reader.readAsText(file);
        }
    });
}

// Add upload button to toolbar if not exists
if (!document.getElementById('upload-btn')) {
    const uploadBtn = document.createElement('button');
    uploadBtn.id = 'upload-btn';
    uploadBtn.className = 'btn btn-secondary';
    uploadBtn.innerHTML = '📁 Upload File';
    uploadBtn.style.marginRight = '0.5rem';
    
    uploadBtn.addEventListener('click', () => {
        document.getElementById('file-input').click();
    });
    
    const toolbarRight = document.querySelector('.toolbar-right');
    if (toolbarRight) {
        toolbarRight.insertBefore(uploadBtn, toolbarRight.firstChild);
    }
}`
            },
            
            'bar-chart': {
                name: 'Bar Chart',
                code: `// Enhanced bar chart with Monaco Editor
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

// Try typing "d3." to see autocompletion!
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

// Create scales - try the autocompletion!
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
                code: `// Professional dual axis chart with mathematical arrows
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

// Define arrow markers for mathematical axes
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

// Scales - Try Monaco's intelligent autocompletion!
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

// Add mathematical arrow lines for axes
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

// Right Y-axis label (positioned with proper spacing)
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

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Template selection
        document.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectTemplate(e.target);
            });
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

        document.getElementById('format-btn').addEventListener('click', () => {
            this.formatCode();
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
            const rightWidth = totalWidth - leftWidth - 4;
            
            if (leftWidth > 200 && rightWidth > 200) {
                leftPanel.style.flex = `0 0 ${leftWidth}px`;
                rightPanel.style.flex = `0 0 ${rightWidth}px`;
            }
        }

        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        }
    }

    /**
     * Select and load a template
     */
    selectTemplate(templateElement) {
        document.querySelectorAll('.template-item').forEach(item => {
            item.classList.remove('active');
        });
        templateElement.classList.add('active');
        
        const templateId = templateElement.dataset.template;
        this.loadTemplate(templateId);
    }

    /**
     * Load a code template
     */
    loadTemplate(templateId) {
        const template = this.templates[templateId];
        if (template && this.editor) {
            this.editor.setValue(template.code);
            this.currentTemplate.textContent = template.name;
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
        }, 1000); // Longer delay for Monaco editor
    }

    /**
     * Execute the code in the editor
     */
    runCode() {
        try {
            this.clearPreview();
            this.hideError();
            
            const code = this.editor.getValue();
            const func = new Function('d3', code);
            func(d3);
            
            this.setStatus('Code executed successfully! ✅');
            
        } catch (error) {
            this.showError(error.message);
            this.setStatus('Error in code ❌');
        }
    }

    /**
     * Format code using Monaco's built-in formatter
     */
    formatCode() {
        if (this.editor) {
            this.editor.getAction('editor.action.formatDocument').run();
            this.setStatus('Code formatted! ✨');
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
     * Update editor info in status bar
     */
    updateEditorInfo() {
        if (this.editor) {
            const position = this.editor.getPosition();
            this.editorInfo.textContent = `JavaScript • UTF-8 • Ln ${position.lineNumber}, Col ${position.column}`;
        }
    }

    /**
     * Set status message
     */
    setStatus(message) {
        this.statusText.textContent = message;
        setTimeout(() => {
            this.statusText.textContent = 'Monaco Editor Ready';
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
        const code = this.editor.getValue();
        const timestamp = new Date().toISOString();
        
        let savedCodes = JSON.parse(localStorage.getItem('d3-monaco-saves') || '[]');
        savedCodes.unshift({
            code: code,
            timestamp: timestamp,
            name: 'Monaco Sandbox ' + new Date().toLocaleString()
        });
        
        // Keep only last 10 saves
        savedCodes = savedCodes.slice(0, 10);
        
        localStorage.setItem('d3-monaco-saves', JSON.stringify(savedCodes));
        this.setStatus('Code saved! 💾');
    }
}

// Initialize Monaco sandbox when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new D3MonacoSandbox();
});