---
mainImage: ../../../images/part-4.svg
part: 4
letter: a
lang: it
---

<div class="content">

Continuiamo a lavorare sul backend dell'applicazione delle note iniziata nella [parte 3](/it/part3).

### Struttura del progetto

**Nota**: per seguire il materiale è sufficiente una versione moderna e supportata di Node.js. Puoi controllare quella installata eseguendo _node -v_ dalla riga di comando; non è necessario utilizzare un gestore di versioni.

Prima di affrontare i test, modificheremo la struttura del progetto seguendo le buone pratiche di Node.js.

Dopo aver riorganizzato le directory, il progetto avrà la seguente struttura:

```bash
├── controllers
│   └── notes.js
├── dist
│   └── ...
├── models
│   └── note.js
├── utils
│   ├── config.js
│   ├── logger.js
│   └── middleware.js  
├── app.js
├── index.js
├── package-lock.json
├── package.json
```

Finora abbiamo utilizzato <i>console.log</i> e <i>console.error</i> per stampare dal codice informazioni di vario tipo. Non è però il modo migliore di procedere. Separiamo tutte le stampe sulla console in un modulo dedicato, <i>utils/logger.js</i>:

```js
const info = (...params) => {
  console.log(...params)
}

const error = (...params) => {
  console.error(...params)
}

module.exports = { info, error }
```

Il logger contiene due funzioni: __info__ per i normali messaggi di log ed __error__ per i messaggi di errore.

