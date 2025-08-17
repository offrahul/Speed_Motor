const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory user storage for testing (replace with database in production)
const users = [];

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, department } = req.body;

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'User already exists with this email' }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: role || 'customer',
      department,
      isEmailVerified: false,
      createdAt: new Date()
    };

    users.push(user);

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          department: user.department,
          isEmailVerified: user.isEmailVerified
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'User registration failed' }
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Minimal server is running',
    timestamp: new Date().toISOString()
  });
});

// Test registration endpoint
app.get('/test-register', (req, res) => {
  res.json({
    message: 'Registration endpoint is available at POST /api/auth/register',
    requiredFields: ['firstName', 'lastName', 'email', 'phone', 'password'],
    optionalFields: ['role', 'department']
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test registration: http://localhost:${PORT}/test-register`);
  console.log(`Registration endpoint: POST http://localhost:${PORT}/api/auth/register`);
});
