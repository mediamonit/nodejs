require('dotenv').config();
const axios = require('axios');

const API_URL = `http://localhost:${process.env.API_PORT || 3000}`;
const FRONTEND_URL = `http://localhost:${process.env.FRONTEND_PORT || 8080}`;
const TEST_TIMEOUT = parseInt(process.env.TEST_TIMEOUT || 5000);

describe('End-to-End Tests', () => {
    // Increase timeout for all tests
    jest.setTimeout(TEST_TIMEOUT);

    // Test API health
    test('API server should be running', async () => {
        try {
            const response = await axios.get(`${API_URL}/health`);
            expect(response.status).toBe(200);
        } catch (error) {
            throw new Error('API server is not running');
        }
    });

    // Test Frontend server
    test('Frontend server should be running', async () => {
        try {
            const response = await axios.get(FRONTEND_URL);
            expect(response.status).toBe(200);
        } catch (error) {
            throw new Error('Frontend server is not running');
        }
    });

    // Test media endpoints
    test('Media endpoints should be accessible', async () => {
        try {
            const response = await axios.get(`${API_URL}/api/media/status`);
            expect(response.status).toBe(200);
            expect(response.data).toBeDefined();
        } catch (error) {
            throw new Error('Media endpoints are not accessible');
        }
    });

    // Test error handling
    test('Error handling should work correctly', async () => {
        try {
            await axios.get(`${API_URL}/api/nonexistent`);
        } catch (error) {
            expect(error.response.status).toBe(404);
        }
    });

    // Test media monitoring functionality
    test('Media monitoring should work', async () => {
        try {
            const response = await axios.post(`${API_URL}/api/media/monitor`, {
                url: process.env.TEST_STREAM_URL || 'test://stream'
            });
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('status');
        } catch (error) {
            throw new Error('Media monitoring is not working');
        }
    });

    // Test environment variables are properly set
    test('Environment variables should be properly configured', () => {
        expect(process.env.API_PORT).toBeDefined();
        expect(process.env.FRONTEND_PORT).toBeDefined();
        expect(process.env.NODE_ENV).toBeDefined();
        expect(process.env.FFMPEG_PATH).toBeDefined();
        expect(process.env.FFPROBE_PATH).toBeDefined();
        expect(process.env.THUMBNAILS_DIR).toBeDefined();
        expect(process.env.PREVIEWS_DIR).toBeDefined();
    });
});
