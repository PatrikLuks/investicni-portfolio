# Production-ready Dockerfile for Portfolio Manager Pro
# Multi-stage build for optimized image size

# Stage 1: Build stage
FROM node:18-alpine AS builder

LABEL maintainer="Patrik Luks <patrik.luks@example.com>"
LABEL description="Portfolio Manager Pro - Enterprise Investment Portfolio Management"
LABEL version="3.0.0"

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (if any)
RUN npm ci --only=production 2>/dev/null || echo "No npm dependencies"

# Copy application files
COPY . .

# Remove unnecessary files
RUN rm -rf tests/ coverage/ node_modules/.cache/ ORIGINAL/ *.md

# Stage 2: Production stage
FROM nginx:alpine

# Install additional tools
RUN apk add --no-cache \
    curl \
    ca-certificates \
    tzdata

# Set timezone
ENV TZ=Europe/Prague

# Copy application files from builder
COPY --from=builder /app /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx user and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Run as non-root user
USER nginx

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
