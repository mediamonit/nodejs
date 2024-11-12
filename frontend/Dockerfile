FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
ARG BACKEND_URL
RUN sed -i "s|http://localhost:3000|${BACKEND_URL}|g" src/media-monitor.js

FROM nginx:alpine
COPY --from=builder /app/src /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
