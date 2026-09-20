# NutriTrack

NutriTrack is a full-stack nutrition and meal tracking application. Users manually record the nutrition values for a complete serving, review daily goals, edit their own meal history, and explore daily, weekly, and monthly reports. A separate administrator workspace provides system statistics, meal activity, account controls, and nutrition-goal management.

> NutriTrack is a record-keeping tool. Its default goals are application defaults, not medical recommendations, and the application does not diagnose users.

## Features

### User workspace

- Account signup and username/email login
- HttpOnly cookie authentication
- Date navigation and Nepal-friendly date/time display
- Calories, protein, carbohydrates, and fat progress
- Breakfast, lunch, dinner, and snack logging
- Meal create, read, update, and delete workflows
- Daily meal-type breakdown
- Monday-to-Sunday weekly reports
- Calendar-month reports with zero-value missing days
- Paginated meal history and responsive tables

### Administrator workspace

- Separate administrator authentication and protected routes
- Registered-user, active-user, current-day meal, and weekly signup statistics
- Paginated user search and Active/Inactive filtering
- User profile, allocation, status, and goal editing
- Paginated meal activity search with date and meal-type filters
- Immediate protected-route blocking for inactive users

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, React Router, Axios, Chart.js, CSS3, Vite |
| Backend | Node.js, Express.js, REST API |
| Database | MySQL/MariaDB through XAMPP, `mysql2/promise` |
| Security | bcrypt, JWT HttpOnly cookies, Helmet, CORS, rate limiting |

The data path is always:

```text
React (localhost:5173)
        ↓ REST API
Express (localhost:5000)
        ↓ mysql2/promise
MySQL/MariaDB (localhost:3306, XAMPP)
```

React never connects directly to MySQL.

## Project structure

```text
.
├── client/
│   ├── src/
│   │   ├── components/       Reusable UI and dashboard modules
│   │   ├── context/          Authentication and toast contexts
│   │   ├── pages/            Route-level pages
│   │   ├── services/         Axios API functions
│   │   ├── utils/            Date helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── config/               MySQL connection pool
│   ├── controllers/          Request handlers and database operations
│   ├── database/             SQL schema and admin provisioning script
│   ├── middleware/           Authentication, validation, errors
│   ├── routes/               REST route definitions
│   ├── utils/                Shared backend helpers
│   ├── app.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── README.md
```

## Requirements

- XAMPP with MySQL/MariaDB
- Node.js 18 or newer
- npm 9 or newer
- A current web browser

## XAMPP and database setup

