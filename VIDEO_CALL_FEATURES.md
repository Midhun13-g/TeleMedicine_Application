# Video Call & Audio Call Features

## Overview
This implementation adds comprehensive video and audio calling capabilities to your telemedicine application using WebRTC technology, integrated from the existing demo projects.

## Features Added

### 1. Backend Features
- **WebSocket Signaling Server**: Real-time communication for WebRTC
- **Call Management API**: REST endpoints for call operations
- **Call Database Model**: Track call history and status
- **Notification System**: Real-time call notifications

### 2. Frontend Features
- **Video Call Component**: Full-featured video calling interface
- **Audio Call Support**: Audio-only calling option
- **Call Notifications**: Real-time incoming call alerts
- **Call Controls**: Mute, video toggle, end call functionality

### 3. Integration Points
- **Doctor Dashboard**: Initiate calls with patients
- **Patient Dashboard**: Receive and join calls
- **Appointment System**: Direct call integration from appointments

## Technical Implementation

### Backend Components
```
projectbackend/
├── model/Call.java              # Call entity model
├── repository/CallRepository.java # Data access layer
├── service/CallService.java     # Business logic
├── controller/CallController.java # REST API endpoints
├── service/SignalingHandler.java # WebSocket handler
└── config/WebSocketConfig.java  # WebSocket configuration
```

### Frontend Components
```
project/src/
├── components/VideoCall.tsx      # Main video call component
├── components/CallNotification.tsx # Notification component
├── hooks/useWebRTC.ts           # WebRTC custom hook
└── services/callService.ts      # API service layer
```

## API Endpoints

### Call Management
- `POST /api/calls/initiate` - Start a new call
- `PUT /api/calls/{id}/accept` - Accept incoming call
- `PUT /api/calls/{id}/reject` - Reject incoming call
- `PUT /api/calls/{id}/end` - End active call
- `GET /api/calls/user/{userId}` - Get user's call history
- `GET /api/calls/incoming/{userId}` - Get incoming calls

### WebSocket Signaling
- `ws://localhost:8080/signaling?userId={userId}` - WebRTC signaling

## Usage Instructions

### For Doctors
1. Navigate to Doctor Dashboard
2. Find approved appointments
3. Click "Start Consultation" to initiate video/audio call
4. Use call controls during the session

### For Patients
1. Navigate to Patient Dashboard
2. Receive real-time call notifications
3. Accept/reject incoming calls
4. Join calls from approved appointments

## Call Flow
1. **Initiation**: Doctor/Patient initiates call via API
2. **Signaling**: WebSocket handles WebRTC negotiation
3. **Connection**: Peer-to-peer connection established
4. **Communication**: Video/audio streams exchanged
5. **Termination**: Call ended and status updated

## Security Features
- STUN server for NAT traversal
- Secure WebSocket connections
- Call session management
- User authentication required

## Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Installation
Run the installation script:
```bash
install-video-call.bat
```

## Configuration
Update `application.properties` for production:
```properties
# WebSocket configuration
spring.websocket.allowed-origins=https://yourdomain.com
```

## Troubleshooting

### Common Issues
1. **Camera/Microphone Access**: Ensure browser permissions
2. **Connection Issues**: Check firewall settings
3. **Audio Echo**: Use headphones or enable echo cancellation

### Debug Mode
Enable WebRTC logging in browser console:
```javascript
localStorage.setItem('debug', 'webrtc*');
```

## Future Enhancements
- Screen sharing capability
- Call recording functionality
- Group video calls
- Chat during calls
- Call quality metrics