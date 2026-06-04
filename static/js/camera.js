// ========================
// CAMERA SIMULATION SYSTEM
// ========================

class CameraSimulator {
    constructor() {
        this.cameras = [];
        this.animationFrames = {};
    }

    async initialize() {
        await this.loadCameras();
        this.renderCameras();
    }

    async loadCameras() {
        try {
            const response = await fetch('/cameras');
            const data = await response.json();
            this.cameras = data;
        } catch (error) {
            console.error('Error loading cameras:', error);
            this.createMockCameras();
        }
    }

    createMockCameras() {
        this.cameras = [
            {
                id: 1,
                name: 'Traffic Camera - Main Street',
                location: 'Downtown - Intersection A',
                type: 'traffic',
                status: 'online',
                online: true,
                resolution: '1920x1080',
                fps: 30,
                vehicle_count: 45,
                avg_speed: 35
            },
            {
                id: 2,
                name: 'Environmental Camera - Park Area',
                location: 'Green Zone - Park Center',
                type: 'environmental',
                status: 'online',
                online: true,
                resolution: '1920x1080',
                fps: 24,
                air_quality: 145,
                temperature: 28
            },
            {
                id: 3,
                name: 'Security Camera - Industrial Zone',
                location: 'Industrial - Area B',
                type: 'security',
                status: 'online',
                online: true,
                resolution: '2560x1440',
                fps: 30,
                motion_detected: false,
                alerts: 0
            },
            {
                id: 4,
                name: 'Water Level Camera - River',
                location: 'Waterfront - River Monitor',
                type: 'water',
                status: 'offline',
                online: false,
                resolution: '1280x720',
                fps: 15,
                water_level: 0,
                last_update: 'N/A'
            }
        ];
    }

    renderCameras() {
        const container = document.getElementById('cameraGrid');
        if (!container) return;

        container.innerHTML = '';

        this.cameras.forEach(camera => {
            const feedHtml = this.createCameraFeedHTML(camera);
            container.innerHTML += feedHtml;
        });

        // Start camera animations
        this.cameras.forEach(camera => {
            if (camera.online) {
                this.startCameraSimulation(camera.id);
            }
        });

        // Add event listeners
        this.attachEventListeners();
    }

    createCameraFeedHTML(camera) {
        const statusClass = camera.online ? '' : 'offline';
        const statusColor = camera.online ? 'normal' : 'danger';
        const alertLevel = this.getAlertLevel(camera);

        return `
            <div class="camera-feed" id="camera-${camera.id}">
                <div class="camera-header">
                    <h3>${camera.name}</h3>
                    <div class="camera-status">
                        <div class="status-indicator" style="background: ${camera.online ? '#22c55e' : '#ef4444'};"></div>
                        <span>${camera.online ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
                
                <div class="camera-video ${statusClass}">
                    <canvas id="canvas-${camera.id}" width="320" height="200"></canvas>
                </div>
                
                <div class="camera-info">
                    <p><strong>Location:</strong> <span>${camera.location}</span></p>
                    <p><strong>Resolution:</strong> <span>${camera.resolution}</span></p>
                    <p><strong>FPS:</strong> <span>${camera.fps}</span></p>
                    ${this.getCameraSpecificInfo(camera)}
                    <p style="margin-top: 10px;">
                        <span class="alert-level ${alertLevel}">${this.getAlertText(camera)}</span>
                    </p>
                    <p class="camera-timestamp">Updated: <span id="time-${camera.id}">${new Date().toLocaleTimeString()}</span></p>
                </div>
                
                <div class="camera-controls">
                    <button class="camera-btn" onclick="cameraSystem.recordCamera(${camera.id})">Record</button>
                    <button class="camera-btn" onclick="cameraSystem.captureSnapshot(${camera.id})">Snapshot</button>
                    ${camera.online ? `<button class="camera-btn" onclick="cameraSystem.switchOff(${camera.id})">Turn Off</button>` : `<button class="camera-btn" onclick="cameraSystem.switchOn(${camera.id})">Turn On</button>`}
                </div>
            </div>
        `;
    }

