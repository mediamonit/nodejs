const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { isUrlAccessible } = require('../utils/helpers');
const { logMediaOperation, logError, logDebug } = require('../utils/logger');

class MediaService {
    // Generate preview for media files
    static async generatePreview(url, type) {
        logDebug('Starting preview generation', { url, type });
        const previewName = `${Buffer.from(url).toString('base64')}_preview.jpg`;
        const previewPath = path.join(process.env.PREVIEWS_DIR, previewName);

        try {
            // Check if preview already exists
            if (fs.existsSync(previewPath)) {
                logMediaOperation('PREVIEW_CHECK', url, 'EXISTS', { path: previewPath });
                return `/previews/${previewName}`;
            }

            // Check if URL is accessible
            if (!(await isUrlAccessible(url))) {
                logMediaOperation('URL_CHECK', url, 'INACCESSIBLE');
                return null;
            }

            const result = await new Promise((resolve, reject) => {
                ffmpeg(url)
                    .screenshots({
                        timestamps: ['00:00:01'],
                        filename: previewName,
                        folder: process.env.PREVIEWS_DIR,
                        size: '320x240'
                    })
                    .on('end', () => {
                        logMediaOperation('PREVIEW_GENERATION', url, 'SUCCESS', { path: previewPath });
                        resolve(`/previews/${previewName}`);
                    })
                    .on('error', (err) => {
                        logError(err, { context: 'Preview generation', url });
                        resolve(null);
                    });
            });

            return result;
        } catch (error) {
            logError(error, { context: 'Preview generation', url });
            return null;
        }
    }

    // Check stream status
    static async checkStreamStatus(url, type) {
        logDebug('Checking stream status', { url, type });
        
        return new Promise((resolve) => {
            ffmpeg.ffprobe(url, (err, metadata) => {
                if (err) {
                    logMediaOperation('STREAM_CHECK', url, 'ERROR', { error: err.message });
                    resolve({ status: 'error', message: 'Stream niedostępny' });
                } else {
                    const result = {
                        status: 'active',
                        message: 'Stream aktywny',
                        metadata: {
                            duration: metadata.format?.duration,
                            bitrate: metadata.format?.bit_rate,
                            format: metadata.format?.format_name
                        }
                    };
                    logMediaOperation('STREAM_CHECK', url, 'SUCCESS', result);
                    resolve(result);
                }
            });
        });
    }

    // Check file status
    static async checkFileStatus(url, type) {
        logDebug('Checking file status', { url, type });
        
        try {
            const response = await axios.head(url, { timeout: process.env.REQUEST_TIMEOUT });
            const result = {
                status: 'active',
                message: 'Plik dostępny',
                metadata: {
                    type: response.headers['content-type'],
                    size: response.headers['content-length'],
                    lastModified: response.headers['last-modified']
                }
            };
            logMediaOperation('FILE_CHECK', url, 'SUCCESS', result);
            return result;
        } catch (error) {
            logMediaOperation('FILE_CHECK', url, 'ERROR', { error: error.message });
            return { status: 'error', message: 'Plik niedostępny' };
        }
    }

    // Generate thumbnail
    static async generateThumbnail(url, type, thumbnailName, thumbnailPath) {
        logDebug('Starting thumbnail generation', { url, type, thumbnailName });
        
        return new Promise((resolve, reject) => {
            ffmpeg(url)
                .screenshots({
                    timestamps: ['00:00:01'],
                    filename: thumbnailName,
                    folder: process.env.THUMBNAILS_DIR,
                    size: '320x240'
                })
                .on('end', () => {
                    logMediaOperation('THUMBNAIL_GENERATION', url, 'SUCCESS', { path: thumbnailPath });
                    resolve();
                })
                .on('error', (err) => {
                    logError(err, { context: 'Thumbnail generation', url });
                    reject(err);
                });
        });
    }

    // Generate image thumbnail
    static async generateImageThumbnail(url, thumbnailPath) {
        logDebug('Starting image thumbnail generation', { url });
        
        return new Promise((resolve, reject) => {
            ffmpeg(url)
                .output(thumbnailPath)
                .size('320x240')
                .on('end', () => {
                    logMediaOperation('IMAGE_THUMBNAIL_GENERATION', url, 'SUCCESS', { path: thumbnailPath });
                    resolve();
                })
                .on('error', (err) => {
                    logError(err, { context: 'Image thumbnail generation', url });
                    reject(err);
                })
                .run();
        });
    }
}

module.exports = MediaService;
