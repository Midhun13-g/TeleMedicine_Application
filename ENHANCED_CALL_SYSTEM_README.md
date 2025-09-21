# Enhanced TeleMedicine Call System

This document describes the enhanced call system that integrates all functionality from the `calls` folder into the main TeleMedicine application.

## 🚀 New Features Implemented

### 1. Doctor Availability Management
- **Real-time doctor presence tracking**
- **Online/offline status updates**
- **Available doctors listing**
- **Automatic status management on disconnect**

### 2. Consultation Request System
- **Patient-to-doctor consultation requests**
- **Accept/reject consultation workflow**
- **Room-based video call setup**
- **Real-time notifications**

### 3. Enhanced WebRTC Signaling
- **REST API + WebSocket dual signaling**
- **Room-based communication**
- **ICE candidate exchange**
- **Offer/answer handling**
- **Connection state management**

### 4. Unified Call Server
- **Single server handling all call features**
- **Socket.IO for real-time communication**
- **Express REST API endpoints**
- **In-memory storage for sessions**

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Spring Backend  │    │ Unified Call    │
│   (Port 5173)   │◄──►│   (Port 8080)    │◄──►│ Server (5002)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                        ┌─────────▼─────────┐
                        │   Database        │
                        │   (H2/MongoDB)    │
                        └───────────────────┘
```

## 📡 API Endpoints

### Doctor Presence
- `POST /api/calls/doctor/online` - Set doctor online
- `POST /api/calls/doctor/offline` - Set doctor offline
- `GET /api/calls/doctors/available` - Get available doctors

### Consultation Management
- `POST /api/calls/consultation/request` - Request consultation
- `POST /api/calls/consultation/{id}/accept` - Accept consultation
- `POST /api/calls/consultation/{id}/reject` - Reject consultation

### WebRTC Signaling
- `POST /api/webrtc/signal` - Send signaling data
- `GET /api/webrtc/signal/{userId}` - Get signaling data
- `POST /api/webrtc/join-room` - Join video call room
- `POST /api/webrtc/offer` - Send WebRTC offer
- `POST /api/webrtc/answer` - Send WebRTC answer
- `POST /api/webrtc/ice-candidate` - Send ICE candidate

## 🔌 WebSocket Events

### Doctor Presence
- `doctor_online` - Doctor comes online
- `doctor_offline` - Doctor goes offline
- `doctor_status_changed` - Doctor status update broadcast

### Consultation Flow
- `consultation_request` - New consultation request
- `consultation_accept` - Consultation accepted
- `consultation_reject` - Consultation rejected

### Video Call Signaling
- `join-room` - Join video call room
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - ICE candidate
- `end-call` - End video call

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
# Install call server dependencies
npm install

# Install frontend dependencies
cd project
npm install
cd ..

# Install backend dependencies (Maven will handle)
cd projectbackend
# Dependencies managed by Maven
cd ..
```

### 2. Start the System
```bash
# Option 1: Use the automated script
start-complete-system.bat

# Option 2: Manual startup
# Terminal 1: Call Server
node unified-call-server.js

# Terminal 2: Spring Backend
cd projectbackend
mvn spring-boot:run

# Terminal 3: React Frontend
cd project
npm run dev

# Terminal 4: Symptom Checker (optional)
cd Symptom_checker/backend
python main.py
```

### 3. Access the Application
- **Frontend**: http://localhost:5173
- **Spring Backend**: http://localhost:8080
- **Call Server**: http://localhost:5002
- **Symptom Checker**: http://localhost:8000

## 💻 Usage Examples

### Doctor Going Online
```javascript
// Frontend
await callService.setDoctorOnline(doctorId);

// Or via Socket.IO
socket.emit('doctor_online', {
  doctorId: 'doctor123',
  doctorInfo: { name: 'Dr. Smith', specialty: 'Cardiology' }
});
```

### Patient Requesting Consultation
```javascript
// Request consultation
const consultation = await callService.requestConsultation(patientId, doctorId);

// Listen for response
socket.on('consultation_accepted', ({ consultationId, roomId }) => {
  // Join video call room
  startVideoCall(roomId);
});
```

### Video Call Flow
```javascript
// Initialize WebRTC with room
const webRTC = useWebRTC({ userId, roomId });

// Start call
await webRTC.initiateCall(targetUserId, true); // true for video

// Handle incoming call
webRTC.acceptCall(offerData, true);

// End call
webRTC.endCall();
```

## 🔧 Configuration

### Environment Variables
```bash
# Call Server
PORT=5002
NODE_ENV=development

# Spring Backend
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=dev

# Frontend
VITE_API_URL=http://localhost:8080
VITE_CALL_SERVER_URL=http://localhost:5002
```

### STUN/TURN Servers
```javascript
const pcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
    // Add TURN servers for production
  ]
};
```

## 🚨 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if call server is running on port 5002
   - Verify firewall settings
   - Ensure CORS is properly configured

2. **Video Call Not Working**
   - Check camera/microphone permissions
   - Verify STUN server connectivity
   - Check browser WebRTC support

3. **Doctor Status Not Updating**
   - Verify Socket.IO connection
   - Check doctor presence API endpoints
   - Ensure proper event handling

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug', 'socket.io-client:*');

// Check WebRTC connection state
console.log(peerConnection.connectionState);
```

## 📈 Performance Considerations

- **Memory Management**: Automatic cleanup of old signals every minute
- **Connection Limits**: Monitor concurrent WebSocket connections
- **Bandwidth**: Optimize video quality based on connection
- **Scalability**: Consider Redis for multi-server deployments

## 🔒 Security Features

- **CORS Configuration**: Restricted origins in production
- **Input Validation**: All API endpoints validate input
- **Session Management**: Automatic cleanup on disconnect
- **WebRTC Security**: DTLS encryption for media streams

## 📝 Future Enhancements

- [ ] Recording functionality
- [ ] Screen sharing support
- [ ] Chat during video calls
- [ ] Call quality metrics
- [ ] Mobile app integration
- [ ] Advanced presence states
- [ ] Call scheduling
- [ ] Multi-party conferences

## 🤝 Integration Points

The enhanced call system integrates with:
- **User Authentication**: Spring Security integration
- **Appointment System**: Automatic call setup from appointments
- **Prescription System**: Post-call prescription generation
- **Notification System**: Real-time call notifications
- **Analytics**: Call duration and quality tracking

## 📞 Support

For technical support or questions about the enhanced call system:
1. Check the troubleshooting section
2. Review the API documentation
3. Test with the provided examples
4. Monitor server logs for errors

---

**Note**: This enhanced system maintains backward compatibility with existing TeleMedicine features while adding comprehensive video calling capabilities.