Estrarre il logging in un modulo separato è utile per diversi motivi. Se volessimo scrivere i log in un file oppure inviarli a un servizio esterno come [Graylog](https://www.graylog.org/) o [Papertrail](https://papertrailapp.com), dovremmo apportare modifiche in un solo punto.

La gestione delle variabili d'ambiente viene estratta nel file <i>utils/config.js</i>:

```js
require('dotenv').config()

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI

module.exports = { MONGODB_URI, PORT }
```

Le altre parti dell'applicazione possono accedere alle variabili d'ambiente importando il modulo di configurazione:

```js
const config = require('./utils/config')

logger.info(`Server running on port ${config.PORT}`)
```

Anche i gestori delle rotte sono stati spostati in un modulo dedicato. I gestori degli eventi delle rotte vengono comunemente chiamati <i>controller</i>; per questo abbiamo creato una nuova directory <i>controllers</i>. Tutte le rotte relative alle note si trovano ora nel modulo <i>notes.js</i> della directory <i>controllers</i>.

Il contenuto del modulo <i>notes.js</i> è il seguente:

```js
const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

notesRouter.get('/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

notesRouter.post('/', (request, response, next) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error))
})

notesRouter.delete('/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

notesRouter.put('/:id', (request, response, next) => {
  const { content, important } = request.body

  Note.findById(request.params.id)
    .then(note => {
      if (!note) {
        return response.status(404).end()
      }

      note.content = content
      note.important = important

      return note.save().then((updatedNote) => {
        response.json(updatedNote)
      })
    })
    .catch(error => next(error))
})

module.exports = notesRouter
```

È quasi una copia esatta del precedente file <i>index.js</i>.

Ci sono però alcune modifiche importanti. All'inizio del file creiamo un nuovo oggetto [router](http://expressjs.com/en/api.html#router):

```js
const notesRouter = require('express').Router()

//...

module.exports = notesRouter
```

Il modulo esporta il router, rendendolo disponibile a tutti i moduli che lo utilizzano.

Tutte le rotte vengono ora definite sull'oggetto router, in modo analogo a quanto facevamo prima con l'oggetto che rappresentava l'intera applicazione.

È importante notare che i percorsi nei gestori delle rotte sono diventati più brevi. Nella versione precedente avevamo:

```js
app.delete('/api/notes/:id', (request, response, next) => {
```

Nella versione attuale abbiamo invece:

```js
notesRouter.delete('/:id', (request, response, next) => {
```

Che cosa sono esattamente questi oggetti router? Il manuale di Express li descrive così:

> <i>Un oggetto router è un'istanza isolata di middleware e rotte. Può essere considerato una “mini-applicazione”, capace di svolgere soltanto funzioni di middleware e routing. Ogni applicazione Express dispone di un router integrato.</i>

Il router è di fatto un <i>middleware</i> che permette di definire in un unico punto un insieme di «rotte correlate», solitamente collocate in un modulo dedicato.

Il file <i>app.js</i>, che crea l'applicazione vera e propria, utilizza il router nel modo seguente:

```js
const notesRouter = require('./controllers/notes')
app.use('/api/notes', notesRouter)
```

Il router definito in precedenza viene utilizzato <i>se</i> l'URL della richiesta inizia con <i>/api/notes</i>. Per questo l'oggetto notesRouter deve definire soltanto le parti relative dei percorsi, cioè il percorso vuoto <i>/</i> oppure il solo parametro <i>/:id</i>.

Nella radice del repository è stato creato il file <i>app.js</i>, che definisce l'applicazione:

```js
const express = require('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const notesRouter = require('./controllers/notes')

const app = express()

logger.info('connecting to', config.MONGODB_URI)

mongoose
  .connect(config.MONGODB_URI, { family: 4 })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/notes', notesRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
```

Il file utilizza diversi middleware; uno di questi è <i>notesRouter</i>, collegato alla rotta <i>/api/notes</i>.

I nostri middleware personalizzati sono stati spostati nel nuovo modulo <i>utils/middleware.js</i>:

```js
const logger = require('./logger')

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
}
```

La responsabilità di stabilire la connessione al database è stata affidata al modulo <i>app.js</i>. Il file <i>note.js</i> nella directory <i>models</i> definisce soltanto lo schema Mongoose delle note.

```js
const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    minlength: 5
  },
  important: Boolean,
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Note', noteSchema)
```

Il contenuto del file <i>index.js</i>, utilizzato per avviare l'applicazione, viene semplificato come segue:

```js
const app = require('./app') // the actual Express application
const config = require('./utils/config')
const logger = require('./utils/logger')

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
```

Il file <i>index.js</i> importa da <i>app.js</i> soltanto l'applicazione vera e propria e poi la avvia. La funzione _info_ del modulo logger stampa sulla console il messaggio che informa dell'avvio dell'applicazione.

L'app Express e il codice che gestisce il server web sono ora separati secondo le [buone pratiche](https://dev.to/nermineslimane/always-separate-app-and-server-files--1nc7). Uno dei vantaggi è la possibilità di verificare l'applicazione a livello di chiamate alle API HTTP senza effettuare vere richieste HTTP attraverso la rete, rendendo più rapida l'esecuzione dei test.

Ricapitolando, dopo le modifiche la struttura delle directory è la seguente:

```bash
├── controllers
│   └── notes.js
├── dist
│   └── ...
├── models
│   └── note.js
├── utils
│   ├── config.js
│   ├── logger.js
│   └── middleware.js  
├── app.js
├── index.js
├── package-lock.json
├── package.json
```

Nelle applicazioni più piccole la struttura non è così importante. Quando l'applicazione comincia a crescere, diventa necessario adottare una qualche organizzazione e separare in moduli distinti le diverse responsabilità. In questo modo lo sviluppo risulta molto più semplice.

Per le applicazioni Express non esistono una struttura di directory o una convenzione per i nomi dei file obbligatorie. Ruby on Rails, al contrario, richiede una struttura specifica. Quella attuale segue semplicemente alcune buone pratiche diffuse.

Il codice completo dell'applicazione si trova nel branch <i>part4-1</i> di [questo repository GitHub](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part4-1).

Se cloni il progetto, esegui _npm install_ prima di avviare l'applicazione con _npm run dev_.

### Nota sulle esportazioni

In questa parte abbiamo utilizzato due tipi diversi di esportazione. Per esempio, il file <i>utils/logger.js</i> esporta nel modo seguente:

```js
const info = (...params) => {
  console.log(...params)
}

const error = (...params) => {
  console.error(...params)
}

module.exports = { info, error } // highlight-line
```

Il file esporta <i>un oggetto</i> con due proprietà, entrambe funzioni. Le funzioni possono essere usate in due modi diversi. La prima possibilità consiste nell'importare l'intero oggetto e accedere alle funzioni tramite la notazione puntata:

```js
const logger = require('./utils/logger')

logger.info('message')

logger.error('error message')
```

L'altra possibilità consiste nel destrutturare le funzioni in variabili separate nell'istruzione <i>require</i>:

```js
const { info, error } = require('./utils/logger')

info('message')
error('error message')
```

Il secondo metodo può essere preferibile quando in un file viene utilizzata solo una piccola parte delle funzioni esportate.

In alcuni casi, però, viene esportata una sola «cosa». Per esempio, <i>controller/notes.js</i> esporta un unico elemento nel modo seguente:

```js
const notesRouter = require('express').Router()
const Note = require('../models/note')

// ...

module.exports = notesRouter // highlight-line
```

Poiché viene esportato un solo elemento, questo può essere importato e utilizzato esclusivamente come singolo oggetto:

```js
const notesRouter = require('./controllers/notes')

// ...

app.use('/api/notes', notesRouter)
```

L'elemento esportato, in questo caso un oggetto router, viene quindi assegnato alla variabile _notesRouter_ e utilizzato come un unico oggetto.

#### Trovare gli utilizzi delle esportazioni con VS Code

VS Code offre una pratica funzionalità che permette di vedere dove vengono utilizzati gli elementi esportati dai moduli. Può essere molto utile durante il refactoring: se, per esempio, si divide una funzione in due funzioni distinte, il codice può smettere di funzionare se non vengono modificati tutti i suoi utilizzi. Trovarli è difficile se non si sa dove siano, ma affinché questa funzionalità operi correttamente le esportazioni devono essere definite in un modo specifico.

Facendo clic con il pulsante destro su una variabile nel punto in cui viene esportata e selezionando “Find All References”, VS Code mostra tutti i punti nei quali viene importata. Questo però non funziona quando un oggetto viene assegnato direttamente a module.exports. Una soluzione consiste nell'assegnare l'oggetto da esportare a una variabile con nome e poi esportare quella variabile. La funzionalità non opera neppure se si usa la destrutturazione durante l'importazione: occorre importare la variabile con nome e destrutturarla successivamente, oppure accedere con la notazione puntata alle funzioni che contiene.

Non è probabilmente ideale che le caratteristiche di VS Code influenzino il modo in cui si scrive il codice; spetta quindi a te decidere se il compromesso sia conveniente.

</div>

<div class="tasks">

### Esercizi 4.1-4.2

**Nota**: per seguire il materiale è sufficiente una versione moderna e supportata di Node.js. Puoi controllare quella installata eseguendo _node -v_ dalla riga di comando; non è necessario utilizzare un gestore di versioni.

Negli esercizi di questa parte costruiremo un'applicazione per gestire una <i>lista di blog</i>, con la quale gli utenti potranno salvare informazioni sui blog interessanti incontrati in rete. Per ogni blog memorizzeremo autore, titolo, URL e numero di voti positivi ricevuti dagli utenti dell'applicazione.

#### 4.1 Lista di blog, passo 1

Immagina di ricevere un'email contenente il seguente codice dell'applicazione e le relative istruzioni:

```js
const express = require('express')
const mongoose = require('mongoose')

const app = express()

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
})

const Blog = mongoose.model('Blog', blogSchema)

const mongoUrl = 'mongodb://localhost/bloglist'
mongoose.connect(mongoUrl, { family: 4 })

app.use(express.json())

app.get('/api/blogs', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs)
  })
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog.save().then((result) => {
    response.status(201).json(result)
  })
})

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

Trasforma l'applicazione in un progetto <i>npm</i> funzionante. Per rendere più produttivo lo sviluppo, configura l'applicazione in modo che venga eseguita con <i>node --watch</i>. Puoi creare un nuovo database per l'applicazione con MongoDB Atlas oppure usare lo stesso database degli esercizi della parte precedente.

Verifica con Postman o con il client REST di VS Code che sia possibile aggiungere blog alla lista e che l'applicazione restituisca quelli aggiunti dall'endpoint corretto.

#### 4.2 Lista di blog, passo 2

Riorganizza l'applicazione in moduli separati come mostrato in precedenza in questa parte del corso.

**NB** procedi a piccoli passi e verifica il funzionamento dopo ogni modifica. Se tenti una «scorciatoia» riorganizzando molti elementi contemporaneamente, entrerà quasi certamente in gioco la [legge di Murphy](https://it.wikipedia.org/wiki/Legge_di_Murphy) e qualcosa si romperà. La «scorciatoia» finirà così per richiedere più tempo di un avanzamento lento e sistematico.

Una buona pratica consiste nel creare un commit ogni volta che il codice raggiunge uno stato stabile. In questo modo è facile tornare a una situazione in cui l'applicazione funzionava ancora.

Se <i>content.body</i> risulta <i>undefined</i> apparentemente senza motivo, assicurati di non aver dimenticato di aggiungere <i>app.use(express.json())</i> vicino all'inizio del file.

</div>

<div class="content">

### Testare le applicazioni Node

Finora abbiamo trascurato completamente un ambito essenziale dello sviluppo software: i test automatici.

Iniziamo il nostro percorso con i test unitari. La logica dell'applicazione è così semplice che non c'è molto che valga la pena sottoporre a test unitari. Creiamo un nuovo file <i>utils/for_testing.js</i> e scriviamo un paio di semplici funzioni sulle quali esercitarci:

```js
const reverse = (string) => {
  return string
    .split('')
    .reverse()
    .join('')
}

const average = (array) => {
  const reducer = (sum, item) => {
    return sum + item
  }

  return array.reduce(reducer, 0) / array.length
}

module.exports = {
  reverse,
  average,
}
```

> La funzione _average_ utilizza il metodo [reduce](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce) degli array. Se non lo conosci ancora, questo è un buon momento per guardare i primi tre video della serie YouTube [Functional JavaScript](https://www.youtube.com/watch?v=BMUiFMZr7vk&list=PL0zVEGEvSaeEd9hlmCXrk5yUyqUag-n84).

Per JavaScript sono disponibili numerose librerie di test, dette anche <i>test runner</i>. Lo storico punto di riferimento è [Mocha](https://mochajs.org/), sostituito alcuni anni fa da [Jest](https://jestjs.io/). Tra le soluzioni più recenti c'è [Vitest](https://vitest.dev/), che si presenta come una libreria di test di nuova generazione.

Oggi Node include anche la libreria di test [node:test](https://nodejs.org/docs/latest/api/test.html), adatta alle esigenze del corso.

Definiamo lo <i>script npm _test_</i> per eseguire i test:

```js
{
  // ...
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "test": "node --test", // highlight-line
    "lint": "eslint ."
  },
  // ...
}
```

Creiamo per i test una directory separata chiamata <i>tests</i> e al suo interno un nuovo file <i>reverse.test.js</i> con il seguente contenuto:

```js
const { test } = require('node:test')
const assert = require('node:assert')

