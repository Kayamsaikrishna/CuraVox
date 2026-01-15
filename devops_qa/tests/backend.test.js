/**
 * Backend API tests for Medical AI Assistant
 * These are example tests showing the structure for backend testing
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../backend_api/server');

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

describe('Backend API Tests', () => {
    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        // Close database connection
        await mongoose.connection.close();
    });

    describe('Health Check Endpoint', () => {
        test('should return health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body.status).toBe('OK');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
        });
    });

    describe('Root Endpoint', () => {
        test('should return API information', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.body.message).toBe('Medical AI Assistant API');
            expect(response.body.version).toBe('1.0.0');
            expect(response.body.endpoints).toHaveProperty('auth');
            expect(response.body.endpoints).toHaveProperty('users');
            expect(response.body.endpoints).toHaveProperty('medicine');
            expect(response.body.endpoints).toHaveProperty('ocr');
        });
    });

    describe('Authentication Routes', () => {
        test('should register a new user', async () => {
            const userData = {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User registered successfully');
            expect(response.body.data.user).toHaveProperty('email');
            expect(response.body.data.user.email).toBe(userData.email);
            expect(response.body).toHaveProperty('token');
        });

        test('should login an existing user', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Login successful');
            expect(response.body).toHaveProperty('token');
        });

        test('should return user profile', async () => {
            // First register and login a user to get a token
            const userData = {
                firstName: 'Test2',
                lastName: 'User2',
                email: 'test2@example.com',
                password: 'password123'
            };

            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send(userData);

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });

            const token = loginResponse.body.token;

            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Current user retrieved successfully');
            expect(response.body.data.user).toHaveProperty('email');
            expect(response.body.data.user.email).toBe(userData.email);
        });
    });

    describe('Medicine Routes', () => {
        let authToken;
        let adminToken;

        beforeAll(async () => {
            // Create a regular user and get token
            const userData = {
                firstName: 'Regular',
                lastName: 'User',
                email: 'regular@example.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/auth/register')
                .send(userData);

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });

            authToken = loginResponse.body.token;

            // Create an admin user and get token
            const adminData = {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/auth/register')
                .send(adminData);

            // Manually update the user to admin role (in a real app, this would be done through admin panel)
            await mongoose.connection.collection('users').updateOne(
                { email: 'admin@example.com' },
                { $set: { role: 'admin' } }
            );

            const adminLoginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: adminData.email,
                    password: adminData.password
                });

            adminToken = adminLoginResponse.body.token;
        });

        test('should get medicines', async () => {
            const response = await request(app)
                .get('/api/medicine')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Medicines retrieved successfully');
            expect(response.body.data).toHaveProperty('medicines');
            expect(response.body.data).toHaveProperty('pagination');
        });

        test('should search medicines', async () => {
            const response = await request(app)
                .get('/api/medicine/search/paracetamol')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Medicines found successfully');
            expect(response.body.data).toHaveProperty('medicines');
        });

        test('should require admin token to create medicine', async () => {
            const medicineData = {
                name: 'Test Medicine',
                dosageForm: 'tablet',
                strength: '500mg',
                description: 'Test medicine description',
                uses: ['pain relief'],
                sideEffects: ['nausea']
            };

            // Try with regular user token (should fail)
            await request(app)
                .post('/api/medicine')
                .set('Authorization', `Bearer ${authToken}`)
                .send(medicineData)
                .expect(403);

            // Try with admin token (should succeed)
            const response = await request(app)
                .post('/api/medicine')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(medicineData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Medicine created successfully');
            expect(response.body.data.medicine).toHaveProperty('name');
            expect(response.body.data.medicine.name).toBe(medicineData.name);
        });
    });

    describe('OCR Routes', () => {
        let userToken;

        beforeAll(async () => {
            // Create a user and get token
            const userData = {
                firstName: 'OCR',
                lastName: 'User',
                email: 'ocr@example.com',
                password: 'password123'
            };

            await request(app)
                .post('/api/auth/register')
                .send(userData);

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: userData.email,
                    password: userData.password
                });

            userToken = loginResponse.body.token;
        });

        test('should return user OCR history', async () => {
            const response = await request(app)
                .get('/api/ocr/history')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('OCR history retrieved successfully');
            expect(response.body.data).toHaveProperty('ocrResults');
            expect(response.body.data).toHaveProperty('pagination');
        });

        test('should return OCR statistics', async () => {
            const response = await request(app)
                .get('/api/ocr/stats')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('OCR statistics retrieved successfully');
            expect(response.body.data).toHaveProperty('stats');
            expect(response.body.data.stats).toHaveProperty('totalScans');
        });
    });

    describe('Error Handling', () => {
        test('should return 404 for non-existent route', async () => {
            const response = await request(app)
                .get('/nonexistent')
                .expect(404);

            expect(response.body.error).toBe('Route not found');
        });

        test('should handle validation errors', async () => {
            const invalidUserData = {
                firstName: '', // Invalid - empty
                lastName: 'User',
                email: 'invalid-email', // Invalid email format
                password: '123' // Too short
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidUserData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation error');
            expect(response.body).toHaveProperty('errors');
            expect(Array.isArray(response.body.errors)).toBe(true);
        });
    });

    describe('Rate Limiting', () => {
        test('should limit requests', async () => {
            // Make multiple requests to test rate limiting
            for (let i = 0; i < 101; i++) {
                await request(app).get('/health');
            }

            // The 102nd request should be limited
            const response = await request(app)
                .get('/health')
                .expect(429); // Too Many Requests

            expect(response.status).toBe(429);
        });
    });
});

// Additional utility functions for testing
const createTestUser = async (userData) => {
    const response = await request(app)
        .post('/api/auth/register')
        .send({
            firstName: 'Test',
            lastName: 'User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            ...userData
        });

    return response.body.token;
};

const createTestMedicine = async (medicineData, token) => {
    const response = await request(app)
        .post('/api/medicine')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: 'Test Medicine',
            dosageForm: 'tablet',
            strength: '500mg',
            ...medicineData
        });

    return response.body.data.medicine;
};