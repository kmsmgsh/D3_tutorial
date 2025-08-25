/**
 * Chart Renderer Module
 * Handles Vega-Lite chart rendering and interactions
 */

import embed from 'vega-embed';

export class ChartRenderer {
    constructor() {
        this.currentView = null;
        this.vegaEmbed = embed;
        this.isVegaLoaded = true;
    }

    /**
     * Render chart with Vega-Lite specification
     */
    async render(containerId, spec) {
        
        if (!this.vegaEmbed) {
            throw new Error('Vega-Embed not loaded');
        }

        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container ${containerId} not found`);
        }

        try {
            // Clear container
            container.innerHTML = '';

            // Set up Vega-Embed options
            const options = {
                theme: 'quartz', // Modern theme
                renderer: 'svg',  // SVG for better quality
                actions: {
                    export: true,
                    source: false,
                    compiled: false,
                    editor: false
                },
                scaleFactor: 2, // High DPI rendering
                padding: { top: 10, right: 10, bottom: 10, left: 10 }
            };

            // Render the chart
            const result = await this.vegaEmbed(container, spec, options);
            this.currentView = result.view;

            // Add interaction handlers
            this.addInteractionHandlers(result.view);

            return result;

        } catch (error) {
            console.error('Error rendering chart:', error);
            this.showError(container, error.message);
            throw error;
        }
    }

    /**
     * Add interaction handlers to the chart
     */
    addInteractionHandlers(view) {
        if (!view) return;

        // Add tooltip interactions
        view.tooltip(true);

        // Add click handlers for data points
        view.addEventListener('click', (event, item) => {
            if (item && item.datum) {
                this.handleDataPointClick(item.datum);
            }
        });

        // Add hover handlers
        view.addEventListener('mouseover', (event, item) => {
            if (item && item.datum) {
                this.handleDataPointHover(item.datum, true);
            }
        });

        view.addEventListener('mouseout', (event, item) => {
            if (item && item.datum) {
                this.handleDataPointHover(item.datum, false);
            }
        });
    }

    /**
     * Handle data point click
     */
    handleDataPointClick(datum) {
        console.log('Data point clicked:', datum);
        
        // Could implement selection, filtering, or drill-down here
        if (window.chartBuilder) {
            window.chartBuilder.updateStatus(`Clicked: ${JSON.stringify(datum)}`);
        }
    }

    /**
     * Handle data point hover
     */
    handleDataPointHover(datum, isEnter) {
        if (isEnter) {
            // Could add custom hover effects here
            console.log('Hovering over:', datum);
        }
    }

    /**
     * Show error message in container
     */
    showError(container, message) {
        container.innerHTML = `
            <div class="chart-error">
                <div class="error-icon">⚠️</div>
                <h4>Chart Rendering Error</h4>
                <p>${message}</p>
                <details>
                    <summary>Technical Details</summary>
                    <pre>${message}</pre>
                </details>
            </div>
        `;

        // Add error styles if not already present
        this.addErrorStyles();
    }

    /**
     * Add error styling
     */
    addErrorStyles() {
        if (document.getElementById('chart-error-styles')) {
            return;
        }

        const styles = document.createElement('style');
        styles.id = 'chart-error-styles';
        styles.textContent = `
            .chart-error {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 2rem;
                background: #fff5f5;
                border: 2px dashed #f56565;
                border-radius: 8px;
                color: #742a2a;
                text-align: center;
                min-height: 200px;
            }

            .chart-error .error-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .chart-error h4 {
                margin: 0 0 1rem 0;
                color: #742a2a;
            }

            .chart-error p {
                margin: 0 0 1rem 0;
                color: #a0a0a0;
            }

            .chart-error details {
                margin-top: 1rem;
                text-align: left;
                width: 100%;
                max-width: 500px;
            }

            .chart-error summary {
                cursor: pointer;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }

            .chart-error pre {
                background: #fff;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                padding: 1rem;
                font-size: 0.8rem;
                overflow-x: auto;
                white-space: pre-wrap;
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Export chart as PNG
     */
    async exportToPNG(filename = 'chart.png') {
        if (!this.currentView) {
            throw new Error('No chart to export');
        }

        try {
            const canvas = await this.currentView.toCanvas(2); // 2x scale for quality
            
            // Convert canvas to blob
            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    resolve();
                });
            });
        } catch (error) {
            console.error('Error exporting to PNG:', error);
            throw error;
        }
    }

    /**
     * Export chart as SVG
     */
    async exportToSVG(filename = 'chart.svg') {
        if (!this.currentView) {
            throw new Error('No chart to export');
        }

        try {
            const svg = await this.currentView.toSVG();
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting to SVG:', error);
            throw error;
        }
    }

    /**
     * Update chart data without full re-render
     */
    async updateData(newData) {
        if (!this.currentView) {
            throw new Error('No chart view available');
        }

        try {
            await this.currentView.data('source', newData);
            await this.currentView.runAsync();
        } catch (error) {
            console.error('Error updating chart data:', error);
            throw error;
        }
    }

    /**
     * Resize chart
     */
    async resize(width, height) {
        if (!this.currentView) {
            throw new Error('No chart view available');
        }

        try {
            await this.currentView.width(width).height(height).runAsync();
        } catch (error) {
            console.error('Error resizing chart:', error);
            throw error;
        }
    }

    /**
     * Get chart data
     */
    getChartData() {
        if (!this.currentView) {
            return null;
        }

        try {
            return this.currentView.data('source');
        } catch (error) {
            console.error('Error getting chart data:', error);
            return null;
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.currentView) {
            this.currentView.finalize();
            this.currentView = null;
        }
    }

    /**
     * Check if Vega-Lite is supported
     */
    isSupported() {
        return this.isVegaLoaded && !!this.vegaEmbed;
    }

    /**
     * Get supported chart types
     */
    getSupportedChartTypes() {
        return [
            'bar',
            'line',
            'scatter',
            'area',
            'histogram',
            'boxplot',
            'heatmap',
            'pie'
        ];
    }

    /**
     * Validate chart specification
     */
    validateSpec(spec) {
        const errors = [];

        // Basic validation
        if (!spec.data) {
            errors.push('Chart specification must include data');
        }

        if (!spec.mark && !spec.layer) {
            errors.push('Chart specification must include mark or layer');
        }

        if (!spec.encoding) {
            errors.push('Chart specification must include encoding');
        }

        // Encoding validation
        if (spec.encoding) {
            if (!spec.encoding.x && !spec.encoding.y) {
                errors.push('Chart must have at least x or y encoding');
            }
        }

        return errors;
    }
}