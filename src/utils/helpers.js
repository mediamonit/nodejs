const axios = require('axios');
const mime = require('mime-types');

// Helper function to get file extension
function getFileExtension(url) {
    return url.split('.').pop().toLowerCase();
}

// Helper function to detect mime type
async function detectMimeType(url) {
    try {
        const response = await axios.head(url, { timeout: process.env.REQUEST_TIMEOUT });
        return response.headers['content-type'] || mime.lookup(url) || null;
    } catch (error) {
        console.error('Error detecting mime type:', error);
        return mime.lookup(url) || null;
    }
}

// Check if URL is accessible
async function isUrlAccessible(url) {
    try {
        const response = await axios.head(url, { timeout: process.env.REQUEST_TIMEOUT });
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

module.exports = {
    getFileExtension,
    detectMimeType,
    isUrlAccessible
};
