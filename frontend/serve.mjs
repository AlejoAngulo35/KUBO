// Servidor estático local para desarrollo: node serve.mjs  ->  http://localhost:5173
import http from 'node:http'; import fs from 'node:fs';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript' };
http.createServer((req, res) => {
  const f = req.url === '/config.js' ? 'config.js' : 'index.html';
  res.writeHead(200, { 'Content-Type': types[f.slice(f.lastIndexOf('.'))] }); res.end(fs.readFileSync(f));
}).listen(5173, () => console.log('http://localhost:5173'));
