# Бункер Паб — версія для Vercel

Повний сайт на Next.js 16 / React 19. Меню, список вибраного без онлайн-замовлення, рекламні банери, акції, події та приватна адмінка. Серверні зміни зберігаються в зовнішній базі Turso, а список гостя — на його пристрої.

## 1. Завантажити код у GitHub

Розпакуйте архів. Завантажте **вміст** папки в корінь репозиторію https://github.com/Oaleks262/Bunker-pub-new — `package.json`, `app`, `lib`, `public`, `scripts` повинні бути в корені.

Це заміна попередньої Sites/Cloudflare версії. Якщо вона вже завантажена, видаліть попередні файли `wrangler*`, `vite.config.*`, `pnpm-lock.yaml`, `.openai`, старі `scripts`, `components` та старий `app/chatgpt-auth.ts`, потім завантажте цей комплект. Не додавайте `node_modules`, `.next`, `.env.local` чи ключі до GitHub.

## 2. Створити базу

1. Відкрийте https://turso.tech і створіть базу даних.
2. Скопіюйте Database URL та створіть токен з правом запису.
3. У SQL-консолі бази виконайте весь вміст `database.sql`.

Меню вже включено в код. До бази записуються тільки зміни, нові страви, банери та публікації. Попередні зміни з Cloudflare D1 автоматично не переносяться.

Альтернатива через Turso CLI:

```bash
turso db create bunker-pub
turso db show bunker-pub --url
turso db tokens create bunker-pub
turso db shell bunker-pub < database.sql
```

## 3. Створити пароль і секрет

На комп'ютері потрібен Node.js 22 або 24. У терміналі папки проєкту виконайте:

```bash
npm run setup:admin
```

Введіть власний пароль від 12 символів. Скрипт надрукує два значення: `ADMIN_PASSWORD_HASH` та `SESSION_SECRET`. Пароль вводиться видимо в локальному терміналі. Не публікуйте ці значення.

## 4. Запустити на Vercel

1. https://vercel.com → Add New → Project → імпортуйте `Bunker-pub-new`.
2. Framework Preset: **Next.js**, Root Directory: корінь репозиторію, Node.js: **22.x** або **24.x**. Build Command: `npm run build`. Output Directory залиште стандартним.
3. Додайте чотири Environment Variables для Production:

| Назва | Значення |
| --- | --- |
| `TURSO_DATABASE_URL` | URL бази Turso, наприклад `libsql://...turso.io` |
| `TURSO_AUTH_TOKEN` | Токен Turso з правом запису |
| `ADMIN_PASSWORD_HASH` | Повний рядок `scrypt:...` зі скрипта |
| `SESSION_SECRET` | Секрет зі скрипта |

4. Натисніть Deploy. Якщо змінюєте змінні після запуску, виконайте Redeploy.
5. Адмінка: `https://ВАШ-САЙТ/admin`. Увійдіть паролем, створеним у кроці 3. Посилання на адмінку в гостьовому меню приховане.

Не додавайте префікс `NEXT_PUBLIC_` до секретів. Для Preview краще створити окрему базу і секрети, щоб тестові зміни не потрапляли в робоче меню.

## Локальний запуск

```bash
npm ci
```

Створіть `.env.local` за прикладом `.env.example` і заповніть чотири змінні. Потім:

```bash
npm run db:migrate
npm run dev
```

## Перевірки та обмеження

```bash
npm run typecheck
npm test
npm run build
```

Перевірені production-збірка, серверні обробники з підставленим сховищем і адаптер Turso з локальною SQL-базою, що імітує його HTTP-протокол. Реальний Turso і Vercel потрібно перевірити після додавання ваших ключів: змініть ціну в адмінці, перезавантажте меню та перевірте збереження.

Адмінка використовує один пароль для персоналу. Сесія діє 8 годин, підписана та зберігається в HttpOnly/SameSite cookie. Зміна хешу пароля або секрету завершує старі сесії. Вхід має обмеження спроб; сервер перевіряє доступ і Origin під час запису. Розмежування ролей та історія змін не включені.

При зміні пароля повторно запустіть `npm run setup:admin`, оновіть два секрети Vercel і зробіть Redeploy.

Офіційні інструкції: https://vercel.com/docs/git, https://vercel.com/docs/environment-variables, https://docs.turso.tech/cli/db/shell.
