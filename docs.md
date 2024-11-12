Przygotuję prosty backend w Node.js z Express, który będzie obsługiwał sprawdzanie statusu strumieni i generowanie miniatur.



```javascript
// server.js
const express = require('express');
const cors = require('cors');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/thumbnails', express.static('thumbnails'));

// Konfiguracja FFmpeg
ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');  // Ustaw odpowiednią ścieżkę
ffmpeg.setFfprobePath('/usr/bin/ffprobe'); // Ustaw odpowiednią ścieżkę

// Upewnij się, że katalog na miniatury istnieje
const thumbnailsDir = path.join(__dirname, 'thumbnails');
if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir);
}

// Pomocnicza funkcja do sprawdzania RTSP/RTMP
async function checkStreamingUrl(url) {
    return new Promise((resolve) => {
        const ffprobe = spawn('ffprobe', [
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_streams',
            url
        ]);

        let output = '';
        let error = '';

        ffprobe.stdout.on('data', (data) => {
            output += data;
        });

        ffprobe.stderr.on('data', (data) => {
            error += data;
        });

        ffprobe.on('close', (code) => {
            if (code === 0) {
                resolve({
                    status: 'active',
                    message: 'Stream aktywny'
                });
            } else {
                resolve({
                    status: 'error',
                    message: 'Stream niedostępny'
                });
            }
        });

        // Timeout po 5 sekundach
        setTimeout(() => {
            ffprobe.kill();
            resolve({
                status: 'error',
                message: 'Timeout podczas sprawdzania streamu'
            });
        }, 5000);
    });
}

// Endpoint do sprawdzania statusu mediów
app.post('/check-status', async (req, res) => {
    try {
        const { url, type } = req.body;
        let result;

        switch (type) {
            case 'rtsp':
            case 'rtmp':
                result = await checkStreamingUrl(url);
                break;

            case 'hls':
                try {
                    const response = await axios.get(url);
                    result = {
                        status: response.data.includes('#EXTM3U') ? 'active' : 'error',
                        message: response.data.includes('#EXTM3U') ? 
                            'Stream HLS aktywny' : 'Nieprawidłowy format HLS'
                    };
                } catch (error) {
                    result = {
                        status: 'error',
                        message: 'Błąd dostępu do streamu HLS'
                    };
                }
                break;

            case 'dash':
                try {
                    const response = await axios.get(url);
                    result = {
                        status: response.data.includes('MPD') ? 'active' : 'error',
                        message: response.data.includes('MPD') ? 
                            'Stream DASH aktywny' : 'Nieprawidłowy format DASH'
                    };
                } catch (error) {
                    result = {
                        status: 'error',
                        message: 'Błąd dostępu do streamu DASH'
                    };
                }
                break;

            case 'mp4':
                try {
                    const response = await axios.head(url);
                    const contentType = response.headers['content-type'];
                    result = {
                        status: contentType?.includes('video') ? 'active' : 'error',
                        message: contentType?.includes('video') ? 
                            'Plik MP4 dostępny' : 'Nieprawidłowy format pliku'
                    };
                } catch (error) {
                    result = {
                        status: 'error',
                        message: 'Błąd dostępu do pliku MP4'
                    };
                }
                break;

            case 'text':
                try {
                    const response = await axios.get(url);
                    result = {
                        status: 'active',
                        message: 'Plik tekstowy dostępny',
                        preview: response.data.slice(0, 100)
                    };
                } catch (error) {
                    result = {
                        status: 'error',
                        message: 'Błąd dostępu do pliku tekstowego'
                    };
                }
                break;

            case 'html':
                try {
                    const response = await axios.get(url);
                    const textContent = response.data
                        .replace(/<[^>]*>/g, '')
                        .trim()
                        .slice(0, 100);
                    result = {
                        status: 'active',
                        message: 'Plik HTML dostępny',
                        preview: textContent
                    };
                } catch (error) {
                    result = {
                        status: 'error',
                        message: 'Błąd dostępu do pliku HTML'
                    };
                }
                break;

            default:
                result = {
                    status: 'error',
                    message: 'Nieobsługiwany typ medium'
                };
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Błąd serwera podczas sprawdzania statusu'
        });
    }
});

// Endpoint do generowania miniatur
app.post('/generate-thumbnail', async (req, res) => {
    try {
        const { url, type } = req.body;
        const thumbnailName = `${Buffer.from(url).toString('base64')}.jpg`;
        const thumbnailPath = path.join(thumbnailsDir, thumbnailName);

        // Funkcja do generowania miniatury za pomocą FFmpeg
        const generateThumbnail = () => {
            return new Promise((resolve, reject) => {
                ffmpeg(url)
                    .screenshots({
                        timestamps: ['00:00:01'],
                        filename: thumbnailName,
                        folder: thumbnailsDir,
                        size: '160x90'
                    })
                    .on('end', () => resolve(`/thumbnails/${thumbnailName}`))
                    .on('error', reject);
            });
        };

        let thumbnailUrl;

        switch (type) {
            case 'rtsp':
            case 'rtmp':
            case 'hls':
            case 'dash':
            case 'mp4':
                thumbnailUrl = await generateThumbnail();
                break;

            default:
                throw new Error('Nieobsługiwany typ medium dla miniatur');
        }

        res.json({ thumbnailUrl });
    } catch (error) {
        res.status(500).json({
            error: 'Błąd podczas generowania miniatury'
        });
    }
});

// Start serwera
app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`);
});

