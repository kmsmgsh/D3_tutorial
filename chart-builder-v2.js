/**
 * Chart Builder 2.0 - Data Formulator Inspired Interface
 * Advanced chart creation with natural language and visual encoding
 */

import { DataManager } from './modules/data-manager.js';
import { ChartRenderer } from './modules/chart-renderer.js';
import { SpecBuilder } from './modules/spec-builder.js';
import embed from 'vega-embed';

class ChartBuilderV2 {
    constructor() {
        this.dataManager = new DataManager();
        this.chartRenderer = new ChartRenderer();
        this.specBuilder = new SpecBuilder();
        
        this.currentData = null;
        this.currentThread = 1;
        this.threads = new Map();
        this.fieldMappings = {
            x: null,
            y: null,
            color: null,
            detail: null,
            opacity: null
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeUI();
        this.updateStatus('Chart Builder 2.0 Ready');
    }

    initializeUI() {
        // Initialize first thread
        this.threads.set(1, {
            id: 1,
            data: null,
            mappings: { ...this.fieldMappings },
            chartType: 'bar',
            title: 'New Chart',
            nlInstructions: ''
        });
    }

    setupEventListeners() {
        // File upload
        this.setupDataUpload();
        
        // Field selectors
        this.setupFieldSelectors();
        
        // Natural language input
        this.setupNaturalLanguageInput();
        
        // Thread management
        this.setupThreadManagement();
        
        // Navigation
        this.setupNavigation();
    }

    setupDataUpload() {
        const uploadArea = document.getElementById('upload-area-v2');
        const fileInput = document.getElementById('file-input-v2');

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
            uploadArea.style.borderColor = '#4285f4';
            uploadArea.style.background = '#f8fbff';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.background = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.background = '';
            
            if (e.dataTransfer.files.length > 0) {
                this.handleFileUpload(e.dataTransfer.files[0]);
            }
        });
    }

    setupFieldSelectors() {
        const selectors = ['x-axis-select', 'y-axis-select', 'detail-select', 'color-select', 'opacity-select'];
        
        selectors.forEach(selectorId => {
            const select = document.getElementById(selectorId);
            const encoding = selectorId.replace('-select', '').replace('-axis', '');
            
            select.addEventListener('change', (e) => {
                this.updateFieldMapping(encoding, e.target.value);
            });
        });
    }

    setupNaturalLanguageInput() {
        const nlTextarea = document.getElementById('nl-instructions');
        const generateBtn = document.querySelector('.nl-submit-btn');

        generateBtn.addEventListener('click', () => {
            const instructions = nlTextarea.value.trim();
            if (instructions) {
                this.processNaturalLanguageInput(instructions);
            }
        });

        // Enter key to generate
        nlTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                generateBtn.click();
            }
        });
    }

    setupThreadManagement() {
        const addThreadBtn = document.querySelector('.add-thread-btn');
        
        addThreadBtn.addEventListener('click', () => {
            this.createNewThread();
        });

        // Thread selection
        document.addEventListener('click', (e) => {
            const threadItem = e.target.closest('.thread-item');
            if (threadItem) {
                const threadId = parseInt(threadItem.dataset.thread);
                this.selectThread(threadId);
            }
        });
    }

    setupNavigation() {
        // Back button
        document.querySelector('.back-btn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Export button
        document.querySelector('.nav-btn').addEventListener('click', () => {
            this.exportCurrentChart();
        });

        // Workflow steps
        document.querySelectorAll('.step').forEach(step => {
            step.addEventListener('click', () => {
                this.activateStep(step.dataset.step);
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
            this.updateStatus(`Error loading file: ${error.message}`);
        }
    }

    loadData(data, sourceName) {
        this.currentData = data;
        
        // Update current thread
        const thread = this.threads.get(this.currentThread);
        thread.data = data;
        thread.sourceName = sourceName;
        
        // Populate field selectors
        this.populateFieldSelectors(data);
        
        // Update data view
        this.updateDataView(data);
        
        // Update data fields panel
        this.updateDataFieldsPanel(data);
        
        // Auto-suggest mappings based on data
        this.suggestFieldMappings(data);
    }

    populateFieldSelectors(data) {
        if (!data || data.length === 0) return;
        
        const columns = Object.keys(data[0]);
        const selectors = ['x-axis-select', 'y-axis-select', 'detail-select', 'color-select', 'opacity-select'];
        
        selectors.forEach(selectorId => {
            const select = document.getElementById(selectorId);
            select.innerHTML = '<option value="">Select field...</option>';
            
            columns.forEach(column => {
                const option = document.createElement('option');
                option.value = column;
                option.textContent = column;
                select.appendChild(option);
            });
        });
    }

    updateDataFieldsPanel(data) {
        if (!data || data.length === 0) return;
        
        const dataFieldsContainer = document.getElementById('data-fields');
        const columns = Object.keys(data[0]);
        
        dataFieldsContainer.innerHTML = '';
        
        columns.forEach(column => {
            const type = this.dataManager.inferColumnType(data, column);
            const fieldItem = document.createElement('div');
            fieldItem.className = 'field-item';
            fieldItem.draggable = true;
            fieldItem.dataset.field = column;
            fieldItem.dataset.type = type;
            
            const typeIcon = this.getTypeIcon(type);
            
            fieldItem.innerHTML = `
                <div class="field-info">
                    <span class="field-name">${column}</span>
                    <span class="field-type">${typeIcon}</span>
                </div>
            `;
            
            // Add drag functionality
            this.addDragFunctionality(fieldItem);
            
            dataFieldsContainer.appendChild(fieldItem);
        });
    }

    getTypeIcon(type) {
        const icons = {
            quantitative: '📊',
            temporal: '📅',
            ordinal: '📋',
            nominal: '🏷️'
        };
        return icons[type] || '📄';
    }

    addDragFunctionality(fieldItem) {
        fieldItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                field: fieldItem.dataset.field,
                type: fieldItem.dataset.type
            }));
            fieldItem.style.opacity = '0.5';
        });

        fieldItem.addEventListener('dragend', () => {
            fieldItem.style.opacity = '1';
        });
    }

    suggestFieldMappings(data) {
        if (!data || data.length === 0) return;
        
        const columns = Object.keys(data[0]);
        
        // Auto-suggest x-axis (first temporal or nominal column)
        const temporalCol = columns.find(col => 
            this.dataManager.inferColumnType(data, col) === 'temporal'
        );
        const nominalCol = columns.find(col => 
            this.dataManager.inferColumnType(data, col) === 'nominal'
        );
        
        if (temporalCol) {
            document.getElementById('x-axis-select').value = temporalCol;
            this.updateFieldMapping('x', temporalCol);
        } else if (nominalCol) {
            document.getElementById('x-axis-select').value = nominalCol;
            this.updateFieldMapping('x', nominalCol);
        }
        
        // Auto-suggest y-axis (first quantitative column)
        const quantCol = columns.find(col => 
            this.dataManager.inferColumnType(data, col) === 'quantitative'
        );
        
        if (quantCol) {
            document.getElementById('y-axis-select').value = quantCol;
            this.updateFieldMapping('y', quantCol);
        }
    }

    updateFieldMapping(encoding, field) {
        if (!field) {
            this.fieldMappings[encoding] = null;
        } else {
            const type = this.dataManager.inferColumnType(this.currentData, field);
            this.fieldMappings[encoding] = { field, type };
        }
        
        // Update current thread
        const thread = this.threads.get(this.currentThread);
        thread.mappings = { ...this.fieldMappings };
        
        // Re-render chart
        this.updateChart();
        
        // Update thread visualization
        this.updateThreadPreview(this.currentThread);
    }

    async updateChart() {
        if (!this.currentData || !this.fieldMappings.x || !this.fieldMappings.y) {
            this.showChartPlaceholder();
            return;
        }
        
        try {
            const spec = this.specBuilder.buildSpec({
                data: this.currentData,
                chartType: 'bar', // Default for now
                mappings: this.fieldMappings,
                config: { width: 500, height: 300, title: 'Generated Chart' }
            });
            
            await embed('#chart-container-v2', spec, {
                theme: 'quartz',
                renderer: 'svg',
                actions: false
            });
            
        } catch (error) {
            console.error('Error updating chart:', error);
            this.showChartPlaceholder('Error rendering chart');
        }
    }

    showChartPlaceholder(message) {
        const container = document.getElementById('chart-container-v2');
        container.innerHTML = `
            <div class="chart-placeholder-v2">
                <div class="placeholder-content">
                    <div class="chart-icon">📊</div>
                    <h3>${message || 'Create Your Visualization'}</h3>
                    <p>Upload data and configure mappings to get started</p>
                </div>
            </div>
        `;
    }

    updateDataView(data) {
        const rowCount = document.getElementById('row-count');
        const tableHead = document.getElementById('data-table-head-v2');
        const tableBody = document.getElementById('data-table-body-v2');
        
        if (!data || data.length === 0) {
            rowCount.textContent = '0 rows';
            tableHead.innerHTML = '';
            tableBody.innerHTML = '';
            return;
        }
        
        rowCount.textContent = `${data.length} rows`;
        
        const columns = Object.keys(data[0]);
        
        // Render header
        tableHead.innerHTML = `<tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr>`;
        
        // Render first 5 rows
        const rows = data.slice(0, 5).map(row => 
            `<tr>${columns.map(col => `<td>${row[col] || ''}</td>`).join('')}</tr>`
        ).join('');
        
        tableBody.innerHTML = rows;
    }

    processNaturalLanguageInput(instructions) {
        // Simple NL processing - in real implementation, this would use AI
        const thread = this.threads.get(this.currentThread);
        thread.nlInstructions = instructions;
        
        // Basic keyword matching for demo
        const keywords = instructions.toLowerCase();
        
        if (keywords.includes('over time') || keywords.includes('trend')) {
            // Suggest temporal x-axis
            const temporalField = this.findFieldByType('temporal');
            if (temporalField) {
                document.getElementById('x-axis-select').value = temporalField;
                this.updateFieldMapping('x', temporalField);
            }
        }
        
        if (keywords.includes('by country') || keywords.includes('by region')) {
            // Suggest geographic grouping
            const geoField = this.findFieldByKeywords(['country', 'region', 'state']);
            if (geoField) {
                document.getElementById('color-select').value = geoField;
                this.updateFieldMapping('color', geoField);
            }
        }
        
        this.updateStatus(`Applied natural language instructions: "${instructions}"`);
    }

    findFieldByType(type) {
        if (!this.currentData) return null;
        const columns = Object.keys(this.currentData[0]);
        return columns.find(col => 
            this.dataManager.inferColumnType(this.currentData, col) === type
        );
    }

    findFieldByKeywords(keywords) {
        if (!this.currentData) return null;
        const columns = Object.keys(this.currentData[0]);
        return columns.find(col => 
            keywords.some(keyword => col.toLowerCase().includes(keyword))
        );
    }

    createNewThread() {
        const newId = Math.max(...this.threads.keys()) + 1;
        
        this.threads.set(newId, {
            id: newId,
            data: this.currentData,
            mappings: { ...this.fieldMappings },
            chartType: 'bar',
            title: `Thread ${newId}`,
            nlInstructions: ''
        });
        
        this.addThreadToUI(newId);
        this.selectThread(newId);
    }

    addThreadToUI(threadId) {
        const threadList = document.getElementById('thread-list');
        const threadItem = document.createElement('div');
        threadItem.className = 'thread-item';
        threadItem.dataset.thread = threadId;
        
        threadItem.innerHTML = `
            <div class="thread-header">
                <span class="thread-title">thread - ${threadId}</span>
                <button class="thread-menu">⋯</button>
            </div>
            <div class="thread-preview">
                <svg class="thread-chart" width="120" height="80"></svg>
            </div>
            <div class="thread-description">
                <div class="field-chip">New Thread</div>
            </div>
        `;
        
        threadList.appendChild(threadItem);
    }

    selectThread(threadId) {
        // Update UI
        document.querySelectorAll('.thread-item').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelector(`[data-thread="${threadId}"]`).classList.add('active');
        
        // Load thread data
        const thread = this.threads.get(threadId);
        this.currentThread = threadId;
        this.fieldMappings = { ...thread.mappings };
        
        // Update selectors
        Object.entries(this.fieldMappings).forEach(([encoding, mapping]) => {
            const select = document.getElementById(`${encoding === 'x' ? 'x-axis' : encoding}-select`);
            if (select && mapping) {
                select.value = mapping.field;
            }
        });
        
        this.updateChart();
    }

    updateThreadPreview(threadId) {
        // Simple preview - in real implementation, this would render a mini chart
        const threadItem = document.querySelector(`[data-thread="${threadId}"]`);
        const description = threadItem.querySelector('.thread-description');
        
        const chips = Object.entries(this.fieldMappings)
            .filter(([_, mapping]) => mapping)
            .map(([encoding, mapping]) => 
                `<div class="field-chip ${encoding}-field">${mapping.field} ×</div>`
            ).join('');
        
        description.innerHTML = chips || '<div class="field-chip">Configure mappings</div>';
    }

    exportCurrentChart() {
        if (!this.currentData || !this.fieldMappings.x || !this.fieldMappings.y) {
            alert('Please configure chart mappings before exporting');
            return;
        }
        
        const fullSpec = this.specBuilder.buildFullSpec({
            data: this.currentData,
            chartType: 'bar',
            mappings: this.fieldMappings,
            config: { title: 'Exported Chart', width: 600, height: 400 }
        });
        
        const blob = new Blob([JSON.stringify(fullSpec, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `chart-builder-v2-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.updateStatus('Chart exported successfully');
    }

    activateStep(stepNumber) {
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        
        document.querySelector(`[data-step="${stepNumber}"]`).classList.add('active');
        
        // Could implement step-specific UI changes here
        this.updateStatus(`Activated step ${stepNumber}`);
    }

    updateStatus(message) {
        console.log(`Chart Builder 2.0: ${message}`);
        
        // Could implement a status bar or notification system
        if (typeof window !== 'undefined' && window.parent !== window) {
            // If embedded, could communicate with parent
            window.parent.postMessage({ type: 'status', message }, '*');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chartBuilderV2 = new ChartBuilderV2();
});

export default ChartBuilderV2;