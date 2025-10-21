# Quick Start: GitHub Pages Deployment

## First Time Setup (5 minutes)

### Step 1: Push to GitHub

```bash
# If this is a new repository
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/web-records.git
git push -u origin main

# If repository already exists
git add .
git commit -m "Add GitHub Actions deployment"
git push origin main
```

### Step 2: Enable GitHub Pages

1. Go to: `https://github.com/YOUR_USERNAME/web-records/settings/pages`
2. Under **Source**, select: **GitHub Actions**
3. Click **Save**

### Step 3: Wait for Deployment

1. Go to: `https://github.com/YOUR_USERNAME/web-records/actions`
2. Watch the "Deploy to GitHub Pages" workflow
3. Wait ~2-3 minutes for completion
4. Your site is live at: `https://YOUR_USERNAME.github.io/web-records/`

## That's It! 🎉

Every push to `main` will now automatically deploy.

---

## Daily Use

Make changes and push:

```bash
git add .
git commit -m "Your change description"
git push origin main
```

The site updates automatically in 2-3 minutes.

---

## Verify It's Working

1. **Check Actions tab**: Green checkmark ✓
2. **Visit your URL**: `https://YOUR_USERNAME.github.io/web-records/`
3. **Test the app**: Enter API key and try recording

---

## Troubleshooting

**Build fails?**
```bash
# Test locally first
npm run build

# If it works locally, push again
git push origin main
```

**Site not updating?**
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- Wait 5 minutes and try again
- Check Actions tab for errors

**404 error?**
- Verify Pages is enabled at Settings > Pages
- Source should be "GitHub Actions"
- Check deployment completed successfully

---

## Need Help?

Full documentation: See `DEPLOYMENT.md`
