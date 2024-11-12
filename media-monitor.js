// media-monitor.js
class MediaLinkMonitor {
   constructor(options = {}) {
      this.checkInterval = options.interval || 100; // domyślny interwał 100ms
      this.thumbnailInterval = 1000; // interwał odświeżania miniatur - 1s
      this.activeChecks = new Map();
      this.activeThumbnails = new Map();
      this.init();
   }

   init() {
      const mediaLinks = document.querySelectorAll('a[data-media-type]');

      mediaLinks.forEach(link => {
         // Kontener na status i podgląd
         const containerDiv = document.createElement('div');
         containerDiv.className = 'media-container';

         // Status
         const statusDiv = document.createElement('div');
         statusDiv.className = 'media-status';
         containerDiv.appendChild(statusDiv);

         // Kontener na miniaturę/podgląd
         const previewDiv = document.createElement('div');
         previewDiv.className = 'media-preview';
         containerDiv.appendChild(previewDiv);

         link.parentNode.insertBefore(containerDiv, link.nextSibling);

         // Rozpocznij monitorowanie
         this.startMonitoring(link);
      });
   }

   async checkMediaStatus(url, type) {
      try {
         switch(type) {
            case 'rtsp':
            case 'rtmp':
               return await this.checkStreamingUrl(url);
            case 'hls':
               return await this.checkHlsStream(url);
            case 'dash':
               return await this.checkDashStream(url);
            case 'mp4':
               return await this.checkMP4(url);
            case 'text':
               return await this.checkTextFile(url);
            case 'html':
               return await this.checkHtmlFile(url);
            default:
               throw new Error('Nieobsługiwany typ medium');
         }
      } catch (error) {
         return {
            status: 'error',
            message: error.message
         };
      }
   }

   async checkStreamingUrl(url) {
      // Symulacja sprawdzenia - w rzeczywistości potrzebny byłby backend
      return new Promise((resolve) => {
         const isAvailable = Math.random() > 0.1;
         resolve({
            status: isAvailable ? 'active' : 'error',
            message: isAvailable ? 'Stream aktywny' : 'Stream niedostępny',
            isVideo: true
         });
      });
   }

   async checkHlsStream(url) {
      try {
         const response = await fetch(url);
         if (!response.ok) throw new Error('Błąd pobierania manifestu HLS');

         const manifest = await response.text();
         if (!manifest.includes('#EXTM3U')) {
            throw new Error('Nieprawidłowy format manifestu HLS');
         }

         return {
            status: 'active',
            message: 'Stream HLS aktywny',
            isVideo: true
         };
      } catch (error) {
         return {
            status: 'error',
            message: `Błąd HLS: ${error.message}`
         };
      }
   }

   async checkDashStream(url) {
      try {
         const response = await fetch(url);
         if (!response.ok) throw new Error('Błąd pobierania manifestu DASH');

         const manifest = await response.text();
         if (!manifest.includes('MPD')) {
            throw new Error('Nieprawidłowy format manifestu DASH');
         }

         return {
            status: 'active',
            message: 'Stream DASH aktywny',
            isVideo: true
         };
      } catch (error) {
         return {
            status: 'error',
            message: `Błąd DASH: ${error.message}`
         };
      }
   }

   async checkMP4(url) {
      try {
         const response = await fetch(url, { method: 'HEAD' });
         if (!response.ok) throw new Error('Plik MP4 niedostępny');

         const contentType = response.headers.get('content-type');
         if (!contentType || !contentType.includes('video')) {
            throw new Error('Nieprawidłowy typ zawartości');
         }

         return {
            status: 'active',
            message: 'Plik MP4 dostępny',
            isVideo: true
         };
      } catch (error) {
         return {
            status: 'error',
            message: `Błąd MP4: ${error.message}`
         };
      }
   }

