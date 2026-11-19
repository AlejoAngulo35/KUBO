import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createApp } from '../app.js';
import { fileStore } from '../store.js';

const today = new Date().toISOString().slice(0, 10);
async function setup() {
  const file = `/tmp/t-${Math.random()}.json`;
  const s = createApp({ store: fileStore(file), fetchRates: async () => ({ ARS: 1 }), frontendUrl: 'http://front.test' }).listen(0);
  await new Promise((r) => s.once('listening', r));
  const base = `http://localhost:${s.address().port}`;
  const call = async (m, p, b) => { const r = await fetch(base + p, { method: m, headers: { 'Content-Type': 'application/json' }, body: b && JSON.stringify(b) });
    return { status: r.status, headers: r.headers, body: r.status === 204 ? null : await r.json() }; };
  return { call, close: () => { s.close(); fs.rmSync(file, { force: true }); } };
}
const inc = (o) => ({ type: 'income', amount: 1000, category: 'Sueldo', date: today, ...o });
const exp = (o) => ({ type: 'expense', amount: 100, category: 'Comida', date: today, ...o });

test('RN4 valida monto y fecha futura', async () => {
  const { call, close } = await setup();
  assert.equal((await call('POST', '/api/transactions', inc({ amount: 0 }))).status, 400);
  assert.equal((await call('POST', '/api/transactions', inc({ date: '2999-01-01' }))).status, 400);
  close();
});
test('RN8 los gastos e ingresos solo aceptan opciones de sus listas', async () => {
  const { call, close } = await setup();
  assert.equal((await call('POST', '/api/transactions', exp({ category: 'Inventada' }))).status, 400);
  assert.equal((await call('POST', '/api/transactions', exp({ category: 'Sueldo' }))).status, 400);
  assert.equal((await call('POST', '/api/transactions', inc({ category: 'Inventada' }))).status, 400);
  assert.equal((await call('POST', '/api/transactions', inc({ category: 'Venta' }))).body.transaction.category, 'Venta');
  close();
});
test('RN3 un gasto se anota aunque no haya ingresos cargados', async () => {
  const { call, close } = await setup();
  assert.equal((await call('POST', '/api/transactions', exp({ amount: 5000 }))).status, 201);
  close();
});
test('RN5 alerta de presupuesto al 80% y al excederlo', async () => {
  const { call, close } = await setup();
  await call('PUT', '/api/budgets', { category: 'Comida', limit: 1000 });
  assert.equal((await call('POST', '/api/transactions', exp({ amount: 800 }))).body.budgetAlert, 'warning');
  assert.equal((await call('POST', '/api/transactions', exp({ amount: 300 }))).body.budgetAlert, 'exceeded');
  close();
});
test('se puede borrar un movimiento y borrar uno inexistente da 404', async () => {
  const { call, close } = await setup();
  const r = await call('POST', '/api/transactions', exp());
  assert.equal((await call('DELETE', `/api/transactions/${r.body.transaction.id}`)).status, 204);
  assert.equal((await call('DELETE', `/api/transactions/${r.body.transaction.id}`)).status, 404);
  close();
});
test('resumen mensual', async () => {
  const { call, close } = await setup();
  await call('POST', '/api/transactions', inc({ amount: 1000 }));
  await call('POST', '/api/transactions', exp({ amount: 250 }));
  const s = (await call('GET', `/api/summary?month=${today.slice(0, 7)}`)).body;
  assert.deepEqual([s.balance, s.income, s.expense], [750, 1000, 250]);
  close();
});
test('CORS solo permite el origen del frontend', async () => {
  const { call, close } = await setup();
  assert.equal((await call('GET', '/api/health')).headers.get('access-control-allow-origin'), 'http://front.test');
  close();
});