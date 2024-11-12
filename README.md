# MediaMonit

Real-time media stream monitoring and thumbnail generation solution.

![mediamonit-logo.svg](mediamonit-logo.svg)

## Overview

MediaMonit is a professional media monitoring solution that provides real-time status checks, thumbnail generation, and comprehensive logging for various media streams. It supports multiple protocols including RTSP, RTMP, HLS, DASH, and MP4.

## Features

### Core Functionality
- Real-time stream status monitoring
- Automatic thumbnail and preview generation
- Comprehensive request logging system
- Multi-protocol support
- Status history and analytics
- Configurable check intervals
- RESTful API

### Media Support
- RTSP (Real Time Streaming Protocol)
- RTMP (Real Time Messaging Protocol)
- HLS (HTTP Live Streaming)
- DASH (Dynamic Adaptive Streaming over HTTP)
- MP4 (Static video files)
- Images (JPG, PNG, GIF)
- Text files and HTML content

### Advanced Features
- Detailed request logging with metadata
- Preview generation for media files
- Preview caching system
- Text file content preview
- HTML content preview
- Custom error messages
- Webhook notifications
- Docker support
- Scalable architecture

## Project Structure

```
media-monitor/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── services/
│   │   │   ├── mediaService.js
│   │   │   └── thumbnailService.js
│   │   └── utils/
│   │       ├── ffmpeg.js
│   │       └── logger.js
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── media-monitor.js
│   │   ├── media-monitor.css
│   │   └── index.html
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
├── logs/
│   └── requests.log
├── previews/
├── thumbnails/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── CHANGELOG.md
└── TODO.md
```

## Requirements
- Docker
- Docker Compose
- Git (optional)
- FFmpeg

## Quick Start

### Using Docker Compose

```bash
# Clone the repository
git clone https://github.com/mediamonit/mediamonit.git

# Navigate to project directory
cd mediamonit

# Start the services
docker-compose up -d
```

### Manual Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start the application
npm start
```

## Configuration

### Environment Variables

```env
FRONTEND_PORT=8080
BACKEND_PORT=3000
FFMPEG_PATH=/usr/bin/ffmpeg
NODE_ENV=production
```

### Monitoring Configuration

```javascript
const monitor = new MediaMonitor({
    interval: 100,      // Status check interval (ms)
    thumbnail: {
        interval: 1000, // Thumbnail update interval (ms)
        width: 160,     // Thumbnail width
        height: 90      // Thumbnail height
    },
    logging: {
        enabled: true,  // Enable request logging
        path: './logs/requests.log'  // Log file path
    }
});
```

## API Reference

### Check Stream Status

```http
POST /api/check-status
Content-Type: application/json

{
    "url": "rtsp://example.com/stream",
    "type": "rtsp"
}
```

Response includes:
- Stream status (active/error)
- Media metadata
- Preview URL (if available)
- Error details (if any)

### Generate Thumbnail

```http
POST /api/generate-thumbnail
Content-Type: application/json

{
    "url": "rtmp://example.com/stream",
    "type": "rtmp"
}
```

Response includes:
- Thumbnail URL
- Generation status
- Error details (if any)

## Development

### Prerequisites
- Node.js 18+
- FFmpeg
- Docker (optional)

### Development Setup

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev
```

### Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration
```

## Production Deployment

### Docker Deployment

```bash
# Build containers
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Manual Deployment

1. Configure environment variables
2. Install FFmpeg
3. Set up reverse proxy
4. Configure SSL
5. Start application

## Logging System

The application includes a comprehensive logging system that tracks:
- All incoming requests
- Request metadata (method, URL, IP, headers)
- Response times and status codes
- Media processing operations
- Error details

Logs are stored in JSON format in the `logs/requests.log` file.

## Support

- Documentation: [docs.mediamonit.com](https://docs.mediamonit.com)
- Issues: [GitHub Issues](https://github.com/mediamonit/issues)
- Email: support@mediamonit.com

## License

MediaMonit is released under the Apache 2 License. See the LICENSE file for details.
