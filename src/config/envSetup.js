const fs = require('fs');
const path = require('path');
const { logAppInfo, logError } = require('../utils/logger');

const defaultConfig = {
    PORT: 3000,
    FFMPEG_PATH: '/usr/bin/ffmpeg',
    FFPROBE_PATH: '/usr/bin/ffprobe',
    THUMBNAILS_DIR: 'thumbnails',
    PREVIEWS_DIR: 'previews',
    REQUEST_TIMEOUT: 5000,
    MAX_CONTENT_LENGTH: 1048576,
    NODE_ENV: 'development'
};

function setupEnvironment() {
    try {
        // Check if .env file exists
        const envPath = path.join(__dirname, '../../.env');
        if (!fs.existsSync(envPath)) {
            logAppInfo('No .env file found, creating with default values');
            const envContent = Object.entries(defaultConfig)
                .map(([key, value]) => `${key}=${value}`)
                .join('\n');
            fs.writeFileSync(envPath, envContent);
        }

        // Set any missing environment variables to defaults
        Object.entries(defaultConfig).forEach(([key, value]) => {
            if (!process.env[key]) {
                process.env[key] = value.toString();
                logAppInfo(`Setting default value for ${key}`, { value: key.includes('PATH') ? 'REDACTED' : value });
            }
        });

        // Validate all required variables are set
        const missingVars = Object.keys(defaultConfig).filter(key => !process.env[key]);
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }

        logAppInfo('Environment setup completed', {
            nodeEnv: process.env.NODE_ENV,
            port: process.env.PORT
        });

        return true;
    } catch (error) {
        logError(error, { context: 'Environment Setup' });
        return false;
    }
}

module.exports = { setupEnvironment };
