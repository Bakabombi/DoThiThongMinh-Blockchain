// ========================
// SMART CITY MAP
// ========================

class SmartCityMap {
    constructor() {
        this.map = null;
        this.sensors = [];
        this.markers = [];
    }

    async initialize() {
        // Initialize map container
        const mapContainer = document.getElementById('map');
        if (!mapContainer) return;

        // Create map canvas
        this.createMapCanvas();
        
        // Load sensor data
        await this.loadSensorData();
        
        // Start animation loop
        this.animate();
    }

    createMapCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = 'mapCanvas';
        canvas.width = document.getElementById('mapContainer').offsetWidth;
        canvas.height = 500;
        
        document.getElementById('map').appendChild(canvas);
        this.ctx = canvas.getContext('2d');
        
        // Add mouse events
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('click', (e) => this.onMapClick(e));
    }

    async loadSensorData() {
        try {
            const response = await fetch('/sensors');
            const data = await response.json();
            this.sensors = data;
        } catch (error) {
            console.error('Error loading sensor data:', error);
            this.createMockSensors();
        }
    }

    createMockSensors() {
        this.sensors = [
            {
                id: 1,
                name: 'Traffic Sensor 1',
                type: 'traffic',
                lat: 40,
                lng: 30,
                value: 65,
                unit: 'vehicles/min',
                status: 'normal'
            },
            {
                id: 2,
                name: 'Air Quality 1',
                type: 'air',
                lat: 60,
                lng: 50,
                value: 145,
                unit: 'AQI',
                status: 'warning'
            },
            {
                id: 3,
                name: 'Water Level 1',
                type: 'water',
                lat: 50,
                lng: 70,
                value: 45,
                unit: 'meters',
                status: 'normal'
            },
            {
                id: 4,
                name: 'Power Station 1',
                type: 'power',
                lat: 30,
                lng: 60,
                value: 850,
                unit: 'MW',
                status: 'normal'
            },
            {
                id: 5,
                name: 'Traffic Sensor 2',
                type: 'traffic',
                lat: 70,
                lng: 40,
                value: 85,
                unit: 'vehicles/min',
                status: 'warning'
            }
        ];
    }

    drawMap() {
        const canvas = document.getElementById('mapCanvas');
        const width = canvas.width;
        const height = canvas.height;

        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#1e293b');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);

        // Draw grid
        this.drawGrid();

        // Draw city zones
        this.drawZones();

        // Draw sensors
        this.drawSensors();

        // Draw legend
        this.drawLegend();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= 10; i++) {
            // Vertical lines
            const x = (this.ctx.canvas.width / 10) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.ctx.canvas.height);
            this.ctx.stroke();

            // Horizontal lines
            const y = (this.ctx.canvas.height / 10) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.ctx.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawZones() {
        const zones = [
            { name: 'Downtown', x: 10, y: 10, w: 80, h: 80, color: 'rgba(56, 189, 248, 0.05)' },
            { name: 'Industrial', x: 100, y: 150, w: 80, h: 60, color: 'rgba(239, 68, 68, 0.05)' }
        ];

        zones.forEach(zone => {
            this.ctx.fillStyle = zone.color;
            this.ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
            
            this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);

            this.ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(zone.name, zone.x + 10, zone.y + 20);
        });
    }

    drawSensors() {
        this.sensors.forEach(sensor => {
            const x = sensor.lng;
            const y = sensor.lat;

            // Draw sensor point
            const color = this.getSensorColor(sensor.type);
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw outer ring
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw range circle
            this.ctx.strokeStyle = this.getStatusColor(sensor.status);
            this.ctx.lineWidth = 1;
            this.ctx.globalAlpha = 0.3;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 20, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;

            // Draw label
            this.ctx.fillStyle = '#cbd5e1';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(sensor.id, x, y + 3);
        });
    }

    drawLegend() {
        const legend = [
            { type: 'traffic', label: 'Traffic', color: '#ef4444' },
            { type: 'air', label: 'Air Quality', color: '#22c55e' },
            { type: 'water', label: 'Water Level', color: '#3b82f6' },
            { type: 'power', label: 'Power', color: '#f59e0b' }
        ];

        const startX = this.ctx.canvas.width - 150;
        const startY = 20;
        const itemHeight = 20;

        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        this.ctx.fillRect(startX - 10, startY - 10, 160, legend.length * itemHeight + 10);

        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(startX - 10, startY - 10, 160, legend.length * itemHeight + 10);

        legend.forEach((item, index) => {
            const y = startY + index * itemHeight;

            // Color box
            this.ctx.fillStyle = item.color;
            this.ctx.fillRect(startX, y, 12, 12);

            // Label
            this.ctx.fillStyle = '#cbd5e1';
            this.ctx.font = '11px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(item.label, startX + 18, y + 10);
        });
    }

    getSensorColor(type) {
        const colors = {
            'traffic': '#ef4444',
            'air': '#22c55e',
            'water': '#3b82f6',
            'power': '#f59e0b'
        };
        return colors[type] || '#38bdf8';
    }

    getStatusColor(status) {
        const colors = {
            'normal': '#22c55e',
            'warning': '#f59e0b',
            'danger': '#ef4444'
        };
        return colors[status] || '#38bdf8';
    }

    onMouseMove(e) {
        const canvas = document.getElementById('mapCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        let hoveredSensor = null;
        this.sensors.forEach(sensor => {
            const dx = x - sensor.lng;
            const dy = y - sensor.lat;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 15) {
                hoveredSensor = sensor;
            }
        });

        canvas.style.cursor = hoveredSensor ? 'pointer' : 'default';
    }

    onMapClick(e) {
        const canvas = document.getElementById('mapCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.sensors.forEach(sensor => {
            const dx = x - sensor.lng;
            const dy = y - sensor.lat;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 15) {
                this.showSensorDetail(sensor);
            }
        });
    }

    showSensorDetail(sensor) {
        const detailBox = document.getElementById('mapDetail');
        if (detailBox) {
            detailBox.innerHTML = `
                <div style="background: rgba(56, 189, 248, 0.2); padding: 15px; border-radius: 10px; border-left: 3px solid #38bdf8;">
                    <h3 style="margin: 0 0 10px 0; color: #38bdf8;">${sensor.name}</h3>
                    <p><strong>ID:</strong> ${sensor.id}</p>
                    <p><strong>Type:</strong> ${sensor.type}</p>
                    <p><strong>Current Value:</strong> ${sensor.value} ${sensor.unit}</p>
                    <p><strong>Status:</strong> <span style="color: ${this.getStatusColor(sensor.status)};">${sensor.status.toUpperCase()}</span></p>
                    <p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">Last updated: ${new Date().toLocaleTimeString()}</p>
                </div>
            `;
        }
    }

    async updateSensorValues() {
        try {
            const response = await fetch('/data');
            const data = await response.json();

            if (this.sensors[0]) {
                this.sensors[0].value = data.traffic;
                this.sensors[0].status = data.traffic > 90 ? 'warning' : 'normal';
            }
            if (this.sensors[1]) {
                this.sensors[1].value = data.air_quality;
                this.sensors[1].status = data.air_quality > 170 ? 'warning' : 'normal';
            }
            if (this.sensors[2]) {
                this.sensors[2].value = data.water_level;
                this.sensors[2].status = data.water_level > 80 ? 'danger' : 'normal';
            }
        } catch (error) {
            console.error('Error updating sensor values:', error);
        }
    }

    animate() {
        this.drawMap();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', async () => {
    const map = new SmartCityMap();
    await map.initialize();
    
    // Update sensor values every 2 seconds
    setInterval(async () => {
        await map.updateSensorValues();
    }, 2000);
});
