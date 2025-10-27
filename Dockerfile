# Multi-stage build: build Vite app and serve with Nginx
FROM node:18-alpine AS build
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source
COPY . .

# Allow setting base path at build time (optional)
ARG BASE_PATH=/
ENV BASE_PATH=${BASE_PATH}

# Build for production (Vite outputs to 'out' per vite.config.ts)
RUN npm run build

# Production image with Nginx
FROM nginx:alpine AS runner
# Nginx config for SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets
COPY --from=build /app/out /usr/share/nginx/html

EXPOSE 3737
CMD ["nginx", "-g", "daemon off;"]