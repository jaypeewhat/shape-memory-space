// Firebase Configuration (for metadata only)
const firebaseConfig = {
    apiKey: "AIzaSyDQIATsqgmEMhdpSsM_DB11YXH18p3UG08",
    authDomain: "memoryspace-fe5ab.firebaseapp.com",
    projectId: "memoryspace-fe5ab",
    storageBucket: "memoryspace-fe5ab.firebasestorage.app",
    messagingSenderId: "618698649513",
    appId: "1:618698649513:web:eac0d49ab0fceb25eb9eb8"
};

// GitHub Configuration - Secure Setup
const GITHUB_CONFIG = {
    username: "jaypeewhat",
    repository: "memory-space-images",
    token: "YOUR_GITHUB_TOKEN_HERE", // ⚠️ Replace with your actual token
    branch: "main"
};

// Initialize Firebase (only Firestore for metadata)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class MinimalMemorySpace {
    constructor() {
        this.photos = [];
        this.photoGrid = document.getElementById('photoGrid');
        this.setupEventListeners();
        this.loadPhotosFromDatabase();
    }

    setupEventListeners() {
        const photoUpload = document.getElementById('photoUpload');
        const modal = document.getElementById('photoModal');
        const closeModal = document.querySelector('.close-modal');

        photoUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        closeModal.addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;
        
        this.showNotification(`Uploading ${files.length} image(s)...`, 'info');
        
        try {
            const uploadPromises = files.map(file => this.uploadPhoto(file));
            await Promise.all(uploadPromises);
            this.showNotification(`Successfully uploaded ${files.length} photos!`);
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification('Upload failed. Please try again.', 'error');
        }
        
        event.target.value = '';
    }

    async uploadPhoto(file) {
        if (!file.type.startsWith('image/')) {
            throw new Error('Please upload only image files');
        }

        try {
            // Convert image to base64
            const base64Data = await this.fileToBase64(file);
            const base64Content = base64Data.split(',')[1];
            
            // Create unique filename
            const timestamp = Date.now();
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filename = `memories/${timestamp}_${sanitizedName}`;
            
            // Upload to GitHub
            const githubUrl = await this.uploadToGitHub(filename, base64Content);
            
            // Create photo metadata
            const photoData = {
                id: `photo_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                githubUrl: githubUrl,
                githubPath: filename,
                uploadDate: new Date().toISOString(),
                size: file.size,
                type: file.type
            };

            // Save metadata to Firestore
            await db.collection('memories').doc(photoData.id).set(photoData);
            
            // Add to local array and display
            this.photos.push(photoData);
            this.addPhotoToGrid(photoData);

        } catch (error) {
            console.error('Error uploading photo:', error);
            throw error;
        }
    }

    async uploadToGitHub(path, base64Content) {
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/contents/${path}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Add memory: ${path}`,
                content: base64Content,
                branch: GITHUB_CONFIG.branch
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`GitHub upload failed: ${error.message || response.statusText}`);
        }

        return `https://raw.githubusercontent.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/${GITHUB_CONFIG.branch}/${path}`;
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async loadPhotosFromDatabase() {
        try {
            const snapshot = await db.collection('memories').get();
            
            snapshot.forEach(doc => {
                const photoData = doc.data();
                this.photos.push(photoData);
                this.addPhotoToGrid(photoData);
            });
            
        } catch (error) {
            console.error('Error loading photos:', error);
            this.showNotification('Failed to load photos', 'error');
        }
    }

    addPhotoToGrid(photoData) {
        const photoItem = document.createElement('div');
        photoItem.className = 'photo-item';
        photoItem.onclick = () => this.showPhotoModal(photoData);
        
        const img = document.createElement('img');
        img.src = photoData.githubUrl;
        img.alt = photoData.name;
        img.loading = 'lazy';
        
        photoItem.appendChild(img);
        this.photoGrid.appendChild(photoItem);
    }

    showPhotoModal(photo) {
        const modal = document.getElementById('photoModal');
        const modalImage = document.getElementById('modalImage');

        modalImage.src = photo.githubUrl;
        modalImage.alt = photo.name;
        
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('active'), 10);
    }

    closeModal() {
        const modal = document.getElementById('photoModal');
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'error' ? '#f44336' : type === 'info' ? '#2196F3' : '#4CAF50'
        });
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MinimalMemorySpace();
});
