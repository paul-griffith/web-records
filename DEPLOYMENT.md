# Deployment Guide

## GitHub Pages Deployment with GitHub Actions

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

## Initial Setup

### 1. Create GitHub Repository

If you haven't already:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Veterinary SOAP Note Generator"

# Add remote repository
git remote add origin https://github.com/yourusername/web-records.git

# Push to GitHub
git push -u origin main
```

### 2. Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under **Source**, select **GitHub Actions**
5. Click **Save**

That's it! Your site will now automatically deploy on every push to `main`.

## How It Works

The workflow file `.github/workflows/deploy.yml` does the following:

1. **Triggers** on:
   - Every push to the `main` branch
   - Manual trigger via "Actions" tab (workflow_dispatch)

2. **Build Job**:
   - Checks out your code
   - Sets up Node.js 20
   - Installs dependencies (`npm ci`)
   - Builds production bundle (`npm run build`)
   - Uploads the `dist/` folder as an artifact

3. **Deploy Job**:
   - Takes the build artifact
   - Deploys to GitHub Pages
   - Updates your live site

## Deployment Process

### Automatic Deployment

Simply push changes to main:

```bash
# Make your changes
git add .
git commit -m "Add new feature"
git push origin main
```

The workflow will automatically:
- Build your application
- Deploy to GitHub Pages
- Make it live at: `https://yourusername.github.io/web-records/`

### Monitor Deployment

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You'll see the workflow running
4. Click on it to see detailed logs
5. Wait for completion (usually 2-3 minutes)

### Deployment Status Badge

Add to your README.md:

```markdown
![Deploy Status](https://github.com/yourusername/web-records/actions/workflows/deploy.yml/badge.svg)
```

## Manual Deployment Trigger

You can manually trigger a deployment:

1. Go to **Actions** tab
2. Click **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select branch (main)
5. Click **Run workflow**

## Troubleshooting

### Deployment Fails

**Check the Actions log:**
1. Go to Actions tab
2. Click on the failed workflow run
3. Expand the failed step to see error details

**Common issues:**

**1. Build fails**
```
Error: npm run build failed
```
**Solution:** Test build locally first:
```bash
npm run build
```
Fix any build errors before pushing.

**2. Pages not enabled**
```
Error: GitHub Pages is not enabled
```
**Solution:** Enable GitHub Pages in Settings > Pages > Source > GitHub Actions

**3. Permissions error**
```
Error: Resource not accessible by integration
```
**Solution:** The workflow file already has correct permissions. If this persists:
- Go to Settings > Actions > General
- Under "Workflow permissions", select "Read and write permissions"
- Save

**4. Node version mismatch**
```
Error: Node version not compatible
```
**Solution:** Update Node version in `.github/workflows/deploy.yml`:
```yaml
node-version: '20'  # Change to your required version
```

### Site Not Updating

**Clear browser cache:**
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

**Check deployment URL:**
- Verify at Settings > Pages for the correct URL
- May take 1-2 minutes to propagate

**Check workflow completion:**
- Ensure workflow completed successfully
- Green checkmark in Actions tab

## Custom Domain

To use a custom domain:

1. Add a `CNAME` file to the `public/` folder (create if doesn't exist):
   ```
   yourdomain.com
   ```

2. Configure DNS:
   - Add CNAME record pointing to: `yourusername.github.io`
   - Or A records to GitHub's IPs

3. In GitHub Settings > Pages:
   - Enter custom domain
   - Enable "Enforce HTTPS"

4. Update webpack config to handle custom domain

## Environment-Specific Configuration

If you need different configurations for production:

1. Create a `.env.production` file
2. Use in webpack config:
   ```javascript
   const isProduction = process.env.NODE_ENV === 'production';
   ```

## Performance Optimization

The build process automatically:
- Minifies JavaScript
- Optimizes assets
- Generates sourcemaps
- Bundles dependencies

For additional optimization:
- Enable gzip compression (automatic with GitHub Pages)
- Use CDN for large assets (if needed)
- Lazy load heavy modules

## Rollback

To rollback to a previous version:

1. **Via Git:**
   ```bash
   # Find the commit hash you want to rollback to
   git log

   # Revert to that commit
   git revert <commit-hash>
   git push origin main
   ```

2. **Via GitHub:**
   - Go to Actions tab
   - Find successful previous deployment
   - Click "Re-run jobs"

## Security Considerations

**Secrets Management:**
- Never commit API keys or secrets
- Use GitHub Secrets for sensitive data (if needed in build)
- Settings > Secrets and variables > Actions

**Branch Protection:**
Consider enabling branch protection:
- Settings > Branches > Add rule
- Require pull request reviews
- Require status checks to pass

## Local Testing of Production Build

Test the production build locally before deploying:

```bash
# Build production version
npm run build

# Serve the dist folder locally
npx serve dist

# Or use http-server
npx http-server dist
```

Open `http://localhost:5000` to test.

## Workflow Customization

Edit `.github/workflows/deploy.yml` to customize:

**Deploy only on tags:**
```yaml
on:
  push:
    tags:
      - 'v*'
```

**Deploy from specific branch:**
```yaml
on:
  push:
    branches:
      - production
```

**Add testing before deploy:**
```yaml
- name: Run tests
  run: npm test
```

**Add notifications:**
```yaml
- name: Notify on success
  if: success()
  run: echo "Deployment successful!"
```

## Cost

GitHub Pages is **free** for public repositories with:
- 100GB bandwidth/month
- 100GB storage
- Unlimited builds via Actions (with limits on minutes)

For private repositories:
- Free for personal accounts (with Actions minutes limit)
- Check your Actions usage in Settings > Billing

## Support

**GitHub Pages:**
- https://docs.github.com/pages

**GitHub Actions:**
- https://docs.github.com/actions

**Issues:**
- Open an issue on the repository for deployment problems
