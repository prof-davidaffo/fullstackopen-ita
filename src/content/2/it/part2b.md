---
mainImage: ../../../images/part-2.svg
part: 2
letter: b
lang: it
---

<div class="content">

Continuiamo ad ampliare la nostra applicazione permettendo agli utenti di aggiungere nuove note. Il codice della versione attuale dell'applicazione è disponibile [qui](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part2-1).

### Salvare le note nello stato del componente

Per aggiornare la pagina quando vengono aggiunte nuove note, conviene memorizzare le note nello stato del componente <i>App</i>. Importiamo la funzione [useState](https://react.dev/reference/react/useState) e usiamola per definire una parte dello stato, inizializzata con l'array di note iniziali passato tramite le props.

```js
import { useState } from 'react' // highlight-line
import Note from './components/Note'

const App = (props) => { // highlight-line
  const [notes, setNotes] = useState(props.notes) // highlight-line

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
          <Note key={note.id} note={note} />
        )}
      </ul>
    </div>
  )
}

export default App 
```

Il componente usa la funzione <em>useState</em> per inizializzare la parte di stato contenuta in <em>notes</em> con l'array di note ricevuto tramite le props:

```js
const App = (props) => { 
  const [notes, setNotes] = useState(props.notes) 

  // ...
}
```

Possiamo verificare che ciò avvenga davvero anche con React Developer Tools:

![il browser mostra la finestra degli strumenti di sviluppo React](../../images/2/30.png)

Se volessimo partire da un elenco di note vuoto, imposteremmo come valore iniziale un array vuoto. Poiché le props non verrebbero utilizzate, potremmo inoltre omettere il parametro <em>props</em> dalla definizione della funzione:

```js
const App = () => { 
  const [notes, setNotes] = useState([]) 

  // ...
}  
```

Per il momento manteniamo il valore iniziale passato tramite le props.

Aggiungiamo ora al componente un [form](https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms) HTML che verrà usato per inserire nuove note.

```js
const App = (props) => {
  const [notes, setNotes] = useState(props.notes)

// highlight-start 
  const addNote = (event) => {
    event.preventDefault()
    console.log('button clicked', event.target)
  }
  // highlight-end   

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
          <Note key={note.id} note={note} />
        )}
      </ul>
      // highlight-start 
      <form onSubmit={addNote}>
        <input />
        <button type="submit">save</button>
      </form>   
      // highlight-end   
    </div>
  )
}
```

Abbiamo assegnato la funzione _addNote_ al form come gestore di eventi. La funzione verrà chiamata quando il form viene inviato facendo clic sul pulsante di invio.

Per definire il gestore di eventi usiamo il metodo visto nella [parte 1](/it/part1/stato_dei_componenti_e_gestione_degli_eventi#gestione-degli-eventi):

```js
const addNote = (event) => {
  event.preventDefault()
  console.log('button clicked', event.target)
}
```

Il parametro <em>event</em> è l'[evento](https://react.dev/learn/responding-to-events) che provoca la chiamata della funzione che lo gestisce.

Il gestore chiama immediatamente il metodo <em>event.preventDefault()</em>, che impedisce l'azione predefinita associata all'invio di un form. Tale azione, [tra le altre cose](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event), causerebbe il ricaricamento della pagina.

Il target dell'evento, memorizzato in _event.target_, viene stampato nella console:

![la console mostra button clicked e l'oggetto form](../../images/2/6e.png)

In questo caso il target è il form che abbiamo definito nel componente.

Come possiamo accedere ai dati contenuti nell'elemento <i>input</i> del form?

### Componente controllato

Esistono molti modi per farlo. Il primo che esamineremo usa i cosiddetti [componenti controllati](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable).

Aggiungiamo una nuova parte di stato chiamata <em>newNote</em> per memorizzare il testo inserito dall'utente **e** assegniamola all'attributo <i>value</i> dell'elemento <i>input</i>:

```js
const App = (props) => {
  const [notes, setNotes] = useState(props.notes)
  // highlight-start
  const [newNote, setNewNote] = useState(
    'a new note...'
  ) 
  // highlight-end

  const addNote = (event) => {
    event.preventDefault()
    console.log('button clicked', event.target)
  }

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
          <Note key={note.id} note={note} />
        )}
      </ul>
      <form onSubmit={addNote}>
        <input value={newNote} /> //highlight-line
        <button type="submit">save</button>
      </form>   
    </div>
  )
}
```

Il testo segnaposto memorizzato come valore iniziale dello stato <em>newNote</em> compare nell'elemento <i>input</i>, ma non può essere modificato. La console mostra un avviso che ci suggerisce quale potrebbe essere il problema:

![errore in console: è stato fornito value senza onChange](../../images/2/7e.png)

Poiché abbiamo assegnato una parte dello stato del componente <i>App</i> all'attributo <i>value</i> dell'input, ora il componente <i>App</i> [controlla](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable) il comportamento dell'elemento input.

Per consentire la modifica dell'input dobbiamo registrare un <i>gestore di eventi</i> che sincronizzi le modifiche apportate all'input con lo stato del componente:

```js
const App = (props) => {
  const [notes, setNotes] = useState(props.notes)
  const [newNote, setNewNote] = useState(
    'a new note...'
  ) 

  // ...

// highlight-start
  const handleNoteChange = (event) => {
    console.log(event.target.value)
    setNewNote(event.target.value)
  }
// highlight-end

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
          <Note key={note.id} note={note} />
        )}
      </ul>
      <form onSubmit={addNote}>
        <input
          value={newNote}
          onChange={handleNoteChange} // highlight-line
        />
        <button type="submit">save</button>
      </form>   
    </div>
  )
}
```

Abbiamo quindi assegnato un gestore di eventi all'attributo <i>onChange</i> dell'elemento <i>input</i> del form:

```js
<input
  value={newNote}
  onChange={handleNoteChange}
/>
```

Il gestore viene chiamato ogni volta che <i>si verifica una modifica nell'elemento input</i>. La funzione riceve l'oggetto evento nel parametro <em>event</em>:

```js
const handleNoteChange = (event) => {
  console.log(event.target.value)
  setNewNote(event.target.value)
}
```

La proprietà <em>target</em> dell'oggetto evento corrisponde ora all'elemento <i>input</i> controllato, mentre <em>event.target.value</em> contiene il valore inserito in quell'elemento.

Notate che non è stato necessario chiamare il metodo _event.preventDefault()_, come invece abbiamo fatto nel gestore <i>onSubmit</i>. A differenza dell'invio di un form, la modifica di un input non provoca infatti alcuna azione predefinita.

Potete osservare nella console come viene chiamato il gestore di eventi:

![la console mostra più chiamate mentre viene digitato il testo](../../images/2/8e.png)

Vi siete ricordati di installare [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi), vero? Bene. Nella scheda di React DevTools potete osservare direttamente come cambia lo stato:

![React DevTools mostra lo stato che cambia durante la digitazione](../../images/2/9ea.png)

Ora lo stato <em>newNote</em> del componente <i>App</i> riflette il valore corrente dell'input. Possiamo quindi completare la funzione <em>addNote</em> che crea nuove note:

```js
const addNote = (event) => {
  event.preventDefault()
  const noteObject = {
    content: newNote,
    important: Math.random() < 0.5,
    id: String(notes.length + 1),
  }

  setNotes(notes.concat(noteObject))
  setNewNote('')
}
```

Per prima cosa creiamo un nuovo oggetto nota chiamato <em>noteObject</em>, il cui contenuto proviene dallo stato <em>newNote</em> del componente. L'identificatore univoco <i>id</i> viene generato in base al numero totale di note. Questo metodo funziona nella nostra applicazione perché le note non vengono mai eliminate. Grazie alla funzione <em>Math.random()</em>, ogni nota ha il 50% di probabilità di essere contrassegnata come importante.

La nuova nota viene aggiunta all'elenco usando il metodo [concat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat) degli array, presentato nella [parte 1](/it/part1/java_script#array):

```js
setNotes(notes.concat(noteObject))
```

Il metodo non modifica l'array <em>notes</em> originale, ma crea <i>una nuova copia dell'array con il nuovo elemento aggiunto alla fine</i>. È un aspetto importante, perché in React [non dobbiamo mai modificare direttamente lo stato](https://react.dev/learn/updating-objects-in-state#why-is-mutating-state-not-recommended-in-react)!

Il gestore di eventi azzera inoltre il valore dell'input controllato chiamando la funzione <em>setNewNote</em> associata allo stato <em>newNote</em>:

```js
setNewNote('')
```

Il codice completo della versione attuale dell'applicazione si trova nel branch <i>part2-2</i> di [questo repository GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part2-2).

### Filtrare gli elementi visualizzati

Aggiungiamo all'applicazione una funzionalità che permetta di visualizzare soltanto le note importanti.

Inseriamo nel componente <i>App</i> una nuova parte di stato che tenga traccia delle note da mostrare:

```js
const App = (props) => {
  const [notes, setNotes] = useState(props.notes) 
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true) // highlight-line
  
  // ...
}
```

Modifichiamo il componente in modo che memorizzi nella variabile <em>notesToShow</em> l'elenco delle note da visualizzare. Gli elementi dell'elenco dipendono dallo stato del componente:

```js
import { useState } from 'react'
import Note from './components/Note'

const App = (props) => {
  const [notes, setNotes] = useState(props.notes)
  const [newNote, setNewNote] = useState('') 
  const [showAll, setShowAll] = useState(true)

  // ...

// highlight-start
  const notesToShow = showAll
    ? notes
    : notes.filter(note => note.important === true)
// highlight-end

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notesToShow.map(note => // highlight-line
          <Note key={note.id} note={note} />
        )}
      </ul>
      // ...
    </div>
  )
}
```

La definizione della variabile <em>notesToShow</em> è piuttosto compatta:

```js
const notesToShow = showAll
  ? notes
  : notes.filter(note => note.important === true)
```

La definizione usa l'operatore [condizionale](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator), presente anche in molti altri linguaggi di programmazione.

L'operatore funziona nel modo seguente. Se abbiamo:

```js
const result = condition ? val1 : val2
```

la variabile <em>result</em> assume il valore di <em>val1</em> se <em>condition</em> è vera. Se <em>condition</em> è falsa, <em>result</em> assume invece il valore di <em>val2</em>.

Se il valore di <em>showAll</em> è false, alla variabile <em>notesToShow</em> viene assegnato un elenco contenente soltanto le note la cui proprietà <em>important</em> è impostata a true. Il filtraggio viene eseguito con il metodo [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) degli array:

```js
notes.filter(note => note.important === true)
```

L'operatore di confronto è superfluo, perché il valore di <em>note.important</em> può essere soltanto <i>true</i> o <i>false</i>. Possiamo quindi scrivere semplicemente:

```js
notes.filter(note => note.important)
```

Abbiamo mostrato inizialmente l'operatore di confronto per evidenziare un dettaglio importante: in JavaScript <em>val1 == val2</em> non funziona sempre come ci si potrebbe aspettare. Nei confronti è quindi più sicuro usare esclusivamente <em>val1 === val2</em>. Potete approfondire l'argomento [qui](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness).

Potete provare il funzionamento del filtro modificando il valore iniziale dello stato <em>showAll</em>.

Aggiungiamo ora una funzionalità che consenta agli utenti di cambiare il valore dello stato <em>showAll</em> attraverso l'interfaccia.

Le modifiche rilevanti sono mostrate qui sotto:

```js
import { useState } from 'react' 
import Note from './components/Note'

const App = (props) => {
  const [notes, setNotes] = useState(props.notes) 
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)

  // ...

  return (
    <div>
      <h1>Notes</h1>
// highlight-start      
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </button>
      </div>
// highlight-end            
      <ul>
        {notesToShow.map(note =>
          <Note key={note.id} note={note} />
        )}
      </ul>
      // ...    
    </div>
  )
}
```

Le note visualizzate, tutte oppure solo quelle importanti, sono controllate da un pulsante. Il gestore del pulsante è così semplice da essere stato definito direttamente nel suo attributo. Il gestore cambia il valore di _showAll_ da true a false e viceversa:

```js
() => setShowAll(!showAll)
```

Il testo del pulsante dipende dal valore dello stato <em>showAll</em>:

```js
show {showAll ? 'important' : 'all'}
```

Il codice completo della versione attuale dell'applicazione si trova nel branch <i>part2-3</i> di [questo repository GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part2-3).
</div>

<div class="tasks">

<h3>Esercizi 2.6.-2.10.</h3>

Nel primo esercizio inizieremo a lavorare a un'applicazione che verrà sviluppata ulteriormente negli esercizi successivi. Per i gruppi di esercizi collegati è sufficiente consegnare la versione finale dell'applicazione. Potete anche creare un commit separato dopo ogni esercizio del gruppo, ma non è obbligatorio.

<h4>2.6: La rubrica, passo 1</h4>

Creiamo una semplice rubrica telefonica. <i>**In questa parte aggiungeremo alla rubrica soltanto i nomi.**</i>

Cominciamo implementando l'aggiunta di una persona alla rubrica.

Potete usare il codice seguente come punto di partenza per il componente <i>App</i> dell'applicazione:

```js
import { useState } from 'react'

const App = () => {
  const [persons, setPersons] = useState([
    { name: 'Arto Hellas' }
  ]) 
  const [newName, setNewName] = useState('')

  return (
    <div>
      <h2>Phonebook</h2>
      <form>
        <div>
          name: <input />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
      <h2>Numbers</h2>
      ...
    </div>
  )
}

export default App
```

Lo stato <em>newName</em> serve a controllare l'elemento input del form.

A volte può essere utile visualizzare lo stato e le altre variabili come testo per facilitare il debugging. Potete aggiungere temporaneamente al componente renderizzato il seguente elemento:

```html
<div>debug: {newName}</div>
```

È inoltre importante mettere in pratica ciò che abbiamo imparato nel capitolo sul [debugging delle applicazioni React](/it/part1/stato_complesso_e_debugging_delle_applicazioni_react) della prima parte. L'estensione [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) è <i>estremamente</i> utile per seguire i cambiamenti che avvengono nello stato dell'applicazione.

Al termine dell'esercizio, l'applicazione dovrebbe avere un aspetto simile a questo:

![schermata dell'esercizio 2.6 completato](../../images/2/10e.png)

Notate l'uso dell'estensione React Developer Tools nell'immagine qui sopra!

**Nota:**

- potete usare il nome della persona come valore della proprietà <i>key</i>
- ricordate di impedire l'azione predefinita associata all'invio dei form HTML!

<h4>2.7: La rubrica, passo 2</h4>

Impedite all'utente di aggiungere nomi già presenti nella rubrica. Gli array JavaScript offrono numerosi [metodi](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) adatti a risolvere il problema. Tenete presente [come funziona l'uguaglianza tra oggetti](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness) in JavaScript.

Quando l'utente tenta di aggiungere un nome duplicato, mostrate un avviso con il comando [alert](https://developer.mozilla.org/en-US/docs/Web/API/Window/alert):

![avviso del browser: l'utente esiste già nella rubrica](../../images/2/11e.png)

**Suggerimento:** quando create stringhe che contengono valori provenienti da variabili, è consigliabile usare una [template string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals):

```js
`${newName} is already added to phonebook`
```

Se la variabile <em>newName</em> contiene il valore <i>Arto Hellas</i>, l'espressione restituisce la stringa:

```js
`Arto Hellas is already added to phonebook`
```

La stessa cosa potrebbe essere realizzata in uno stile più simile a Java usando l'operatore più:

```js
newName + ' is already added to phonebook'
```

L'uso delle template string è l'opzione più idiomatica e il segno distintivo di un vero professionista JavaScript.

<h4>2.8: La rubrica, passo 3</h4>

Ampliate l'applicazione permettendo agli utenti di aggiungere alla rubrica anche i numeri di telefono. Dovrete aggiungere al form un secondo elemento <i>input</i>, insieme al relativo gestore di eventi:

```js
<form>
  <div>name: <input /></div>
  <div>number: <input /></div>
  <div><button type="submit">add</button></div>
</form>
```

A questo punto l'applicazione potrebbe avere un aspetto simile a quello mostrato qui sotto. L'immagine visualizza anche lo stato dell'applicazione con l'aiuto di [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi):

![esempio di schermata dell'esercizio 2.8](../../images/2/12e.png)

<h4>2.9*: La rubrica, passo 4</h4>

Implementate un campo di ricerca con cui filtrare per nome l'elenco delle persone:

![campo di ricerca dell'esercizio 2.9](../../images/2/13e.png)

Potete realizzare il campo di ricerca come un elemento <i>input</i> collocato fuori dal form HTML. La logica di filtro mostrata nell'immagine non distingue tra maiuscole e minuscole: il termine di ricerca <i>arto</i> restituisce quindi anche risultati contenenti Arto con la A maiuscola.

**Nota:** quando lavorate a una nuova funzionalità, spesso è utile inserire direttamente nell'applicazione alcuni dati fittizi, per esempio:

```js
const App = () => {
  const [persons, setPersons] = useState([
    { name: 'Arto Hellas', number: '040-123456', id: 1 },
    { name: 'Ada Lovelace', number: '39-44-5323523', id: 2 },
    { name: 'Dan Abramov', number: '12-43-234345', id: 3 },
    { name: 'Mary Poppendieck', number: '39-23-6423122', id: 4 }
  ])

  // ...
}
```

In questo modo non dovrete inserire manualmente i dati ogni volta che provate la nuova funzionalità.

<h4>2.10: La rubrica, passo 5</h4>

Se avete implementato l'applicazione in un unico componente, effettuate il refactoring estraendo le parti adatte in nuovi componenti. Mantenete lo stato dell'applicazione e tutti i gestori di eventi nel componente radice <i>App</i>.

È sufficiente estrarre **tre** componenti dall'applicazione. Buoni candidati sono, per esempio, il filtro di ricerca, il form per aggiungere nuove persone, un componente che visualizza tutte le persone della rubrica e un componente che mostra i dati di una singola persona.

Dopo il refactoring, il componente radice dell'applicazione potrebbe assomigliare al seguente. Il componente qui sotto visualizza soltanto i titoli e lascia ai componenti estratti il resto del lavoro.

```js
const App = () => {
  // ...

  return (
    <div>
      <h2>Phonebook</h2>

      <Filter ... />

      <h3>Add a new</h3>

      <PersonForm 
        ...
      />

      <h3>Numbers</h3>

      <Persons ... />
    </div>
  )
}
```

**Nota:** potreste incontrare dei problemi in questo esercizio se definite i componenti «nel posto sbagliato». È un buon momento per ripassare il capitolo [non definire componenti dentro altri componenti](/it/part1/stato_complesso_e_debugging_delle_applicazioni_react#non-definire-componenti-dentro-altri-componenti) dell'ultima sezione.

</div>
