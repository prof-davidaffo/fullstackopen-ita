---
mainImage: ../../../images/part-4.svg
part: 4
letter: c
lang: it
---

<div class="content">

Vogliamo aggiungere all'applicazione l'autenticazione e l'autorizzazione degli utenti. Gli utenti devono essere memorizzati nel database e ogni nota deve essere collegata al proprio autore. Soltanto l'utente che ha creato una nota potrà eliminarla o modificarla.

Cominciamo aggiungendo al database le informazioni sugli utenti. Tra un utente (<i>User</i>) e le note (<i>Note</i>) esiste una relazione uno-a-molti:

![diagramma della relazione tra utente e note](../../images/external/user-notes-relation.png)

Con un database relazionale l'implementazione sarebbe immediata. Le due risorse avrebbero tabelle separate e l'id dell'utente che ha creato una nota verrebbe memorizzato nella tabella delle note come chiave esterna.

Con i database a documenti la situazione è diversa, perché esistono molti modi per modellare la relazione.

La soluzione attuale salva ogni nota nella <i>collection notes</i>. Se non vogliamo modificarla, la scelta naturale consiste nel salvare gli utenti in una collection dedicata, per esempio <i>users</i>.

Come negli altri database a documenti, in Mongo possiamo usare gli ObjectId per fare riferimento a documenti di altre collection. Il concetto è simile alle chiavi esterne dei database relazionali.

Tradizionalmente i database a documenti come Mongo non supportano le <i>query di join</i> dei database relazionali, utilizzate per aggregare dati provenienti da più tabelle. Dalla versione 3.2 Mongo supporta però le [query di aggregazione lookup](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/), che non approfondiremo nel corso.

Se ci serve un comportamento simile a una join, lo implementeremo nel codice dell'applicazione eseguendo più query. In alcuni casi Mongoose può occuparsi dell'unione e dell'aggregazione dei dati, dando l'impressione di una join; anche allora, però, esegue più query al database.

### Riferimenti tra collection

In un database relazionale la nota conterrebbe una <i>chiave di riferimento</i> all'utente che l'ha creata. Possiamo fare lo stesso in un database a documenti.

Supponiamo che la collection <i>users</i> contenga due utenti:

```js
[
  {
    username: 'mluukkai',
    _id: 123456,
  },
  {
    username: 'hellas',
    _id: 141414,
  },
]
```

La collection <i>notes</i> contiene tre note, ciascuna con un campo <i>user</i> che fa riferimento a un utente della collection <i>users</i>:

```js
[
  {
    content: 'HTML is easy',
    important: false,
    _id: 221212,
    user: 123456,
  },
  {
    content: 'The most important operations of HTTP protocol are GET and POST',
    important: true,
    _id: 221255,
    user: 123456,
  },
  {
    content: 'A proper dinosaur codes with Java',
    important: false,
    _id: 221244,
    user: 141414,
  },
]
```

I database a documenti non impongono di memorizzare la chiave esterna nella nota: potrebbe trovarsi <i>anche</i> nella collection degli utenti, oppure in entrambe:

```js
[
  {
    username: 'mluukkai',
    _id: 123456,
    notes: [221212, 221255],
  },
  {
    username: 'hellas',
    _id: 141414,
    notes: [221244],
  },
]
```

Poiché un utente può avere molte note, i relativi id sono memorizzati in un array nel campo <i>notes</i>.

I database a documenti permettono anche un'organizzazione radicalmente diversa: in alcune situazioni può essere utile incorporare l'intero array delle note nei documenti della collection degli utenti:

```js
[
  {
    username: 'mluukkai',
    _id: 123456,
    notes: [
      {
        content: 'HTML is easy',
        important: false,
      },
      {
        content: 'The most important operations of HTTP protocol are GET and POST',
        important: true,
      },
    ],
  },
  {
    username: 'hellas',
    _id: 141414,
    notes: [
      {
        content:
          'A proper dinosaur codes with Java',
        important: false,
      },
    ],
  },
]
```

