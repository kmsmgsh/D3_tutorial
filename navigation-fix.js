/**
 * Navigation path fix for GitHub Pages deployment
 * Automatically adjusts links based on the current domain
 */

function initNavigationFix() {
    // Check if we're on GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    const basePath = isGitHubPages ? '/D3_tutorial' : '';
    
    // Update navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Skip internal anchors and external links
        if (href.startsWith('#') || href.startsWith('http')) {
            return;
        }
        
        // Update the href with base path for GitHub Pages
        if (isGitHubPages && !href.startsWith(basePath)) {
            link.setAttribute('href', basePath + '/' + href);
        }
    });
    
    // Update any other relative links in the document
    const allLinks = document.querySelectorAll('a[href]');
    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Skip already processed nav links, anchors, and external links
        if (link.classList.contains('nav-link') || 
            href.startsWith('#') || 
            href.startsWith('http') ||
            href.startsWith('mailto:')) {
            return;
        }
        
        // Fix relative paths for GitHub Pages
        if (isGitHubPages && !href.startsWith(basePath) && !href.startsWith('/')) {
            link.setAttribute('href', basePath + '/' + href);
        }
    });
    
    console.log('Navigation paths updated for deployment environment');
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigationFix);
} else {
    initNavigationFix();
}