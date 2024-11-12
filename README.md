# MediaMonit

Real-time media stream monitoring and thumbnail generation solution.

![mediamonit-logo.svg](mediamonit-logo.svg)

# Media Monitor - Struktura projektu

```
media-monitor/
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── services/
│   │   │   ├── mediaService.js
│   │   │   └── thumbnailService.js
│   │   └── utils/
│   │       └── ffmpeg.js
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
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── init.sh

```

## Wymagania
- Docker
- Docker Compose
- Git (opcjonalnie)

## Szybki start
1. Sklonuj repozytorium
2. Uruchom `./init.sh`
3. Otwórz `http://localhost:8080` w przeglądarce

## Porty
- Frontend: 8080
- Backend: 3000
- NGINX: 80 (wewnętrzny)

## Zmienne środowiskowe
- `BACKEND_PORT`: Port backendu (domyślnie 3000)
- `FRONTEND_PORT`: Port frontendu (domyślnie 8080)
- `FFMPEG_PATH`: Ścieżka do FFmpeg (domyślnie /usr/bin/ffmpeg)

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




# generate.py

skrypt w Pythonie, który przeanalizuje strukturę z Markdown i utworzy odpowiednie pliki i katalogi.

1. Parsuje strukturę katalogów z bloku kodu Markdown
2. Wyodrębnia zawartość plików z bloków kodu z komentarzami
3. Tworzy odpowiednie katalogi i pliki w podanej lokalizacji

Aby użyć skryptu:

1. Zapisz powyższy kod jako `generate_structure.py`
2. Zapisz strukturę projektu w pliku Markdown (np. `structure.md`)
3. Uruchom skrypt:

```bash
python generate.py doc.md --output ./test
```

Skrypt:
- Utworzy wszystkie katalogi z struktury
- Utworzy pliki na podstawie bloków kodu z komentarzami
- Zachowa odpowiednie uprawnienia dla plików wykonywalnych
- Obsługuje kodowanie UTF-8

Czy chciałbyś, żebym dodał jakieś dodatkowe funkcje do skryptu? Na przykład:
- Walidację struktury przed utworzeniem
- Kopię zapasową istniejących plików
- Interaktywne potwierdzenie nadpisywania
- Raport z utworzonych plików
