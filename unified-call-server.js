const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// In-memory storage
const doctors = new Map();
const patients = new Map(); // Track patient socket connections
const consultations = new Map();
const signalStore = new Map();

// REST API Routes
app.post('/api/calls/doctor/online', (req, res) => {
  const { doctorId, doctorInfo } = req.body;
  doctors.set(doctorId, { ...doctorInfo, online: true });
  io.emit('doctor_status_changed', { doctorId, status: 'online', doctorInfo });
  res.json({ message: 'Doctor status updated to online' });
});

app.post('/api/calls/doctor/offline', (req, res) => {
  const { doctorId } = req.body;
  if (doctors.has(doctorId)) {
    doctors.set(doctorId, { ...doctors.get(doctorId), online: false });
  }
  io.emit('doctor_status_changed', { doctorId, status: 'offline' });
  res.json({ message: 'Doctor status updated to offline' });
});

app.post('/api/calls/doctor/update', (req, res) => {
  const { doctorId, doctorInfo } = req.body;
  if (doctors.has(doctorId)) {
    const currentDoctor = doctors.get(doctorId);
    doctors.set(doctorId, { ...currentDoctor, ...doctorInfo });
    
    // Broadcast updated doctor info to all patients
    io.emit('doctor_info_updated', { doctorId, doctorInfo: { ...currentDoctor, ...doctorInfo } });
    res.json({ message: 'Doctor information updated and broadcasted' });
  } else {
    res.status(404).json({ error: 'Doctor not found' });
  }
});

app.get('/api/calls/doctors/available', (req, res) => {
  const availableDoctors = Array.from(doctors.entries())
    .filter(([_, info]) => info.online)
    .map(([doctorId, info]) => ({ doctorId, ...info }));
  res.json(availableDoctors);
});

app.get('/api/calls/debug', (req, res) => {
  res.json({
    doctors: Array.from(doctors.entries()),
    patients: Array.from(patients.entries()),
    consultations: Array.from(consultations.entries())
  });
});

// Prescription notification endpoint
app.post('/api/prescription/notify', (req, res) => {
  const { patientId, doctorName, prescriptionId } = req.body;
  
  // Find patient socket and notify
  const patient = patients.get(patientId);
  if (patient && patient.online) {
    io.to(patient.socketId).emit('prescription_added', {
      patientId,
      doctorName,
      prescriptionId
    });
  }
  
  // Also broadcast to all
  io.emit('prescription_added', { patientId, doctorName, prescriptionId });
  
  res.json({ success: true, message: 'Notification sent' });
});

// Medicine taken notification endpoint
app.post('/api/medicine/taken', (req, res) => {
  const { patientId, patientName, doctorId, prescriptionId, takenAt } = req.body;
  
  // Find doctor socket and notify
  const doctor = doctors.get(doctorId);
  if (doctor && doctor.online && doctor.socketId) {
    io.to(doctor.socketId).emit('medicine_taken', {
      patientId,
      patientName,
      prescriptionId,
      takenAt
    });
  }
  
  // Also broadcast to all doctors
  io.emit('medicine_taken', { patientId, patientName, doctorId, prescriptionId, takenAt });
  
  res.json({ success: true, message: 'Doctor notified' });
});

// Report status update endpoint
app.post('/api/emit/report-status-update', (req, res) => {
  const { reportId, reporterId, status } = req.body;
  const eventData = { reportId, reporterId, status };
  
  // Broadcast to ALL clients immediately
  io.emit('report_status_updated', eventData);
  io.emit('admin_reports_refresh', eventData);
  io.emit('reports_global_update', eventData);
  
  if (status === 'PENDING') {
    io.emit('new_report_submitted', eventData);
  }
  
  res.json({ success: true });
});

