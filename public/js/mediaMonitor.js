// Show error notification
function showErrorNotification(message, duration = 5000) {
    const notification = document.getElementById('errorNotification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

class MediaMonitor {
    constructor(options = {}) {
        this.options = {
            interval: options.interval || 300,
            gridElement: options.gridElement || document.getElementById('mediaGrid'),
            baseUrl: options.baseUrl || 'http://localhost:3000',
            debug: options.debug || false
        };

        this.mediaCards = new Map();
        this.errorReporter = new ErrorReporter({
            apiEndpoint: '/api/errors',
            automaticReporting: true,
            debug: this.options.debug
        });

        // Definicje typów mediów i ich rozszerzeń
        this.mediaTypes = {
            video: ['mp4', 'webm', 'mov', 'avi'],
            stream: {
                rtsp: ['rtsp://'],
                rtmp: ['rtmp://'],
                hls: ['.m3u8', 'playlist.m3u8'],
                dash: ['.mpd', 'manifest.mpd']
            },
            image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
            text: ['txt', 'md'],
            html: ['html', 'htm']
        };

        this.init();
    }

    detectMediaType(url) {
        // Usuń parametry z URL
        const cleanUrl = url.split('?')[0].toLowerCase();
        const extension = cleanUrl.split('.').pop();

        // Sprawdź protokoły strumieniowania
        if (cleanUrl.startsWith('rtsp://')) return 'rtsp';
        if (cleanUrl.startsWith('rtmp://')) return 'rtmp';

        // Sprawdź specjalne przypadki HLS i DASH
        if (cleanUrl.includes('playlist.m3u8') || cleanUrl.endsWith('.m3u8')) return 'hls';
        if (cleanUrl.includes('manifest.mpd') || cleanUrl.endsWith('.mpd')) return 'dash';

        // Sprawdź rozszerzenia plików
        if (this.mediaTypes.video.includes(extension)) return 'video';
        if (this.mediaTypes.image.includes(extension)) return 'image';
        if (this.mediaTypes.text.includes(extension)) return 'text';
        if (this.mediaTypes.html.includes(extension)) return 'html';

        // Jeśli nie rozpoznano typu, spróbuj zgadnąć na podstawie ścieżki
        if (cleanUrl.includes('/media/')) return 'video';
        if (cleanUrl.includes('/stream')) return 'stream';

        return 'unknown';
    }

    init() {
        const mediaLinks = document.querySelectorAll('.media-links a');
        mediaLinks.forEach(link => {
            const url = link.href;
            const detectedType = this.detectMediaType(url);

            // Ustaw lub zaktualizuj atrybut data-media-type
            link.setAttribute('data-media-type', detectedType);

            // Zaktualizuj tekst linku jeśli tytuł jest niepoprawny
            if (link.textContent.includes('Plik MP4') && detectedType !== 'video') {
                link.textContent = `${this.getTypeName(detectedType)} #${this.getUniqueId()}`;
            }

            this.createMediaCard(link);
        });
        this.startMonitoring();
    }

    getTypeName(type) {
        const typeNames = {
            'rtsp': 'Stream RTSP',
            'rtmp': 'Stream RTMP',
            'hls': 'Stream HLS',
            'dash': 'Stream DASH',
            'video': 'Plik Video',
            'image': 'Obraz',
            'text': 'Plik tekstowy',
            'html': 'Strona HTML',
            'unknown': 'Nieznany typ'
        };
        return typeNames[type] || 'Nieznany typ';
    }

    // Generator unikalnych ID
    getUniqueId() {
        if (!this.lastId) this.lastId = 0;
        return ++this.lastId;
    }

    createMediaCard(link) {
        const card = document.createElement('div');
        card.className = 'media-card';

        const url = link.href;
        const type = link.getAttribute('data-media-type');
        const title = link.textContent.trim();

        card.innerHTML = `
            <div class="media-preview loading" data-url="${url}" data-type="${type}">
                <img src="" alt="${title}" style="opacity: 0">
            </div>
            <div class="media-info">
                <h2 class="media-title">
                    <span class="status-indicator"></span>
                    <a href="${url}" class="media-link" target="_blank">${title}</a>
                </h2>
                <div class="media-status">Sprawdzanie...</div>
                <div class="media-metadata">
                    <dl>
                        <dt>Typ:</dt>
                        <dd>${type.toUpperCase()}</dd>
                        <dt>URL:</dt>
                        <dd>${new URL(url).pathname}</dd>
                    </dl>
                </div>
                <div class="debug-info"></div>
            </div>
        `;

        this.options.gridElement.appendChild(card);
        this.mediaCards.set(url, {
            element: card,
            type: type,
            lastCheck: 0,
            thumbnailRetries: 0
        });
    }

    async checkStatus(url, type) {
        try {
            const response = await fetch(`${this.options.baseUrl}/check-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({url, type})
            });

            if (!response.ok) {
                await this.errorReporter.reportError({
                    statusCode: response.status,
                    url: url,
                    errorMessage: `Failed to check status: ${response.statusText}`,
                    additionalInfo: { type, endpoint: 'check-status' }
                });

                showErrorNotification(`Błąd sprawdzania statusu: ${response.statusText}`);
                return {
                    status: 'error',
                    message: `Błąd HTTP: ${response.status}`
                };
            }

            return await response.json();
        } catch (error) {
            await this.errorReporter.reportError({
                statusCode: 500,
                url: url,
                errorMessage: error.message,
                stackTrace: error.stack,
                additionalInfo: { type, endpoint: 'check-status' }
            });

            showErrorNotification(`Błąd sprawdzania statusu: ${error.message}`);
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async updateThumbnail(url, type, previewElement, mediaInfo) {
        try {
            if (['txt', 'md', 'html'].includes(type.toLowerCase())) {
                previewElement.classList.remove('loading');
                return;
            }

            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type.toLowerCase())) {
                const imgElement = previewElement.querySelector('img');
                imgElement.src = url;
                imgElement.style.opacity = '1';
                previewElement.classList.remove('loading');
                previewElement.classList.remove('error');
                return;
            }

            if (mediaInfo.thumbnailRetries > 3) {
                await this.errorReporter.reportError({
                    statusCode: 500,
                    url: url,
                    errorMessage: 'Maximum thumbnail generation retries exceeded',
                    additionalInfo: { type, retries: mediaInfo.thumbnailRetries }
                });

                previewElement.classList.remove('loading');
                previewElement.classList.add('error');
                return;
            }

            const response = await fetch(`${this.options.baseUrl}/generate-thumbnail`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({url, type})
            });

            if (!response.ok) {
                await this.errorReporter.reportError({
                    statusCode: response.status,
                    url: url,
                    errorMessage: `Failed to generate thumbnail: ${response.statusText}`,
                    additionalInfo: { type, endpoint: 'generate-thumbnail' }
                });

                showErrorNotification(`Błąd generowania miniatury: ${response.statusText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (this.options.debug) {
                const debugInfo = previewElement.parentElement.querySelector('.debug-info');
                debugInfo.textContent = JSON.stringify({thumbnailResponse: data}, null, 2);
            }

            if (data.thumbnailUrl) {
                const imgElement = previewElement.querySelector('img');
                const newImage = new Image();

                newImage.onload = () => {
                    imgElement.src = newImage.src;
                    imgElement.style.opacity = '1';
                    previewElement.classList.remove('loading');
                    previewElement.classList.remove('error');
                    mediaInfo.thumbnailRetries = 0;
                };

                newImage.onerror = async () => {
                    mediaInfo.thumbnailRetries++;
                    previewElement.classList.add('error');
                    
                    await this.errorReporter.reportError({
                        statusCode: 500,
                        url: url,
                        errorMessage: 'Failed to load thumbnail image',
                        additionalInfo: { 
                            type, 
                            thumbnailUrl: data.thumbnailUrl,
                            retries: mediaInfo.thumbnailRetries 
                        }
                    });

                    if (this.options.debug) {
                        console.error('Error loading thumbnail:', data.thumbnailUrl);
                    }
                };

                const thumbnailUrl = data.thumbnailUrl.startsWith('http')
                    ? data.thumbnailUrl
                    : this.options.baseUrl + data.thumbnailUrl;

                newImage.src = thumbnailUrl + '?t=' + Date.now();
            } else {
                mediaInfo.thumbnailRetries++;
                previewElement.classList.add('error');
                
                await this.errorReporter.reportError({
                    statusCode: 500,
                    url: url,
                    errorMessage: 'No thumbnail URL in response',
                    additionalInfo: { 
                        type, 
                        response: data,
                        retries: mediaInfo.thumbnailRetries 
                    }
                });
            }
        } catch (error) {
            mediaInfo.thumbnailRetries++;
            previewElement.classList.add('error');
            
            await this.errorReporter.reportError({
                statusCode: 500,
                url: url,
                errorMessage: error.message,
                stackTrace: error.stack,
                additionalInfo: { 
                    type, 
                    retries: mediaInfo.thumbnailRetries 
                }
            });

            if (this.options.debug) {
                console.error('Error updating thumbnail:', error);
                const debugInfo = previewElement.parentElement.querySelector('.debug-info');
                debugInfo.textContent = JSON.stringify({thumbnailError: error.message}, null, 2);
            }

            showErrorNotification(`Błąd aktualizacji miniatury: ${error.message}`);
        }
    }

    updateCardStatus(card, status) {
        const statusIndicator = card.querySelector('.status-indicator');
        const statusElement = card.querySelector('.media-status');
        const metadataElement = card.querySelector('.media-metadata');
        const debugInfo = card.querySelector('.debug-info');

        statusIndicator.className = `status-indicator ${status.status}`;
        statusElement.className = `media-status ${status.status}`;
        statusElement.textContent = status.message;

        if (status.metadata) {
            const metadataHtml = Object.entries(status.metadata)
                .map(([key, value]) => `
                    <dt>${key}:</dt>
                    <dd>${value}</dd>
                `).join('');

            metadataElement.querySelector('dl').innerHTML = metadataHtml;
        }

        if (status.preview) {
            const existingPreview = card.querySelector('.text-preview');
            if (!existingPreview) {
                const previewElement = document.createElement('div');
                previewElement.className = 'text-preview';
                card.querySelector('.media-info').appendChild(previewElement);
            }
            card.querySelector('.text-preview').textContent = status.preview;
        }

        if (this.options.debug) {
            debugInfo.textContent = JSON.stringify(status, null, 2);
        }
    }

    shouldGenerateThumbnail(type) {
        const requiresThumbnail = [...this.mediaTypes.video, ...this.mediaTypes.stream, ...this.mediaTypes.image];
        return requiresThumbnail.includes(type.toLowerCase());
    }

    async checkMedia(url, mediaInfo) {
        const status = await this.checkStatus(url, mediaInfo.type);
        this.updateCardStatus(mediaInfo.element, status);

        const type = mediaInfo.type.toLowerCase();
        const previewElement = mediaInfo.element.querySelector('.media-preview');

        if (status.status === 'active') {
            if (['txt', 'md', 'html'].includes(type)) {
                previewElement.style.display = 'none';
            } else if (this.shouldGenerateThumbnail(type)) {
                await this.updateThumbnail(url, type, previewElement, mediaInfo);
            }
        }
    }

    startMonitoring() {
        setInterval(() => {
            const now = Date.now();
            this.mediaCards.forEach((mediaInfo, url) => {
                if (now - mediaInfo.lastCheck >= this.options.interval) {
                    this.checkMedia(url, mediaInfo);
                    mediaInfo.lastCheck = now;
                }
            });
        }, this.options.interval);
    }
}
