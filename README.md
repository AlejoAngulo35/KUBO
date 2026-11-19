# KUBO
KUBO es una aplicación web de finanzas personales que permite gestionar ingresos, controlar gastos, administrar presupuestos y visualizar estadísticas para organizar mejor el dinero.

## Estructura

```
KUBO/
├── package.json     <- permite que Render arranque el backend aunque no configures Root Directory
├── render.yaml      <- Blueprint de Render (backend + frontend)
├── backend/         <- API Node (package.json propio)
├── frontend/        <- sitio estático (index.html)
└── docs/            <- documentación del proyecto
```

## Deploy en Render

**Opción A – Blueprint:** New → Blueprint → elegí el repo. Cargá `DATABASE_URL` y `FRONTEND_URL` (backend) y `API_URL` (frontend).

**Opción B – manual:**
- Backend (Web Service): Build `npm install`, Start `npm start`. Root Directory vacío o `backend`.
- Frontend (Static Site): Root Directory `frontend`, Build `echo "window.API_URL='$API_URL';" > config.js`, Publish Directory `.`
