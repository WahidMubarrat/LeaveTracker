const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Department = require('../models/Department');

// Create Express app for testing
const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// Test database connection
const connectTestDB = async () => {
  try {
    // Use test database
    const testMongoURI = process.env.MONGO_URI.replace('leavetracker', 'leavetracker-test');
    await mongoose.connect(testMongoURI);
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    throw error;
  }
};

// Clean up database
const cleanupDB = async () => {
  try {
    await User.deleteMany({});
    await Department.deleteMany({});
  } catch (error) {
    console.error('Error cleaning up database:', error);
  }
};

// Disconnect from database
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
};

describe('Authentication API Tests', () => {
  let testDepartment;

  beforeAll(async () => {
    await connectTestDB();
  });

  beforeEach(async () => {
    await cleanupDB();
    // Create a test department
    testDepartment = await Department.create({
      name: 'Engineering',
      code: 'ENG',
    });
  });

  afterAll(async () => {
    await cleanupDB();
    await disconnectDB();
  });

  // ============ REGISTER TESTS ============
  describe('POST /api/auth/register', () => {
    test('Should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Test@1234',
        designation: 'Software Engineer',
        departmentId: testDepartment._id.toString(),
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.roles).toContain('Employee');

      // Verify user was saved to database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(userData.name);
    });

    test('Should fail if required fields are missing', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        // Missing password
        designation: 'Software Engineer',
        departmentId: testDepartment._id.toString(),
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('required fields');
    });

    test('Should fail with invalid email format', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Test@1234',
        designation: 'Software Engineer',
        departmentId: testDepartment._id.toString(),
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('valid email');
    });

    test('Should fail with password less than 6 characters', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Test1',
        designation: 'Software Engineer',
        departmentId: testDepartment._id.toString(),
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('at least 6 characters');
    });

    test('Should fail with password without uppercase letters', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'test@1234',
        designation: 'Software Engineer',
        departmentId: testDepartment._id.toString(),
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('uppercase and lowercase');
    });

    test('Should fail if user already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Test@1234',
        designation: 'Software Engineer',
        departmentId: testDepartment._id.toString(),
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already exists');
    });

    test('Should fail with invalid department', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Test@1234',
        designation: 'Software Engineer',
        departmentId: new mongoose.Types.ObjectId().toString(),
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Invalid department');
    });
  });

  // ============ LOGIN TESTS ============
  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Test@1234', salt);

      testUser = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        designation: 'Software Engineer',
        department: testDepartment._id,
        roles: ['Employee'],
      });
    });

    test('Should login successfully with valid credentials', async () => {
      const credentials = {
        email: 'john@example.com',
        password: 'Test@1234',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe(credentials.email);

      // Verify token is valid JWT
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.email).toBe(credentials.email);
    });

    test('Should fail if email is missing', async () => {
      const credentials = {
        password: 'Test@1234',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('email and password');
    });

    test('Should fail if password is missing', async () => {
      const credentials = {
        email: 'john@example.com',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('email and password');
    });

    test('Should fail with incorrect email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'Test@1234',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('Should fail with incorrect password', async () => {
      const credentials = {
        email: 'john@example.com',
        password: 'WrongPassword@1',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  // ============ GET PROFILE TESTS ============
  describe('GET /api/auth/profile', () => {
    let testUser;
    let token;

    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Test@1234', salt);

      testUser = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        designation: 'Software Engineer',
        department: testDepartment._id,
        roles: ['Employee'],
      });

      token = jwt.sign(
        { id: testUser._id, email: testUser.email, roles: testUser.roles },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    });

    test('Should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('john@example.com');
      expect(response.body.user.name).toBe('John Doe');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('Should fail without authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
    });

    test('Should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    test('Should fail with expired token', async () => {
      const expiredToken = jwt.sign(
        { id: testUser._id, email: testUser.email, roles: testUser.roles },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      );

      // Wait a moment to ensure token is expired
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });
  });
});
