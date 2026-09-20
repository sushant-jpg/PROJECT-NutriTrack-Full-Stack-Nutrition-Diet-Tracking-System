# Windows / XAMPP repair record — 19 September 2026

## Findings

- Port 3306 was unoccupied. No competing MySQL/MariaDB Windows service or running `mysqld.exe` was found.
- `C:\xampp\mysql\bin\my.ini` had the correct port, base directory, data directory, and socket settings.
- The last error log ended after socket creation, while `mysqld.dmp` recorded a crash. The original `mysql\db.MAD` actually contained MariaDB diagnostic text and an exception `0x80000003` stack trace, including `my_parameter_handler`, `ucrtbase.dll!abort`, and `_Forced_rehash`.
- `mysqlcheck --all-databases --check` confirmed corruption in the Aria `mysql.db` permissions table. Application database tables checked successfully.
- A normal standalone restart reproduced startup diagnostics being appended into `mysql\db.MAD`. Starting with console mode avoided this. This supports a Windows standard-handle/logging fault in this MariaDB installation; it does not identify an upstream source-code defect with certainty.
- PowerShell resolved `npm` to `C:\Program Files\nodejs\npm.ps1`, but the effective execution policy was `Restricted`. `npm.cmd` avoided the PowerShell script restriction.
- `server/.env` existed but contained the public example JWT secret. Earlier startup without a loaded secret correctly failed the server's length check.
- The existing NutriTrack database had empty legacy users/meals tables: no admins, no meal occurrence/update columns, no user update column, and a UUID meal ID incompatible with the new numeric-ID backend. `CREATE TABLE IF NOT EXISTS` alone could not fix those definitions.

## Backup and recovery

Before any repair, all 206 data files were copied and individually SHA-256 verified:

`C:\xampp\mysql\nutritrack-recovery-20260919-213552`

The backup also contains the original `my.ini` and phpMyAdmin configuration. It contains private database data and should not be committed or shared. No user database folders, `ibdata1`, or InnoDB log files were deleted. XAMPP was not reinstalled.

`REPAIR TABLE mysql.db` reported a wrong CRC and discarded three unreadable permission rows. The originals remain in the backup; those rows were not recoverable by REPAIR. Existing root accounts and global privileges remained intact. phpMyAdmin's control-user permissions were restored from the privileges documented in its installed `sql/create_tables.sql`:

```sql
GRANT SELECT, INSERT, DELETE, UPDATE, ALTER
ON phpmyadmin.* TO 'pma'@'localhost';
```

No speculative grants on other databases were added. The stock XAMPP backup contains test/test-pattern/phpMyAdmin grants, but this does not prove all of the damaged original rows were identical to the stock file.

The only XAMPP configuration edit adds `console` under `[mysqld]`, immediately after `log_error`, keeping Windows standard handles open. This changes diagnostic output to the console; the old `mysql_error.log` may no longer receive new startup messages. To capture diagnostics, start the executable from a terminal with `--console`, or use Windows Application event logs. See MariaDB's [Windows console option documentation](https://mariadb.com/docs/server/server-management/starting-and-stopping-mariadb/mariadbd-options) and [REPAIR TABLE documentation](https://mariadb.com/docs/server/reference/sql-statements/table-statements/repair-table).

MySQL was started using the **MySQL Start button in the existing XAMPP Control Panel** after the fix. It listened on port 3306, stayed running during application testing, and subsequent checks of all databases passed.

## Environment and application fixes

- `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force`; all other policy scopes remained Undefined. A fresh user PowerShell process successfully ran `npm -v` and `node -v`. The agent sandbox has its own restricted identity/policy, so verification of normal npm was performed under the actual user account.
- Generated a 48-byte cryptographically random JWT secret (96 hexadecimal characters) in ignored `server/.env`.
- Generated a separate local administrator password in `ADMIN_INITIAL_PASSWORD`, then provisioned `admin` using bcrypt. Read it locally from `server/.env`; it is deliberately absent from logs and this document. Remove the provisioning password after recording it securely if you no longer need the local workflow test.
- Added explicit `.gitignore` entries for `server/.env`, `client/.env`, and `.local/`.
- Added `server/database/setup.js` and `npm run db:setup` to adapt the empty legacy schema without dropping tables.
- Added a MySQL session registry and server-side logout revocation. Verification found that cookie clearing alone left copied JWTs usable.
- Fixed the report switch renderer to use the loaded report's period while a new request is pending. Browser testing exposed a daily-to-weekly transition crash caused by rendering a daily payload as a weekly series.
- Added `server/tests/workflows.js` and `npm run test:workflows` for repeatable API/MySQL checks.
- Ensured the startup connection check releases its pool connection even when its query fails.

