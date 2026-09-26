---
mainImage: ../../../images/part-4.svg
part: 4
letter: b
lang: it
course: sqlite
---

<div class="content">

### Un database isolato per i test

Non svuotare mai il database usato a lezione. Il nostro db.js usa :memory: quando NODE_ENV è test: ogni processo ottiene un database nuovo, che scompare alla chiusura. DBeaver non può aprire questo database in memoria, perché non esiste un file.

Per impostare l'ambiente in modo uguale su Windows, macOS e Linux crea test-env.cjs:

```js
process.env.NODE_ENV = 'test'
```

Installa Supertest come dipendenza di sviluppo e aggiungi lo script:

```bash
npm install --save-dev supertest
```

```json
"test": "node --require ./test-env.cjs --test"
```

### Test di integrazione delle API

Crea tests/notes.test.js:

```js
const { test, beforeEach, after } = require('node:test')
const assert = require('node:assert/strict')
const supertest = require('supertest')
const app = require('../app')
const db = require('../db')
const Note = require('../models/note')
const api = supertest(app)

beforeEach(() => {
  db.exec('DELETE FROM notes')
  Note.create({ content: 'Una nota iniziale', important: true })
})

test('notes are returned as JSON', async () => {
  const response = await api.get('/api/notes')
    .expect(200).expect('Content-Type', /json/)
  assert.equal(response.body.length, 1)
  assert.equal(typeof response.body[0].id, 'string')
  assert.equal(response.body[0].important, true)
})

test('a valid note can be added', async () => {
  await api.post('/api/notes')
    .send({ content: 'Una nuova nota', important: false })
    .expect(201)
  assert.equal(Note.all().length, 2)
})

test('invalid input is rejected without changing the database', async () => {
  await api.post('/api/notes').send({ content: 'x' }).expect(400)
  assert.equal(Note.all().length, 1)
})

test('unknown notes return 404', async () => {
  await api.get('/api/notes/nonexistent').expect(404)
})

after(() => db.close())
```

Ogni test prepara i propri dati. Non attivare concorrenza fra test che condividono la stessa connessione. Con l'introduzione dell'autenticazione aggiornerai il setup creando un utente e facendo login prima delle richieste protette.

### Async e await

Le query DatabaseSync sono sincrone e non richiedono await. Le richieste HTTP di Supertest, il confronto delle password e altre operazioni asincrone sì. Un test deve attendere la richiesta per verificare davvero il risultato: non lasciare Promise non attese.

### Transazioni

Quando più scritture devono riuscire insieme, usa una transazione:

```js
db.exec('BEGIN')
try {
  // Esegui qui le scritture SQL correlate, senza await.
  db.exec('COMMIT')
} catch (error) {
  db.exec('ROLLBACK')
  throw error
}
```

Una transazione lasciata aperta può bloccare altre connessioni, compreso DBeaver. Tienila breve e ripristinala sempre in caso di errore.

</div>
<div class="tasks">

### Esercizi 4.8–4.14

#### 4.8: Test della lista di blog, passo 1
Testa GET /api/blogs: JSON, codice 200 e numero di elementi previsto. Prepara i dati nel database in memoria.

#### 4.9: Test della lista di blog, passo 2
Verifica che l'identificatore sia la proprietà id e sia una stringa. Non esporre dettagli interni del database.

#### 4.10: Test della lista di blog, passo 3
Testa POST /api/blogs: un blog valido viene salvato, il numero aumenta di uno e i campi sono corretti.

#### 4.11*: Test della lista di blog, passo 4
Se likes manca, il backend deve impostarlo a 0. Aggiungi un test.

#### 4.12*: Test della lista di blog, passo 5
Se title oppure url mancano, restituisci 400 e non inserire righe. Verifica entrambi i casi.

#### 4.13: Estendere la lista di blog, passo 1
Implementa e testa DELETE /api/blogs/:id. Il database deve perdere soltanto il blog richiesto.

#### 4.14: Estendere la lista di blog, passo 2
Implementa e testa PUT /api/blogs/:id, compreso l'aggiornamento dei like. Rifiuta conteggi negativi o non interi.
</div>

