/**
 * Specification Builder Module
 * Generates Vega-Lite and full chart specifications
 */

export class SpecBuilder {
    constructor() {
        this.version = '1.0';
        this.vegaLiteVersion = 'v5';
    }

    /**
     * Build Vega-Lite specification
     */
    buildSpec({ data, chartType, mappings, config }) {
        const spec = {
            $schema: `https://vega.github.io/schema/vega-lite/${this.vegaLiteVersion}.json`,
            description: config.title || `${chartType} chart`,
            data: { values: data },
            mark: this.buildMark(chartType, mappings),
            encoding: this.buildEncoding(mappings),
            width: config.width || 600,
            height: config.height || 400
        };

        // Add title if provided
        if (config.title) {
            spec.title = {
                text: config.title,
                anchor: 'start',
                fontSize: 16,
                fontWeight: 'bold'
            };
        }

        // Add configuration
        spec.config = this.buildConfig(chartType);

        return spec;
    }

    /**
     * Build full chart specification for dashboard integration
     */
    buildFullSpec({ data, chartType, mappings, config }) {
        const vegaSpec = this.buildSpec({ data, chartType, mappings, config });

        return {
            id: this.generateChartId(),
            version: this.version,
            metadata: {
                created: new Date().toISOString(),
                title: config.title || 'Untitled Chart',
                description: `${chartType} chart with ${Object.keys(mappings).filter(k => mappings[k]).length} encodings`
            },
            data: {
                source: 'inline',
                format: 'json',
                values: data,
                name: 'chart_data'
            },
            chart: {
                type: chartType,
                encoding: this.buildEncodingMetadata(mappings),
                config: {
                    width: config.width || 600,
                    height: config.height || 400,
                    padding: { top: 20, right: 30, bottom: 40, left: 50 },
                    background: '#ffffff',
                    title: {
                        text: config.title || '',
                        fontSize: 16,
                        anchor: 'middle'
                    }
                }
            },
            interactions: {
                tooltip: true,
                zoom: false,
                brush: false,
                click: 'none'
            },
            vegaLiteSpec: vegaSpec
        };
    }

    /**
     * Build mark specification
     */
    buildMark(chartType, mappings) {
        const markConfigs = {
            bar: {
                type: 'bar',
                tooltip: true
            },
            scatter: {
                type: 'circle',
                tooltip: true,
                size: 60
            },
            line: {
                type: 'line',
                tooltip: true,
                point: true
            },
            area: {
                type: 'area',
                tooltip: true
            },
            histogram: {
                type: 'bar',
                tooltip: true
            },
            boxplot: {
                type: 'boxplot',
                tooltip: true
            }
        };

        const baseConfig = markConfigs[chartType] || { type: chartType, tooltip: true };

        // Add conditional styling based on encodings
        if (mappings.color) {
            baseConfig.stroke = 'white';
            baseConfig.strokeWidth = 0.5;
        }

        return baseConfig;
    }

    /**
     * Build encoding specification
     */
    buildEncoding(mappings) {
        const encoding = {};

        // X-axis encoding
        if (mappings.x) {
            encoding.x = {
                field: mappings.x.column,
                type: mappings.x.type,
                title: this.formatTitle(mappings.x.column)
            };

            // Add axis configuration
            encoding.x.axis = this.buildAxisConfig('x', mappings.x.type);
        }

        // Y-axis encoding
        if (mappings.y) {
            encoding.y = {
                field: mappings.y.column,
                type: mappings.y.type,
                title: this.formatTitle(mappings.y.column)
            };

            // Add axis configuration
            encoding.y.axis = this.buildAxisConfig('y', mappings.y.type);
        }

        // Color encoding
        if (mappings.color) {
            encoding.color = {
                field: mappings.color.column,
                type: mappings.color.type,
                title: this.formatTitle(mappings.color.column)
            };

            // Add color scale configuration
            encoding.color.scale = this.buildColorScale(mappings.color.type);
            encoding.color.legend = { title: this.formatTitle(mappings.color.column) };
        }

        // Size encoding
        if (mappings.size) {
            encoding.size = {
                field: mappings.size.column,
                type: mappings.size.type,
                title: this.formatTitle(mappings.size.column)
            };

            // Add size scale configuration
            encoding.size.scale = this.buildSizeScale(mappings.size.type);
            encoding.size.legend = { title: this.formatTitle(mappings.size.column) };
        }

        return encoding;
    }

    /**
     * Build axis configuration
     */
    buildAxisConfig(axis, type) {
        const config = {
            grid: true,
            tickCount: axis === 'x' ? 10 : 5,
            labelAngle: 0
        };

        // Type-specific configurations
        switch (type) {
            case 'temporal':
                config.format = '%b %Y';
                config.labelAngle = -45;
                break;
            case 'quantitative':
                config.format = '.1f';
                break;
            case 'nominal':
            case 'ordinal':
                if (axis === 'x') {
                    config.labelAngle = -45;
                }
                break;
        }

        return config;
    }

    /**
     * Build color scale configuration
     */
    buildColorScale(type) {
        switch (type) {
            case 'nominal':
                return {
                    scheme: 'category10'
                };
            case 'ordinal':
                return {
                    scheme: 'blues',
                    reverse: false
                };
            case 'quantitative':
                return {
                    scheme: 'viridis',
                    reverse: false
                };
            default:
                return { scheme: 'category10' };
        }
    }