   async checkTextFile(url) {
      try {
         const response = await fetch(url);
         if (!response.ok) throw new Error('Plik tekstowy niedostępny');

         const text = await response.text();
         return {
            status: 'active',
            message: 'Plik tekstowy dostępny',
            preview: text.slice(0, 100) + '...',
            isText: true
         };
      } catch (error) {
         return {
            status: 'error',
            message: `Błąd pliku tekstowego: ${error.message}`
         };
      }
   }

   async checkHtmlFile(url) {
      try {
         const response = await fetch(url);
         if (!response.ok) throw new Error('Plik HTML niedostępny');

         const html = await response.text();
         // Usuwanie tagów HTML i pobieranie pierwszych 100 znaków tekstu
         const textContent = html.replace(/<[^>]*>/g, '').trim();
         return {
            status: 'active',
            message: 'Plik HTML dostępny',
            preview: textContent.slice(0, 100) + '...',
            isHtml: true
         };
      } catch (error) {
         return {
            status: 'error',
            message: `Błąd pliku HTML: ${error.message}`
         };
      }
   }

   async generateThumbnail(url, type) {
      // W rzeczywistej implementacji należałoby użyć odpowiedniego API do generowania miniatur
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');

      // Przykładowa miniatura (w rzeczywistości powinna być generowana z video)
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, 160, 90);
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.fillText(`Podgląd ${type}`, 10, 45);

      return canvas.toDataURL();
   }

   startMonitoring(link) {
      const url = link.href;
      const type = link.getAttribute('data-media-type');
      const container = link.nextSibling;
      const statusDiv = container.querySelector('.media-status');
      const previewDiv = container.querySelector('.media-preview');

      const check = async () => {
         const result = await this.checkMediaStatus(url, type);

         // Aktualizuj wygląd linku i status
         link.style.color = result.status === 'active' ? 'green' : 'red';
         statusDiv.textContent = result.message;
         statusDiv.className = `media-status ${result.status}`;

         // Aktualizuj podgląd
         if (result.status === 'active') {
            if (result.isVideo) {
               const thumbnail = await this.generateThumbnail(url, type);
               previewDiv.innerHTML = `<img src="${thumbnail}" alt="Podgląd" class="thumbnail">`;
            } else if (result.isText || result.isHtml) {
               previewDiv.innerHTML = `<div class="text-preview">${result.preview}</div>`;
            }
         } else {
            previewDiv.innerHTML = '';
         }
      };

      // Rozpocznij cykliczne sprawdzanie statusu
      const statusIntervalId = setInterval(check, this.checkInterval);
      this.activeChecks.set(link, statusIntervalId);

      // Rozpocznij cykliczne odświeżanie miniatur dla plików video
      if (['rtsp', 'rtmp', 'hls', 'dash', 'mp4'].includes(type)) {
         const thumbnailIntervalId = setInterval(async () => {
            if (this.activeChecks.has(link)) {
               const thumbnail = await this.generateThumbnail(url, type);
               const previewDiv = link.nextSibling.querySelector('.media-preview');
               const img = previewDiv.querySelector('img');
               if (img) {
                  img.src = thumbnail;
               }
            }
         }, this.thumbnailInterval);
         this.activeThumbnails.set(link, thumbnailIntervalId);
      }

      // Wykonaj pierwsze sprawdzenie od razu
      check();
   }

   stopMonitoring(link) {
      const statusIntervalId = this.activeChecks.get(link);
      const thumbnailIntervalId = this.activeThumbnails.get(link);

      if (statusIntervalId) {
         clearInterval(statusIntervalId);
         this.activeChecks.delete(link);
      }

      if (thumbnailIntervalId) {
         clearInterval(thumbnailIntervalId);
         this.activeThumbnails.delete(link);
      }
   }

   stopAll() {
      this.activeChecks.forEach((intervalId) => clearInterval(intervalId));
      this.activeChecks.clear();

      this.activeThumbnails.forEach((intervalId) => clearInterval(intervalId));
      this.activeThumbnails.clear();
   }
}