```

```json
{
  "name": "media-monitor-backend",
  "version": "1.0.0",
  "description": "Backend dla monitora mediów",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "cors": "^2.8.5",
    "axios": "^0.21.1",
    "fluent-ffmpeg": "^2.1.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.7"
  }
}

```

Teraz zaktualizujmy frontend, aby korzystał z nowego backendu:

```javascript
// media-monitor.js
class MediaLinkMonitor {
    constructor(options = {}) {
        this.checkInterval = options.interval || 100;
        this.thumbnailInterval = 1000;
        this.activeChecks = new Map();
        this.activeThumbnails = new Map();
        this.backendUrl = options.backendUrl || 'http://localhost:3000';
        this.init();
    }

    async checkMediaStatus(url, type) {
        try {
            const response = await fetch(`${this.backendUrl}/check-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url, type })
            });

            if (!response.ok) {
                throw new Error('Błąd odpowiedzi serwera');
            }

            return await response.json();
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async generateThumbnail(url, type) {
        try {
            const response = await fetch(`${this.backendUrl}/generate-thumbnail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url, type })
            });

            if (!response.ok) {
                throw new Error('Błąd generowania miniatury');
            }

            const { thumbnailUrl } = await response.json();
            return `${this.backendUrl}${thumbnailUrl}`;
        } catch (error) {
            console.error('Błąd generowania miniatury:', error);
            return null;
        }
    }

    // Reszta metod pozostaje bez zmian...
}

```

Backend oferuje następujące funkcjonalności:

1. Sprawdzanie statusu mediów:
   - Endpoint `/check-status` dla wszystkich typów mediów
   - Używa FFprobe do sprawdzania RTSP/RTMP
   - Sprawdza manifesty dla HLS i DASH
   - Weryfikuje nagłówki dla MP4
   - Pobiera i przetwarza zawartość plików tekstowych i HTML

2. Generowanie miniatur:
   - Endpoint `/generate-thumbnail` dla plików wideo
   - Używa FFmpeg do generowania miniatur
   - Zapisuje miniatury w katalogu `thumbnails`
   - Obsługuje wszystkie formaty wideo (RTSP, RTMP, HLS, DASH, MP4)

3. Zabezpieczenia:
   - Obsługa błędów dla wszystkich operacji
   - Timeout dla sprawdzania strumieni
   - CORS dla bezpiecznej komunikacji z frontendem

Aby uruchomić backend:

1. Zainstaluj zależności:
```bash
npm install
```

2. Upewnij się, że masz zainstalowane FFmpeg:
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS z Homebrew
brew install ffmpeg
```

3. Uruchom serwer:
```bash
npm start
```

4. Zaktualizuj frontend, dodając adres backendu:
```javascript
const monitor = new MediaLinkMonitor({
    interval: 100,
    backendUrl: 'http://localhost:3000'
});
```

Uwagi:
1. Backend wymaga zainstalowanego FFmpeg
2. Ścieżki do FFmpeg mogą wymagać dostosowania w zależności od systemu
3. W produkcji należy dodać dodatkowe zabezpieczenia (rate limiting, autoryzacja)
4. Miniatury są przechowywane na dysku - w produkcji warto rozważyć CDN
5. Timeouty i interwały można dostosować do potrzeb

