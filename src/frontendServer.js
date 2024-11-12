require('dotenv').config();
const express = require('express');
const path = require('path');
const { logAppInfo } = require('./utils/logger');

const app = express();
const port = process.env.FRONTEND_PORT || 8080;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Enable CORS for API server
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_API_URL || 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Start server
app.listen(port, () => {
    logAppInfo('Frontend server started', {
        port,
        nodeEnv: process.env.NODE_ENV,
        publicPath: path.join(__dirname, '..', 'public'),
        apiUrl: process.env.FRONTEND_API_URL,
        timestamp: new Date().toISOString()
    });
    console.log(`Frontend server running on http://localhost:${port}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
});

// Handle shutdown signals
process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT signal');
    process.exit(0);
});
