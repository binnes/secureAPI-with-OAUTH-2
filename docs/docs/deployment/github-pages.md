# Deploying Documentation to GitHub Pages

This guide explains how to deploy the MkDocs documentation to GitHub Pages.

## Prerequisites

- Git repository on GitHub
- Python 3.8+ installed
- Write access to the repository

## Option 1: Manual Deployment

### Step 1: Install MkDocs

```bash
# Install MkDocs and dependencies
pip install -r requirements.txt

# Verify installation
mkdocs --version
```

### Step 2: Build Documentation

```bash
# Build the documentation
mkdocs build

# This creates a 'site' directory with static HTML
```

### Step 3: Deploy to GitHub Pages

```bash
# Deploy to gh-pages branch
mkdocs gh-deploy

# This will:
# 1. Build the documentation
# 2. Push to gh-pages branch
# 3. Make it available at https://yourusername.github.io/authentication_test
```

### Step 4: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings"
3. Scroll to "Pages" section
4. Under "Source", select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Click "Save"

Your documentation will be available at:
```
https://yourusername.github.io/authentication_test
```

## Option 2: GitHub Actions (Automated)

### Step 1: Create Workflow File

Create `.github/workflows/docs.yml`:

```yaml
name: Deploy Documentation

on:
  push:
    branches:
      - main
    paths:
      - 'docs/**'
      - 'mkdocs.yml'
      - 'requirements.txt'
      - '.github/workflows/docs.yml'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: 3.x

      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          key: ${{ github.ref }}
          path: .cache

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Build and deploy
        run: mkdocs gh-deploy --force
```

### Step 2: Commit and Push

```bash
git add .github/workflows/docs.yml
git commit -m "Add GitHub Actions workflow for documentation"
git push origin main
```

### Step 3: Verify Deployment

1. Go to "Actions" tab in your repository
2. Watch the workflow run
3. Once complete, visit your documentation site

## Option 3: Using Mike (Versioned Documentation)

Mike allows you to maintain multiple versions of documentation.

### Install Mike

```bash
pip install mike
```

### Deploy Version

```bash
# Deploy version 1.0
mike deploy --push --update-aliases 1.0 latest

# Set default version
mike set-default --push latest
```

### View Versions Locally

```bash
mike serve
```

Visit: `http://localhost:8000`

## Customizing Deployment

### Custom Domain

1. Create `docs/CNAME` file:
   ```
   docs.example.com
   ```

2. Configure DNS:
   - Add CNAME record pointing to `yourusername.github.io`

3. In GitHub Settings → Pages:
   - Enter custom domain
   - Enable "Enforce HTTPS"

### Update mkdocs.yml

```yaml
site_url: https://docs.example.com
repo_url: https://github.com/yourusername/authentication_test
```

## Local Development

### Serve Locally

```bash
# Start development server
mkdocs serve

# With live reload
mkdocs serve --dev-addr=0.0.0.0:8000
```

Visit: `http://localhost:8000`

### Build Only

```bash
# Build without deploying
mkdocs build

# Build to custom directory
mkdocs build --site-dir custom_site
```

### Clean Build

```bash
# Remove site directory
rm -rf site

# Rebuild
mkdocs build
```

## Troubleshooting

### Build Fails

Check for errors:

```bash
mkdocs build --verbose
```

Common issues:
- Missing dependencies: `pip install -r requirements.txt`
- Invalid YAML in mkdocs.yml
- Broken links in documentation

### Deployment Fails

1. Check GitHub Actions logs
2. Verify permissions:
   ```yaml
   permissions:
     contents: write
   ```
3. Ensure gh-pages branch exists

### Site Not Updating

1. Clear browser cache
2. Wait a few minutes for GitHub Pages to update
3. Check GitHub Actions workflow completed successfully
4. Verify gh-pages branch has new commits

### 404 Errors

1. Check `site_url` in mkdocs.yml
2. Verify GitHub Pages is enabled
3. Ensure gh-pages branch is selected as source

## Best Practices

### 1. Version Control

Don't commit the `site/` directory:

```gitignore
# .gitignore
site/
.cache/
```

### 2. Documentation Structure

Keep documentation organized:

```
docs/
├── index.md
├── getting-started/
├── build/
├── keycloak/
├── api/
├── config/
├── troubleshooting/
└── development/
```

### 3. Regular Updates

Update documentation with code changes:

```bash
# After code changes
git add docs/
git commit -m "Update documentation"
git push
```

### 4. Review Before Deploy

Always review locally:

```bash
mkdocs serve
# Review at http://localhost:8000
mkdocs gh-deploy
```

### 5. Use Branches

For major documentation changes:

```bash
git checkout -b docs/update-api-guide
# Make changes
git push origin docs/update-api-guide
# Create pull request
```

## Monitoring

### Analytics

Add Google Analytics to mkdocs.yml:

```yaml
extra:
  analytics:
    provider: google
    property: G-XXXXXXXXXX
```

### Search

MkDocs Material includes built-in search. No configuration needed.

## Maintenance

### Update Dependencies

```bash
# Update all dependencies
pip install --upgrade -r requirements.txt

# Update specific package
pip install --upgrade mkdocs-material
```

### Check for Broken Links

```bash
# Install linkchecker
pip install linkchecker

# Check links
mkdocs build
linkchecker site/
```

## Additional Resources

- [MkDocs Documentation](https://www.mkdocs.org/)
- [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Mike Documentation](https://github.com/jimporter/mike)

## Next Steps

- [Contributing Guide](../development/contributing.md)
- [Project Structure](../development/structure.md)