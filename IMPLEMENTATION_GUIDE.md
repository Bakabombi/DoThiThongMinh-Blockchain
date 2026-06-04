# Smart City Dashboard - Map & Camera System Implementation

## Overview
Successfully added Smart City Map and Real-time Camera Simulation System to the Smart City Monitoring Dashboard project.

## Features Implemented

### 1. Smart City Map System
**File**: `/static/js/map.js`
**Styles**: `/static/css/map.css`

#### Features:
- **Interactive Canvas-based Map**: Displays a visual representation of the city with sensor locations
- **Sensor Visualization**: 
  - 5 different sensors across the city (Traffic, Air Quality, Water Level, Power)
  - Color-coded markers: Red (Traffic), Green (Air Quality), Blue (Water Level), Orange (Power)
  - Animated sensor status indicators with range circles
  
- **City Zones**: Visual representation of Downtown and Industrial zones
- **Grid System**: Background grid overlay for better coordinate reference
- **Legend**: Dynamic legend showing sensor types and colors
- **Interactive Sensor Details**:
  - Click on sensors to view detailed information
  - Real-time sensor value updates
  - Status indicators (Normal, Warning, Danger)

#### Key Components:
```javascript
- SmartCityMap class handles all map operations
- Canvas-based rendering for performance
- Real-time sensor data integration from `/sensors` API endpoint
- Automatic sensor value updates every 2 seconds
```

### 2. Real-time Camera Simulation System
**File**: `/static/js/camera.js`
**Styles**: `/static/css/camera.css`

#### Features:
- **4 Simulated Camera Feeds**:
  1. Traffic Camera - Main Street (1920x1080, 30 fps)
  2. Environmental Camera - Park Area (1920x1080, 24 fps)
  3. Security Camera - Industrial Zone (2560x1440, 30 fps)
  4. Water Level Camera - River (1280x720, 15 fps) [Offline]

- **Live Camera Simulation Scenes**:
  - **Traffic**: Animated vehicles moving across the road with lane markings
  - **Environmental**: Sky gradient changes based on air quality, animated trees, pollution particles
  - **Security**: Motion detection alerts, grid overlay, corridor visualization
  - **Water**: Wave animations, water level monitoring display

- **Camera Controls**:
  - Record button: Start recording from camera
  - Snapshot button: Capture and download image from camera feed
  - Toggle On/Off: Control camera status

- **Real-time Information Display**:
  - Camera name and location
  - Video resolution and FPS
  - Type-specific metrics (vehicle count, air quality, motion detection, etc.)
  - Status indicator (Online/Offline) with animation
  - Last update timestamp

- **Alert System**:
  - Color-coded alert levels (Normal - Green, Warning - Yellow, Danger - Red)
  - Dynamic alert text based on camera metrics
  - Real-time metric updates every 2 seconds

#### Key Components:
```javascript
- CameraSimulator class manages all camera operations
- Canvas-based scene rendering for each camera type
- Autonomous animations for realistic monitoring experience
- Integration with `/cameras` API endpoint
- Global instance accessible for control functions
```

### 3. Backend API Endpoints

#### New Endpoints:

**GET /sensors**
```json
Returns array of sensor objects with:
- id, name, type, coordinates (lat, lng)
- current value, unit
- status (normal, warning, danger)
```

**GET /cameras**
```json
Returns array of camera objects with:
- id, name, location, type
- status (online/offline), resolution, fps
- type-specific metrics
```

### 4. Frontend HTML Updates
**File**: `/templates/index.html`

#### Changes:
- Added CSS links for map and camera styling
- Added map container with `#mapContainer` and `#map` divs
- Added camera grid container with `#cameraGrid` for dynamic camera rendering
- Added map detail display area `#mapDetail`
- Integrated JavaScript libraries:
  - Leaflet (optional, for future enhancements)
  - Custom map.js script
  - Custom camera.js script

### 5. Data Integration

#### Real-time Updates:
- Dashboard updates every 2 seconds
- Map sensors pull latest values from `/data` endpoint
- Camera feeds update metrics from `/data` endpoint
- Sensor status automatically calculated based on thresholds:
  - Traffic > 90: Warning state
  - Air Quality > 170: Danger state; > 100: Warning
  - Water Level > 80: Danger state

## Styling & User Experience

### Color Scheme:
- Gradient dark background (Slate Blue)
- Accent colors: Cyan (#38bdf8) for primary elements
- Status colors: Green (#22c55e), Yellow (#eab308), Red (#ef4444)

### Responsive Design:
- Camera grid adapts to screen size (mobile-friendly)
- Canvas-based map scales with container
- Glassmorphism effect with backdrop blur

### Animations:
- Pulsing status indicators
- Smooth sensor transitions
- Animated wave patterns (water camera)
- Vehicle movement animations
- Blinking alert indicators

## File Structure

```
TPTM-Blockchain/
├── app.py (Updated with /sensors and /cameras routes)
├── static/
│   ├── css/
│   │   ├── map.css
│   │   └── camera.css
│   └── js/
│       ├── map.js
│       └── camera.js
├── templates/
│   └── index.html (Updated with new sections)
└── blockchain/
```

## Technical Implementation Details

### Smart City Map
- Uses native HTML5 Canvas API for rendering
- Event listeners for mouse interaction (hover, click)
- RequestAnimationFrame for smooth animations
- Real-time canvas redrawing every frame

### Camera System
- Separate canvas for each camera feed
- Type-specific rendering functions for different scene types
- Global camera system instance for control methods
- Dynamic HTML generation for camera feeds

### Performance Optimizations
- Canvas rendering instead of DOM elements (better performance)
- Efficient event delegation
- Throttled updates (2-second intervals)
- Conditional rendering (only active cameras animate)

## Usage Instructions

1. **View Sensor Details**:
   - Click on any sensor marker on the Smart City Map
   - Detailed information appears below the map
   - Updates in real-time

2. **Control Cameras**:
   - Click "Record" to simulate recording from a camera
   - Click "Snapshot" to download a screenshot from the camera feed
   - Click "Turn Off/On" to toggle camera status

3. **Monitor Real-time Data**:
   - Dashboard updates every 2 seconds
   - Camera feeds show live simulated scenes
   - Sensor data refreshes automatically

## Dependencies
- Flask & Flask-CORS: Backend API
- Chart.js: Data visualization
- No external frontend libraries required for map/camera (pure JavaScript/Canvas)

## Future Enhancements
- Integration with Leaflet.js for real map tiles
- Video recording functionality
- WebSocket for real-time updates
- 3D visualization with Three.js
- Multi-camera view layouts
- Advanced motion detection algorithms
- Integration with real sensors and cameras
- Database persistence for camera recordings

## Testing
The system has been tested with:
- Multiple simultaneous camera feeds
- Real-time data updates
- Interactive map sensor selection
- Camera control functions
- Responsive UI layout

All features are working correctly and demonstrating the Smart City monitoring capabilities as per the project requirements.
