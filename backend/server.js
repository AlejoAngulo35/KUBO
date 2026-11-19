import { createApp } from './app.js';
import { fileStore, pgStore } from './store.js';
const store = process.env.DATABASE_URL ? await pgStore(process.env.DATABASE_URL) : fileStore(process.env.DATA_FILE || 'data.json');
const port = process.env.PORT || 3000;
createApp({ store }).listen(port, () => console.log(`API en http://localhost:${port}`));
