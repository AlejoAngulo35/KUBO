# Idea del Proyecto: KUBO

## 1. Descripción General
**KUBO** es una aplicación web de finanzas personales diseñada para que una persona pueda registrar, visualizar y controlar sus ingresos y gastos mensuales en pesos argentinos (`ARS`), establecer límites de presupuesto por categoría de gasto y recibir alertas preventivas antes o al momento de superarlos.

## 2. Problema que Resuelve
Muchas personas llevan el control de sus gastos diarios de manera informal o desordenada, sin visibilidad clara de cuánto llevan gastado en el mes por categoría ni de cuánto margen les queda respecto a sus límites personales. KUBO centraliza los movimientos mensuales en una interfaz simple, calcula automáticamente el balance y emite advertencias cuando el gasto acumulado en una categoría alcanza el 80% o supera el 100% del presupuesto asignado.

## 3. Alcance del Producto
- **Moneda operativa:** Pesos argentinos (`ARS`) como moneda base de registro y cálculo.
- **Gestión de movimientos:** Alta y eliminación de transacciones clasificadas como `income` (ingreso) o `expense` (gasto).
- **Clasificación estricta:** Catálogos cerrados de categorías para gastos y orígenes para ingresos.
- **Presupuestos y alertas:** Configuración de límites mensuales por categoría de gasto y evaluación automática del estado (`ok`, `warning`, `exceeded`).
- **Visualización mensual:** Navegación mes a mes (sin navegar a meses futuros) con totales de ingresos, gastos, balance del mes, listado cronológico y gráficos circulares de distribución por categoría.

## 4. Fuera de Alcance (V1)
- Gestión multiusuario o autenticación con inicio de sesión.
- Conversión automática en tiempo real con monedas extranjeras en el registro (si bien existe estructura preparada para tasas, la operativa actual fija `ARS` con tasa `1`).
- Edición directa de transacciones existentes (se resuelve eliminando y volviendo a cargar).
- Envío de notificaciones por correo electrónico o mensajería externa.
