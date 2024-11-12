# MediaMonit

Real-time media stream monitoring solution with automated status checks and thumbnail generation.

## Features

- Real-time status monitoring for RTSP, RTMP, HLS, DASH, and MP4 streams
- Automated thumbnail generation
- Status history and analytics
- Custom error notifications
- API integration
- Docker deployment support

## Quick Start

### Docker Installation
```bash
# Pull and run MediaMonit
docker pull mediamonit/monitor
docker run -p 8080:80 -p 3000:3000 mediamonit/monitor
```

### Manual Installation
```bash
# Clone repository
git clone https://github.com/mediamonit/mediamonit.git

# Install dependencies
cd mediamonit
npm install

# Configure environment
cp .env.example .env

# Start application
npm start
```

## Configuration

### Environment Variables
```env
PORT=3000
NODE_ENV=production
FFMPEG_PATH=/usr/bin/ffmpeg
CHECK_INTERVAL=100
THUMBNAIL_INTERVAL=1000
```

### Basic Usage
```javascript
const monitor = new MediaMonitor({
    interval: 100,
    thumbnail: {
        enabled: true,
        interval: 1000
    }
});

// Start monitoring
monitor.add({
    url: 'rtsp://example.com/stream',
    type: 'rtsp'
});
```

## API Reference

### Status Check
```http
POST /api/check-status
Content-Type: application/json

{
    "url": "rtsp://example.com/stream",
    "type": "rtsp"
}
```

### Thumbnail Generation
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

### Local Development
```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Run tests
npm test
```

## Deployment

### Docker Compose
```yaml
version: '3.8'
services:
  mediamonit:
    build: .
    ports:
      - "8080:80"
      - "3000:3000"
    volumes:
      - thumbnails:/app/thumbnails
    environment:
      - NODE_ENV=production
```

### Production Considerations
1. Configure proper SSL/TLS
2. Set up monitoring and alerts
3. Configure backup strategy
4. Plan for scaling
5. Implement security measures

## Support

- Documentation: docs.mediamonit.com
- Issues: github.com/mediamonit/issues
- Email: support@mediamonit.com

## License

MediaMonit is open-source software licensed under the Apache 2 license.
