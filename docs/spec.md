# Especificación Funcional y de Negocio — KUBO

## 1. Objetivo
Proveer una aplicación web de gestión de finanzas personales que permita registrar ingresos y gastos en pesos argentinos (`ARS`), visualizar su distribución mensual mediante indicadores y gráficos, y controlar el cumplimiento de presupuestos por categoría con alertas automáticas.

## 2. Usuarios y Roles
- **Usuario Personal (Rol único):** Persona que administra sus propias finanzas. Puede consultar movimientos, filtrar por mes calendario, registrar nuevos ingresos o gastos, eliminar movimientos existentes, configurar presupuestos por categoría y consultar resúmenes mensuales.

## 3. Alcance
- **Backend REST API:** Endpoints en Node.js para salud del servicio, categorías, cotizaciones base, alta/listado/eliminación de transacciones, configuración de presupuestos y resumen mensual.
- **Frontend Web Responsivo:** Interfaz SPA en HTML/CSS/JS con navegación por mes, tarjetas de totales, gráficos circulares (torta) de gastos e ingresos, listado de movimientos y modal de carga.
- **Persistencia Dual:** Soporte para archivo JSON local (`fileStore`) y base de datos PostgreSQL en Neon (`pgStore`).

---

## 4. Reglas de Negocio (RN)

- **RN1 — Tipos de movimiento válidos:** Todo movimiento debe tener tipo `income` (ingreso) o `expense` (gasto). Cualquier otro valor es rechazado con error `400`.
- **RN2 — Moneda única y redondeo:** Todos los movimientos se registran en moneda `ARS` con tasa `rateUsed = 1`. El importe convertido (`amountArs`) se redondea exactamente a `2` decimales.
- **RN3 — Independencia de saldo previo:** Un gasto (`expense`) puede registrarse libremente aunque no existan ingresos previos o el balance resultante sea negativo.
- **RN4 — Validación de monto y fecha:**
  - El monto (`amount`) debe ser un número finito estrictamente mayor a `0` (`amount > 0`).
  - La fecha (`date`) debe cumplir el formato `YYYY-MM-DD`, ser una fecha calendario válida y no ser posterior a la fecha actual (`date <= hoy`).
- **RN5 — Umbrales de alerta de presupuesto:** Si una categoría de gasto tiene un límite mensual configurado (`limit > 0`), al registrar un gasto en esa categoría en el mes `YYYY-MM` se calcula el total gastado (`spent`):
  - Si `spent > limit`, el estado es `exceeded` y se devuelve `budgetAlert: "exceeded"`.
  - Si `spent >= limit * 0.8` (80% o más, sin superar el 100%), el estado es `warning` y se devuelve `budgetAlert: "warning"`.
  - Si `spent < limit * 0.8`, el estado es `ok` y `budgetAlert` es `null`.
  - Si no existe presupuesto para la categoría, el estado es `none` y `budgetAlert` es `null`.
- **RN6 — Cálculo de resumen mensual:** Para un mes `YYYY-MM` válido, el resumen calcula la suma de ingresos del mes, la suma de gastos del mes, el estado presupuestario de cada categoría con gastos o presupuesto activo, y el balance total (`ingresos - gastos`).
- **RN7 — Límite de longitud de nota:** La nota opcional (`note`) de un movimiento admite como máximo `200` caracteres; si excede esa longitud, se recorta a los primeros `200` caracteres.
- **RN8 — Catálogo cerrado de categorías:**
  - Los gastos (`expense`) solo aceptan una de las `9` categorías definidas: `Comida`, `Suscripciones`, `Entretenimiento`, `Transporte`, `Salud`, `Hogar`, `Educación`, `Ropa`, `Otros`.
  - Los ingresos (`income`) solo aceptan uno de los `6` orígenes definidos: `Sueldo`, `Deuda`, `Regalo`, `Venta`, `Inversión`, `Otros`.
- **RN9 — Validación de presupuestos:** Solo se pueden configurar presupuestos para categorías válidas de `expense` con un límite numérico estrictamente mayor a `0` (`limit > 0`). Si la categoría ya tenía presupuesto, se sobrescribe con el nuevo límite.
- **RN10 — Seguridad de acceso (CORS):** Cuando `FRONTEND_URL` está configurada, el backend solo autoriza peticiones provenientes de ese origen exacto.

---

## 5. Historias de Usuario (HU)

