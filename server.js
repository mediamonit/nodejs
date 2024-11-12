const express = require('express');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const mime = require('mime-types');
const { logRequest } = require('./src/utils/logger');
const stat = promisify(fs.stat);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/thumbnails', express.static('thumbnails'));

// Logging middleware
app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logRequest(req, res, {
            responseTime: duration,
            statusCode: res.statusCode
        });
    });
    next();
});

// Konfiguracja FFmpeg
ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');  // Ustaw odpowiednią ścieżkę
ffmpeg.setFfprobePath('/usr/bin/ffprobe'); // Ustaw odpowiednią ścieżkę

// Create thumbnails directory if it doesn't exist
const thumbnailsDir = path.join(__dirname, 'thumbnails');
fs.mkdirSync(thumbnailsDir, { recursive: true });

// File type configurations
const MEDIA_TYPES = {
    // Video formats
    'mp4': { mime: 'video/mp4', category: 'video' },
    'webm': { mime: 'video/webm', category: 'video' },
    'avi': { mime: 'video/x-msvideo', category: 'video' },
    'mov': { mime: 'video/quicktime', category: 'video' },
    'mkv': { mime: 'video/x-matroska', category: 'video' },

    // Streaming formats
    'rtsp': { mime: 'application/rtsp', category: 'stream' },
    'rtmp': { mime: 'application/rtmp', category: 'stream' },
    'hls': { mime: 'application/vnd.apple.mpegurl', category: 'stream' },
    'm3u8': { mime: 'application/vnd.apple.mpegurl', category: 'stream' },
    'dash': { mime: 'application/dash+xml', category: 'stream' },
    'mpd': { mime: 'application/dash+xml', category: 'stream' },

    // Image formats
    'jpg': { mime: 'image/jpeg', category: 'image' },
    'jpeg': { mime: 'image/jpeg', category: 'image' },
    'png': { mime: 'image/png', category: 'image' },
    'gif': { mime: 'image/gif', category: 'image' },
    'webp': { mime: 'image/webp', category: 'image' },
    'svg': { mime: 'image/svg+xml', category: 'image' },

    // Document formats
    'txt': { mime: 'text/plain', category: 'text' },
    'md': { mime: 'text/markdown', category: 'text' },
    'html': { mime: 'text/html', category: 'html' },
    'htm': { mime: 'text/html', category: 'html' },
    'pdf': { mime: 'application/pdf', category: 'document' },
    'doc': { mime: 'application/msword', category: 'document' },
    'docx': { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'document' }
};

// Helper function to get file extension
function getFileExtension(url) {
    return url.split('.').pop().toLowerCase();
}

// Helper function to detect mime type
async function detectMimeType(url) {
    try {
        const response = await axios.head(url, { timeout: 5000 });
        return response.headers['content-type'] || mime.lookup(url) || null;
    } catch (error) {
        console.error('Error detecting mime type:', error);
        return mime.lookup(url) || null;
    }
}

// Check stream status
async function checkStreamStatus(url, type) {
    return new Promise((resolve) => {
        ffmpeg.ffprobe(url, (err, metadata) => {
            if (err) {
                resolve({ status: 'error', message: 'Stream niedostępny' });
            } else {
                resolve({
                    status: 'active',
                    message: 'Stream aktywny',
                    metadata: {
                        duration: metadata.format?.duration,
                        bitrate: metadata.format?.bit_rate,
                        format: metadata.format?.format_name
                    }
                });
            }
        });
    });
}

// Check file status
async function checkFileStatus(url, type) {
    try {
        const response = await axios.head(url, { timeout: 5000 });
        const contentType = response.headers['content-type'];
        const contentLength = response.headers['content-length'];

        return {
            status: 'active',
            message: 'Plik dostępny',
            metadata: {
                type: contentType,
                size: contentLength,
                lastModified: response.headers['last-modified']
            }
        };
    } catch (error) {
        return { status: 'error', message: 'Plik niedostępny' };
    }
}

