const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const MediaService = require('../services/mediaService');
const { getFileExtension, detectMimeType, isUrlAccessible } = require('../utils/helpers');
const MEDIA_TYPES = require('../config/mediaTypes');
const { logRequest } = require('../utils/logger');

// Status check endpoint
router.post('/check-status', async (req, res) => {
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
                result = await MediaService.checkStreamStatus(url, type);
                if (result.status === 'active') {
                    const previewUrl = await MediaService.generatePreview(url, type);
                    if (previewUrl) {
                        result.preview = previewUrl;
                    }
                }
                break;

            case 'video':
                result = await MediaService.checkFileStatus(url, type);
                if (result.status === 'active') {
                    const streamCheck = await MediaService.checkStreamStatus(url, type);
                    result.metadata = { ...result.metadata, ...streamCheck.metadata };
                    const previewUrl = await MediaService.generatePreview(url, type);
                    if (previewUrl) {
                        result.preview = previewUrl;
                    }
                }
                break;

            case 'image':
                result = await MediaService.checkFileStatus(url, type);
                if (result.status === 'active') {
                    const mimeType = await detectMimeType(url);
                    result.metadata = {
                        ...result.metadata,
                        mimeType,
                        isAnimated: extension === 'gif'
                    };
                    result.preview = url;
                }
                break;

            case 'text':
            case 'html':
                result = await MediaService.checkFileStatus(url, type);
                if (result.status === 'active') {
                    try {
                        const textResponse = await axios.get(url, {
                            timeout: process.env.REQUEST_TIMEOUT,
                            maxContentLength: process.env.MAX_CONTENT_LENGTH
                        });
                        result.preview = textResponse.data.slice(0, 200);
                    } catch (error) {
                        result.preview = 'Error loading content';
                    }
                }
                break;

            case 'document':
                result = await MediaService.checkFileStatus(url, type);
                break;

            default:
                result = await MediaService.checkFileStatus(url, type);
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
router.post('/generate-thumbnail', async (req, res) => {
    try {
        const { url, type } = req.body;
        const extension = getFileExtension(url);
        const mediaType = MEDIA_TYPES[extension] || MEDIA_TYPES[type];
        const thumbnailName = `${Buffer.from(url).toString('base64')}.jpg`;
        const thumbnailPath = path.join(process.env.THUMBNAILS_DIR, thumbnailName);

        if (!mediaType) {
            logRequest(req, res, { error: 'Nieobsługiwany typ pliku' });
            return res.status(400).json({
                error: 'Nieobsługiwany typ pliku'
            });
        }

        // Check if URL is accessible
        if (!(await isUrlAccessible(url))) {
            logRequest(req, res, { error: 'Plik niedostępny' });
            return res.status(400).json({
                error: 'Plik niedostępny'
            });
        }

        switch (mediaType.category) {
            case 'video':
            case 'stream':
                await MediaService.generateThumbnail(url, type, thumbnailName, thumbnailPath);
                break;

            case 'image':
                await MediaService.generateImageThumbnail(url, thumbnailPath);
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

module.exports = router;
