/**
 * Data Manager Module
 * Handles data parsing, sample data loading, and type inference
 */

export class DataManager {
    constructor() {
        this.supportedFormats = ['csv', 'json', 'tsv', 'txt'];
    }

    /**
     * Parse uploaded file based on its type
     */
    async parseFile(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const content = await this.readFileContent(file);
        
        switch (extension) {
            case 'csv':
                return this.parseCSV(content);
            case 'tsv':
                return this.parseTSV(content);
            case 'json':
                return this.parseJSON(content);
            case 'txt':
                // Try to detect format from content
                return this.parseAutoDetect(content);
            default:
                throw new Error(`Unsupported file format: ${extension}`);
        }
    }

    /**
     * Read file content as text
     */
    readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Parse CSV content
     */
    parseCSV(content, delimiter = ',') {
        const lines = content.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV file must have at least a header and one data row');
        }

        const headers = this.parseCSVLine(lines[0], delimiter);
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i], delimiter);
            if (values.length !== headers.length) {
                console.warn(`Row ${i + 1} has ${values.length} values but expected ${headers.length}`);
                continue;
            }

            const row = {};
            headers.forEach((header, index) => {
                row[header] = this.parseValue(values[index]);
            });
            data.push(row);
        }

        return data;
    }

    /**
     * Parse TSV content
     */
    parseTSV(content) {
        return this.parseCSV(content, '\t');
    }

    /**
     * Parse JSON content
     */
    parseJSON(content) {
        try {
            const data = JSON.parse(content);
            if (!Array.isArray(data)) {
                throw new Error('JSON data must be an array of objects');
            }
            return data;
        } catch (error) {
            throw new Error(`Invalid JSON format: ${error.message}`);
        }
    }

    /**
     * Auto-detect format and parse
     */
    parseAutoDetect(content) {
        // Try CSV first
        if (content.includes(',')) {
            try {
                return this.parseCSV(content);
            } catch (error) {
                // Continue to next format
            }
        }

        // Try TSV
        if (content.includes('\t')) {
            try {
                return this.parseTSV(content);
            } catch (error) {
                // Continue to next format
            }
        }

        // Try JSON
        if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
            try {
                return this.parseJSON(content);
            } catch (error) {
                // Continue to next format
            }
        }

        throw new Error('Could not detect file format. Please ensure it is CSV, TSV, or JSON.');
    }

    /**
     * Parse a single CSV line, handling quoted values
     */
    parseCSVLine(line, delimiter = ',') {
        const values = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < line.length) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                    // Escaped quote
                    current += '"';
                    i += 2;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === delimiter && !inQuotes) {
                // End of value
                values.push(current.trim());
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }

        // Add the last value
        values.push(current.trim());

        return values;
    }

    /**
     * Parse individual value and infer type
     */
    parseValue(value) {
        if (!value || value === '') {
            return null;
        }

        value = value.trim();

        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        // Try to parse as number
        if (!isNaN(value) && value !== '') {
            return parseFloat(value);
        }

        // Try to parse as date
        if (this.isDate(value)) {
            return new Date(value);
        }

        // Return as string
        return value;
    }

    /**
     * Check if a value is a date
     */
    isDate(value) {
        // Simple date patterns
        const datePatterns = [
            /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
            /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
            /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
        ];

        return datePatterns.some(pattern => pattern.test(value));
    }

    /**
     * Infer column type from data
     */
    inferColumnType(data, column) {
        if (!data || data.length === 0) return 'nominal';

        const values = data.map(row => row[column]).filter(val => val != null);
        if (values.length === 0) return 'nominal';

        // Check if all values are numbers
        const numericValues = values.filter(val => typeof val === 'number');
        if (numericValues.length === values.length) {
            return 'quantitative';
        }

        // Check if all values are dates
        const dateValues = values.filter(val => val instanceof Date);
        if (dateValues.length === values.length) {
            return 'temporal';
        }

        // Check if values have natural order (ordinal)
        const stringValues = values.filter(val => typeof val === 'string');
        if (stringValues.length === values.length) {
            const uniqueValues = [...new Set(stringValues)];
            
            // If small number of unique values, might be ordinal
            if (uniqueValues.length < values.length * 0.5 && uniqueValues.length < 20) {
                // Check for common ordinal patterns
                const ordinalPatterns = [
                    ['low', 'medium', 'high'],
                    ['small', 'medium', 'large'],
                    ['poor', 'fair', 'good', 'excellent'],
                    ['never', 'rarely', 'sometimes', 'often', 'always']
                ];

                const lowerValues = uniqueValues.map(v => v.toLowerCase());
                for (const pattern of ordinalPatterns) {
                    if (pattern.every(p => lowerValues.includes(p))) {
                        return 'ordinal';
                    }
                }

                // If all values are single characters or very short, likely categorical
                if (uniqueValues.every(v => v.length <= 3)) {
                    return 'nominal';
                }

                return 'ordinal';
            }
        }

        // Default to nominal (categorical)
        return 'nominal';
    }

    /**
     * Load sample datasets
     */
    async loadSampleData(sampleType) {
        const sampleData = {
            sales: this.generateSalesData(),
            iris: this.generateIrisData(),
            stocks: this.generateStockData()
        };

        if (!sampleData[sampleType]) {
            throw new Error(`Unknown sample type: ${sampleType}`);
        }

        return sampleData[sampleType];
    }

    /**
     * Generate sales sample data
     */
    generateSalesData() {
        const regions = ['North', 'South', 'East', 'West'];
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        const categories = ['Electronics', 'Clothing', 'Home', 'Sports'];
        const data = [];

        regions.forEach(region => {
            quarters.forEach(quarter => {
                categories.forEach(category => {
                    data.push({
                        region,
                        quarter,
                        category,
                        sales: Math.round(Math.random() * 100000 + 10000),
                        profit: Math.round(Math.random() * 20000 + 2000),
                        units: Math.round(Math.random() * 1000 + 100)
                    });
                });
            });
        });

        return data;
    }

    /**
     * Generate Iris sample data
     */
    generateIrisData() {
        // Simplified Iris dataset
        const species = ['setosa', 'versicolor', 'virginica'];
        const data = [];

        species.forEach((sp, speciesIndex) => {
            for (let i = 0; i < 50; i++) {
                // Generate realistic iris measurements with species-specific means
                const means = {
                    setosa: { sepalLength: 5.0, sepalWidth: 3.4, petalLength: 1.5, petalWidth: 0.2 },
                    versicolor: { sepalLength: 5.9, sepalWidth: 2.8, petalLength: 4.3, petalWidth: 1.3 },
                    virginica: { sepalLength: 6.5, sepalWidth: 3.0, petalLength: 5.6, petalWidth: 2.0 }
                };

                const mean = means[sp];
                data.push({
                    species: sp,
                    sepalLength: Math.round((mean.sepalLength + (Math.random() - 0.5) * 2) * 10) / 10,
                    sepalWidth: Math.round((mean.sepalWidth + (Math.random() - 0.5) * 1.5) * 10) / 10,
                    petalLength: Math.round((mean.petalLength + (Math.random() - 0.5) * 2) * 10) / 10,
                    petalWidth: Math.round((mean.petalWidth + (Math.random() - 0.5) * 1) * 10) / 10
                });
            }
        });

        return data;
    }

    /**
     * Generate stock sample data
     */
    generateStockData() {
        const companies = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
        const data = [];
        const startDate = new Date('2023-01-01');
        
        companies.forEach(company => {
            let price = Math.random() * 200 + 50; // Starting price
            
            for (let day = 0; day < 365; day++) {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + day);
                
                // Random walk for stock price
                const change = (Math.random() - 0.5) * 10;
                price = Math.max(price + change, 10); // Ensure price doesn't go below 10
                
                data.push({
                    company,
                    date: date.toISOString().split('T')[0],
                    price: Math.round(price * 100) / 100,
                    volume: Math.round(Math.random() * 1000000 + 100000),
                    change: Math.round(change * 100) / 100
                });
            }
        });

        return data.slice(0, 500); // Return first 500 records for performance
    }

    /**
     * Get column statistics
     */
    getColumnStats(data, column) {
        const values = data.map(row => row[column]).filter(val => val != null);
        
        if (values.length === 0) {
            return { count: 0, unique: 0, type: 'unknown' };
        }

        const unique = new Set(values).size;
        const type = this.inferColumnType(data, column);

        let stats = { count: values.length, unique, type };

        if (type === 'quantitative') {
            const numbers = values.filter(v => typeof v === 'number');
            if (numbers.length > 0) {
                stats.min = Math.min(...numbers);
                stats.max = Math.max(...numbers);
                stats.mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
            }
        }

        return stats;
    }
}