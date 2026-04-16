# Build stage
FROM node:24.12.0-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Verify build output
RUN ls -la /app/dist

# Production stage
FROM node:24.12.0-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Start server - chạy file JS đã compiled
CMD ["node", "dist/server.js"]