    getCameraSpecificInfo(camera) {
        let info = '';
        
        switch(camera.type) {
            case 'traffic':
                info = `
                    <p><strong>Vehicles:</strong> <span>${camera.vehicle_count} vehicles</span></p>
                    <p><strong>Avg Speed:</strong> <span>${camera.avg_speed} km/h</span></p>
                `;
                break;
            case 'environmental':
                info = `
                    <p><strong>Air Quality:</strong> <span>${camera.air_quality} AQI</span></p>
                    <p><strong>Temperature:</strong> <span>${camera.temperature}°C</span></p>
                `;
                break;
            case 'security':
                info = `
                    <p><strong>Motion:</strong> <span>${camera.motion_detected ? 'Detected ⚠️' : 'None'}</span></p>
                    <p><strong>Alerts:</strong> <span>${camera.alerts}</span></p>
                `;
                break;
            case 'water':
                info = `
                    <p><strong>Water Level:</strong> <span>${camera.water_level}m</span></p>
                    <p><strong>Status:</strong> <span>${camera.last_update}</span></p>
                `;
                break;
        }
        
        return info;
    }

    getAlertLevel(camera) {
        if (!camera.online) return 'danger';
        
        switch(camera.type) {
            case 'traffic':
                return camera.vehicle_count > 80 ? 'warning' : 'normal';
            case 'environmental':
                return camera.air_quality > 170 ? 'danger' : camera.air_quality > 100 ? 'warning' : 'normal';
            case 'security':
                return camera.motion_detected ? 'warning' : 'normal';
            case 'water':
                return 'normal';
            default:
                return 'normal';
        }
    }

    getAlertText(camera) {
        if (!camera.online) return 'OFFLINE';
        
        switch(camera.type) {
            case 'traffic':
                return camera.vehicle_count > 80 ? 'HIGH TRAFFIC' : 'NORMAL';
            case 'environmental':
                return camera.air_quality > 170 ? 'POOR AIR' : camera.air_quality > 100 ? 'MODERATE' : 'GOOD';
            case 'security':
                return camera.motion_detected ? 'MOTION ALERT' : 'SECURE';
            case 'water':
                return 'MONITORING';
            default:
                return 'NORMAL';
        }
    }

    startCameraSimulation(cameraId) {
        const canvas = document.getElementById(`canvas-${cameraId}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const camera = this.cameras.find(c => c.id === cameraId);
        if (!camera) return;

        let frame = 0;
        const animate = () => {
            // Draw background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw scene based on camera type
            this.drawCameraScene(ctx, canvas, camera, frame);

            // Draw info overlay
            this.drawCameraOverlay(ctx, canvas, camera);

            frame++;
            this.animationFrames[cameraId] = requestAnimationFrame(animate);
        };

        animate();
    }

    drawCameraScene(ctx, canvas, camera, frame) {
        switch(camera.type) {
            case 'traffic':
                this.drawTrafficScene(ctx, canvas, camera, frame);
                break;
            case 'environmental':
                this.drawEnvironmentalScene(ctx, canvas, camera, frame);
                break;
            case 'security':
                this.drawSecurityScene(ctx, canvas, camera, frame);
                break;
            case 'water':
                this.drawWaterScene(ctx, canvas, camera, frame);
                break;
        }
    }

    drawTrafficScene(ctx, canvas, camera, frame) {
        // Draw road
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

        // Draw lane markings
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 20]);
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.65);
        ctx.lineTo(canvas.width, canvas.height * 0.65);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw vehicles
        const vehicleCount = Math.min(camera.vehicle_count, 8);
        for (let i = 0; i < vehicleCount; i++) {
            const x = ((frame * 2 + i * 40) % (canvas.width + 60)) - 30;
            const y = canvas.height * 0.65 + (i % 2) * 30 - 20;
            
            ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#3b82f6';
            ctx.fillRect(x, y, 40, 25);
            
            // Windows
            ctx.fillStyle = '#87ceeb';
            ctx.fillRect(x + 5, y + 5, 12, 8);
            ctx.fillRect(x + 22, y + 5, 12, 8);
        }

        // Draw sky
        const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
        skyGradient.addColorStop(0, '#87ceeb');
        skyGradient.addColorStop(1, '#e0f6ff');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    }

    drawEnvironmentalScene(ctx, canvas, camera, frame) {
        // Draw sky with gradient based on air quality
        const airQuality = camera.air_quality;
        let skyColor1, skyColor2;
        
        if (airQuality > 170) {
            skyColor1 = '#8b4513';
            skyColor2 = '#a0522d';
        } else if (airQuality > 100) {
            skyColor1 = '#696969';
            skyColor2 = '#808080';
        } else {
            skyColor1 = '#87ceeb';
            skyColor2 = '#e0f6ff';
        }

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, skyColor1);
        gradient.addColorStop(1, skyColor2);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw trees/vegetation
        ctx.fillStyle = '#228b22';
        for (let i = 0; i < 5; i++) {
            const x = (canvas.width / 5) * i + 20;
            const height = 40 + Math.sin(frame * 0.02 + i) * 10;
            ctx.fillRect(x, canvas.height - height, 20, height);
        }

        // Draw particles (pollution if poor air quality)
        if (airQuality > 100) {
            ctx.fillStyle = `rgba(128, 128, 128, ${0.5 + Math.sin(frame * 0.05) * 0.3})`;
            for (let i = 0; i < 30; i++) {
                const x = (frame * 1 + i * 10) % canvas.width;
                const y = (frame * 0.5 + i * 7) % canvas.height;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawSecurityScene(ctx, canvas, camera, frame) {
        // Draw corridor/area
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw walls
        ctx.fillStyle = '#2a2a3e';
        ctx.fillRect(0, 0, 30, canvas.height);
        ctx.fillRect(canvas.width - 30, 0, 30, canvas.height);

        // Draw floor
        ctx.fillStyle = '#0f3460';
        ctx.fillRect(30, canvas.height - 50, canvas.width - 60, 50);

        // Draw motion indicator if motion detected
        if (camera.motion_detected) {
            ctx.fillStyle = `rgba(239, 68, 68, ${0.5 + Math.sin(frame * 0.1) * 0.5})`;
            ctx.fillRect(canvas.width / 2 - 30, canvas.height / 2 - 30, 60, 60);
            
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('MOTION', canvas.width / 2, canvas.height / 2 + 5);
        }

        // Draw grid overlay
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo((canvas.width / 5) * i, 0);
            ctx.lineTo((canvas.width / 5) * i, canvas.height);
            ctx.stroke();
        }
    }

    drawWaterScene(ctx, canvas, camera, frame) {
        // Draw water
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1e90ff');
        gradient.addColorStop(1, '#000080');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw waves
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            for (let x = 0; x < canvas.width; x += 5) {
                const y = 50 + i * 50 + Math.sin((x + frame * 2) * 0.05) * 10;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // Draw water level indicator
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Level: ${camera.water_level}m`, canvas.width / 2, canvas.height / 2);
    }

