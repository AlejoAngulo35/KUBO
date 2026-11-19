import fs from 'node:fs';

// Almacenamiento en archivo (local y tests)
export function fileStore(file = 'data.json') {
  let db = { transactions: [], budgets: {}, rates: null };
  if (fs.existsSync(file)) db = JSON.parse(fs.readFileSync(file, 'utf8'));
  const save = () => fs.writeFileSync(file, JSON.stringify(db));
  return {
    async list() { return [...db.transactions].sort((a, b) => b.date.localeCompare(a.date)); },
    async insert(t) { db.transactions.push(t); save(); },
    async remove(id) { db.transactions = db.transactions.filter((t) => t.id !== id); save(); },
    async budgets() { return { ...db.budgets }; },
    async setBudget(c, l) { db.budgets[c] = l; save(); },
    async getRates() { return db.rates; },
    async setRates(r) { db.rates = r; save(); },
  };
}

// Almacenamiento en PostgreSQL (Neon)
export async function pgStore(url) {
  const { default: pg } = await import('pg');
  const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await pool.query(`
    create table if not exists transactions(id text primary key, type text not null, amount numeric not null,
      currency text not null, rate_used numeric not null, amount_ars numeric not null,
      category text not null, date text not null, note text not null default '');
    create table if not exists budgets(category text primary key, lim numeric not null);
    create table if not exists rates(id int primary key, date text not null, rates jsonb not null);`);
  const row = (r) => ({ id: r.id, type: r.type, amount: +r.amount, currency: r.currency, rateUsed: +r.rate_used,
    amountArs: +r.amount_ars, category: r.category, date: r.date, note: r.note });
  return {
    async list() { return (await pool.query('select * from transactions order by date desc')).rows.map(row); },
    async insert(t) {
      await pool.query('insert into transactions values($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [t.id, t.type, t.amount, t.currency, t.rateUsed, t.amountArs, t.category, t.date, t.note]);
    },
    async remove(id) { await pool.query('delete from transactions where id=$1', [id]); },
    async budgets() {
      const o = {}; (await pool.query('select * from budgets')).rows.forEach((r) => (o[r.category] = +r.lim)); return o;
    },
    async setBudget(c, l) {
      await pool.query('insert into budgets values($1,$2) on conflict (category) do update set lim=$2', [c, l]);
    },
    async getRates() {
      const r = (await pool.query('select * from rates where id=1')).rows[0];
      return r ? { date: r.date, rates: r.rates } : null;
    },
    async setRates(v) {
      await pool.query('insert into rates values(1,$1,$2) on conflict (id) do update set date=$1, rates=$2', [v.date, JSON.stringify(v.rates)]);
    },
  };
}