## Main commands used

Read-only diagnostics:

```powershell
Get-NetTCPConnection -LocalPort 3306 -ErrorAction SilentlyContinue
netstat -ano
Get-CimInstance Win32_Service
Get-Process mysqld -ErrorAction SilentlyContinue
Get-Content C:\xampp\mysql\data\mysql_error.log
Get-Content C:\xampp\mysql\bin\my.ini
Get-ExecutionPolicy
Get-ExecutionPolicy -List
Get-Command npm
```

Database diagnostics and repair (only after the verified backup):

```powershell
& C:\xampp\mysql\bin\mysqld.exe --defaults-file=C:\xampp\mysql\bin\my.ini --standalone --console
& C:\xampp\mysql\bin\mysqlcheck.exe -u root --all-databases --check
& C:\xampp\mysql\bin\mysql.exe -u root --execute="REPAIR TABLE mysql.db; CHECK TABLE mysql.db EXTENDED; FLUSH PRIVILEGES;"
& C:\xampp\mysql\bin\mysqladmin.exe -u root shutdown
& C:\xampp\mysql\bin\mysqladmin.exe -u root ping
& C:\xampp\mysql\bin\mysqladmin.exe -u root status
```

Application commands, from the appropriate project folder:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
# Open a fresh PowerShell window:
npm -v
node -v
# server:
npm run db:setup
npm run seed:admin
npm run dev
npm run test:workflows
# client (second terminal):
npm run dev -- --strictPort
npm run build
```

## Local URLs and credentials

| Component | Address |
| --- | --- |
| XAMPP MySQL/MariaDB | `127.0.0.1:3306` |
| Database | `nutritrack`, local XAMPP `root`, blank database password |
| Backend | http://localhost:5000/api/health |
| Frontend | http://localhost:5173 |
| phpMyAdmin | http://localhost/phpmyadmin/ |
| Administrator sign-in | http://localhost:5173/admin/login |

The frontend uses `/api` through Vite's proxy to Express. Only the backend uses `mysql2`; database credentials and password hashes are never returned to React. CORS explicitly accepts `http://localhost:5173` with credentials.

The development servers were started in hidden user PowerShell processes. Their output is in `.local/server.stdout.log`, `.local/server.stderr.log`, `.local/client.stdout.log`, and `.local/client.stderr.log`. Avoid launching a second copy on the same ports.

## Verification results

- API/MySQL workflow checks passed: signup, login, bcrypt cost 12, HttpOnly/SameSite cookie, CORS, user/admin role separation, owned meal CRUD, direct persisted INSERT/UPDATE/DELETE assertions, daily/weekly/monthly reports, missing-day zeros, pagination/search, admin statistics/activity, goal changes, inactive-account blocking, reactivation, logout and copied-cookie rejection, and clean JSON errors.
- Headless Microsoft Edge checks passed through the React UI: signup/login, meal creation/edit/deletion with database assertions, daily/weekly/monthly chart navigation, mobile menu and page width, admin overview/activity/users, edited goals, deactivation/reactivation, and logout. No uncaught React errors were recorded.
- phpMyAdmin loaded successfully in Edge, connected without control-user errors, and displayed users, meals, admins, and sessions in `nutritrack`.
- `npm run build` passed under the corrected user PowerShell policy.
- All user databases passed the final `mysqlcheck --all-databases --check` run. Foreign keys, primary keys, unique constraints, and report/filter indexes were queried from `information_schema`.
- Test users and their meals were removed by exact fixture identifiers; the provisioned local admin remains. No existing user records were deleted.

Local browser verification script: `.local/browser-workflows.cjs`. Screenshots: `.local/landing-desktop.png`, `.local/dashboard-desktop.png`, `.local/dashboard-mobile.png`, `.local/admin-users.png`, and `.local/phpmyadmin.png`. These files are ignored by Git.
