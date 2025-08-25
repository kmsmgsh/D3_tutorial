export default {
  title: 'D3.js Learning Journey',
  description: 'A comprehensive guide to learning D3.js data visualization',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'Playground', link: '../sandbox.html', target: '_blank' },
      { text: 'Examples', link: '/examples/' },
      { text: 'API Docs', link: '../docs/index.html', target: '_blank' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Setup', link: '/guide/setup' },
            { text: 'First Chart', link: '/guide/first-chart' },
            { text: 'Playground', link: '/guide/sandbox' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Scales', link: '/guide/scales' },
            { text: 'Data Binding', link: '/guide/data-binding' },
            { text: 'SVG Basics', link: '/guide/svg-basics' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Chart Types',
          items: [
            { text: 'Bar Chart', link: '/examples/bar-chart' },
            { text: 'Line Chart', link: '/examples/line-chart' },
            { text: 'Scatter Plot', link: '/examples/scatter-plot' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/d3/d3' }
    ],

    footer: {
      message: 'Learning D3.js step by step',
      copyright: 'Built with VitePress'
    }
  }
}