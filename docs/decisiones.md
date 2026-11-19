# Decisiones de Producto y Negocio

## 1. Moneda y Montos
- **Pregunta:** ¿Qué monedas admite el sistema para registrar movimientos?
  **Respuesta:** El sistema opera exclusivamente en pesos argentinos (`ARS`) con tasa de conversión fija igual a `1` (`rateUsed = 1`), redondeando todos los importes a 2 decimales.
- **Pregunta:** ¿Se permiten montos negativos o iguales a cero?
  **Respuesta:** No. Todo movimiento debe tener un monto numérico finito estrictamente mayor a `0` (`amount > 0`).

## 2. Fechas y Navegación Temporal
- **Pregunta:** ¿Se pueden registrar ingresos o gastos con fecha futura?
  **Respuesta:** No. La fecha debe tener formato válido `YYYY-MM-DD` y no puede ser posterior a la fecha actual del servidor (`date <= today()`).
- **Pregunta:** ¿Cómo se navega el historial en la interfaz?
  **Respuesta:** La vista principal muestra un mes a la vez (`YYYY-MM`) con botones para retroceder o avanzar de mes, bloqueando el avance más allá del mes calendario actual.

## 3. Categorías y Notas
- **Pregunta:** ¿El usuario puede crear categorías libres al cargar un movimiento?
  **Respuesta:** No. Para evitar dispersión en los gráficos y presupuestos, cada movimiento debe pertenecer obligatoriamente a una lista predefinida según su tipo (`expense` o `income`).
- **Pregunta:** ¿Qué extensión máxima tiene el detalle o nota de un movimiento?
  **Respuesta:** La nota es opcional y se trunca automáticamente a un máximo de `200` caracteres.

## 4. Reglas de Saldo y Presupuestos
- **Pregunta:** ¿Se puede registrar un gasto si el balance actual es cero o negativo?
  **Respuesta:** Sí. El sistema permite registrar gastos sin exigir ingresos previos, reflejando un balance negativo cuando los egresos superan a los ingresos.
- **Pregunta:** ¿Cuándo se dispara una alerta de presupuesto?
  **Respuesta:** Al registrar un gasto en una categoría que tiene un presupuesto mensual definido (`limit > 0`), si el gasto acumulado del mes alcanza o supera el `80%` (`spent >= limit * 0.8`) se emite `warning`, y si supera estrictamente el `100%` (`spent > limit`) se emite `exceeded`.

## 5. Persistencia y Arquitectura
- **Pregunta:** ¿Cómo se almacenan los datos en desarrollo y en producción?
  **Respuesta:** Se utiliza un patrón de repositorio intercambiable (`store`): almacenamiento en archivo JSON (`fileStore`) para ejecución local y pruebas automatizadas, y PostgreSQL en Neon (`pgStore`) en producción cuando está definida la variable `DATABASE_URL`.