Con questo schema le note sarebbero strettamente annidate negli utenti e il database non genererebbe per loro alcun id.

Struttura e schema non sono immediati come nei database relazionali. Lo schema scelto deve sostenere al meglio i casi d'uso dell'applicazione, ma la decisione non è semplice perché all'inizio non tutti i casi d'uso sono noti.

Paradossalmente, i database senza schema come Mongo richiedono all'inizio del progetto decisioni sull'organizzazione dei dati più radicali rispetto ai database relazionali. Questi ultimi offrono in media una struttura ragionevolmente adatta a molte applicazioni.

### Schema Mongoose degli utenti

In questo caso memorizziamo nel documento dell'utente gli id delle note che ha creato. Definiamo il modello nel file <i>models/user.js</i>:

```js
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note'
    }
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User
```

Gli id delle note vengono salvati nel documento dell'utente come array di id Mongo. La definizione è:

```js
{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Note'
}
```

Il tipo del campo è <i>ObjectId</i>, quindi fa riferimento a un altro documento. <i>ref</i> specifica il nome del modello referenziato. Mongo non sa autonomamente che il campo rimanda alle note: questa sintassi appartiene esclusivamente a Mongoose.

Estendiamo lo schema della nota in <i>models/note.js</i> affinché contenga informazioni sull'utente che l'ha creata:

```js
const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    minlength: 5
  },
  important: Boolean,
  // highlight-start
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  // highlight-end
})
```

In netto contrasto con le convenzioni dei database relazionali, <i>i riferimenti sono memorizzati in entrambi i documenti</i>: la nota rimanda al proprio autore e l'utente contiene un array con tutte le note create.

### Creare gli utenti

Implementiamo una rotta per creare nuovi utenti. Ogni utente ha uno <i>username</i> univoco, un <i>name</i> e un <i>passwordHash</i>. Quest'ultimo è il risultato di una [funzione hash unidirezionale](https://it.wikipedia.org/wiki/Funzione_crittografica_di_hash) applicata alla password. Non bisogna mai memorizzare nel database password in chiaro.

