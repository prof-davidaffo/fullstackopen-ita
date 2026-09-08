---
mainImage: ../../../images/part-2.svg
part: 2
letter: a
lang: it
---

<div class="content">

Prima di iniziare una nuova parte, ripassiamo alcuni argomenti che in passato si sono dimostrati difficili.

### console.log

***Qual è la differenza tra un programmatore JavaScript esperto e un principiante? Quello esperto usa console.log da 10 a 100 volte di più.***

Paradossalmente sembra essere vero, anche se un principiante avrebbe più bisogno di <i>console.log</i>, o di qualsiasi altro strumento di debug, rispetto a uno sviluppatore esperto.

Quando qualcosa non funziona, non limitarti a indovinare il problema: stampa informazioni nella console oppure usa un altro metodo di debugging.

**Nota:** come spiegato nella Parte 1, quando usi _console.log_ non concatenare i valori "alla maniera di Java" con l'operatore più. Invece di scrivere:

```js
console.log('props value is ' + props)
```

separa gli elementi da stampare con una virgola:

```js
console.log('props value is', props)
```

Concatenando un oggetto con una stringa, come nel primo esempio, il risultato è poco utile:

```js
props value is [object Object]
```

Passando invece gli oggetti come argomenti distinti separati da virgole, la console ne mostra il contenuto in modo comprensibile. Se necessario, rileggi la sezione sul [debug delle applicazioni React](/it/part1/stato_complesso_e_debugging_delle_applicazioni_react#debug-delle-applicazioni-react).

### Suggerimento: snippet di Visual Studio Code

Visual Studio Code permette di creare facilmente degli <i>snippet</i>, cioè scorciatoie per generare rapidamente porzioni di codice usate di frequente, in modo simile a <i>sout</i> in NetBeans.

Le istruzioni per crearli si trovano [qui](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_creating-your-own-snippets).

Nel [marketplace](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets) sono disponibili anche estensioni che forniscono snippet già pronti.

Quello più importante riguarda <em>console.log()</em>, per esempio con il prefisso <em>clog</em>. Può essere creato così:

```js
{
  "console.log": {
    "prefix": "clog",
    "body": [
      "console.log('$1')",
    ],
    "description": "Log output to console"
  }
}
```

Il debug con _console.log()_ è così comune che Visual Studio Code include già uno snippet: digita _log_ e premi Tab per completarlo. Nel [marketplace](https://marketplace.visualstudio.com/search?term=console.log&target=VSCode&category=All%20categories&sortBy=Relevance) sono disponibili estensioni più avanzate.

### Array JavaScript

D'ora in poi useremo continuamente gli operatori funzionali degli [array](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Array) JavaScript, come _find_, _filter_ e _map_.

Se non hai familiarità con questo modo di lavorare sugli array, è utile guardare almeno i primi tre video della serie YouTube [Functional Programming in JavaScript](https://www.youtube.com/playlist?list=PL0zVEGEvSaeEd9hlmCXrk5yUyqUag-n84):

- [Higher-order functions](https://www.youtube.com/watch?v=BMUiFMZr7vk&list=PL0zVEGEvSaeEd9hlmCXrk5yUyqUag-n84)
- [Map](https://www.youtube.com/watch?v=bCqtb-Z5YGQ&list=PL0zVEGEvSaeEd9hlmCXrk5yUyqUag-n84&index=2)
- [Reduce basics](https://www.youtube.com/watch?v=Wl98eZpkp-c&t=31s)

### Ancora sui gestori di eventi

Nelle precedenti edizioni del corso, la gestione degli eventi si è dimostrata difficile.

Se senti di aver bisogno di un ripasso, rileggi il capitolo della parte precedente dedicato ai [gestori di eventi](/it/part1/stato_complesso_e_debugging_delle_applicazioni_react#ancora-sulla-gestione-degli-eventi).

Anche il passaggio dei gestori ai componenti figli di <i>App</i> ha sollevato diverse domande. Puoi ripassarlo [qui](/it/part1/stato_complesso_e_debugging_delle_applicazioni_react#passare-i-gestori-di-eventi-ai-componenti-figli).

### Visualizzare collezioni

Costruiamo ora con React il frontend, cioè l'interfaccia utente visibile nel browser, di un'applicazione simile a quella della [Parte 0](/it/part0).

Partiamo dal file <i>App.jsx</i> seguente:

```js
const App = (props) => {
  const { notes } = props

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        <li>{notes[0].content}</li>
        <li>{notes[1].content}</li>
        <li>{notes[2].content}</li>
      </ul>
    </div>
  )
}

export default App
```

Il file <i>main.jsx</i> è così:

```js
import ReactDOM from 'react-dom/client'
import App from './App'

const notes = [
  {
    id: 1,
    content: 'HTML is easy',
    important: true
  },
  {
    id: 2,
    content: 'Browser can execute only JavaScript',
    important: false
  },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true
  }
]

ReactDOM.createRoot(document.getElementById('root')).render(
  <App notes={notes} />
)
```

Ogni nota contiene il testo, un valore _booleano_ che indica se è importante e un <i>id</i> univoco.

L'esempio funziona perché l'array contiene esattamente tre note.

Una singola nota viene mostrata accedendo all'oggetto mediante un indice scritto direttamente nel codice:

```js
<li>{notes[1].content}</li>
```

Naturalmente non è una soluzione pratica. Possiamo migliorarla generando elementi React dagli oggetti dell'array mediante [map](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Array/map):

```js
notes.map(note => <li>{note.content}</li>)
```

Il risultato è un array di elementi <i>li</i>:

```js
[
  <li>HTML is easy</li>,
  <li>Browser can execute only JavaScript</li>,
  <li>GET and POST are the most important methods of HTTP protocol</li>,
]
```

che può essere inserito tra i tag <i>ul</i>:

```js
const App = (props) => {
  const { notes } = props

  return (
    <div>
      <h1>Notes</h1>
// highlight-start
      <ul>
        {notes.map(note => <li>{note.content}</li>)}
      </ul>
// highlight-end      
    </div>
  )
}
```

Il codice che genera i tag <i>li</i> è JavaScript e, come qualsiasi altro codice JavaScript in un template JSX, deve essere racchiuso tra parentesi graffe.

Rendiamo inoltre il codice più leggibile distribuendo la funzione freccia su più righe:

```js
const App = (props) => {
  const { notes } = props

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
        // highlight-start
          <li>
            {note.content}
          </li>
        // highlight-end   
        )}
      </ul>
    </div>
  )
}
```

### L'attributo key

Anche se l'applicazione sembra funzionare, nella console appare un brutto avviso:

![Errore relativo alla prop key univoca](../../images/2/1a.png)

Come suggerisce la [pagina di React](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key) indicata nel messaggio, ogni elemento dell'elenco generato con _map_ deve possedere un valore univoco nell'attributo <i>key</i>.

Aggiungiamo le chiavi:

```js
const App = (props) => {
  const { notes } = props

  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
          <li key={note.id}> // highlight-line
            {note.content}
          </li>
        )}
      </ul>
    </div>
  )
}
```

Il messaggio di errore scompare.

React usa gli attributi <i>key</i> degli oggetti di un array per stabilire come aggiornare la vista prodotta da un componente quando questo viene visualizzato nuovamente. La [documentazione di React](https://react.dev/learn/preserving-and-resetting-state#option-2-resetting-state-with-a-key) contiene maggiori dettagli.

### Map

Comprendere il funzionamento del metodo [`map`](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Array/map) è fondamentale per il resto del corso.

L'applicazione contiene un array chiamato _notes_:

```js
const notes = [
  {
    id: 1,
    content: 'HTML is easy',
    important: true
  },
  {
    id: 2,
    content: 'Browser can execute only JavaScript',
    important: false
  },
  {
    id: 3,
    content: 'GET and POST are the most important methods of HTTP protocol',
    important: true
  }
]
```

Fermiamoci un momento a esaminare _map_.

Aggiungendo, per esempio alla fine del file, il codice

```js
const result = notes.map(note => note.id)
console.log(result)
```

la console mostra <i>[1, 2, 3]</i>. _map_ crea sempre un nuovo array, i cui elementi vengono ottenuti da quelli originali tramite la funzione passata come parametro.

La funzione è:

```js
note => note.id
```

Si tratta di una funzione freccia in forma abbreviata. La forma completa sarebbe:

```js
(note) => {
  return note.id
}
```

La funzione riceve un oggetto nota e <i>restituisce</i> il valore del campo <i>id</i>.

Modificando il comando in

```js
const result = notes.map(note => note.content)
```

otteniamo un array contenente i testi delle note.

Siamo ormai molto vicini al codice React usato in precedenza:

```js
notes.map(note =>
  <li key={note.id}>
    {note.content}
  </li>
)
```

che genera, per ogni oggetto nota, un tag <i>li</i> contenente il relativo testo.

Poiché il parametro funzione passato a _map_

```js
note => <li key={note.id}>{note.content}</li>
```

viene usato per creare elementi dell'interfaccia, il valore deve essere inserito tra parentesi graffe. Prova a vedere che cosa succede rimuovendole.

All'inizio le parentesi graffe possono creare qualche difficoltà, ma ci si abitua presto. React fornisce un riscontro visivo immediato.

### Anti-pattern: usare gli indici come chiavi

Avremmo potuto eliminare l'errore dalla console usando come chiavi gli indici dell'array. È possibile recuperarli passando un secondo parametro alla callback di _map_:

```js
notes.map((note, i) => ...)
```

In questo caso _i_ assume il valore dell'indice occupato dalla nota nell'array.

Potremmo quindi generare le righe senza errori così:

```js
<ul>
  {notes.map((note, i) => 
    <li key={i}>
      {note.content}
    </li>
  )}
</ul>
```

Questa soluzione è però **sconsigliata** e può causare problemi indesiderati anche quando sembra funzionare perfettamente.

Per approfondire, leggi [questo articolo](https://robinpokorny.com/blog/index-as-a-key-is-an-anti-pattern/).

### Riorganizzare il codice in moduli

Riordiniamo un po' il codice. Ci interessa soltanto il campo _notes_ delle props, quindi recuperiamolo direttamente mediante la [destrutturazione](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment):

```js
const App = ({ notes }) => { //highlight-line
  return (
    <div>
      <h1>Notes</h1>
      <ul>
        {notes.map(note => 
          <li key={note.id}>
            {note.content}
          </li>
        )}
      </ul>
    </div>
  )
}
```

Se non ricordi che cosa sia la destrutturazione, rileggi la [sezione dedicata](/it/part1/stato_dei_componenti_e_gestione_degli_eventi#destrutturazione).

Estraiamo la visualizzazione di una singola nota in un componente <i>Note</i>:

```js
// highlight-start
const Note = ({ note }) => {
  return (
    <li>{note.content}</li>
  )
}
// highlight-end

const App = ({ notes }) => {
  return (
    <div>
      <h1>Notes</h1>
      <ul>
        // highlight-start
        {notes.map(note => 
          <Note key={note.id} note={note} />
        )}
         // highlight-end
      </ul>
    </div>
  )
}
```

L'attributo <i>key</i> deve ora essere definito sui componenti <i>Note</i>, non sui tag <i>li</i> come in precedenza.

È possibile scrivere un'intera applicazione React in un solo file, ma non è molto pratico. Di norma ogni componente viene dichiarato in un proprio file, come <i>modulo ES6</i>.

In realtà abbiamo usato i moduli fin dall'inizio. Le prime righe di <i>main.jsx</i>

```js
import ReactDOM from "react-dom/client"
import App from "./App"
```

[importano](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Statements/import) due moduli e li rendono disponibili nel file. Il modulo <i>react-dom/client</i> viene assegnato alla variabile _ReactDOM_, mentre quello che definisce il componente principale dell'applicazione viene assegnato ad _App_.

Spostiamo <i>Note</i> in un modulo separato.

Nelle applicazioni più piccole i componenti vengono generalmente inseriti in una cartella <i>components</i> all'interno di <i>src</i>. Per convenzione, ogni file prende il nome del componente. Un progetto con più componenti potrebbe avere questa struttura:

```shell
src/
├── main.jsx
├── App.jsx
└── components/           # Cartella dei componenti riutilizzabili
    ├── Footer.jsx        # File con il nome del componente
    ├── Note.jsx
    └── Notification.jsx
```

Creiamo quindi la cartella <i>components</i> e al suo interno il file <i>Note.jsx</i>:

```js
const Note = ({ note }) => {
  return <li>{note.content}</li>
}

export default Note
```

L'ultima riga [esporta](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Statements/export) il modulo dichiarato, cioè la variabile <i>Note</i>.

Il file che usa il componente, <i>App.jsx</i>, può ora [importarlo](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Statements/import):

```js
import Note from './components/Note' // highlight-line

const App = ({ notes }) => {
  // ...
}
```

Il componente esportato dal modulo è nuovamente disponibile nella variabile <i>Note</i>.

Quando importiamo i nostri componenti, il percorso deve essere indicato <i>rispetto al file che esegue l'importazione</i>:

```js
'./components/Note'
```

Il punto iniziale, <i>.</i>, rappresenta la cartella corrente. Il modulo si trova quindi nel file <i>Note.jsx</i> della sottocartella <i>components</i>. L'estensione _.jsx_ può essere omessa.

I moduli hanno molti altri impieghi oltre alla separazione dei componenti in file diversi. Torneremo sull'argomento più avanti.

Il codice attuale dell'applicazione è disponibile su [GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part2-1).

Il branch <i>main</i> del repository contiene una versione successiva dell'applicazione. Il codice relativo a questo punto del corso si trova nel branch [part2-1](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part2-1):

![Selezione del branch su GitHub](../../images/2/2e.png)

Se cloni il progetto, esegui _npm install_ prima di avviarlo con _npm run dev_.

### Quando l'applicazione smette di funzionare

All'inizio della carriera, ma anche dopo trent'anni di programmazione, capita spesso che un'applicazione smetta completamente di funzionare. Succede ancora più facilmente con linguaggi a tipizzazione dinamica come JavaScript, nei quali il compilatore non verifica il tipo dei dati, per esempio quello delle variabili funzione o dei valori restituiti.

Un'"esplosione React" può presentarsi così:

![Esempio di errore React](../../images/2/3-vite.png)

In queste situazioni, la migliore via d'uscita è <em>console.log</em>.

Il codice che provoca l'errore è questo:

```js
const Course = ({ course }) => (
  <div>
    <Header course={course} />
  </div>
)

const App = () => {
  const course = {
    // ...
  }

  return (
    <div>
      <Course course={course} />
    </div>
  )
}
```

Cerchiamo la causa aggiungendo istruzioni <em>console.log</em>. Poiché <i>App</i> è il primo componente visualizzato, conviene inserire lì la prima stampa:

```js
const App = () => {
  const course = {
    // ...
  }

  console.log('App works...') // highlight-line

  return (
    // ..
  )
}
```

Per vedere il messaggio dobbiamo scorrere verso l'alto oltre il lungo muro rosso di errori.

![Prima stampa visibile nella console](../../images/2/4b.png)

Una volta accertato che qualcosa funziona, possiamo aggiungere stampe più in profondità. Se un componente è scritto come singola espressione o come funzione senza <i>return</i> esplicito, inserire stampe risulta più difficile:

```js
const Course = ({ course }) => (
  <div>
    <Header course={course} />
  </div>
)
```

Trasformiamolo nella forma estesa:

```js
const Course = ({ course }) => { 
  console.log(course) // highlight-line
  return (
    <div>
      <Header course={course} />
    </div>
  )
}
```

Spesso il problema nasce perché le props hanno un tipo o un nome diverso da quello previsto e la destrutturazione fallisce. Rimuovendola e osservando il contenuto di <em>props</em>, la causa tende a diventare evidente:

```js
const Course = (props) => { // highlight-line
  console.log(props)  // highlight-line
  const { course } = props
  return (
    <div>
      <Header course={course} />
    </div>
  )
}
```

Se il problema non è ancora risolto, purtroppo non resta che continuare la ricerca distribuendo altri _console.log_ nel codice.

Questo capitolo è stato aggiunto dopo che la soluzione modello dell'esercizio successivo era esplosa completamente a causa di props del tipo sbagliato e ha dovuto essere corretta proprio mediante <em>console.log</em>.

### Il giuramento dello sviluppatore web

Prima degli esercizi, ricordiamo la promessa fatta alla fine della parte precedente.

Programmare è difficile; per questo userò ogni mezzo possibile per renderlo più semplice:

- Terrò sempre aperta la console degli strumenti per sviluppatori del browser.
- Procederò a piccoli passi.
- Scriverò molti _console.log_ per comprendere il comportamento del codice e individuare i problemi.
- Se il codice non funziona, non ne aggiungerò altro. Eliminerò invece codice finché non tornerà a funzionare oppure ripristinerò uno stato funzionante.
- Quando chiederò aiuto, formulerò correttamente la domanda; [qui](/it/part0) è spiegato come farlo.

</div>

<div class="tasks">

<h3>Esercizi 2.1-2.5</h3>

Gli esercizi vengono consegnati tramite GitHub e contrassegnati come completati nel [sistema di consegna](https://studies.cs.helsinki.fi/stats/courses/fullstackopen).

Puoi raccoglierli tutti nello stesso repository oppure usare repository diversi. Se inserisci esercizi di parti differenti nello stesso repository, assegna alle cartelle nomi chiari.

Gli esercizi vengono consegnati **una parte alla volta**. Dopo aver consegnato una parte non sarà più possibile aggiungervi esercizi lasciati incompleti.

Questa parte contiene più esercizi delle precedenti: <i>non consegnare</i> finché non hai completato tutti quelli che intendi svolgere.

<h4>2.1: Informazioni sui corsi, passo 6</h4>

Completiamo il codice per visualizzare i corsi iniziato negli esercizi 1.1-1.5. Puoi partire dalle soluzioni modello della Parte 1, disponibili nel sistema di consegna dalla scheda <i>my submissions</i>: nella riga della Parte 1, premi <i>show</i> nella colonna <i>solutions</i>, quindi seleziona _App.jsx_ sotto <i>courseinfo</i>.

**Se copi un progetto, potrebbe essere necessario eliminare la cartella <i>node_modules</i> e reinstallare le dipendenze con _npm install_ prima di avviare l'applicazione.**

In generale non è consigliabile copiare l'intero contenuto di un progetto né aggiungere <i>node_modules</i> al sistema di controllo di versione.

Modifichiamo <i>App</i> così:

```js
const App = () => {
  const course = {
    id: 1,
    name: 'Half Stack application development',
    parts: [
      {
        name: 'Fundamentals of React',
        exercises: 10,
        id: 1
      },
      {
        name: 'Using props to pass data',
        exercises: 7,
        id: 2
      },
      {
        name: 'State of a component',
        exercises: 14,
        id: 3
      }
    ]
  }

  return <Course course={course} />
}

export default App
```

Definisci un componente <i>Course</i> responsabile della formattazione di un singolo corso.

La struttura dei componenti potrebbe essere questa:

```
App
  Course
    Header
    Content
      Part
      Part
      ...
```

<i>Course</i> contiene quindi i componenti definiti nella parte precedente, responsabili del nome del corso e delle sue sezioni.

La pagina potrebbe apparire così:

![Applicazione Half Stack](../../images/teht/8e.png)

Per ora non è necessario mostrare la somma degli esercizi.

L'applicazione deve funzionare <i>indipendentemente dal numero di sezioni del corso</i>. Verifica quindi che continui a funzionare aggiungendo o rimuovendo sezioni.

Assicurati che la console non mostri errori.

<h4>2.2: Informazioni sui corsi, passo 7</h4>

Mostra anche la somma degli esercizi del corso.

![Somma degli esercizi](../../images/teht/9e.png)

<h4>2.3*: Informazioni sui corsi, passo 8</h4>

Se non lo hai già fatto, calcola la somma con il metodo [reduce](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce) degli array.

**Suggerimento:** se il codice

```js
const total = 
  parts.reduce((s, p) => someMagicHere)
```

non funziona, usa <i>console.log</i>. Per farlo devi scrivere la funzione freccia nella forma estesa:

```js
const total = parts.reduce((s, p) => {
  console.log('what is happening', s, p)
  return someMagicHere 
})
```

**Non funziona?** Cerca come usare _reduce_ su un **array di oggetti**.

<h4>2.4: Informazioni sui corsi, passo 9</h4>

Estendiamo l'applicazione affinché supporti un <i>numero arbitrario</i> di corsi:

```js
const App = () => {
  const courses = [
    {
      name: 'Half Stack application development',
      id: 1,
      parts: [
        {
          name: 'Fundamentals of React',
          exercises: 10,
          id: 1
        },
        {
          name: 'Using props to pass data',
          exercises: 7,
          id: 2
        },
        {
          name: 'State of a component',
          exercises: 14,
          id: 3
        },
        {
          name: 'Redux',
          exercises: 11,
          id: 4
        }
      ]
    }, 
    {
      name: 'Node.js',
      id: 2,
      parts: [
        {
          name: 'Routing',
          exercises: 3,
          id: 1
        },
        {
          name: 'Middlewares',
          exercises: 7,
          id: 2
        }
      ]
    }
  ]

  return (
    <div>
      // ...
    </div>
  )
}
```

L'applicazione potrebbe apparire così:

![Supporto di più corsi](../../images/teht/10e.png)

<h4>2.5: Modulo separato, passo 10</h4>

Dichiara <i>Course</i> in un modulo separato, importato da <i>App</i>. Puoi includere nello stesso modulo tutti i sottocomponenti relativi al corso.

</div>
