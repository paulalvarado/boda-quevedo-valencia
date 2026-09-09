import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';
import authRoutes from './routes/auth.js';
import invitacionesRoutes from './routes/invitaciones.js';
import configRoutes from './routes/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || (process.env.NODE_ENV === 'production' ? '80' : '3000'), 10);
const ALT_PORT = PORT === 80 ? 3000 : 80;

app.use(cors());
app.use(express.json());

// Logging simple para peticiones de API (evitando saturar logs con el sondeo de 2s)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    const isPolling = req.method === 'GET' && (req.path === '/api/invitaciones' || req.path === '/api/config');
    if (!isPolling) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
  }
  next();
});

// Rutas de API
app.use('/api/auth', authRoutes);
app.use('/api/invitaciones', invitacionesRoutes);
app.use('/api/config', configRoutes);

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Servir frontend compilado en producción (dist)
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  console.log(`[Static] Sirviendo archivos estáticos desde: ${distPath}`);
  app.use(express.static(distPath));

  // SPA fallback para rutas no-API (ej: /, /admin, /?inv=...) con soporte dinámico de metadatos Open Graph
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      const indexPath = path.join(distPath, 'index.html');
      try {
        let html = fs.readFileSync(indexPath, 'utf8');
        const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.get('host');
        if (host) {
          const currentOrigin = `${proto}://${host}`;
          html = html
            .replaceAll('https://boda-quevedo-valencia.paulperez.dev/card.png', `${currentOrigin}/card.png`)
            .replaceAll('https://boda-quevedo-valencia.paulperez.dev/', `${currentOrigin}/`);
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
      } catch {
        return res.sendFile(indexPath);
      }
    }
    next();
  });
}

// Inicialización con reintentos para soportar Docker Compose mientras MySQL levanta
async function startServer() {
  // Iniciar servidores HTTP de inmediato en puerto primario y alternativo (80 y 3000)
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Servidor Boda Quevedo Valencia listo en puerto ${PORT}`);
    console.log(`   - API:      http://localhost:${PORT}/api/health`);
    console.log(`   - Admin:    http://localhost:${PORT}/admin`);
    console.log(`======================================================\n`);
  });
  server.on('error', (err) => {
    console.error(`[Server] Error en puerto principal ${PORT}:`, err.message);
  });

  // También escuchar en puerto alternativo (80 / 3000) para compatibilidad total con Dokploy/Traefik
  if (ALT_PORT !== PORT) {
    try {
      const altServer = app.listen(ALT_PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor también escuchando en puerto secundario ${ALT_PORT}`);
      });
      altServer.on('error', () => {
        // Silencioso en caso de que el puerto secundario esté en uso localmente
      });
    } catch {
      // Ignorar si no se puede enlazar
    }
  }

  const maxRetries = 10;
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      console.log(`[Init] Intentando conectar con base de datos (intento ${attempt}/${maxRetries})...`);
      await initDb();
      break;
    } catch (error) {
      console.error(`[Init] Intento ${attempt} fallido: ${error.message}`);
      if (attempt === maxRetries) {
        console.error('[Init] No se pudo conectar a MySQL tras varios intentos. El servidor continuará intentando pero las peticiones a la DB fallarán.');
      } else {
        console.log('[Init] Esperando 3 segundos antes de reintentar...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      attempt++;
    }
  }
}

startServer();
