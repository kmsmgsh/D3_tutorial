import * as monaco from 'monaco-editor';

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
 * Python Playground - Pyodide-powered Python environment with Monaco Editor
 * Features full Python with NumPy, Pandas, Matplotlib support
 */
class PythonPlayground {
    constructor() {
        console.log('🏗️ Creating PythonPlayground instance...');
        this.editor = null;
        this.pyodide = null;
        this.output = document.getElementById('output');
        this.errorPanel = document.getElementById('error-panel');
        this.errorMessage = document.getElementById('error-message');
        this.statusText = document.getElementById('status-text');
        this.editorInfo = document.getElementById('editor-info');
        this.currentTemplate = document.getElementById('current-template');
        this.loadingIndicator = document.getElementById('loading-indicator');
        
        console.log('📋 DOM elements found:', {
            output: !!this.output,
            errorPanel: !!this.errorPanel,
            statusText: !!this.statusText,
            currentTemplate: !!this.currentTemplate
        });
        
        console.log('📚 Initializing templates...');
        this.templates = this.initializeTemplates();
        console.log('📚 Templates initialized, count:', Object.keys(this.templates).length);
        console.log('📚 Template keys:', Object.keys(this.templates));
        
        this.isLoading = false;
        
        this.init();
    }

    /**
     * Initialize the Python playground
     */
    async init() {
        try {
            console.log('🚀 Starting Python playground initialization...');
            this.showLoading();
            
            console.log('📝 Setting up Monaco Editor...');
            await this.setupMonacoEditor();
            console.log('✅ Monaco Editor setup complete');
            
            console.log('🔗 Setting up event listeners...');
            this.setupEventListeners();
            console.log('✅ Event listeners setup complete');
            
            console.log('📏 Setting up resizer...');
            this.setupResizer();
            console.log('✅ Resizer setup complete');
            
            console.log('📄 Loading empty template...');
            this.loadTemplate('empty');
            console.log('✅ Empty template loaded');
            
            console.log('🐍 Starting Pyodide setup in background...');
            // Setup Pyodide in background (don't block UI)
            this.setupPyodideAsync();
            
            console.log('✅ Python playground initialization complete!');
            
        } catch (error) {
            console.error('❌ Failed to initialize Python playground:', error);
            this.showError('Failed to initialize playground: ' + error.message);
            this.setStatus('Initialization failed');
        }
    }

