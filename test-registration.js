const axios = require('axios');

const testRegistration = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/v1/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '1234567890',
      password: 'Test123!@#'
    });
    
    console.log('✅ Registration successful:', response.data);
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
  }
};

testRegistration();
