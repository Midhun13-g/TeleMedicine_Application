# Simple Video Call Setup (No WebSocket Dependencies)

## Problem Solved ✅
Removed all WebSocket dependencies that were causing classpath issues. Now using simple REST API for signaling.

## What Changed
1. **Removed WebSocket** - No more complex WebSocket configurations
2. **REST-based Signaling** - Uses simple HTTP polling for WebRTC signaling
3. **Simplified Dependencies** - Only core Spring Boot dependencies

## How It Works Now
- **Frontend**: Polls REST API every 2 seconds for incoming signals
- **Backend**: Stores signals in memory and serves them via REST endpoints
- **WebRTC**: Still works peer-to-peer for actual video/audio streams

## Quick Start

### 1. Backend
```bash
# Just run the main application class from your IDE
# File: ProjectbackendApplication.java
```

### 2. Frontend
```bash
cd "e:\SIH 25\TeleMedicine_Application\project"
npm install
npm run dev
```

## API Endpoints Available
- `POST /api/webrtc/signal` - Send WebRTC signals
- `GET /api/webrtc/signal/{userId}` - Get pending signals
- `POST /api/calls/initiate` - Start a call
- `PUT /api/calls/{id}/accept` - Accept call
- `PUT /api/calls/{id}/reject` - Reject call

## Testing Video Calls
1. Open browser as Doctor → Go to appointments → Click "Start Consultation"
2. Open another browser as Patient → Should see call notification
3. Accept call → Video call should start

## No More Errors! 🎉
The application should now start without any WebSocket classpath errors.