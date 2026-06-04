// ====================================
// SMART CITY CCTV - VIDEO-BASED CAMERA SYSTEM
// ====================================

class CCTVCamera {
    constructor(id, name, type, location, videoUrl) {
        this.id = id;
        this.name = name;
        this.type = type; // 'traffic', 'environmental', 'security', 'water'
        this.location = location;
        this.videoUrl = videoUrl;
        this.status = 'online';
        this.recordingActive = false;
        this.hasVideoFile = !!videoUrl;
        this.canvasElement = null;
        this.ctx = null;
        this.animationFrame = null;
        this.detectionActive = false;
        this.lastMotionTime = Date.now();
    }

    createHTML() {
        return `
            <div class="camera-feed" data-camera-id="${this.id}">
                <div class="camera-header">
                    <div style="flex: 1;">
                        <h3>${this.name}</h3>
                        <p>${this.location}</p>
                    </div>
                    <div class="camera-status ${this.status}">
                        <span class="status-dot"></span>
                        <span>${this.status.toUpperCase()}</span>
                    </div>
                </div>
                
                <div class="camera-display">
                    ${this.createCameraContent()}
                </div>
                
                <div class="camera-controls">
                    <button class="btn-control" onclick="window.cameraSystem.toggleRecording(${this.id})" title="Ghi hình">
                        🔴 Ghi
                    </button>
                    <button class="btn-control" onclick="window.cameraSystem.takeSnapshot(${this.id})" title="Chụp ảnh">
                        📸 Chụp
                    </button>
                    <button class="btn-control" onclick="window.cameraSystem.downloadVideo(${this.id})" title="Tải xuống">
                        ⬇️ Tải
                    </button>
                </div>
                
                <div class="camera-info">
                    <span>🕐 ${new Date().toLocaleTimeString('vi-VN')}</span>
                    <span id="recording-${this.id}" style="display: none; color: #ef4444; font-weight: bold;">● ĐANG GHI</span>
                </div>
            </div>
        `;
    }

    createCameraContent() {
        if (this.hasVideoFile) {
            return `
                <video id="video-${this.id}" class="camera-video" controls muted autoplay>
                    <source src="${this.videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            `;
        } else {
            return `
                <canvas id="canvas-${this.id}" class="camera-canvas" width="320" height="240"></canvas>
                <div id="alert-${this.id}" class="motion-alert" style="display: none;">⚠️ PHÁT HIỆN CHUYỂN ĐỘNG</div>
            `;
        }
    }

    async initialize() {
        const element = document.querySelector(`[data-camera-id="${this.id}"] .camera-display`);
        
        if (this.hasVideoFile) {
            // Use HTML5 video
            const video = document.getElementById(`video-${this.id}`);
            if (video) {
                video.addEventListener('ended', () => {
                    video.currentTime = 0;
                    video.play();
                });
                video.play();
            }
        } else {
            // Use canvas animation as fallback
            this.canvasElement = document.getElementById(`canvas-${this.id}`);
            if (this.canvasElement) {
                this.ctx = this.canvasElement.getContext('2d');
                this.startCanvasAnimation();
            }
        }
    }