Installiamo il pacchetto [bcrypt](https://github.com/kelektiv/node.bcrypt.js) per generare gli hash delle password:

```bash
npm install bcrypt
```

La creazione segue le convenzioni RESTful discusse nella [parte 3](/it/part3/node_js_ed_express#rest), tramite una richiesta HTTP POST al percorso <i>users</i>.

Definiamo un <i>router</i> separato per gli utenti nel nuovo file <i>controllers/users.js</i>. Attiviamolo poi in <i>app.js</i> affinché gestisca le richieste all'URL <i>/api/users</i>:

```js
// ...
const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users') // highlight-line

// ...

app.use('/api/notes', notesRouter)
app.use('/api/users', usersRouter) // highlight-line

// ...
```

Il contenuto di <i>controllers/users.js</i> è il seguente:

```js
const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter
```

La password inviata nella richiesta <i>non</i> viene memorizzata. Salviamo invece l'<i>hash</i> generato dalla funzione _bcrypt.hash_.

I fondamenti della [memorizzazione delle password](https://bytebytego.com/guides/how-to-store-passwords-in-the-database/) esulano dal corso. Non analizzeremo il significato del numero 10 assegnato a [saltRounds](https://github.com/kelektiv/node.bcrypt.js/#a-note-on-rounds), ma puoi approfondirlo nelle risorse collegate.

Il codice attuale non gestisce errori né convalida il formato di username e password.

La nuova funzionalità può e dovrebbe essere provata inizialmente a mano con Postman. I controlli manuali diventano però presto troppo laboriosi, soprattutto quando imponiamo l'unicità degli username.

Scrivere test automatici richiede meno lavoro e semplifica molto lo sviluppo.

I primi test potrebbero essere:

```js
const bcrypt = require('bcrypt')
const User = require('../models/user')

//...

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })
})
```

I test usano la funzione di supporto <i>usersInDb()</i>, definita in <i>tests/test_helper.js</i>, per verificare lo stato del database dopo la creazione di un utente:

```js
const User = require('../models/user')

// ...

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialNotes,
  nonExistingId,
  notesInDb,
  usersInDb,
}
```

Il blocco <i>beforeEach</i> aggiunge al database un utente con username <i>root</i>. Possiamo quindi verificare che non sia possibile crearne un altro con lo stesso username:

```js
describe('when there is initially one user in db', () => {
  // ...

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})
```

Al momento il test naturalmente non passa. Stiamo applicando il [test-driven development (TDD)](https://it.wikipedia.org/wiki/Test_driven_development), nel quale i test di una nuova funzionalità vengono scritti prima della sua implementazione.

Le validazioni di Mongoose non offrono un controllo diretto dell'unicità di un campo. Possiamo però imporla definendo un [indice univoco](https://mongoosejs.com/docs/schematypes.html):

```js
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  // highlight-start
  username: {
    type: String,
    required: true,
    unique: true // this ensures the uniqueness of username
  },
  // highlight-end
  name: String,
  passwordHash: String,
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note'
    }
  ],
})

// ...
```

Gli indici univoci richiedono attenzione. Se nel database esistono già documenti che violano il vincolo, [l'indice non viene creato](https://dev.to/akshatsinghania/mongoose-unique-not-working-16bf). Prima di aggiungerlo assicurati quindi che il database sia coerente. Il test precedente ha inserito due volte l'utente _root_: i duplicati devono essere rimossi affinché l'indice venga creato e il codice funzioni.

Le validazioni di Mongoose non intercettano la violazione dell'indice: invece di _ValidationError_ viene restituito un _MongoServerError_. Dobbiamo quindi estendere il gestore degli errori:

```js
const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
// highlight-start
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  }
  // highlight-end

  next(error)
}
```

Dopo queste modifiche i test vengono superati.

Potremmo aggiungere altre validazioni: lunghezza minima dello username, caratteri consentiti o robustezza della password. La loro implementazione è lasciata come esercizio facoltativo.

Prima di proseguire, aggiungiamo un gestore che restituisca tutti gli utenti del database:

```js
usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})
```

Per creare utenti in ambiente di produzione o sviluppo, invia con Postman o REST Client una richiesta POST a ```/api/users/``` nel formato seguente:

```js
{
    "username": "root",
    "name": "Superuser",
    "password": "salainen"
}
```

La lista appare così:

![api/users nel browser mostra dati JSON con l'array delle note](../../images/4/9.png)

Il codice completo dell'applicazione è disponibile nel branch <i>part4-7</i> di [questo repository GitHub](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part4-7).

### Creare una nuova nota

Il codice che crea una nota deve essere aggiornato affinché la nota venga assegnata al proprio autore.

Estendiamo <i>controllers/notes.js</i>: l'utente che crea la nota viene indicato nel campo <i>userId</i> del corpo della richiesta.

```js
const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user') //highlight-line

//...

notesRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findById(body.userId)// highlight-line

  // highlight-start
  if (!user) {
    return response.status(400).json({ error: 'userId missing or not valid' })
  }
  // highlight-end

  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user._id //highlight-line
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id) //highlight-line
  await user.save()  //highlight-line

  response.status(201).json(savedNote)
})

// ...
```

Per prima cosa cerchiamo nel database l'utente corrispondente allo <i>userId</i> della richiesta. Se non esiste, rispondiamo con stato 400 (<i>Bad Request</i>) e messaggio <i>"userId missing or not valid"</i>.

Anche l'oggetto <i>user</i> cambia: l'<i>id</i> della nota viene memorizzato nel suo campo <i>notes</i>:

```js
const user = await User.findById(body.userId)

// ...

user.notes = user.notes.concat(savedNote._id)
await user.save()
```

Proviamo a creare una nuova nota:

![creazione di una nuova nota con Postman](../../images/4/10e.png)

L'operazione sembra funzionare. Aggiungiamo un'altra nota e apriamo la rotta che restituisce tutti gli utenti:

![api/users restituisce gli utenti con i rispettivi array di note](../../images/4/11e.png)

L'utente ha ora due note.

Allo stesso modo, nella rotta che restituisce tutte le note possiamo vedere gli id degli autori:

![api/notes mostra nel JSON gli id degli utenti](../../images/4/12e.png)

A causa delle modifiche, i test non passano più; la loro correzione è lasciata come esercizio facoltativo. Anche il frontend non è ancora stato adeguato, quindi la creazione delle note non funziona. La sistemeremo nella parte 5.

### Populate

Vogliamo che, in risposta a una richiesta GET a <i>/api/users</i>, gli oggetti utente contengano anche il contenuto delle note e non soltanto i relativi id. In un database relazionale useremmo una <i>query di join</i>.

Come già detto, i database a documenti non supportano vere join tra collection, ma Mongoose può simularne alcune eseguendo più query. Le join dei database relazionali sono invece <i>transazionali</i>: lo stato del database non cambia durante la query. Con Mongoose non è garantita la coerenza tra le collection unite, che potrebbero cambiare durante l'operazione.

La join di Mongoose si realizza con [populate](http://mongoosejs.com/docs/populate.html). Aggiorniamo in <i>controllers/users.js</i> la rotta che restituisce tutti gli utenti:

```js
usersRouter.get('/', async (request, response) => {
  const users = await User  // highlight-line
    .find({}).populate('notes') // highlight-line

  response.json(users)
})
```

Il metodo [populate](http://mongoosejs.com/docs/populate.html) viene concatenato a <i>find</i>. Il suo argomento indica che gli <i>id</i> delle note nel campo <i>notes</i> dell'utente devono essere sostituiti dai documenti <i>note</i> corrispondenti. Mongoose interroga prima <i>users</i>, poi la collection associata al modello specificato dalla proprietà <i>ref</i> dello schema.

Il risultato è quasi quello desiderato:

![dati JSON con note popolate e informazioni ripetute](../../images/4/13new.png)

Possiamo usare populate per scegliere i campi da includere. Oltre a <i>id</i>, ci interessano soltanto <i>content</i> e <i>important</i>.

I campi vengono selezionati con la [sintassi](https://www.mongodb.com/docs/manual/tutorial/project-fields-from-query-results/#return-the-specified-fields-and-the-_id-field-only) di Mongo:

```js
usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('notes', { content: 1, important: 1 })

  response.json(users)
})
```

Ora il risultato è esattamente quello desiderato:

![dati combinati senza ripetizioni](../../images/4/14new.png)

Aggiungiamo anche alle note le informazioni appropriate sull'utente nel file <i>controllers/notes.js</i>:

```js
notesRouter.get('/', async (request, response) => {
  const notes = await Note
    .find({}).populate('user', { username: 1, name: 1 })

  response.json(notes)
})
```

Le informazioni dell'utente vengono ora aggiunte al campo <i>user</i> delle note.

![il JSON delle note include anche le informazioni dell'utente](../../images/4/15new.png)

È importante capire che il database non sa che gli id nel campo <i>user</i> delle note fanno riferimento a documenti della collection degli utenti.

Il metodo <i>populate</i> di Mongoose si basa sui «tipi» assegnati ai riferimenti nello schema tramite l'opzione <i>ref</i>:

```js
const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    minlength: 5
  },
  important: Boolean,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})
```

Il codice completo dell'applicazione è disponibile nel branch <i>part4-8</i> di [questo repository GitHub](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part4-8).

</div>
