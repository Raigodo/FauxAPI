# Base stage with npm setup
FROM node:23.11.1-slim AS base
WORKDIR /app

# Production dependencies stage
FROM base AS prod-deps
COPY package*.json ./
# Install only production dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Build stage - install all dependencies and build
FROM base AS build
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

# Run migrations
RUN npm run db:generate && npm run db:push

# Final stage - combine production dependencies and build output
FROM node:23.11.1-alpine AS runner
WORKDIR /app

# Copy node_modules from prod-deps
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
# Copy built files from build stage
COPY --from=build --chown=node:node /app/dist ./dist

# Use non-root user for security
USER node

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["node", "dist/src/index.js"]
