FROM node:18-alpine

# Instalacja FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Instalacja zależności
COPY package*.json ./
RUN npm install

# Kopiowanie kodu źródłowego
COPY . .

# Tworzenie katalogu na miniatury
RUN mkdir -p thumbnails

# Ustawienie zmiennych środowiskowych
ENV NODE_ENV=production
ENV FFMPEG_PATH=/usr/bin/ffmpeg

EXPOSE 3000
CMD ["npm", "start"]
