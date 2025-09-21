const fetch = require('node-fetch');

const API_BASE = 'http://localhost:8080/api';

async function testLoginSignup() {
    console.log('🧪 Testing Login/Signup System...\n');
    
    try {
        // Test 1: Register a new user
        console.log('1️⃣ Testing Registration...');
        const registerData = {
            name: 'Test Patient',
            email: 'testpatient@test.com',
            password: 'password123',
            role: 'patient',
            phone: '+91-9999999999',
            address: 'Test Address, Gujarat'
        };
        
        const registerResponse = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });
        
        const registerResult = await registerResponse.json();
        console.log('Registration Result:', registerResult);
        
        if (registerResult.success) {
            console.log('✅ Registration successful');
        } else {
            console.log('❌ Registration failed:', registerResult.message);
        }
        
        // Test 2: Login with the registered user
        console.log('\n2️⃣ Testing Login...');
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'testpatient@test.com',
                password: 'password123'
            })
        });
        
        const loginResult = await loginResponse.json();
        console.log('Login Result:', loginResult);
        
        if (loginResult.success) {
            console.log('✅ Login successful');
        } else {
            console.log('❌ Login failed:', loginResult.message);
        }
        
        // Test 3: Login with existing demo user
        console.log('\n3️⃣ Testing Demo User Login...');
        const demoLoginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'patient1@teleasha.com',
                password: 'password123'
            })
        });
        
        const demoLoginResult = await demoLoginResponse.json();
        console.log('Demo Login Result:', demoLoginResult);
        
        if (demoLoginResult.success) {
            console.log('✅ Demo user login successful');
        } else {
            console.log('❌ Demo user login failed:', demoLoginResult.message);
        }
        
        // Test 4: Test Admin endpoints
        console.log('\n4️⃣ Testing Admin Endpoints...');
        const usersResponse = await fetch(`${API_BASE}/admin/users`);
        const users = await usersResponse.json();
        console.log(`Found ${users.length} users in system`);
        
        const statsResponse = await fetch(`${API_BASE}/admin/stats`);
        const stats = await statsResponse.json();
        console.log('System Stats:', stats);
        
        console.log('\n✅ All tests completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Make sure the backend server is running on port 8080');
    }
}

testLoginSignup();