---
mainImage: ../../../images/part-3.svg
part: 3
letter: a
lang: it
---

<div class="content">

In questa parte ci spostiamo verso il backend, cioè verso l'implementazione delle funzionalità lato server.

Costruiremo il backend con [Node.js](https://nodejs.org/en/), un ambiente di esecuzione JavaScript basato sul motore [Chrome V8](https://developers.google.com/v8/) di Google.

Per seguire gli esempi è sufficiente avere una versione moderna e supportata di Node.js. Potete controllare quella installata con _node -v_. Non è richiesto alcun gestore di versioni: servono soltanto i comandi `node` e `npm` disponibili nel terminale.

Come ricordato nella [parte 1](/it/part1/java_script), il codice destinato ai browser può dover essere <i>transpilato</i>, per esempio con [Babel](https://babeljs.io/). Sul backend eseguiamo invece il codice direttamente con una versione moderna di Node, che supporta la grande maggioranza delle funzionalità recenti di JavaScript.

Il nostro obiettivo è realizzare un backend compatibile con l'applicazione Notes della [parte 2](/it/part2/). Partiamo però dalle basi con il classico «Hello World».

**Attenzione:** le applicazioni e gli esercizi di questa parte non sono applicazioni React. Non inizializzeremo quindi il progetto con <i>create vite@latest -- --template react</i>.

Nella parte 2 abbiamo già incontrato [npm](/it/part2/recuperare_dati_dal_server#npm), lo strumento per gestire i pacchetti JavaScript, nato proprio nell'ecosistema Node.

Spostiamoci in una directory adatta e inizializziamo l'applicazione con _npm init_. Rispondendo alle domande viene generato nella radice del progetto un file <i>package.json</i> con le informazioni sul progetto:

```json
{
  "name": "backend",
  "version": "0.0.1",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Matti Luukkainen",
  "license": "MIT"
}
```

Il file indica, tra le altre cose, che il punto di ingresso dell'applicazione è <i>index.js</i>.

Aggiungiamo un comando all'oggetto <i>scripts</i>:

```json
{
  // ...
  "scripts": {
    "start": "node index.js", // highlight-line
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  // ...
}
```

Creiamo nella radice il file <i>index.js</i>:

```js
console.log('hello world')
```

Possiamo eseguirlo direttamente con Node:

```bash
node index.js
```

oppure come [script npm](https://docs.npmjs.com/misc/scripts):

```bash
npm start
```

Lo script funziona perché è definito in <i>package.json</i>:

```json
{
  // ...
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  // ...
}
```

Anche se _node index.js_ funziona, nei progetti npm è consuetudine eseguire queste attività mediante script npm.

Il file definisce inoltre lo script comune <i>npm test</i>. Non avendo ancora una libreria di test, il comando esegue semplicemente:

```bash
echo "Error: no test specified" && exit 1
```

### Un semplice server web

Trasformiamo l'applicazione in un server web modificando _index.js_:

```js
const http = require('http')

const app = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('Hello World')
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
```

All'avvio, la console mostra:

```bash
Server running on port 3001
```

Apriamo l'applicazione all'indirizzo <http://localhost:3001>:

![Hello World nel browser](../../images/3/1.png)

Il server risponde nello stesso modo qualunque sia la parte finale dell'URL; anche <http://localhost:3001/foo/bar> mostra lo stesso contenuto.

**Nota:** se la porta 3001 è già usata, l'avvio produce un errore simile a questo:

```bash
➜  hello npm start

> hello@1.0.0 start /Users/mluukkai/opetus/_2019fullstack-code/part3/hello
> node index.js

Server running on port 3001
events.js:167
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE :::3001
    at Server.setupListenHandle [as _listen2] (net.js:1330:14)
    at listenInCluster (net.js:1378:12)
```

Potete chiudere l'applicazione che occupa la porta, probabilmente JSON Server usato nella parte 2, oppure scegliere una porta diversa.

Esaminiamo la prima riga:

```js
const http = require('http')
```

L'applicazione importa il modulo [http](https://nodejs.org/docs/latest-v18.x/api/http.html) integrato in Node. Nel codice per il browser abbiamo svolto un'operazione simile con una sintassi diversa:

```js
import http from 'http'
```

I moduli ES usano [export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) e [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import). Gli esempi di questa parte usano invece i moduli [CommonJS](https://en.wikipedia.org/wiki/CommonJS), storicamente adottati dall'ecosistema Node. Node supporta pienamente anche i moduli ES; qui manteniamo CommonJS per coerenza con il progetto e con gli esempi. Per le nostre esigenze i due sistemi funzionano in modo molto simile.

Il blocco successivo è:

```js
const app = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('Hello World')
})
```

Il metodo _createServer_ del modulo <i>http</i> crea un server e registra un <i>gestore di eventi</i>, chiamato <i>ogni volta</i> che arriva una richiesta HTTP all'indirizzo del server.

La risposta ha codice 200, header <i>Content-Type: text/plain</i> e corpo <i>Hello World</i>.

Le righe finali fanno ascoltare al server assegnato ad _app_ la porta 3001:

```js
const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
```

Lo scopo principale del backend sarà fornire al frontend dati grezzi in formato JSON. Modifichiamo subito il server affinché restituisca un elenco di note inserito nel codice:

```js
const http = require('http')

// highlight-start
let notes = [
  {
    id: "1",
    content: "HTML is easy",
    important: true
  },
  {
    id: "2",
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: "3",
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

const app = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' })
  response.end(JSON.stringify(notes))
})
// highlight-end

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
```

Riavviamo il server con _Ctrl+C_ e aggiorniamo il browser.

Il valore <i>application/json</i> dell'header informa il destinatario che i dati sono JSON. _JSON.stringify(notes)_ trasforma l'array in una stringa JSON, necessaria perché <em>response.end()</em> accetta una stringa o un buffer come corpo della risposta.

Nel browser vediamo lo stesso formato ottenuto nella [parte 2](/it/part2/recuperare_dati_dal_server/) con [json-server](https://github.com/typicode/json-server):

![elenco di note JSON formattato](../../images/3/2new.png)

### Express

È possibile costruire il server direttamente con il modulo <i>http</i>, ma diventa scomodo quando l'applicazione cresce.

Molte librerie offrono un'interfaccia più pratica e un'astrazione migliore per i casi d'uso comuni. La più diffusa è [Express](http://expressjs.com).

Installiamola come dipendenza:

```bash
npm install express
```

Express viene aggiunto a <i>package.json</i>:

```json
{
  // ...
  "dependencies": {
    "express": "^5.1.0"
  }
}
```

Il codice viene installato nella directory <i>node_modules</i>, insieme a numerose altre dipendenze:

![elenco delle dipendenze installate](../../images/3/4.png)

Sono le dipendenze di Express, quelle delle sue dipendenze e così via, dette [dipendenze transitive](https://lexi-lambda.github.io/blog/2016/08/24/understanding-the-npm-dependency-model/).

Il simbolo davanti alla versione:

```json
"express": "^5.1.0"
```

fa parte del [versionamento semantico](https://docs.npmjs.com/about-semantic-versioning). `^5.1.0` consente aggiornamenti con numeri patch o minor superiori, ma mantiene la stessa versione major 5.

Le dipendenze possono essere aggiornate con:

```bash
npm update
```

Su un altro computer, tutte le dipendenze dichiarate nel progetto vengono installate dalla sua directory principale con:

```bash
npm install
```

Finché il numero major non cambia, le nuove versioni dovrebbero essere [retrocompatibili](https://en.wikipedia.org/wiki/Backward_compatibility). Una futura Express 5.99.175 dovrebbe quindi eseguire questo codice senza modifiche; Express 6.0.0 potrebbe invece introdurre cambiamenti incompatibili.

### Web ed Express

Torniamo all'applicazione e modifichiamola:

```js
const express = require('express')
const app = express()

let notes = [
  ...
]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
  response.json(notes)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

Per usare la nuova versione dobbiamo riavviare l'applicazione.

All'inizio importiamo _express_, che è una <i>funzione</i>, e la chiamiamo per creare l'applicazione salvata in _app_:

```js
const express = require('express')
const app = express()
```

Definiamo poi due <i>route</i>. La prima gestisce le richieste GET alla radice <i>/</i>:

```js
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})
```

Il gestore riceve due parametri: [request](https://expressjs.com/en/5x/api/request/) contiene le informazioni sulla richiesta HTTP; [response](https://expressjs.com/en/5x/api/response/) serve a definire la risposta.

Il metodo [send](https://expressjs.com/en/5x/api/response/#ressendbody) invia la stringa <code>\<h1>Hello World!\</h1></code>. Poiché è una stringa, Express imposta automaticamente <i>Content-Type</i> a <i>text/html</i>. Il codice di stato predefinito è 200.

Possiamo verificarlo nella scheda <i>Network</i>:

![scheda Network degli strumenti di sviluppo](../../images/3/5.png)

La seconda route gestisce le richieste GET a <i>/api/notes</i>:

```js
app.get('/api/notes', (request, response) => {
  response.json(notes)
})
```

Il metodo [json](https://expressjs.com/en/5x/api/response/#resjsonbody) invia l'array _notes_ come stringa JSON e imposta automaticamente <i>Content-Type: application/json</i>.

![dati JSON restituiti da api/notes](../../images/3/6new.png)

Con il solo modulo http dovevamo eseguire manualmente:

```js
response.end(JSON.stringify(notes))
```

Con Express la conversione è automatica. Ricordate che [JSON](https://en.wikipedia.org/wiki/JSON) è un formato di dati, spesso rappresentato come stringa, e non coincide con un oggetto JavaScript come _notes_.

![il terminale Node mostra che JSON è una stringa](../../assets/3/5.png)

L'esperimento è stato svolto nella console interattiva [Node REPL](https://nodejs.org/docs/latest-v18.x/api/repl.html), avviabile digitando _node_. È molto utile per provare rapidamente i comandi durante lo sviluppo.

### Riavvio automatico dopo le modifiche

Quando cambiamo il codice dobbiamo normalmente fermare il server con _Ctrl+C_ e riavviarlo. Possiamo far controllare automaticamente le modifiche a Node con l'opzione _--watch_:

```bash
node --watch index.js
```

Il server si riavvierà quando cambia il codice. Il browser deve comunque essere aggiornato manualmente: in questo scenario, che restituisce dati JSON, non abbiamo l'hot reload di React.

Definiamo uno script di sviluppo in <i>package.json</i>:

```json
{
  // ..
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js", // highlight-line
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  // ..
}
```

Avviamo il server in sviluppo con:

```bash
npm run dev
```

A differenza degli script <i>start</i> e <i>test</i>, questo comando richiede la parola <i>run</i>.

### REST

Estendiamo l'applicazione affinché offra la stessa API HTTP RESTful di [json-server](https://github.com/typicode/json-server#routes).

Representational State Transfer, REST, fu presentato nel 2000 nella [tesi](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) di Roy Fielding come stile architetturale per applicazioni web scalabili.

Non approfondiremo la definizione originale né discuteremo cosa sia davvero RESTful. Adotteremo una visione [più pratica](https://en.wikipedia.org/wiki/Representational_state_transfer#Applied_to_web_services), comune nelle applicazioni web.

Nella [parte precedente](/it/part2/modificare_i_dati_sul_server#rest) abbiamo chiamato <i>risorse</i> le singole entità, come le note. Ogni risorsa possiede un URL univoco, spesso costruito combinando il tipo della risorsa e il suo identificatore.

Se la radice del servizio è <i>www.example.com/api</i>, una nota con id 10 può avere indirizzo <i>www.example.com/api/notes/10</i>; l'intera collezione si trova a <i>www.example.com/api/notes</i>.

L'operazione è indicata dal <i>verbo</i> HTTP:

| URL      | verbo  | funzionalità                                                    |
| -------- | ------ | --------------------------------------------------------------- |
| notes/10 | GET    | recupera una singola risorsa                                    |
| notes    | GET    | recupera tutte le risorse della collezione                      |
| notes    | POST   | crea una risorsa usando i dati della richiesta                  |
| notes/10 | DELETE | elimina la risorsa identificata                                 |
| notes/10 | PUT    | sostituisce l'intera risorsa con i dati della richiesta         |
| notes/10 | PATCH  | sostituisce una parte della risorsa con i dati della richiesta  |
|          |        |                                                                 |

Otteniamo così, in modo approssimativo, l'[interfaccia uniforme](https://en.wikipedia.org/wiki/Representational_state_transfer#Architectural_constraints) di REST: un modo coerente di definire le interfacce che permette ai sistemi di collaborare.

Questa interpretazione corrisponde al [secondo livello di maturità REST](https://martinfowler.com/articles/richardsonMaturityModel.html) del modello Richardson. Secondo la definizione di Fielding non abbiamo ancora una vera [API REST](http://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven), come del resto la maggior parte delle API comunemente definite REST.

Altrove questo semplice modello [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) viene chiamato [architettura orientata alle risorse](https://en.wikipedia.org/wiki/Resource-oriented_architecture). Evitiamo di fermarci sulla terminologia e torniamo all'applicazione.

### Recuperare una singola risorsa

Creiamo una [route](https://expressjs.com/en/5x/guide/routing/) per recuperare una singola nota, usando indirizzi come <i>notes/10</i>.

In Express i [parametri di route](https://expressjs.com/en/5x/guide/routing/#route-parameters) si definiscono con i due punti:

```js
app.get('/api/notes/:id', (request, response) => {
  const id = request.params.id
  const note = notes.find(note => note.id === id)
  response.json(note)
})
```

<code>app.get('/api/notes/:id', ...)</code> gestisce ogni GET del tipo <i>/api/notes/QUALCOSA</i>. Il parametro è disponibile nell'oggetto request:

```js
const id = request.params.id
```

Il metodo _find_ individua la nota con l'id richiesto, che viene restituita al mittente.

Proviamo <http://localhost:3001/api/notes/1>:

![una singola nota JSON](../../images/3/9new.png)

Se cerchiamo un id inesistente, il server risponde con codice 200 ma senza dati:

![risposta 200 con content-length 0](../../images/3/10ea.png)

Questo accade perché _note_ vale _undefined_. Il server dovrebbe invece rispondere con [404 Not Found](https://www.rfc-editor.org/rfc/rfc9110.html#name-404-not-found):

```js
app.get('/api/notes/:id', (request, response) => {
  const id = request.params.id
  const note = notes.find(note => note.id === id)
  
  // highlight-start
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
  // highlight-end
})
```

Il metodo [status](https://expressjs.com/en/5x/api/response/#resstatuscode) imposta lo stato; [end](https://expressjs.com/en/5x/api/response/#resenddata-encoding-callback) termina la risposta senza dati.

La condizione sfrutta il fatto che gli oggetti sono [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy), mentre _undefined_ è [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy).

Per un'API destinata all'uso da parte di programmi è sufficiente il codice di stato; non serve una pagina di errore come nei siti web. È comunque possibile [personalizzare il messaggio 404](https://stackoverflow.com/questions/14154337/how-to-send-a-custom-http-status-message-in-node-express/36507614#36507614).

### Eliminare risorse

Implementiamo l'eliminazione mediante una richiesta HTTP DELETE all'URL della risorsa:

```js
app.delete('/api/notes/:id', (request, response) => {
  const id = request.params.id
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})
```

Rispondiamo con [204 No Content](https://www.rfc-editor.org/rfc/rfc9110.html#name-204-no-content) senza dati. Non esiste consenso tra 204 e 404 quando la risorsa non esiste; per semplicità risponderemo sempre 204.

### Postman

Le GET sono facili da provare dal browser, le DELETE meno. Esistono diversi strumenti, tra cui [curl](https://curl.haxx.se) e [Postman](https://www.postman.com).

Installate il client desktop di Postman dalla [pagina ufficiale](https://www.postman.com/downloads/) oppure la relativa estensione verificata per VS Code:

![richiesta DELETE in Postman](../../images/3/11x.png)

È sufficiente indicare l'URL e selezionare DELETE. Con una successiva GET a <http://localhost:3001/api/notes> possiamo verificare che la nota non sia più presente.

I dati sono ancora inseriti nel codice e non in un database: riavviando l'applicazione, l'elenco torna allo stato iniziale.

### REST Client per Visual Studio Code

Chi usa Visual Studio Code può installare l'estensione [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) al posto di Postman.

Create nella radice la directory <i>requests</i> e salvatevi le richieste in file con estensione <i>.rest</i>. Per esempio, create <i>get_all_notes.rest</i>:

![file REST con la richiesta di tutte le note](../../images/3/12ea.png)

Facendo clic su <i>Send Request</i>, la richiesta viene eseguita e la risposta si apre nell'editor:

![risposta visualizzata in VS Code](../../images/3/13new.png)

### Client HTTP di WebStorm

Chi usa *IntelliJ WebStorm* può utilizzare il client HTTP integrato in modo analogo. Create un file `.rest` e seguite le opzioni mostrate dall'editor; la [guida ufficiale](https://www.jetbrains.com/help/webstorm/http-client-in-product-code-editor.html) contiene maggiori dettagli.

### Ricevere dati

Permettiamo ora di aggiungere note con una POST a <http://localhost:3001/api/notes>, inviando i dati JSON nel [corpo](https://www.rfc-editor.org/rfc/rfc9112#name-message-body) della richiesta.

Per accedervi usiamo il parser JSON di Express, attivato con _app.use(express.json())_:

```js
const express = require('express')
const app = express()

app.use(express.json())  // highlight-line

//...

// highlight-start
app.post('/api/notes', (request, response) => {
  const note = request.body
  console.log(note)

  response.json(note)
})
// highlight-end
```

Il gestore accede ai dati tramite _request.body_. Senza il parser, <i>body</i> sarebbe undefined. Il middleware converte il JSON in un oggetto JavaScript e lo assegna a request prima che venga chiamata la route.

Per ora stampiamo i dati e li restituiamo senza salvarli. Verifichiamo con Postman, impostando URL, metodo e corpo:

![richiesta POST con dati JSON in Postman](../../images/3/14new.png)

La console mostra i dati ricevuti:

![dati ricevuti stampati nel terminale](../../images/3/15c.png)

**Nota:** durante lo sviluppo del backend tenete sempre visibile il terminale dell'applicazione. Il server si riavvia dopo le modifiche e gli errori diventano immediatamente visibili:

![errore di sintassi nella console](../../images/3/16_25.png)

Controllate la console anche per verificare il comportamento delle richieste e aggiungete liberamente <em>console.log</em> durante lo sviluppo.

Un <i>Content-Type</i> errato può causare problemi, per esempio se in Postman il tipo del body è sbagliato:

![Postman usa un contenuto di tipo text](../../images/3/17new.png)

L'header diventa <i>text/plain</i>:

![header Content-Type text/plain](../../images/3/18new.png)

e il server riceve soltanto un oggetto vuoto:

![oggetto vuoto nella console](../../images/3/19_25.png)

Senza l'header corretto il server non tenta di indovinare il formato, dato l'enorme numero di possibili [tipi MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types).

Con REST Client, create <i>create_note.rest</i> seguendo la [documentazione](https://github.com/Huachao/vscode-restclient/blob/master/README.md#usage):

![richiesta POST JSON in VS Code](../../images/3/20new.png)

Il vantaggio è che le richieste restano nel repository e possono essere condivise col gruppo. Un file può contenerne più di una, separate da `###`:

```text
GET http://localhost:3001/api/notes/

###
POST http://localhost:3001/api/notes/ HTTP/1.1
content-type: application/json

{
    "name": "sample",
    "time": "Wed, 21 Oct 2015 18:27:50 GMT"
}
```

Anche Postman salva le richieste, ma può diventare disordinato lavorando su molti progetti.

> **Osservazione importante**
>
> Durante il debugging può servire conoscere gli header della richiesta. Il metodo [get](https://expressjs.com/en/5x/api/request/#reqgetfield) di request restituisce un singolo header; la proprietà <i>headers</i> li contiene tutti.
>
> In REST Client, una riga vuota tra la prima riga e gli header fa interpretare questi ultimi come assenti. Il backend non saprà quindi che i dati sono JSON.
>
> Potete individuare il problema stampando tutti gli header con _console.log(request.headers)_.

Completiamo ora il gestore:

```js
app.post('/api/notes', (request, response) => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => Number(n.id))) 
    : 0

  const note = request.body
  note.id = String(maxId + 1)

  notes = notes.concat(note)

  response.json(note)
})
```

Troviamo l'id massimo e assegniamo alla nuova nota _maxId + 1_ come stringa. Non è un metodo consigliato, ma verrà sostituito presto.

La POST permette ancora proprietà arbitrarie. Imponiamo che <i>content</i> non sia vuoto, assegniamo a <i>important</i> il valore predefinito false e scartiamo le altre proprietà:

```js
const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  const note = {
    content: body.content,
    important: body.important || false,
    id: generateId(),
  }

  notes = notes.concat(note)

  response.json(note)
})
```

La generazione dell'id è stata estratta in _generateId_. Se manca <i>content</i>, il server risponde con [400 Bad Request](https://www.rfc-editor.org/rfc/rfc9110.html#name-400-bad-request):

```js
if (!body.content) {
  return response.status(400).json({ 
    error: 'content missing' 
  })
}
```

Il `return` è fondamentale: senza di esso l'esecuzione proseguirebbe e salverebbe comunque la nota non valida.

Se <i>important</i> manca, usiamo false:

```js
important: body.important || false,
```

Se _body.important_ esiste ed è [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy), l'espressione restituisce quel valore; altrimenti è _undefined_, quindi [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy), e restituisce false. Più precisamente, anche se la proprietà vale false, il risultato sarà il false a destra dell'operatore.

Il codice completo è nel branch <i>part3-1</i> di [questo repository](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part3-1):

![branch part3-1 su GitHub](../../images/3/21.png)

Dopo aver clonato il progetto, eseguite _npm install_ prima di _npm start_ o _npm run dev_.

Osserviamo infine la generazione degli id:

```js
const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => Number(n.id)))
    : 0
  return String(maxId + 1)
}
```

La riga:

```js
Math.max(...notes.map(n => Number(n.id)))
```

trasforma prima gli id in un array di numeri. [Math.max](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max) richiede però numeri separati; la sintassi [spread](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) `...` espande l'array nei singoli argomenti.

</div>

<div class="tasks">

### Esercizi 3.1.-3.6.

**Nota:** non si tratta di frontend o React. L'applicazione **non va creata** con Vite, ma con <em>npm init</em> come descritto sopra.

Non aggiungete <i>node_modules</i> al controllo di versione. _npm init_ non crea automaticamente <i>.gitignore_: createlo nella radice e aggiungete la riga `node_modules`.

**Raccomandazione:** mentre lavorate al backend, controllate sempre il terminale in cui è in esecuzione.

#### 3.1: Backend della rubrica, passo 1

Create un'applicazione Node che restituisca da <http://localhost:3001/api/persons> questo elenco inserito nel codice:

```js
[
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]
```

Risultato della GET nel browser:

![quattro persone JSON da api/persons](../../images/3/22e.png)

La barra in <i>api/persons</i> è un normale carattere della stringa. L'applicazione deve avviarsi con _npm start_ e offrire anche _npm run dev_, che riavvia il server quando cambia un file sorgente.

#### 3.2: Backend della rubrica, passo 2

Implementate all'indirizzo <http://localhost:3001/info> una pagina simile a questa:

![pagina info dell'esercizio 3.2](../../images/3/23x.png)

La pagina deve mostrare l'ora di ricezione della richiesta e il numero di persone presenti nella rubrica in quel momento.

#### 3.3: Backend della rubrica, passo 3

Implementate la visualizzazione di una singola persona. La persona con id 5 deve essere disponibile a <http://localhost:3001/api/persons/5>. Se non esiste, rispondete con il codice di stato appropriato.

#### 3.4: Backend della rubrica, passo 4

Implementate l'eliminazione di una persona mediante DELETE al suo URL univoco. Verificate il funzionamento con Postman o REST Client.

#### 3.5: Backend della rubrica, passo 5

Consentite di aggiungere persone mediante POST a <http://localhost:3001/api/persons>. Generate l'id con [Math.random](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random), usando un intervallo abbastanza ampio da rendere improbabili i duplicati.

#### 3.6: Backend della rubrica, passo 6

Gestite gli errori durante la creazione. La richiesta non deve riuscire se:

- manca il nome o il numero;
- il nome è già presente nella rubrica.

Rispondete con il codice appropriato e un messaggio che spieghi l'errore, per esempio:

```js
{ error: 'name must be unique' }
```

</div>

<div class="content">

### Tipi di richieste HTTP

Lo [standard HTTP](https://www.rfc-editor.org/rfc/rfc9110.html#name-common-method-properties) descrive due proprietà dei metodi: **sicurezza** e **idempotenza**.

Una richiesta GET dovrebbe essere <i>sicura</i>:

> <i>La convenzione stabilisce che i metodi GET e HEAD non dovrebbero avere altro significato oltre al recupero di dati. Questi metodi vanno considerati «sicuri».</i>

Una richiesta sicura non produce <i>effetti collaterali</i> sul server: non modifica lo stato del database e restituisce soltanto dati già esistenti.

Il metodo non può garantire da solo la sicurezza; è una raccomandazione dello standard. In un'API conforme ai principi REST, le GET vengono usate in modo sicuro.

Anche [HEAD](https://www.rfc-editor.org/rfc/rfc9110.html#name-head) dovrebbe essere sicuro. Funziona come GET, ma restituisce soltanto codice di stato e header, senza il corpo.

Tutte le richieste HTTP tranne POST dovrebbero essere <i>idempotenti</i>:

> <i>Un metodo è idempotente quando gli effetti collaterali di N richieste identiche, con N maggiore di zero, sono gli stessi di una singola richiesta. GET, HEAD, PUT e DELETE condividono questa proprietà.</i>

Se la richiesta produce effetti, il risultato deve quindi essere lo stesso indipendentemente dal numero di esecuzioni. Ripetere una PUT a <i>/api/notes/10</i> con <em>{ content: "no side effects!", important: true }</em> produce sempre lo stesso stato.

Anche l'idempotenza è una raccomandazione, non una garanzia automatica del metodo. Nelle API REST, GET, HEAD, PUT e DELETE vanno implementati in modo idempotente.

POST non è né sicuro né idempotente: cinque POST identiche a <i>/api/notes</i> creano cinque note distinte con lo stesso contenuto.

### Middleware

Il parser JSON di Express usato in precedenza è un [middleware](https://expressjs.com/en/resources/middleware/body-parser/).

I middleware sono funzioni che elaborano gli oggetti _request_ e _response_. Il parser legge i dati grezzi della richiesta, li converte in un oggetto JavaScript e li assegna alla proprietà <i>request.body</i>.

Possiamo usare più middleware; vengono eseguiti uno dopo l'altro nell'ordine in cui compaiono nel codice.

Creiamo un middleware che stampi ogni richiesta:

```js
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
```

Alla fine chiamiamo _next_, che passa il controllo al middleware successivo.

Il middleware si attiva con:

```js
app.use(requestLogger)
```

L'ordine è importante: <i>express.json()</i> deve precedere <i>requestLogger</i>, altrimenti <i>request.body</i> non sarà ancora inizializzato.

I middleware che devono precedere i gestori delle route vanno dichiarati prima delle route. Altri possono essere collocati dopo: verranno chiamati soltanto se nessuna route ha gestito la richiesta.

Aggiungiamo alla fine un middleware per gli endpoint inesistenti:

```js
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
```

Il codice completo si trova nel branch <i>part3-2</i> di [questo repository](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part3-2).

</div>

<div class="tasks">

### Esercizi 3.7.-3.8.

#### 3.7: Backend della rubrica, passo 7

Aggiungete all'applicazione il middleware [Morgan](https://github.com/expressjs/morgan) per il logging e configuratelo con il formato <i>tiny</i>.

La documentazione di Morgan non è particolarmente semplice: può essere necessario dedicarle un po' di tempo. Imparare a interpretare documentazione poco immediata è comunque una competenza importante.

Morgan si installa con _npm install_ e si attiva, come gli altri middleware, con _app.use_.

#### 3.8*: Backend della rubrica, passo 8

Configurate Morgan affinché mostri anche i dati inviati nelle richieste POST:

![Morgan mostra i dati della POST](../../images/3/24.png)

Anche registrare dati nella console può essere pericoloso: potrebbero contenere informazioni sensibili e violare norme come il GDPR. Nell'esercizio non è necessario gestire questo aspetto, ma nella pratica non registrate dati sensibili.

L'esercizio può essere impegnativo, anche se richiede poco codice. Una possibile soluzione usa:

- la [creazione di nuovi token](https://github.com/expressjs/morgan#creating-new-tokens);
- [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify).

</div>
