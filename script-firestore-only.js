// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDQIATsqgmEMhdpSsM_DB11YXH18p3UG08",
    authDomain: "memoryspace-fe5ab.firebaseapp.com",
    projectId: "memoryspace-fe5ab",
    storageBucket: "memoryspace-fe5ab.firebasestorage.app",
    messagingSenderId: "618698649513",
    appId: "1:618698649513:web:eac0d49ab0fceb25eb9eb8"
};

// Initialize Firebase (only Firestore, no Storage)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class ShapeMemorySpace {
    constructor() {
        this.canvas = document.getElementById('memoryCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.photos = [];
        this.animationId = null;
        this.isPaused = false;
        this.speed = 1;
        this.stars = [];
        
        this.setupCanvas();
        this.createStars();
        this.setupEventListeners();
        this.loadPhotosFromDatabase();
        this.animate();
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

    setupEventListeners() {
        const photoUpload = document.getElementById('photoUpload');
        const clearSpace = document.getElementById('clearSpace');
        const pauseMotion = document.getElementById('pauseMotion');
        const speedControl = document.getElementById('speedControl');
        const modal = document.getElementById('photoModal');
        const closeModal = document.querySelector('.close-modal');
        const deletePhoto = document.getElementById('deletePhoto');

        photoUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        clearSpace.addEventListener('click', () => this.clearAllPhotos());
        pauseMotion.addEventListener('click', () => this.togglePause());
        speedControl.addEventListener('click', () => this.cycleSpeed());
        
        closeModal.addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
        
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        const uploadPromises = files.map(file => this.uploadPhoto(file));
        
        try {
            await Promise.all(uploadPromises);
            this.showNotification('Photos uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            this.showNotification('Upload failed. Please try again.', 'error');
        }
        
        // Clear the input
        event.target.value = '';
    }

    async uploadPhoto(file) {
        if (!file.type.startsWith('image/')) {
            throw new Error('Please upload only image files');
        }

        // Check file size (limit to 1MB for Firestore)
        const maxSize = 1024 * 1024; // 1MB
        if (file.size > maxSize) {
            throw new Error(`Image too large. Please use images smaller than 1MB. Current size: ${(file.size/1024/1024).toFixed(2)}MB`);
        }

        try {
            // Convert image to base64
            const base64Data = await this.fileToBase64(file);
            
            // Create photo data object
            const timestamp = Date.now();
            const photoData = {
                id: `photo_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
                name: file.name,
                imageData: base64Data, // Store image as base64 in Firestore
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

            // Save to Firestore
            await db.collection('memories').doc(photoData.id).set(photoData);
            
            // Load the image and add to local array
            const img = new Image();
            img.onload = () => {
                photoData.image = img;
                photoData.loaded = true;
                this.photos.push(photoData);
                this.updatePhotoCounter();
            };
            img.src = base64Data;

        } catch (error) {
            console.error('Error uploading photo:', error);
            throw error;
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
                    img.onload = () => {
                        photoData.image = img;
                        photoData.loaded = true;
                        resolve(photoData);
                    };
                    img.onerror = () => {
                        console.error('Failed to load image:', photoData.name);
                        resolve(null);
                    };
                    img.src = photoData.imageData;
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

    async clearAllPhotos() {
        if (!confirm('Are you sure you want to clear all memories from space?')) return;
        
        try {
            // Delete all documents from Firestore
            const snapshot = await db.collection('memories').get();
            const deletePromises = [];
            
            snapshot.forEach(doc => {
                deletePromises.push(doc.ref.delete());
            });
            
            await Promise.all(deletePromises);
            
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
                this.showPhotoModal(photo);
                return;
            }
        }
    }

    showPhotoModal(photo) {
        const modal = document.getElementById('photoModal');
        const modalImage = document.getElementById('modalImage');
        const photoName = document.getElementById('photoName');
        const photoDate = document.getElementById('photoDate');
        const deleteBtn = document.getElementById('deletePhoto');

        modalImage.src = photo.imageData;
        photoName.textContent = photo.name;
        photoDate.textContent = `Uploaded: ${new Date(photo.uploadDate).toLocaleDateString()}`;
        
        deleteBtn.onclick = () => this.deletePhoto(photo.id);
        
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('active'), 10);
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
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
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
        
        // Animate in
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        
        // Remove after 3 seconds
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

            // Update position
            photo.x += photo.vx * this.speed;
            photo.y += photo.vy * this.speed;

            // Bounce off edges
            const margin = 60;
            if (photo.x < margin || photo.x > this.canvas.width - margin) {
                photo.vx *= -1;
                photo.x = Math.max(margin, Math.min(this.canvas.width - margin, photo.x));
            }
            if (photo.y < margin || photo.y > this.canvas.height - margin) {
                photo.vy *= -1;
                photo.y = Math.max(margin, Math.min(this.canvas.height - margin, photo.y));
            }

            // Update rotation
            photo.rotation += photo.rotationSpeed * this.speed;

            // Subtle scale animation
            photo.scale += (photo.targetScale - photo.scale) * 0.02;
            if (Math.abs(photo.targetScale - photo.scale) < 0.01) {
                photo.targetScale = 0.8 + Math.random() * 0.4;
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

    drawPhotos() {
        this.photos.forEach(photo => {
            if (!photo.loaded) return;

            this.ctx.save();
            
            // Move to photo position
            this.ctx.translate(photo.x, photo.y);
            this.ctx.rotate(photo.rotation);
            this.ctx.scale(photo.scale, photo.scale);
            
            // Draw glow effect
            this.ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
            this.ctx.shadowBlur = 15;
            
            // Draw photo
            const size = 120;
            this.ctx.drawImage(photo.image, -size/2, -size/2, size, size);
            
            // Draw border
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(-size/2, -size/2, size, size);
            
            this.ctx.restore();
        });
    }

    draw() {
        // Create gradient background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width/2, this.canvas.height/2, 0,
            this.canvas.width/2, this.canvas.height/2, Math.max(this.canvas.width, this.canvas.height)
        );
        gradient.addColorStop(0, '#0a0a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f0f23');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        this.drawStars();
        
        // Draw photos
        this.drawPhotos();
    }

    animate() {
        this.updatePhotos();
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

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.memorySpace) {
        if (document.hidden) {
            window.memorySpace.isPaused = true;
        } else if (!window.memorySpace.isPaused) {
            window.memorySpace.animate();
        }
    }
});
