---
mainImage: ../../../images/part-4.svg
part: 4
letter: b
lang: it
---

<div class="content">

Iniziamo ora a scrivere i test per il backend. Poiché il backend non contiene logica complessa, non avrebbe molto senso sottoporlo a [test unitari](https://it.wikipedia.org/wiki/Unit_testing). L'unico possibile oggetto di un test unitario sarebbe il metodo _toJSON_ usato per formattare le note.

In alcuni casi può essere utile simulare il database in parte dei test del backend, anziché utilizzarne uno reale. Una libreria adatta allo scopo è [mongodb-memory-server](https://github.com/nodkz/mongodb-memory-server).

Dato che il backend è ancora relativamente semplice, testeremo l'intera applicazione attraverso la sua API REST, includendo così anche il database. Questo tipo di verifica, nella quale più componenti del sistema vengono controllati insieme, è chiamato [test di integrazione](https://it.wikipedia.org/wiki/Test_d%27integrazione).

### Ambiente di test

In un capitolo precedente abbiamo detto che, quando il server backend è in esecuzione su Fly.io o Render, si trova in modalità <i>production</i>.

In Node si usa per convenzione la variabile d'ambiente <i>NODE\_ENV</i> per definire la modalità di esecuzione dell'applicazione. Nell'applicazione attuale carichiamo le variabili definite nel file <i>.env</i> soltanto quando non siamo in modalità <i>production</i>.

È pratica comune definire modalità separate per sviluppo e test.

Modifichiamo gli script nel file <i>package.json</i> dell'applicazione affinché, durante i test, <i>NODE\_ENV</i> assuma il valore <i>test</i>:

```json
{
  // ...
  "scripts": {
    "start": "NODE_ENV=production node index.js", // highlight-line
    "dev": "NODE_ENV=development node --watch index.js", // highlight-line
    "test": "NODE_ENV=test node --test", // highlight-line
    "lint": "eslint ."
  }
  // ...
}
```

Nello script _npm run dev_ abbiamo impostato la modalità <i>development</i>; il comando predefinito _npm start_ imposta invece la modalità <i>production</i>.

Questa sintassi presenta un piccolo problema: non funziona su Windows. Possiamo risolverlo installando [cross-env](https://www.npmjs.com/package/cross-env) come dipendenza del progetto:

```bash
npm install cross-env
```

Possiamo quindi rendere gli script npm di <i>package.json</i> compatibili con tutti i sistemi operativi usando cross-env:

```json
{
  // ...
  "scripts": {
    "start": "cross-env NODE_ENV=production node index.js", // highlight-line
    "dev": "cross-env NODE_ENV=development node --watch index.js", // highlight-line
    "test": "cross-env  NODE_ENV=test node --test", // highlight-line
    "lint": "eslint ."
  },
  // ...
}
```


Ora possiamo modificare il comportamento dell'applicazione nelle diverse modalità. Per esempio, durante i test possiamo utilizzare un database separato.

Possiamo creare il database di test separato su MongoDB Atlas. Non è però una soluzione ottimale quando più persone sviluppano la stessa applicazione: l'esecuzione dei test richiede in genere un'istanza del database che non sia utilizzata contemporaneamente da altri test.

Sarebbe preferibile eseguire i test con un database installato sulla macchina dello sviluppatore. La soluzione ideale prevede un database distinto per ogni esecuzione dei test; è «relativamente semplice» ottenerla eseguendo [Mongo in memoria](https://docs.mongodb.com/manual/core/inmemory/) oppure usando container [Docker](https://www.docker.com). Per ora non complichiamo le cose e continuiamo a usare MongoDB Atlas.

Modifichiamo il modulo di configurazione dell'applicazione, _utils/config.js_:

```js
require('dotenv').config()

const PORT = process.env.PORT

// highlight-start
const MONGODB_URI = process.env.NODE_ENV === 'test' 
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI
// highlight-end

module.exports = {
  MONGODB_URI,
  PORT
}
```

Il file <i>.env</i> contiene <i>variabili separate</i> per gli indirizzi dei database di sviluppo e di test:

```bash
MONGODB_URI=mongodb+srv://fullstack:thepasswordishere@cluster0.a5qfl.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0
PORT=3001

// highlight-start
TEST_MONGODB_URI=mongodb+srv://fullstack:thepasswordishere@cluster0.a5qfl.mongodb.net/testNoteApp?retryWrites=true&w=majority&appName=Cluster0
// highlight-end
```

Il modulo _config_ appena realizzato ricorda in parte il pacchetto [node-config](https://github.com/lorenwest/node-config). Una soluzione autonoma è giustificata dalla semplicità dell'applicazione e ci permette inoltre di imparare concetti utili.

Queste sono le sole modifiche necessarie al codice dell'applicazione.

Il codice completo dell'applicazione si trova nel branch <i>part4-2</i> di [questo repository GitHub](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part4-2).

### supertest

Utilizziamo il pacchetto [supertest](https://github.com/visionmedia/supertest) per scrivere i test dell'API.

Installiamolo come dipendenza di sviluppo:

```bash
npm install --save-dev supertest
```

Scriviamo il primo test nel file <i>tests/note_api.test.js</i>:

```js
const { test, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

after(async () => {
  await mongoose.connection.close()
})
```

Il test importa l'applicazione Express dal modulo <i>app.js</i> e la passa alla funzione <i>supertest</i>, ottenendo un oggetto [superagent](https://github.com/visionmedia/superagent). L'oggetto viene assegnato alla variabile <i>api</i> e permette ai test di inviare richieste HTTP al backend.

Il test invia una richiesta HTTP GET all'URL <i>api/notes</i> e verifica che la risposta abbia codice di stato 200. Controlla inoltre che l'header <i>Content-Type</i> contenga <i>application/json</i>, indicando il formato desiderato.

Il controllo dell'header usa una sintassi che può sembrare insolita:

```js
.expect('Content-Type', /application\/json/)
```

Il valore desiderato è definito come [espressione regolare](https://developer.mozilla.org/it/docs/Web/JavaScript/Guide/Regular_expressions), o regex. Una regex inizia e termina con una barra `/`; poiché anche <i>application/json</i> ne contiene una, questa viene preceduta da `\` per non essere interpretata come il carattere di chiusura dell'espressione.

In linea di principio, il valore avrebbe potuto essere definito anche come stringa:

```js
.expect('Content-Type', 'application/json')
```

Con una stringa, però, il valore dell'header dovrebbe corrispondere esattamente. La regex richiede invece soltanto che l'header <i>contenga</i> la stringa indicata. Il valore reale è <i>application/json; charset=utf-8</i> e comprende anche la codifica dei caratteri, che al test non interessa; una regex è quindi preferibile a una stringa esatta.

Il test contiene dettagli che esamineremo [tra poco](/it/part4/testare_il_backend#async-await). La funzione freccia è preceduta dalla parola chiave <i>async</i> e la chiamata al metodo dell'oggetto <i>api</i> da <i>await</i>. Per ora è sufficiente sapere che gli esempi funzionano. Questa sintassi è legata alla natura <i>asincrona</i> delle richieste all'API e consente di scrivere codice asincrono con l'aspetto di codice sincrono.

Al termine di tutti i test, al momento uno solo, dobbiamo chiudere la connessione al database usata da Mongoose; altrimenti il processo non termina. Possiamo farlo con il metodo [after](https://nodejs.org/api/test.html#afterfn-options):

```js
after(async () => {
  await mongoose.connection.close()
})
```

Un dettaglio piccolo ma importante: all'[inizio](/it/part4/struttura_del_backend_e_introduzione_ai_test#struttura-del-progetto) di questa parte abbiamo estratto l'applicazione Express nel file <i>app.js</i>, mentre <i>index.js</i> ha ora il compito di avviarla sulla porta indicata tramite _app.listen_:

```js
const app = require('./app') // the actual Express app
const config = require('./utils/config')
const logger = require('./utils/logger')

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
```

I test utilizzano soltanto l'applicazione Express definita in <i>app.js</i>, che non rimane in ascolto su alcuna porta:

```js
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app') // highlight-line

const api = supertest(app) // highlight-line

// ...
```

La documentazione di supertest afferma:

> <i>Se il server non è già in ascolto, viene collegato automaticamente a una porta effimera, quindi non è necessario tenere traccia delle porte.</i>

In altre parole, supertest avvia l'applicazione su una porta gestita internamente. È uno dei motivi per cui lo preferiamo ad axios: non occorre avviare separatamente un'altra istanza del server prima dei test. Inoltre offre funzioni come <code>expect()</code>, che semplificano le verifiche.

Aggiungiamo due note al database di test con il programma _mongo.js_, ricordandoci di usare l'URL del database corretto.

Scriviamo qualche altro test:

```js
const assert = require('node:assert')
// ...

test('all notes are returned', async () => {
  const response = await api.get('/api/notes')

  assert.strictEqual(response.body.length, 2)
})

test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/notes')

  const contents = response.body.map(e => e.content)
  assert.strictEqual(contents.includes('HTML is easy'), true)
})

// ...
```

Entrambi i test salvano la risposta nella variabile _response_. A differenza del test precedente, che usava i metodi di _supertest_ per controllare stato e header, ora esaminiamo i dati nella proprietà <i>response.body</i>. Formato e contenuto vengono verificati con il metodo [strictEqual](https://nodejs.org/docs/latest/api/assert.html#assertstrictequalactual-expected-message) della libreria assert.

Possiamo semplificare il secondo test usando direttamente [assert](https://nodejs.org/docs/latest/api/assert.html#assertokvalue-message) per verificare che la nota sia tra quelle restituite:

```js
test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/notes')

  const contents = response.body.map(e => e.content)
  assert(contents.includes('HTML is easy'))
})
```


Il vantaggio di async/await comincia a essere evidente. Normalmente dovremmo usare callback per accedere ai dati restituiti dalle promise; con la nuova sintassi il codice è molto più comodo:

```js
const response = await api.get('/api/notes')

// execution gets here only after the HTTP request is complete
// the result of HTTP request is saved in variable response
assert.strictEqual(response.body.length, 2)
```

Il middleware che registra le richieste HTTP rende confuso l'output dei test. Modifichiamo il logger affinché non stampi sulla console in modalità test:

```js
const info = (...params) => {
  // highlight-start
  if (process.env.NODE_ENV !== 'test') { 
    console.log(...params)
  }
  // highlight-end
}

const error = (...params) => {
  // highlight-start
  if (process.env.NODE_ENV !== 'test') { 
    console.error(...params)
  }
  // highlight-end  
}

module.exports = {
  info, error
}
```

### Inizializzare il database prima dei test

Attualmente il risultato dei test dipende dallo stato del database: vengono superati soltanto se contiene due note, una delle quali ha come contenuto <i>'HTML is easy'</i>. Per renderli affidabili dobbiamo azzerare il database e generare in modo controllato i dati necessari prima dell'esecuzione.

I test usano già [after](https://nodejs.org/api/test.html#afterfn-options) per chiudere la connessione al termine dell'esecuzione. La libreria node:test offre altre funzioni per eseguire operazioni una sola volta prima di tutti i test oppure prima di ciascun test.

Inizializziamo il database <i>prima di ogni test</i> con [beforeEach](https://nodejs.org/api/test.html#beforeeachfn-options):

```js

const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test') // highlight-line
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Note = require('../models/note') // highlight-line

const api = supertest(app)

// highlight-start
const initialNotes = [
  {
    content: 'HTML is easy',
    important: false,
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
  },
]
// highlight-end

// highlight-start
beforeEach(async () => {
  await Note.deleteMany({})

  let noteObject = new Note(initialNotes[0])
  await noteObject.save()

  noteObject = new Note(initialNotes[1])
  await noteObject.save()
})
// highlight-end

// ...
```

All'inizio il database viene svuotato; vengono poi salvate le due note dell'array _initialNotes_. In questo modo ogni test parte dallo stesso stato.

Modifichiamo così il test che controlla il numero di note:

```js
// ...

test('all notes are returned', async () => {
  const response = await api.get('/api/notes')

  assert.strictEqual(response.body.length, initialNotes.length) // highlight-line
})

// ...

```

Il codice completo si trova nel branch <i>part4-3</i> di [questo repository GitHub](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part4-3).

### Eseguire i test uno alla volta

Il comando _npm test_ esegue tutti i test dell'applicazione. Durante la scrittura è generalmente meglio eseguirne soltanto uno o due.

Esistono diversi modi per farlo. Uno è il metodo [only](https://nodejs.org/api/test.html#testonlyname-options-fn), con il quale si indicano nel codice i test da eseguire:

```js
test.only('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test.only('all notes are returned', async () => {
  const response = await api.get('/api/notes')

  assert.strictEqual(response.body.length, 2)
})
```

Avviando i test con l'opzione _--test-only_, cioè con il comando:

```
npm test -- --test-only
```

vengono eseguiti soltanto i test contrassegnati con _only_.

Il rischio è dimenticare di rimuovere gli _only_ dal codice.

Un'altra possibilità è passare a <i>npm test</i> i test da eseguire come argomenti.

Il comando seguente esegue soltanto i test nel file <i>tests/note_api.test.js</i>:

```js
npm test -- tests/note_api.test.js
```

L'opzione [--test-name-pattern](https://nodejs.org/api/test.html#filtering-tests-by-name) permette di selezionare i test in base al nome:

```js
npm test -- --test-name-pattern="a specific note is within the returned notes"
```

L'argomento può riferirsi al nome del test o del blocco describe e può contenerne anche soltanto una parte. Il comando seguente esegue tutti i test il cui nome contiene <i>notes</i>:

```js
npm run test -- --test-name-pattern="notes"
```

### async/await

Prima di scrivere altri test, esaminiamo le parole chiave _async_ e _await_.

La sintassi async/await, introdotta con ES7, permette di usare <i>funzioni asincrone che restituiscono una promise</i> facendo apparire sincrono il codice.

Per esempio, il recupero delle note dal database tramite promise appare così:

```js
Note.find({}).then(notes => {
  console.log('operation returned the following notes', notes)
})
```

Il metodo _Note.find()_ restituisce una promise; possiamo accedere al risultato registrando una callback con _then_.

Tutto il codice da eseguire al termine dell'operazione va scritto nella callback. Con più chiamate asincrone consecutive, le chiamate dovrebbero essere annidate nelle callback e il codice diventerebbe presto complesso, producendo il cosiddetto [callback hell](https://stackoverflow.com/a/25098230).

Il [concatenamento delle promise](https://javascript.info/promise-chaining) consente di mantenere la situazione sotto controllo con una catena abbastanza leggibile di chiamate a _then_. Ecco un esempio artificiale che recupera tutte le note e poi elimina la prima:

```js
Note.find({})
  .then(notes => {
    return notes[0].deleteOne()
  })
  .then(response => {
    console.log('the first note is removed')
    // more code here
  })
```

La catena di then è accettabile, ma possiamo fare meglio. Le [funzioni generatrici](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Generator) introdotte in ES6 offrivano un [modo ingegnoso](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/async%20%26%20performance/ch4.md#iterating-generators-asynchronously) per scrivere codice asincrono dall'aspetto sincrono, ma con una sintassi poco agevole e non molto diffusa.

Le parole chiave _async_ e _await_ di ES7 rendono la stessa funzionalità più comprensibile e sintatticamente pulita.

Possiamo recuperare tutte le note usando l'operatore [await](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Operators/await):

```js
const notes = await Note.find({})

console.log('operation returned the following notes', notes)
```

Il codice sembra sincrono. L'esecuzione si ferma su <em>const notes = await Note.find({})</em>, attende che la promise sia <i>risolta</i> e poi prosegue assegnando il risultato alla variabile _notes_.

L'esempio precedente può essere riscritto con await così:

```js
const notes = await Note.find({})
const response = await notes[0].deleteOne()

console.log('the first note is removed')
```

Grazie alla nuova sintassi, il codice è molto più semplice della catena di then.

Con async/await occorre ricordare alcuni dettagli. Le operazioni usate con await devono restituire una promise; le normali funzioni asincrone basate su callback possono comunque essere racchiuse facilmente in una promise.

La parola chiave await non può essere usata ovunque: è consentita soltanto all'interno di una funzione [async](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Statements/async_function).

Gli esempi precedenti devono quindi essere racchiusi in funzioni async. Osserva la prima riga della funzione freccia:

```js
const main = async () => { // highlight-line
  const notes = await Note.find({})
  console.log('operation returned the following notes', notes)

  const response = await notes[0].deleteOne()
  console.log('the first note is removed')
}

main() // highlight-line
```

Il codice dichiara asincrona la funzione assegnata a _main_ e poi la invoca con <code>main()</code>.

### async/await nel backend

Iniziamo a convertire il backend ad async/await, partendo dalla rotta che recupera tutte le note.

Poiché tutte le operazioni asincrone avvengono già dentro una funzione, basta trasformare i gestori delle rotte in funzioni async. La rotta che recupera tutte le note

```js
notesRouter.get('/', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
})
```

diventa:

```js
notesRouter.get('/', async (request, response) => { 
  const notes = await Note.find({})
  response.json(notes)
})
```

Possiamo verificare il refactoring provando l'endpoint nel browser ed eseguendo i test già scritti.

### Riorganizzare la rotta che aggiunge una nota

Ogni refactoring comporta il rischio di [regressione](https://it.wikipedia.org/wiki/Test_di_regressione), cioè di rompere funzionalità esistenti. Prima di modificare le operazioni rimanenti scriveremo quindi un test per ciascuna rotta dell'API.

Partiamo dall'aggiunta di una nota. Il test aggiunge una nota e verifica sia l'aumento del numero totale sia la presenza del nuovo elemento nella lista.

```js
test('a valid note can be added ', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/notes')

  const contents = response.body.map(r => r.content)

  assert.strictEqual(response.body.length, initialNotes.length + 1)

  assert(contents.includes('async/await simplifies making async calls'))
})
```

Il test fallisce perché alla creazione restituiamo per errore <i>200 OK</i>. Correggiamolo in <i>201 CREATED</i>:

```js
notesRouter.post('/', (request, response, next) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save()
    .then(savedNote => {
      response.status(201).json(savedNote) // highlight-line
    })
    .catch(error => next(error))
})
```

Scriviamo anche un test che verifichi che una nota priva di contenuto non venga salvata.

```js
test('note without content is not added', async () => {
  const newNote = {
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400)

  const response = await api.get('/api/notes')

  assert.strictEqual(response.body.length, initialNotes.length)
})
```

Entrambi i test controllano lo stato del database dopo il salvataggio recuperando tutte le note dell'applicazione.  

```js
const response = await api.get('/api/notes')
```

Queste verifiche ricorreranno in altri test, quindi conviene estrarle in funzioni di supporto. Aggiungiamole nel nuovo file <i>tests/test_helper.js</i>, nella stessa directory del file di test.

```js
const Note = require('../models/note')

const initialNotes = [
  {
    content: 'HTML is easy',
    important: false
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true
  }
]

const nonExistingId = async () => {
  const note = new Note({ content: 'willremovethissoon' })
  await note.save()
  await note.deleteOne()

  return note._id.toString()
}

const notesInDb = async () => {
  const notes = await Note.find({})
  return notes.map(note => note.toJSON())
}

module.exports = {
  initialNotes, nonExistingId, notesInDb
}
```

Il modulo definisce _notesInDb_, che restituisce le note memorizzate, e l'array _initialNotes_ con lo stato iniziale del database. Definiamo inoltre _nonExistingId_, che crea un identificatore valido ma non associato ad alcuna nota presente.

I test possono ora utilizzare il modulo di supporto:

```js
const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper') // highlight-line
const Note = require('../models/note')

const api = supertest(app)

beforeEach(async () => {
  await Note.deleteMany({})

  let noteObject = new Note(helper.initialNotes[0]) // highlight-line
  await noteObject.save()

  noteObject = new Note(helper.initialNotes[1]) // highlight-line
  await noteObject.save()
})

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all notes are returned', async () => {
  const response = await api.get('/api/notes')

  assert.strictEqual(response.body.length, helper.initialNotes.length) // highlight-line
})

test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/notes')

  const contents = response.body.map(e => e.content)
  assert(contents.includes('HTML is easy'))
})

test('a valid note can be added ', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const notesAtEnd = await helper.notesInDb() // highlight-line
  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1) // highlight-line

  const contents = notesAtEnd.map(n => n.content) // highlight-line
  assert(contents.includes('async/await simplifies making async calls'))
})

test('note without content is not added', async () => {
  const newNote = {
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400)

  const notesAtEnd = await helper.notesInDb() // highlight-line

  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length) // highlight-line
})

after(async () => {
  await mongoose.connection.close()
})
```

Il codice basato sulle promise funziona e i test vengono superati. Possiamo passare ad async/await.

La rotta che aggiunge una nuova nota

```js
notesRouter.post('/', (request, response, next) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note
    .save()
    .then((savedNote) => {
      response.status(201).json(savedNote)
    })
    .catch((error) => next(error))
})
```

diventa:

```js
notesRouter.post('/', async (request, response) => { // highlight-line
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  // highlight-start
  const savedNote = await note.save()
  response.status(201).json(savedNote)
  // highlight-end
})
```

La parola chiave _async_ all'inizio del gestore abilita l'uso di _async/await_. Il codice diventa molto più semplice.

Inoltre non è più necessario inoltrare separatamente gli errori. Con le promise, un errore veniva passato al middleware così:

```js
  note
    .save()
    .then((savedNote) => {
      response.json(savedNote)
    })
    .catch((error) => next(error)) // highlight-line
```

Con _async/await_, Express [invoca automaticamente](https://expressjs.com/en/guide/error-handling.html) il middleware degli errori se await genera un'eccezione o la promise attesa viene rifiutata. Il codice risulta ancora più pulito.

**Nota:** questa funzionalità è disponibile da Express 5. Controlla la versione installata nel file _package.json_; se il progetto usa ancora Express 4, aggiornalo con:

 ```bash
 npm install express@5 
 ```

### Riorganizzare la rotta che recupera una singola nota

Scriviamo un test per visualizzare i dettagli di una singola nota. Il codice evidenzia l'operazione effettuata sull'API:

```js
test('a specific note can be viewed', async () => {
  const notesAtStart = await helper.notesInDb()
  const noteToView = notesAtStart[0]

// highlight-start
  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)
// highlight-end

  assert.deepStrictEqual(resultNote.body, noteToView)
})
```

Il test recupera una nota dal database, controlla che sia ottenibile tramite l'API e infine verifica che il contenuto corrisponda a quello atteso.

Qui viene usato [deepStrictEqual](https://nodejs.org/api/assert.html#assertdeepstrictequalactual-expected-message) anziché [strictEqual](https://nodejs.org/api/assert.html#assertstrictequalactual-expected-message):

```js
assert.deepStrictEqual(resultNote.body, noteToView)
```

_strictEqual_ usa [Object.is](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Object/is) e controlla che si tratti dello stesso oggetto. Qui vogliamo invece confrontare in profondità i valori dei campi, perciò è adatto _deepStrictEqual_.

I test passano e possiamo convertire la rotta ad async/await:

```js
notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})
```

### Riorganizzare la rotta che elimina una nota

Aggiungiamo un test anche per l'eliminazione:

```js
test('a note can be deleted', async () => {
  const notesAtStart = await helper.notesInDb()
  const noteToDelete = notesAtStart[0]

  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    .expect(204)

  const notesAtEnd = await helper.notesInDb()

  const ids = notesAtEnd.map(n => n.id)
  assert(!ids.includes(noteToDelete.id))

  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
})
```

La struttura è simile al test precedente: recuperiamo una nota, la eliminiamo tramite l'API e verifichiamo che non esista più e che il totale sia diminuito di uno.

I test continuano a passare, quindi possiamo riorganizzare la rotta:

```js
notesRouter.delete('/:id', async (request, response) => {
  await Note.findByIdAndDelete(request.params.id)
  response.status(204).end()
})
```

Il codice completo è nel branch <i>part4-4</i> di [questo repository GitHub](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part4-4).

### Ottimizzare la funzione beforeEach

Torniamo ai test ed esaminiamo la funzione _beforeEach_ che li prepara:

```js
beforeEach(async () => {
  await Note.deleteMany({})

  let noteObject = new Note(helper.initialNotes[0])
  await noteObject.save()

  noteObject = new Note(helper.initialNotes[1])
  await noteObject.save()
})
```

La funzione salva le prime due note di _helper.initialNotes_ con due operazioni separate. La soluzione funziona, ma possiamo salvare più oggetti in modo migliore:

```js
beforeEach(async () => {
  await Note.deleteMany({})
  console.log('cleared')

  helper.initialNotes.forEach(async (note) => {
    let noteObject = new Note(note)
    await noteObject.save()
    console.log('saved')
  })
  console.log('done')
})

test('notes are returned as json', async () => {
  console.log('entered test')
  // ...
}
```

Salviamo le note dell'array all'interno di un ciclo _forEach_. I test però non funzionano come previsto, quindi aggiungiamo alcuni log per individuare il problema.

La console mostra:

```
cleared
done
entered test
saved
saved
```

Nonostante async/await, l'esecuzione dei test comincia prima che il database sia inizializzato.

Ogni iterazione di _forEach_ genera un'operazione asincrona distinta e _beforeEach_ non ne attende il completamento. Gli await interni al ciclo appartengono infatti a funzioni separate. Inoltre [forEach si aspetta una funzione sincrona](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#descrizione), quindi questa struttura async/await non funziona correttamente al suo interno.

Poiché i test iniziano appena termina _beforeEach_, partono prima che lo stato del database sia pronto.

Una soluzione consiste nell'attendere tutte le operazioni asincrone con [Promise.all](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Promise/all):

```js
beforeEach(async () => {
  await Note.deleteMany({})

  const noteObjects = helper.initialNotes
    .map(note => new Note(note))
  const promiseArray = noteObjects.map(note => note.save())
  await Promise.all(promiseArray)
})
```

La soluzione è avanzata nonostante l'aspetto compatto. _noteObjects_ contiene gli oggetti Mongoose creati con il costruttore _Note_; la riga successiva crea un array <i>di promise</i> chiamando _save_ su ciascun oggetto.

[Promise.all](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) trasforma un array di promise in un'unica promise, risolta quando lo sono tutte quelle ricevute. <em>await Promise.all(promiseArray)</em> attende quindi il completamento di tutti i salvataggi.

> Con Promise.all rimangono accessibili anche i valori restituiti dalle singole promise. L'istruzione <em>const results = await Promise.all(promiseArray)</em> produce un array con i valori risolti, nello stesso ordine delle promise originali.

`Promise.all` attende le promise eseguite in parallelo. Se le operazioni devono rispettare un ordine, possiamo usare un ciclo [for...of](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Statements/for...of) con `await`, così ogni operazione termina prima dell'inizio della successiva.

```js
beforeEach(async () => {
  await Note.deleteMany({})

  for (const note of helper.initialNotes) {
    const noteObject = new Note(note)
    await noteObject.save()
  }
})
```

La natura asincrona di JavaScript può produrre comportamenti sorprendenti. Async/await semplifica l'uso delle promise, ma resta indispensabile comprenderne il funzionamento.

Esiste però una soluzione ancora più semplice: il metodo _insertMany_ di Mongoose.

```js
beforeEach(async () => {
  await Note.deleteMany({})
  await Note.insertMany(helper.initialNotes) // highlight-line
})
```

Il codice dell'applicazione è disponibile su [GitHub](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part4-5), nel branch <i>part4-5</i>.

### Il giuramento dello sviluppatore full stack

Scrivere test aggiunge un'ulteriore difficoltà alla programmazione. Aggiorniamo il giuramento per ricordare che anche nei test è fondamentale procedere con metodo.

Estendiamo ancora una volta il giuramento:

Lo sviluppo full stack è <i>estremamente difficile</i>, quindi userò ogni mezzo possibile per renderlo più semplice.

- Terrò sempre aperta la console di sviluppo del browser
- Userò la scheda Network per verificare che frontend e backend comunichino come previsto
- Controllerò costantemente lo stato del server e che i dati inviati dal frontend siano salvati correttamente
- Controllerò che il backend salvi i dati nel database nel formato corretto
- Procederò a piccoli passi
- <i>Userò molti _console.log_ per comprendere il comportamento del codice e dei test e individuare i problemi</i>
- Se il codice non funziona, non ne aggiungerò altro: lo ridurrò finché non torna a funzionare oppure tornerò a uno stato stabile
- <i>Se un test non passa, verificherò innanzitutto che la funzionalità testata operi davvero nell'applicazione</i>
- Quando chiederò aiuto, formulerò correttamente la domanda seguendo le [indicazioni generali](/it/part0)

</div>

<div class="tasks">

### Esercizi 4.8-4.12

**Attenzione:** se nello stesso codice usi async/await e metodi <i>then</i>, quasi certamente c'è qualcosa che non va. Scegli uno dei due approcci e non mescolarli.

#### 4.8: Test della lista di blog, passo 1

Usa SuperTest per scrivere un test che invii una richiesta HTTP GET a <i>/api/blogs</i>. Verifica che l'applicazione restituisca il numero corretto di blog in formato JSON.

Terminato il test, converti il gestore della rotta dalle promise ad async/await.

Dovrai apportare modifiche simili a quelle viste [nel materiale](/it/part4/testare_il_backend#ambiente-di-test), definendo l'ambiente di test per poter usare database separati.

**NB:** mentre scrivi i test è meglio **<i>non eseguirli tutti</i>**, ma soltanto quelli sui quali stai lavorando. Approfondisci [qui](/it/part4/testare_il_backend#eseguire-i-test-uno-alla-volta).

#### 4.9: Test della lista di blog, passo 2

Scrivi un test che verifichi che la proprietà identificativa dei blog si chiami <i>id</i>; il database la chiama normalmente <i>_id</i>.

Modifica il codice affinché superi il test. Il metodo [toJSON](/it/part3/salvare_i_dati_in_mongo_db#collegare-il-backend-al-database) visto nella parte 3 è un punto adatto per definire <i>id</i>.

#### 4.10: Test della lista di blog, passo 3

Scrivi un test che verifichi che una richiesta POST a <i>/api/blogs</i> crei un nuovo blog. Controlla almeno che il numero totale aumenti di uno; puoi anche verificare il contenuto salvato nel database.

Terminato il test, converti l'operazione ad async/await.

#### 4.11*: Test della lista di blog, passo 4

Scrivi un test che verifichi che, se <i>likes</i> manca dalla richiesta, assuma il valore predefinito 0. Non testare ancora le altre proprietà.

Apporta le modifiche necessarie affinché il test venga superato.

#### 4.12*: Test della lista di blog, passo 5

Scrivi test sulla creazione tramite <i>/api/blogs</i> che verifichino una risposta <i>400 Bad Request</i> quando nei dati della richiesta manca <i>title</i> oppure <i>url</i>.

Apporta le modifiche necessarie affinché il test venga superato.

</div>

<div class="content">

### Riorganizzare i test

La copertura dei test è ancora incompleta. Richieste come <i>GET /api/notes/:id</i> e <i>DELETE /api/notes/:id</i> non vengono verificate con identificatori non validi. Anche l'organizzazione può migliorare: tutti i test si trovano allo stesso livello. Raggruppare quelli correlati in blocchi <i>describe</i> rende il file più leggibile.

Ecco il file di test dopo alcuni piccoli miglioramenti:

```js
const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Note = require('../models/note')

const api = supertest(app)

describe('when there is initially some notes saved', () => {
  beforeEach(async () => {
    await Note.deleteMany({})
    await Note.insertMany(helper.initialNotes)
  })

  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all notes are returned', async () => {
    const response = await api.get('/api/notes')

    assert.strictEqual(response.body.length, helper.initialNotes.length)
  })

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map(e => e.content)
    assert(contents.includes('HTML is easy'))
  })

  describe('viewing a specific note', () => {
    test('succeeds with a valid id', async () => {
      const notesAtStart = await helper.notesInDb()
      const noteToView = notesAtStart[0]

      const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.deepStrictEqual(resultNote.body, noteToView)
    })

    test('fails with statuscode 404 if note does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()

      await api.get(`/api/notes/${validNonexistingId}`).expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api.get(`/api/notes/${invalidId}`).expect(400)
    })
  })

  describe('addition of a new note', () => {
    test('succeeds with valid data', async () => {
      const newNote = {
        content: 'async/await simplifies making async calls',
        important: true,
      }

      await api
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const notesAtEnd = await helper.notesInDb()
      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)

      const contents = notesAtEnd.map(n => n.content)
      assert(contents.includes('async/await simplifies making async calls'))
    })

    test('fails with status code 400 if data invalid', async () => {
      const newNote = { important: true }

      await api.post('/api/notes').send(newNote).expect(400)

      const notesAtEnd = await helper.notesInDb()

      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
    })
  })

  describe('deletion of a note', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const notesAtStart = await helper.notesInDb()
      const noteToDelete = notesAtStart[0]

      await api.delete(`/api/notes/${noteToDelete.id}`).expect(204)

      const notesAtEnd = await helper.notesInDb()

      const ids = notesAtEnd.map(n => n.id)
      assert(!ids.includes(noteToDelete.id))

      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
```

L'output nella console viene raggruppato secondo i blocchi <i>describe</i>:

![output di node:test raggruppato in blocchi describe](../../images/4/7new.png)

Rimane spazio per altri miglioramenti, ma è il momento di proseguire.

Testare l'API inviando richieste HTTP e ispezionando il database con Mongoose non è né l'unico né necessariamente il miglior modo di realizzare test di integrazione a livello API. Non esiste una soluzione universalmente migliore: dipende dall'applicazione e dalle risorse disponibili.

Il codice completo è disponibile nel branch <i>part4-6</i> di [questo repository GitHub](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part4-6).

</div>

<div class="tasks">

### Esercizi 4.13-4.14

#### 4.13 Estendere la lista di blog, passo 1

Implementa la funzionalità per eliminare una singola risorsa blog.

Usa async/await e segui le convenzioni [RESTful](/it/part3/node_js_ed_express#rest) nella definizione dell'API HTTP.

Scrivi i test della funzionalità.

#### 4.14 Estendere la lista di blog, passo 2

Implementa la funzionalità per aggiornare le informazioni di un singolo blog.

Usa async/await.

L'applicazione deve soprattutto aggiornare il numero di <i>like</i> di un blog. Puoi realizzare la funzionalità come l'aggiornamento delle note visto nella [parte 3](/it/part3/salvare_i_dati_in_mongo_db#altre-operazioni).

Scrivi i test della funzionalità.

</div>
