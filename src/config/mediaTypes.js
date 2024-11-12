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

module.exports = MEDIA_TYPES;
