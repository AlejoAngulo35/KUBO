# Informe Final del Proyecto — KUBO

## 1. Resumen Ejecutivo
**KUBO** es un sistema web de gestión de finanzas personales desarrollado aplicando metodología **IA-First** bajo especificación formal (`spec.md`), reglas de negocio verificables (`RN1`–`RN10`), ciclo de desarrollo guiado por pruebas (Rojo-Verde-Refactor) y despliegue continuo en la nube (Netlify + Render + Neon).

---

## 2. Plan Técnico y Arquitectura
*(Síntesis del documento `plan.md`)*
- **Desacoplamiento:** El backend (`backend/app.js`) recibe la capa de almacenamiento por inyección de dependencias (`store`), permitiendo ejecutar la misma lógica de negocio tanto contra un archivo JSON local (`fileStore`) como contra PostgreSQL en Neon (`pgStore`).
- **Seguridad:** Las credenciales de base de datos (`DATABASE_URL`) y el origen autorizado (`FRONTEND_URL`) se gestionan exclusivamente mediante variables de entorno en Render y Netlify, sin exponerse en el repositorio.

---

## 3. Justificación del Orden de las Tareas
El orden de ejecución definido en `tasks.md` respondió a dos criterios técnicos: **dependencias estructurales** y **priorización de las reglas de negocio más complejas**:

1. **Primero la persistencia dual (`T1`) y la base HTTP/CORS (`T2`):** Antes de escribir reglas de negocio, se resolvió la abstracción `fileStore` / `pgStore` para garantizar que los tests pudieran correr aislados en memoria/disco temporal sin depender de una base de datos externa.
2. **Segundo el núcleo de reglas de negocio (`T3` y `T4` — la parte más crítica):** Se priorizó el alta de movimientos con todas sus validaciones (`RN1`–`RN4`, `RN7`, `RN8`) y el motor de alertas de presupuesto al 80% y 100% (`RN5`, `RN9`), ya que representan la lógica diferencial del sistema más allá de un ABM básico.
3. **Tercero las operaciones de consulta agregada y baja (`T5`):** Una vez asegurada la integridad de los datos ingresados, se implementaron el resumen mensual (`summary`) y la eliminación de registros (`DELETE`).
4. **Cuarto la interfaz de usuario (`T6`) y el despliegue (`T7`):** Con todos los endpoints validados mediante tests automatizados, se construyó el frontend conectado a una API estable y finalmente se publicó el conjunto en Render, Neon y Netlify.

---

## 4. Registro de Pruebas Realizadas

### 4.1. Pruebas Automatizadas (`backend/test/app.test.js`)
Ejecutadas mediante `npm test` (`node --test test/app.test.js`), todas finalizadas con resultado **PASS** (`7/7` suites aprobadas):

| Caso de Prueba | Regla Verificada | Escenario Probado | Resultado |
| :--- | :--- | :--- | :--- |
| Validación de monto y fecha | **RN4** | `POST /api/transactions` con `amount: 0` y con fecha futura `2999-01-01` -> rechaza con `400`. | PASS |
| Catálogo cerrado de categorías | **RN8** | `POST` con categoría inventada o cruzada (`Sueldo` en gasto) -> `400`; `Venta` en ingreso -> `201`. | PASS |
| Gasto sin ingresos previos | **RN3** | `POST` de gasto por `$5000` con historial vacío -> registra con estado `201`. | PASS |
| Alertas de presupuesto | **RN5, RN9** | Presupuesto `Comida = 1000`: gasto de `800` devuelve `budgetAlert: "warning"`; gasto adicional de `300` devuelve `budgetAlert: "exceeded"`. | PASS |
| Eliminación de movimientos | **HU4** | `DELETE /api/transactions/:id` existente -> `204`; segundo intento sobre mismo ID -> `404`. | PASS |
| Resumen mensual | **RN6** | Ingreso `1000` + gasto `250` en el mes -> `GET /api/summary` devuelve `balance: 750, income: 1000, expense: 250`. | PASS |
| Configuración CORS | **RN10** | `GET /api/health` devuelve `Access-Control-Allow-Origin` coincidente con `FRONTEND_URL`. | PASS |

### 4.2. Pruebas Manuales de Endpoints (Colección Postman / HTTP)
Además de los tests automatizados, se verificaron manualmente los endpoints de la API:
- `GET /api/health` -> Respuesta `200 OK` con `{ "ok": true }` (verificado tanto local como en Render).
- `GET /api/categories` -> Respuesta `200 OK` devolviendo los arrays `expense` (9 ítems) e `income` (6 ítems).
- `POST /api/transactions` -> Prueba de carga exitosa (`201 Created`) y prueba de error por JSON malformado (`400 Bad Request`).
- `PUT /api/budgets` -> Prueba de asignación de límite `<= 0` (`400 Bad Request`) y límite válido (`200 OK`).
- `GET /api/summary?month=2026-11` -> Verificación de agrupación mensual y estados por categoría (`ok`, `warning`, `exceeded`, `none`).
