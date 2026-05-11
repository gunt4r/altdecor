# Stage 1: Build the Angular app
FROM node:20-alpine AS builder
WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:prod

# Stage 2: Serve via nginx
FROM nginx:alpine
# Angular 17 application builder writes to dist/<name>/browser
COPY --from=builder /build/dist/zipFlow/browser /usr/share/nginx/html
COPY nginx.local.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
