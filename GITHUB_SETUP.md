# 🐙 Shape Memory Space - GitHub Storage Setup

## Why GitHub Storage?
- ✅ **Free**: 1GB free storage per repository
- ✅ **No Size Limits**: Upload large high-quality images
- ✅ **Global CDN**: Fast image loading worldwide
- ✅ **Version Control**: Your images are backed up with history
- ✅ **No Billing**: Never requires payment setup
- ✅ **Reliable**: GitHub's 99.9% uptime guarantee

## 📋 Setup Steps

### Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in (create account if needed)
2. Click the **"+" icon** → **"New repository"**
3. Repository details:
   - **Name**: `memory-space-images` (or any name you prefer)
   - **Description**: "Storage for Shape Memory Space photos"
   - **Visibility**: **Public** (required for direct image access)
   - **Initialize**: Check "Add a README file"
4. Click **"Create repository"**

### Step 2: Generate Personal Access Token

1. Go to **GitHub Settings** (click your profile → Settings)
2. Scroll down to **"Developer settings"** (bottom of left sidebar)
3. Click **"Personal access tokens"** → **"Tokens (classic)"**
4. Click **"Generate new token (classic)"**
5. Token configuration:
   - **Note**: `Shape Memory Space Images`
   - **Expiration**: Choose `No expiration` or `1 year`
   - **Scopes**: Check `public_repo` (or full `repo` if using private repository)
6. Click **"Generate token"**
7. **⚠️ IMPORTANT**: Copy the token immediately! You won't see it again.

### Step 3: Configure Your App

Open `script-github.js` and update the configuration:

```javascript
const GITHUB_CONFIG = {
    username: "your-actual-github-username",    // Replace with your GitHub username
    repository: "memory-space-images",          // Replace with your repo name
    token: "ghp_xxxxxxxxxxxxxxxxxxxx",          // Replace with your token
    branch: "main"                              // Usually "main" or "master"
};
```

### Step 4: Test Your Setup

1. Make sure your local server is running:
   ```bash
   python -m http.server 8000
   ```

2. Open http://localhost:8000

3. Try uploading an image - you should see:
   - "Uploading 1 image(s) to GitHub..." notification
   - "Successfully uploaded 1 memories to space!" success message
   - Your image floating in the galaxy

4. Check your GitHub repository - you should see:
   - A new `memories/` folder
   - Your uploaded image file
   - A commit message like "Add memory: memories/1234567890_image.jpg"

## 🔧 Configuration Examples

### Example 1: Public Repository
```javascript
const GITHUB_CONFIG = {
    username: "john_doe",
    repository: "my-memory-space",
    token: "ghp_1234567890abcdefghijklmnopqrstuvwxyz",
    branch: "main"
};
```

### Example 2: Organization Repository
```javascript
const GITHUB_CONFIG = {
    username: "my-organization",  // Organization name, not your username
    repository: "shared-memories",
    token: "ghp_your_token_here",
    branch: "main"
};
```

## 📁 How It Works

### Storage Structure:
```
your-repository/
├── README.md
└── memories/
    ├── 1692640123456_vacation_photo.jpg
    ├── 1692640234567_family_dinner.png
    └── 1692640345678_sunset_beach.jpg
```

### Data Flow:
1. **Upload**: Image → Base64 → GitHub API → Raw GitHub URL
2. **Metadata**: GitHub URL + photo info → Firestore Database
3. **Display**: Load image from `raw.githubusercontent.com` → Canvas
4. **Delete**: Remove from both GitHub and Firestore

## 🌟 Benefits

### Large File Support:
- **File Size**: Up to 100MB per file (GitHub limit)
- **Total Storage**: 1GB free per repository (create multiple repos if needed)
- **File Types**: Any image format (JPG, PNG, GIF, WebP, etc.)

### Performance:
- **Global CDN**: GitHub's worldwide content delivery network
- **Fast Loading**: Direct image URLs, no API calls needed for viewing
- **Caching**: Images cached by browsers and CDN

### Reliability:
- **Backup**: All images are version controlled
- **History**: Never lose an image, GitHub keeps all versions
- **Uptime**: GitHub's enterprise-grade infrastructure
- **HTTPS**: All images served over secure connections

## 🔒 Security & Privacy

### Public vs Private Repositories:
- **Public Repo**: Free, unlimited repos, but images are publicly accessible
- **Private Repo**: Requires GitHub Pro ($4/month), but images are private

### Token Security:
- Store tokens securely - never commit them to public repositories
- Use environment variables for production deployments
- Regenerate tokens periodically for security

## 🚀 Deployment Options

### Option 1: Static Hosting (Hide Token)
For production, move the token to a backend API:

```javascript
// Instead of direct token in frontend
const uploadResponse = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData
});
```

### Option 2: Environment Variables
Use build-time environment variables:

```javascript
const GITHUB_CONFIG = {
    username: process.env.REACT_APP_GITHUB_USERNAME,
    repository: process.env.REACT_APP_GITHUB_REPO,
    token: process.env.REACT_APP_GITHUB_TOKEN,
    branch: "main"
};
```

## 🛠 Troubleshooting

### Common Issues:

1. **"GitHub upload failed: Bad credentials"**
   - Check your token is correct
   - Ensure token has `public_repo` scope
   - Make sure token hasn't expired

2. **"GitHub upload failed: Not Found"**
   - Verify username and repository name are correct
   - Ensure repository exists and is accessible

3. **Images not loading in gallery**
   - Check if repository is public
   - Verify the raw GitHub URLs are accessible
   - Look for CORS issues in browser console

4. **Upload successful but image doesn't appear**
   - Wait a few seconds for GitHub's CDN to update
   - Check browser console for image loading errors

## 💡 Tips & Best Practices

### Image Optimization:
- Compress images before upload for faster loading
- Use modern formats like WebP when possible
- Consider resizing very large images

### Organization:
- Use descriptive filenames
- Create subfolders for different albums: `memories/vacation/`, `memories/family/`
- Add metadata to commit messages

### Scaling:
- Create multiple repositories if you exceed 1GB
- Use repository naming like: `memories-2025`, `memories-2026`
- Archive old repositories to free up space

## 🎉 Ready to Go!

Once configured, your Shape Memory Space will:
- Store unlimited large images on GitHub
- Sync across all devices via Firestore metadata  
- Work anywhere in the world with GitHub's CDN
- Never require billing or payment setup
- Provide enterprise-grade reliability and backup

Your memories will float in a galaxy powered by the world's largest code hosting platform! 🌌✨