const reverse = require('../utils/for_testing').reverse

test('reverse of a', () => {
  const result = reverse('a')

  assert.strictEqual(result, 'a')
})

test('reverse of react', () => {
  const result = reverse('react')

  assert.strictEqual(result, 'tcaer')
})

test('reverse of saippuakauppias', () => {
  const result = reverse('saippuakauppias')

  assert.strictEqual(result, 'saippuakauppias')
})
```

Il test importa la funzione _test_ e la libreria [assert](https://nodejs.org/docs/latest/api/assert.html), utilizzata per controllare i risultati delle funzioni sottoposte a test.

Nella riga successiva il file di test importa la funzione da verificare e la assegna alla variabile _reverse_:

```js
const reverse = require('../utils/for_testing').reverse
```

I singoli casi di test vengono definiti con la funzione _test_. Il primo argomento è la descrizione del test sotto forma di stringa. Il secondo è una <i>funzione</i> che definisce le operazioni del caso di test. Il codice del secondo caso è il seguente:

```js
() => {
  const result = reverse('react')

  assert.strictEqual(result, 'tcaer')
}
```

Per prima cosa eseguiamo il codice da verificare, generando l'inverso della stringa <i>react</i>. Controlliamo poi il risultato con il metodo [strictEqual](https://nodejs.org/docs/latest/api/assert.html#assertstrictequalactual-expected-message) della libreria [assert](https://nodejs.org/docs/latest/api/assert.html).

Come previsto, tutti i test vengono superati:

![output del terminale di npm test con tutti i test superati](../../images/4/1new.png)

Nel corso adottiamo la convenzione secondo cui i nomi dei file di test terminano con <i>.test.js</i>, poiché la libreria <i>node:test</i> esegue automaticamente i file con questo nome.

Proviamo a rompere il test:

```js
test('reverse of react', () => {
  const result = reverse('react')

  assert.strictEqual(result, 'tkaer')
})
```

L'esecuzione produce il seguente messaggio di errore:

![output del terminale che mostra il fallimento di npm test](../../images/4/2new.png)

Aggiungiamo alcuni test anche per la funzione average. Creiamo un nuovo file <i>tests/average.test.js</i> con il seguente contenuto:

```js
const { test, describe } = require('node:test')
const assert = require('node:assert')

