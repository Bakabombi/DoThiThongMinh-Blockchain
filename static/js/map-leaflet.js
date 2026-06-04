// ====================================
// SMART CITY MAP - LEAFLET.JS + OpenStreetMap
// ====================================

class SmartCityMapLeaflet {
    constructor() {
        this.map = null;
        this.markers = [];
        this.zones = [];
        this.sensorData = {};
        this.updateInterval = null;
    }

    async initialize() {
        // Initialize Leaflet map (Ho Chi Minh City center)
        this.map = L.map('mapContainer').setView([10.7769, 106.7009], 12);
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);
        
        // Create zones
        this.createZones();
        
        // Start updating real-time data
        await this.updateData();
        this.startRealTimeUpdates();
        
        // Add legend
        this.addLegend();
    }

    createZones() {
        // Zone A - District 1 (High AQI - Air Quality Issue)
        this.zones.push({
            name: 'Khu A (District 1)',
            coords: [10.7905, 106.7048],
            type: 'air_quality',
            color: '#ef4444', // Red
            issue: 'AQI cao',
            value: 185,
            status: 'danger'
        });

        // Zone B - District 3 (Traffic Congestion)
        this.zones.push({
            name: 'Khu B (District 3)',
            coords: [10.8000, 106.6900],
            type: 'traffic',
            color: '#f97316', // Orange
            issue: 'Kẹt xe',
            value: 450,
            status: 'warning'
        });

        // Zone C - District 4 (Water Flooding)
        this.zones.push({
            name: 'Khu C (District 4)',
            coords: [10.7600, 106.7500],
            type: 'water',
            color: '#3b82f6', // Blue
            issue: 'Ngập nước',
            value: 2.8,
            status: 'warning'
        });

        // Zone D - District 7 (Normal)
        this.zones.push({
            name: 'Khu D (District 7)',
            coords: [10.7400, 106.7300],
            type: 'electricity',
            color: '#22c55e', // Green
            issue: 'Bình thường',
            value: 850,
            status: 'normal'
        });

        // Zone E - District 5 (Security)
        this.zones.push({
            name: 'Khu E (District 5)',
            coords: [10.7700, 106.6700],
            type: 'security',
            color: '#8b5cf6', // Purple
            issue: 'Giám sát',
            value: 5,
            status: 'normal'
        });

        // Create markers for each zone
        this.createZoneMarkers();
    }

    createZoneMarkers() {
        this.zones.forEach(zone => {
            // Create custom HTML icon with emoji
            const iconEmoji = this.getEmojiForType(zone.type);
            const iconColor = zone.color;
            
            const html = `
                <div style="
                    background: ${iconColor};
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    border: 3px solid white;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                ">
                    ${iconEmoji}
                </div>
            `;

            const icon = L.divIcon({
                html: html,
                iconSize: [40, 40],
                className: 'custom-zone-marker'
            });

            const marker = L.marker(zone.coords, { icon }).addTo(this.map);
            
            // Create popup content
            const popupContent = `
                <div style="font-family: Arial; min-width: 200px;">
                    <h3 style="margin: 0 0 10px 0; color: ${zone.color};">${zone.name}</h3>
                    <p style="margin: 5px 0;"><strong>Tình trạng:</strong> ${zone.issue}</p>
                    <p style="margin: 5px 0;"><strong>Giá trị:</strong> ${zone.value}${this.getUnitForType(zone.type)}</p>
                    <p style="margin: 5px 0;">
                        <strong>Mức độ:</strong> 
                        <span style="color: ${zone.color}; font-weight: bold;">
                            ${zone.status.toUpperCase()}
                        </span>
                    </p>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            marker.on('mouseover', function() { this.openPopup(); });
            marker.on('mouseout', function() { this.closePopup(); });
            
            this.markers.push({ marker, zone });
        });
    }

    getEmojiForType(type) {
        const emojis = {
            'air_quality': '💨',
            'traffic': '🚗',
            'water': '💧',
            'electricity': '⚡',
            'security': '🎥'
        };
        return emojis[type] || '📍';
    }

    getUnitForType(type) {
        const units = {
            'air_quality': ' AQI',
            'traffic': ' xe/phút',
            'water': ' m',
            'electricity': ' MW',
            'security': ' camera'
        };
        return units[type] || '';
    }

    async updateData() {
        try {
            const response = await fetch('/data');
            const data = await response.json();
            this.sensorData = data;
            
            // Update zone values based on real-time data
            if (data.traffic !== undefined) {
                this.zones[1].value = data.traffic;
                this.updateZoneStatus(1, data.traffic, 200, 400);
            }
            if (data.air_quality !== undefined) {
                this.zones[0].value = data.air_quality;
                this.updateZoneStatus(0, data.air_quality, 100, 150);
            }
            if (data.water_level !== undefined) {
                this.zones[2].value = data.water_level;
                this.updateZoneStatus(2, data.water_level, 2.0, 3.5);
            }
            if (data.electricity !== undefined) {
                this.zones[3].value = data.electricity;
                this.updateZoneStatus(3, data.electricity, 500, 900);
            }
            
        } catch (error) {
            console.error('Error updating data:', error);
        }
    }

    updateZoneStatus(zoneIndex, value, warningThreshold, dangerThreshold) {
        const zone = this.zones[zoneIndex];
        
        if (value > dangerThreshold) {
            zone.status = 'danger';
            zone.color = '#ef4444';
        } else if (value > warningThreshold) {
            zone.status = 'warning';
            zone.color = '#f97316';
        } else {
            zone.status = 'normal';
            zone.color = '#22c55e';
        }
    }

    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateData();
        }, 2000); // Update every 2 seconds
    }

    addLegend() {
        const legend = L.control({ position: 'bottomright' });
        
        legend.onAdd = (map) => {
            const div = L.DomUtil.create('div', 'legend');
            div.style.cssText = `
                background: rgba(255, 255, 255, 0.95);
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                font-family: Arial;
                font-size: 12px;
                line-height: 1.8;
            `;
            
            div.innerHTML = `
                <h4 style="margin: 0 0 10px 0; font-size: 14px;">Huyền thoại</h4>
                <p><span style="color: #ef4444;">●</span> Cấp độ nguy hiểm</p>
                <p><span style="color: #f97316;">●</span> Cảnh báo</p>
                <p><span style="color: #22c55e;">●</span> Bình thường</p>
                <hr style="margin: 8px 0;">
                <p><strong>💨</strong> Chất lượng không khí</p>
                <p><strong>🚗</strong> Giao thông</p>
                <p><strong>💧</strong> Nước</p>
                <p><strong>⚡</strong> Điện</p>
                <p><strong>🎥</strong> An ninh</p>
            `;
            
            return div;
        };
        
        legend.addTo(this.map);
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.map) {
            this.map.remove();
        }
    }
}

// Initialize map when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer) {
        window.cityMap = new SmartCityMapLeaflet();
        window.cityMap.initialize();
    }
});