    /**
     * Build size scale configuration
     */
    buildSizeScale(type) {
        switch (type) {
            case 'quantitative':
                return {
                    range: [50, 400],
                    nice: true
                };
            case 'ordinal':
                return {
                    range: [50, 200, 350],
                    nice: false
                };
            default:
                return { range: [50, 200] };
        }
    }

    /**
     * Build chart configuration
     */
    buildConfig(chartType) {
        return {
            view: {
                continuousWidth: 400,
                continuousHeight: 300
            },
            axis: {
                labelFontSize: 11,
                titleFontSize: 12,
                titleFontWeight: 'bold'
            },
            legend: {
                labelFontSize: 11,
                titleFontSize: 12,
                titleFontWeight: 'bold'
            },
            title: {
                fontSize: 16,
                fontWeight: 'bold',
                anchor: 'start'
            }
        };
    }

    /**
     * Build encoding metadata for full specification
     */
    buildEncodingMetadata(mappings) {
        const metadata = {};

        Object.entries(mappings).forEach(([encoding, mapping]) => {
            if (mapping) {
                metadata[encoding] = {
                    field: mapping.column,
                    type: mapping.type,
                    title: this.formatTitle(mapping.column)
                };
            }
        });

        return metadata;
    }

    /**
     * Format column name as title
     */
    formatTitle(columnName) {
        return columnName
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    /**
     * Generate unique chart ID
     */
    generateChartId() {
        return `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Validate chart configuration
     */
    validateChartConfig({ data, chartType, mappings, config }) {
        const errors = [];

        // Check data
        if (!data || !Array.isArray(data) || data.length === 0) {
            errors.push('Data must be a non-empty array');
        }

        // Check chart type
        const supportedTypes = ['bar', 'scatter', 'line', 'area', 'histogram', 'boxplot'];
        if (!supportedTypes.includes(chartType)) {
            errors.push(`Unsupported chart type: ${chartType}`);
        }

        // Check required mappings
        if (!mappings.x && !mappings.y) {
            errors.push('Chart must have at least x or y encoding');
        }

        // Type-specific validations
        switch (chartType) {
            case 'scatter':
                if (!mappings.x || !mappings.y) {
                    errors.push('Scatter plot requires both x and y encodings');
                }
                break;
            case 'line':
                if (!mappings.x || !mappings.y) {
                    errors.push('Line chart requires both x and y encodings');
                }
                if (mappings.x.type !== 'temporal' && mappings.x.type !== 'quantitative') {
                    errors.push('Line chart x-axis should be temporal or quantitative');
                }
                break;
            case 'histogram':
                if (!mappings.x) {
                    errors.push('Histogram requires x encoding');
                }
                if (mappings.x.type !== 'quantitative') {
                    errors.push('Histogram x-axis must be quantitative');
                }
                break;
        }

        return errors;
    }

    /**
     * Generate chart template for specific use case
     */
    generateTemplate(templateType, data) {
        const templates = {
            'time-series': () => ({
                chartType: 'line',
                mappings: {
                    x: { column: this.findTemporalColumn(data), type: 'temporal' },
                    y: { column: this.findQuantitativeColumn(data), type: 'quantitative' }
                },
                config: { title: 'Time Series Chart', width: 700, height: 300 }
            }),

            'distribution': () => ({
                chartType: 'histogram',
                mappings: {
                    x: { column: this.findQuantitativeColumn(data), type: 'quantitative' }
                },
                config: { title: 'Distribution Chart', width: 600, height: 400 }
            }),

            'correlation': () => {
                const quantCols = this.findQuantitativeColumns(data);
                return {
                    chartType: 'scatter',
                    mappings: {
                        x: { column: quantCols[0], type: 'quantitative' },
                        y: { column: quantCols[1], type: 'quantitative' },
                        color: { column: this.findNominalColumn(data), type: 'nominal' }
                    },
                    config: { title: 'Correlation Chart', width: 600, height: 400 }
                };
            },

            'comparison': () => ({
                chartType: 'bar',
                mappings: {
                    x: { column: this.findNominalColumn(data), type: 'nominal' },
                    y: { column: this.findQuantitativeColumn(data), type: 'quantitative' }
                },
                config: { title: 'Comparison Chart', width: 600, height: 400 }
            })
        };

        const generator = templates[templateType];
        return generator ? generator() : null;
    }

    /**
     * Find columns by type for templates
     */
    findTemporalColumn(data) {
        if (!data || data.length === 0) return null;
        const columns = Object.keys(data[0]);
        return columns.find(col => {
            const sample = data[0][col];
            return sample instanceof Date || /\d{4}-\d{2}-\d{2}/.test(sample);
        });
    }

    findQuantitativeColumn(data) {
        if (!data || data.length === 0) return null;
        const columns = Object.keys(data[0]);
        return columns.find(col => typeof data[0][col] === 'number');
    }

    findQuantitativeColumns(data) {
        if (!data || data.length === 0) return [];
        const columns = Object.keys(data[0]);
        return columns.filter(col => typeof data[0][col] === 'number').slice(0, 2);
    }

    findNominalColumn(data) {
        if (!data || data.length === 0) return null;
        const columns = Object.keys(data[0]);
        return columns.find(col => typeof data[0][col] === 'string');
    }
}