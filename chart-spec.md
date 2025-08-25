# Chart Builder Output Specification

## Chart Specification Format

The chart builder outputs a standardized JSON format that can be consumed by any dashboard framework.

### Core Structure
```json
{
  "id": "string",           // Unique chart identifier
  "version": "1.0",         // Spec version for compatibility
  "metadata": {
    "created": "ISO timestamp",
    "title": "string",
    "description": "string"
  },
  "data": {
    "source": "file|url|inline",
    "format": "csv|json|tsv",
    "url": "string",          // For file/url sources
    "values": [...],          // For inline data
    "name": "string"          // Dataset name
  },
  "chart": {
    "type": "bar|scatter|line|area|histogram|boxplot",
    "encoding": {
      "x": {
        "field": "string",
        "type": "nominal|ordinal|quantitative|temporal",
        "title": "string",
        "scale": { "domain": [...] }
      },
      "y": { /* same structure as x */ },
      "color": { /* optional encoding */ },
      "size": { /* optional encoding */ },
      "shape": { /* optional encoding */ }
    },
    "config": {
      "width": 600,
      "height": 400,
      "padding": { "top": 20, "right": 30, "bottom": 40, "left": 50 },
      "background": "#ffffff",
      "title": {
        "text": "string",
        "fontSize": 16,
        "anchor": "start|middle|end"
      }
    }
  },
  "interactions": {
    "tooltip": true,
    "zoom": false,
    "brush": false,
    "click": "none|filter|highlight"
  },
  "vegaLiteSpec": { /* Full Vega-Lite specification */ }
}
```

### Example Output
```json
{
  "id": "sales_bar_chart_001",
  "version": "1.0",
  "metadata": {
    "created": "2025-08-24T10:30:00Z",
    "title": "Sales by Region",
    "description": "Bar chart showing sales performance across regions"
  },
  "data": {
    "source": "file",
    "format": "csv",
    "url": "./data/sales.csv",
    "name": "sales_data"
  },
  "chart": {
    "type": "bar",
    "encoding": {
      "x": {
        "field": "region",
        "type": "nominal",
        "title": "Region"
      },
      "y": {
        "field": "sales",
        "type": "quantitative",
        "title": "Sales ($)"
      },
      "color": {
        "field": "quarter",
        "type": "ordinal",
        "title": "Quarter"
      }
    },
    "config": {
      "width": 600,
      "height": 400,
      "title": {
        "text": "Sales by Region",
        "fontSize": 16,
        "anchor": "middle"
      }
    }
  },
  "interactions": {
    "tooltip": true,
    "zoom": false,
    "brush": false
  },
  "vegaLiteSpec": {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "data": {"url": "./data/sales.csv"},
    "mark": "bar",
    "encoding": {
      "x": {"field": "region", "type": "nominal", "title": "Region"},
      "y": {"field": "sales", "type": "quantitative", "title": "Sales ($)"},
      "color": {"field": "quarter", "type": "ordinal", "title": "Quarter"}
    },
    "width": 600,
    "height": 400,
    "title": "Sales by Region"
  }
}
```

## Integration Points

### For Vue Dashboard Consumer
```javascript
// Load chart specification
const chartSpec = await fetch('./charts/sales_chart.json').then(r => r.json());

// Use in Vue component
<ChartRenderer :spec="chartSpec" />
```

### For React Dashboard Consumer
```jsx
const ChartComponent = ({ specUrl }) => {
  const [spec, setSpec] = useState(null);
  
  useEffect(() => {
    fetch(specUrl).then(r => r.json()).then(setSpec);
  }, [specUrl]);
  
  return <VegaLiteChart spec={spec?.vegaLiteSpec} />;
};
```

## Export Functions

The chart builder will provide these export methods:

1. **JSON Export**: `chartBuilder.exportSpec()` → Full specification
2. **Vega-Lite Only**: `chartBuilder.exportVegaLite()` → Just the Vega-Lite spec
3. **Save to File**: `chartBuilder.saveAsFile(filename)` → Download JSON file
4. **Dashboard Ready**: `chartBuilder.toDashboard()` → Formatted for dashboard import