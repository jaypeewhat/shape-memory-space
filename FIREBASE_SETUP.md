# Shape Memory Space - Firebase Setup Guide

## Overview
Shape Memory Space now uses Firebase for online storage, allowing you to deploy your galaxy photo viewer anywhere and have persistent, cloud-based storage for all uploaded memories.

## Firebase Setup Steps

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `shape-memory-space` (or your preferred name)
4. Follow the setup wizard

### 2. Enable Required Services

#### Firestore Database
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development (change to production rules later)
4. Select a location closest to your users

#### Firebase Storage
1. Go to "Storage" in the Firebase console
2. Click "Get started"
3. Choose "Start in test mode" for development
4. Use the same location as Firestore

### 3. Get Your Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" and select the web icon (</>) 
4. Register your app with name: "Shape Memory Space"
5. Copy the Firebase configuration object

### 4. Update Configuration
Replace the placeholder config in `script-firebase.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key-here",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-actual-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-actual-sender-id",
    appId: "your-actual-app-id"
};
```

### 5. Set Up Security Rules (Important for Production!)

#### Firestore Rules
Go to Firestore → Rules and use these rules:

**For Development (Test Mode):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for 30 days (test mode)
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 9, 21);
    }
  }
}
```

**For Production (Recommended):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow access to memories collection
    match /memories/{memoryId} {
      allow read: if true; // Anyone can view memories
      allow write: if true; // Anyone can add memories (change this for private galleries)
      allow delete: if true; // Anyone can delete memories (change this for protection)
    }
    
    // Deny access to all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**For Private/Authenticated Use:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /memories/{memoryId} {
      // Only authenticated users can access
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage Rules
Go to Storage → Rules and use these rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /memories/{fileName} {
      allow read, write: if true; // Change this for production
    }
  }
}
```

### 6. Deploy Your Application

#### Option 1: Firebase Hosting (Recommended)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run `firebase login` to authenticate
3. In your project directory, run `firebase init hosting`
4. Select your Firebase project
5. Use `public` as the public directory (or current directory)
6. Configure as single-page app: Yes
7. Run `firebase deploy` to deploy

#### Option 2: Other Hosting Services
You can deploy to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

Just upload your HTML, CSS, and JavaScript files.

## Features Included

### Online Storage
- ✅ Photos stored in Firebase Storage
- ✅ Metadata stored in Firestore Database
- ✅ Automatic synchronization across devices
- ✅ Persistent storage that survives browser clearing

### Real-time Capabilities
- ✅ Multiple users can add photos simultaneously
- ✅ Changes appear instantly across all connected devices
- ✅ No data loss during browser refresh

### Advanced Features
- ✅ Photo upload with progress tracking
- ✅ Error handling and user notifications
- ✅ Photo deletion with cleanup
- ✅ Batch operations for clearing all photos
- ✅ Image optimization and resizing (automatic)

## Security Considerations for Production

1. **Authentication**: Add Firebase Auth to restrict who can upload photos
2. **Storage Rules**: Implement proper security rules
3. **File Size Limits**: Set maximum file size limits
4. **Content Moderation**: Consider adding image content filtering
5. **Rate Limiting**: Implement upload rate limits

## Cost Considerations

Firebase offers generous free tiers:
- **Firestore**: 50,000 reads/day, 20,000 writes/day
- **Storage**: 5GB total storage, 1GB/day transfer
- **Hosting**: 10GB bandwidth/month

For most personal projects, this is completely free!

## Troubleshooting

### Common Issues:
1. **Photos not loading**: Check Firebase config and internet connection
2. **Upload fails**: Verify Storage rules and file size limits
3. **Database errors**: Check Firestore rules and project ID

### Getting Help:
- Check browser console for error messages
- Verify Firebase project settings
- Ensure all services are enabled in Firebase console

## Next Steps

1. Set up your Firebase project following steps 1-3
2. Replace the config in `script-firebase.js`
3. Test locally by opening `index.html`
4. Deploy using Firebase Hosting or your preferred service
5. Share your beautiful Shape Memory Space with others!

Your galaxy of memories will now float forever in the cloud! ✨🌌
