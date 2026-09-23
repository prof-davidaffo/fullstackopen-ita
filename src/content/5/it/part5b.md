---
mainImage: ../../../images/part-5.svg
part: 5
letter: b
lang: it
---

<div class="content">

Questa sezione usa React 19: alcune delle funzionalità introdotte non funzionano con le versioni precedenti. Se il progetto degli esercizi usa ancora React 18, assicurati di aggiornarlo a React 19.

Puoi controllare nel file <i>package.json</i> che le librerie <i>react</i> e <i>react-dom</i> siano alla versione 19:

```json
{
  // ...
  "dependencies": {
    "axios": "^1.9.0",
    "react": "^19.1.0", // highlight-line
    "react-dom": "^19.1.0" // highlight-line
  },
  // ...
}
```

Esegui anche _npm install_, che installa le dipendenze indicate in <i>package.json</i>. Questo passaggio serve, per esempio, se hai clonato il repository di esempio in una fase precedente del corso, quando veniva ancora usata una versione meno recente di React.

### Mostrare il modulo di login solo quando serve

Modifichiamo l'applicazione affinché il modulo di login sia inizialmente nascosto:

![browser con il pulsante di login e il modulo nascosto](../../images/5/10e.png)

Il modulo compare quando l'utente preme <i>login</i>:

![modulo di login con il pulsante cancel](../../images/5/11e.png)

L'utente può chiuderlo premendo <i>cancel</i>.

Iniziamo estraendo il modulo di login in un componente dedicato:

```js
const LoginForm = ({
   handleSubmit,
   handleUsernameChange,
   handlePasswordChange,
   username,
   password
  }) => {
  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div>
          username
          <input
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
      </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginForm
```

Lo stato e tutte le funzioni correlate sono definiti all'esterno del componente e gli vengono passati come props.

Le props vengono assegnate a variabili tramite <i>destrutturazione</i>. Quindi, invece di scrivere:

```js
const LoginForm = (props) => {
  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={props.handleSubmit}>
        <div>
          username
          <input
            value={props.username}
            onChange={props.handleChange}
            name="username"
          />
        </div>
        // ...
        <button type="submit">login</button>
      </form>
    </div>
  )
}
```

e accedere alle proprietà dell'oggetto _props_ con espressioni come _props.handleSubmit_, assegniamo direttamente le proprietà a variabili separate.

Un modo rapido per implementare la funzionalità consiste nel modificare la funzione _loginForm_ del componente <i>App</i>:

```js
const App = () => {
  const [loginVisible, setLoginVisible] = useState(false) // highlight-line

  // ...

  const loginForm = () => {
    const hideWhenVisible = { display: loginVisible ? 'none' : '' }
    const showWhenVisible = { display: loginVisible ? '' : 'none' }

    return (
      <div>
        <div style={hideWhenVisible}>
          <button onClick={() => setLoginVisible(true)}>log in</button>
        </div>
        <div style={showWhenVisible}>
          <LoginForm
            username={username}
            password={password}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            handleSubmit={handleLogin}
          />
          <button onClick={() => setLoginVisible(false)}>cancel</button>
        </div>
      </div>
    )
  }

  // ...
}
```

Lo stato di <i>App</i> contiene ora il booleano <i>loginVisible</i>, che determina se mostrare il modulo di login.

Due pulsanti modificano _loginVisible_. I loro gestori degli eventi sono definiti direttamente nel componente:

```js
<button onClick={() => setLoginVisible(true)}>log in</button>

<button onClick={() => setLoginVisible(false)}>cancel</button>
```

