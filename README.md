# MediaMonit

Real-time media stream monitoring and thumbnail generation solution.

![MediaMonit Logo](logo.svg)

## Overview

MediaMonit is a professional media monitoring solution that provides real-time status checks and thumbnail generation for various media streams. It supports multiple protocols including RTSP, RTMP, HLS, DASH, and MP4.

## Features

### Core Functionality
- Real-time stream status monitoring
- Automatic thumbnail generation
- Multi-protocol support
- Status history and analytics
- Configurable check intervals
- RESTful API

### Supported Protocols
- RTSP (Real Time Streaming Protocol)
- RTMP (Real Time Messaging Protocol)
- HLS (HTTP Live Streaming)
- DASH (Dynamic Adaptive Streaming over HTTP)
- MP4 (Static video files)

### Additional Features
- Text file content preview
- HTML content preview
- Custom error messages
- Webhook notifications
- Docker support
- Scalable architecture

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

### Generate Thumbnail

```http
POST /api/generate-thumbnail
Content-Type: application/json

{
    "url": "rtmp://example.com/stream",
    "type": "rtmp"
}
```

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

## Support

- Documentation: [docs.mediamonit.com](https://docs.mediamonit.com)
- Issues: [GitHub Issues](https://github.com/mediamonit/issues)
- Email: support@mediamonit.com

## License

MediaMonit is released under the Apache 2 License. See the LICENSE file for details.
