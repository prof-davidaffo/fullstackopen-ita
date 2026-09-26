---
mainImage: ../../../images/part-5.svg
part: 5
letter: f
lang: en
course: sqlite
---

<div class="content">

### Finish the local application first

This is the final chapter of the SQLite core course, after tests, authentication and routing. It takes over the publishing goals originally placed in exercises 3.10 and 3.21. No public hosting is needed for earlier lessons.

Verify CRUD, permissions and tests locally. The test database must be isolated and /api/testing/reset must not exist during normal startup.

### Test a production build locally

Run npm run build in the React project and copy its dist directory to the backend root. Do not copy node_modules. In app.js, after API routers and before the 404 handler, add:

```js
const path = require('node:path')
const frontend = path.join(__dirname, 'dist')
app.use(express.static(frontend))
app.use((request, response, next) => {
  if (request.method === 'GET'
    && !request.path.startsWith('/api')
    && request.accepts('html')) {
    return response.sendFile(path.join(frontend, 'index.html'))
  }
  next()
})
```

The fallback serves index.html for React Router routes but never turns /api errors into HTML. Stop Vite and start the backend: http://localhost:3001 now serves both React and the API. Keep relative Axios URLs and test refreshing a nested route.

### Hosting requirements

You need a Node process and **persistent writable storage** at a stable path. A school server, virtual machine or hosting service with persistent disks can provide this. An ephemeral filesystem recreated on deployment cannot preserve this SQLite database.

GitHub Pages can host the course website and static frontend files, not this Node backend and its persistent SQLite database. Never put notes.db in the public directory.

This setup uses one backend instance. Separate local files on multiple instances do not share data; distributed deployments require a different storage design.

### Production configuration

Prepare Node, a code directory and a separate data directory. Give the service user only the required filesystem permissions. Keep the backend lockfile and install with npm ci --omit=dev.

Configure the service environment:

```text
NODE_ENV=production
PORT=3001
HOST=127.0.0.1
DATABASE_PATH=/persistent/path/notes.db
SECRET=a-random-secret-generated-for-this-server
```

The directory must exist and be outside dist. A same-machine reverse proxy can reach Node on 127.0.0.1. Hosting platforms that route traffic from another interface may require HOST=0.0.0.0 and their assigned PORT.

Start **node index.js** with these environment variables. The local --env-file script is unnecessary when the service already provides its environment. Use a process supervisor or platform-managed service, not an open SSH terminal. Configure HTTPS and add login rate limits and a suitable password policy before public exposure. Do not use real student data in a public demo.

### Deployment and updates

Transfer code, lockfile and build, not the development database or secrets. Startup initializes the schema on persistent storage. Create accounts through the API instead of shipping shared default credentials.

For updates, run tests, build, back up data, apply migrations and restart the service. Do not replace the data directory when replacing code.

### Backup and restore

Copying just the main file while writes are active may produce an inconsistent backup, particularly with WAL. Use the [SQLite backup API](https://www.sqlite.org/backup.html), or stop all writers before making a consistent copy.

Example backup.cjs, with the correct DATABASE_PATH:

```js
const { DatabaseSync, backup } = require('node:sqlite')
const path = require('node:path')
const source = process.env.DATABASE_PATH || path.join(__dirname, 'notes.db')
const destination = process.argv[2]

if (!destination) throw new Error('Specify a new backup file path')
const db = new DatabaseSync(source, { readOnly: true })
backup(db, destination)
  .then(() => console.log('Backup completed'))
  .catch(error => { console.error(error); process.exitCode = 1 })
  .finally(() => db.close())
```

Pass a new destination path in an existing directory, different from the live database. Protect backups as sensitive data, store a copy off-server and test restoration to a separate file. Never overwrite the live database to test a restore.

### Final checks

Verify HTTPS, successful and failed login, CRUD, denied deletion by another user, nested React route refresh and absence of the reset endpoint. Restart and confirm persistence. Keep passwords and tokens out of logs.

</div>
<div class="tasks">

### Final exercise: deployment

Publish a completed app on persistent storage. Document startup, required variables without secret values, updates, backup and restore. Check data after a restart and a redeployment. If no server is available, complete the local production-build test and defer this final activity; the local core course remains usable.
</div>

