---
mainImage: ../../../images/part-3.svg
part: 3
letter: c
lang: it
---

<div class="content">

Prima di memorizzare permanentemente i dati in un database, vediamo alcuni modi per eseguire il debugging delle applicazioni Node.

### Debugging delle applicazioni Node

Il debugging di Node è leggermente più difficile rispetto a quello del JavaScript nel browser. Stampare nella console rimane un metodo semplice, affidabile e usato anche da sviluppatori open source molto esperti.

#### Visual Studio Code

Il debugger di Visual Studio Code può essere utile. L'applicazione può essere avviata in modalità debug come nell'immagine seguente; le immagini mostrano ancora un vecchio campo _date_, non più presente nell'applicazione:

![avvio del debugger in VS Code](../../images/3/35x.png)

L'applicazione non deve essere già in esecuzione in un altro terminale, altrimenti la porta risulterà occupata.

Nelle versioni recenti di VS Code il comando può chiamarsi _Run_ anziché _Debug_. Potrebbe essere necessario configurare <i>launch.json</i> scegliendo _Add Configuration..._ e _Run "npm start" in a debug terminal_. Consultate la [documentazione di VS Code](https://code.visualstudio.com/docs/editor/debugging).

Qui l'esecuzione è sospesa durante il salvataggio di una nota:

![esecuzione sospesa a un breakpoint](../../images/3/36x.png)

Il programma si è fermato al <i>breakpoint</i>. La console mostra il valore di _note_, mentre i pannelli visualizzano lo stato dell'applicazione. I pulsanti superiori controllano il flusso di esecuzione.

#### Strumenti di sviluppo di Chrome

Possiamo usare anche il debugger di Chrome avviando Node così:

```bash
node --inspect index.js
```

Nella console di sviluppo di Chrome appare l'icona verde di Node:

![icona Node negli strumenti di sviluppo](../../images/3/37.png)

La scheda <i>Sources</i> permette di impostare breakpoint:

![breakpoint e variabili osservate](../../images/3/38eb.png)

I messaggi di <i>console.log</i> compaiono nella scheda Console, dove possiamo anche esaminare variabili ed eseguire JavaScript:

![oggetto note nella console](../../images/3/39ea.png)

#### Mettere tutto in discussione

Il debugging full stack può sembrare difficile: aggiungendo un database a frontend e backend aumentano i possibili punti di errore.

Quando l'applicazione «non funziona», bisogna individuare sistematicamente dove si trova il problema. Può essere in un punto inatteso e richiedere molto tempo. <i>Mettete tutto in discussione</i> ed eliminate le possibilità una alla volta usando console, Postman, debugger ed esperienza.

La strategia peggiore quando compare un errore è continuare ad aggiungere codice: aumenterebbe soltanto i problemi. È più efficace applicare il principio [Jidoka](https://leanscape.io/principles-of-lean-13-jidoka/): fermarsi e correggere.

### MongoDB

Per conservare le note serve un database. In questa parte useremo [MongoDB](https://www.mongodb.com/), un [database a documenti](https://en.wikipedia.org/wiki/Document-oriented_database).

MongoDB viene introdotto perché richiede meno concetti iniziali rispetto a un database relazionale. La [parte 13](/it/part13) mostra invece backend Node.js basati su database relazionali.

I database a documenti differiscono da quelli relazionali nell'organizzazione e nel linguaggio di interrogazione e appartengono alla categoria [NoSQL](https://en.wikipedia.org/wiki/NoSQL).

Leggete nel manuale MongoDB le pagine su [database e collezioni](https://www.mongodb.com/docs/manual/core/databases-and-collections/) e [documenti](https://www.mongodb.com/docs/manual/core/document/).

È possibile installare MongoDB localmente, ma useremo il servizio cloud [MongoDB Atlas](https://www.mongodb.com/atlas/database).

Dopo aver creato l'account, create un cluster gratuito, scegliendo provider e regione:

![creazione del cluster MongoDB](../../images/3/mongo2.png)

Nell'esempio vengono scelti AWS e Stoccolma. Un'altra regione produce una stringa di connessione diversa. Il piano gratuito attuale è identificato come **M0** ed è limitato a un cluster per progetto; Atlas sospende automaticamente i cluster gratuiti rimasti inattivi per 30 giorni, che possono poi essere riattivati. Attendete che il cluster sia pronto prima di continuare.

Nella sezione di sicurezza create le credenziali dell'utente del database, diverse da quelle dell'account Atlas:

![credenziali del database](../../images/3/mongo3.png)

Definite poi gli indirizzi IP autorizzati. Per semplificare l'esercitazione consentiamo tutti gli indirizzi; `0.0.0.0/0` significa accesso da qualunque rete:

![elenco degli indirizzi autorizzati](../../images/3/mongo4.png)

In un progetto reale questa apertura va evitata o limitata il più possibile.

Selezionate _Connect_, poi _Drivers_, per ottenere la stringa di connessione:

![connessione al deployment MongoDB](../../images/3/mongo5.png)

![URI MongoDB per l'applicazione](../../images/3/mongo6new.png)

L'indirizzo ha una forma simile a:

```js
mongodb+srv://fullstack:thepasswordishere@cluster0.a5qfl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

Potremmo usare il [driver MongoDB per Node.js](https://mongodb.github.io/node-mongodb-native/), ma preferiamo [Mongoose](http://mongoosejs.com/index.html), che offre un'API di livello più alto. Mongoose è un <i>Object Document Mapper</i> e semplifica il salvataggio di oggetti JavaScript come documenti MongoDB.

Installiamolo nel backend Notes:

```bash
npm install mongoose
```

Prima di modificare il backend, creiamo nella sua radice il file di prova <i>mongo.js</i>:

```js
const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.a5qfl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url, { family: 4 })

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
  content: 'HTML is easy',
  important: true,
})

note.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
})
```

Usate sempre l'URI generato dal vostro cluster. La connessione viene aperta con:

```js
mongoose.connect(url, { family: 4 })
```

Il secondo argomento impone IPv4. La password viene letta dalla riga di comando:

```js
const password = process.argv[2]
```

Eseguendo _node mongo.js vostraPassword_ viene aggiunto un documento. Usate la password dell'utente del database, non quella dell'account Atlas. Le password con caratteri speciali devono essere [codificate nell'URL](https://docs.atlas.mongodb.com/troubleshoot-connection/#special-characters-in-connection-string-password).

Lo stato del database è visibile da _Browse collections_:

![pulsante Browse collections](../../images/3/mongo7.png)

Il documento è stato aggiunto alla collezione <i>notes</i>:

![collezione notes](../../images/3/mongo8new.png)

Cambiamo il nome del database nell'URI in <i>noteApp</i>:

```js
const url = `mongodb+srv://fullstack:${password}@cluster0.a5qfl.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`
```

Eseguendo di nuovo il programma, i dati finiscono nel database corretto:

![database noteApp](../../images/3/mongo9.png)

Atlas crea automaticamente il database quando l'applicazione si collega e scrive dati; non è necessario crearlo dal pannello.

### Schema

Dopo la connessione definiamo [schema](https://mongoosejs.com/docs/guide.html#schemas) e [modello](https://mongoosejs.com/docs/models.html):

```js
const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)
```

Lo schema descrive come Mongoose deve memorizzare le note. Il primo parametro del modello è il nome singolare: per convenzione, Mongoose usa come collezione il plurale minuscolo, quindi <i>Note</i> diventa <i>notes</i>.

MongoDB è <i>schemaless</i>: il database può memorizzare nella stessa collezione documenti con campi diversi. Mongoose aggiunge invece uno schema <i>a livello dell'applicazione</i>.

### Creare e salvare oggetti

Creiamo una nota col modello:

```js
const note = new Note({
  content: 'HTML is Easy',
  important: false,
})
```

I modelli sono funzioni costruttrici. Gli oggetti prodotti possiedono i metodi del modello, tra cui _save_:

```js
note.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
})
```

Dopo il salvataggio viene chiamata la callback, che chiude la connessione. Senza questa operazione il programma mantiene la connessione aperta. Il risultato è disponibile in _result_ e può essere stampato durante il debugging.

Aggiungete altre note modificando i dati ed eseguendo nuovamente il programma.

**Nota:** la documentazione Mongoose usa stili diversi, comprese vecchie callback. Non mescolate callback e promesse copiando esempi senza adattarli.

### Recuperare oggetti dal database

Commentiamo la creazione e usiamo:

```js
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})
```

Il programma stampa tutte le note:

![note stampate da mongo.js](../../images/3/70new.png)

[find](https://mongoosejs.com/docs/api/model.html#model_Model-find) riceve le condizioni di ricerca. L'oggetto vuoto `{}` seleziona tutti i documenti. Le condizioni seguono la [sintassi delle query MongoDB](https://www.mongodb.com/docs/manual/tutorial/query-documents/).

Per ottenere soltanto le note importanti:

```js
Note.find({ important: true }).then(result => {
  // ...
})
```

</div>

<div class="tasks">

### Esercizio 3.12.

#### 3.12: Database dalla riga di comando

Create su MongoDB Atlas un database cloud per la rubrica e un file <i>mongo.js</i> che aggiunga persone e mostri quelle esistenti.

**Non inserite la password nei file inviati a GitHub.**

Con tre argomenti, il primo dei quali è la password:

```bash
node mongo.js yourpassword Anna 040-1234556
```

il programma deve stampare:

```bash
added Anna number 040-1234556 to phonebook
```

e salvare la persona. I nomi con spazi vanno racchiusi tra virgolette:

```bash
node mongo.js yourpassword "Arto Vihavainen" 045-1232456
```

Con la sola password:

```bash
node mongo.js yourpassword
```

deve mostrare tutte le persone:

```
phonebook:
Anna 040-1234556
Arto Vihavainen 045-1232456
Ada Lovelace 040-1231236
```

Gli argomenti sono disponibili in [process.argv](https://nodejs.org/docs/latest-v18.x/api/process.html#process_process_argv).

**Non chiudete la connessione nel punto sbagliato.** Questo codice non funziona:

```js
Person
  .find({})
  .then(persons=> {
    // ...
  })

