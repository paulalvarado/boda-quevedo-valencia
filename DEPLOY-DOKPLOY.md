# Despliegue en Dokploy — Boda Quevedo Valencia (Monorepo Express + MySQL + React)

Este proyecto es un **monorepo completo** que incluye:
- **Frontend**: React 19 + Vite (compilado en el contenedor).
- **Backend API**: Node.js + Express.js (`/api/...`).
- **Base de Datos**: MySQL 8.0 (con migraciones automáticas).
- **Despliegue unificado**: Express sirve tanto la API como la aplicación React compilada (`dist`).

---

## 💡 ¿Por qué no se necesitan variables de entorno para React en Dokploy?

En proyectos anteriores con React / Vite puros, las variables de entorno (`VITE_*`) a menudo no funcionaban en Dokploy porque Vite las compila en **tiempo de construcción** (build-time). Cuando Dokploy inyecta variables al contenedor en tiempo de ejecución, los archivos JavaScript estáticos ya fueron compilados y no las leen.

**En esta arquitectura:**
1. **Rutas relativas**: El frontend de React se comunica con la API mediante rutas relativas (`/api/auth/...`, `/api/invitaciones/...`). Como Express sirve el frontend y la API desde el mismo origen, **React no necesita ninguna variable de entorno ni en local ni en Dokploy**.
2. **Runtime de Node.js**: Express corre en tiempo de ejecución del servidor (exactamente como PHP en CI4), leyendo las variables `process.env` dinámicamente.
3. **Valores por defecto en el Dockerfile**: El `Dockerfile` ya incluye valores predeterminados seguros (`DB_HOST=db`, `PORT=3000`, credenciales por defecto). La aplicación arrancará y funcionará de inmediato sin necesidad de ingresar variables manualmente en Dokploy si se usa Docker Compose.

---

## 🚀 Opción A: Despliegue en Dokploy con Docker Compose (Recomendada)

Permite levantar la aplicación y la base de datos MySQL 8.0 de forma automática y con volumen persistente.

1. **Crear Proyecto**: En Dokploy → *New Project* → Nombre: `Boda Quevedo Valencia`.
2. **Crear Servicio Compose**:
   - En el proyecto, clic en *Create Service* → Seleccionar **Compose**.
   - Nombre: `boda-stack`.
3. **Origen del Código (Source)**:
   - Proveedor: **GitHub**.
   - Repositorio: `paulalvarado/boda-quevedo-valencia`.
   - Rama: `main`.
   - Compose Path: `./docker-compose.yml`.
4. **Dominio**:
   - Ir a la pestaña **Domains**.
   - Host: `boda-quevedo-valencia.paulperez.dev` (o tu dominio deseado).
   - Service: Seleccionar el servicio `app`.
   - Container Port: **3000** (puerto en el que corre Express).
   - HTTPS: Activar Let's Encrypt (Automático).
5. **Deploy**:
   - Clic en **Deploy**. Dokploy levantará `db` (MySQL) y `app` (Node + React).
   - Las tablas de la base de datos y el administrador por defecto se crean automáticamente.

---

## 🛠️ Opción B: Despliegue como Application (Dockerfile)

Si prefieres usar una base de datos MySQL administrada por separado en Dokploy:

1. **Crear Servicio Application**:
   - Tipo: **Application**.
   - Origen: GitHub (`paulalvarado/boda-quevedo-valencia`, rama `main`).
   - Build Type: **Dockerfile** (Ruta: `./Dockerfile`, Context: `.`).
2. **Variables de Entorno (Pestaña Environment de Dokploy)**:
   Si usas una base de datos externa de Dokploy, define:
   ```env
   NODE_ENV=production
   PORT=3000
   DB_HOST=mysql-dokploy-host
   DB_PORT=3306
   DB_USER=boda_user
   DB_PASSWORD=tu_password_mysql
   DB_NAME=boda_db
   JWT_SECRET=tu_secreto_jwt_aleatorio
   ```
3. **Dominio**:
   - Host: `boda-quevedo-valencia.paulperez.dev`.
   - Container Port: **3000**.
   - HTTPS: Activo.

---

## 🔑 Credenciales por Defecto del Administrador

- **URL de acceso al panel**: `https://tu-dominio.dev/admin`
- **Usuario**: `admin`
- **Contraseña inicial**: `boda2026`
*(El administrador puede cambiar su contraseña desde el panel en cualquier momento).*

---

## 💻 Desarrollo Local

Para correr todo localmente:

```bash
# 1. Levantar base de datos MySQL
docker compose up -d db

# 2. Iniciar servidor Express (escucha en puerto 3000)
npm run dev:server

# 3. En otra terminal, iniciar Vite frontend (puerto 5173, con proxy automático a /api)
npm run dev
```
O simplemente compilar y correr todo el stack completo en Docker:
```bash
docker compose up -d --build
```
Acceder a:
- Invitación pública: `http://localhost:3000`
- Panel de Administración: `http://localhost:3000/admin`