La visibilità viene controllata assegnando uno stile [inline](/it/part2/aggiungere_stili_allapplicazione_react#stili-inline), nel quale la proprietà [display](https://developer.mozilla.org/en-US/docs/Web/CSS/display) vale <i>none</i> quando vogliamo nascondere il componente:

```js
const hideWhenVisible = { display: loginVisible ? 'none' : '' }
const showWhenVisible = { display: loginVisible ? '' : 'none' }

<div style={hideWhenVisible}>
  // button
</div>

<div style={showWhenVisible}>
  // button
</div>
```

Usiamo nuovamente l'operatore ternario, riconoscibile dal punto interrogativo. Se _loginVisible_ è <i>true</i>, la regola CSS per il contenitore del pulsante di apertura sarà:

```css
display: 'none';
```

Se _loginVisible_ è <i>false</i>, a <i>display</i> viene assegnata una stringa vuota, che non impone uno stile inline per quella proprietà.

### I componenti figli e props.children

Il codice che gestisce la visibilità del modulo di login costituisce un'unità logica autonoma. Conviene quindi estrarlo da <i>App</i> e inserirlo in un componente separato.

Vogliamo realizzare un componente <i>Togglable</i> utilizzabile così:

```js
<Togglable buttonLabel='login'>
  <LoginForm
    username={username}
    password={password}
    handleUsernameChange={({ target }) => setUsername(target.value)}
    handlePasswordChange={({ target }) => setPassword(target.value)}
    handleSubmit={handleLogin}
  />
</Togglable>
```

L'utilizzo è leggermente diverso rispetto ai componenti precedenti: i tag di apertura e chiusura racchiudono un componente <i>LoginForm</i>. Nella terminologia di React, <i>LoginForm</i> è un componente figlio di <i>Togglable</i>.

Tra i tag di <i>Togglable</i> possiamo inserire qualsiasi elemento React, per esempio:

```js
<Togglable buttonLabel="reveal">
  <p>this line is at start hidden</p>
  <p>also this is hidden</p>
</Togglable>
```

Il codice di <i>Togglable</i> è il seguente:

```js
import { useState } from 'react'

const Togglable = (props) => {
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  return (
    <div>
      <div style={hideWhenVisible}>
        <button onClick={toggleVisibility}>{props.buttonLabel}</button>
      </div>
      <div style={showWhenVisible}>
        {props.children}
        <button onClick={toggleVisibility}>cancel</button>
      </div>
    </div>
  )
}

export default Togglable
```

La novità è [props.children](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children), che permette di accedere ai figli del componente, cioè agli elementi React definiti tra i suoi tag di apertura e chiusura.

I figli vengono renderizzati all'interno del contenuto del componente stesso:

```js
<div style={showWhenVisible}>
  {props.children}
  <button onClick={toggleVisibility}>cancel</button>
</div>
```

React passa gli elementi annidati tramite la prop <i>children</i>. Se usiamo invece un tag autochiudente _/>_, senza passare esplicitamente children, come in questo esempio:

```js
<Note
  key={note.id}
  note={note}
  toggleImportance={() => toggleImportanceOf(note.id)}
/>
```

<i>props.children</i> vale <i>undefined</i>.

Il componente <i>Togglable</i> è riutilizzabile: possiamo impiegarlo per mostrare e nascondere anche il modulo di creazione delle note.

Prima estraiamo il modulo in un componente:

```js
const NoteForm = ({ onSubmit, handleChange, value}) => {
  return (
    <div>
      <h2>Create a new note</h2>

      <form onSubmit={onSubmit}>
        <input
          value={value}
          onChange={handleChange}
        />
        <button type="submit">save</button>
      </form>
    </div>
  )
}
```

Poi inseriamolo all'interno di <i>Togglable</i>:

```js
<Togglable buttonLabel="new note">
  <NoteForm
    onSubmit={addNote}
    value={newNote}
    handleChange={handleNoteChange}
  />
</Togglable>
```

Il codice completo dell'applicazione è disponibile nel branch <i>part5-4</i> di [questo repository GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part5-4).

### Lo stato dei form

Attualmente lo stato dell'applicazione si trova nel componente _App_.

La [documentazione di React](https://react.dev/learn/sharing-state-between-components) spiega come scegliere dove collocarlo: quando lo stato di due componenti deve cambiare insieme, lo si sposta nel loro antenato comune più vicino e lo si passa ai figli tramite props. Questa operazione è chiamata <i>lifting state up</i>, cioè spostamento dello stato verso l'alto, ed è molto comune in React.

Lo stato dei form, per esempio il contenuto di una nota ancora da creare, non serve al componente _App_ per altri scopi. Possiamo quindi trasferirlo nei rispettivi componenti.

Il componente che crea le note diventa:

```js
import { useState } from 'react'

const NoteForm = ({ createNote }) => {
  const [newNote, setNewNote] = useState('')

  const addNote = (event) => {
    event.preventDefault()
    createNote({
      content: newNote,
      important: true
    })

    setNewNote('')
  }

  return (
    <div>
      <h2>Create a new note</h2>

      <form onSubmit={addNote}>
        <input
          value={newNote}
          onChange={event => setNewNote(event.target.value)}
        />
        <button type="submit">save</button>
      </form>
    </div>
  )
}

export default NoteForm
```

**Nota:** abbiamo anche cambiato il comportamento dell'applicazione: le nuove note sono importanti per impostazione predefinita, perché <i>important</i> riceve il valore <i>true</i>.

La variabile di stato <i>newNote</i> e il gestore che la modifica sono stati spostati da _App_ al componente del form.

Rimane una sola prop, la funzione _createNote_, che il form invoca quando viene creata una nota.

Senza lo stato <i>newNote</i> e il relativo gestore, _App_ diventa più semplice. La funzione _addNote_ riceve la nuova nota come parametro ed è l'unica prop passata al form:

```js
const App = () => {
  // ...
  const addNote = (noteObject) => { // highlight-line
    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
      })
  }
  // ...
  const noteForm = () => (
    <Togglable buttonLabel='new note'>
      <NoteForm createNote={addNote} />
    </Togglable>
  )

  // ...
}
```

Potremmo fare lo stesso con il modulo di login, ma lasciamo la modifica come esercizio facoltativo.

Il codice è disponibile su [GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part5-5), nel branch <i>part5-5</i>.

### Riferimenti ai componenti con ref

L'implementazione attuale è soddisfacente, ma possiamo migliorarne un aspetto.

Dopo la creazione di una nota sarebbe sensato nascondere il form, che al momento rimane visibile. La difficoltà è che la visibilità dipende dalla variabile di stato <i>visible</i>, interna a <i>Togglable</i>.

Una soluzione sarebbe spostare all'esterno il controllo dello stato di Togglable. Qui vogliamo però che il componente continui a gestire il proprio stato: ci serve quindi un meccanismo per modificarlo dall'esterno.

Esistono diversi modi per accedere dall'esterno alle funzioni di un componente. Useremo il meccanismo [ref](https://react.dev/learn/referencing-values-with-refs) di React per ottenere un riferimento attraverso il quale interagire con il componente.

Modifichiamo <i>App</i> così:

```js
import { useState, useEffect, useRef } from 'react' // highlight-line

const App = () => {
  // ...
  const noteFormRef = useRef() // highlight-line

  const noteForm = () => (
    <Togglable buttonLabel='new note' ref={noteFormRef}>  // highlight-line
      <NoteForm createNote={addNote} />
    </Togglable>
  )

  // ...
}
```

L'hook [useRef](https://react.dev/reference/react/useRef) crea il riferimento <i>noteFormRef</i>, passato al componente <i>Togglable</i> che contiene il form delle note. L'hook mantiene lo stesso oggetto ref tra i diversi rendering.

Modifichiamo anche <i>Togglable</i>:

```js
import { useState, useImperativeHandle } from 'react' // highlight-line

const Togglable = (props) => { // highlight-line
  const [visible, setVisible] = useState(false)

  const hideWhenVisible = { display: visible ? 'none' : '' }
  const showWhenVisible = { display: visible ? '' : 'none' }

  const toggleVisibility = () => {
    setVisible(!visible)
  }

// highlight-start
  useImperativeHandle(props.ref, () => {
    return { toggleVisibility }
  })
// highlight-end

  return (
    <div>
      <div style={hideWhenVisible}>
        <button onClick={toggleVisibility}>{props.buttonLabel}</button>
      </div>
      <div style={showWhenVisible}>
        {props.children}
        <button onClick={toggleVisibility}>cancel</button>
      </div>
    </div>
  )
}

export default Togglable
```

Il componente usa [useImperativeHandle](https://react.dev/reference/react/useImperativeHandle) per rendere disponibile all'esterno la funzione <i>toggleVisibility</i>.

Possiamo quindi nascondere il form chiamando <i>noteFormRef.current.toggleVisibility()</i> quando viene avviata la creazione di una nota:

```js
const App = () => {
  // ...
  const addNote = (noteObject) => {
    noteFormRef.current.toggleVisibility() // highlight-line
    noteService
      .create(noteObject)
      .then(returnedNote => {     
        setNotes(notes.concat(returnedNote))
      })
  }
  // ...
}
```

L'hook [useImperativeHandle](https://react.dev/reference/react/useImperativeHandle) permette dunque di esporre funzioni del componente che possono essere invocate dall'esterno tramite il ref.

Il meccanismo consente di modificare lo stato, anche se la sintassi è un po' laboriosa. Con i componenti a classi del «vecchio React» si potrebbe ottenere lo stesso risultato con un codice leggermente più semplice. Studieremo i componenti a classi nella parte 7. Finora questo è il caso in cui l'uso degli hook non ha reso il codice più semplice rispetto alle classi.

I ref hanno anche [altri utilizzi](https://react.dev/learn/manipulating-the-dom-with-refs), oltre all'accesso ai componenti React.

Il codice completo è disponibile nel branch <i>part5-6</i> di [questo repository GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part5-6).

### Una precisazione sui componenti

Quando definiamo un componente React:

```js
const Togglable = () => ...
  // ...
}
```

e lo utilizziamo così:

```js
<div>
  <Togglable buttonLabel="1" ref={togglable1}>
    first
  </Togglable>

  <Togglable buttonLabel="2" ref={togglable2}>
    second
  </Togglable>

  <Togglable buttonLabel="3" ref={togglable3}>
    third
  </Togglable>
</div>
```

creiamo <i>tre istanze distinte del componente</i>, ciascuna con il proprio stato:

![tre istanze indipendenti del componente Togglable](../../images/5/12e.png)

L'attributo <i>ref</i> associa a ciascun componente un riferimento nelle variabili <i>togglable1</i>, <i>togglable2</i> e <i>togglable3</i>.

### Il giuramento aggiornato dello sviluppatore full stack

Aumentano gli elementi da coordinare e, con essi, la probabilità di cercare un errore nel punto sbagliato. Dobbiamo quindi procedere con ancora più metodo.

Estendiamo nuovamente il giuramento:

Lo sviluppo full stack è <i>estremamente difficile</i>, quindi userò ogni mezzo possibile per renderlo più semplice.

- Terrò sempre aperta la console di sviluppo del browser
- Userò la scheda Network per verificare che frontend e backend comunichino come previsto
- Controllerò costantemente lo stato del server per assicurarmi che i dati inviati dal frontend siano salvati correttamente
- Controllerò che il backend salvi i dati nel database nel formato corretto
- Procederò a piccoli passi
- <i>Quando sospetterò un errore nel frontend, verificherò che il backend funzioni come previsto</i>
- <i>Quando sospetterò un errore nel backend, verificherò che il frontend funzioni come previsto</i>
- Userò molti _console.log_ per comprendere il comportamento del codice e dei test e individuare i problemi
- Se il codice non funziona, non ne aggiungerò altro: lo ridurrò finché non torna a funzionare oppure tornerò a uno stato stabile
- Se un test non passa, verificherò che la funzionalità controllata operi correttamente nell'applicazione
- Quando chiederò aiuto, formulerò correttamente le domande seguendo le [indicazioni generali](/it/part0)

</div>

<div class="tasks">

### Esercizi 5.5-5.11

#### 5.5 Frontend della lista di blog, passo 5

Modifica il form di creazione dei blog affinché sia visibile soltanto quando serve. Implementa un comportamento simile a quello visto [all'inizio della sezione](/it/part5/props_children_e_riferimenti_ai_componenti#mostrare-il-modulo-di-login-solo-quando-serve). Se vuoi, puoi usare il componente <i>Togglable</i>.

Inizialmente il form è nascosto:

![pulsante per creare un blog con il form nascosto](../../images/5/13ae.png)

Compare premendo <i>create new blog</i>:

![form per creare un nuovo blog](../../images/5/13be.png)

Il form si nasconde nuovamente quando viene creato un blog oppure si preme <i>cancel</i>.

#### 5.6 Frontend della lista di blog, passo 6

Estrai il form di creazione dei blog in un componente dedicato, se non l'hai già fatto, e trasferisci al suo interno tutto lo stato necessario.

Il componente deve funzionare come <i>NoteForm</i>, descritto nel [materiale](/it/part5/props_children_e_riferimenti_ai_componenti#lo-stato-dei-form) di questa sezione.

#### 5.7 Frontend della lista di blog, passo 7

Aggiungi a ciascun blog un pulsante che controlli la visualizzazione dei dettagli.

Premendo il pulsante vengono mostrati tutti i dettagli:

![dettagli di un blog aperti e pulsanti view per gli altri](../../images/5/13ea.png)

Premendolo di nuovo, i dettagli vengono nascosti.

Per ora il pulsante <i>like</i> non deve fare nulla.

Nell'immagine è stato aggiunto un po' di CSS per migliorare l'aspetto. Puoi aggiungere facilmente gli stili [inline](/it/part2/aggiungere_stili_allapplicazione_react#stili-inline) come nella parte 2:

```js
const Blog = ({ blog }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  return (
    <div style={blogStyle}> // highlight-line
      <div>
        {blog.title} {blog.author}
      </div>
      // ...
  </div>
)}
```

**NB:** il comportamento è quasi identico a quello di <i>Togglable</i>, ma il componente non può essere usato direttamente per ottenere il risultato desiderato. La soluzione più semplice è aggiungere al componente del blog uno stato che controlli la visibilità dei dettagli.

#### 5.8: Frontend della lista di blog, passo 8

Implementa il pulsante like. Il numero di like viene incrementato inviando una richiesta HTTP _PUT_ all'indirizzo del singolo blog nel backend.

Poiché l'operazione sostituisce l'intero blog, devi inviare tutti i suoi campi nel corpo della richiesta. Per aggiungere un like a questo blog:

```js
{
  _id: "5a43fde2cbd20b12a2c34e91",
  user: {
    _id: "5a43e6b6c37f3d065eaaa581",
    username: "mluukkai",
    name: "Matti Luukkainen"
  },
  likes: 0,
  author: "Joel Spolsky",
  title: "The Joel Test: 12 Steps to Better Code",
  url: "https://www.joelonsoftware.com/2000/08/09/the-joel-test-12-steps-to-better-code/"
},
```

devi inviare una richiesta HTTP PUT a <i>/api/blogs/5a43fde2cbd20b12a2c34e91</i> con questi dati:

```js
{
  user: "5a43e6b6c37f3d065eaaa581",
  likes: 1,
  author: "Joel Spolsky",
  title: "The Joel Test: 12 Steps to Better Code",
  url: "https://www.joelonsoftware.com/2000/08/09/the-joel-test-12-steps-to-better-code/"
}
```

Anche il backend deve essere aggiornato per gestire il riferimento all'utente.

#### 5.9: Frontend della lista di blog, passo 9

Notiamo un problema: dopo aver aggiunto un like, nei dettagli non compare più il nome dell'utente che ha inserito il blog:

![nome dell'utente assente sotto il pulsante like](../../images/5/59put.png)

Ricaricando la pagina, il nome ricompare. Questo comportamento non è accettabile: individua il problema e correggilo.

È possibile che la tua implementazione sia già corretta e non presenti il problema. In quel caso puoi proseguire.

#### 5.10: Frontend della lista di blog, passo 10

Modifica l'applicazione per ordinare i blog in base al numero di <i>like</i>. Puoi usare il metodo [sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) degli array.

#### 5.11: Frontend della lista di blog, passo 11

Aggiungi un pulsante per eliminare i blog e implementa la relativa logica nel frontend.

L'applicazione potrebbe apparire così:

![finestra di conferma per eliminare un blog](../../images/5/14ea.png)

La finestra di conferma si può implementare facilmente con [window.confirm](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm).

Mostra il pulsante di eliminazione soltanto se il blog è stato aggiunto dall'utente autenticato.

</div>

<div class="content">

### ESLint

Nella parte 3 abbiamo configurato [ESLint](/it/part3/validazione_ed_es_lint#lint) per controllare lo stile del codice del backend. Utilizziamolo anche nel frontend.

Vite ha già installato ESLint nel progetto: dobbiamo soltanto definire la configurazione desiderata nel file <i>eslint.config.js</i>.

Creiamo il file con il seguente contenuto:

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      // highlight-start
      ],
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'never'],
      eqeqeq: 'error',
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'arrow-spacing': ['error', { before: true, after: true }],
      'no-console': 'off'
      //highlight-end
    }
  }
]
```

**Nota:** se usi Visual Studio Code con l'estensione ESLint, potrebbe essere necessaria un'impostazione del workspace. Se compare <i>Failed to load plugin react: Cannot find module 'eslint-plugin-react'</i>, prova ad aggiungere questa riga a settings.json:

```js
"eslint.workingDirectories": [{ "mode": "auto" }]
```

Trovi ulteriori informazioni in [questa discussione](https://github.com/microsoft/vscode-eslint/issues/880#issuecomment-578052807).

Come al solito, puoi eseguire il controllo dalla riga di comando:

```bash
npm run lint
```

oppure tramite l'estensione ESLint dell'editor.

Il codice completo è disponibile nel branch <i>part5-7</i> di [questo repository GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part5-7).

</div>

<div class="tasks">

### Esercizio 5.12

#### 5.12: Frontend della lista di blog, passo 12

Aggiungi ESLint al progetto, scegli la configurazione che preferisci e correggi tutti gli errori segnalati dal linter.

Vite ha già installato ESLint: devi soltanto definire la configurazione desiderata in <i>eslint.config.js</i>.

</div>
