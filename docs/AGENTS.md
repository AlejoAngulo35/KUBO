# AGENTS.md — Reglamento del Proyecto KUBO

## 1. Descripción del Proyecto
**KUBO** es una aplicación web de finanzas personales compuesta por un backend REST en Node.js (sin frameworks externos, usando `node:http` y `pg`) y un frontend estático en HTML5, CSS3 y JavaScript vanilla.

## 2. Fuente de Verdad y Documentación
Toda implementación debe respetar estrictamente los siguientes documentos ubicados en la raíz del proyecto:
1. `idea.md` — Visión y alcance del producto.
2. `decisiones.md` y `glosario.md` — Definiciones de dominio y criterios cerrados.
3. `spec.md` — **Fuente de verdad funcional** (Reglas de Negocio `RN1`–`RN10` e Historias de Usuario `HU1`–`HU5`).
4. `plan.md` — Arquitectura técnica, esquema de base de datos y contratos de API.
5. `tasks.md` — Plan de trabajo incremental y estado de cada tarea.

## 3. Stack Tecnológico y Convenciones
- **Runtime:** Node.js `>= 20` con ES Modules (`"type": "module"`).
- **Backend:** `node:http`, `node:fs`, `node:crypto`, driver `pg` (`^8.13.0`).
- **Base de Datos:** PostgreSQL en Neon (producción vía `DATABASE_URL`) y archivo JSON local (`fileStore`) para desarrollo y tests.
- **Frontend:** Archivo único `frontend/index.html` + `frontend/config.js` servido localmente con `frontend/serve.mjs` y desplegado en Netlify.
- **Testing:** Runner nativo `node --test` (`backend/test/app.test.js`).
- **Seguridad:** Nunca incluir credenciales ni URLs de base de datos en el código; usar variables de entorno (`DATABASE_URL`, `FRONTEND_URL`, `VITE_API_URL`).

## 4. Agentes del Equipo
- **Analista (`.cursor/rules/analista.mdc`):** Mantiene `idea.md`, `decisiones.md`, `glosario.md`, `preguntas-abiertas.md` y `spec.md` sin ambigüedades.
- **Arquitecto (`.cursor/rules/arquitecto.mdc`):** Define `plan.md` y descompone `tasks.md` respetando dependencias.
- **Tester (`.cursor/rules/tester.mdc`):** Escribe pruebas automatizadas en `backend/test/app.test.js` antes de dar por cerrada cada regla.
- **Desarrollador Backend (`.cursor/rules/backend.mdc`):** Implementa `app.js`, `store.js` y `server.js` sin alterar los tests.
- **Desarrollador Frontend (`.cursor/rules/frontend.mdc`):** Implementa la UI en `frontend/index.html` y su configuración de despliegue.
- **Revisor (`.cursor/rules/revisor.mdc`):** Verifica cumplimiento de `spec.md`, ejecución verde de `npm test`, ausencia de secretos y realiza el commit por tarea.

## 5. Ciclo de Trabajo por Tarea
1. Seleccionar la siguiente tarea pendiente en `tasks.md` cuyas dependencias estén completadas.
2. **Rojo:** El Tester escribe o amplía el test en `backend/test/app.test.js` verificando la `RN` correspondiente.
3. **Verde:** El Desarrollador implementa el código mínimo y limpio para que los tests pasen sin modificar las aserciones del Tester.
4. **Refactor y Revisión:** El Revisor valida reglas de negocio, seguridad (`.env`/CORS) y limpia el código.
5. **Cierre:** Se marca la tarea como `[x]` en `tasks.md` y se realiza **un commit atómico por tarea** en Git.
