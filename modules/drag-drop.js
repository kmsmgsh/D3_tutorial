/**
 * Drag and Drop Manager Module
 * Handles column dragging and mapping to chart encodings
 */

export class DragDropManager {
    constructor() {
        this.draggedElement = null;
        this.draggedData = null;
    }

    /**
     * Initialize drag and drop for column items
     */
    initColumnDragDrop() {
        this.setupColumnDragging();
        this.setupDropZones();
    }

    /**
     * Setup dragging behavior for column items
     */
    setupColumnDragging() {
        const columnItems = document.querySelectorAll('.column-item');
        
        columnItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                this.handleDragStart(e);
            });

            item.addEventListener('dragend', (e) => {
                this.handleDragEnd(e);
            });
        });
    }

    /**
     * Setup drop zones for chart encodings
     */
    setupDropZones() {
        const dropZones = document.querySelectorAll('.drop-zone');
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.handleDragOver(e);
            });

            zone.addEventListener('dragenter', (e) => {
                e.preventDefault();
                this.handleDragEnter(e);
            });

            zone.addEventListener('dragleave', (e) => {
                this.handleDragLeave(e);
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                this.handleDrop(e);
            });
        });
    }

    /**
     * Handle drag start event
     */
    handleDragStart(e) {
        this.draggedElement = e.target;
        this.draggedData = {
            column: e.target.dataset.column,
            type: e.target.dataset.type
        };

        // Add dragging class for visual feedback
        e.target.classList.add('dragging');

        // Set drag effect
        e.dataTransfer.effectAllowed = 'copy';
        
        // Set drag data
        e.dataTransfer.setData('text/plain', JSON.stringify(this.draggedData));

        // Custom drag image (optional)
        this.setCustomDragImage(e);
    }

    /**
     * Handle drag end event
     */
    handleDragEnd(e) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }
        
        // Clear drag state
        this.draggedElement = null;
        this.draggedData = null;

        // Clear all drop zone highlights
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('drag-over');
        });
    }

    /**
     * Handle drag over event
     */
    handleDragOver(e) {
        e.preventDefault();
        
        // Check if this is a valid drop target
        if (this.isValidDropTarget(e.currentTarget)) {
            e.dataTransfer.dropEffect = 'copy';
        } else {
            e.dataTransfer.dropEffect = 'none';
        }
    }

    /**
     * Handle drag enter event
     */
    handleDragEnter(e) {
        e.preventDefault();
        
        if (this.isValidDropTarget(e.currentTarget)) {
            e.currentTarget.classList.add('drag-over');
        }
    }

    /**
     * Handle drag leave event
     */
    handleDragLeave(e) {
        // Only remove highlight if we're actually leaving the drop zone
        // (not just moving to a child element)
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove('drag-over');
        }
    }

    /**
     * Handle drop event
     */
    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        if (!this.isValidDropTarget(e.currentTarget)) {
            return;
        }

        try {
            // Get dropped data
            const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
            const encoding = e.currentTarget.querySelector('.zone-content').dataset.encoding;

            // Validate the drop
            if (!this.validateMapping(encoding, dragData)) {
                this.showMappingError(encoding, dragData);
                return;
            }

            // Update mapping through the chart builder
            if (window.chartBuilder) {
                window.chartBuilder.updateMapping(encoding, dragData.column, dragData.type);
            }

        } catch (error) {
            console.error('Error handling drop:', error);
        }
    }

    /**
     * Check if drop target is valid
     */
    isValidDropTarget(dropZone) {
        return dropZone.classList.contains('drop-zone') && this.draggedData;
    }

    /**
     * Validate if column can be mapped to encoding
     */
    validateMapping(encoding, dragData) {
        const { column, type } = dragData;

        // Basic validation rules
        const validMappings = {
            x: ['nominal', 'ordinal', 'quantitative', 'temporal'],
            y: ['quantitative'], // Y-axis typically needs quantitative data
            color: ['nominal', 'ordinal', 'quantitative'],
            size: ['quantitative']
        };

        // Check if this encoding accepts this data type
        if (!validMappings[encoding] || !validMappings[encoding].includes(type)) {
            return false;
        }

        // Special case: if Y-axis is getting a nominal/ordinal value,
        // it might be valid for certain chart types (like bar charts with categorical Y)
        if (encoding === 'y' && ['nominal', 'ordinal'].includes(type)) {
            // This could be valid for horizontal bar charts
            // For now, we'll allow it and let the chart renderer decide
            return true;
        }

        return true;
    }

    /**
     * Show mapping error message
     */
    showMappingError(encoding, dragData) {
        const { column, type } = dragData;
        
        // Create temporary error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'mapping-error';
        errorMsg.textContent = `Cannot map ${type} column "${column}" to ${encoding}`;
        errorMsg.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f44336;
            color: white;
            padding: 1rem 2rem;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            font-size: 0.9rem;
        `;

        document.body.appendChild(errorMsg);

        // Remove after 3 seconds
        setTimeout(() => {
            if (document.body.contains(errorMsg)) {
                document.body.removeChild(errorMsg);
            }
        }, 3000);

        // Update status
        if (window.chartBuilder) {
            window.chartBuilder.updateStatus(
                `Cannot map ${type} column "${column}" to ${encoding}`, 
                'error'
            );
        }
    }

    /**
     * Set custom drag image
     */
    setCustomDragImage(e) {
        try {
            // Create a custom drag image
            const dragImage = document.createElement('div');
            dragImage.className = 'drag-image';
            dragImage.textContent = this.draggedData.column;
            dragImage.style.cssText = `
                position: absolute;
                top: -1000px;
                left: -1000px;
                padding: 0.5rem 1rem;
                background: #2196F3;
                color: white;
                border-radius: 5px;
                font-size: 0.9rem;
                font-weight: 500;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                pointer-events: none;
            `;

            document.body.appendChild(dragImage);

            // Set as drag image
            e.dataTransfer.setDragImage(dragImage, 50, 25);

            // Clean up after drag starts
            setTimeout(() => {
                if (document.body.contains(dragImage)) {
                    document.body.removeChild(dragImage);
                }
            }, 0);

        } catch (error) {
            // Fallback to default drag image
            console.warn('Could not set custom drag image:', error);
        }
    }

    /**
     * Get encoding recommendations for a column
     */
    getEncodingRecommendations(column, type) {
        const recommendations = {
            quantitative: {
                primary: ['x', 'y', 'size'],
                secondary: ['color']
            },
            nominal: {
                primary: ['x', 'color'],
                secondary: ['y'] // for horizontal charts
            },
            ordinal: {
                primary: ['x', 'color'],
                secondary: ['y']
            },
            temporal: {
                primary: ['x'],
                secondary: ['color']
            }
        };

        return recommendations[type] || { primary: [], secondary: [] };
    }

    /**
     * Highlight compatible drop zones
     */
    highlightCompatibleZones(column, type) {
        const recommendations = this.getEncodingRecommendations(column, type);
        const allEncodings = [...recommendations.primary, ...recommendations.secondary];

        document.querySelectorAll('.drop-zone').forEach(zone => {
            const encoding = zone.querySelector('.zone-content').dataset.encoding;
            
            if (recommendations.primary.includes(encoding)) {
                zone.classList.add('compatible-primary');
            } else if (recommendations.secondary.includes(encoding)) {
                zone.classList.add('compatible-secondary');
            } else {
                zone.classList.add('incompatible');
            }
        });
    }

    /**
     * Clear zone highlights
     */
    clearZoneHighlights() {
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('compatible-primary', 'compatible-secondary', 'incompatible');
        });
    }

    /**
     * Add visual feedback for drag operations
     */
    addDragStyles() {
        if (document.getElementById('drag-drop-styles')) {
            return; // Already added
        }

        const styles = document.createElement('style');
        styles.id = 'drag-drop-styles';
        styles.textContent = `
            .column-item.dragging {
                opacity: 0.5;
                transform: rotate(5deg);
            }

            .drop-zone.drag-over {
                border-color: #4CAF50;
                background-color: rgba(76, 175, 80, 0.1);
                transform: scale(1.02);
            }

            .drop-zone.compatible-primary {
                border-color: #4CAF50;
                background-color: rgba(76, 175, 80, 0.05);
            }

            .drop-zone.compatible-secondary {
                border-color: #FF9800;
                background-color: rgba(255, 152, 0, 0.05);
            }

            .drop-zone.incompatible {
                border-color: #f44336;
                background-color: rgba(244, 67, 54, 0.05);
                opacity: 0.6;
            }

            .mapping-error {
                animation: slideIn 0.3s ease-out;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -60%);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%);
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Initialize drag and drop system
     */
    init() {
        this.addDragStyles();
        this.initColumnDragDrop();
    }
}