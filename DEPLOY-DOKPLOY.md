# Despliegue en Dokploy — Boda Quevedo Valencia

Invitación digital de boda (SPA Vite + React 19, npm). Publicada desde el repo
`paulalvarado/boda-quevedo-valencia` (rama `main`).

## ✅ Ya está listo (automatizado)

| Archivo | Propósito |
|---|---|
| `Dockerfile` | Build multi-stage: `node:22-alpine` (npm ci + vite build) → `nginx:1.27-alpine` |
| `nginx.conf` | SPA fallback (`try_files ... /index.html`) + cache inmutable de `/assets/` |
| `.dockerignore` | Excluye `node_modules/`, `dist/`, `.env`, `.git/`, etc. del contexto |
| Push a GitHub | Commit `5308414` en `main` (validado: `npm run build` ✅ y `docker build` ✅) |

## 📋 Pasos restantes (acción manual del usuario)

> Opción A — con el MCP habilitado (recomendada si quieres que el agente lo haga):
> 1. En VS Code → MCP → habilita `project-create`, `application-create`, `application-update`,
>    `application-saveBuildType`, `application-saveGithubProvider`, `application-updateTraefikConfig`,
>    `application-deploy`, `application-readLogs`, `deployment-all`, `application-one`.
> 2. Dile al agente: **"continúa el despliegue de la boda en Dokploy"**.

### Opción B — Manual por la UI de Dokploy

1. **Proyecto**: New Project → nombre `BODA QUEVEDO VALENCIA`.
2. **Aplicación**: New Application → fuente **GitHub**:
   - Repo: `paulalvarado/boda-quevedo-valencia`, rama `main`.
   - Build: **Dockerfile** → `./Dockerfile`, Context `.`.
   - Auto-deploy: ON (cada push a `main` redespliega).
3. **Dominio** (pestaña Domains):
   - Host: `boda-quevedo-valencia.paulperez.dev`
   - Container Port: **80** (Nginx escucha en 80).
   - HTTPS: ON (Let's Encrypt).
4. **DNS** (proveedor del dominio): registro **A** de `boda-quevedo-valencia.paulperez.dev`
   → IP pública del servidor Dokploy.
5. **Deploy** → esperar build → verificar que el contenedor queda `running`/`healthy`.
6. **Verificar**: abrir `https://boda-quevedo-valencia.paulperez.dev` (debe responder 200 con HTTPS).

> No necesita variables de entorno: es una SPA estática sin API (no hay `VITE_*` en el código).

## 🔧 YAML de Traefik (si se configura por API en vez de la pestaña Domains)

> ⚠️ Usar **o** la pestaña Domains **o** este YAML — nunca ambos (routers duplicados).
> Reemplazar `<SUFIJO>` por el sufijo real del `appName` (consultar en `application-one`).

```yaml
http:
  routers:
    boda-quevedo-valencia-<SUFIJO>-router-1:
      rule: Host(`boda-quevedo-valencia.paulperez.dev`)
      service: boda-quevedo-valencia-<SUFIJO>-service-1
      middlewares:
        - redirect-to-https
      entryPoints:
        - web
    boda-quevedo-valencia-<SUFIJO>-router-websecure-1:
      rule: Host(`boda-quevedo-valencia.paulperez.dev`)
      service: boda-quevedo-valencia-<SUFIJO>-service-1
      middlewares: []
      entryPoints:
        - websecure
      tls:
        certResolver: letsencrypt
  services:
    boda-quevedo-valencia-<SUFIJO>-service-1:
      loadBalancer:
        servers:
          - url: http://boda-quevedo-valencia-<SUFIJO>:80
        passHostHeader: true
```

## 🚨 Troubleshooting

| Síntoma | Solución |
|---|---|
| 502 en el dominio | Container Port ≠ 80 (Nginx escucha en 80) |
| Dominio no resuelve | Falta registro A → IP del servidor en el DNS |
| SPA da 404 en rutas internas | Ya cubierto por el `try_files` de `nginx.conf` |
| Certificado no aparece | Esperar Let's Encrypt; DNS debe apuntar al servidor |
