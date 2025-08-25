# 🚀 GitHub Pages Deployment Guide

## Step-by-Step Instructions

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `D3_tutorial` (or update `vite.config.js` with your chosen name)
3. **Important**: Make sure the repository is public for GitHub Pages
4. Don't initialize with README (we already have one)

### 2. Connect Local Repository to GitHub

```bash
# Add your GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/D3_tutorial.git

# Push to GitHub
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select **GitHub Actions** 
5. The workflow will automatically deploy on the next push

### 4. Update Configuration

**Important**: Update the base path in `vite.config.js`:

```javascript
// Replace 'D3_tutorial' with your actual repository name
base: process.env.NODE_ENV === 'production' ? '/YOUR_REPO_NAME/' : '/',
```

If you changed the repository name, commit and push the change:

```bash
git add vite.config.js
git commit -m "fix: update base path for GitHub Pages"
git push origin main
```

### 5. Access Your Live Site

After the GitHub Action completes (2-3 minutes), your site will be available at:

**https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/**

## 🛠️ Build Commands

### Local Development
```bash
npm run dev          # Start development server (port 4173)
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Manual Deployment (if needed)
```bash
npm run deploy       # Deploy to gh-pages branch
```

### Documentation
```bash
npm run docs:api     # Generate JSDoc documentation
npm run docs:tutorial # Start VitePress tutorial server
npm run docs:all     # Build all documentation
```

## 🔧 Configuration Files

### Vite Configuration (`vite.config.js`)
- Sets base path for GitHub Pages
- Configures build optimization
- Handles asset bundling

### GitHub Action (`.github/workflows/deploy.yml`)
- Automatic deployment on push to main
- Builds and deploys to GitHub Pages
- Uses Node.js 18 and caches dependencies

### Package.json Scripts
- `deploy`: Manual deployment using gh-pages
- `predeploy`: Automatically builds before deployment

## 📁 Deployment Structure

```
dist/                    # Built files (created by npm run build)
├── index.html          # Main dashboard
├── chart-builder.html  # Chart builder interface
├── monaco-sandbox.html # Monaco editor
├── assets/            # Bundled JS/CSS
└── sample-data/       # Sample datasets
```

## 🐛 Troubleshooting

### Build Fails
- Check Node.js version (requires v16+)
- Run `npm ci` to clean install dependencies
- Check console for specific errors

### Pages Not Loading
- Verify repository is public
- Check GitHub Action status in Actions tab
- Ensure base path in `vite.config.js` matches repository name

### Assets Not Loading
- Verify base path configuration
- Check browser developer tools for 404 errors
- Ensure all file paths are relative or use base path

### Chart Builder Issues
- Charts require Vega-Lite to load from CDN
- Check browser console for JavaScript errors
- Ensure sample data files are included in build

## 🔄 Updates and Maintenance

### Making Changes
1. Edit files locally
2. Test with `npm run dev`
3. Commit changes: `git add . && git commit -m "your message"`
4. Push to GitHub: `git push origin main`
5. GitHub Action will automatically redeploy

### Monitoring Deployment
- Check the **Actions** tab in GitHub repository
- Green checkmark = successful deployment
- Red X = deployment failed (check logs)

---

**Your D3 learning environment with chart builder will be live shortly after pushing to GitHub!**