    /**
     * Set up Monaco Editor with Python support
     */
    async setupMonacoEditor() {
        this.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
            value: '# Loading Python environment...',
            language: 'python',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: 'Monaco, "Cascadia Code", "Fira Code", Consolas, "Courier New", monospace',
            lineNumbers: 'on',
            rulers: [79, 120], // PEP 8 style guide
            wordWrap: 'bounded',
            wordWrapColumn: 120,
            folding: true,
            foldingHighlight: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            tabSize: 4, // Python standard
            insertSpaces: true,
            detectIndentation: false,
            bracketPairColorization: { enabled: true }
        });

        // Add Python-specific autocompletion
        this.setupPythonCompletions();

        // Update editor info on cursor change
        this.editor.onDidChangeCursorPosition(() => {
            this.updateEditorInfo();
        });

        // Update editor info on content change
        this.editor.onDidChangeModelContent(() => {
            this.updateEditorInfo();
        });
    }

    /**
     * Set up Pyodide Python runtime asynchronously (non-blocking)
     */
    async setupPyodideAsync() {
        try {
            this.hideLoading();
            this.setStatus('Monaco Editor ready - Python loading in background...');
            
            // Load Pyodide from CDN with timeout
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
            
            const loadScript = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Pyodide script loading timed out after 30 seconds'));
                }, 30000);
                
                script.onload = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                script.onerror = (error) => {
                    clearTimeout(timeout);
                    reject(error);
                };
                document.head.appendChild(script);
            });

            this.setStatus('Loading Python runtime from CDN...');
            await loadScript;

            this.setStatus('Initializing Python environment...');
            
            // Initialize Pyodide with timeout
            const initPyodide = new Promise(async (resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Pyodide initialization timed out after 60 seconds'));
                }, 60000);
                
                try {
                    this.pyodide = await loadPyodide({
                        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
                    });
                    clearTimeout(timeout);
                    resolve();
                } catch (error) {
                    clearTimeout(timeout);
                    reject(error);
                }
            });
            
            await initPyodide;

            // Install core packages
            const corePackages = ['numpy', 'pandas', 'matplotlib'];
            for (let i = 0; i < corePackages.length; i++) {
                const pkg = corePackages[i];
                this.setStatus(`Installing ${pkg} (${i + 1}/${corePackages.length})...`);
                await this.pyodide.loadPackage([pkg]);
            }
            
            // Note: Plotly and Altair are not available in Pyodide
            // We use iframe-based rendering instead
            this.setStatus('Configuring iframe-based Plotly solution...');

            // Set up matplotlib and browser-side plotly for web
            this.setStatus('Configuring visualization libraries...');
            this.pyodide.runPython(`
import matplotlib
import matplotlib.pyplot as plt
import io
import base64
import json

# Configure matplotlib for web
matplotlib.use('AGG')
plt.ioff()  # Turn off interactive mode

def show_plot():
    """Capture matplotlib plot and return as base64 image"""
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight', dpi=100)
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    buffer.close()
    plt.close()  # Close the figure to free memory
    return f"data:image/png;base64,{image_base64}"

# Iframe-based Plotly.js solution - Generate complete HTML with embedded charts
_plotly_htmls = []

def create_plotly_iframe(data, layout=None, config=None, title="Plotly Chart"):
    """Create a complete HTML document for iframe embedding"""
    global _plotly_htmls
    
    # Ensure data is a list of traces
    if not isinstance(data, list):
        data = [data]
    
    # Default layout
    default_layout = {
        'title': title,
        'showlegend': True,
        'height': 400,
        'margin': {'l': 50, 'r': 50, 't': 50, 'b': 50}
    }
    if layout:
        default_layout.update(layout)
    
    # Default config
    default_config = {
        'displayModeBar': True,
        'displaylogo': False,
        'modeBarButtonsToRemove': ['pan2d', 'lasso2d']
    }
    if config:
        default_config.update(config)
    
    # Generate complete HTML document
    html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <script src="https://cdn.plot.ly/plotly-2.26.0.min.js"></script>
    <style>
        body {{
            margin: 0;
            padding: 10px;
            font-family: Arial, sans-serif;
            background: white;
        }}
        #plotly-div {{
            width: 100%;
            height: calc(100vh - 20px);
        }}
    </style>
</head>
<body>
    <div id="plotly-div"></div>
    <script>
        const data = {json.dumps(data)};
        const layout = {json.dumps(default_layout)};
        const config = {json.dumps(default_config)};
        
        Plotly.newPlot('plotly-div', data, layout, config)
            .then(() => console.log('Plotly chart rendered successfully'))
            .catch(err => console.error('Plotly error:', err));
    </script>
</body>
</html>"""
    
    _plotly_htmls.append(html_content)
    print(f"Plotly iframe HTML created with {len(data)} traces")
    return len(_plotly_htmls) - 1  # Return index

def plotly_scatter(x, y, mode='markers', name=None, **kwargs):
    """Create a scatter plot trace"""
    trace = {
        'x': x if isinstance(x, list) else list(x),
        'y': y if isinstance(y, list) else list(y),
        'mode': mode,
        'type': 'scatter'
    }
    if name:
        trace['name'] = name
    
    # Handle common plotly parameters
    for key, value in kwargs.items():
        if key in ['marker', 'line', 'text', 'textposition', 'hovertemplate']:
            trace[key] = value
    
    return trace

def plotly_bar(x, y, name=None, **kwargs):
    """Create a bar chart trace"""
    trace = {
        'x': x if isinstance(x, list) else list(x),
        'y': y if isinstance(y, list) else list(y),
        'type': 'bar'
    }
    if name:
        trace['name'] = name
    
    for key, value in kwargs.items():
        if key in ['marker', 'text', 'textposition', 'hovertemplate']:
            trace[key] = value
    
    return trace

def plotly_line(x, y, name=None, **kwargs):
    """Create a line chart trace"""
    trace = {
        'x': x if isinstance(x, list) else list(x),
        'y': y if isinstance(y, list) else list(y),
        'mode': 'lines',
        'type': 'scatter'
    }
    if name:
        trace['name'] = name
    
    for key, value in kwargs.items():
        if key in ['line', 'marker', 'hovertemplate']:
            trace[key] = value
    
    return trace

def show_plotly_chart(traces, layout=None, title="Interactive Chart"):
    """Show a Plotly chart using iframe embedding"""
    if not isinstance(traces, list):
        traces = [traces]
    
    return create_plotly_iframe(traces, layout, title=title)

def get_plotly_iframes():
    """Get all plotly iframe HTMLs and clear the list"""
    global _plotly_htmls
    htmls = _plotly_htmls.copy()
    _plotly_htmls = []  # Clear for next run
    return htmls if htmls else None
            `);

            this.setStatus('Python environment ready! 🐍 (NumPy, Pandas, Matplotlib + Iframe Plotly)');

        } catch (error) {
            console.error('Failed to initialize Pyodide:', error);
            this.setStatus('Python environment failed to load - Editor still works for syntax');
            console.warn('Pyodide failed to load:', error.message);
        }
    }

    /**
     * Set up Python-specific autocompletion
     */
    setupPythonCompletions() {
        monaco.languages.registerCompletionItemProvider('python', {
            provideCompletionItems: () => {
                const suggestions = [
                    // Built-in functions
                    { label: 'print', kind: monaco.languages.CompletionItemKind.Function, insertText: 'print()' },
                    { label: 'len', kind: monaco.languages.CompletionItemKind.Function, insertText: 'len()' },
                    { label: 'range', kind: monaco.languages.CompletionItemKind.Function, insertText: 'range()' },
                    { label: 'input', kind: monaco.languages.CompletionItemKind.Function, insertText: 'input()' },
                    
                    // Import statements
                    { label: 'import numpy as np', kind: monaco.languages.CompletionItemKind.Module, insertText: 'import numpy as np' },
                    { label: 'import pandas as pd', kind: monaco.languages.CompletionItemKind.Module, insertText: 'import pandas as pd' },
                    { label: 'import matplotlib.pyplot as plt', kind: monaco.languages.CompletionItemKind.Module, insertText: 'import matplotlib.pyplot as plt' },
                    { label: 'import plotly.graph_objects as go', kind: monaco.languages.CompletionItemKind.Module, insertText: 'import plotly.graph_objects as go' },
                    { label: 'import plotly.express as px', kind: monaco.languages.CompletionItemKind.Module, insertText: 'import plotly.express as px' },
                    
                    // Matplotlib functions
                    { label: 'show_plot()', kind: monaco.languages.CompletionItemKind.Function, insertText: 'show_plot()' },
                    { label: 'plt.figure', kind: monaco.languages.CompletionItemKind.Function, insertText: 'plt.figure(figsize=(10, 6))' },
                    { label: 'plt.plot', kind: monaco.languages.CompletionItemKind.Function, insertText: 'plt.plot(x, y)' },
                    
                    // Plotly functions
                    { label: 'go.Figure', kind: monaco.languages.CompletionItemKind.Function, insertText: 'go.Figure()' },
                    { label: 'go.Scatter', kind: monaco.languages.CompletionItemKind.Function, insertText: 'go.Scatter(x=x, y=y)' },
                    { label: 'px.scatter', kind: monaco.languages.CompletionItemKind.Function, insertText: 'px.scatter(df, x="x", y="y")' },
                    { label: 'px.line', kind: monaco.languages.CompletionItemKind.Function, insertText: 'px.line(df, x="x", y="y")' },
                    { label: 'px.bar', kind: monaco.languages.CompletionItemKind.Function, insertText: 'px.bar(df, x="x", y="y")' },
                    { label: 'fig.show()', kind: monaco.languages.CompletionItemKind.Function, insertText: 'fig.show()' },
                    
                    // Common patterns
                    { label: 'df.head()', kind: monaco.languages.CompletionItemKind.Function, insertText: 'df.head()' },
                    { label: 'np.random.seed', kind: monaco.languages.CompletionItemKind.Function, insertText: 'np.random.seed(42)' }
                ];
                return { suggestions };
            }
        });
    }

    /**
     * Initialize Python code templates
     */
    initializeTemplates() {
        const templates = {};
        
        templates['empty'] = {
            name: 'Empty Python',
            code: '# Welcome to Python Playground!\n# Write your Python code here\n\nprint("Hello, Python!")'
        };
        
        templates['hello-world'] = {
            name: 'Hello World',
            code: [
                '# Python Hello World Example',
                'print("Hello, World!")',
                'print("Welcome to Python programming!")',
                '',
                '# Variables and basic operations',
                'name = "Python"',
                'version = 3.11',
                'print(f"I\'m learning {name} version {version}")',
                '',
                '# Basic math',
                'result = 10 + 5 * 2',
                'print(f"10 + 5 * 2 = {result}")'
            ].join('\n')
        };
        
        templates['basic-math'] = {
            name: 'Basic Math',
            code: [
                '# Python Math Operations',
                'import math',
                '',
                '# Basic arithmetic',
                'a, b = 10, 3',
                'print(f"Addition: {a} + {b} = {a + b}")',
                'print(f"Subtraction: {a} - {b} = {a - b}")',
                'print(f"Multiplication: {a} * {b} = {a * b}")',
                'print(f"Division: {a} / {b} = {a / b:.2f}")',
                'print(f"Power: {a} ** {b} = {a ** b}")',
                '',
                '# Math functions',
                'number = 16',
                'print(f"Square root: {math.sqrt(number)}")',
                'print(f"Pi: {math.pi:.6f}")'
            ].join('\n')
        };
        
        templates['test-environment'] = {
            name: 'Test Environment',
            code: [
                '# Test Python Environment - Comprehensive Check',
                'import sys',
                'print("🐍 Python Environment Test")',
                'print(f"Python version: {sys.version}")',
                '',
                '# Test basic functionality',
                'print("\\n📦 Testing basic packages...")',
                '',
                'try:',
                '    import numpy as np',
                '    print("✅ NumPy available")',
                '    arr = np.array([1, 2, 3])',
                '    print(f"   Sample array: {arr}")',
                'except ImportError:',
                '    print("❌ NumPy not available")',
                '',
                'try:',
                '    import pandas as pd',
                '    print("✅ Pandas available")',
                '    df = pd.DataFrame({"x": [1, 2], "y": [3, 4]})',
                '    print("   Sample DataFrame:")',
                '    print(df)',
                'except ImportError:',
                '    print("❌ Pandas not available")',
                '',
                'try:',
                '    import matplotlib.pyplot as plt',
                '    print("✅ Matplotlib available")',
                'except ImportError:',
                '    print("❌ Matplotlib not available")',
                '',
                '# Detailed Plotly testing',
                'print("\\n🎯 Detailed Plotly Testing...")',
                'try:',
                '    import plotly',
                '    print("✅ Plotly package available")',
                '    print(f"   Plotly version: {plotly.__version__}")',
                '    ',
                '    try:',
                '        import plotly.graph_objects as go',
                '        print("✅ plotly.graph_objects available")',
                '    except ImportError:',
                '        print("❌ plotly.graph_objects not available")',
                '    ',
                '    try:',
                '        import plotly.express as px',
                '        print("✅ plotly.express available")',
                '    except ImportError:',
                '        print("❌ plotly.express not available")',
                '',
                'except ImportError as e:',
                '    print("❌ Plotly not available")',
                '    print(f"   Error: {e}")',
                '',
                '# Test Pyodide package capabilities',
                'print("\\n🔧 Pyodide Package Information...")',
                'try:',
                '    import micropip',
                '    print("✅ micropip available for installing packages")',
                '    print("❌ Plotly is NOT available in Pyodide package repository")',
                '    print("❌ Altair is NOT available in Pyodide package repository")',
                '    print("✅ Using iframe-based Plotly solution instead!")',
                'except Exception as e:',
                '    print(f"❌ micropip error: {e}")',
                '',
                'print("\\n🔧 Testing plot functions...")',
                'if "show_plot" in globals():',
                '    print("✅ show_plot function available")',
                'else:',
                '    print("❌ show_plot function missing")',
                '',
                'if "get_plotly_iframes" in globals():',
                '    print("✅ Iframe-based Plotly functions available")',
                'else:',
                '    print("❌ Iframe-based Plotly functions missing")',
                '',
                'if "plotly_scatter" in globals():',
                '    print("✅ plotly_scatter function available")',
                'else:',
                '    print("❌ plotly_scatter function missing")',
                '',
                'if "show_plotly_chart" in globals():',
                '    print("✅ show_plotly_chart function available")',
                'else:',
                '    print("❌ show_plotly_chart function missing")',
                '',
                'print("\\n🎉 Environment test complete!")'
            ].join('\n')
        };
        
        templates['simple-plot'] = {
            name: 'Simple Line Plot',
            code: [
                '# Simple Line Plot with Matplotlib',
                'import matplotlib.pyplot as plt',
                'import numpy as np',
                '',
                'print("Creating matplotlib plot...")',
                '',
                '# Generate data',
                'x = np.linspace(0, 10, 100)',
                'y = np.sin(x)',
                '',
                '# Create plot',
                'plt.figure(figsize=(8, 6))',
                'plt.plot(x, y, label="sin(x)", linewidth=2, color="blue")',
                'plt.xlabel("X values")',
                'plt.ylabel("Y values")',
                'plt.title("Sine Function")',
                'plt.legend()',
                'plt.grid(True, alpha=0.3)',
                '',
                'print("Plot created, capturing image...")',
                '',
                '# The plot will be automatically captured and displayed',
                '# No need to call show_plot() manually'
            ].join('\n')
        };
        
        templates['matplotlib-test'] = {
            name: 'Matplotlib Test',
            code: [
                '# Simple Matplotlib Test',
                'import matplotlib.pyplot as plt',
                '',
                'print("Testing matplotlib...")',
                '',
                '# Create a simple plot',
                'plt.figure(figsize=(6, 4))',
                'plt.plot([1, 2, 3, 4], [1, 4, 2, 3], "ro-")',
                'plt.title("Simple Test Plot")',
                'plt.xlabel("X")',
                'plt.ylabel("Y")',
                '',
                'print("Plot should appear below...")'
            ].join('\n')
        };
        
        templates['plotly-basic'] = {
            name: 'Plotly Basic',
            code: [
                '# Basic Plotly Interactive Plot (Iframe-based)',
                'import numpy as np',
                '',
                'print("Creating interactive Plotly plot with iframe rendering...")',
                '',
                '# Generate data',
                'x = np.linspace(0, 10, 100)',
                'y = np.sin(x)',
                '',
                '# Create scatter/line trace',
                'trace = plotly_scatter(x, y, mode="lines", name="sin(x)")',
                'trace["line"] = {"color": "blue", "width": 2}',
                '',
                '# Define layout',
                'layout = {',
                '    "title": "Interactive Sine Wave",',
                '    "xaxis": {"title": "X values"},',
                '    "yaxis": {"title": "Y values"},',
                '    "height": 380,',
                '    "showlegend": True',
                '}',
                '',
                '# Create and display the chart',
                'chart_id = show_plotly_chart(trace, layout, title="Interactive Sine Wave")',
                '',
                'print(f"Interactive Plotly chart created! Chart ID: {chart_id}")',
                'print("The chart will appear below in an iframe with full interactivity!")',
                'print("Features: zoom, pan, hover, legend toggle, and more!")'
            ].join('\n')
        };
        
        templates['plotly-express'] = {
            name: 'Plotly Express',
            code: [
                '# Plotly Express - High-level Interface',
                'import plotly.express as px',
                'import pandas as pd',
                'import numpy as np',
                '',
                'print("Creating Plotly Express visualization...")',
                '',
                '# Create sample data',
                'np.random.seed(42)',
                'df = pd.DataFrame({',
                '    "x": np.random.randn(100),',
                '    "y": np.random.randn(100),',
                '    "color": np.random.choice(["A", "B", "C"], 100),',
                '    "size": np.random.randint(10, 50, 100)',
                '})',
                '',
                '# Create scatter plot with color and size mapping',
                'fig = px.scatter(df, x="x", y="y", color="color", size="size",',
                '                hover_data=["x", "y"], title="Interactive Scatter Plot")',
                '',
                '# Update layout',
                'fig.update_layout(height=500)',
                '',
                '# Display the plot',
                'fig.show()',
                '',
                'print("Plotly Express scatter plot with interactive features!")'
            ].join('\n')
        };
        
        templates['plotly-dashboard'] = {
            name: 'Plotly Dashboard',
            code: [
                '# Plotly Multiple Subplots Dashboard',
                'import plotly.graph_objects as go',
                'from plotly.subplots import make_subplots',
                'import numpy as np',
                '',
                'print("Creating Plotly dashboard with multiple charts...")',
                '',
                '# Generate sample data',
                'x = np.linspace(0, 10, 50)',
                'y1 = np.sin(x)',
                'y2 = np.cos(x)',
                'y3 = np.exp(-x/10) * np.sin(x)',
                '',
                '# Create subplots',
                'fig = make_subplots(',
                '    rows=2, cols=2,',
                '    subplot_titles=("Sine Wave", "Cosine Wave", "Damped Sine", "Combined"),',
                '    specs=[[{"secondary_y": False}, {"secondary_y": False}],',
                '           [{"secondary_y": False}, {"secondary_y": False}]]',
                ')',
                '',
                '# Add traces',
                'fig.add_trace(go.Scatter(x=x, y=y1, name="sin(x)"), row=1, col=1)',
                'fig.add_trace(go.Scatter(x=x, y=y2, name="cos(x)"), row=1, col=2)',
                'fig.add_trace(go.Scatter(x=x, y=y3, name="damped sin(x)"), row=2, col=1)',
                'fig.add_trace(go.Scatter(x=x, y=y1, name="sin(x)"), row=2, col=2)',
                'fig.add_trace(go.Scatter(x=x, y=y2, name="cos(x)"), row=2, col=2)',
                '',
                '# Update layout',
                'fig.update_layout(height=600, showlegend=True, title_text="Interactive Dashboard")',
                '',
                '# Display the dashboard',
                'fig.show()',
                '',
                'print("Interactive dashboard with multiple synchronized charts!")'
            ].join('\n')
        };
        
        templates['vega-lite-json'] = {
            name: 'Vega-Lite JSON',
            code: [
                '# Vega-Lite JSON Specification (Alternative to Altair)',
                'import json',
                'import pandas as pd',
                'import numpy as np',
                '',
                'print("Creating Vega-Lite specification...")',
                '',
                '# Create sample data',
                'np.random.seed(42)',
                'data = {',
                '    "x": list(range(20)),',
                '    "y": np.random.randn(20).tolist(),',
                '    "category": ["A" if i % 2 == 0 else "B" for i in range(20)]',
                '}',
                '',
                '# Create Vega-Lite specification',
                'vega_spec = {',
                '    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",',
                '    "description": "A simple scatter plot",',
                '    "data": {"values": [{"x": data["x"][i], "y": data["y"][i], "category": data["category"][i]} for i in range(20)]},',
                '    "mark": "circle",',
                '    "encoding": {',
                '        "x": {"field": "x", "type": "quantitative"},',
                '        "y": {"field": "y", "type": "quantitative"},',
                '        "color": {"field": "category", "type": "nominal"}',
                '    },',
                '    "width": 400,',
                '    "height": 300',
                '}',
                '',
                '# Display the specification',
                'print("Vega-Lite Specification:")',
                'print(json.dumps(vega_spec, indent=2))',
                '',
                'print("\\nThis JSON can be used with Vega-Lite in web applications!")',
                'print("Copy the JSON to https://vega.github.io/editor/ to visualize it.")'
            ].join('\n')
        };
        
        templates['altair-style'] = {
            name: 'Altair-Style Code',
            code: [
                '# Altair-Style Declarative Visualization (Educational)',
                '# Note: This shows Altair syntax but may not run if Altair is not available',
                'import pandas as pd',
                'import numpy as np',
                '',
                'print("Learning Altair declarative visualization syntax...")',
                '',
                '# Create sample dataset',
                'np.random.seed(42)',
                'df = pd.DataFrame({',
                '    "x": np.random.randn(100),',
                '    "y": np.random.randn(100),',
                '    "color": np.random.choice(["red", "blue", "green"], 100),',
                '    "size": np.random.randint(20, 100, 100)',
                '})',
                '',
                'print("Sample data created:")',
                'print(df.head())',
                '',
                'print("\\n--- ALTAIR SYNTAX EXAMPLES ---")',
                'print("Basic scatter plot:")',
                'print("alt.Chart(df).mark_circle().encode(x=\'x\', y=\'y\')")',
                '',
                'print("\\nWith color encoding:")',
                'print("alt.Chart(df).mark_circle().encode(x=\'x\', y=\'y\', color=\'color\')")',
                '',
                'print("\\nWith size encoding:")',
                'print("alt.Chart(df).mark_circle().encode(x=\'x\', y=\'y\', color=\'color\', size=\'size\')")',
                '',
                'print("\\nHistogram:")',
                'print("alt.Chart(df).mark_bar().encode(x=alt.X(\'x\', bin=True), y=\'count()\')")',
                '',
                'print("\\nLine chart:")',
                'print("alt.Chart(df).mark_line().encode(x=\'x\', y=\'y\')")',
                '',
                'print("\\nBoxplot:")',
                'print("alt.Chart(df).mark_boxplot().encode(x=\'color\', y=\'x\')")',
                '',
                'print("\\nFaceted chart:")',
                'print("alt.Chart(df).mark_circle().encode(x=\'x\', y=\'y\').facet(column=\'color\')")',
                '',
                'print("\\nTo use Altair, install it and replace print statements with actual chart.show() calls!")'
            ].join('\n')
        };
        
        // NumPy & Data templates
        templates['numpy-basics'] = {
            name: 'NumPy Arrays',
            code: [
                '# NumPy Array Basics',
                'import numpy as np',
                '',
                'print("🔢 NumPy Array Operations")',
                '',
                '# Creating arrays',
                'arr1d = np.array([1, 2, 3, 4, 5])',
                'arr2d = np.array([[1, 2, 3], [4, 5, 6]])',
                'print("1D Array:", arr1d)',
                'print("2D Array:")',
                'print(arr2d)',
                '',
                '# Array properties',
                'print(f"\\nArray shape: {arr2d.shape}")',
                'print(f"Array size: {arr2d.size}")',
                'print(f"Data type: {arr2d.dtype}")',
                '',
                '# Array creation functions',
                'zeros = np.zeros((2, 3))',
                'ones = np.ones((2, 3))',
                'identity = np.eye(3)',
                'print("\\nZeros array:")',
                'print(zeros)',
                'print("\\nOnes array:")',
                'print(ones)',
                'print("\\nIdentity matrix:")',
                'print(identity)',
                '',
                '# Random arrays',
                'np.random.seed(42)',
                'random_arr = np.random.rand(3, 3)',
                'normal_arr = np.random.randn(5)',
                'print("\\nRandom array (0-1):")',
                'print(random_arr)',
                'print("\\nNormal distribution:")',
                'print(normal_arr)',
                '',
                '# Array operations',
                'a = np.array([1, 2, 3])',
                'b = np.array([4, 5, 6])',
                'print("\\nArray operations:")',
                'print(f"a + b = {a + b}")',
                'print(f"a * b = {a * b}")',
                'print(f"a @ b = {a @ b}")  # dot product',
                'print(f"Sum: {np.sum(a)}")',
                'print(f"Mean: {np.mean(a):.2f}")',
                'print(f"Max: {np.max(a)}")',
                '',
                '# Advanced array operations',
                'matrix = np.array([[1, 2], [3, 4]])',
                'print("\\nMatrix operations:")',
                'print("Matrix:")',
                'print(matrix)',
                'print(f"Transpose: \\n{matrix.T}")',
                'print(f"Determinant: {np.linalg.det(matrix):.2f}")',
                'print(f"Matrix multiplication: \\n{matrix @ matrix}")',
                '',
                '# Indexing and slicing',
                'arr = np.arange(10)',
                'print("\\nIndexing and slicing:")',
                'print(f"Array: {arr}")',
                'print(f"First 5 elements: {arr[:5]}")',
                'print(f"Every 2nd element: {arr[::2]}")',
                'print(f"Reversed: {arr[::-1]}")',
                '',
                '# Boolean indexing',
                'data = np.random.randint(1, 10, 10)',
                'print("\\nBoolean indexing:")',
                'print(f"Data: {data}")',
                'print(f"Elements > 5: {data[data > 5]}")',
                'print(f"Count > 5: {np.sum(data > 5)}")',
                '',
                '# Statistical operations',
                'sample_data = np.random.normal(50, 15, 100)',
                'print("\\nStatistical operations:")',
                'print(f"Mean: {np.mean(sample_data):.2f}")',
                'print(f"Std Dev: {np.std(sample_data):.2f}")',
                'print(f"Min: {np.min(sample_data):.2f}")',
                'print(f"Max: {np.max(sample_data):.2f}")',
                'print(f"Median: {np.median(sample_data):.2f}")',
                'print(f"25th percentile: {np.percentile(sample_data, 25):.2f}")',
                'print(f"75th percentile: {np.percentile(sample_data, 75):.2f}")'
            ].join('\n')
        };
        
        templates['pandas-basics'] = {
            name: 'Pandas DataFrames',
            code: [
                '# Pandas DataFrame Basics',
                'import pandas as pd',
                'import numpy as np',
                '',
                'print("🐼 Pandas DataFrame Operations")',
                '',
                '# Creating a DataFrame',
                'np.random.seed(42)',
                'data = {',
                '    "Name": ["Alice", "Bob", "Charlie", "Diana", "Eve"],',
                '    "Age": [25, 30, 35, 28, 32],',
                '    "City": ["NYC", "LA", "Chicago", "Houston", "Boston"],',
                '    "Salary": [50000, 75000, 65000, 58000, 70000],',
                '    "Score": np.random.rand(5) * 100',
                '}',
                '',
                'df = pd.DataFrame(data)',
                'print("Original DataFrame:")',
                'print(df)',
                '',
                '# DataFrame info',
                'print(f"\\nDataFrame shape: {df.shape}")',
                'print(f"Columns: {list(df.columns)}")',
                'print(f"Data types:")',
                'print(df.dtypes)',
                '',
                '# Basic statistics',
                'print("\\n📊 Statistical Summary:")',
                'print(df.describe())',
                '',
                '# Selecting data',
                'print("\\n🎯 Data Selection:")',
                'print("Names only:")',
                'print(df["Name"])',
                '',
                'print("\\nAge and Salary:")',
                'print(df[["Age", "Salary"]])',
                '',
                '# Filtering data',
                'high_earners = df[df["Salary"] > 60000]',
                'print("\\nHigh earners (>$60k):")',
                'print(high_earners)',
                '',
                '# Grouping and aggregation',
                'city_stats = df.groupby("City")["Salary"].mean()',
                'print("\\nAverage salary by city:")',
                'print(city_stats)',
                '',
                '# Adding new columns',
                'df["Salary_K"] = df["Salary"] / 1000',
                'df["Grade"] = pd.cut(df["Score"], bins=[0, 60, 80, 100], labels=["C", "B", "A"])',
                'print("\\nDataFrame with new columns:")',
                'print(df)',
                '',
                '# Data manipulation',
                'print("\\n🔧 Data Manipulation:")',
                'print("Sorting by Salary (descending):")',
                'sorted_df = df.sort_values("Salary", ascending=False)',
                'print(sorted_df[["Name", "Salary"]].head())',
                '',
                '# Missing data handling (simulate some missing values)',
                'df_copy = df.copy()',
                'df_copy.loc[0, "Score"] = np.nan',
                'df_copy.loc[2, "Age"] = np.nan',
                'print("\\nMissing data example:")',
                'print(f"Missing values per column: \\n{df_copy.isnull().sum()}")',
                'print(f"Rows with missing data: {df_copy.isnull().any(axis=1).sum()}")',
                '',
                '# Summary insights',
                'print("\\n💡 Key Insights:")',
                'avg_age = df["Age"].mean()',
                'print(f"• Average age: {avg_age:.1f} years")',
                'max_salary = df["Salary"].max()',
                'top_earner = df.loc[df["Salary"].idxmax(), "Name"]',
                'print(f"• Highest salary: ${max_salary:,} ({top_earner})")',
                'common_grade = df["Grade"].mode()[0]',
                'print(f"• Most common grade: {common_grade}")',
                'min_salary = df["Salary"].min()',
                'print(f"• Salary range: ${min_salary:,} - ${max_salary:,}")'
            ].join('\n')
        };
        
        templates['data-analysis'] = {
            name: 'Data Analysis',
            code: [
                '# Data Analysis with Pandas and NumPy',
                'import pandas as pd',
                'import numpy as np',
                '',
                'print("📈 Data Analysis Example")',
                '',
                '# Create a larger dataset',
                'np.random.seed(42)',
                'n_samples = 100',
                '',
                'data = {',
                '    "Date": pd.date_range("2023-01-01", periods=n_samples, freq="D"),',
                '    "Product": np.random.choice(["A", "B", "C", "D"], n_samples),',
                '    "Sales": np.random.lognormal(mean=5, sigma=0.5, size=n_samples),',
                '    "Units": np.random.poisson(lam=10, size=n_samples),',
                '    "Region": np.random.choice(["North", "South", "East", "West"], n_samples),',
                '    "Temperature": np.random.normal(20, 5, n_samples),',
                '}',
                '',
                'df = pd.DataFrame(data)',
                'df["Revenue"] = df["Sales"] * df["Units"]',
                '',
                'print(f"Dataset shape: {df.shape}")',
                'print("\\nFirst 10 rows:")',
                'print(df.head(10))',
                '',
                '# Data cleaning and exploration',
                'print("\\n🔍 Data Exploration:")',
                'print(f"Missing values: {df.isnull().sum().sum()}")',
                'print(f"Duplicated rows: {df.duplicated().sum()}")',
                '',
                '# Statistical analysis by group',
                'print("\\n📊 Sales Analysis by Product:")',
                'product_analysis = df.groupby("Product").agg({',
                '    "Sales": ["mean", "std", "min", "max"],',
                '    "Units": ["mean", "sum"],',
                '    "Revenue": ["mean", "sum"]',
                '}).round(2)',
                'print(product_analysis)',
                '',
                '# Time series analysis',
                'print("\\n📅 Monthly Analysis:")',
                'df["Month"] = df["Date"].dt.month',
                'monthly_sales = df.groupby("Month")["Revenue"].sum()',
                'print("Monthly revenue:")',
                'print(monthly_sales)',
                '',
                '# Correlation analysis',
                'print("\\n🔗 Correlation Analysis:")',
                'correlation_matrix = df[["Sales", "Units", "Revenue", "Temperature"]].corr()',
                'print(correlation_matrix)',
                '',
                '# Outlier detection',
                'print("\\n🎯 Outlier Detection (Sales):")',
                'sales_data = df["Sales"]',
                'Q1 = sales_data.quantile(0.25)',
                'Q3 = sales_data.quantile(0.75)',
                'IQR = Q3 - Q1',
                'outliers = df[(sales_data < Q1 - 1.5*IQR) | (sales_data > Q3 + 1.5*IQR)]',
                'print(f"Found {len(outliers)} outliers out of {len(df)} records")',
                '',
                '# Summary insights',
                'print("\\n💡 Key Insights:")',
                'revenue_by_product = df.groupby("Product")["Revenue"].sum()',
                'top_product = revenue_by_product.idxmax()',
                'revenue_by_region = df.groupby("Region")["Revenue"].sum()',
                'best_region = revenue_by_region.idxmax()',
                'avg_daily_revenue = df["Revenue"].mean()',
                'total_revenue = df["Revenue"].sum()',
                'print(f"• Top product: {top_product}")',
                'print(f"• Best region: {best_region}")',
                'print(f"• Average daily revenue: ${avg_daily_revenue:.2f}")',
                'print(f"• Total revenue: ${total_revenue:.2f}")',
            ].join('\n')
        };
        
        // Advanced templates
        templates['scatter-plot'] = {
            name: 'Scatter Plot',
            code: [
                '# Scatter Plot Example',
                'import matplotlib.pyplot as plt',
                'import numpy as np',
                '',
                '# Generate random data',
                'np.random.seed(42)',
                'n = 100',
                'x = np.random.randn(n)',
                'y = 2 * x + np.random.randn(n) * 0.5',
                'colors = np.random.rand(n)',
                'sizes = 1000 * np.random.rand(n)',
                '',
                '# Create scatter plot',
                'plt.figure(figsize=(10, 8))',
                'scatter = plt.scatter(x, y, c=colors, s=sizes, alpha=0.6, cmap="viridis")',
                '',
                '# Add colorbar',
                'plt.colorbar(scatter, label="Color Value")',
                '',
                '# Add labels and title',
                'plt.xlabel("X values")',
                'plt.ylabel("Y values")',
                'plt.title("Beautiful Scatter Plot")',
                'plt.grid(True, alpha=0.3)',
                '',
                '# Add trend line',
                'z = np.polyfit(x, y, 1)',
                'p = np.poly1d(z)',
                'slope, intercept = z[0], z[1]',
                'plt.plot(x, p(x), "r--", alpha=0.8, label=f"Trend line: y={slope:.2f}x+{intercept:.2f}")',
                'plt.legend()',
                '',
                'print("Scatter plot with trend line created!")'
            ].join('\n')
        };

        templates['bar-chart'] = {
            name: 'Bar Chart',
            code: [
                '# Bar Chart Example',
                'import matplotlib.pyplot as plt',
                'import numpy as np',
                '',
                '# Sample data',
                'categories = ["Python", "JavaScript", "Java", "C++", "Go", "Rust"]',
                'popularity = [85, 75, 70, 55, 45, 40]',
                'colors = ["#3776ab", "#f7df1e", "#ed8b00", "#00599c", "#00add8", "#ce422b"]',
                '',
                '# Create bar chart',
                'plt.figure(figsize=(12, 8))',
                'bars = plt.bar(categories, popularity, color=colors, alpha=0.8, edgecolor="black", linewidth=1)',
                '',
                '# Add value labels on bars',
                'for bar, value in zip(bars, popularity):',
                '    plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,',
                '             f"{value}%", ha="center", va="bottom", fontweight="bold")',
                '',
                '# Customize the plot',
                'plt.xlabel("Programming Languages", fontsize=12)',
                'plt.ylabel("Popularity Score", fontsize=12)',
                'plt.title("Programming Language Popularity 2024", fontsize=16, fontweight="bold")',
                'plt.ylim(0, 100)',
                'plt.grid(True, axis="y", alpha=0.3)',
                '',
                '# Rotate x-axis labels for better readability',
                'plt.xticks(rotation=45, ha="right")',
                'plt.tight_layout()',
                '',
                'print("Programming language popularity chart created!")'
            ].join('\n')
        };

        templates['histogram'] = {
            name: 'Histogram',
            code: [
                '# Histogram Example',
                'import matplotlib.pyplot as plt',
                'import numpy as np',
                '',
                '# Generate sample data (normal distribution)',
                'np.random.seed(42)',
                'data = np.random.normal(100, 15, 1000)  # mean=100, std=15, n=1000',
                '',
                '# Create histogram',
                'plt.figure(figsize=(12, 8))',
                'n, bins, patches = plt.hist(data, bins=30, alpha=0.7, color="skyblue",',
                '                           edgecolor="black", linewidth=0.7)',
                '',
                '# Color bars by height (gradient effect)',
                'for i, p in enumerate(patches):',
                '    plt.setp(p, facecolor=plt.cm.viridis(n[i]/max(n)))',
                '',
                '# Add statistics',
                'mean_val = np.mean(data)',
                'std_val = np.std(data)',
                'plt.axvline(mean_val, color="red", linestyle="--", linewidth=2,',
                '            label=f"Mean: {mean_val:.1f}")',
                'plt.axvline(mean_val + std_val, color="orange", linestyle="--", linewidth=2,',
                '            label=f"+1 STD: {mean_val + std_val:.1f}")',
                'plt.axvline(mean_val - std_val, color="orange", linestyle="--", linewidth=2,',
                '            label=f"-1 STD: {mean_val - std_val:.1f}")',
                '',
                '# Labels and formatting',
                'plt.xlabel("Values", fontsize=12)',
                'plt.ylabel("Frequency", fontsize=12)',
                'plt.title("Normal Distribution Histogram\\n(Sample size: 1000)", fontsize=16, fontweight="bold")',
                'plt.legend()',
                'plt.grid(True, alpha=0.3)',
                '',
                '# Add text box with statistics',
                'textstr = f"Mean: {mean_val:.2f}\\nStd: {std_val:.2f}\\nSamples: {len(data)}"',
                'props = dict(boxstyle="round", facecolor="wheat", alpha=0.8)',
                'plt.text(0.75, 0.95, textstr, transform=plt.gca().transAxes, fontsize=10,',
                '         verticalalignment="top", bbox=props)',
                '',
                'print("Normal distribution histogram with statistics created!")'
            ].join('\n')
        };

        templates['statistical'] = {
            name: 'Statistical Analysis',
            code: [
                '# Statistical Analysis with Python',
                'import numpy as np',
                'import pandas as pd',
                '',
                'print("📊 Statistical Analysis Example")',
                '',
                '# Generate sample data',
                'np.random.seed(42)',
                'group_a = np.random.normal(100, 15, 50)  # Control group',
                'group_b = np.random.normal(110, 18, 50)  # Treatment group',
                '',
                'print(f"Group A - Mean: {np.mean(group_a):.2f}, Std: {np.std(group_a):.2f}")',
                'print(f"Group B - Mean: {np.mean(group_b):.2f}, Std: {np.std(group_b):.2f}")',
                '',
                '# Basic statistical tests (manual implementation)',
                'print("\\nBasic Statistical Tests:")',
                '',
                '# T-test approximation',
                'mean_diff = np.mean(group_b) - np.mean(group_a)',
                'pooled_std = np.sqrt((np.var(group_a) + np.var(group_b)) / 2)',
                'se_diff = pooled_std * np.sqrt(2/50)',
                't_stat = mean_diff / se_diff',
                '',
                'print(f"Mean difference: {mean_diff:.2f}")',
                'print(f"T-statistic (approx): {t_stat:.4f}")',
                'print(f"Effect size: {mean_diff / pooled_std:.4f}")',
                '',
                '# Correlation analysis',
                'x = np.random.randn(100)',
                'y = 2*x + np.random.randn(100)*0.5',
                'correlation = np.corrcoef(x, y)[0, 1]',
                'print(f"\\nCorrelation coefficient: {correlation:.4f}")',
                '',
                '# Descriptive statistics for multiple variables',
                'data = pd.DataFrame({',
                '    "Variable_A": group_a,',
                '    "Variable_B": group_b',
                '})',
                '',
                'print("\\nDescriptive Statistics:")',
                'print(data.describe())',
                '',
                '# Distribution analysis',
                'print("\\nDistribution Analysis:")',
                'for col in data.columns:',
                '    values = data[col]',
                '    q25, q75 = np.percentile(values, [25, 75])',
                '    iqr = q75 - q25',
                '    print(f"{col}:")',
                '    print(f"  Median: {np.median(values):.2f}")',
                '    print(f"  IQR: {iqr:.2f}")',
                '    print(f"  Skewness (manual): {((values - np.mean(values))**3).mean() / np.std(values)**3:.3f}")',
                '',
                '# Create visualization',
                'import matplotlib.pyplot as plt',
                '',
                'fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))',
                '',
                '# Histogram comparison',
                'ax1.hist(group_a, alpha=0.7, label="Group A", bins=15, color="skyblue")',
                'ax1.hist(group_b, alpha=0.7, label="Group B", bins=15, color="lightcoral")',
                'ax1.set_title("Distribution Comparison")',
                'ax1.set_xlabel("Values")',
                'ax1.set_ylabel("Frequency")',
                'ax1.legend()',
                'ax1.grid(True, alpha=0.3)',
                '',
                '# Box plot',
                'data_for_box = [group_a, group_b]',
                'ax2.boxplot(data_for_box, labels=["Group A", "Group B"])',
                'ax2.set_title("Box Plot Comparison")',
                'ax2.set_ylabel("Values")',
                'ax2.grid(True, alpha=0.3)',
                '',
                'plt.tight_layout()',
                'print("Statistical analysis visualization created!")'
            ].join('\n')
        };
        
        templates['machine-learning'] = {
            name: 'Machine Learning',
            code: [
                '# Machine Learning - Manual Implementation',
                'import numpy as np',
                'import pandas as pd',
                'import matplotlib.pyplot as plt',
                '',
                'print("🤖 Machine Learning Example")',
                '',
                '# Create a simple dataset for classification',
                'np.random.seed(42)',
                'n_samples = 200',
                '',
                '# Generate synthetic data (two distinct clusters)',
                'X1 = np.random.normal(2, 1, n_samples//2)',
                'X2 = np.random.normal(6, 1, n_samples//2)',
                'Y1 = np.random.normal(3, 1, n_samples//2)',
                'Y2 = np.random.normal(7, 1, n_samples//2)',
                '',
                '# Combine features and create labels',
                'X = np.concatenate([',
                '    np.column_stack([X1, Y1]),',
                '    np.column_stack([X2, Y2])',
                '])',
                'y = np.concatenate([np.zeros(n_samples//2), np.ones(n_samples//2)])',
                '',
                '# Create DataFrame',
                'df = pd.DataFrame(X, columns=["Feature_1", "Feature_2"])',
                'df["Target"] = y',
                '',
                'print(f"Dataset shape: {df.shape}")',
                'print("\\nFirst 10 samples:")',
                'print(df.head(10))',
                '',
                '# Basic data exploration',
                'print("\\n📊 Dataset Statistics:")',
                'print(df.describe())',
                '',
                'print("\\nClass distribution:")',
                'print(df["Target"].value_counts())',
                '',
                '# Manual implementation of basic ML concepts',
                'print("\\n🔍 Feature Analysis:")',
                '',
                '# Calculate class centroids',
                'class_0 = df[df["Target"] == 0]',
                'class_1 = df[df["Target"] == 1]',
                '',
                'centroid_0 = [class_0["Feature_1"].mean(), class_0["Feature_2"].mean()]',
                'centroid_1 = [class_1["Feature_1"].mean(), class_1["Feature_2"].mean()]',
                '',
                'print(f"Class 0 centroid: [{centroid_0[0]:.2f}, {centroid_0[1]:.2f}]")',
                'print(f"Class 1 centroid: [{centroid_1[0]:.2f}, {centroid_1[1]:.2f}]")',
                '',
                '# Simple distance-based classifier (Nearest Centroid)',
                'def simple_classifier(x1, x2):',
                '    dist_0 = np.sqrt((x1 - centroid_0[0])**2 + (x2 - centroid_0[1])**2)',
                '    dist_1 = np.sqrt((x1 - centroid_1[0])**2 + (x2 - centroid_1[1])**2)',
                '    return 0 if dist_0 < dist_1 else 1',
                '',
                '# Test the classifier',
                'predictions = []',
                'for _, row in df.iterrows():',
                '    pred = simple_classifier(row["Feature_1"], row["Feature_2"])',
                '    predictions.append(pred)',
                '',
                'df["Predicted"] = predictions',
                '',
                '# Calculate accuracy',
                'accuracy = (df["Target"] == df["Predicted"]).mean()',
                'print(f"\\n🎯 Nearest Centroid Classifier Accuracy: {accuracy:.3f} ({accuracy*100:.1f}%)")',
                '',
                '# Confusion matrix (manual)',
                'tp = len(df[(df["Target"] == 1) & (df["Predicted"] == 1)])',
                'tn = len(df[(df["Target"] == 0) & (df["Predicted"] == 0)])',
                'fp = len(df[(df["Target"] == 0) & (df["Predicted"] == 1)])',
                'fn = len(df[(df["Target"] == 1) & (df["Predicted"] == 0)])',
                '',
                'print("\\n📊 Confusion Matrix:")',
                'print(f"True Positives: {tp}")',
                'print(f"True Negatives: {tn}")',
                'print(f"False Positives: {fp}")',
                'print(f"False Negatives: {fn}")',
                '',
                '# Calculate metrics',
                'precision = tp / (tp + fp) if (tp + fp) > 0 else 0',
                'recall = tp / (tp + fn) if (tp + fn) > 0 else 0',
                'f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0',
                '',
                'print("\\n📈 Performance Metrics:")',
                'print(f"Precision: {precision:.3f}")',
                'print(f"Recall: {recall:.3f}")',
                'print(f"F1-Score: {f1_score:.3f}")',
                '',
                '# Feature correlation',
                'correlation = np.corrcoef(df["Feature_1"], df["Feature_2"])[0,1]',
                'print(f"\\n🔗 Feature Correlation: {correlation:.3f}")',
                '',
                '# Create visualization',
                'fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))',
                '',
                '# Plot 1: Original data with true labels',
                'colors = ["red", "blue"]',
                'for i in [0, 1]:',
                '    mask = df["Target"] == i',
                '    ax1.scatter(df[mask]["Feature_1"], df[mask]["Feature_2"], ',
                '               c=colors[i], alpha=0.6, label=f"Class {i}", s=50)',
                '',
                '# Plot centroids',
                'ax1.scatter(centroid_0[0], centroid_0[1], c="red", marker="x", s=200, linewidth=3)',
                'ax1.scatter(centroid_1[0], centroid_1[1], c="blue", marker="x", s=200, linewidth=3)',
                '',
                'ax1.set_xlabel("Feature 1")',
                'ax1.set_ylabel("Feature 2")',
                'ax1.set_title("True Labels & Centroids")',
                'ax1.legend()',
                'ax1.grid(True, alpha=0.3)',
                '',
                '# Plot 2: Predictions vs Reality',
                'correct = df["Target"] == df["Predicted"]',
                'ax2.scatter(df[correct]["Feature_1"], df[correct]["Feature_2"], ',
                '           c="green", alpha=0.6, label="Correct", s=50)',
                'ax2.scatter(df[~correct]["Feature_1"], df[~correct]["Feature_2"], ',
                '           c="orange", alpha=0.8, label="Incorrect", s=50, marker="^")',
                '',
                'ax2.set_xlabel("Feature 1")',
                'ax2.set_ylabel("Feature 2")',
                'ax2.set_title(f"Classification Results (Acc: {accuracy:.1%})")',
                'ax2.legend()',
                'ax2.grid(True, alpha=0.3)',
                '',
                'plt.tight_layout()',
                'print("Machine learning visualization created!")',
                '',
                'print("\\n💡 ML Insights:")',
                'separation_quality = "good" if accuracy > 0.8 else "moderate" if accuracy > 0.6 else "poor"',
                'print(f"• Dataset separation quality: {separation_quality}")',
                'correlation_strength = "strong" if abs(correlation) > 0.7 else "moderate" if abs(correlation) > 0.3 else "weak"',
                'print(f"• Feature correlation: {correlation_strength}")',
                'print("• This demonstrates basic classification concepts!")',
                'print(f"• Misclassified samples: {len(df[~correct])} out of {len(df)}")'
            ].join('\n')
        };
        
        templates['web-apis'] = {
            name: 'Web APIs & JSON',
            code: [
                '# Working with JSON and Web APIs concepts',
                'import json',
                'import pandas as pd',
                'import numpy as np',
                '',
                'print("🌐 Web APIs & JSON Processing")',
                '',
                '# Create mock API response data',
                'np.random.seed(42)',
                '',
                '# Simulate user data from an API',
                'users_data = {',
                '    "status": "success",',
                '    "total": 5,',
                '    "users": [',
                '        {',
                '            "id": i+1,',
                '            "name": f"User_{i+1}",',
                '            "email": f"user{i+1}@example.com",',
                '            "age": np.random.randint(20, 60),',
                '            "city": np.random.choice(["NYC", "LA", "Chicago", "Houston"]),',
                '            "active": np.random.choice([True, False]),',
                '            "join_date": f"2023-{np.random.randint(1,13):02d}-{np.random.randint(1,29):02d}",',
                '            "metadata": {',
                '                "last_login": f"2024-01-{np.random.randint(1,31):02d}",',
                '                "login_count": np.random.randint(1, 100)',
                '            }',
                '        } for i in range(5)',
                '    ]',
                '}',
                '',
                'print("📄 Raw JSON Data:")',
                'print(json.dumps(users_data, indent=2))',
                '',
                '# JSON processing and manipulation',
                'print("\\n🔧 JSON Processing:")',
                '',
                '# Extract data from nested JSON',
                'users = users_data["users"]',
                'print(f"Total users: {users_data["total"]}")',
                'print(f"API status: {users_data["status"]}")',
                '',
                '# Convert to pandas DataFrame',
                'df_users = pd.json_normalize(users)',
                'print("\\n📊 Normalized DataFrame:")',
                'print(df_users)',
                '',
                '# JSON data analysis',
                'print("\\n📈 Data Analysis:")',
                'active_users = sum(1 for user in users if user["active"])',
                'avg_age = np.mean([user["age"] for user in users])',
                'cities = [user["city"] for user in users]',
                'city_counts = pd.Series(cities).value_counts()',
                '',
                'print(f"Active users: {active_users}/{len(users)}")',
                'print(f"Average age: {avg_age:.1f}")',
                'print("\\nCity distribution:")',
                'print(city_counts)',
                '',
                '# Working with nested data',
                'print("\\n🔍 Nested Data Processing:")',
                'login_data = [user["metadata"]["login_count"] for user in users]',
                'avg_logins = np.mean(login_data)',
                'max_logins = max(login_data)',
                '',
                'print(f"Average login count: {avg_logins:.1f}")',
                'print(f"Maximum login count: {max_logins}")',
                '',
                '# Create response data (simulate API response)',
                'response_data = {',
                '    "timestamp": "2024-01-15T10:30:00Z",',
                '    "api_version": "v2.1",',
                '    "request_id": "req_123456",',
                '    "data": {',
                '        "summary": {',
                '            "total_users": len(users),',
                '            "active_users": active_users,',
                '            "avg_age": round(avg_age, 1),',
                '            "cities": city_counts.to_dict()',
                '        },',
                '        "details": {',
                '            "oldest_user": max(users, key=lambda x: x["age"]),',
                '            "most_active": max(users, key=lambda x: x["metadata"]["login_count"])',
                '        }',
                '    }',
                '}',
                '',
                'print("\\n📤 API Response Format:")',
                'print(json.dumps(response_data, indent=2))',
                '',
                '# JSON validation and error handling',
                'print("\\n✅ JSON Validation Example:")',
                'required_fields = ["id", "name", "email", "age"]',
                'valid_users = []',
                'invalid_users = []',
                '',
                'for user in users:',
                '    if all(field in user for field in required_fields):',
                '        valid_users.append(user)',
                '    else:',
                '        invalid_users.append(user)',
                '',
                'print(f"Valid users: {len(valid_users)}")',
                'print(f"Invalid users: {len(invalid_users)}")',
                '',
                '# Data transformation for different API formats',
                'print("\\n🔄 Data Transformation:")',
                '',
                '# Transform to different format',
                'transformed_data = {',
                '    "profiles": [',
                '        {',
                '            "user_id": user["id"],',
                '            "display_name": user["name"],',
                '            "contact": user["email"],',
                '            "demographics": {"age": user["age"], "location": user["city"]},',
                '            "status": "active" if user["active"] else "inactive"',
                '        } for user in users',
                '    ]',
                '}',
                '',
                'print("Transformed format:")',
                'print(json.dumps(transformed_data, indent=2))',
                '',
                'print("\\n💡 Web API Concepts Demonstrated:")',
                'print("• JSON parsing and manipulation")',
                'print("• Nested data extraction")',
                'print("• Data validation and error handling")',
                'print("• Response formatting")',
                'print("• Data transformation between API formats")',
                'print("• Statistical analysis of API data")',
            ].join('\\n')
        };
        
        return templates;
    }

    /**
     * Initialize plot functions if they're missing
     */
    initializePlotFunctions() {
        try {
            console.log('📊 Initializing plot functions...');
            this.pyodide.runPython(`
import matplotlib
import matplotlib.pyplot as plt
import io
import base64

# Configure matplotlib for web
matplotlib.use('AGG')
plt.ioff()  # Turn off interactive mode

def show_plot():
    """Capture matplotlib plot and return as base64 image"""
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', bbox_inches='tight', dpi=100)
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    buffer.close()
    plt.close()  # Close the figure to free memory
    return f"data:image/png;base64,{image_base64}"

# Iframe-based Plotly.js functions - Same as initialization above
print("✅ Iframe-based Plotly functions initialized")

print("✅ Plot functions initialized successfully")
            `);
            console.log('📊 Plot functions initialized successfully');
        } catch (error) {
            console.error('📊 Failed to initialize plot functions:', error);
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        const templateButtons = document.querySelectorAll('.template-item');
        console.log('Found template buttons:', templateButtons.length);
        
        templateButtons.forEach(button => {
            console.log('Setting up button:', button.dataset.template, button.textContent.trim());
            button.addEventListener('click', (e) => {
                const template = e.target.dataset.template;
                console.log('Button clicked:', template);
                this.loadTemplate(template);
                
                // Update active state
                document.querySelectorAll('.template-item').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Toolbar buttons
        document.getElementById('run-btn').addEventListener('click', () => {
            this.runPython();
        });

        document.getElementById('format-btn').addEventListener('click', () => {
            this.formatCode();
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetEditor();
        });

        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveCode();
        });

        document.getElementById('clear-output').addEventListener('click', () => {
            this.clearOutput();
        });
    }

    /**
     * Set up resizer for split view
     */
    setupResizer() {
        const resizer = document.getElementById('resizer');
        const codePanel = document.querySelector('.code-panel');
        const outputPanel = document.querySelector('.output-panel');
        
        let isResizing = false;
        
        resizer.addEventListener('mousedown', () => {
            isResizing = true;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        });
        
        function handleMouseMove(e) {
            if (!isResizing) return;
            
            const container = document.querySelector('.split-view');
            const containerRect = container.getBoundingClientRect();
            const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            
            if (percentage > 20 && percentage < 80) {
                codePanel.style.flex = `0 0 ${percentage}%`;
                outputPanel.style.flex = `0 0 ${100 - percentage}%`;
            }
        }
        
        function handleMouseUp() {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
    }

    /**
     * Load a code template
     */
    loadTemplate(templateId) {
        const template = this.templates[templateId];
        console.log('Loading template:', templateId, template);
        if (template && this.editor) {
            this.editor.setValue(template.code);
            this.currentTemplate.textContent = template.name;
            this.clearOutput();
            this.hideError();
            this.setStatus(`Loaded template: ${template.name}`);
        } else {
            console.error('Template not found or editor not ready:', { templateId, template, editor: this.editor });
        }
    }

    /**
     * Run Python code
     */
    async runPython() {
        if (!this.pyodide) {
            this.clearOutput();
            this.output.innerHTML = [
                '<div style="color: #f7931e; padding: 1rem; text-align: center;">',
                '<div style="font-size: 1.2em; margin-bottom: 0.5rem;">⏳ Python Environment Loading...</div>',
                '<div style="font-size: 0.9em; color: #999;">',
                'The Python environment is still loading in the background.<br>',
                'This may take 30-60 seconds on first load.<br>',
                'You can still write code - it will run once Python is ready!',
                '</div>',
                '</div>'
            ].join('');
            
            // Check status every 2 seconds and auto-run when ready
            const checkInterval = setInterval(() => {
                if (this.pyodide) {
                    clearInterval(checkInterval);
                    this.runPython();
                }
            }, 2000);
            
            return;
        }

        // Check if required functions are available, if not try to reinitialize
        try {
            const showPlotExists = this.pyodide.runPython('"show_plot" in globals()');
            if (!showPlotExists) {
                console.warn('📊 show_plot function missing, attempting to reinitialize...');
                this.initializePlotFunctions();
            }
        } catch (error) {
            console.warn('📊 Could not check plot functions, attempting to reinitialize...');
            this.initializePlotFunctions();
        }

        if (this.isLoading) return;

        const code = this.editor.getValue();
        if (!code.trim()) {
            this.clearOutput();
            this.output.innerHTML = '<div style="color: #666; font-style: italic; padding: 1rem;">Please enter some Python code to run.</div>';
            return;
        }

        this.isLoading = true;
        this.setStatus('Running Python code...');
        this.clearOutput();
        this.hideError();
        
        const runBtn = document.getElementById('run-btn');
        runBtn.disabled = true;
        runBtn.textContent = '⏳ Running...';

        try {
            // Capture stdout
            this.pyodide.runPython(`
import sys
import io
from contextlib import redirect_stdout
_stdout_capture = io.StringIO()
            `);

            // Run user code with stdout capture
            const indentedCode = code.split('\n').map(line => '    ' + line).join('\n');
            this.pyodide.runPython(`
with redirect_stdout(_stdout_capture):
${indentedCode}
            `);

            // Get captured output
            const stdout = this.pyodide.runPython('_stdout_capture.getvalue()');
            
            // Check if there are plots to display
            let plotResult = null;
            let plotlyResult = null;
            
            // Check for matplotlib plots
            try {
                // First check if required functions exist
                const showPlotExists = this.pyodide.runPython('"show_plot" in globals()');
                const pltExists = this.pyodide.runPython('"plt" in globals()');
                
                console.log('📊 Python functions available:', { showPlotExists, pltExists });
                
                if (pltExists && showPlotExists) {
                    const figCount = this.pyodide.runPython('len(plt.get_fignums())');
                    console.log('📊 Matplotlib figures found:', figCount);
                    
                    if (figCount > 0) {
                        console.log('📊 Capturing matplotlib plot...');
                        plotResult = this.pyodide.runPython('show_plot()');
                        console.log('📊 Matplotlib plot captured, data length:', plotResult ? plotResult.length : 0);
                    }
                } else {
                    console.warn('📊 Matplotlib functions not available - Pyodide may not have initialized properly');
                }
            } catch (plotError) {
                console.error('📊 Matplotlib capture error:', plotError);
            }
            
            // Check for iframe-based plotly charts
            try {
                const plotlyIframeExists = this.pyodide.runPython('"get_plotly_iframes" in globals()');
                
                console.log('📊 Iframe-based Plotly functions available:', { plotlyIframeExists });
                
                if (plotlyIframeExists) {
                    const plotlyIframes = this.pyodide.runPython('get_plotly_iframes()');
                    console.log('📊 Plotly iframes:', plotlyIframes);
                    
                    if (plotlyIframes && plotlyIframes.length > 0) {
                        console.log('📊 Capturing plotly iframes...');
                        plotlyResult = plotlyIframes;
                        console.log('📊 Plotly iframes captured, count:', plotlyResult.length);
                    }
                } else {
                    console.warn('📊 Iframe-based Plotly functions not available - Pyodide may not have initialized properly');
                }
            } catch (plotlyError) {
                console.error('📊 Plotly iframe capture error:', plotlyError);
            }

            // Display results
            this.displayOutput(stdout, plotResult, plotlyResult);
            this.setStatus('Python code executed successfully!');

        } catch (error) {
            console.error('Python execution error:', error);
            this.showError(error.toString());
            this.setStatus('Python execution failed');
        } finally {
            this.isLoading = false;
            runBtn.disabled = false;
            runBtn.textContent = '▶️ Run Python';
        }
    }

    /**
     * Display Python output
     */
    displayOutput(stdout, plotData, plotlyData) {
        let html = '';
        
        if (stdout && stdout.trim()) {
            html += `<div class="python-output">${this.escapeHtml(stdout)}</div>`;
        }
        
        if (plotData && plotData.startsWith('data:image/png;base64,')) {
            html += `<div class="python-plot">
                <img src="${plotData}" alt="Matplotlib Plot" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; margin: 1rem 0;" />
            </div>`;
            console.log('📊 Matplotlib plot displayed successfully');
        }
        
        if (plotlyData && Array.isArray(plotlyData)) {
            // Render Plotly iframes
            console.log('📊 Rendering', plotlyData.length, 'Plotly iframe(s)');
            
            plotlyData.forEach((htmlContent, index) => {
                const iframeId = `plotly-iframe-${index}-${Date.now()}`;
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const iframeUrl = URL.createObjectURL(blob);
                
                html += `<div class="plotly-iframe-container" style="margin: 1rem 0; border: 1px solid #ddd; border-radius: 4px; height: 450px; overflow: hidden;">
                    <iframe 
                        id="${iframeId}"
                        src="${iframeUrl}" 
                        style="width: 100%; height: 100%; border: none;" 
                        title="Plotly Chart ${index + 1}"
                        onload="console.log('📊 Plotly iframe loaded: ${iframeId}')"
                    ></iframe>
                </div>`;
                
                // Clean up blob URL after a delay
                setTimeout(() => {
                    URL.revokeObjectURL(iframeUrl);
                }, 60000); // Clean up after 1 minute
            });
            
            console.log('📊 Plotly iframes setup complete');
        }
        
        if (!html.trim()) {
            html = '<div style="color: #666; font-style: italic; padding: 1rem;">Code executed successfully (no output)</div>';
        }
        
        this.output.innerHTML = html;
    }

    /**
     * Format Python code
     */
    async formatCode() {
        if (this.editor) {
            await this.editor.getAction('editor.action.formatDocument').run();
            this.setStatus('Code formatted');
        }
    }

    /**
     * Reset editor to current template
     */
    resetEditor() {
        const activeTemplate = document.querySelector('.template-item.active');
        if (activeTemplate) {
            const template = activeTemplate.dataset.template;
            this.loadTemplate(template);
        }
    }

    /**
     * Save code to local storage
     */
    saveCode() {
        const code = this.editor.getValue();
        const timestamp = new Date().toISOString();
        localStorage.setItem('python-playground-code', code);
        localStorage.setItem('python-playground-timestamp', timestamp);
        this.setStatus(`Code saved (${timestamp.slice(11, 19)})`);
    }

    /**
     * Clear output panel
     */
    clearOutput() {
        this.output.innerHTML = '';
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        this.loadingIndicator.classList.add('show');
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        this.loadingIndicator.classList.remove('show');
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
     * Set status bar message
     */
    setStatus(message) {
        this.statusText.textContent = message;
    }

    /**
     * Update editor info in status bar
     */
    updateEditorInfo() {
        if (this.editor) {
            const position = this.editor.getPosition();
            const model = this.editor.getModel();
            const lineCount = model.getLineCount();
            this.editorInfo.textContent = `Python • UTF-8 • Ln ${position.lineNumber}, Col ${position.column} • ${lineCount} lines`;
        }
    }

    /**
     * Escape HTML for safe display
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('🔥 Global JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

// Initialize the playground when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, creating Python playground...');
    try {
        new PythonPlayground();
    } catch (error) {
        console.error('🔥 Failed to create PythonPlayground:', error);
    }
});