    drawCameraOverlay(ctx, canvas, camera) {
        // Draw timestamp
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, 25);

        ctx.fillStyle = '#00ff00';
        ctx.font = '12px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('CAM ' + camera.id + ' - ' + new Date().toLocaleTimeString(), 5, 17);

        // Draw recording indicator
        if (this.isRecording && this.recordingCameraId === camera.id) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
            ctx.beginPath();
            ctx.arc(canvas.width - 15, 12, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    attachEventListeners() {
        // Event listeners are added via onclick in HTML
    }

    recordCamera(cameraId) {
        this.isRecording = true;
        this.recordingCameraId = cameraId;
        alert(`Recording started for Camera ${cameraId}`);
    }

    captureSnapshot(cameraId) {
        const canvas = document.getElementById(`canvas-${cameraId}`);
        if (canvas) {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `camera_${cameraId}_${Date.now()}.png`;
            link.click();
            alert(`Snapshot captured from Camera ${cameraId}`);
        }
    }

    switchOff(cameraId) {
        const camera = this.cameras.find(c => c.id === cameraId);
        if (camera) {
            camera.online = false;
            camera.status = 'offline';
            if (this.animationFrames[cameraId]) {
                cancelAnimationFrame(this.animationFrames[cameraId]);
            }
            this.renderCameras();
            alert(`Camera ${cameraId} turned off`);
        }
    }

    switchOn(cameraId) {
        const camera = this.cameras.find(c => c.id === cameraId);
        if (camera) {
            camera.online = true;
            camera.status = 'online';
            this.renderCameras();
            alert(`Camera ${cameraId} turned on`);
        }
    }

    async updateCameraData() {
        try {
            const response = await fetch('/data');
            const data = await response.json();

            // Update traffic camera
            if (this.cameras[0]) {
                this.cameras[0].vehicle_count = Math.floor(data.traffic / 10);
            }

            // Update environmental camera
            if (this.cameras[1]) {
                this.cameras[1].air_quality = data.air_quality;
            }

            // Update timestamps
            this.cameras.forEach(camera => {
                const timeElement = document.getElementById(`time-${camera.id}`);
                if (timeElement) {
                    timeElement.textContent = new Date().toLocaleTimeString();
                }
            });
        } catch (error) {
            console.error('Error updating camera data:', error);
        }
    }
}

// Global instance
let cameraSystem = null;

document.addEventListener('DOMContentLoaded', async () => {
    cameraSystem = new CameraSimulator();
    await cameraSystem.initialize();

    // Update camera data every 2 seconds
    setInterval(async () => {
        await cameraSystem.updateCameraData();
    }, 2000);
});
