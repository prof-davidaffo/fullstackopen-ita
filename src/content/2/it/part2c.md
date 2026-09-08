---
mainImage: ../../../images/part-2.svg
part: 2
letter: c
lang: it
---

<div class="content">

Finora abbiamo lavorato soltanto sul «frontend», cioè sulle funzionalità eseguite dal lato client, nel browser. Inizieremo a lavorare sul «backend», cioè sulle funzionalità eseguite dal lato server, nella [terza parte](/it/part3) del corso. Facciamo comunque già un passo in quella direzione, imparando come il codice eseguito nel browser comunica con il backend.

Come server useremo [JSON Server](https://github.com/typicode/json-server), uno strumento pensato per lo sviluppo software.

Create un file chiamato <i>db.json</i> nella directory principale del progetto <i>notes</i> realizzato in precedenza e inseritevi il seguente contenuto:

```json
{
  "notes": [
    {
      "id": "1",
      "content": "HTML is easy",
      "important": true
    },
    {
      "id": "2",
      "content": "Browser can execute only JavaScript",
      "important": false
    },
    {
      "id": "3",
      "content": "GET and POST are the most important methods of HTTP protocol",
      "important": true
    }
  ]
}
```

Potete avviare JSON Server senza installarlo separatamente, eseguendo il seguente comando _npx_ nella directory principale dell'applicazione:

```js
npx json-server --port 3001 db.json
```

Per impostazione predefinita JSON Server usa la porta 3000, ma noi gli assegniamo la porta alternativa 3001. Aprite nel browser l'indirizzo <http://localhost:3001/notes>. JSON Server restituisce in formato JSON le note che abbiamo scritto nel file:

![le note in formato JSON nel browser all'indirizzo localhost:3001/notes](../../images/2/14new.png)

Se il browser non formatta i dati JSON, potete installare un'estensione adatta, per esempio [JSONView](https://chromewebstore.google.com/detail/gmegofmjomhknnokphhckolhcffdaihd), per renderli più leggibili.

D'ora in avanti salveremo le note sul server, che in questo caso significa salvarle tramite json-server. Il codice React recupera le note dal server e le mostra sullo schermo. Quando viene aggiunta una nuova nota, il codice React la invia anche al server, così che rimanga memorizzata.

json-server conserva tutti i dati nel file <i>db.json</i> presente sul server. In un'applicazione reale, i dati verrebbero salvati in un database. json-server è però uno strumento pratico: durante lo sviluppo ci permette di usare funzionalità lato server senza doverle ancora programmare.

Studieremo più in dettaglio i principi dell'implementazione lato server nella [parte 3](/it/part3) del corso.

### Il browser come ambiente di esecuzione

Il nostro primo compito consiste nel recuperare nell'applicazione React le note già presenti all'indirizzo <http://localhost:3001/notes>.

Nel [progetto di esempio](/it/part0/fondamenti_delle_applicazioni_web#esecuzione-della-logica-applicativa-nel-browser) della parte 0 abbiamo già visto come recuperare dati da un server con JavaScript. L'esempio usava [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest), cioè una richiesta HTTP eseguita mediante un oggetto XHR. È una tecnica introdotta nel 1999 e supportata da molto tempo da tutti i browser.

Oggi l'uso di XHR non è più consigliato. I browser supportano ampiamente il metodo [fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch), basato sulle cosiddette [promesse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), anziché sul modello a eventi usato da XHR.

Come promemoria della parte 0, e ricordando che questo metodo <i>non va usato</i> senza un motivo concreto, con XHR i dati venivano recuperati così:

```js
const xhttp = new XMLHttpRequest()

xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    const data = JSON.parse(this.responseText)
    // gestisce la risposta salvata nella variabile data
  }
}

xhttp.open('GET', '/data.json', true)
xhttp.send()
```

All'inizio registriamo sull'oggetto <em>xhttp</em>, che rappresenta la richiesta HTTP, un <i>gestore di eventi</i>. L'ambiente di esecuzione JavaScript lo chiamerà ogni volta che cambia lo stato dell'oggetto. Se il cambiamento indica che è arrivata la risposta alla richiesta, i dati vengono elaborati.

È importante notare che il codice del gestore viene definito prima che la richiesta sia inviata al server, ma sarà eseguito in un momento successivo. Il codice non procede quindi in modo sincrono «dall'alto verso il basso», bensì in modo <i>asincrono</i>: JavaScript chiamerà a un certo punto il gestore registrato per la richiesta.

Un modo sincrono di eseguire richieste, comune per esempio in Java, funzionerebbe così (nota: questo non è codice Java realmente funzionante):

```java
HTTPRequest request = new HTTPRequest();

String url = "/exampleapp/data.json";
List<Note> notes = request.get(url);

notes.forEach(m => {
  System.out.println(m.content);
});
```

In Java il codice viene eseguito riga per riga e si ferma ad attendere il completamento della richiesta HTTP, cioè del comando _request.get(...)_. I dati restituiti, in questo caso le note, vengono poi salvati in una variabile ed elaborati nel modo desiderato.

I motori JavaScript, cioè gli ambienti di esecuzione, seguono invece un [modello asincrono](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop). In linea di principio, tutte le [operazioni di input/output](https://en.wikipedia.org/wiki/Input/output), salvo alcune eccezioni, devono essere non bloccanti. L'esecuzione del codice prosegue immediatamente dopo la chiamata di una funzione di I/O, senza aspettare che restituisca un risultato.

Quando un'operazione asincrona termina, o più precisamente in un momento successivo al suo completamento, il motore JavaScript chiama i gestori di eventi registrati per quell'operazione.

I motori JavaScript sono attualmente <i>single-threaded</i>: non possono eseguire codice in parallelo. Per questo, nella pratica, le operazioni di I/O devono seguire un modello non bloccante; altrimenti il browser si «bloccherebbe», per esempio durante il recupero di dati da un server.

Una conseguenza dell'esecuzione su un singolo thread è che, se un'operazione richiede molto tempo, il browser non risponde per tutta la sua durata. Se aggiungiamo il seguente codice all'inizio del componente <i>App</i>:

```js
const App = (props) => {
  const [notes, setNotes] = useState(props.notes)
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)

  // highlight-start
  setTimeout(() => {
    console.log('loop..')
    let i = 0
    while (i < 99999999999) {
      i++
    }
    console.log('end')
  }, 5000)
  // highlight-end

  // ...
}
```

per cinque secondi tutto funziona normalmente. Quando viene eseguita la funzione passata a <em>setTimeout</em>, la pagina non risponde per tutta la durata del lungo ciclo: non è possibile fare clic sui pulsanti né usare altre funzionalità.

Affinché il browser rimanga <i>reattivo</i>, cioè risponda alle azioni dell'utente con sufficiente rapidità, la logica del programma deve evitare che una singola operazione richieda troppo tempo.

Su Internet si trova molto altro materiale sull'argomento. Una spiegazione particolarmente chiara è l'intervento di Philip Roberts [What the heck is the event loop anyway?](https://www.youtube.com/watch?v=8aGhZQkoFbQ)

Nei browser moderni è possibile eseguire codice in parallelo mediante i cosiddetti [web worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers). L'event loop di una singola finestra del browser viene comunque gestito da un solo [thread](https://medium.com/techtrument/multithreading-javascript-46156179cf9a).

### npm

Torniamo al recupero dei dati dal server.

Potremmo usare la funzione [fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch), basata sulle promesse e già menzionata. Fetch è un ottimo strumento, standardizzato e supportato da tutti i browser moderni, escluso Internet Explorer.

Per la comunicazione tra browser e server useremo però la libreria [axios](https://github.com/axios/axios). Funziona in modo simile a fetch, ma è per certi aspetti più comoda. Inoltre ci consente di imparare come aggiungere ai progetti React librerie esterne, cioè <i>pacchetti npm</i>.

Oggi quasi tutti i progetti JavaScript vengono definiti usando il gestore di pacchetti di Node, [npm](https://docs.npmjs.com/about-npm). Anche i progetti creati con Vite seguono il formato npm. La presenza del file <i>package.json</i> nella directory principale indica chiaramente che un progetto usa npm:

```json
{
  "name": "part2-notes-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.17.0",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.17.0",
    "eslint-plugin-react": "^7.37.2",
    "eslint-plugin-react-hooks": "^5.0.0",
    "eslint-plugin-react-refresh": "^0.4.16",
    "globals": "^15.14.0",
    "vite": "^6.0.5"
  }
}
```

Per ora ci interessa soprattutto la sezione <i>dependencies</i>, che specifica le <i>dipendenze</i>, cioè le librerie esterne usate dal progetto.

Vogliamo usare axios. In teoria potremmo aggiungere direttamente la libreria al file <i>package.json</i>, ma è preferibile installarla dalla riga di comando:

```js
npm install axios
```

**Nota: i comandi _npm_ devono essere sempre eseguiti nella directory principale del progetto**, dove si trova il file <i>package.json</i>.

Axios compare ora tra le altre dipendenze:

```json
{
  "name": "part2-notes-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.7.9", // highlight-line
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  // ...
}
```

Oltre ad aggiungere axios alle dipendenze, il comando <em>npm install</em> ha anche <i>scaricato</i> il codice della libreria. Come le altre dipendenze, questo si trova nella directory <i>node_modules</i> alla radice del progetto, che contiene una notevole quantità di materiale.

Facciamo un'altra aggiunta. Installiamo <i>json-server</i> come dipendenza di sviluppo, usata cioè soltanto durante lo sviluppo:

```js
npm install json-server --save-dev
```

e aggiungiamo una riga alla sezione <i>scripts</i> del file <i>package.json</i>:

```json
{
  // ... 
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "server": "json-server -p 3001 db.json" // highlight-line
  },
}
```

Ora possiamo avviare comodamente json-server dalla directory principale del progetto, senza specificare altri parametri:

```js
npm run server
```

Approfondiremo lo strumento _npm_ nella [terza parte del corso](/it/part3).

**Nota:** prima di avviare un nuovo json-server dovete terminare quello già in esecuzione; in caso contrario si verificherà un errore:

![errore: impossibile usare la porta 3001](../../images/2/15b.png)

La scritta rossa nel messaggio ci informa del problema:

<i>Cannot bind to port 3001. Please specify another port number either through --port argument or through the json-server.json configuration file</i>

L'applicazione non riesce a usare la [porta](https://en.wikipedia.org/wiki/Port_(computer_networking)) 3001 perché è già occupata dal json-server avviato in precedenza.

Abbiamo usato due volte il comando _npm install_, con una piccola differenza:

```js
npm install axios
npm install json-server --save-dev
```

I parametri sono leggermente diversi. <i>axios</i> viene installato come dipendenza necessaria durante l'esecuzione, perché il programma ne ha bisogno per funzionare. <i>json-server</i> viene invece installato come dipendenza di sviluppo (_--save-dev_), dato che non è richiesto dal programma vero e proprio, ma soltanto come supporto durante lo sviluppo. Approfondiremo i diversi tipi di dipendenza nella prossima parte del corso.

### Axios e le promesse

Ora siamo pronti a usare Axios. D'ora in avanti supporremo che json-server sia in esecuzione sulla porta 3001.

Nota: per eseguire contemporaneamente json-server e l'applicazione React potrebbero servire due finestre del terminale, una per ciascun processo.

La libreria si importa come le altre, mediante un'istruzione <em>import</em> appropriata.

Aggiungiamo al file <i>main.jsx</i> le righe seguenti:

```js
import axios from 'axios'

const promise = axios.get('http://localhost:3001/notes')
console.log(promise)

const promise2 = axios.get('http://localhost:3001/foobar')
console.log(promise2)
```

Aprendo <http://localhost:5173/> nel browser, la console dovrebbe mostrare quanto segue:

![promesse visualizzate nella console](../../images/2/16new.png)

Il metodo _get_ di Axios restituisce una [promessa](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises).

La documentazione di Mozilla descrive così le promesse:

> <i>Una Promise è un oggetto che rappresenta il futuro completamento o fallimento di un'operazione asincrona.</i>

In altre parole, una promessa è un oggetto che rappresenta un'operazione asincrona e può trovarsi in tre stati diversi:

- la promessa è <i>pending</i>, in attesa: l'operazione asincrona non è ancora terminata e il valore finale non è disponibile;
- la promessa è <i>fulfilled</i>, mantenuta: l'operazione è terminata e il valore finale è disponibile; in genere rappresenta un'operazione riuscita;
- la promessa è <i>rejected</i>, rifiutata: un errore ha impedito di determinare il valore finale; in genere rappresenta un'operazione fallita.

Le promesse comprendono molti altri dettagli, ma per il momento è sufficiente conoscere questi tre stati. Potete approfondire l'argomento nella [documentazione di Mozilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

La prima promessa dell'esempio è <i>fulfilled</i> e rappresenta una richiesta _axios.get('http://localhost:3001/notes')_ riuscita. La seconda è invece <i>rejected</i>; la console ne indica il motivo: abbiamo tentato una richiesta HTTP GET verso un indirizzo inesistente.

Per accedere al risultato dell'operazione rappresentata dalla promessa dobbiamo registrarvi un gestore di eventi. Lo facciamo con il metodo <em>then</em>:

```js
const promise = axios.get('http://localhost:3001/notes')

promise.then(response => {
  console.log(response)
})
```

La console mostra:

![oggetto JSON visualizzato nella console](../../images/2/17new.png)

L'ambiente di esecuzione JavaScript chiama la funzione di callback registrata con <em>then</em>, passandole come parametro un oggetto <em>response</em>. Questo contiene tutti i dati essenziali della risposta HTTP GET, tra cui i <i>dati</i> restituiti, il <i>codice di stato</i> e gli <i>header</i>.

Di solito non è necessario memorizzare l'oggetto promessa in una variabile. È comune concatenare la chiamata al metodo <em>then</em> direttamente a quella del metodo Axios:

```js
axios.get('http://localhost:3001/notes').then(response => {
  const notes = response.data
  console.log(notes)
})
```

La callback estrae ora i dati dalla risposta, li memorizza in una variabile e stampa le note nella console.

Per rendere più leggibile una sequenza di chiamate <i>concatenate</i>, possiamo disporre ciascuna chiamata su una riga distinta:

```js
axios
  .get('http://localhost:3001/notes')
  .then(response => {
    const notes = response.data
    console.log(notes)
  })
```

I dati restituiti dal server sono testo semplice, in pratica un'unica lunga stringa. Axios riesce comunque a convertirli in un array JavaScript, perché il server ha indicato il formato <i>application/json; charset=utf-8</i> tramite l'header <i>content-type</i>, come si vede nell'immagine precedente.

Possiamo finalmente usare i dati recuperati dal server.

Proviamo a richiedere le note al server locale e a renderizzarle inizialmente insieme al componente App. Questo approccio presenta diversi problemi, perché renderizziamo l'intero componente <i>App</i> soltanto dopo aver ricevuto con successo una risposta:

```js
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App'

axios.get('http://localhost:3001/notes').then(response => {
  const notes = response.data
  ReactDOM.createRoot(document.getElementById('root')).render(<App notes={notes} />)
})
```

In alcune circostanze questo metodo potrebbe essere accettabile, ma è piuttosto problematico. Spostiamo invece il recupero dei dati nel componente <i>App</i>.

Non è però immediatamente chiaro dove collocare il comando <em>axios.get</em> all'interno del componente.

### Hook di effetto

Abbiamo già usato gli [hook di stato](https://react.dev/learn/state-a-components-memory), introdotti con React [16.8.0](https://www.npmjs.com/package/react/v/16.8.0), che forniscono uno stato ai componenti React definiti come funzioni, i cosiddetti <i>componenti funzionali</i>. La stessa versione ha introdotto anche gli [hook di effetto](https://react.dev/reference/react/hooks#effect-hooks). Secondo la documentazione ufficiale:

> <i>Gli effetti consentono a un componente di connettersi e sincronizzarsi con sistemi esterni.</i>
> <i>Ciò comprende la rete, il DOM del browser, le animazioni, i widget scritti con altre librerie per l'interfaccia e altro codice non React.</i>

Gli hook di effetto sono quindi lo strumento adatto per recuperare dati da un server.

Rimuoviamo il recupero dei dati da <i>main.jsx</i>. Dato che le note verranno richieste al server, non dobbiamo più passarle come props al componente <i>App</i>. Possiamo semplificare <i>main.jsx</i> così:

```js
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

Il componente <i>App</i> cambia nel modo seguente:

```js
import { useState, useEffect } from 'react' // highlight-line
import axios from 'axios' // highlight-line
import Note from './components/Note'

const App = () => { // highlight-line
  const [notes, setNotes] = useState([]) // highlight-line
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)

// highlight-start
  useEffect(() => {
    console.log('effect')
    axios
      .get('http://localhost:3001/notes')
      .then(response => {
        console.log('promise fulfilled')
        setNotes(response.data)
      })
  }, [])

  console.log('render', notes.length, 'notes')
// highlight-end

  // ...
}
```

Abbiamo aggiunto anche alcune stampe utili per chiarire l'ordine di esecuzione.

La console mostra:

```
render 0 notes
effect
promise fulfilled
render 3 notes
```

Per prima cosa viene eseguito il corpo della funzione che definisce il componente, che viene quindi renderizzato per la prima volta. La scritta <i>render 0 notes</i> indica che i dati non sono ancora stati recuperati dal server.

La funzione seguente, chiamata effetto nella terminologia React:

```js
() => {
  console.log('effect')
  axios
    .get('http://localhost:3001/notes')
    .then(response => {
      console.log('promise fulfilled')
      setNotes(response.data)
    })
}
```

viene eseguita subito dopo il rendering. La funzione stampa <i>effect</i> nella console; il comando <em>axios.get</em> avvia il recupero dei dati dal server e registra come <i>gestore di eventi</i> dell'operazione la funzione seguente:

```js
response => {
  console.log('promise fulfilled')
  setNotes(response.data)
})
```

Quando i dati arrivano dal server, l'ambiente JavaScript chiama la funzione registrata. Questa stampa <i>promise fulfilled</i> e salva nello stato le note ricevute mediante <em>setNotes(response.data)</em>.

Come sempre, chiamare una funzione che aggiorna lo stato provoca un nuovo rendering del componente. Di conseguenza la console mostra <i>render 3 notes</i> e le note recuperate dal server vengono visualizzate.

Osserviamo infine la definizione completa dell'hook di effetto:

```js
useEffect(() => {
  console.log('effect')
  axios
    .get('http://localhost:3001/notes').then(response => {
      console.log('promise fulfilled')
      setNotes(response.data)
    })
}, [])
```

Riscriviamo il codice in modo leggermente diverso:

```js
const hook = () => {
  console.log('effect')
  axios
    .get('http://localhost:3001/notes')
    .then(response => {
      console.log('promise fulfilled')
      setNotes(response.data)
    })
}

useEffect(hook, [])
```

Ora è più evidente che la funzione [useEffect](https://react.dev/reference/react/useEffect) riceve <i>due parametri</i>. Il primo è una funzione, cioè l'<i>effetto</i> stesso. Secondo la documentazione:

> <i>Per impostazione predefinita, gli effetti vengono eseguiti dopo ogni rendering completato, ma è possibile eseguirli soltanto quando cambiano determinati valori.</i>

Per impostazione predefinita, quindi, l'effetto viene eseguito <i>sempre</i> dopo il rendering del componente. Nel nostro caso vogliamo invece eseguirlo soltanto in corrispondenza del primo rendering.

Il secondo parametro di <em>useEffect</em> serve a [specificare quando eseguire l'effetto](https://react.dev/reference/react/useEffect#parameters). Se è un array vuoto, <em>[]</em>, l'effetto viene eseguito soltanto con il primo rendering del componente.

Un hook di effetto ha molti altri possibili utilizzi oltre al recupero di dati dal server. Per il momento, tuttavia, questo uso è sufficiente.

Ripensate alla sequenza di eventi appena descritta. Quali parti del codice vengono eseguite? In quale ordine? Quante volte? Comprendere l'ordine degli eventi è fondamentale.

Avremmo potuto scrivere la funzione dell'effetto anche così:

```js
useEffect(() => {
  console.log('effect')

  const eventHandler = response => {
    console.log('promise fulfilled')
    setNotes(response.data)
  }

  const promise = axios.get('http://localhost:3001/notes')
  promise.then(eventHandler)
}, [])
```

Alla variabile <em>eventHandler</em> viene assegnato un riferimento alla funzione che gestisce l'evento. La promessa restituita dal metodo <em>get</em> di Axios viene memorizzata nella variabile <em>promise</em>. Registriamo la callback passando al metodo <em>then</em> la variabile <em>eventHandler</em>, che fa riferimento al gestore. In genere non è necessario assegnare funzioni e promesse a variabili: è sufficiente la forma più compatta vista qui sotto.

```js
useEffect(() => {
  console.log('effect')
  axios
    .get('http://localhost:3001/notes')
    .then(response => {
      console.log('promise fulfilled')
      setNotes(response.data)
    })
}, [])
```

La nostra applicazione presenta ancora un problema: quando aggiungiamo nuove note, queste non vengono memorizzate sul server.

Il codice completo dell'applicazione descritta finora si trova su [GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part2-4), nel branch <i>part2-4</i>.

### L'ambiente di esecuzione durante lo sviluppo

La configurazione dell'intera applicazione è diventata progressivamente più complessa. Rivediamo cosa accade e dove. L'immagine seguente descrive la composizione dell'applicazione:

![diagramma della composizione dell'applicazione React](../../images/2/18e.png)

Il codice JavaScript dell'applicazione React viene eseguito nel browser. Il browser riceve il codice dal <i>server di sviluppo React</i>, cioè l'applicazione avviata dal comando <em>npm run dev</em>. Il server di sviluppo trasforma JavaScript in un formato comprensibile dal browser e, tra le altre cose, riunisce il codice proveniente da file diversi in un unico file. Approfondiremo il server di sviluppo nella parte 7 del corso.

L'applicazione React eseguita nel browser recupera i dati in formato JSON da <i>json-server</i>, in esecuzione sulla porta 3001 del computer. Il server a cui richiediamo i dati li legge dal file <i>db.json</i>.

In questa fase dello sviluppo, tutte le parti dell'applicazione si trovano sul computer dello sviluppatore, cioè su localhost. La situazione cambierà quando pubblicheremo l'applicazione su Internet, operazione che svolgeremo nella parte 3.

</div>

<div class="tasks">

<h3>Esercizio 2.11.</h3>

<h4>2.11: La rubrica, passo 6</h4>

Continuiamo a sviluppare la rubrica. Memorizzate lo stato iniziale dell'applicazione nel file <i>db.json</i>, collocato nella directory principale del progetto.

```json
{
  "persons":[
    { 
      "name": "Arto Hellas", 
      "number": "040-123456",
      "id": "1"
    },
    { 
      "name": "Ada Lovelace", 
      "number": "39-44-5323523",
      "id": "2"
    },
    { 
      "name": "Dan Abramov", 
      "number": "12-43-234345",
      "id": "3"
    },
    { 
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122",
      "id": "4"
    }
  ]
}
```

Avviate json-server sulla porta 3001 e verificate che restituisca l'elenco delle persone aprendo nel browser l'indirizzo <http://localhost:3001/persons>.

Se ricevete il seguente messaggio di errore:

```js
events.js:182
      throw er; // Unhandled 'error' event
      ^

Error: listen EADDRINUSE 0.0.0.0:3001
    at Object._errnoException (util.js:1019:11)
    at _exceptionWithHostPort (util.js:1041:20)
```

significa che la porta 3001 è già usata da un'altra applicazione, per esempio da un'istanza di json-server già in esecuzione. Chiudete l'altra applicazione oppure, se non risolve il problema, cambiate porta.

Modificate l'applicazione in modo che lo stato iniziale dei dati venga recuperato dal server tramite la libreria <i>axios</i>. Completate il recupero usando un [hook di effetto](https://react.dev/reference/react/useEffect).

</div>
