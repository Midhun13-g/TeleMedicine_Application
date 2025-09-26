// Simple Node.js script to test backend
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8080/api';

async function testBackend() {
    console.log('🧪 Testing Backend API...\n');
    
    // Test 1: Health Check
    try {
        console.log('1. Testing Health Check...');
        const response = await fetch(`${API_BASE}/auth/health`);
        const result = await response.json();
        console.log('✅ Health Check:', result);
    } catch (error) {
        console.log('❌ Health Check Failed:', error.message);
        console.log('   Make sure backend is running: cd projectbackend && mvn spring-boot:run');
        return;
    }
    
    // Test 2: Register User
    try {
        console.log('\n2. Testing User Registration...');
        const userData = {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            role: 'patient',
            phone: '1234567890',
            address: 'Test Address'
        };
        
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        console.log('✅ Registration Result:', result);
        
        if (result.success) {
            // Test 3: Login with registered user
            console.log('\n3. Testing Login...');
            const loginResponse = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password
                })
            });
            
            const loginResult = await loginResponse.json();
            console.log('✅ Login Result:', loginResult);
        }
        
    } catch (error) {
        console.log('❌ Registration/Login Failed:', error.message);
    }
    
    // Test 4: Admin Login
    try {
        console.log('\n4. Testing Admin Login...');
        const adminResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@teleasha.com',
                password: 'admin123'
            })
        });
        
        const adminResult = await adminResponse.json();
        console.log('✅ Admin Login Result:', adminResult);
        
    } catch (error) {
        console.log('❌ Admin Login Failed:', error.message);
    }
    
    console.log('\n🎉 Backend tests completed!');
}

testBackend();