const average = require('../utils/for_testing').average

describe('average', () => {
  test('of one value is the value itself', () => {
    assert.strictEqual(average([1]), 1)
  })

  test('of many is calculated right', () => {
    assert.strictEqual(average([1, 2, 3, 4, 5, 6]), 3.5)
  })

  test('of empty array is zero', () => {
    assert.strictEqual(average([]), 0)
  })
})
```

Il test rivela che la funzione non opera correttamente con un array vuoto, perché in JavaScript una divisione per zero produce <i>NaN</i>:

![output del terminale che mostra il fallimento con un array vuoto](../../images/4/3new.png)

Correggere la funzione è piuttosto semplice:

```js
const average = array => {
  const reducer = (sum, item) => {
    return sum + item
  }

  return array.length === 0
    ? 0
    : array.reduce(reducer, 0) / array.length
}
```

Se la lunghezza dell'array è 0 restituiamo 0; in tutti gli altri casi utilizziamo il metodo _reduce_ per calcolare la media.

Nei test appena scritti ci sono alcuni aspetti da osservare. Abbiamo racchiuso i test in un blocco <i>describe</i> chiamato _average_:

```js
describe('average', () => {
  // tests
})
```

I blocchi describe permettono di raggruppare i test in insiemi logici. Anche l'output utilizza il nome del blocco describe:

![schermata di npm test con i blocchi describe](../../images/4/4new.png)

Come vedremo più avanti, i blocchi <i>describe</i> sono necessari quando vogliamo eseguire operazioni comuni di preparazione o pulizia per un gruppo di test.

Un altro aspetto da notare è che abbiamo scritto i test in forma piuttosto compatta, senza assegnare a una variabile il valore restituito dalla funzione verificata:

```js
test('of empty array is zero', () => {
  assert.strictEqual(average([]), 0)
})
```

</div>

<div class="tasks">

### Esercizi 4.3-4.7

Creiamo una raccolta di funzioni di supporto adatte a lavorare con le informazioni della lista di blog. Inserisci le funzioni in un file chiamato <i>utils/list_helper.js</i> e scrivi i test in un file dal nome appropriato all'interno della directory <i>tests</i>.

#### 4.3: Funzioni di supporto e test unitari, passo 1

Per prima cosa definisci una funzione _dummy_ che riceve come parametro un array di post e restituisce sempre il valore 1. A questo punto il contenuto del file <i>list_helper.js</i> dovrebbe essere il seguente:

```js
const dummy = (blogs) => {
  // ...
}