mongoose.connection.close()
```

La connessione viene chiusa subito dopo aver avviato _find_, prima che termini. Va chiusa alla fine della callback:

```js
Person
  .find({})
  .then(persons=> {
    // ...
    mongoose.connection.close()
  })
```

Se chiamate il modello <i>Person</i>, Mongoose chiamerà automaticamente la collezione <i>people</i>.

</div>

<div class="content">

### Collegare il backend al database

Copiamo inizialmente le definizioni Mongoose in <i>index.js</i>:

```js
const mongoose = require('mongoose')

// DO NOT SAVE YOUR PASSWORD TO GITHUB!!
const password = process.argv[2]
const url = `mongodb+srv://fullstack:${password}@cluster0.a5qfl.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)
mongoose.connect(url, { family: 4 })

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)
```

Modifichiamo il recupero di tutte le note:

```js
app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})
```

Avviamo con <code>node --watch index.js yourpassword</code> e controlliamo il risultato:

![note del database nel browser](../../images/3/44ea.png)

Il frontend si aspetta un campo <i>id</i>, mentre MongoDB produce <i>_id</i>; inoltre non vogliamo esporre <i>__v</i>. Personalizziamo il metodo [_toJSON_](https://stackoverflow.com/questions/7034848/mongodb-output-id-instead-of-id) dello schema:

```js
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
```

_id_ sembra una stringa ma è un oggetto; lo convertiamo esplicitamente. Il gestore non cambia:

```js
app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})
```

La serializzazione usa automaticamente _toJSON_.

### Spostare la configurazione del database in un modulo

Creiamo <i>models/note.js</i>:

```js
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI // highlight-line

console.log('connecting to', url)
mongoose.connect(url, { family: 4 })
// highlight-start
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })
// highlight-end

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Note', noteSchema) // highlight-line
```

L'URL proviene ora dalla variabile d'ambiente MONGODB_URI:

```js
const url = process.env.MONGODB_URI
```

Possiamo definirla all'avvio:

```bash
MONGODB_URI="your_connection_string_here" npm run dev
```

La connessione gestisce successo ed errore:

```js
mongoose.connect(url, { family: 4 })
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })
```

![errore per credenziali errate](../../images/3/45e.png)

Nei moduli Node CommonJS l'interfaccia pubblica viene assegnata a _module.exports_. Esportiamo soltanto il modello Note; mongoose e url restano interni. Importiamolo in <i>index.js</i>:

```js
const Note = require('./models/note')
```

### Definire variabili d'ambiente con dotenv

Installiamo [dotenv](https://github.com/motdotla/dotenv#readme):

```bash
npm install dotenv
```

Creiamo nella radice <i>.env</i>:

```bash
MONGODB_URI=mongodb+srv://fullstack:thepasswordishere@cluster0.a5qfl.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0
PORT=3001
```

**Aggiungete immediatamente `.env` a `.gitignore`: contiene informazioni riservate e non deve essere pubblicato.**

![.env aggiunto a .gitignore](../../images/3/45ae.png)

Carichiamo le variabili all'inizio di <i>index.js</i>, prima del modello:

```js
require('dotenv').config() // highlight-line
const express = require('express')
const Note = require('./models/note') // highlight-line

const app = express()
// ..

const PORT = process.env.PORT // highlight-line
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

L'ordine è importante: dotenv deve inizializzare l'ambiente prima che il codice del modello legga MONGODB_URI.

#### Variabili d'ambiente su Fly.io e Render

Non copiate `.env` su Fly.io. Aggiungetelo a _.dockerignore_:

```bash
.env
```

e impostate il secret:

```bash
fly secrets set MONGODB_URI="mongodb+srv://fullstack:thepasswordishere@cluster0.a5qfl.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0"
```

Su Render definite MONGODB_URI nella sezione delle variabili d'ambiente del pannello:

![variabile d'ambiente su Render](../../images/3/render-env.png)

Nel campo valore inserite soltanto l'URL che inizia con <i>mongodb+srv://</i>.

### Usare il database nei gestori delle route

Creiamo una nota così:

```js
app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
})
```

La risposta viene inviata nella callback di _save_, quindi soltanto dopo un salvataggio riuscito. _savedNote_ viene formattato automaticamente da _toJSON_:

```js
response.json(savedNote)
```

Per recuperare una nota usiamo [findById](https://mongoosejs.com/docs/api/model.html#model_Model-findById):

```js
app.get('/api/notes/:id', (request, response) => {
  Note.findById(request.params.id).then(note => {
    response.json(note)
  })
})
```

### Verificare l'integrazione tra frontend e backend

Provate sempre prima il backend con browser, Postman o REST Client:

![POST tramite REST Client](../../images/3/46new.png)

Solo dopo verificate il frontend. Testare esclusivamente attraverso l'interfaccia è inefficiente. Integrate una funzione alla volta: prima l'endpoint, poi il frontend, quindi la funzione successiva.

Controllate anche lo stato persistente dal pannello Atlas. Piccoli programmi come <i>mongo.js</i> sono spesso utili durante lo sviluppo.

Il codice completo è nel branch <i>part3-4</i> di [questo repository](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part3-4).

### Il vero giuramento dello sviluppatore full stack

Con frontend, backend e database aumentano ancora le possibili fonti di errore. Perciò:

- terrò sempre aperta la console del browser;
- userò Network per controllare la comunicazione frontend-backend;
- controllerò lo stato del server e i dati ricevuti;
- <i>controllerò che il database contenga i dati attesi</i>;
- procederò a piccoli passi;
- userò molti _console.log_ per comprendere il codice;
- se qualcosa non funziona, non aggiungerò altro codice: tornerò a uno stato funzionante.

</div>

<div class="tasks">

### Esercizi 3.13.-3.14.

#### 3.13: Database della rubrica, passo 1

Recuperate tutte le persone dal database e verificate che il frontend funzioni. Negli esercizi successivi mantenete tutto il codice Mongoose in un modulo separato, come in [Spostare la configurazione del database in un modulo](/it/part3/salvare_i_dati_in_mongo_db#spostare-la-configurazione-del-database-in-un-modulo).

#### 3.14: Database della rubrica, passo 2

Salvate le nuove persone nel database e verificate il frontend. Per ora potete ignorare eventuali nomi duplicati.

</div>

<div class="content">

### Gestione degli errori

Se richiediamo una nota con un id MongoDB valido ma inesistente, la risposta è _null_. Modifichiamo il gestore affinché restituisca 404 e aggiungiamo <em>catch</em> per le promesse rifiutate:

```js
app.get('/api/notes/:id', (request, response) => {
  Note.findById(request.params.id)
    .then(note => {
      // highlight-start
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
      // highlight-end
    })
    // highlight-start
    .catch(error => {
      console.log(error)
      response.status(500).end()
    })
    // highlight-end
})
```

Una nota inesistente produce 404; un errore di findById produce 500 e viene stampato. Anche un id malformato genera un errore di conversione:

```
Method: GET
Path:   /api/notes/someInvalidId
Body:   {}
---
{ CastError: Cast to ObjectId failed for value "someInvalidId" at path "_id"
    at CastError (/Users/mluukkai/opetus/_fullstack/osa3-muisiinpanot/node_modules/mongoose/lib/error/cast.js:27:11)
    at ObjectId.cast (/Users/mluukkai/opetus/_fullstack/osa3-muisiinpanot/node_modules/mongoose/lib/schema/objectid.js:158:13)
    ...
```

In questo caso la promessa viene rifiutata. Rispondiamo con 400:

```js
app.get('/api/notes/:id', (request, response) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end() 
      }
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'malformatted id' }) // highlight-line
    })
})
```

[400 Bad Request](https://www.rfc-editor.org/rfc/rfc9110.html#name-400-bad-request) indica che il server non può elaborare la richiesta a causa di un errore del client, come una sintassi non valida. Aggiungiamo anche un messaggio esplicativo.

Con le promesse è quasi sempre opportuno gestire errori ed eccezioni e stampare l'errore reale:

```js
.catch(error => {
  console.log(error)  // highlight-line
  response.status(400).send({ error: 'malformatted id' })
})
```

La causa potrebbe essere diversa da quella prevista. I log evitano lunghe sessioni di debugging e sono disponibili anche sui servizi di hosting. Quando lavorate a un backend, tenete sempre sotto controllo il suo terminale:

![una parte del terminale resta visibile](../../images/3/15b.png)

### Spostare la gestione degli errori in un middleware

Centralizzare gli errori è utile, per esempio per integrarli in futuro con sistemi come [Sentry](https://sentry.io/welcome/). Passiamo l'errore a _next_, terzo parametro del gestore:

```js
app.get('/api/notes/:id', (request, response, next) => { // highlight-line
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error)) // highlight-line
})
```

_next()_ senza argomenti passa alla route o al middleware successivo; con un errore passa al middleware di gestione degli errori.

I gestori di errore Express ricevono <i>quattro parametri</i>:

```js
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)
```

Un CastError produce 400; gli altri errori passano al gestore predefinito di Express. Questo middleware deve essere caricato per ultimo, dopo tutte le route.

### Ordine di caricamento dei middleware

I middleware vengono eseguiti nell'ordine degli _app.use_. L'ordine corretto è:

```js
app.use(express.static('dist'))
app.use(express.json())
app.use(requestLogger)