1. Open the XAMPP Control Panel.
2. Start **MySQL**.
3. Start **Apache** only if you need phpMyAdmin.
4. Open [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
5. Choose **Import** and import [`server/database/schema.sql`](server/database/schema.sql).

The SQL file creates the `nutritrack` database, the users/meals/admins/session tables, primary and foreign keys, unique constraints, useful indexes, and default nutrition goals. You do not need to create the tables manually.

For an existing database, back it up first. From `server`, run `npm run db:setup` to import the schema and adapt the older **empty** NutriTrack meal table. The setup script refuses to convert populated legacy UUID meal tables or invent missing occurrence dates. Importing `schema.sql` alone does not change existing table definitions.

If XAMPP MySQL uses a non-default port, update `DB_PORT` in the backend environment file.

## Backend setup

From the project root:

```bash
cd server
npm install
```

Copy `.env.example` to `.env`. On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Set a long random `JWT_SECRET`. A typical local XAMPP configuration is:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=nutritrack
DB_TIMEZONE=+05:45
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace_with_a_long_random_value_of_at_least_32_characters
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

If your XAMPP root account has a password, set it in `DB_PASSWORD`.

Start the API:

```bash
npm run dev
```

The API runs at [http://localhost:5000](http://localhost:5000). Its health endpoint is [http://localhost:5000/api/health](http://localhost:5000/api/health). If MySQL is stopped, startup prints a clear XAMPP connection message.

## Create a development administrator

Normal signup cannot create administrators. Add these temporary values to `server/.env`:

```env
ADMIN_USERNAME=admin
ADMIN_INITIAL_PASSWORD=use-a-development-password-with-12-characters
```

With MySQL running and the schema imported, run:

```bash
npm run seed:admin
```

The script bcrypt-hashes the password and safely inserts or updates that administrator. Remove `ADMIN_INITIAL_PASSWORD` from `.env` afterward. Never place a plaintext password in `schema.sql` or React code.

## Frontend setup

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` to the Express server during local development. You may instead set `VITE_API_URL` when deploying the frontend separately.

## API overview

### Authentication

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create a normal user |
| POST | `/api/auth/login` | User login by username or email |
| POST | `/api/auth/admin-login` | Separate administrator login |
| POST | `/api/auth/logout` | Revoke the session and clear its cookie |
| GET | `/api/auth/me` | Current active user |
| GET | `/api/auth/admin-me` | Current administrator |

### Meals and reports

| Method | Route | Purpose |
| --- | --- | --- |
| GET/POST | `/api/meals` | Paginated user meals / add meal |
| GET/PUT/DELETE | `/api/meals/:id` | Read, edit, or delete an owned meal |
| GET | `/api/reports?date=YYYY-MM-DD&period=daily` | Daily report |
| GET | `/api/reports?date=YYYY-MM-DD&period=weekly` | Monday-Sunday report |
| GET | `/api/reports?date=YYYY-MM-DD&period=monthly` | Calendar-month report |

### Administration

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/admin/stats` | Server-calculated platform statistics |
| GET | `/api/admin/users` | Search/filter/paginate users |
| GET/PUT | `/api/admin/users/:id` | Read or update a user |
| GET | `/api/admin/meals` | Search/filter/paginate all meal activity |

Successful list responses include `page`, `limit`, `total`, and `pages` pagination metadata.

## Security notes

- Passwords are hashed with bcrypt using 12 rounds.
- JWTs are stored in an HttpOnly, `SameSite=Lax` cookie and are never saved in localStorage.
- Each JWT has a MySQL-backed session ID. Logout removes that session, so replaying the old cookie is rejected.
- Production cookies use the `Secure` flag when `NODE_ENV=production`.
- Every meal query takes the user identity from verified authentication, never from React input.
- Active user status is checked against MySQL on every protected request.
- Administrator middleware requires an administrator-role token and an existing admin record.
- SQL values use `mysql2` placeholders; no user input is interpolated into SQL.
- Login and signup endpoints are rate-limited.
- Helmet, explicit CORS origin configuration, request size limits, backend validation, and centralized error handling are enabled.
- Password hashes, secrets, and database credentials are never returned by the API.

## Automated workflow verification

With MySQL and the backend running, and local `ADMIN_USERNAME` / `ADMIN_INITIAL_PASSWORD` configured:

```bash
cd server
npm run test:workflows
```

This test creates uniquely named verification users in the configured database, exercises the running HTTP API, checks meal writes directly in MySQL, checks account authorization and reports, and verifies logout rejects a copied cookie. It removes only its own test users and meals afterward. It never drops a database. Use a development database, not production.

The September 2026 Windows/XAMPP repair and verification details are in [docs/windows-repair.md](docs/windows-repair.md).

## Manual workflow test

After both servers and MySQL are running:

1. Sign up, log out, and log in with either username or email.
2. Add breakfast and lunch, then check dashboard totals.
3. Edit a meal, verify totals, delete it, and verify its removal.
4. Change dates and inspect daily, weekly, and monthly reports.
5. Provision an administrator and log in at `/admin/login`.
6. Review statistics, users, and meal activity.
7. Change a user’s goals and confirm the user dashboard reflects them after a new session.
8. Deactivate the user and confirm protected access/login is blocked.
9. Reactivate the user and confirm login works again.

## Screenshots

Add project screenshots here after running the application locally:

- Landing page
- User overview and meal form
- Weekly/monthly reports
- Administrator user management

## Known limitations

- Food and nutrition values are entered manually; there is no food database lookup or AI recognition.
- NutriTrack does not provide medical advice or individualized clinical targets.
- The current authentication model supports one active session cookie per browser profile. Switching between admin and user accounts replaces the current cookie.
- The checked-in API workflow test requires running local services and development admin credentials. Browser verification tooling and screenshots from the repair are kept in the ignored `.local` folder.
