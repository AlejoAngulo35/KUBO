# Preguntas Abiertas y Resolución

*(Ordenadas de mayor a menor impacto en las reglas de negocio. Todas las preguntas fueron resueltas antes de cerrar la especificación final).*

1. **Impacto Alto — Regla afectada: RN5 (Cálculo de alertas de presupuesto)**
   - **Pregunta:** ¿El presupuesto mensual por categoría debe impedir registrar el gasto cuando se supera el 100% o solo emitir una alerta informativa?
   - **Resolución:** Solo emite alerta (`warning` al >= 80% y `exceeded` al > 100%) sin bloquear el registro, ya que en finanzas personales el gasto real ocurrió y debe quedar asentado.

2. **Impacto Alto — Regla afectada: RN3 (Registro de gastos sin saldo)**
   - **Pregunta:** ¿Debe impedirse la carga de un gasto cuando el balance disponible es menor al monto del gasto?
   - **Resolución:** No. Se permite registrar gastos aunque no existan ingresos previos o el balance quede negativo.

3. **Impacto Medio — Regla afectada: RN1 y RN8 (Catálogo de categorías)**
   - **Pregunta:** ¿Las categorías de ingresos y gastos son compartidas o independientes, y pueden editarse desde la interfaz?
   - **Resolución:** Son listas independientes y cerradas definidas en el backend (`CATEGORIES.expense` y `CATEGORIES.income`), expuestas vía `GET /api/categories` para sincronizar el frontend.

4. **Impacto Medio — Regla afectada: RN6 (Alcance del balance mensual vs. histórico)**
   - **Pregunta:** En el resumen mensual (`GET /api/summary`), ¿el campo `balance` refleja el acumulado histórico total mientras `income` y `expense` reflejan solo el mes consultado?
   - **Resolución:** Sí. En el endpoint `/api/summary`, `income` y `expense` filtran por `month`, mientras que `balance` calcula el saldo neto global de todas las transacciones; en el frontend, la tarjeta "Balance del mes" muestra el neto específico del mes visualizado (`incTotal - expTotal`).

5. **Impacto Bajo — Regla afectada: RN2 (Monedas y cotizaciones)**
   - **Pregunta:** ¿Se soportan monedas extranjeras en el alta de movimientos de la versión 1?
   - **Resolución:** No. Aunque existen datos históricos de cotizaciones en estructura auxiliar, la API fuerza `currency = 'ARS'` y `rateUsed = 1` en cada transacción.