module.exports = {
  dummy
}
```

Verifica che la configurazione dei test funzioni con il test seguente:

```js
const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})
```

#### 4.4: Funzioni di supporto e test unitari, passo 2

Definisci una nuova funzione _totalLikes_ che riceve come parametro una lista di post. La funzione restituisce la somma totale dei <i>like</i> di tutti i post.

Scrivi test adeguati per la funzione. È consigliabile inserirli in un blocco <i>describe</i>, così da raggrupparli in modo ordinato nel resoconto dei test:

![npm test superato per list_helper_test](../../images/4/5.png)

Gli input di test per la funzione possono essere definiti nel modo seguente:

```js
describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0
    }
  ]

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })
})
```

Se creare autonomamente una lista di blog da usare come input richiede troppo lavoro, puoi utilizzare quella già pronta disponibile [qui](https://github.com/fullstack-hy2020/misc/blob/master/blogs_for_test.md).

Scrivendo i test incontrerai inevitabilmente qualche problema. Ricorda ciò che abbiamo imparato sul [debugging](/it/part3/salvare_i_dati_in_mongo_db#debugging-delle-applicazioni-node) nella parte 3. Anche durante l'esecuzione dei test puoi stampare informazioni sulla console con _console.log_.

#### 4.5*: Funzioni di supporto e test unitari, passo 3

Definisci una nuova funzione _favoriteBlog_ che riceve come parametro una lista di blog e restituisce quello con più like. Se ci sono più blog preferiti a pari merito, è sufficiente restituirne uno qualsiasi.

**NB** per confrontare oggetti è probabilmente opportuno utilizzare il metodo [deepStrictEqual](https://nodejs.org/api/assert.html#assertdeepstrictequalactual-expected-message), che verifica che gli oggetti abbiano gli stessi attributi. Per conoscere le differenze tra le varie funzioni del modulo assert puoi consultare [questa risposta su Stack Overflow](https://stackoverflow.com/a/73937068/15291501).

Scrivi i test dell'esercizio in un nuovo blocco <i>describe</i>. Fai lo stesso anche per gli esercizi successivi.

#### 4.6*: Funzioni di supporto e test unitari, passo 4

Questo esercizio e il successivo sono un po' più impegnativi. Non è necessario completarli per proseguire nel corso: può quindi essere utile riprenderli dopo aver studiato l'intera parte.

L'esercizio può essere svolto senza librerie aggiuntive, ma costituisce un'ottima occasione per imparare a utilizzare [Lodash](https://lodash.com/).

Definisci una funzione _mostBlogs_ che riceve come parametro un array di blog. La funzione restituisce l'<i>autore</i> che ha pubblicato il maggior numero di blog; il valore restituito contiene anche il numero di blog dell'autore più prolifico:

```js
{
  author: "Robert C. Martin",
  blogs: 3
}
```

Se più autori sono a pari merito, è sufficiente restituirne uno qualsiasi.

#### 4.7*: Funzioni di supporto e test unitari, passo 5

Definisci una funzione _mostLikes_ che riceve come parametro un array di blog. La funzione restituisce l'autore i cui post hanno ottenuto complessivamente il maggior numero di like; il valore restituito contiene anche il numero totale di like ricevuti dall'autore:

```js
{
  author: "Edsger W. Dijkstra",
  likes: 17
}
```

Se più autori sono a pari merito, è sufficiente mostrarne uno qualsiasi.

</div>
