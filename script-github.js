// Firebase Configuration (for metadata only)
const firebaseConfig = {
    apiKey: "AIzaSyDQIATsqgmEMhdpSsM_DB11YXH18p3UG08",
    authDomain: "memoryspace-fe5ab.firebaseapp.com",
    projectId: "memoryspace-fe5ab",
    storageBucket: "memoryspace-fe5ab.firebasestorage.app",
    messagingSenderId: "618698649513",
    appId: "1:618698649513:web:eac0d49ab0fceb25eb9eb8"
};

// GitHub Configuration - Secure API Approach
const GITHUB_CONFIG = {
    username: "jaypeewhat",
    repository: "memory-space-images", 
    token: "", // Token removed for security - will use Vercel API when deployed
    branch: "main",
    useAPI: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' // Use API when deployed
};

// Debug the API usage
console.log('Current hostname:', window.location.hostname);
console.log('Will use API:', GITHUB_CONFIG.useAPI);

// Test API connection function
async function testAPIConnection() {
    if (GITHUB_CONFIG.useAPI) {
        try {
            console.log('Testing API connection...');
            const response = await fetch('/api/github?test=env');
            const result = await response.json();
            console.log('API Environment Test:', result);
        } catch (error) {
            console.error('API Test Failed:', error);
        }
    }
}

// Call test on page load
setTimeout(testAPIConnection, 1000);

// 🎉 READY TO USE! 
// Your Shape Memory Space is now configured to store large images on GitHub
// The images will be stored at: https://github.com/jaypeewhat/memory-space-images

// Initialize Firebase (only Firestore for metadata)
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization failed:', error);
}

