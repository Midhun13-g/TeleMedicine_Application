const fetch = require('node-fetch');

async function testBackend() {
  console.log('🧪 Testing Backend Connection...');
  
  try {
    // Test basic connection
    const healthResponse = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test'
      })
    });
    
    console.log('Backend response status:', healthResponse.status);
    
    if (healthResponse.status === 200 || healthResponse.status === 400) {
      console.log('✅ Backend is running and responding');
      
      // Test with valid credentials
      const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'dr.sharma@teleasha.com',
          password: 'password123'
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('Login test result:', loginData);
      
      if (loginData.success) {
        console.log('✅ Login working correctly');
      } else {
        console.log('❌ Login failed - check user creation');
      }
      
    } else {
      console.log('❌ Backend not responding correctly');
    }
    
  } catch (error) {
    console.log('❌ Backend connection failed:', error.message);
    console.log('💡 Make sure backend is running: mvn spring-boot:run');
  }
}

testBackend();