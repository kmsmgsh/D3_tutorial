/**
 * Chart Builder - Main Application Controller
 * Orchestrates data loading, UI interactions, and chart generation
 */

// Import required modules
import { DataManager } from './modules/data-manager.js';
import { DragDropManager } from './modules/drag-drop.js';
import { ChartRenderer } from './modules/chart-renderer.js';
import { SpecBuilder } from './modules/spec-builder.js';
import { UIComponents } from './modules/ui-components.js';

class ChartBuilder {
    constructor() {
        this.dataManager = new DataManager();
        this.dragDropManager = new DragDropManager();
        this.chartRenderer = new ChartRenderer();
        this.specBuilder = new SpecBuilder();
        this.uiComponents = new UIComponents();
        
        this.currentData = null;
        this.currentMappings = {
            x: null,
            y: null,
            color: null,
            size: null
        };
        this.currentChartType = 'bar';
        this.chartConfig = {
            title: '',
            width: 600,
            height: 400
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStatus('Ready to build charts');
    }

    setupEventListeners() {
        // Data upload
        this.setupDataUpload();
        
        // Sample data buttons
        this.setupSampleData();
        
        // Chart type selection
        this.setupChartTypeSelection();
        
        // Configuration inputs
        this.setupConfiguration();
        
        // Preview actions
        this.setupPreviewActions();
        
        // Status bar actions
        this.setupStatusActions();
        
        // Spec tabs
        this.setupSpecTabs();
    }

    setupDataUpload() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');

        // Click to upload
        uploadArea.addEventListener('click', () => fileInput.click());

        // File selection
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                this.handleFileUpload(e.dataTransfer.files[0]);
            }
        });
    }

    setupSampleData() {
        document.querySelectorAll('.sample-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const sampleType = btn.dataset.sample;
                this.loadSampleData(sampleType);
            });
        });
    }

    setupChartTypeSelection() {
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                document.querySelectorAll('.chart-type-btn').forEach(b => 
                    b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Update current chart type
                this.currentChartType = btn.dataset.type;
                this.updateChart();
                
                this.updateStatus(`Chart type changed to ${this.currentChartType}`);
            });
        });
    }

    setupConfiguration() {
        ['chart-title', 'chart-width', 'chart-height'].forEach(id => {
            const input = document.getElementById(id);
            input.addEventListener('input', () => {
                const key = id.replace('chart-', '');
                if (key === 'width' || key === 'height') {
                    this.chartConfig[key] = parseInt(input.value);
                } else {
                    this.chartConfig[key] = input.value;
                }
                this.updateChart();
            });
        });
    }

    setupPreviewActions() {
        document.getElementById('refresh-chart').addEventListener('click', () => {
            this.updateChart();
            this.updateStatus('Chart refreshed');
        });

        document.getElementById('export-json').addEventListener('click', () => {
            this.exportSpecification();
        });

        document.getElementById('download-chart').addEventListener('click', () => {
            this.downloadChart();
        });
    }

    setupStatusActions() {
        document.getElementById('clear-all').addEventListener('click', () => {
            this.clearAll();
        });

        document.getElementById('save-project').addEventListener('click', () => {
            this.saveProject();
        });
    }

    setupSpecTabs() {
        document.querySelectorAll('.spec-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Update tab active state
                document.querySelectorAll('.spec-tab').forEach(t => 
                    t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update spec display
                this.updateSpecDisplay(tab.dataset.tab);
            });
        });
    }

    async handleFileUpload(file) {
        this.updateStatus('Loading data...');
        
        try {
            const data = await this.dataManager.parseFile(file);
            this.loadData(data, file.name);
            this.updateStatus(`Loaded ${data.length} rows from ${file.name}`);
        } catch (error) {
            console.error('Error loading file:', error);
            this.updateStatus(`Error loading file: ${error.message}`, 'error');
        }
    }

    async loadSampleData(sampleType) {
        this.updateStatus('Loading sample data...');
        
        try {
            const data = await this.dataManager.loadSampleData(sampleType);
            this.loadData(data, `Sample: ${sampleType}`);
            this.updateStatus(`Loaded ${data.length} rows of ${sampleType} data`);
        } catch (error) {
            console.error('Error loading sample data:', error);
            this.updateStatus(`Error loading sample data: ${error.message}`, 'error');
        }
    }

    loadData(data, sourceName) {
        this.currentData = data;
        
        // Show data preview section
        document.getElementById('data-preview-section').style.display = 'block';
        
        // Update data info
        document.getElementById('data-rows-count').textContent = `${data.length} rows`;
        document.getElementById('data-cols-count').textContent = 
            `${Object.keys(data[0] || {}).length} columns`;
        
        // Render data table
        this.renderDataTable(data);
        
        // Render column list
        this.renderColumnList(data);
        
        // Initialize drag and drop for columns
        this.dragDropManager.initColumnDragDrop();
        
        // Clear existing mappings
        this.clearMappings();
        
        // Update chart
        this.updateChart();
    }

    renderDataTable(data) {
        const table = document.getElementById('data-table');
        const thead = document.getElementById('data-table-head');
        const tbody = document.getElementById('data-table-body');
        
        if (!data || data.length === 0) return;
        
        const columns = Object.keys(data[0]);
        
        // Render header
        thead.innerHTML = `<tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr>`;
        
        // Render first 10 rows
        const rows = data.slice(0, 10).map(row => 
            `<tr>${columns.map(col => `<td>${row[col] || ''}</td>`).join('')}</tr>`
        ).join('');
        
        tbody.innerHTML = rows;
        
        // Add "..." row if more data exists
        if (data.length > 10) {
            const ellipsisRow = `<tr class="ellipsis-row">${columns.map(() => '<td>...</td>').join('')}</tr>`;
            tbody.innerHTML += ellipsisRow;
        }
    }

    renderColumnList(data) {
        const columnsList = document.getElementById('columns-list');
        
        if (!data || data.length === 0) {
            columnsList.innerHTML = '<p>No data loaded</p>';
            return;
        }
        
        const columns = Object.keys(data[0]);
        columnsList.innerHTML = columns.map(column => {
            const type = this.dataManager.inferColumnType(data, column);
            return `
                <div class="column-item" draggable="true" data-column="${column}" data-type="${type}">
                    <div class="column-name">${column}</div>
                    <div class="column-type">${type}</div>
                </div>
            `;
        }).join('');
    }

    updateMapping(encoding, column, type) {
        this.currentMappings[encoding] = { column, type };
        
        // Update UI
        const zoneContent = document.querySelector(`[data-encoding="${encoding}"]`);
        zoneContent.classList.add('has-column');
        zoneContent.innerHTML = `
            <div class="mapped-column">
                <div class="column-name">${column}</div>
                <div class="column-type">${type}</div>
                <button class="remove-mapping" onclick="chartBuilder.removeMapping('${encoding}')">&times;</button>
            </div>
        `;
        
        this.updateChart();
        this.updateStatus(`Mapped ${column} to ${encoding}`);
    }

    removeMapping(encoding) {
        this.currentMappings[encoding] = null;
        
        // Update UI
        const zoneContent = document.querySelector(`[data-encoding="${encoding}"]`);
        zoneContent.classList.remove('has-column');
        zoneContent.innerHTML = `<div class="zone-placeholder">Drop column here</div>`;
        
        this.updateChart();
        this.updateStatus(`Removed ${encoding} mapping`);
    }

    clearMappings() {
        Object.keys(this.currentMappings).forEach(encoding => {
            this.removeMapping(encoding);
        });
    }

    updateChart() {
        if (!this.currentData || !this.currentMappings.x || !this.currentMappings.y) {
            this.showChartPlaceholder();
            this.updateSpecDisplay('preview');
            return;
        }
        
        try {
            // Generate Vega-Lite specification
            const spec = this.specBuilder.buildSpec({
                data: this.currentData,
                chartType: this.currentChartType,
                mappings: this.currentMappings,
                config: this.chartConfig
            });
            
            // Render chart
            this.chartRenderer.render('chart-container', spec);
            
            // Update spec display
            this.updateSpecDisplay('preview');
            
        } catch (error) {
            console.error('Error updating chart:', error);
            this.updateStatus(`Error updating chart: ${error.message}`, 'error');
        }
    }

    showChartPlaceholder() {
        const container = document.getElementById('chart-container');
        container.innerHTML = `
            <div class="chart-placeholder">
                <div class="placeholder-icon">📊</div>
                <p>Upload data and configure mappings to preview chart</p>
            </div>
        `;
    }

    updateSpecDisplay(tabType) {
        const display = document.getElementById('spec-display');
        
        if (!this.currentData || !this.currentMappings.x || !this.currentMappings.y) {
            display.textContent = 'Configure chart to see specification';
            return;
        }
        
        try {
            let content = '';
            
            switch (tabType) {
                case 'vega':
                    const vegaSpec = this.specBuilder.buildSpec({
                        data: this.currentData,
                        chartType: this.currentChartType,
                        mappings: this.currentMappings,
                        config: this.chartConfig
                    });
                    content = JSON.stringify(vegaSpec, null, 2);
                    break;
                    
                case 'full':
                    const fullSpec = this.specBuilder.buildFullSpec({
                        data: this.currentData,
                        chartType: this.currentChartType,
                        mappings: this.currentMappings,
                        config: this.chartConfig
                    });
                    content = JSON.stringify(fullSpec, null, 2);
                    break;
                    
                case 'preview':
                default:
                    content = this.generateSpecPreview();
                    break;
            }
            
            display.textContent = content;
        } catch (error) {
            display.textContent = `Error generating specification: ${error.message}`;
        }
    }

    generateSpecPreview() {
        const mappings = Object.entries(this.currentMappings)
            .filter(([_, value]) => value !== null)
            .map(([key, value]) => `${key}: ${value.column} (${value.type})`)
            .join('\n');
            
        return `Chart Type: ${this.currentChartType}
Title: ${this.chartConfig.title || 'Untitled'}
Dimensions: ${this.chartConfig.width}×${this.chartConfig.height}
Data: ${this.currentData?.length || 0} rows

Mappings:
${mappings}`;
    }

    exportSpecification() {
        if (!this.currentData || !this.currentMappings.x || !this.currentMappings.y) {
            this.updateStatus('Cannot export: incomplete chart configuration', 'error');
            return;
        }
        
        try {
            const fullSpec = this.specBuilder.buildFullSpec({
                data: this.currentData,
                chartType: this.currentChartType,
                mappings: this.currentMappings,
                config: this.chartConfig
            });
            
            // Create and download file
            const blob = new Blob([JSON.stringify(fullSpec, null, 2)], 
                { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `chart-spec-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.updateStatus('Chart specification exported');
        } catch (error) {
            console.error('Error exporting specification:', error);
            this.updateStatus(`Error exporting: ${error.message}`, 'error');
        }
    }

    downloadChart() {
        // This would implement chart download as PNG/SVG
        // For now, show a placeholder message
        this.updateStatus('Chart download feature coming soon');
    }

    saveProject() {
        // This would save the entire project state
        this.updateStatus('Project save feature coming soon');
    }

    clearAll() {
        if (confirm('Are you sure you want to clear all data and mappings?')) {
            this.currentData = null;
            this.clearMappings();
            document.getElementById('data-preview-section').style.display = 'none';
            this.showChartPlaceholder();
            this.updateSpecDisplay('preview');
            this.updateStatus('All data cleared');
        }
    }

    updateStatus(message, type = 'info') {
        const statusMessage = document.getElementById('status-message');
        statusMessage.textContent = message;
        statusMessage.className = `status-${type}`;
        
        // Clear status after 5 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                statusMessage.textContent = 'Ready';
                statusMessage.className = '';
            }, 5000);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chartBuilder = new ChartBuilder();
});

export default ChartBuilder;