class ShapeMemorySpace {
    constructor() {
        this.canvas = document.getElementById('memoryCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.photos = [];
        this.animationId = null;
        this.isPaused = false;
        this.speed = 1;
        this.stars = [];
        this.shootingStars = [];
        this.isAuthenticated = false;
        this.uploadPassword = "trishatime"; // Change this password!
        
        this.setupCanvas();
        this.createStars();
        this.createShootingStars();
        this.setupEventListeners();
        this.setupSecretAccess();
        this.loadPhotosFromDatabase();
        this.animate();
        this.checkUploadAccess();
    }

    setupSecretAccess() {
        let secretCode = '';
        const targetCode = 'admin'; // Type 'admin' to show admin panel
        let tapCount = 0;
        let tapTimer = null;
        
        // Desktop: Type "admin"
        document.addEventListener('keydown', (e) => {
            secretCode += e.key.toLowerCase();
            if (secretCode.length > targetCode.length) {
                secretCode = secretCode.slice(-targetCode.length);
            }
            
            if (secretCode === targetCode) {
                this.showAdminPanel();
                secretCode = ''; // Reset
            }
            
            if (e.key === 'Escape') this.closeModal();
        });
        
        // Mobile: Triple tap the title
        const title = document.querySelector('h1');
        if (title) {
            title.addEventListener('click', () => {
                tapCount++;
                
                if (tapTimer) {
                    clearTimeout(tapTimer);
                }
                
                tapTimer = setTimeout(() => {
                    if (tapCount >= 3) {
                        this.showAdminPanel();
                        this.showNotification('Secret admin panel activated!', 'info');
                    }
                    tapCount = 0;
                }, 1000); // Reset after 1 second
            });
        }
    }

    showAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.style.display = 'block';
            const passwordInput = document.getElementById('adminPassword');
            if (passwordInput) {
                passwordInput.focus();
            }
        }
    }

    hideAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.style.display = 'none';
            const passwordInput = document.getElementById('adminPassword');
            if (passwordInput) {
                passwordInput.value = '';
            }
        }
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createStars() {
        this.stars = [];
        const starCount = 200;
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.8 + 0.2,
                twinkle: Math.random() * 0.02 + 0.01
            });
        }
    }

    createShootingStars() {
        this.shootingStars = [];
        this.createNewShootingStar();
        
        // Create a new shooting star every 3-8 seconds
        setInterval(() => {
            if (Math.random() < 0.7) { // 70% chance
                this.createNewShootingStar();
            }
        }, Math.random() * 5000 + 3000);
    }

    createNewShootingStar() {
        const side = Math.random() < 0.5 ? 'left' : 'top';
        let startX, startY, endX, endY;

        if (side === 'left') {
            // Start from left edge, go to right-bottom
            startX = -100;
            startY = Math.random() * this.canvas.height * 0.3;
            endX = this.canvas.width + 100;
            endY = startY + (Math.random() * 200 + 100);
        } else {
            // Start from top edge, go to bottom-right
            startX = Math.random() * this.canvas.width * 0.3;
            startY = -100;
            endX = startX + (Math.random() * 300 + 200);
            endY = this.canvas.height + 100;
        }

        const shootingStar = {
            startX, startY, endX, endY,
            x: startX,
            y: startY,
            progress: 0,
            speed: Math.random() * 0.02 + 0.01,
            length: Math.random() * 80 + 40,
            brightness: 1,
            color: this.getRandomStarColor(),
            particles: []
        };

        this.shootingStars.push(shootingStar);
    }

    getRandomStarColor() {
        const colors = [
            '#ffffff', '#fff9e6', '#e6f2ff', 
            '#ffe6f2', '#f0e6ff', '#e6ffe6',
            '#ffd700', '#87ceeb', '#dda0dd'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    setupEventListeners() {
        const photoUpload = document.getElementById('photoUpload');
        const clearSpace = document.getElementById('clearSpace');
        const pauseMotion = document.getElementById('pauseMotion');
        const speedControl = document.getElementById('speedControl');
        const modal = document.getElementById('photoModal');
        const closeModal = document.querySelector('.close-modal');
        const deletePhoto = document.getElementById('deletePhoto');

        if (photoUpload) {
            photoUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        }
        
        if (clearSpace) {
            clearSpace.addEventListener('click', () => this.clearAllPhotos());
        }
        
        if (pauseMotion) {
            pauseMotion.addEventListener('click', () => this.togglePause());
        }
        
        if (speedControl) {
            speedControl.addEventListener('click', () => this.cycleSpeed());
        }
        
        if (closeModal && modal) {
            closeModal.addEventListener('click', () => this.closeModal());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal();
            });
        }
        
        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    checkUploadAccess() {
        // Check if password is already stored in session
        const storedAuth = sessionStorage.getItem('memorySpaceAuth');
        if (storedAuth === this.uploadPassword) {
            this.isAuthenticated = true;
            this.showUploadSection();
        }
    }

    authenticate() {
        const passwordInput = document.getElementById('adminPassword');
        const password = passwordInput.value;
        
        console.log('Attempting authentication with password:', password);
        
        if (password === this.uploadPassword) {
            this.isAuthenticated = true;
            sessionStorage.setItem('memorySpaceAuth', password);
            this.showNotification('Admin access granted! You can now upload photos.', 'success');
            this.showUploadSection();
            this.hideAdminPanel();
            console.log('Authentication successful, showing upload section');
        } else if (password) {
            this.showNotification('Incorrect password. Try again.', 'error');
            passwordInput.value = '';
            console.log('Authentication failed');
        }
    }

    showUploadSection() {
        const uploadSection = document.getElementById('uploadSection');
        console.log('showUploadSection called, uploadSection element:', uploadSection);
        if (uploadSection) {
            uploadSection.style.display = 'block';
            console.log('Upload section should now be visible');
        } else {
            console.error('Upload section element not found!');
        }
    }

    logout() {
        this.isAuthenticated = false;
        sessionStorage.removeItem('memorySpaceAuth');
        const uploadSection = document.getElementById('uploadSection');
        if (uploadSection) {
            uploadSection.style.display = 'none';
        }
        this.showNotification('Logged out. Now in view-only mode.', 'info');
    }

    async handleFileUpload(event) {
        if (!this.isAuthenticated) {
            this.showNotification('Please authenticate to upload photos.', 'error');
            return;
        }
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;
        
        // Show upload progress
        this.showNotification(`Uploading ${files.length} image(s) to GitHub...`, 'info');
        
        try {
            const uploadPromises = files.map(file => this.uploadPhoto(file));
            await Promise.all(uploadPromises);
            this.showNotification(`Successfully uploaded ${files.length} memories to space!`);
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification('Upload failed. Please check your GitHub configuration.', 'error');
        }
        
        // Clear the input
        event.target.value = '';
    }

    async uploadPhoto(file) {
        if (!file.type.startsWith('image/')) {
            throw new Error('Please upload only image files');
        }

        // Check GitHub configuration for local development
        if (!GITHUB_CONFIG.useAPI && 
            (GITHUB_CONFIG.token === "" || GITHUB_CONFIG.username === "YOUR_GITHUB_USERNAME")) {
            throw new Error('Please configure your GitHub settings in the script for local development');
        }

        try {
            // Convert image to base64
            const base64Data = await this.fileToBase64(file);
            const base64Content = base64Data.split(',')[1]; // Remove data:image/jpeg;base64, prefix
            
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
                originalName: file.name,
                githubUrl: githubUrl,
                githubPath: filename,
                uploadDate: new Date().toISOString(),
                size: file.size,
                type: file.type,
                x: Math.random() * (this.canvas.width - 200) + 100,
                y: Math.random() * (this.canvas.height - 200) + 100,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                scale: 0.8 + Math.random() * 0.4,
                targetScale: 0.8 + Math.random() * 0.4,
                alpha: 1
            };

            // Save metadata to Firestore
            await db.collection('memories').doc(photoData.id).set(photoData);
            
            // Load the image and add to local array
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                photoData.image = img;
                photoData.loaded = true;
                this.photos.push(photoData);
                this.updatePhotoCounter();
            };
            img.onerror = (error) => {
                console.error('Failed to load image from GitHub:', error);
            };
            img.src = githubUrl;

        } catch (error) {
            console.error('Error uploading photo:', error);
            throw error;
        }
    }

    async uploadToGitHub(path, base64Content) {
        if (GITHUB_CONFIG.useAPI) {
            // Use Vercel API when deployed
            console.log('Using Vercel API for upload...');
            const response = await fetch('/api/github', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    path: path,
                    content: base64Content,
                    message: `Add memory: ${path}`
                })
            });
            
            console.log('API Response status:', response.status);
            
            if (!response.ok) {
                const error = await response.text();
                console.error('API Error:', error);
                try {
                    const errorJson = JSON.parse(error);
                    throw new Error(errorJson.message || errorJson.error || 'Upload failed');
                } catch (e) {
                    throw new Error(`API Error (${response.status}): ${error}`);
                }
            }
            
            const result = await response.json();
            console.log('Upload successful via API');
            
            // Return the raw GitHub URL for direct access
            return `https://raw.githubusercontent.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/${GITHUB_CONFIG.branch}/${path}`;
        } else {
            // Direct GitHub API for local development
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

            const result = await response.json();
            
            // Return the raw GitHub URL for direct access
            return `https://raw.githubusercontent.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/${GITHUB_CONFIG.branch}/${path}`;
        }
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
            this.showNotification('Loading memories from space...', 'info');
            const snapshot = await db.collection('memories').get();
            const loadPromises = [];
            
            snapshot.forEach(doc => {
                const photoData = doc.data();
                const loadPromise = new Promise((resolve) => {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.onload = () => {
                        photoData.image = img;
                        photoData.loaded = true;
                        resolve(photoData);
                    };
                    img.onerror = () => {
                        console.error('Failed to load image:', photoData.githubUrl);
                        resolve(null);
                    };
                    img.src = photoData.githubUrl;
                });
                loadPromises.push(loadPromise);
            });

            const loadedPhotos = await Promise.all(loadPromises);
            this.photos = loadedPhotos.filter(photo => photo !== null);
            this.updatePhotoCounter();
            
            if (this.photos.length > 0) {
                this.showNotification(`${this.photos.length} memories loaded from space!`);
            }
            
        } catch (error) {
            console.error('Error loading photos:', error);
            this.showNotification('Failed to load photos from database', 'error');
        }
    }

    async deletePhoto(photoId) {
        try {
            // Find the photo
            const photo = this.photos.find(p => p.id === photoId);
            if (!photo) return;

            // Delete from GitHub
            if (photo.githubPath) {
                await this.deleteFromGitHub(photo.githubPath);
            }
            
            // Delete from Firestore
            await db.collection('memories').doc(photoId).delete();
            
            // Remove from local array
            this.photos = this.photos.filter(p => p.id !== photoId);
            this.updatePhotoCounter();
            this.closeModal();
            this.showNotification('Memory deleted successfully');
            
        } catch (error) {
            console.error('Error deleting photo:', error);
            this.showNotification('Failed to delete memory', 'error');
        }
    }

    async deleteFromGitHub(path) {
        if (GITHUB_CONFIG.useAPI) {
            // Use Vercel API when deployed
            try {
                const response = await fetch('/api/github', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        path: path,
                        message: `Delete memory: ${path}`
                    })
                });

                if (!response.ok) {
                    console.warn('Vercel API file deletion failed');
                }
            } catch (error) {
                console.warn('Error deleting from GitHub via API:', error);
            }
        } else {
            // Direct GitHub API for local development
            const url = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/contents/${path}`;
            
            try {
                // Get the file SHA (required for deletion)
                const getResponse = await fetch(url, {
                    headers: {
                        'Authorization': `token ${GITHUB_CONFIG.token}`,
                    }
                });

                if (!getResponse.ok) {
                    console.warn('Could not get file SHA for deletion');
                    return;
                }

                const fileData = await getResponse.json();
                
                // Delete the file
                const deleteResponse = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `token ${GITHUB_CONFIG.token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: `Delete memory: ${path}`,
                        sha: fileData.sha,
                        branch: GITHUB_CONFIG.branch
                    })
                });

                if (!deleteResponse.ok) {
                    console.warn('GitHub file deletion failed');
                }
            } catch (error) {
                console.warn('Error deleting from GitHub:', error);
            }
        }
    }

    async clearAllPhotos() {
        if (!confirm('Are you sure you want to clear all memories from space? This will also delete them from GitHub.')) return;
        
        try {
            this.showNotification('Clearing all memories...', 'info');
            
            // Get all photos
            const snapshot = await db.collection('memories').get();
            const deletePromises = [];
            const githubDeletePromises = [];
            
            snapshot.forEach(doc => {
                const photoData = doc.data();
                
                // Delete from Firestore
                deletePromises.push(doc.ref.delete());
                
                // Delete from GitHub
                if (photoData.githubPath) {
                    githubDeletePromises.push(
                        this.deleteFromGitHub(photoData.githubPath).catch(console.warn)
                    );
                }
            });
            
            // Wait for all deletions
            await Promise.all([...deletePromises, ...githubDeletePromises]);
            
            this.photos = [];
            this.updatePhotoCounter();
            this.showNotification('All memories cleared from space');
            
        } catch (error) {
            console.error('Error clearing photos:', error);
            this.showNotification('Failed to clear all memories', 'error');
        }
    }

    handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        console.log('Canvas clicked at:', clickX, clickY);

        // Check if any photo was clicked
        for (let i = this.photos.length - 1; i >= 0; i--) {
            const photo = this.photos[i];
            if (!photo.loaded) continue;

            const photoWidth = 120 * photo.scale;
            const photoHeight = 120 * photo.scale;

            if (clickX >= photo.x - photoWidth/2 && 
                clickX <= photo.x + photoWidth/2 && 
                clickY >= photo.y - photoHeight/2 && 
                clickY <= photo.y + photoHeight/2) {
                console.log('Photo clicked!', photo);
                this.showPhotoModal(photo);
                return;
            }
        }
    }

    showPhotoModal(photo) {
        console.log('showPhotoModal called with:', photo);
        
        const modal = document.getElementById('photoModal');
        const modalImage = document.getElementById('modalImage');
        const photoName = document.getElementById('photoName');
        const photoDate = document.getElementById('photoDate');
        const deleteBtn = document.getElementById('deletePhoto');

        console.log('Modal elements found:', { modal, modalImage, photoName, photoDate, deleteBtn });

        if (modalImage && photo.githubUrl) {
            modalImage.src = photo.githubUrl;
            console.log('Setting modal image src to:', photo.githubUrl);
        }
        
        if (photoName) photoName.textContent = photo.originalName || photo.name || 'Unknown';
        if (photoDate) photoDate.textContent = `Uploaded: ${new Date(photo.uploadDate).toLocaleDateString()}`;
        
        if (deleteBtn) deleteBtn.onclick = () => this.deletePhoto(photo.id);
        
        if (modal) {
            modal.style.display = 'block';
            setTimeout(() => modal.classList.add('active'), 10);
            
            console.log('Modal should be visible now');
            
            // Auto-close after 3 seconds
            setTimeout(() => {
                console.log('Auto-closing modal');
                this.closeModal();
            }, 3000);
        } else {
            console.error('Modal element not found!');
        }
    }

    closeModal() {
        const modal = document.getElementById('photoModal');
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('pauseMotion');
        btn.textContent = this.isPaused ? '▶️ Resume' : '⏸️ Pause';
        
        if (!this.isPaused && !this.animationId) {
            this.animate();
        }
    }

    cycleSpeed() {
        const speeds = [0.5, 1, 2, 3];
        const currentIndex = speeds.indexOf(this.speed);
        this.speed = speeds[(currentIndex + 1) % speeds.length];
        
        const btn = document.getElementById('speedControl');
        btn.textContent = `🚀 ${this.speed}x`;
    }

    updatePhotoCounter() {
        const counter = document.getElementById('photoCounter');
        const count = this.photos.length;
        counter.textContent = `${count} ${count === 1 ? 'memory' : 'memories'} in space`;
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
            borderRadius: '5px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'error' ? '#ff4757' : type === 'info' ? '#3742fa' : '#2ed573'
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

    updatePhotos() {
        if (this.isPaused) return;

        this.photos.forEach(photo => {
            if (!photo.loaded) return;

            photo.x += photo.vx * this.speed;
            photo.y += photo.vy * this.speed;

            const margin = 60;
            if (photo.x < margin || photo.x > this.canvas.width - margin) {
                photo.vx *= -1;
                photo.x = Math.max(margin, Math.min(this.canvas.width - margin, photo.x));
            }
            if (photo.y < margin || photo.y > this.canvas.height - margin) {
                photo.vy *= -1;
                photo.y = Math.max(margin, Math.min(this.canvas.height - margin, photo.y));
            }

            photo.rotation += photo.rotationSpeed * this.speed;

            photo.scale += (photo.targetScale - photo.scale) * 0.02;
            if (Math.abs(photo.targetScale - photo.scale) < 0.01) {
                photo.targetScale = 0.8 + Math.random() * 0.4;
            }
        });
    }

    updateShootingStars() {
        if (this.isPaused) return;

        this.shootingStars.forEach((star, index) => {
            star.progress += star.speed;
            
            // Update position along the path
            star.x = star.startX + (star.endX - star.startX) * star.progress;
            star.y = star.startY + (star.endY - star.startY) * star.progress;
            
            // Add sparkling particles
            if (Math.random() < 0.3) {
                star.particles.push({
                    x: star.x + (Math.random() - 0.5) * 20,
                    y: star.y + (Math.random() - 0.5) * 20,
                    life: 1,
                    decay: Math.random() * 0.05 + 0.02
                });
            }
            
            // Update particles
            star.particles.forEach((particle, pIndex) => {
                particle.life -= particle.decay;
                if (particle.life <= 0) {
                    star.particles.splice(pIndex, 1);
                }
            });
            
            // Fade out near the end
            if (star.progress > 0.8) {
                star.brightness = Math.max(0, 1 - (star.progress - 0.8) * 5);
            }
            
            // Remove completed shooting stars
            if (star.progress >= 1) {
                this.shootingStars.splice(index, 1);
            }
        });
    }

    drawStars() {
        this.stars.forEach(star => {
            star.alpha += star.twinkle * (Math.random() > 0.5 ? 1 : -1);
            star.alpha = Math.max(0.1, Math.min(1, star.alpha));

            this.ctx.save();
            this.ctx.globalAlpha = star.alpha;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawShootingStars() {
        this.shootingStars.forEach(star => {
            if (star.brightness <= 0) return;
            
            this.ctx.save();
            this.ctx.globalAlpha = star.brightness;
            
            // Draw the main shooting star trail
            const gradient = this.ctx.createLinearGradient(
                star.x - (star.endX - star.startX) * 0.1,
                star.y - (star.endY - star.startY) * 0.1,
                star.x,
                star.y
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.3, star.color + '40'); // 25% opacity
            gradient.addColorStop(1, star.color);
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 3;
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(
                star.x - (star.endX - star.startX) * 0.1,
                star.y - (star.endY - star.startY) * 0.1
            );
            this.ctx.lineTo(star.x, star.y);
            this.ctx.stroke();
            
            // Draw the bright head
            this.ctx.fillStyle = star.color;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = star.color;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw sparkle particles
            star.particles.forEach(particle => {
                this.ctx.globalAlpha = particle.life * star.brightness;
                this.ctx.fillStyle = star.color;
                this.ctx.shadowBlur = 8;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
                this.ctx.fill();
            });
            
            this.ctx.restore();
        });
    }

    drawPhotos() {
        this.photos.forEach(photo => {
            if (!photo.loaded) return;

            this.ctx.save();
            
            this.ctx.translate(photo.x, photo.y);
            this.ctx.rotate(photo.rotation);
            this.ctx.scale(photo.scale, photo.scale);
            
            this.ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
            this.ctx.shadowBlur = 15;
            
            const size = 120;
            this.ctx.drawImage(photo.image, -size/2, -size/2, size, size);
            
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(-size/2, -size/2, size, size);
            
            this.ctx.restore();
        });
    }

    draw() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width/2, this.canvas.height/2, 0,
            this.canvas.width/2, this.canvas.height/2, Math.max(this.canvas.width, this.canvas.height)
        );
        gradient.addColorStop(0, '#0a0a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f0f23');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawStars();
        this.drawShootingStars();
        this.drawPhotos();
    }

    animate() {
        this.updatePhotos();
        this.updateShootingStars();
        this.draw();
        
        if (!this.isPaused) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            this.animationId = null;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.memorySpace = new ShapeMemorySpace();
});

document.addEventListener('visibilitychange', () => {
    if (window.memorySpace) {
        if (document.hidden) {
            window.memorySpace.isPaused = true;
        } else if (!window.memorySpace.isPaused) {
            window.memorySpace.animate();
        }
    }
});
