const io = require('socket.io-client');

console.log('🧪 Testing Call Server Connection...');

const socket = io('http://localhost:5002');

socket.on('connect', () => {
  console.log('✅ Connected to call server');
  
  // Test doctor going online
  socket.emit('doctor_online', {
    doctorId: 'test-doctor-1',
    doctorInfo: {
      name: 'Test Doctor',
      specialization: 'General Medicine',
      experience: '5 years'
    }
  });
  
  console.log('📤 Sent doctor online event');
  
  setTimeout(() => {
    socket.disconnect();
    console.log('✅ Test completed successfully');
    process.exit(0);
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection failed:', error.message);
  console.log('💡 Make sure call server is running: node unified-call-server.js');
  process.exit(1);
});

socket.on('doctor_status_changed', (data) => {
  console.log('📢 Received doctor status change:', data);
});

setTimeout(() => {
  console.log('⏰ Connection timeout - call server may not be running');
  process.exit(1);
}, 5000);