app.post('/api/notes', (request, response) => {
  const body = request.body
  // ...
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  // ...
}

// handler of requests that result in errors
app.use(errorHandler)
```

Il parser JSON deve precedere logger e route. Questo ordine è sbagliato:

```js
app.use(requestLogger) // request.body is undefined!

app.post('/api/notes', (request, response) => {
  // request.body is undefined!
  const body = request.body
  // ...
})

app.use(express.json())
```

Quando logger e route vengono eseguiti, _request.body_ è ancora undefined.

Anche unknownEndpoint deve seguire tutte le route e precedere soltanto il gestore degli errori. Questo ordine intercetterebbe invece ogni richiesta con 404:

```js
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

app.get('/api/notes', (request, response) => {
  // ...
})
```

### Altre operazioni

Eliminiamo una nota con [findByIdAndDelete](https://mongoosejs.com/docs/api/model.html#Model.findByIdAndDelete()):

```js
app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})
```

Rispondiamo 204 sia se la nota esiste sia se non esiste. _result_ permetterebbe di distinguere i casi. Le eccezioni passano al gestore degli errori.

Aggiorniamo una nota e la sua importanza:

```js
app.put('/api/notes/:id', (request, response, next) => {
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
```

Prima recuperiamo la nota; se non esiste rispondiamo 404. Altrimenti aggiorniamo i campi, salviamo e restituiamo il documento aggiornato.

Il codice contiene una promessa annidata:

```js
    .then(note => {
      if (!note) {
        return response.status(404).end()
      }

      note.content = content
      note.important = important

      // highlight-start
      return note.save().then((updatedNote) => {
        response.json(updatedNote)
      })
      // highlight-end
```

In genere è preferibile evitarlo perché riduce la leggibilità, ma qui garantisce che _save_ venga chiamato soltanto quando la nota esiste. Nella parte 4 useremo async/await per rendere più chiari questi casi.

Mongoose offre anche [findByIdAndUpdate](https://mongoosejs.com/docs/api/model.html#Model.findByIdAndUpdate()), ma _save()_ applica in modo più completo le validazioni che introdurremo e la documentazione Mongoose lo consiglia per aggiornare i documenti.

Dopo aver provato il backend con Postman o REST Client, verificate anche il frontend. Il codice completo è nel branch <i>part3-5</i> di [questo repository](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part3-5).

</div>

<div class="tasks">

### Esercizi 3.15.-3.18.

#### 3.15: Database della rubrica, passo 3

Fate in modo che l'eliminazione delle persone si rifletta nel database e verificate il frontend.

#### 3.16: Database della rubrica, passo 4

Spostate la gestione degli errori in un middleware dedicato.

#### 3.17*: Database della rubrica, passo 5

Quando si inserisce una persona già esistente, il frontend tenta di aggiornarne il numero con una PUT al suo URL. Modificate il backend affinché supporti questa richiesta e verificate il frontend.

#### 3.18*: Database della rubrica, passo 6

Aggiornate anche le route GET <i>api/persons/:id</i> e <i>info</i> affinché usino il database. Verificatele con browser, Postman o REST Client.

La singola persona nel browser deve apparire così:

![singola persona restituita da api/persons/id](../../images/3/49.png)

</div>
