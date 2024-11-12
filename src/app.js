const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const loggingMiddleware = require('./middleware/logging');
const mediaRoutes = require('./routes/mediaRoutes');
const errorRoutes = require('./routes/errorRoutes');
const { logAppInfo, logError } = require('./utils/logger');

// Create Express app
const app = express();

// Configure FFmpeg paths from environment variables
ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);

// Create required directories
const thumbnailsDir = path.join(__dirname, '..', process.env.THUMBNAILS_DIR);
const previewsDir = path.join(__dirname, '..', process.env.PREVIEWS_DIR);
fs.mkdirSync(thumbnailsDir, { recursive: true });
fs.mkdirSync(previewsDir, { recursive: true });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/thumbnails', express.static(process.env.THUMBNAILS_DIR));
app.use('/previews', express.static(process.env.PREVIEWS_DIR));
app.use(loggingMiddleware);

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api', mediaRoutes);
app.use('/api/errors', errorRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    logError(err, { 
        url: req.url, 
        method: req.method, 
        body: req.body 
    });
    res.status(500).json({
        status: 'error',
        message: err.message
    });
});

module.exports = app;
