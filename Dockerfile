# ============================================================
# ETAPA 1: Compilación del Frontend (Node.js + Vite)
# ============================================================
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Copiar dependencias e instalar
COPY package.json package-lock.json ./
RUN npm ci

# Copiar archivos fuentes
COPY index.html vite.config.js ./
COPY public/ public/
COPY src/ src/

# Compilar frontend a dist/
RUN npm run build

# ============================================================
# ETAPA 2: Runtime de Producción (Node.js + Express)
# ============================================================
FROM node:22-alpine AS production

WORKDIR /app

# Variables de entorno por defecto integradas directamente en la imagen
# para garantizar funcionamiento inmediato en Dokploy sin depender de .env
ENV NODE_ENV=production \
    PORT=3000 \
    DB_HOST=db \
    DB_PORT=3306 \
    DB_USER=boda-quevedo-valencia-user \
    DB_PASSWORD=boda-quevedo-valencia-pass \
    DB_NAME=boda-quevedo-valencia-db \
    JWT_SECRET=boda_jwt_secret_super_seguro_2026 \
    ADMIN_DEFAULT_USER=admin \
    ADMIN_DEFAULT_PASSWORD=boda2026

# Instalar dependencias requeridas para producción
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copiar código del servidor Express
COPY server/ server/

# Copiar el frontend compilado desde la etapa de compilación
COPY --from=frontend-builder /app/dist ./dist

# Puerto donde escucha la aplicación Express
EXPOSE 3000

# Iniciar servidor Express (maneja tanto la API /api/* como el frontend SPA)
CMD ["node", "server/index.js"]
