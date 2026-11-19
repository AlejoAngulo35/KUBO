# Tareas del Proyecto — KUBO

- [x] **T1 — Inicialización del proyecto y capa de persistencia dual**
  - **Agente:** Arquitecto / Desarrollador Backend
  - **Qué hacer:** Configurar `package.json` con ES Modules, `server.js` con selección automática entre `pgStore` y `fileStore`, e implementar CRUD de transacciones y presupuestos en `store.js`.
  - **RN / HU:** Base técnica para todas las RN y HU.
  - **Dependencias:** Ninguna.
  - **Criterio de terminado:** `fileStore` y `pgStore` crean estructuras, insertan, listan, eliminan y guardan presupuestos sin errores.
  - **Estado:** Hecha

- [x] **T2 — Endpoint de salud, categorías y configuración CORS**
  - **Agente:** Tester / Desarrollador Backend
  - **Qué hacer:** Implementar `GET /api/health`, `GET /api/categories`, `GET /api/rates` y cabeceras CORS restringidas a `FRONTEND_URL`.
  - **RN / HU:** RN8, RN10.
  - **Dependencias:** T1.
  - **Criterio de terminado:** Tests de CORS y lectura de categorías pasando en `app.test.js`.
  - **Estado:** Hecha

- [x] **T3 — Alta de movimientos y validaciones de dominio**
  - **Agente:** Tester / Desarrollador Backend
  - **Qué hacer:** Implementar `POST /api/transactions` validando tipo (`income`/`expense`), monto `> 0`, categoría según tipo, fecha `<= hoy` y truncado de nota a 200 caracteres.
  - **RN / HU:** RN1, RN2, RN3, RN4, RN7, RN8 / HU1, HU2.
  - **Dependencias:** T2.
  - **Criterio de terminado:** Tests de validación de montos, fechas futuras, categorías inválidas y gastos sin ingresos previos pasando en verde.
  - **Estado:** Hecha

- [x] **T4 — Gestión de presupuestos y alertas preventivas (80% y 100%)**
  - **Agente:** Tester / Desarrollador Backend
  - **Qué hacer:** Implementar `PUT /api/budgets` y el cálculo de `status` (`ok`, `warning`, `exceeded`) devolviendo `budgetAlert` al registrar gastos.
  - **RN / HU:** RN5, RN9 / HU5.
  - **Dependencias:** T3.
  - **Criterio de terminado:** Test automatizado verificando alerta `warning` al 80% y `exceeded` al superar el 100% del límite.
  - **Estado:** Hecha

- [x] **T5 — Eliminación de movimientos y resumen mensual**
  - **Agente:** Tester / Desarrollador Backend
  - **Qué hacer:** Implementar `DELETE /api/transactions/:id` (con `404` si no existe) y `GET /api/summary?month=YYYY-MM`.
  - **RN / HU:** RN6 / HU3, HU4.
  - **Dependencias:** T3, T4.
  - **Criterio de terminado:** Tests de borrado, `404` por ID inexistente y cálculo de `balance`, `income` y `expense` mensual en verde.
  - **Estado:** Hecha

- [x] **T6 — Interfaz web mensual, gráficos circulares y modal de carga**
  - **Agente:** Desarrollador Frontend
  - **Qué hacer:** Construir `frontend/index.html` con navegación mensual (bloqueando meses futuros), tarjetas de resumen, gráficos `conic-gradient` de gastos e ingresos, listado de movimientos y modal de registro.
  - **RN / HU:** RN1, RN4, RN6, RN8 / HU1, HU2, HU3, HU4.
  - **Dependencias:** T5.
  - **Criterio de terminado:** Todas las pantallas y acciones operativas en `http://localhost:5173` conectadas a la API.
  - **Estado:** Hecha

- [x] **T7 — Configuración de despliegue en la nube (Render, Netlify y Neon)**
  - **Agente:** Arquitecto / Revisor
  - **Qué hacer:** Configurar `render.yaml`, `netlify.toml`, `config.js` y variables de entorno en la nube (`DATABASE_URL`, `FRONTEND_URL`, `VITE_API_URL`).
  - **RN / HU:** RN10.
  - **Dependencias:** T6.
  - **Criterio de terminado:** Aplicación publicada y accesible desde internet con persistencia en Neon y CORS activo.
  - **Estado:** Hecha