// Status check endpoint
app.post('/check-status', async (req, res) => {
    try {
        const { url, type } = req.body;
        const extension = getFileExtension(url);
        const mediaType = MEDIA_TYPES[extension] || MEDIA_TYPES[type];

        if (!mediaType) {
            const mimeType = await detectMimeType(url);
            if (!mimeType) {
                logRequest(req, res, { error: 'Nieobsługiwany typ pliku' });
                return res.status(400).json({
                    status: 'error',
                    message: 'Nieobsługiwany typ pliku'
                });
            }
        }

        let result;
        const category = mediaType?.category || 'unknown';

        switch (category) {
            case 'stream':
                result = await checkStreamStatus(url, type);
                break;

            case 'video':
                result = await checkFileStatus(url, type);
                if (result.status === 'active') {
                    const streamCheck = await checkStreamStatus(url, type);
                    result.metadata = { ...result.metadata, ...streamCheck.metadata };
                }
                break;

            case 'image':
                result = await checkFileStatus(url, type);
                if (result.status === 'active') {
                    const mimeType = await detectMimeType(url);
                    result.metadata = {
                        ...result.metadata,
                        mimeType,
                        isAnimated: extension === 'gif'
                    };
                }
                break;

            case 'text':
            case 'html':
                result = await checkFileStatus(url, type);
                if (result.status === 'active') {
                    try {
                        const textResponse = await axios.get(url, {
                            timeout: 5000,
                            maxContentLength: 1024 * 1024 // 1MB limit
                        });
                        result.preview = textResponse.data.slice(0, 200);
                    } catch (error) {
                        result.preview = 'Error loading content';
                    }
                }
                break;

            case 'document':
                result = await checkFileStatus(url, type);
                break;

            default:
                result = await checkFileStatus(url, type);
                result.message = 'Plik dostępny (typ nieznany)';
        }

        logRequest(req, res, { result });
        res.json(result);
    } catch (error) {
        logRequest(req, res, { error: error.message });
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Generate thumbnail endpoint
app.post('/generate-thumbnail', async (req, res) => {
    try {
        const { url, type } = req.body;
        const extension = getFileExtension(url);
        const mediaType = MEDIA_TYPES[extension] || MEDIA_TYPES[type];
        const thumbnailName = `${Buffer.from(url).toString('base64')}.jpg`;
        const thumbnailPath = path.join(thumbnailsDir, thumbnailName);

        if (!mediaType) {
            logRequest(req, res, { error: 'Nieobsługiwany typ pliku' });
            return res.status(400).json({
                error: 'Nieobsługiwany typ pliku'
            });
        }

        switch (mediaType.category) {
            case 'video':
            case 'stream':
                await new Promise((resolve, reject) => {
                    ffmpeg(url)
                        .screenshots({
                            timestamps: ['00:00:01'],
                            filename: thumbnailName,
                            folder: thumbnailsDir,
                            size: '320x240'
                        })
                        .on('end', resolve)
                        .on('error', reject);
                });
                break;

            case 'image':
                await new Promise((resolve, reject) => {
                    ffmpeg(url)
                        .output(thumbnailPath)
                        .size('320x240')
                        .on('end', resolve)
                        .on('error', reject)
                        .run();
                });
                break;

            default:
                logRequest(req, res, { error: 'Nieobsługiwany typ pliku dla generowania miniatur' });
                return res.status(400).json({
                    error: 'Generowanie miniatur nie jest obsługiwane dla tego typu pliku'
                });
        }

        const result = { thumbnailUrl: `/thumbnails/${thumbnailName}` };
        logRequest(req, res, { result });
        res.json(result);
    } catch (error) {
        logRequest(req, res, { error: error.message });
        res.status(500).json({
            error: 'Błąd podczas generowania miniatury',
            message: error.message
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`MediaMonit server running on port ${port}`);
    console.log(`Supported file types:`, Object.keys(MEDIA_TYPES).join(', '));
});
