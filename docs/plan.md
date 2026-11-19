# Plan Técnico — KUBO

## 1. Arquitectura General
KUBO sigue una arquitectura cliente-servidor desacoplada en dos capas:
- **Frontend (SPA Estática):** Implementado en `KUBO/frontend/index.html` con CSS embebido (soporte automático para tema claro/oscuro) y JavaScript vanilla. Se comunica mediante `fetch` JSON con el backend apuntando a `window.API_URL` (`config.js`). Desplegado en **Netlify**.
- **Backend (API REST):** Servidor HTTP nativo de Node.js (`KUBO/backend/app.js` + `server.js`) estructurado mediante inyección de dependencias (`createApp({ store, fetchRates, frontendUrl })`). Desplegado en **Render**.
- **Persistencia:** Capa de abstracción en `KUBO/backend/store.js` que implementa dos adaptadores intercambiables:
  - `fileStore`: Persistencia en archivo JSON local (`data.json`), ideal para desarrollo offline y pruebas unitarias/integración aisladas.
  - `pgStore`: Persistencia relacional en **PostgreSQL (Neon)** utilizando el cliente `pg` con SSL cuando existe `DATABASE_URL`.

## 2. Base de Datos y Justificación
Se eligió **PostgreSQL (Neon)** para producción por su confiabilidad transaccional, soporte nativo en la nube con plan gratuito y facilidad de conexión mediante una única variable `DATABASE_URL`, manteniendo `fileStore` para ejecutar tests rápidos sin dependencias externas.

### Esquema de Tablas (`pgStore`)
```sql
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  rate_used NUMERIC NOT NULL,
  amount_ars NUMERIC NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS budgets (
  category TEXT PRIMARY KEY,
  lim NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS rates (
  id INT PRIMARY KEY,
  date TEXT NOT NULL,
  rates JSONB NOT NULL
);
```

## 3. Modelo de Datos (Entidades)
- **Transaction:** `{ id: UUID, type: 'income'|'expense', amount: number, currency: 'ARS', rateUsed: 1, amountArs: number, category: string, date: 'YYYY-MM-DD', note: string (max 200) }`.
- **Budget:** Mapa clave-valor `{ [category: string]: number }` donde `category` pertenece a `CATEGORIES.expense` y el valor es el límite mensual (`> 0`).

## 4. Contrato de API REST
| Método | Endpoint | Descripción | Códigos |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check para monitoreo de Render. | `200` |
| `GET` | `/api/categories` | Devuelve listas válidas de `expense` e `income`. | `200` |
| `GET` | `/api/rates` | Devuelve fecha y tasa base `{ ARS: 1 }`. | `200` |
| `GET` | `/api/transactions` | Lista todos los movimientos ordenados por fecha descendente. | `200` |
| `POST` | `/api/transactions` | Crea un movimiento, valida reglas y devuelve `{ transaction, budgetAlert }`. | `201`, `400` |
| `DELETE` | `/api/transactions/:id` | Elimina un movimiento existente por UUID. | `204`, `404` |
| `GET` | `/api/summary?month=YYYY-MM` | Devuelve balance global, ingresos/gastos del mes y estado por categoría. | `200`, `400` |
| `PUT` | `/api/budgets` | Crea o actualiza el presupuesto mensual de una categoría de gasto. | `200`, `400` |

## 5. Ubicación de Cada Regla de Negocio en el Código
- **RN1, RN2, RN3, RN4, RN7, RN8:** `backend/app.js` dentro de `createTransaction(b)`.
- **RN5 (Alertas 80% / 100%):** `backend/app.js` en las funciones puras `spentIn()` y `status(spent, limit)`.
- **RN6 (Resumen mensual):** `backend/app.js` en `summary(month)` y `balance(list)`.
- **RN9 (Validación de presupuestos):** `backend/app.js` en el handler `PUT /api/budgets` y `store.js` en `setBudget()`.
- **RN10 (CORS):** `backend/app.js` en las cabeceras `Access-Control-Allow-Origin` configuradas desde `FRONTEND_URL`.

## 6. Variables de Entorno y Despliegue
- **Render (Backend):** `DATABASE_URL` (cadena de conexión Neon), `FRONTEND_URL` (URL pública de Netlify para CORS), `PORT` (asignado por Render, fallback `3000`).
- **Netlify (Frontend):** `VITE_API_URL` (URL pública del backend en Render, inyectada en `config.js` mediante `netlify.toml`).
