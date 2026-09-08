---
mainImage: ../../../images/part-2.svg
part: 2
letter: d
lang: it
---

<div class="content">

Quando creiamo note nella nostra applicazione, vogliamo naturalmente memorizzarle su un server backend. Nella documentazione, il pacchetto [json-server](https://github.com/typicode/json-server) si presenta come una cosiddetta API REST o RESTful:

> <i>Un'API REST fittizia completa, senza scrivere codice, in meno di 30 secondi (davvero)</i>

json-server non corrisponde esattamente alla [definizione](https://en.wikipedia.org/wiki/Representational_state_transfer) teorica di API REST, ma lo stesso vale per molte altre API che si definiscono RESTful.

Approfondiremo REST nella [prossima parte](/it/part3) del corso. È però importante familiarizzare già ora con alcune [convenzioni](https://en.wikipedia.org/wiki/REST#Applied_to_web_services) adottate da json-server e dalle API REST in generale, in particolare l'uso convenzionale delle [route](https://github.com/typicode/json-server#routes), cioè degli URL, e dei tipi di richiesta HTTP.

### REST

Nella terminologia REST, i singoli oggetti di dati, come le note della nostra applicazione, sono chiamati <i>risorse</i>. Ogni risorsa possiede un indirizzo univoco, il suo URL. Secondo la convenzione usata da json-server, la nota con id 3 si trova all'URL <i>notes/3</i>, mentre l'URL <i>notes</i> indica la collezione che contiene tutte le note.

Le risorse vengono recuperate dal server mediante richieste HTTP GET. Una richiesta GET a <i>notes/3</i> restituisce la nota con id 3, mentre una richiesta GET a <i>notes</i> restituisce l'elenco completo.

Per creare una nuova risorsa nota, la convenzione REST seguita da json-server prevede una richiesta HTTP POST all'URL <i>notes</i>. I dati della nuova nota vengono inviati nel <i>body</i> della richiesta.

json-server richiede che i dati siano inviati in formato JSON. In pratica devono essere una stringa formattata correttamente e la richiesta deve contenere l'header <i>Content-Type</i> con valore <i>application/json</i>.

### Inviare dati al server

Modifichiamo così il gestore che crea una nuova nota:

```js
const addNote = event => {
  event.preventDefault()
  const noteObject = {
    content: newNote,
    important: Math.random() < 0.5,
  }

// highlight-start
  axios
    .post('http://localhost:3001/notes', noteObject)
    .then(response => {
      console.log(response)
    })
// highlight-end
}
```

Creiamo un nuovo oggetto nota senza la proprietà <i>id</i>, perché è preferibile lasciare al server la generazione degli identificatori.

L'oggetto viene inviato al server con il metodo <em>post</em> di Axios. Il gestore registrato stampa nella console la risposta restituita dal server.

Quando proviamo a creare una nota, nella console compare quanto segue:

![dati JSON visualizzati nella console](../../images/2/20new.png)

La risorsa appena creata si trova nella proprietà <i>data</i> dell'oggetto _response_.

Spesso è utile esaminare le richieste HTTP nella scheda <i>Network</i> degli strumenti di sviluppo di Chrome, già usata ampiamente all'inizio della [parte 0](/it/part0/fondamenti_delle_applicazioni_web#http-get).

Possiamo verificare che gli header della richiesta POST siano quelli attesi:

![gli strumenti di sviluppo mostrano lo stato 201 Created](../../images/2/21new1.png)

Poiché i dati inviati erano un oggetto JavaScript, Axios ha impostato automaticamente il valore corretto, <i>application/json</i>, nell'header <i>Content-Type</i>.

La scheda <i>Payload</i> consente di controllare i dati della richiesta:

![la scheda Payload mostra content e important](../../images/2/21new2.png)

Anche la scheda <i>Response</i> è utile, perché mostra i dati restituiti dal server:

![la risposta contiene gli stessi dati e anche l'id](../../images/2/21new3.png)

La nuova nota non compare ancora sullo schermo, perché non abbiamo aggiornato lo stato del componente <i>App</i>. Correggiamo il problema:

```js
const addNote = event => {
  event.preventDefault()
  const noteObject = {
    content: newNote,
    important: Math.random() > 0.5,
  }

  axios
    .post('http://localhost:3001/notes', noteObject)
    .then(response => {
      // highlight-start
      setNotes(notes.concat(response.data))
      setNewNote('')
      // highlight-end
    })
}
```

La nota restituita dal backend viene aggiunta allo stato con <em>setNotes</em>, poi il form viene azzerato. Ricordate un [dettaglio importante](/it/part1/stato_complesso_e_debugging_delle_applicazioni_react#gestire-gli-array): <em>concat</em> non modifica lo stato originale, ma crea una nuova copia dell'elenco.

Non appena i dati restituiti dal server influenzano l'applicazione, dobbiamo affrontare nuove difficoltà, tra cui l'asincronia della comunicazione. Le stampe nella console e le altre tecniche di debugging diventano ancora più importanti. Serve inoltre una buona comprensione dell'ambiente JavaScript e dei componenti React: procedere per tentativi non basta.

È utile controllare lo stato del backend, per esempio dal browser:

![dati JSON restituiti dal backend](../../images/2/22.png)

Possiamo così verificare che il server abbia ricevuto tutti i dati inviati. Nella parte successiva implementeremo il nostro backend e vedremo strumenti come [Postman](https://www.postman.com/downloads/); per ora è sufficiente osservare json-server dal browser.

Il codice attuale dell'applicazione è disponibile nel branch <i>part2-5</i> su [GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part2-5).

### Modificare l'importanza delle note

Aggiungiamo a ogni nota un pulsante per cambiarne l'importanza.

Modifichiamo il componente <i>Note</i>:

```js
const Note = ({ note, toggleImportance }) => {
  const label = note.important
    ? 'make not important' : 'make important'

  return (
    <li>
      {note.content} 
      <button onClick={toggleImportance}>{label}</button>
    </li>
  )
}
```

Il pulsante usa come gestore la funzione <em>toggleImportance</em> ricevuta tramite le props.

Il componente <i>App</i> definisce una prima versione del gestore <em>toggleImportanceOf</em> e la passa a ogni componente <i>Note</i>:

```js
const App = () => {
  const [notes, setNotes] = useState([]) 
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)

  // ...

  // highlight-start
  const toggleImportanceOf = (id) => {
    console.log('importance of ' + id + ' needs to be toggled')
  }
  // highlight-end

  // ...

  return (
    <div>
      <h1>Notes</h1>
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all' }
        </button>
      </div>      
      <ul>
        {notesToShow.map(note => 
          <Note
            key={note.id}
            note={note} 
            toggleImportance={() => toggleImportanceOf(note.id)} // highlight-line
          />
        )}
      </ul>
      // ...
    </div>
  )
}
```

Ogni nota riceve un gestore <i>univoco</i>, perché ogni <i>id</i> è univoco. Se <i>note.id</i> vale 3, il gestore restituito sarà:

```js
() => { console.log('importance of 3 needs to be toggled') }
```

La stringa viene inizialmente costruita in uno stile simile a Java:

```js
console.log('importance of ' + id + ' needs to be toggled')
```

Con le [template string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) di ES6 possiamo scriverla in modo più chiaro:

```js
console.log(`importance of ${id} needs to be toggled`)
```

La sintassi con dollaro e parentesi graffe inserisce nella stringa il risultato di espressioni JavaScript. Le template string usano i backtick anziché le normali virgolette.

Una nota in json-server può essere modificata in due modi attraverso il suo URL univoco: una richiesta HTTP PUT <i>sostituisce</i> l'intera nota, mentre una richiesta HTTP PATCH modifica soltanto alcune proprietà.

La versione finale del gestore è:

```js
const toggleImportanceOf = id => {
  const url = `http://localhost:3001/notes/${id}`
  const note = notes.find(n => n.id === id)
  const changedNote = { ...note, important: !note.important }

  axios.put(url, changedNote).then(response => {
    setNotes(notes.map(note => note.id === id ? response.data : note))
  })
}
```

La prima riga costruisce l'URL della risorsa a partire dall'id. Il metodo [find](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find) trova la nota da modificare e la assegna alla variabile _note_.

Creiamo poi un <i>nuovo oggetto</i>, identico alla vecchia nota tranne che per il valore invertito della proprietà <i>important</i>.

La sintassi [spread per gli oggetti](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) può sembrare inizialmente insolita:

```js
const changedNote = { ...note, important: !note.important }
```

<em>{ ...note }</em> crea un oggetto con una copia di tutte le proprietà di _note_. Le proprietà indicate successivamente sostituiscono quelle copiate: per esempio, in <em>{ ...note, important: true }</em>, <i>important</i> vale true. Nel nostro caso riceve la negazione del valore precedente.

Perché copiare la nota, se sembra funzionare anche questo codice?

```js
const note = notes.find(n => n.id === id)
note.important = !note.important

axios.put(url, note).then(response => {
  // ...
```

Non è consigliato: <em>note</em> è un riferimento a un elemento dell'array <em>notes</em> nello stato e in React [non bisogna mai modificare direttamente lo stato](https://react.dev/learn/updating-objects-in-state#why-is-mutating-state-not-recommended-in-react).

_changedNote_ è inoltre soltanto una [copia superficiale](https://en.wikipedia.org/wiki/Object_copying#Shallow_copy): se le proprietà del vecchio oggetto contenessero altri oggetti, nella copia farebbero ancora riferimento agli stessi oggetti.

La nuova nota viene inviata al backend con PUT e sostituisce quella precedente. La callback imposta lo stato <em>notes</em> a un nuovo array che conserva tutti gli elementi, tranne la vecchia nota sostituita dalla versione restituita dal server:

```js
axios.put(url, changedNote).then(response => {
  setNotes(notes.map(note => note.id === id ? response.data : note))
})
```

Il metodo <em>map</em> crea il nuovo array:

```js
notes.map(note => note.id === id ? response.data : note)
```

Per ogni elemento, se <em>note.id === id</em> è vero inserisce la nota restituita dal server; altrimenti copia l'elemento precedente. Questo uso di <em>map</em> può sembrare strano, ma vale la pena comprenderlo: ricorrerà spesso nel corso.

### Estrarre la comunicazione con il backend in un modulo separato

Dopo l'aggiunta della comunicazione col server, <i>App</i> è diventato piuttosto grande. Seguendo il [principio di responsabilità singola](https://en.wikipedia.org/wiki/Single_responsibility_principle), estraiamo la comunicazione in un [modulo](/it/part2/rendering_delle_collezioni_e_moduli#riorganizzare-il-codice-in-moduli).

Creiamo la directory <i>src/services</i> e al suo interno il file <i>notes.js</i>:

```js
import axios from 'axios'
const baseUrl = 'http://localhost:3001/notes'

const getAll = () => {
  return axios.get(baseUrl)
}

const create = newObject => {
  return axios.post(baseUrl, newObject)
}

const update = (id, newObject) => {
  return axios.put(`${baseUrl}/${id}`, newObject)
}

export default { 
  getAll: getAll, 
  create: create, 
  update: update 
}
```

Il modulo esporta un oggetto con tre funzioni, <i>getAll</i>, <i>create</i> e <i>update</i>, che restituiscono direttamente le promesse prodotte dai metodi Axios.

<i>App</i> importa il modulo:

```js
import noteService from './services/notes' // highlight-line

const App = () => {
```

e usa le sue funzioni tramite _noteService_:

```js
const App = () => {
  // ...

  useEffect(() => {
    // highlight-start
    noteService
      .getAll()
      .then(response => {
        setNotes(response.data)
      })
    // highlight-end
  }, [])

  const toggleImportanceOf = id => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important }

    // highlight-start
    noteService
      .update(id, changedNote)
      .then(response => {
        setNotes(notes.map(note => note.id === id ? response.data : note))
      })
    // highlight-end
  }

  const addNote = (event) => {
    event.preventDefault()
    const noteObject = {
      content: newNote,
      important: Math.random() > 0.5
    }

// highlight-start
    noteService
      .create(noteObject)
      .then(response => {
        setNotes(notes.concat(response.data))
        setNewNote('')
      })
// highlight-end
  }

  // ...
}

export default App
```

Possiamo migliorare ulteriormente il modulo. <i>App</i> riceve ora l'intera risposta HTTP, ma ne usa soltanto <i>response.data</i>:

```js
noteService
  .getAll()
  .then(response => {
    setNotes(response.data)
  })
```

Sarebbe più comodo ricevere direttamente i dati:

```js
noteService
  .getAll()
  .then(initialNotes => {
    setNotes(initialNotes)
  })
```

Modifichiamo quindi il modulo; per ora accettiamo la piccola duplicazione presente nel codice:

```js
import axios from 'axios'
const baseUrl = 'http://localhost:3001/notes'

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = newObject => {
  const request = axios.post(baseUrl, newObject)
  return request.then(response => response.data)
}

const update = (id, newObject) => {
  const request = axios.put(`${baseUrl}/${id}`, newObject)
  return request.then(response => response.data)
}

export default { 
  getAll: getAll, 
  create: create, 
  update: update 
}
```

Non restituiamo più direttamente la promessa di Axios: la assegniamo a <em>request</em> e chiamiamo <em>then</em>:

```js
const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}
```

L'ultima riga è la forma compatta di:

```js
const getAll = () => {
  const request = axios.get(baseUrl)
  // highlight-start
  return request.then(response => {
    return response.data
  })
  // highlight-end
}
```

<em>getAll</em> restituisce ancora una promessa, perché anche il metodo <em>then</em> [restituisce una promessa](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then). Quando la richiesta riesce, la promessa restituisce i dati ricevuti dal backend.

Aggiorniamo le callback di <i>App</i> affinché usino direttamente i dati restituiti:

```js
const App = () => {
  // ...

  useEffect(() => {
    noteService
      .getAll()
      // highlight-start      
      .then(initialNotes => {
        setNotes(initialNotes)
      // highlight-end
      })
  }, [])

  const toggleImportanceOf = id => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important }

    noteService
      .update(id, changedNote)
      // highlight-start      
      .then(returnedNote => {
        setNotes(notes.map(note => note.id === id ? returnedNote : note))
      // highlight-end
      })
  }

  const addNote = (event) => {
    event.preventDefault()
    const noteObject = {
      content: newNote,
      important: Math.random() > 0.5
    }

    noteService
      .create(noteObject)
      // highlight-start      
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
      // highlight-end
        setNewNote('')
      })
  }

  // ...
}
```

L'argomento è complesso e un'ulteriore spiegazione potrebbe persino confondere. Potete approfondire la [concatenazione delle promesse](https://javascript.info/promise-chaining). Anche il libro «Async and performance» della serie [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS/tree/1st-ed) offre una [spiegazione approfondita](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/async%20%26%20performance/ch3.md).

Le promesse sono fondamentali nello sviluppo JavaScript moderno: è consigliabile dedicare il tempo necessario a comprenderle.

### Sintassi più pulita per definire oggetti letterali

Il modulo dei servizi esporta un oggetto con le proprietà <i>getAll</i>, <i>create</i> e <i>update</i>, associate alle omonime funzioni.

La definizione del modulo era:

```js
import axios from 'axios'
const baseUrl = 'http://localhost:3001/notes'

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = newObject => {
  const request = axios.post(baseUrl, newObject)
  return request.then(response => response.data)
}

const update = (id, newObject) => {
  const request = axios.put(`${baseUrl}/${id}`, newObject)
  return request.then(response => response.data)
}

export default { 
  getAll: getAll, 
  create: create, 
  update: update 
}
```

L'oggetto esportato ha questa forma:

```js
{ 
  getAll: getAll, 
  create: create, 
  update: update 
}
```

Gli elementi a sinistra dei due punti sono le <i>chiavi</i>; quelli a destra sono le <i>variabili</i> definite nel modulo. Poiché i nomi coincidono, possiamo usare una sintassi più compatta:

```js
{ 
  getAll, 
  create, 
  update 
}
```

Il modulo diventa quindi:

```js
import axios from 'axios'
const baseUrl = 'http://localhost:3001/notes'

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = newObject => {
  const request = axios.post(baseUrl, newObject)
  return request.then(response => response.data)
}

const update = (id, newObject) => {
  const request = axios.put(`${baseUrl}/${id}`, newObject)
  return request.then(response => response.data)
}

export default { getAll, create, update } // highlight-line
```

Questa forma usa una [funzionalità](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#Property_definitions) introdotta con ES6. Per esempio, dati:

```js
const name = 'Leevi'
const age = 0
```

nelle vecchie versioni di JavaScript avremmo scritto:

```js
const person = {
  name: name,
  age: age
}
```

Con ES6 è sufficiente:

```js
const person = { name, age }
```

Il risultato è identico: un oggetto con la proprietà <i>name</i> uguale a <i>Leevi</i> e <i>age</i> uguale a <i>0</i>.

### Promesse ed errori

Se l'applicazione consentisse di eliminare le note, un utente potrebbe tentare di modificare l'importanza di una nota già cancellata dal sistema.

Simuliamo la situazione facendo restituire a <em>getAll</em> una nota inserita direttamente nel codice e inesistente sul backend:

```js
const getAll = () => {
  const request = axios.get(baseUrl)
  const nonExisting = {
    id: 10000,
    content: 'This note is not saved to server',
    important: true,
  }
  return request.then(response => response.data.concat(nonExisting))
}
```

Tentando di modificarla, la console mostra un errore: il backend ha risposto alla richiesta PUT con il codice 404 <i>not found</i>.

![errore 404 negli strumenti di sviluppo](../../images/2/23e.png)

L'applicazione dovrebbe gestire questi errori in modo appropriato. Senza la console aperta, l'utente vedrebbe soltanto che il pulsante non modifica la nota.

Abbiamo [già visto](/it/part2/recuperare_dati_dal_server#axios-e-le-promesse) che una promessa può trovarsi in tre stati. Quando una richiesta Axios fallisce, la promessa associata viene <i>rejected</i>. Il nostro codice non gestisce ancora questo rifiuto.

È possibile gestirlo fornendo a <em>then</em> una seconda callback, eseguita quando la promessa viene rifiutata. Il metodo più comune è però [catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch):

```js
axios
  .get('http://example.com/probably_will_fail')
  .then(response => {
    console.log('success!')
  })
  .catch(error => {
    console.log('fail')
  })
```

Se la richiesta fallisce, viene chiamato il gestore registrato con <em>catch</em>. Di solito lo si colloca alla fine di una [catena di promesse](https://javascript.info/promise-chaining):

Quando concateniamo più metodi _.then_, stiamo infatti creando una catena di promesse:

```js
axios
  .get('http://...')
  .then(response => response.data)
  .then(data => {
    // ...
  })
```

Alla fine della catena possiamo aggiungere un gestore per gli errori:

```js
axios
  .get('http://...')
  .then(response => response.data)
  .then(data => {
    // ...
  })
  .catch(error => {
    console.log('fail')
  })
```

In questo modo <em>catch</em> viene eseguito se una qualsiasi promessa della catena genera un errore. Usiamo questa caratteristica in <i>App</i>:

```js
const toggleImportanceOf = id => {
  const note = notes.find(n => n.id === id)
  const changedNote = { ...note, important: !note.important }

  noteService
    .update(id, changedNote).then(returnedNote => {
      setNotes(notes.map(note => note.id === id ? returnedNote : note))
    })
    // highlight-start
    .catch(error => {
      alert(
        `the note '${note.content}' was already deleted from server`
      )
      setNotes(notes.filter(n => n.id !== id))
    })
    // highlight-end
}
```

Il messaggio viene mostrato con [alert](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert), mentre la nota eliminata viene rimossa dallo stato con [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter):

```js
notes.filter(n => n.id !== id)
```

<em>filter</em> restituisce un nuovo array contenente soltanto gli elementi per cui la funzione passata come parametro restituisce true.

Nelle applicazioni React più serie, <em>alert</em> probabilmente non è la soluzione migliore. Impareremo presto un sistema più avanzato per mostrare messaggi e notifiche, ma un metodo semplice e collaudato può essere un buon punto di partenza.

Il codice attuale si trova nel branch <i>part2-6</i> su [GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part2-6).

### Il giuramento dello sviluppatore full stack

È nuovamente il momento degli esercizi. La complessità aumenta: oltre ai componenti React del frontend, ora abbiamo un backend che conserva i dati.

Per affrontarla, estendiamo il giuramento dello sviluppatore web al <i>giuramento dello sviluppatore full stack</i>, che ci ricorda di verificare la comunicazione tra frontend e backend.

Lo sviluppo full stack è <i>estremamente difficile</i>, quindi userò ogni mezzo possibile per renderlo più semplice:

- terrò sempre aperta la console di sviluppo del browser;
- <i>userò la scheda Network per verificare che frontend e backend comunichino come previsto</i>;
- <i>controllerò costantemente lo stato del server per assicurarmi che i dati inviati dal frontend siano salvati correttamente</i>;
- procederò a piccoli passi;
- userò molti _console.log_ per capire il comportamento del codice e individuare i problemi;
- se il codice non funziona, non ne aggiungerò altro: eliminerò codice finché non torna a funzionare oppure ripristinerò uno stato funzionante;
- quando chiederò aiuto, formulerò correttamente la domanda seguendo le indicazioni della [parte 0](/it/part0).

</div>

<div class="tasks">

<h3>Esercizi 2.12.-2.15.</h3>

<h4>2.12: La rubrica, passo 7</h4>

Torniamo alla rubrica. Attualmente i numeri aggiunti non vengono salvati sul server backend. Correggete il problema.

<h4>2.13: La rubrica, passo 8</h4>

Estraete il codice che gestisce la comunicazione col backend in un modulo separato, seguendo l'esempio mostrato in questa sezione.

<h4>2.14: La rubrica, passo 9</h4>

Permettete agli utenti di eliminare le persone dalla rubrica tramite un pulsante dedicato. Potete chiedere conferma con [window.confirm](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm):

![conferma dell'eliminazione nell'esercizio 2.14](../../images/2/24e.png)

La risorsa può essere eliminata dal backend con una richiesta HTTP DELETE al suo URL. Per eliminare la persona con <i>id</i> 2, per esempio, bisogna inviare DELETE a <i>localhost:3001/persons/2</i>. La richiesta non contiene dati.

Axios permette di eseguire DELETE nello stesso modo delle altre richieste.

**Nota:** non potete chiamare una variabile <em>delete</em>, perché è una parola riservata di JavaScript:

```js
// use some other name for variable!
const delete = (id) => {
  // ...
}
```

<h4>2.15*: La rubrica, passo 10</h4>

<i>Perché l'esercizio ha un asterisco? Consultate la [parte 0](/it/part0) per la spiegazione.</i>

Modificate l'applicazione in modo che, aggiungendo un numero a una persona già presente, il nuovo numero sostituisca quello precedente. Per l'aggiornamento è consigliato il metodo HTTP PUT.

Se la persona esiste già, l'applicazione può chiedere conferma all'utente:

![richiesta di conferma per la sostituzione del numero](../../images/teht/16e.png)

</div>
