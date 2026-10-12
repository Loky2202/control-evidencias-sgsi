# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build de producción
RUN npm run build

# Production stage
FROM caddy:2-alpine

# Copiar build desde builder
COPY --from=builder /app/dist /srv

# Copiar configuración de Caddy
COPY Caddyfile /etc/caddy/Caddyfile

# Exponer puertos
EXPOSE 80 443

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1
