# Vercel Deployment Guide for Shape Memory Space

## Prerequisites
1. Your code is pushed to GitHub
2. You have a Vercel account (vercel.com)
3. You have your GitHub Personal Access Token ready

## Deployment Steps

### 1. Connect Repository to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `jaypeewhat/shape-memory-space`
4. Leave all settings as default and click "Deploy"

### 2. Configure Environment Variables
After deployment, you MUST add these environment variables in Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Go to Settings → Environment Variables
3. Add these three variables:

```
GITHUB_TOKEN = your_github_personal_access_token_here
GITHUB_USERNAME = jaypeewhat
GITHUB_REPOSITORY = memory-space-images
```

### 3. Redeploy
After adding environment variables:
1. Go to Deployments tab
2. Click the three dots (...) on your latest deployment
3. Click "Redeploy" 
4. Choose "Use existing Build Cache" for faster deployment

### 4. Test Upload Functionality
1. Visit your deployed site
2. Access admin mode:
   - **Desktop**: Type "admin" anywhere on the page
   - **Mobile**: Tap the "Admin" button in top-right corner
   - **Alternative**: Triple-tap the canvas or long-press for 2 seconds
3. Try uploading a photo to test the secure API

## Important Notes
- The GitHub token is securely stored in Vercel environment variables
- Local development still works with the token in your local file
- The app automatically detects if it's running locally or deployed
- All uploads go through the secure Vercel API when deployed

## Troubleshooting
If uploads don't work after deployment:
1. Check that all 3 environment variables are set correctly in Vercel
2. Make sure you redeployed after setting environment variables
3. Check the browser console for any error messages
4. Verify your GitHub token has repository write permissions

## Security Features
✅ GitHub token never exposed in public code
✅ Token stored securely in Vercel environment variables
✅ API endpoint validates all requests
✅ CORS properly configured for cross-origin requests
