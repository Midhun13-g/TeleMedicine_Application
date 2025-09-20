# Quick Start Guide - Video Call Features

## Issue Resolution
The WebSocket dependency issue has been resolved by simplifying the implementation.

## What Was Fixed
1. **Simplified WebSocket Configuration** - Removed complex STOMP dependencies
2. **Basic WebSocket Handler** - Simple broadcast-based signaling
3. **REST Fallback** - Added REST endpoints for signaling as backup
4. **Error Handling** - Added proper error handling in frontend

## Quick Setup

### 1. Start Backend
```bash
cd "e:\SIH 25\TeleMedicine_Application\projectbackend"
# If you have Maven installed:
mvn spring-boot:run

# If Maven is not available, use your IDE to run ProjectbackendApplication.java
```

### 2. Start Frontend
```bash
cd "e:\SIH 25\TeleMedicine_Application\project"
npm install
npm run dev
```

## Features Available
- ✅ Video Call Component
- ✅ Audio Call Support  
- ✅ Call Notifications
- ✅ Call Accept/Reject
- ✅ Basic WebRTC Signaling
- ✅ Call Management API

## Testing
1. Open two browser windows
2. Login as Doctor in one, Patient in another
3. Doctor can initiate calls from appointments
4. Patient receives notifications and can accept/reject

## Troubleshooting
- **Backend won't start**: Run ProjectbackendApplication.java directly from your IDE
- **WebSocket connection fails**: Check if port 8080 is available
- **Camera/Mic not working**: Ensure browser permissions are granted

## Next Steps
Once the basic setup works, you can enhance with:
- TURN servers for better connectivity
- Call recording
- Screen sharing
- Group calls