### HU1 — Registrar un gasto
**Como** usuario de KUBO, **quiero** registrar un gasto indicando categoría, monto, fecha y una nota opcional **para** llevar control de en qué utilizo mi dinero.
- **Criterios de aceptación:**
  - **Dado** que selecciono tipo "Gasto", categoría `Comida`, monto `2500`, fecha válida no futura y nota opcional, **cuando** envío el formulario, **entonces** el sistema guarda el movimiento con ID único, devuelve estado `201` y actualiza el listado y los gráficos del mes (cumple **RN1, RN2, RN3, RN4, RN7, RN8**).
  - **Dado** que ingreso un monto `<= 0`, una categoría inexistente o una fecha futura, **cuando** intento guardar el gasto, **entonces** el sistema rechaza la operación con error `400` y muestra el mensaje descriptivo sin guardar datos (cumple **RN4, RN8**).

### HU2 — Registrar un ingreso
**Como** usuario de KUBO, **quiero** registrar un ingreso indicando su origen, monto, fecha y nota opcional **para** conocer mis entradas de dinero del mes.
- **Criterios de aceptación:**
  - **Dado** que selecciono tipo "Ingreso", origen `Sueldo`, monto `100000` y fecha válida no futura, **cuando** guardo el movimiento, **entonces** el sistema lo registra con estado `201`, suma el importe al total de ingresos y recalcula el balance (cumple **RN1, RN2, RN4, RN8**).
  - **Dado** que envío una categoría de gasto (ej. `Comida`) en un movimiento de tipo `income`, **cuando** se procesa la solicitud, **entonces** el backend devuelve `400` con "Origen de ingreso inválido" (cumple **RN8**).

### HU3 — Visualizar resumen y gráficos mensuales
**Como** usuario de KUBO, **quiero** navegar entre meses y ver el total de ingresos, gastos, balance y gráficos circulares por categoría **para** analizar mi situación financiera mensual.
- **Criterios de aceptación:**
  - **Dado** que abro la aplicación, **cuando** carga el mes actual, **entonces** visualizo las tarjetas de Ingresos del mes, Gastos del mes, Balance del mes, dos gráficos de torta (Gastos e Ingresos) y la lista de movimientos ordenada por fecha descendente (cumple **RN6**).
  - **Dado** que estoy posicionado en el mes calendario actual, **cuando** observo la barra de navegación superior, **entonces** puedo retroceder a meses anteriores (`‹`) pero el botón de mes siguiente (`›`) permanece deshabilitado (cumple **RN4**).

### HU4 — Eliminar un movimiento
**Como** usuario de KUBO, **quiero** eliminar un movimiento registrado **para** corregir errores de carga.
- **Criterios de aceptación:**
  - **Dado** que existe un movimiento en la lista del mes, **cuando** presiono el botón eliminar (`✕`), **entonces** el backend elimina el registro (`204`) y la interfaz recalcula inmediatamente totales, gráficos y balance (cumple **RN6**).
  - **Dado** que se solicita eliminar un ID inexistente, **cuando** se invoca `DELETE /api/transactions/:id`, **entonces** el sistema responde con estado `404` ("No existe").

### HU5 — Configurar presupuestos y recibir alertas
**Como** usuario de KUBO, **quiero** definir un límite de gasto mensual por categoría y recibir alerta al acercarme o excederlo **para** evitar gastar de más.
- **Criterios de aceptación:**
  - **Dado** que configuro un presupuesto de `$1000` en `Comida` mediante `PUT /api/budgets`, **cuando** registro un gasto en `Comida` que lleva el acumulado del mes a `$800` (80%), **entonces** la respuesta incluye `budgetAlert: "warning"` (cumple **RN5, RN9**).
  - **Dado** que el acumulado mensual en `Comida` supera los `$1000`, **cuando** se crea el gasto, **entonces** la respuesta incluye `budgetAlert: "exceeded"` (cumple **RN5**).

---

## 6. Casos Borde Contemplados
- **JSON malformado en el cuerpo de la petición:** Devuelve `400` (`JSON inválido`) sin caer el servidor.
- **Mes sin movimientos registrados:** Los gráficos circulares muestran el mensaje vacío correspondiente y los totales muestran `$ 0,00` sin errores de división por cero.
- **Fallo de red al cargar categorías en frontend:** El cliente utiliza una copia de respaldo (`DEFAULT_CATS`) idéntica a la del backend para no bloquear la interfaz.
- **Preflight CORS (`OPTIONS`):** Responde `204` con las cabeceras permitidas (`GET,POST,PUT,DELETE,OPTIONS`).
- **Datos heredados en `data.json` local:** En el archivo de prueba local existen registros previos con categoría `"Ingreso"`; al visualizarse en el frontend se muestran correctamente, mientras que toda alta nueva valida estrictamente contra `CATEGORIES.income`.

---

## 7. Pendientes
- *Sin pendientes abiertos. Todas las reglas de negocio e historias de usuario se encuentran definidas y verificadas.*
