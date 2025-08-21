# Shape Memory Space 🌌✨

A beautiful, galaxy-inspired photo viewer where your memories float gracefully through space like stars in the cosmos. Upload your favorite photos and watch them drift, rotate, and dance in an infinite digital galaxy.

## ✨ Features

### 🌟 Galaxy Experience
- **Floating Photos**: Your images drift through space with realistic physics
- **Star Field**: Twinkling stars create a magical cosmic atmosphere
- **Shooting Stars**: Beautiful meteors streak across the sky with particle effects ✨
- **Smooth Animations**: Photos rotate, scale, and move with fluid motion
- **Interactive**: Click any floating photo to view it for 3 seconds (auto-close)
- **Secret Admin Access**: Hidden password-protected upload system

### ☁️ Cloud Storage (NEW!)
- **Firebase Integration**: All photos stored securely in the cloud
- **Cross-Device Sync**: Access your memories from any device
- **Persistent Storage**: Photos survive browser clearing and computer changes
- **Real-time Updates**: Multiple users can add photos simultaneously
- **Global Access**: Deploy anywhere and access your galaxy from the world

### 🎮 Controls
- **Upload Multiple Photos**: Drag & drop or select multiple images at once
- **Pause/Resume**: Control the cosmic motion
- **Speed Control**: Adjust floating speed (0.5x to 3x)
- **Clear Space**: Remove all memories (with confirmation)
- **Photo Management**: Delete individual photos from the modal view

### 📱 Responsive Design
- **Full-screen Canvas**: Adapts to any screen size
- **Mobile Friendly**: Touch-optimized controls
- **Elegant UI**: Minimal interface that doesn't interrupt the beauty

## 🚀 Quick Start

### Option 1: Use with Firebase (Recommended for Deployment)
1. Follow the detailed setup guide in `FIREBASE_SETUP.md`
2. Create a Firebase project and enable Firestore + Storage  
3. Replace the config in `script-firebase.js` with your Firebase credentials
4. Deploy using Firebase Hosting or any static hosting service

### Option 2: Local Development
1. Open `index.html` in a modern web browser
2. Start uploading photos to create your memory galaxy
3. Photos will be stored locally in your browser

## 🛠 Technology Stack

- **Frontend**: Vanilla JavaScript + HTML5 Canvas
- **Animation**: RequestAnimationFrame for smooth 60fps animations
- **Database**: Firebase Firestore for metadata
- **Storage**: Firebase Cloud Storage for images
- **Hosting**: Firebase Hosting (or any static host)
- **Responsive**: Pure CSS with mobile-first design

## 🌐 Deployment Options

- **Firebase Hosting** (recommended - integrated with storage)
- **Vercel** - Easy GitHub integration
- **Netlify** - Drag & drop deployment  
- **GitHub Pages** - Free hosting for public repos
- **Any static hosting** - Just upload the files!

## 🔧 Configuration

### Firebase Setup (for online storage):
```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com", 
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### Custom Styling:
Modify `styles.css` to change:
- Galaxy colors and gradients
- Photo border styles and glows
- UI panel appearance
- Animation speeds and effects

## 📝 Usage

1. **Upload Photos**: Click "Add Memory" or drag files onto the upload area
2. **Explore**: Watch your photos float through the galaxy
3. **Interact**: Click floating photos to view them full-size
4. **Control**: Use the control panel to pause, adjust speed, or clear space
5. **Share**: Send the deployed URL to others to view your memory galaxy

## 🎨 Customization Ideas

- Change galaxy colors by modifying the gradient backgrounds
- Adjust physics parameters for different floating behaviors
- Add photo categories with color-coded borders
- Implement photo tagging and filtering
- Add background music for a more immersive experience
- Create photo trails or particle effects

## 🔒 Security Notes

For production deployment:
- Set up proper Firebase Security Rules
- Implement user authentication
- Add file type and size restrictions
- Consider content moderation for public galleries

## 💡 Inspiration

Shape Memory Space transforms your photo collection into an interactive, living artwork. Each memory becomes a celestial object in your personal universe, creating a unique and beautiful way to revisit cherished moments.

Perfect for:
- Personal photo galleries
- Family memory sharing
- Art installations  
- Memorial galleries
- Creative portfolios
- Interactive displays

## 🚀 Future Enhancements

- [ ] User authentication and private galleries
- [ ] Photo albums and categories
- [ ] Social sharing capabilities
- [ ] Advanced animation effects
- [ ] Audio integration
- [ ] VR/AR viewing modes
- [ ] Collaborative galleries
- [ ] Photo editing tools

---

**Transform your memories into a living galaxy of moments. Every photo tells a story, every float carries an emotion, every click reveals a universe of memories.** 🌌

*Made with ❤️ for preserving beautiful moments*