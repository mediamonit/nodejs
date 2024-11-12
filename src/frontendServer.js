require('dotenv').config();
const express = require('express');
const path = require('path');
const { logAppInfo } = require('./utils/logger');

const app = express();
const port = 8080;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Enable CORS for API server
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.API_URL || 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Start server
app.listen(port, () => {
    logAppInfo('Frontend server started', {
        port,
        publicPath: path.join(__dirname, '..', 'public'),
        timestamp: new Date().toISOString()
    });
    console.log(`Frontend server running on http://localhost:${port}`);
});
