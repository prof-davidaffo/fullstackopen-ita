---
mainImage: ../../../images/part-4.svg
part: 4
letter: d
lang: it
---

<div class="content">

Gli utenti devono poter accedere all'applicazione e, dopo l'accesso, le loro informazioni devono essere associate automaticamente alle nuove note che creano.

Implementiamo nel backend l'[autenticazione basata su token](https://www.okta.com/identity-101/what-is-token-based-authentication/).

I principi dell'autenticazione tramite token sono illustrati nel seguente diagramma di sequenza:

![diagramma di sequenza dell'autenticazione tramite token](../../images/4/16new.png)

- L'utente accede tramite un modulo di login realizzato con React
    - Aggiungeremo il modulo al frontend nella [parte 5](/it/part5)
- Il codice React invia username e password a <i>/api/login</i> con una richiesta HTTP POST.
- Se le credenziali sono corrette, il server genera un <i>token</i> che identifica l'utente autenticato.
    - Il token è firmato digitalmente e non può essere falsificato con mezzi crittografici.
- Il backend risponde con uno stato di successo e restituisce il token.
- Il browser salva il token, per esempio nello stato dell'applicazione React.
- Quando l'utente crea una nota, o esegue un'altra operazione che richiede identificazione, React invia il token insieme alla richiesta.
- Il server usa il token per identificare l'utente.

Implementiamo prima il login. Installiamo [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), che permette di generare [JSON Web Token](https://jwt.io/).

```bash
npm install jsonwebtoken
```

Il codice del login va nel file <i>controllers/login.js</i>.

```js
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter
```

Il codice cerca inizialmente nel database l'utente con lo <i>username</i> presente nella richiesta.

```js
const user = await User.findOne({ username })
```

Controlla poi la <i>password</i>, anch'essa contenuta nella richiesta.

```js
const passwordCorrect = user === null
  ? false
  : await bcrypt.compare(password, user.passwordHash)
```

Poiché nel database non vengono salvate le password ma i relativi <i>hash</i>, usiamo _bcrypt.compare_ per verificarle:

```js
await bcrypt.compare(password, user.passwordHash)
```

Se l'utente non esiste o la password è errata, la risposta ha stato [401 Unauthorized](https://www.rfc-editor.org/rfc/rfc9110.html#name-401-unauthorized) e il corpo ne spiega il motivo.

```js
if (!(user && passwordCorrect)) {
  return response.status(401).json({
    error: 'invalid username or password'
  })
}
```

Se la password è corretta, _jwt.sign_ crea un token contenente username e id dell'utente in forma firmata digitalmente.

```js
const userForToken = {
  username: user.username,
  id: user._id,
}

const token = jwt.sign(userForToken, process.env.SECRET)
```

Il token viene firmato usando come <i>segreto</i> la stringa contenuta nella variabile d'ambiente <i>SECRET</i>.
La firma garantisce che soltanto chi conosce il segreto possa generare un token valido.
Il valore della variabile deve essere impostato nel file <i>.env</i>.

Una richiesta riuscita riceve stato <i>200 OK</i>; il token generato e i dati dell'utente vengono restituiti nel corpo della risposta.

```js
response
  .status(200)
  .send({ token, username: user.username, name: user.name })
```

Non resta che aggiungere il nuovo router del login ad <i>app.js</i>.

```js
const loginRouter = require('./controllers/login')

//...

app.use('/api/login', loginRouter)
```

Proviamo ad accedere con il REST Client di VS Code:

![richiesta REST con username e password in VS Code](../../images/4/17e.png)

Non funziona. La console mostra:

```bash
(node:32911) UnhandledPromiseRejectionWarning: Error: secretOrPrivateKey must have a value
    at Object.module.exports [as sign] (/Users/mluukkai/opetus/_2019fullstack-koodit/osa3/notes-backend/node_modules/jsonwebtoken/sign.js:101:20)
    at loginRouter.post (/Users/mluukkai/opetus/_2019fullstack-koodit/osa3/notes-backend/controllers/login.js:26:21)
(node:32911) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 2)
```

Il comando _jwt.sign(userForToken, process.env.SECRET)_ fallisce perché abbiamo dimenticato di assegnare un valore a <i>SECRET</i>. Può essere una stringa qualsiasi. Dopo averla definita in <i>.env</i> e riavviato il server, il login funziona.

Un login riuscito restituisce i dati dell'utente e il token:

![risposta REST di VS Code con dati e token](../../images/4/18ea.png)

Una credenziale errata produce un messaggio di errore e lo stato appropriato:

![risposta REST di VS Code a credenziali errate](../../images/4/19ea.png)

### Limitare la creazione di note agli utenti autenticati

Modifichiamo la creazione delle note affinché sia consentita soltanto alle richieste POST con un token valido. La nota verrà salvata nella lista dell'utente identificato dal token.

Esistono diversi modi per inviare il token dal browser al server. Useremo l'header [Authorization](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization), che indica anche lo [schema di autenticazione](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes). Ciò è utile quando il server offre più metodi di autenticazione, perché gli permette di interpretare correttamente le credenziali.

Lo schema <i>Bearer</i> è adatto alle nostre esigenze.

In pratica, se il token è per esempio <i>eyJhbGciOiJIUzI1NiIsInR5c2VybmFtZSI6Im1sdXVra2FpIiwiaW</i>, l'header Authorization avrà il valore:

```
Bearer eyJhbGciOiJIUzI1NiIsInR5c2VybmFtZSI6Im1sdXVra2FpIiwiaW
```

La creazione delle note in <i>controllers/notes.js</i> diventa:

```js
const jwt = require('jsonwebtoken') //highlight-line

// ...
  //highlight-start
const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}
  //highlight-end

notesRouter.post('/', async (request, response) => {
  const body = request.body
//highlight-start
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)
//highlight-end

  if (!user) {
    return response.status(400).json({ error: 'UserId missing or not valid' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user._id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()

  response.status(201).json(savedNote)
})
```

La funzione _getTokenFrom_ estrae il token dall'header <i>authorization</i>. _jwt.verify_ ne controlla la validità e lo decodifica, restituendo l'oggetto sul quale era basato.

```js
const decodedToken = jwt.verify(token, process.env.SECRET)
```

Se il token manca o non è valido viene generata l'eccezione <i>JsonWebTokenError</i>. Estendiamo il middleware degli errori per gestirla:

```js
const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name ===  'JsonWebTokenError') { // highlight-line
    return response.status(401).json({ error: 'token invalid' }) // highlight-line
  }

  next(error)
}
```

L'oggetto decodificato contiene i campi <i>username</i> e <i>id</i>, che indicano al server chi ha effettuato la richiesta.

Se l'oggetto decodificato non contiene l'identità dell'utente, cioè _decodedToken.id_ è undefined, viene restituito lo stato [401 Unauthorized](https://www.rfc-editor.org/rfc/rfc9110.html#name-401-unauthorized) e il corpo spiega l'errore.

```js
if (!decodedToken.id) {
  return response.status(401).json({
    error: 'token invalid'
  })
}
```

Una volta determinata l'identità di chi ha effettuato la richiesta, l'esecuzione continua come prima.

Ora possiamo creare una nota con Postman assegnando all'header <i>authorization</i> il valore corretto: la stringa <i>Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ</i>, dove la seconda parte è il token restituito dal <i>login</i>.

In Postman appare così:

![aggiunta di un token Bearer in Postman](../../images/4/20new.png)

e nel REST Client di Visual Studio Code:

![esempio di token Bearer nel REST Client di VS Code](../../images/4/21new.png)

Il codice corrente è disponibile su [GitHub](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part4-9), nel branch <i>part4-9</i>.

Se l'applicazione ha più interfacce che richiedono identificazione, la validazione del JWT dovrebbe essere separata in un middleware dedicato. Si può anche usare una libreria come [express-jwt](https://www.npmjs.com/package/express-jwt).

### Problemi dell'autenticazione basata su token

L'autenticazione tramite token è semplice da implementare, ma presenta un problema: dopo aver consegnato il token a un client, per esempio un'app React, l'API si fida ciecamente di chi lo possiede. Che cosa accade se occorre revocarne i diritti di accesso?

Esistono due soluzioni. La più semplice consiste nel limitare la durata del token:

```js
loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  // token expires in 60*60 seconds, that is, in one hour
  // highlight-start
  const token = jwt.sign(
    userForToken, 
    process.env.SECRET,
    { expiresIn: 60*60 }
  )
  // highlight-end

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})
```

Alla scadenza, il client deve ottenere un nuovo token, normalmente chiedendo all'utente di accedere di nuovo.

Il middleware degli errori deve restituire una risposta appropriata anche per i token scaduti:

```js
const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return response.status(400).json({
      error: 'expected `username` to be unique'
    })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    })
  // highlight-start  
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }
  // highlight-end

  next(error)
}
```

Più breve è la scadenza, più sicura è la soluzione: se il token viene sottratto o bisogna revocare l'accesso, rimane utilizzabile solo per poco tempo. Una durata breve è però scomoda, perché richiede login più frequenti.

L'altra soluzione consiste nel salvare nel database del backend informazioni su ogni token e verificarne i diritti a ogni richiesta. In questo modo l'accesso può essere revocato in qualsiasi momento. La soluzione è spesso chiamata <i>sessione lato server</i>.

Le sessioni lato server aumentano la complessità del backend e incidono sulle prestazioni, perché ogni richiesta richiede un accesso al database, molto più lento del controllo locale del token. Per questo le sessioni vengono spesso memorizzate in un <i>database chiave-valore</i> come [Redis](https://redis.io/), meno ricco di funzionalità rispetto a MongoDB o a un database relazionale, ma estremamente veloce in questi scenari.

Con le sessioni lato server il token è spesso una semplice stringa casuale, priva delle informazioni sull'utente normalmente incluse nei JWT. A ogni richiesta il server recupera dal database l'identità dell'utente. È inoltre comune trasferire il token tramite <i>cookie</i> anziché con l'header Authorization.

### Considerazioni finali

Le numerose modifiche hanno prodotto un problema tipico dei progetti che avanzano rapidamente: molti test si sono rotti. Poiché questa parte contiene già parecchi concetti nuovi, la loro correzione rimane un esercizio facoltativo.

Username, password e applicazioni con autenticazione tramite token devono sempre viaggiare su [HTTPS](https://it.wikipedia.org/wiki/HTTPS). Potremmo usare un server [HTTPS](https://nodejs.org/docs/latest-v18.x/api/https.html) di Node al posto di [HTTP](https://nodejs.org/docs/latest-v18.x/api/http.html), con una configurazione aggiuntiva. In produzione anche piattaforme come Fly.io o Render terminano normalmente il traffico HTTPS per l'applicazione.

Implementeremo il login nel frontend nella [parte successiva](/it/part5).

</div>

<div class="tasks">

### Esercizi 4.15-4.23

Nei prossimi esercizi implementeremo nell'applicazione Bloglist le basi della gestione degli utenti. Puoi seguire il materiale dalla sezione [Gestione degli utenti](/it/part4/gestione_degli_utenti) fino ad [Autenticazione tramite token](/it/part4/autenticazione_tramite_token), adattandolo liberamente al progetto.

**Un'altra avvertenza:** se stai mescolando async/await e chiamate a _then_, quasi certamente c'è qualcosa che non va. Usa un solo approccio, mai entrambi.

#### 4.15: Estendere la lista di blog, passo 3

Implementa la creazione di utenti tramite una richiesta HTTP POST a <i>api/users</i>. Ogni utente ha <i>username, password e name</i>.

Non salvare le password in chiaro: usa <i>bcrypt</i> come nella sezione [Creare gli utenti](/it/part4/gestione_degli_utenti#creare-gli-utenti).

**NB** alcuni utenti Windows hanno riscontrato problemi con <i>bcrypt</i>. In tal caso rimuovi la libreria con:

```bash
npm uninstall bcrypt 
```

e installa al suo posto [bcryptjs](https://www.npmjs.com/package/bcryptjs).

Implementa una richiesta HTTP adeguata per visualizzare i dati di tutti gli utenti.

La lista può apparire così:

![api/users nel browser mostra i dati JSON di due utenti](../../images/4/22.png)

#### 4.16*: Estendere la lista di blog, passo 4

Aggiungi queste restrizioni alla creazione degli utenti: username e password sono obbligatori, devono contenere almeno tre caratteri e lo username deve essere univoco.

In caso di dati non validi, l'operazione deve rispondere con uno stato appropriato e un messaggio di errore.

**NB** non verificare i vincoli della password con le validazioni di Mongoose: la password ricevuta dal backend non coincide con l'hash salvato nel database. La lunghezza va controllata nel controller, come fatto nella [parte 3](/it/part3/validazione_ed_es_lint), prima di ricorrere alla validazione di Mongoose.

**Implementa anche i test** che assicurino che gli utenti non validi non vengano creati e che l'operazione restituisca stato e messaggio adeguati.

**NB** se distribuisci i test in più file, ricorda che ciascun file viene normalmente eseguito in un processo distinto; consulta _Test execution model_ nella [documentazione](https://nodejs.org/api/test.html#test-runner-execution-model). I file vengono quindi eseguiti contemporaneamente e, condividendo lo stesso database, possono interferire. Puoi evitarlo con l'opzione _--test-concurrency=1_, che impone l'esecuzione sequenziale.

#### 4.17: Estendere la lista di blog, passo 5

Estendi i blog affinché ciascuno contenga informazioni sul proprio autore.

Modifica l'aggiunta dei blog affinché a ogni nuovo elemento venga assegnato come autore <i>un qualsiasi</i> utente del database, per esempio il primo trovato. Segui la sezione [Populate](/it/part4/gestione_degli_utenti#populate).
Per ora non importa quale utente venga scelto; completeremo la funzionalità nell'esercizio 4.19.

Modifica la lista dei blog affinché mostri anche i dati dell'autore:

![api/blogs incorpora nel JSON i dati dell'autore](../../images/4/23e.png)

Anche la lista degli utenti deve mostrare i blog creati da ciascuno:

![api/users incorpora i blog nel JSON](../../images/4/24e.png)

#### 4.18: Estendere la lista di blog, passo 6

Implementa l'autenticazione basata su token seguendo la sezione [Autenticazione tramite token](/it/part4/autenticazione_tramite_token).

#### 4.19: Estendere la lista di blog, passo 7

Consenti l'aggiunta di un blog soltanto quando la richiesta POST contiene un token valido. L'utente identificato dal token diventa l'autore del blog.

#### 4.20*: Estendere la lista di blog, passo 8

[Questo esempio](/it/part4/autenticazione_tramite_token#limitare-la-creazione-di-note-agli-utenti-autenticati) mostra come estrarre il token dall'header con la funzione _getTokenFrom_ in <i>controllers/blogs.js</i>.

Se hai adottato la stessa soluzione, sposta l'estrazione del token in un [middleware](/it/part3/node_js_ed_express#middleware). Il middleware deve estrarre il token dall'header <i>Authorization</i> e assegnarlo al campo <i>token</i> dell'oggetto <i>request</i>.

In altre parole, registrando il middleware in <i>app.js</i> prima delle rotte:

```js
app.use(middleware.tokenExtractor)
```

le rotte possono accedere al token tramite _request.token_:

```js
blogsRouter.post('/', async (request, response) => {
  // ..
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  // ..
})
```

Ricorda che una normale [funzione middleware](/it/part3/node_js_ed_express#middleware) riceve tre parametri e alla fine invoca <i>next</i> per passare il controllo al middleware successivo:

```js
const tokenExtractor = (request, response, next) => {
  // code that extracts the token

  next()
}
```

#### 4.21*: Estendere la lista di blog, passo 9

Modifica l'eliminazione affinché un blog possa essere cancellato soltanto dall'utente che lo ha aggiunto. Il token della richiesta deve quindi appartenere all'autore del blog.

Un tentativo senza token o da parte di un utente non autorizzato deve restituire uno stato appropriato.

Nota che, recuperando un blog dal database:

```js
const blog = await Blog.findById(...)
```

il campo <i>blog.user</i> non contiene una stringa, ma un oggetto. Per confrontarne l'id con un id testuale non basta quindi un normale confronto: occorre prima convertirlo in stringa.

```js
if ( blog.user.toString() === userid.toString() ) ...
```

#### 4.22*: Estendere la lista di blog, passo 10

Sia la creazione sia l'eliminazione devono conoscere l'identità dell'utente. Il middleware _tokenExtractor_ dell'esercizio 4.20 aiuta, ma i gestori <i>post</i> e <i>delete</i> devono ancora determinare chi possiede il token.

Crea un middleware _userExtractor_ che identifichi l'utente e lo associ all'oggetto request. Dopo averlo registrato, i gestori post e delete devono poter accedere direttamente a request.user:

```js
blogsRouter.post('/', userExtractor, async (request, response) => {
  // get user from request object
  const user = request.user
  // ..
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  // get user from request object
  const user = request.user
  // ..
})
```

In questo caso userExtractor è registrato sulle singole rotte e viene eseguito solo quando serve. Invece di applicarlo a tutte le rotte:

```js
// use the middleware in all routes
app.use(middleware.userExtractor) // highlight-line

app.use('/api/blogs', blogsRouter)  
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
```

possiamo limitarlo alle rotte del percorso <i>/api/blogs</i>:

```js
// use the middleware only in /api/blogs routes
app.use('/api/blogs', middleware.userExtractor, blogsRouter) // highlight-line
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
```

È sufficiente passare più middleware come parametri a <i>use</i>. Allo stesso modo, un middleware può essere registrato su una singola rotta:

```js
router.post('/', userExtractor, async (request, response) => {
  // ...
})
```

Assicurati che la richiesta GET di tutti i blog continui a funzionare senza token.

#### 4.23*: Estendere la lista di blog, passo 11

Dopo l'introduzione dell'autenticazione tramite token, i test sull'aggiunta dei blog non funzionano più. Correggili e aggiungi un test che verifichi la risposta <i>401 Unauthorized</i> quando manca il token.

[Questa discussione](https://github.com/visionmedia/supertest/issues/398) sarà probabilmente utile per la correzione.

Questo è l'ultimo esercizio della Parte 4.

</div>
