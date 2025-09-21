const io = require('socket.io-client');

console.log('🧪 Testing Call Flow: Doctor Accept → Both Move to Call Screen\n');

// Simulate Patient
const patientSocket = io('http://localhost:5002');
let patientInCall = false;

// Simulate Doctor  
const doctorSocket = io('http://localhost:5002');
let doctorInCall = false;

patientSocket.on('connect', () => {
    console.log('👤 Patient connected');
    
    // Patient subscribes to doctor updates
    patientSocket.emit('patient_subscribe', { patientId: '1' });
    
    // Listen for consultation acceptance
    patientSocket.on('consultation_accepted', ({ consultationId, roomId }) => {
        console.log(`✅ Patient received consultation_accepted: ${consultationId}, room: ${roomId}`);
        patientInCall = true;
        console.log('🎥 Patient should now navigate to call screen');
        
        // Check if both are in call
        checkBothInCall();
    });
});

doctorSocket.on('connect', () => {
    console.log('👨‍⚕️ Doctor connected');
    
    // Doctor goes online
    doctorSocket.emit('doctor_online', {
        doctorId: '1',
        doctorInfo: {
            name: 'Test Doctor',
            specialization: 'General Medicine'
        }
    });
    
    // Listen for consultation requests
    doctorSocket.on('consultation_request', (data) => {
        console.log(`📞 Doctor received consultation request: ${data.consultationId}`);
        
        // Doctor accepts after 2 seconds
        setTimeout(() => {
            console.log('✅ Doctor accepting consultation...');
            doctorSocket.emit('consultation_accept', { consultationId: data.consultationId });
            doctorInCall = true;
            console.log('🎥 Doctor should now navigate to call screen');
            
            // Check if both are in call
            checkBothInCall();
        }, 2000);
    });
});

function checkBothInCall() {
    if (patientInCall && doctorInCall) {
        console.log('\n🎉 SUCCESS: Both doctor and patient are in call screen!');
        console.log('✅ Call flow is working correctly');
        process.exit(0);
    }
}

// Start the test after connections are established
setTimeout(() => {
    console.log('\n🚀 Starting consultation request...');
    
    const consultationId = `test_consultation_${Date.now()}`;
    
    // Patient requests consultation
    patientSocket.emit('consultation_request', {
        consultationId,
        doctorId: '1',
        patientId: '1',
        patientInfo: { name: 'Test Patient' },
        consultationType: 'Video'
    });
    
    console.log(`📱 Patient sent consultation request: ${consultationId}`);
}, 1000);

// Timeout after 10 seconds
setTimeout(() => {
    console.log('\n❌ Test timed out - something might be wrong');
    console.log(`Patient in call: ${patientInCall}`);
    console.log(`Doctor in call: ${doctorInCall}`);
    process.exit(1);
}, 10000);