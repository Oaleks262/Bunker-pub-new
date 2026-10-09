import {execute} from '../lib/database.mjs';
for(const table of ['menu_edits','banners','pub_posts'])await execute(`CREATE TABLE IF NOT EXISTS ${table}(id TEXT PRIMARY KEY,payload TEXT NOT NULL)`);
await execute('CREATE TABLE IF NOT EXISTS login_limits(id TEXT PRIMARY KEY,window INTEGER NOT NULL,attempts INTEGER NOT NULL)');
console.log('База готова. Меню завантажується з початкових даних; зміни зберігаються в Turso.');
