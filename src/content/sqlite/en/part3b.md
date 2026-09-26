---
mainImage: ../../../images/part-3.svg
part: 3
letter: b
lang: en
course: sqlite
---

<div class="content">

### Local development

Run the Part 3a backend on port 3001 and the Vite frontend on port 5173 in separate terminals. Both run locally; no public server is required.

### Same origin policy and CORS

An origin includes protocol, host and port. The two development servers therefore have different origins. CORS lets a server allow cross-origin browser requests, but is not authentication or authorization. We use a development proxy instead. If you use direct cross-origin requests, explicitly allow your frontend origin in the backend.

### Proxy

Update the frontend's vite.config.js:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3001' } }
})
```

Restart Vite. Use /api/notes as the Axios base URL, rather than the old JSON Server address. The browser requests the same origin and Vite forwards API requests to Express. The proxy only exists in development; it is not included in the production build.

### Check the integration

Open http://localhost:3001/api/notes first, then http://localhost:5173/api/notes, then the frontend. If only the first works, check the proxy and restart Vite. Inspect request URLs, bodies and responses in the browser Network tab.

### Production build

A React production build consists of static files. In the final deployment chapter we will serve them with Express and then publish the complete application. For now keep the two local development processes.

</div>
<div class="tasks">

### Exercises 3.9–3.11

#### 3.9: Phonebook backend, step 9
Connect the phonebook frontend to the local backend using /api/persons and the Vite proxy.

#### 3.10: Local startup
Define backend start and dev scripts and document how to run both projects. This replaces early deployment, which is deferred until the end of Part 5.

#### 3.11: Local full stack phonebook
Verify reading, creating and deleting people through the browser. Data is still in memory; the next chapter makes it persistent.
</div>

