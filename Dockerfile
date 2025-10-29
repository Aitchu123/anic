# Multi-stage build: build Vite app and run with Node/Express
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

# Production image: Node server serving static and API
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what's needed to run the server
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/server.js /app/server.js
COPY --from=build /app/out /app/out
COPY --from=build /app/node_modules /app/node_modules

EXPOSE 3737
CMD ["node", "server.js"]