app.post('/api/calls/consultation/request', (req, res) => {
  const { patientId, doctorId } = req.body;
  const consultationId = `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const consultation = {
    consultationId,
    patientId,
    doctorId,
    status: 'requested',
    timestamp: new Date()
  };
  
  consultations.set(consultationId, consultation);
  
  const doctor = doctors.get(doctorId);
  if (doctor && doctor.online && doctor.socketId) {
    io.to(doctor.socketId).emit('consultation_request', consultation);
  }
  
  res.json({ consultationId, status: 'requested' });
});

app.post('/api/calls/consultation/:consultationId/accept', (req, res) => {
  const { consultationId } = req.params;
  const consultation = consultations.get(consultationId);
  
  if (consultation) {
    const roomId = `room_${consultationId}`;
    consultation.status = 'accepted';
    consultation.roomId = roomId;
    
    // Notify patient
    io.emit('consultation_accepted', { consultationId, roomId });
    
    res.json({ consultationId, roomId, status: 'accepted' });
  } else {
    res.status(404).json({ error: 'Consultation not found' });
  }
});

app.post('/api/calls/consultation/:consultationId/reject', (req, res) => {
  const { consultationId } = req.params;
  const { reason } = req.body;
  const consultation = consultations.get(consultationId);
  
  if (consultation) {
    consultation.status = 'rejected';
    consultation.reason = reason || 'Doctor unavailable';
    
    // Notify patient
    io.emit('consultation_rejected', { consultationId, reason: consultation.reason });
    
    res.json({ consultationId, status: 'rejected', reason: consultation.reason });
  } else {
    res.status(404).json({ error: 'Consultation not found' });
  }
});

// WebRTC Signaling Routes
app.post('/api/webrtc/signal', (req, res) => {
  const { targetUserId, type, ...data } = req.body;
  if (targetUserId) {
    signalStore.set(targetUserId, { type, ...data, timestamp: Date.now() });
  }
  res.json({ status: 'Signal sent' });
});

app.get('/api/webrtc/signal/:userId', (req, res) => {
  const { userId } = req.params;
  const signal = signalStore.get(userId);
  if (signal) {
    signalStore.delete(userId);
    res.json(signal);
  } else {
    res.json({});
  }
});

app.post('/api/webrtc/join-room', (req, res) => {
  const { roomId, userId, userType } = req.body;
  res.json({ status: 'joined', roomId, userType });
});

app.post('/api/webrtc/offer', (req, res) => {
  const { roomId, offer } = req.body;
  signalStore.set(`${roomId}_offer`, { offer, timestamp: Date.now() });
  res.json({ status: 'Offer sent' });
});

app.post('/api/webrtc/answer', (req, res) => {
  const { roomId, answer } = req.body;
  signalStore.set(`${roomId}_answer`, { answer, timestamp: Date.now() });
  res.json({ status: 'Answer sent' });
});

app.post('/api/webrtc/ice-candidate', (req, res) => {
  const { roomId, candidate } = req.body;
  const key = `${roomId}_ice_${Date.now()}`;
  signalStore.set(key, { candidate, timestamp: Date.now() });
  res.json({ status: 'ICE candidate sent' });
});

app.get('/api/webrtc/room/:roomId/signals', (req, res) => {
  const { roomId } = req.params;
  const signals = {};
  
  const offer = signalStore.get(`${roomId}_offer`);
  if (offer) {
    signals.offer = offer.offer;
    signalStore.delete(`${roomId}_offer`);
  }
  
  const answer = signalStore.get(`${roomId}_answer`);
  if (answer) {
    signals.answer = answer.answer;
    signalStore.delete(`${roomId}_answer`);
  }
  
  res.json(signals);
});

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  // Doctor presence management
  socket.on('doctor_online', ({ doctorId, doctorInfo }) => {
    doctors.set(doctorId, { ...doctorInfo, online: true, socketId: socket.id });
    io.emit('doctor_status_changed', { doctorId, status: 'online', doctorInfo });
    console.log(`🟢 Doctor ${doctorId} online with socket: ${socket.id}`);
  });

  socket.on('doctor_offline', ({ doctorId }) => {
    if (doctors.has(doctorId)) {
      doctors.set(doctorId, { ...doctors.get(doctorId), online: false });
    }
    io.emit('doctor_status_changed', { doctorId, status: 'offline' });
    console.log(`🔴 Doctor ${doctorId} offline`);
  });
  
  socket.on('doctor_info_update', ({ doctorId, doctorInfo }) => {
    if (doctors.has(doctorId)) {
      const currentDoctor = doctors.get(doctorId);
      doctors.set(doctorId, { ...currentDoctor, ...doctorInfo });
      
      // Broadcast updated doctor info to all patients
      io.emit('doctor_info_updated', { doctorId, doctorInfo: { ...currentDoctor, ...doctorInfo } });
      console.log(`📝 Doctor ${doctorId} info updated:`, doctorInfo);
    }
  });

  socket.on('patient_subscribe', ({ patientId }) => {
    // Track patient socket connection
    patients.set(patientId, { socketId: socket.id, online: true });
    
    const onlineDoctors = Array.from(doctors.entries())
      .filter(([_, info]) => info.online)
      .map(([doctorId, info]) => ({ doctorId, ...info }));
    socket.emit('doctors_status', onlineDoctors);
    console.log(`👤 Patient ${patientId} subscribed with socket: ${socket.id}`);
  });
  
  socket.on('doctor_subscribe', ({ doctorId }) => {
    // Track doctor socket connection for reports
    if (doctors.has(doctorId)) {
      const currentDoctor = doctors.get(doctorId);
      doctors.set(doctorId, { ...currentDoctor, socketId: socket.id, online: true });
    } else {
      doctors.set(doctorId, { socketId: socket.id, online: true });
    }
    console.log(`🩺 Doctor ${doctorId} subscribed with socket: ${socket.id}`);
  });

  // Consultation handling
  socket.on('consultation_request', (data) => {
    const doctor = doctors.get(data.doctorId);
    if (doctor && doctor.online) {
      consultations.set(data.consultationId, { ...data, patientSocketId: socket.id });
      io.to(doctor.socketId).emit('consultation_request', data);
      console.log(`📞 Consultation request: ${data.consultationId}`);
      console.log(`  - Patient socket ID: ${socket.id}`);
      console.log(`  - Doctor socket ID: ${doctor.socketId}`);
    }
  });

  socket.on('start_call', ({ consultationId, roomId }) => {
    console.log(`🎬 Doctor starting call: ${consultationId}, room: ${roomId}`);
    const consultation = consultations.get(consultationId);
    
    if (consultation) {
      console.log(`  - Found consultation for patient: ${consultation.patientId}`);
      
      // Try to get patient socket from consultation first
      let patientSocketId = consultation.patientSocketId;
      
      // If not found, try to get from patients map
      if (!patientSocketId) {
        const patient = patients.get(consultation.patientId);
        if (patient && patient.online) {
          patientSocketId = patient.socketId;
          console.log(`  - Found patient socket from patients map: ${patientSocketId}`);
        }
      }
      
      if (patientSocketId) {
        io.to(patientSocketId).emit('move_to_call', { roomId, consultationId });
        console.log(`  - ✅ Sent move_to_call to patient socket: ${patientSocketId}`);
      } else {
        console.log(`  - ❌ No patient socket ID found, broadcasting to all`);
        // Fallback: broadcast to all patients
        io.emit('move_to_call', { roomId, consultationId });
        console.log(`  - 📡 Broadcasted move_to_call to all clients`);
      }
    } else {
      console.log(`  - ❌ Consultation not found: ${consultationId}`);
    }
  });

  socket.on('consultation_reject', ({ consultationId, reason }) => {
    const consultation = consultations.get(consultationId);
    if (consultation) {
      consultation.status = 'rejected';
      consultation.reason = reason;
      // Notify the specific patient
      if (consultation.patientSocketId) {
        io.to(consultation.patientSocketId).emit('consultation_rejected', { consultationId, reason });
      }
      // Also broadcast to all patients (fallback)
      io.emit('consultation_reject', { consultationId, reason });
      console.log(`❌ Consultation rejected: ${consultationId}, reason: ${reason}`);
    }
  });

  // Video call signaling
  socket.on('join-room', ({ roomId, userType }) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', { userType });
    console.log(`🎥 ${userType} joined room: ${roomId}`);
  });

  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', { offer });
    console.log(`📤 Offer sent to room: ${roomId}`);
  });

  socket.on('answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer', { answer });
    console.log(`📥 Answer sent to room: ${roomId}`);
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { candidate });
  });

  socket.on('end-call', ({ roomId }) => {
    socket.to(roomId).emit('call-ended');
    socket.leave(roomId);
    
    // Clean up consultation if exists
    const consultation = Array.from(consultations.values()).find(c => 
      c.roomId === roomId || `room_${c.consultationId}` === roomId || `audio_room_${c.consultationId}` === roomId
    );
    if (consultation) {
      consultation.status = 'ended';
      console.log(`📋 Consultation ${consultation.consultationId} marked as ended`);
    }
    
    console.log(`📞 Call ended in room: ${roomId}`);
  });
  
  socket.on('leave-room', ({ roomId }) => {
    socket.to(roomId).emit('user-left');
    socket.leave(roomId);
    
    // Clean up consultation if exists
    const consultation = Array.from(consultations.values()).find(c => 
      c.roomId === roomId || `room_${c.consultationId}` === roomId || `audio_room_${c.consultationId}` === roomId
    );
    if (consultation) {
      consultation.status = 'ended';
      console.log(`📋 Consultation ${consultation.consultationId} marked as ended`);
    }
    
    console.log(`👋 User left room: ${roomId}`);
  });
  
  // Prescription notifications
  socket.on('prescription_added', (prescriptionData) => {
    console.log(`💊 Prescription notification received:`, prescriptionData);
    
    // Try to send to specific patient first
    const patient = patients.get(prescriptionData.patientId);
    if (patient && patient.online && patient.socketId) {
      io.to(patient.socketId).emit('prescription_added', prescriptionData);
      console.log(`  - ✅ Sent to specific patient socket: ${patient.socketId}`);
    } else {
      console.log(`  - ⚠️ Patient ${prescriptionData.patientId} not found or offline, broadcasting to all`);
    }
    
    // Always broadcast to all as fallback
    io.emit('prescription_added', prescriptionData);
    console.log(`  - 📡 Broadcasted to all clients`);
  });
  
  // Medicine taken notifications
  socket.on('medicine_taken_notification', (data) => {
    console.log(`💊 Medicine taken notification:`, data);
    
    // Broadcast to all doctors
    const onlineDoctors = Array.from(doctors.entries()).filter(([_, info]) => info.online);
    onlineDoctors.forEach(([doctorId, doctorInfo]) => {
      if (doctorInfo.socketId) {
        io.to(doctorInfo.socketId).emit('medicine_taken', data);
        console.log(`  - 📡 Sent to doctor ${doctorId} (${doctorInfo.socketId})`);
      }
    });
    
    // Also broadcast to all as fallback
    io.emit('medicine_taken', data);
    console.log(`  - 📡 Broadcasted medicine_taken to all clients`);
  });
  
  // Report management
  socket.on('user_report', (reportData) => {
    io.emit('user_report', reportData);
    io.emit('new_report_submitted', reportData);
    io.emit('admin_reports_refresh', reportData);
    io.emit('reports_global_update', reportData);
  });
  
  socket.on('admin_subscribe', ({ adminId }) => {
    socket.adminId = adminId;
  });

  socket.on('disconnect', () => {
    // Handle doctor disconnect
    const doctorId = Array.from(doctors.entries()).find(([_, info]) => info.socketId === socket.id)?.[0];
    if (doctorId) {
      doctors.set(doctorId, { ...doctors.get(doctorId), online: false });
      io.emit('doctor_status_changed', { doctorId, status: 'offline' });
      console.log(`🔴 Doctor ${doctorId} disconnected`);
    }
    
    // Handle patient disconnect
    const patientId = Array.from(patients.entries()).find(([_, info]) => info.socketId === socket.id)?.[0];
    if (patientId) {
      patients.set(patientId, { ...patients.get(patientId), online: false });
      console.log(`👤 Patient ${patientId} disconnected`);
    }
    
    // End calls in all rooms this user was in
    const rooms = Array.from(socket.rooms);
    rooms.forEach(roomId => {
      if (roomId !== socket.id) {
        socket.to(roomId).emit('call-ended');
        socket.to(roomId).emit('user-left');
      }
    });
    
    console.log('❌ User disconnected:', socket.id);
  });
});

// Cleanup old signals periodically
setInterval(() => {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes
  
  for (const [key, value] of signalStore.entries()) {
    if (value.timestamp && (now - value.timestamp) > maxAge) {
      signalStore.delete(key);
    }
  }
}, 60000); // Run every minute

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`🚀 Unified TeleMedicine Call Server running on port ${PORT}`);
  console.log('📡 Features: Doctor Presence + Consultations + Video Calls + WebRTC Signaling');
  console.log('🔗 REST API: http://localhost:' + PORT);
  console.log('🔌 WebSocket: ws://localhost:' + PORT);
});