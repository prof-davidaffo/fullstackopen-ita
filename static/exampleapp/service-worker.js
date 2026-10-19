var CACHE_NAME = 'fullstackopen-exampleapp-v1'
var MAX_NOTES = 100
var INITIAL_NOTES = [
  {
    content: 'HTML is easy',
    date: '2019-05-23T17:30:31.098Z',
  },
  {
    content: 'Browser can execute only JavaScript',
    date: '2019-05-23T18:39:34.091Z',
  },
  {
    content: 'Most important methods of HTTP protocol are GET and POST',
    date: '2019-05-23T19:20:14.298Z',
  },
]

self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

function baseUrl() {
  return self.registration.scope
}

function stateRequest() {
  return new Request(new URL('__notes__.json', baseUrl()).href)
}

async function readNotes() {
  var cache = await caches.open(CACHE_NAME)
  var stored = await cache.match(stateRequest())
  return stored ? stored.json() : INITIAL_NOTES.slice()
}

async function writeNotes(notes) {
  var cache = await caches.open(CACHE_NAME)
  await cache.put(
    stateRequest(),
    new Response(JSON.stringify(notes), {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  )
}

function jsonResponse(value, status) {
  return new Response(JSON.stringify(value), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function frontPageResponse(noteCount) {
  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Full stack example app</title>
  </head>
  <body>
    <div class="container">
      <h1>Full stack example app</h1>
      <p>number of notes created ${noteCount}</p>
      <a href="notes/">notes</a>
      <img src="kuva.png" width="200" alt="example">
    </div>
  </body>
</html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

async function addNote(note) {
  if (!note || typeof note.content !== 'string') return false

  var notes = await readNotes()
  notes.push({
    content: note.content.substring(0, 200),
    date: new Date(note.date || Date.now()).toISOString(),
  })

  if (notes.length > MAX_NOTES) notes.shift()
  await writeNotes(notes)
  return true
}

async function handleRequest(request, route) {
  if (request.method === 'GET' && route === '') {
    return frontPageResponse((await readNotes()).length)
  }

  if (request.method === 'GET' && route === 'data.json') {
    return jsonResponse(await readNotes())
  }

  if (request.method === 'GET' && route === 'reset') {
    await writeNotes(INITIAL_NOTES.slice())
    return jsonResponse({ message: 'notes reset' }, 201)
  }

  if (request.method === 'POST' && route === 'new_note') {
    var form = await request.formData()
    await addNote({ content: form.get('note'), date: new Date() })
    return Response.redirect(new URL('notes/', baseUrl()).href, 302)
  }

  if (request.method === 'POST' && route === 'new_note_spa') {
    var note = await request.json()
    var created = await addNote(note)
    return created
      ? jsonResponse({ message: 'note created' }, 201)
      : jsonResponse({ message: 'invalid note' }, 400)
  }

  return fetch(request)
}

self.addEventListener('fetch', function (event) {
  var requestUrl = new URL(event.request.url)
  var scopePath = new URL(baseUrl()).pathname

  if (!requestUrl.pathname.startsWith(scopePath)) return

  var route = requestUrl.pathname.slice(scopePath.length).replace(/\/$/, '')
  event.respondWith(handleRequest(event.request, route))
})
