import http from 'node:http';
import crypto from 'node:crypto';

export const CURRENCIES = ['ARS'];
export const CATEGORIES = {
  expense: ['Comida', 'Suscripciones', 'Entretenimiento', 'Transporte', 'Salud', 'Hogar', 'Educación', 'Ropa', 'Otros'],
  income: ['Sueldo', 'Deuda', 'Regalo', 'Venta', 'Inversión', 'Otros'],
};

const today = () => new Date().toISOString().slice(0, 10);
const r2 = (n) => Math.round(n * 100) / 100;
const fail = (status, message) => Object.assign(new Error(message), { status });

async function defaultFetchRates() {
  return { ARS: 1 };
}

export function createApp({ store, fetchRates = defaultFetchRates, frontendUrl = process.env.FRONTEND_URL }) {
  async function getRates() {
    return { date: today(), rates: { ARS: 1 }, stale: false };
  }

  const balance = (list) => r2(list.reduce((s, t) => s + (t.type === 'income' ? t.amountArs : -t.amountArs), 0));
  const spentIn = (list, category, month) =>
    r2(list.filter((t) => t.type === 'expense' && t.category === category && t.date.startsWith(month))
      .reduce((s, t) => s + t.amountArs, 0));
  const status = (spent, limit) => (!limit ? 'none' : spent > limit ? 'exceeded' : spent >= limit * 0.8 ? 'warning' : 'ok');

  async function createTransaction(b) {
    const { type, date, note = '' } = b;
    const currency = 'ARS';
    const amount = Number(b.amount);
    if (!['income', 'expense'].includes(type)) throw fail(400, 'Tipo inválido');
    if (!(amount > 0) || !Number.isFinite(amount)) throw fail(400, 'El monto debe ser mayor a 0');

    const category = String(b.category || '').trim();
    if (type === 'income') {
      if (!CATEGORIES.income.includes(category)) throw fail(400, 'Origen de ingreso inválido');
    } else {
      if (!CATEGORIES.expense.includes(category)) throw fail(400, 'Categoría de gasto inválida');
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '') || isNaN(Date.parse(date))) throw fail(400, 'Fecha inválida');
    if (date > today()) throw fail(400, 'No se permiten fechas futuras');

    const amountArs = r2(amount);
    const t = {
      id: crypto.randomUUID(),
      type,
      amount,
      currency,
      rateUsed: 1,
      amountArs,
      category,
      date,
      note: String(note).slice(0, 200),
    };
    await store.insert(t);
    const limit = (await store.budgets())[category];
    const st = type === 'expense' ? status(spentIn(await store.list(), category, date.slice(0, 7)), limit) : 'none';
    return { transaction: t, budgetAlert: st === 'warning' || st === 'exceeded' ? st : null };
  }

  async function deleteTransaction(id) {
    if (!(await store.list()).some((t) => t.id === id)) throw fail(404, 'No existe');
    await store.remove(id);
  }

  async function summary(month) {
    if (!/^\d{4}-\d{2}$/.test(month)) throw fail(400, 'Mes inválido');
    const all = await store.list();
    const budgets = await store.budgets();
    const list = all.filter((t) => t.date.startsWith(month));
    const sum = (ty) => r2(list.filter((t) => t.type === ty).reduce((s, t) => s + t.amountArs, 0));
    const cats = new Set([
      ...list.filter((t) => t.type === 'expense').map((t) => t.category),
      ...Object.keys(budgets),
    ]);
    return {
      month,
      balance: balance(all),
      income: sum('income'),
      expense: sum('expense'),
      categories: [...cats].map((c) => {
        const spent = spentIn(all, c, month);
        const limit = budgets[c] || null;
        return { category: c, spent, limit, status: status(spent, limit) };
      }),
    };
  }

  return http.createServer(async (req, res) => {
    if (frontendUrl) {
      res.setHeader('Access-Control-Allow-Origin', frontendUrl.replace(/\/$/, ''));
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Vary', 'Origin');
    }
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }
    const send = (code, data) => {
      res.writeHead(code, { 'Content-Type': 'application/json' });
      res.end(code === 204 ? '' : JSON.stringify(data));
    };
    try {
      const url = new URL(req.url, 'http://x');
      const p = url.pathname;
      let body = {};
      if (['POST', 'PUT'].includes(req.method)) {
        let raw = '';
        for await (const c of req) raw += c;
        try {
          body = JSON.parse(raw || '{}');
        } catch {
          throw fail(400, 'JSON inválido');
        }
      }
      if (req.method === 'GET' && p === '/api/health') return send(200, { ok: true });
      if (req.method === 'GET' && p === '/api/categories') return send(200, CATEGORIES);
      if (req.method === 'GET' && p === '/api/rates') return send(200, await getRates());
      if (req.method === 'GET' && p === '/api/transactions') return send(200, await store.list());
      if (req.method === 'POST' && p === '/api/transactions') return send(201, await createTransaction(body));
      if (req.method === 'DELETE' && p.startsWith('/api/transactions/')) {
        await deleteTransaction(p.split('/').pop());
        return send(204);
      }
      if (req.method === 'GET' && p === '/api/summary') {
        return send(200, await summary(url.searchParams.get('month') || today().slice(0, 7)));
      }
      if (req.method === 'PUT' && p === '/api/budgets') {
        if (!CATEGORIES.expense.includes(body.category) || !(Number(body.limit) > 0)) {
          throw fail(400, 'Categoría de gasto y límite (>0) obligatorios');
        }
        await store.setBudget(body.category, Number(body.limit));
        return send(200, await store.budgets());
      }
      send(404, { error: 'No encontrado' });
    } catch (e) {
      send(e.status || 500, { error: e.status ? e.message : 'Error interno' });
    }
  });
}