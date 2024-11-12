try {
    require('dotenv').config();
    const { setupEnvironment } = require('./config/envSetup');
    const { logAppInfo, logError } = require('./utils/logger');

    // First set up environment variables
    if (!setupEnvironment()) {
        logError(new Error('Failed to set up environment variables'), { context: 'Startup' });
        process.exit(1);
    }

    const app = require('./app');
    const MEDIA_TYPES = require('./config/mediaTypes');

    // Validate media types configuration
    function validateMediaTypes() {
        const requiredCategories = ['video', 'stream', 'image', 'text', 'html', 'document'];
        const requiredProperties = ['mime', 'category'];
        const errors = [];

        // Check if all media types have required properties
        Object.entries(MEDIA_TYPES).forEach(([extension, config]) => {
            requiredProperties.forEach(prop => {
                if (!config[prop]) {
                    errors.push(`Media type '${extension}' is missing required property '${prop}'`);
                }
            });

            // Check if category is valid
            if (!requiredCategories.includes(config.category)) {
                errors.push(`Media type '${extension}' has invalid category '${config.category}'`);
            }
        });

        return errors;
    }

    // Validate media types configuration
    const mediaTypeErrors = validateMediaTypes();
    if (mediaTypeErrors.length > 0) {
        mediaTypeErrors.forEach(error => {
            logError(new Error(error), { context: 'Media Types Validation' });
        });
        throw new Error('Invalid media types configuration');
    }

    // Log supported media types
    logAppInfo('Supported media types', {
        extensions: Object.keys(MEDIA_TYPES),
        categories: [...new Set(Object.values(MEDIA_TYPES).map(type => type.category))]
    });

    // Start server
    const port = process.env.API_PORT || 3000;
    app.listen(port, () => {
        logAppInfo('Server started', {
            port,
            nodeEnv: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            ffmpegPath: process.env.FFMPEG_PATH,
            ffprobePath: process.env.FFPROBE_PATH,
            thumbnailsDir: process.env.THUMBNAILS_DIR,
            previewsDir: process.env.PREVIEWS_DIR
        });
        
        console.log(`API server running on http://localhost:${port}`);
    });

    // Log successful startup
    logAppInfo('Application startup complete', {
        timestamp: new Date().toISOString(),
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version
    });

} catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
}

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
