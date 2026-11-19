# Glosario de Términos de Negocio

- **Movimiento (Transaction):** Registro financiero individual que representa una entrada (`income`) o salida (`expense`) de dinero en una fecha determinada.
- **Ingreso (`income`):** Movimiento que incrementa el balance del usuario, asociado obligatoriamente a un origen válido (`Sueldo`, `Deuda`, `Regalo`, `Venta`, `Inversión`, `Otros`).
- **Gasto (`expense`):** Movimiento que reduce el balance del usuario, asociado obligatoriamente a una categoría válida (`Comida`, `Suscripciones`, `Entretenimiento`, `Transporte`, `Salud`, `Hogar`, `Educación`, `Ropa`, `Otros`).
- **Balance:** Diferencia neta calculada entre la suma de ingresos y la suma de gastos (puede calcularse sobre el historial completo en API o sobre el mes seleccionado en la vista).
- **Presupuesto (`Budget`):** Límite máximo de gasto mensual (`limit > 0`) asignado por el usuario a una categoría específica de gasto.
- **Estado de Presupuesto (`Status`):** Indicador del consumo mensual de una categoría respecto a su límite: `none` (sin presupuesto), `ok` (< 80%), `warning` (>= 80% y <= 100%) o `exceeded` (> 100%).
- **Alerta de Presupuesto (`budgetAlert`):** Notificación devuelta al crear un gasto cuando el acumulado mensual de su categoría entra en estado `warning` o `exceeded`.
- **Período Mensual (`month`):** Mes calendario identificado con formato `YYYY-MM` sobre el cual se agrupan estadísticas, gráficos y presupuestos.