    startCanvasAnimation() {
        if (!this.ctx) return;
        
        const animate = () => {
            // Draw background
            this.ctx.fillStyle = 'rgba(20, 20, 40, 0.9)';
            this.ctx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
            
            // Draw grid overlay
            this.ctx.strokeStyle = 'rgba(0, 200, 0, 0.1)';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < this.canvasElement.width; i += 40) {
                this.ctx.beginPath();
                this.ctx.moveTo(i, 0);
                this.ctx.lineTo(i, this.canvasElement.height);
                this.ctx.stroke();
            }
            for (let i = 0; i < this.canvasElement.height; i += 40) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, i);
                this.ctx.lineTo(this.canvasElement.width, i);
                this.ctx.stroke();
            }
            
            // Draw based on camera type
            switch (this.type) {
                case 'traffic':
                    this.drawTrafficScene();
                    break;
                case 'environmental':
                    this.drawEnvironmentalScene();
                    break;
                case 'security':
                    this.drawSecurityScene();
                    break;
                case 'water':
                    this.drawWaterScene();
                    break;
            }
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        animate();
    }

    drawTrafficScene() {
        const time = Date.now() / 1000;
        
        // Draw road
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
        this.ctx.fillRect(0, 80, this.canvasElement.width, 80);
        
        // Draw lane markings
        this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 120);
        this.ctx.lineTo(this.canvasElement.width, 120);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw vehicles
        const vehicleSize = 40;
        const positions = [
            { x: (time * 60) % 320, y: 90 },
            { x: ((time * 50 + 100) % 320), y: 135 },
            { x: ((time * 70 + 200) % 320), y: 155 }
        ];
        
        positions.forEach((pos, index) => {
            this.ctx.fillStyle = index === 0 ? '#ff0000' : '#0000ff';
            this.ctx.fillRect(pos.x, pos.y, vehicleSize, 20);
            // Window
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillRect(pos.x + 8, pos.y + 4, 24, 8);
        });
    }

    drawEnvironmentalScene() {
        const time = Date.now() / 1000;
        
        // Sky gradient based on AQI
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasElement.height);
        gradient.addColorStop(0, 'rgba(255, 150, 100, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 200, 150, 0.6)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Draw trees
        for (let i = 0; i < 3; i++) {
            const x = 50 + i * 100;
            this.ctx.fillStyle = '#228B22';
            this.ctx.beginPath();
            this.ctx.arc(x, 100, 30, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw pollution particles
        this.ctx.fillStyle = 'rgba(150, 150, 150, 0.3)';
        for (let i = 0; i < 20; i++) {
            const x = (time * 10 + i * 15) % 320;
            const y = (time * 5 + Math.sin(time + i) * 20) % 180;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw text
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('AQI: 165 (Kém)', 10, 30);
    }

    drawSecurityScene() {
        // Draw floor/ground
        this.ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        this.ctx.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        // Draw grid overlay for security
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.15)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvasElement.width; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvasElement.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvasElement.height; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvasElement.width, i);
            this.ctx.stroke();
        }
        
        // Draw moving object (person simulation)
        const time = Date.now() / 1000;
        const x = 50 + Math.sin(time) * 80;
        const y = 100 + Math.cos(time * 0.5) * 60;
        
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(x - 15, y - 30, 30, 60);
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 35, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw detection box
        if (Math.random() > 0.7) {
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x - 20, y - 35, 40, 70);
        }
        
        // Draw detection indicator
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText('PHÁT HIỆN', 10, 20);
        this.ctx.fillText('Motion: ' + Math.floor(Math.random() * 100) + '%', 10, 35);
    }

    drawWaterScene() {
        const time = Date.now() / 1000;
        
        // Draw sky
        this.ctx.fillStyle = 'rgba(135, 206, 235, 0.6)';
        this.ctx.fillRect(0, 0, this.canvasElement.width, 80);
        
        // Draw water with wave animation
        this.ctx.fillStyle = 'rgba(30, 144, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 80);
        for (let x = 0; x < this.canvasElement.width; x += 5) {
            const y = 100 + Math.sin(x * 0.02 + time * 2) * 15;
            this.ctx.lineTo(x, y);
        }
        this.ctx.lineTo(this.canvasElement.width, this.canvasElement.height);
        this.ctx.lineTo(0, this.canvasElement.height);
        this.ctx.fill();
        
        // Draw water level indicator
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('Mực nước: 2.5m', 10, 30);
    }

    toggleRecording(cameraId) {
        if (this.id === cameraId) {
            this.recordingActive = !this.recordingActive;
            const recordingIndicator = document.getElementById(`recording-${cameraId}`);
            if (recordingIndicator) {
                recordingIndicator.style.display = this.recordingActive ? 'inline' : 'none';
            }
        }
    }

    takeSnapshot(cameraId) {
        if (this.id === cameraId) {
            const timestamp = new Date().toISOString();
            alert(`📸 Chụp ảnh từ ${this.name} lúc ${timestamp}`);
        }
    }

    downloadVideo(cameraId) {
        if (this.id === cameraId) {
            if (this.hasVideoFile) {
                alert(`⬇️ Tải video từ ${this.name} - ${this.videoUrl}`);
            } else {
                alert(`⬇️ Video giả lập từ ${this.name}`);
            }
        }
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

class CCTVSystem {
    constructor() {
        this.cameras = [];
        this.initializeCameras();
    }

    initializeCameras() {
        // Camera 1: Traffic Camera - District 1
        this.cameras.push(new CCTVCamera(
            1,
            'Camera Giao Thông Quận 1',
            'traffic',
            'Ngã 3 Nguễn Huệ - Tôn Đức Thắng',
            null // No video file, use canvas fallback
        ));

        // Camera 2: Environmental/Pollution Camera - District 1
        this.cameras.push(new CCTVCamera(
            2,
            'Camera Môi Trường Quận 1',
            'environmental',
            'Công viên Tảo Đỏ',
            null // No video file
        ));

        // Camera 3: Security Camera - District 3
        this.cameras.push(new CCTVCamera(
            3,
            'Camera An Ninh Quận 3',
            'security',
            'Trường Chinh - Âu Cơ',
            null // No video file
        ));

        // Camera 4: Water Level Camera - District 4
        this.cameras.push(new CCTVCamera(
            4,
            'Camera Theo Dõi Nước Quận 4',
            'water',
            'Khu vực Bến Nha Rồng',
            null // No video file
        ));
    }

    async renderCameras() {
        const cameraGrid = document.getElementById('cameraGrid');
        if (!cameraGrid) return;

        cameraGrid.innerHTML = '';
        this.cameras.forEach(camera => {
            cameraGrid.innerHTML += camera.createHTML();
        });

        // Initialize all cameras
        await Promise.all(this.cameras.map(camera => camera.initialize()));
    }

    toggleRecording(cameraId) {
        const camera = this.cameras.find(c => c.id === cameraId);
        if (camera) {
            camera.toggleRecording(cameraId);
        }
    }

    takeSnapshot(cameraId) {
        const camera = this.cameras.find(c => c.id === cameraId);
        if (camera) {
            camera.takeSnapshot(cameraId);
        }
    }

    downloadVideo(cameraId) {
        const camera = this.cameras.find(c => c.id === cameraId);
        if (camera) {
            camera.downloadVideo(cameraId);
        }
    }

    destroy() {
        this.cameras.forEach(camera => camera.destroy());
    }
}

// Initialize CCTV system
document.addEventListener('DOMContentLoaded', () => {
    window.cameraSystem = new CCTVSystem();
    window.cameraSystem.renderCameras();
});
