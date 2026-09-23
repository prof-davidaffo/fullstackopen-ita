---
mainImage: ../../../images/part-5.svg
part: 5
letter: e
lang: it
---

<div class="content">

L'interfaccia della nostra applicazione è ancora piuttosto essenziale:

![Interfaccia iniziale dell'applicazione delle note](../../images/5/u1.png)

Vogliamo migliorarla. Cominciamo dalla struttura della navigazione.

È molto comune che le applicazioni web abbiano una barra di navigazione per passare da una vista all'altra. La nostra applicazione delle note potrebbe includere una pagina iniziale:

![Pagina iniziale](../../images/5/u6.png)

una pagina separata per visualizzare le note:

![Elenco delle note](../../images/5/u7.png)

e una pagina per crearne di nuove:

![Pagina di creazione di una nota](../../images/5/u8.png)

[Nelle applicazioni web tradizionali](/it/part0/fondamenti_delle_applicazioni_web#applicazioni-web-tradizionali), passare da una pagina all'altra comportava l'invio di una nuova richiesta HTTP GET al server. Il browser visualizzava poi il codice HTML restituito, corrispondente alla nuova vista.

Nelle applicazioni a pagina singola, invece, rimaniamo sempre sulla stessa pagina: il codice JavaScript eseguito nel browser crea l'illusione di pagine diverse. Le eventuali richieste HTTP effettuate durante il cambio di vista servono a recuperare i dati in formato JSON necessari per visualizzarla.

Con React sarebbe semplice realizzare una barra di navigazione e più viste: potremmo, per esempio, memorizzare nello stato <i>page</i> la pagina corrente e visualizzare la vista corrispondente:

```js
const App = () => {
  const [page, setPage] = useState('home')

 const  toPage = (page) => (event) => {
    event.preventDefault()
    setPage(page)
  }

  const content = () => {
    if (page === 'home') {
      return <Home />
    } else if (page === 'notes') {
      return <Notes />
    } else if (page === 'users') {
      return <Users />
    }
  }

  return (
    <div>
      <div>
        <a href="" onClick={toPage('home')} >
          home
        </a>
        <a href="" onClick={toPage('notes')}>
          notes
        </a>
        <a href="" onClick={toPage('users')} >
          users
        </a>
      </div>

      {content()}
    </div>
  )
}
```

Questo metodo, però, non è ottimale: l'URL rimane uguale anche quando cambia la vista. Ogni vista dovrebbe avere un proprio URL, per consentire, per esempio, di salvarla nei preferiti. Inoltre, senza indirizzi distinti, il pulsante Indietro del browser non funziona come ci aspetteremmo: invece di tornare alla vista precedente dell'applicazione, ci porta altrove.

### React Router

La libreria [React Router](https://reactrouter.com/) offre una soluzione per gestire la navigazione in un'applicazione React.

Installiamola:

```bash
npm install react-router-dom
```

Creiamo un nuovo componente che rappresenti la pagina iniziale dell'applicazione:

```js
const Home = () => {
  return (
    <div>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </div>
  )
}

export default Home
```

Estraiamo la precedente vista principale, contenuta in <i>App</i>, in un componente separato. Manteniamo però la gestione dello stato delle note al di fuori di questo componente:

```js
// list of notes passed as a parameter
const NoteList = ({ notes }) => { // highlight-line
  // content mostly the same as in the App component
  // reference to NoteForm is removed
}
```

Il componente <i>App</i> diventa:

```js
import { useState, useEffect } from 'react'
import noteService from './services/notes'

import {
  BrowserRouter as Router,
  Routes, Route, Link
} from 'react-router-dom'
import NoteList from './components/NoteList'
import Home from './components/Home'
import Footer from './components/Footer'
import NoteForm from './components/NoteForm'

const App = () => {
  const [notes, setNotes] = useState([])

  useEffect(() => {
    noteService.getAll().then(initialNotes => {
      setNotes(initialNotes)
    })
  }, [])

  const addNote = noteObject => {
    noteService.create(noteObject).then(returnedNote => {
      setNotes(notes.concat(returnedNote))
    })
  }

  const padding = {
    padding: 5
  }

  return (
    // highlight-start
    <Router>
      <div>
        <Link style={padding} to="/">home</Link>
        <Link style={padding} to="/notes">notes</Link>
        <Link style={padding} to="/create">new note</Link>
      </div>
        // highlight-end  

    // highlight-start
      <Routes>
        <Route path="/notes" element={
          <NoteList notes={notes} />
        } />
        <Route path="/create" element={
          <NoteForm createNote={addNote}/>
        } />
        <Route path="/" element={<Home />} />
      </Routes>

      <Footer />
    </Router>
    // highlight-end
  )
}

export default App
```

Il routing, cioè il rendering condizionale dei componenti in base all'<i>URL</i> del browser, viene abilitato inserendo i componenti all'interno di [Router](https://reactrouter.com/api/declarative-routers/Router), come suoi figli.

Definiamo innanzitutto la barra di navigazione con i componenti [Link](https://reactrouter.com/api/components/Link). L'attributo <i>to</i> specifica quale URL usare quando si fa clic sul link:

```js
<div>
  <Link style={padding} to="/">home</Link>
  <Link style={padding} to="/notes">notes</Link>
  <Link style={padding} to="/create">new note</Link>
</div>
```

Definiamo poi le rotte dell'applicazione con il componente [Routes](https://reactrouter.com/api/components/Routes). Al suo interno usiamo [Route](https://reactrouter.com/api/components/Route) per associare i percorsi ai componenti da visualizzare:

```js
<Routes>
  <Route path="/notes" element={
    <NoteList notes={notes} />
  } />
  <Route path="/create" element={
    <NoteForm createNote={addNote}/>
  } />
  <Route path="/" element={<Home />} />
</Routes>
```

All'URL radice dell'applicazione viene visualizzato il componente <i>Home</i>:

![Pagina Home con la barra di navigazione](../../images/5/u2.png)

Facendo clic su "notes", il percorso nella barra degli indirizzi diventa <i>/notes</i> e viene visualizzato <i>NoteList</i>:

![Vista delle note raggiunta tramite navigazione](../../images/5/u3.png)

Analogamente, facendo clic su "new note", il percorso diventa <i>/create</i> e viene visualizzato <i>NoteForm</i>.

Seguire un normale collegamento verso un'altra pagina comporta il caricamento di un nuovo documento. Con i componenti Link di React Router, invece, la navigazione viene gestita interamente dal codice JavaScript del frontend.

Il Router che usiamo è [BrowserRouter](https://reactrouter.com/en/main/router-components/browser-router):

```js
import {
  BrowserRouter as Router, // highlight-line
  Routes, Route, Link
} from 'react-router-dom'
```

Come spiega la [documentazione](https://reactrouter.com/en/main/router-components/browser-router), <i>BrowserRouter</i> usa l'API History del browser, con pushState, replaceState e l'evento popstate, per mantenere sincronizzati l'interfaccia e l'URL.

L'[API History di HTML5](https://css-tricks.com/using-the-html5-history-api/) permette quindi di usare l'indirizzo del browser per il routing interno dell'applicazione. Durante questa navigazione l'URL cambia, ma il contenuto della pagina viene aggiornato tramite JavaScript senza caricare un nuovo documento dal server. I pulsanti Indietro e Avanti e il salvataggio nei preferiti si comportano come nei siti tradizionali.

Il codice completo dell'applicazione a questo punto è disponibile su [GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part5-10), nel branch <i>part5-10</i>.

### Rotte parametrizzate

Spostiamo i dettagli di ogni nota in una vista dedicata, raggiungibile facendo clic sul suo testo:

![Dettagli di una singola nota](../../images/5/u4.png)

Nel componente <i>NoteList</i> rendiamo cliccabile il testo nel modo seguente:

```js
import { Link } from 'react-router-dom' // highlight-line

const NoteList = ({ notes }) => {
  // ...

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />

      {!user && loginForm()}

      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <ul>
        {notesToShow.map(note => (
          <li key={note.id}>
            <Link to={`/notes/${note.id}`}>{note.content}</Link> // highlight-line
          </li>
        ))}
      </ul>
    </div>
  )
}

export default NoteList
```

Usiamo nuovamente [Link](https://reactrouter.com/api/components/Link). Per esempio, facendo clic su una nota con <i>id</i> 12345, il percorso diventa <i>/notes/12345</i>.

Nel componente <i>App</i> definiamo l'URL parametrizzato così. Il frammento originale include anche rotte di esempio per utenti e login: per la nostra applicazione interessa la nuova rotta <i>/notes/:id</i>; le altre vanno mantenute coerenti con i componenti già presenti:

```js
<Router>
  // ...

  <Routes>
    // highlight-start
    <Route path="/notes/:id" element={
      <Note notes={notes} toggleImportanceOf={toggleImportanceOf} />
     } />
    // highlight-end
    <Route path="/notes" element={<Notes notes={notes} />} />   
    <Route path="/users" element={user ? <Users /> : <Navigate replace to="/login" />} />
    <Route path="/login" element={<Login onLogin={login} />} />
    <Route path="/" element={<Home />} />      
  </Routes>
</Router>
```

La rotta che visualizza una singola nota usa una notazione simile a quella di Express: il parametro del percorso viene indicato con <i>:id</i>:

```js
<Route path="/notes/:id" element={<Note notes={notes} ... />} />
```

Quando il browser raggiunge l'URL di una nota, per esempio <i>/notes/12345</i>, viene visualizzato il componente <i>Note</i>, che dobbiamo modificare leggermente:

```js
import { useParams } from 'react-router-dom' // highlight-line

const Note = ({ notes, toggleImportance }) => {
  // highlight-start
  const id = useParams().id
  const note = notes.find(n => n.id === id)
  // highlight-end

  const label = note.important ? 'make not important' : 'make important'

  return (
    <li className="note">
      <span>{note.content}</span>
      <button onClick={() => toggleImportance(id)}>{label}</button>
    </li>
  )
}

export default Note
```

A differenza di prima, <i>Note</i> riceve <i>tutte le note</i> attraverso la prop <i>notes</i>. La funzione [useParams](https://reactrouter.com/api/hooks/useParams) di React Router permette di leggere la parte variabile dell'URL, cioè l'<i>id</i> della nota da visualizzare.

**Attenzione:** questo frammento originale chiama la prop <i>toggleImportance</i>, mentre il componente padre usa <i>toggleImportanceOf</i>. I due nomi devono coincidere: nei prossimi esempi useremo <i>toggleImportanceOf</i> in entrambi i componenti.

### useNavigate

Il backend supporta già l'eliminazione delle note. Aggiungiamo un pulsante nella vista della singola nota:

![Nota con il pulsante di eliminazione](../../images/5/u5.png)

Definiamo in <i>App</i> il gestore che esegue l'eliminazione e passiamolo a <i>Note</i>:

```js
const App = () => {

  // highlight-start
  const deleteNote = (id) => {
    noteService.remove(id).then(() => {
      setNotes(notes.filter(n => n.id !== id))
    })
  }
  // highlight-end

  return (
      // ...

      <Routes>
        <Route path="/notes/:id" element={
          <Note 
            notes={notes}
            toggleImportanceOf={toggleImportanceOf}
            deleteNote={deleteNote} // highlight-line
          />
        } />
        <Route path="/notes" element={
          <NoteList notes={notes} />
        } />
        <Route path="/create" element={
          <NoteForm createNote={addNote}/>
        } />
        <Route path="/" element={<Home />} />
      </Routes>

      <Footer />
    </Router>
  )
}  
```

Il componente <i>Note</i> diventa:

```js
import { useParams, useNavigate } from 'react-router-dom'

const Note = ({ notes, toggleImportanceOf, deleteNote }) => { // highlight-line
  const id = useParams().id
  const navigate = useNavigate()  // highlight-line
  const note = notes.find(n => n.id === id)

  const label = note.important ? 'make not important' : 'make important'

// highlight-start
  const handleDelete = () => {
    if (window.confirm(`Delete note "${note.content}"?`)) {
      deleteNote(id)
      navigate('/notes')
    }
  }
  // highlight-end

  return (
    <li className="note">
      <span>{note.content}</span>
      <button onClick={() => toggleImportanceOf(id)}>{label}</button>
      <button onClick={handleDelete}>delete</button>  // highlight-line
    </li>
  )
}

export default Note
```

Quando l'utente conferma l'eliminazione, avviamo la richiesta e lo riportiamo all'elenco delle note. Per navigare chiamiamo la funzione restituita da [useNavigate](https://reactrouter.com/api/hooks/useNavigate) con il percorso desiderato: <i>navigate('/notes')</i>. In questo esempio la navigazione è immediata: non aspetta che la richiesta di eliminazione termini.

[useParams](https://reactrouter.com/api/hooks/useParams) e [useNavigate](https://reactrouter.com/api/hooks/useNavigate) sono Hook, proprio come useState e useEffect. Come abbiamo visto nella Parte 1, il loro utilizzo richiede il rispetto di alcune [regole](/it/part1/stato_complesso_e_debugging_delle_applicazioni_react#regole-degli-hook).

Modifichiamo anche <i>NoteForm</i> per tornare all'elenco quando viene avviata la creazione di una nota. Anche qui il codice non attende la risposta del server prima di navigare:

```js
import { useState } from 'react' 
import { useNavigate } from 'react-router-dom' // highlight-line

const NoteForm = ({ createNote }) => {
  const [newNote, setNewNote] = useState('')
  const navigate = useNavigate() // highlight-line

  const addNote = event => {
    event.preventDefault()
    createNote({
      content: newNote,
      important: true
    })

    navigate('/notes') // highlight-line
    setNewNote('')
  }

  return (
    <div>
      <h2>Create a new note</h2>

      <form onSubmit={addNote}>
        <input
          value={newNote}
          onChange={event => setNewNote(event.target.value)}
          placeholder="write note content here"
        />
        <button type="submit">save</button>
      </form>
    </div>
  )
}
```

### Rivedere le rotte parametrizzate

C'è un aspetto poco soddisfacente: <i>Note</i> riceve <i>tutte le note</i> come prop, pur mostrando soltanto quella il cui <i>id</i> corrisponde al parametro dell'URL:

```js
const Note = ({ notes, toggleImportance }) => { 
  const id = useParams().id
  const note = notes.find(n => n.id === Number(id))
  // ...
}
```

**Nota:** la conversione <i>Number(id)</i> nel frammento originale è adatta soltanto a identificatori numerici. Con gli identificatori stringa restituiti dal nostro backend MongoDB dobbiamo usare <i>n.id === id</i>, come negli esempi precedenti.

Possiamo modificare l'applicazione affinché <i>Note</i> riceva soltanto la nota da visualizzare?

```js
import { useParams, useNavigate } from 'react-router-dom'

const Note = ({ note, id, toggleImportanceOf, deleteNote }) => {  // highlight-line
  const id = useParams().id
  const navigate = useNavigate()

  // ...

  return (
    <li className="note">
      <span>{note.content}</span>
      <button onClick={() => toggleImportanceOf(id)}>{label}</button>
      <button onClick={handleDelete}>delete</button>
    </li>
  )
}

export default Note
```

**Nota:** nel frammento precedente c'è un refuso: <i>id</i> compare sia tra le prop sia nella dichiarazione <i>const id</i>. Va rimosso dall'elenco delle prop, perché lo leggiamo già con <i>useParams</i>.

Una soluzione consiste nell'individuare in <i>App</i> la nota da visualizzare usando l'Hook [useMatch](https://reactrouter.com/api/hooks/useMatch).

Gli Hook del router devono essere eseguiti in un componente che si trovi all'interno di un Router. Il Router restituito da <i>App</i> avvolge i suoi figli, non <i>App</i> stesso. Spostiamolo quindi all'esterno di <i>App</i>, nel punto in cui montiamo l'applicazione:

```js
ReactDOM.createRoot(document.getElementById('root')).render(
  <Router> // highlight-line
    <App />
  </Router> // highlight-line
)
```

Il componente <i>App</i> diventa:

```js
import {
  // ...
  useMatch  // highlight-line
} from 'react-router-dom'

const App = () => {
  // ...

 // highlight-start
  const match = useMatch('/notes/:id')

  const note = match
    ? notes.find(note => note.id === match.params.id)
    : null
  // highlight-end

  return (
    <div>
      <div>
        <Link style={padding} to="/">home</Link>
        // ...
      </div>

      <Routes>
        <Route path="/notes/:id" element={
          <Note
            note={note} // highlight-line
            toggleImportanceOf={toggleImportanceOf}
            deleteNote={deleteNote}
          />
        } />
        <Route path="/notes" element={
          <NoteList notes={notes} />
        } />
        <Route path="/create" element={
          <NoteForm createNote={addNote}/>
        } />
        <Route path="/" element={<Home />} />
      </Routes>

      <div>
        <em>Note app, Department of Computer Science 2026</em>
      </div>
    </div>
  )
}    
```

La scritta nel piè di pagina è quella dell'esempio originale; puoi sostituirla con un testo adatto alla tua applicazione.

A ogni rendering di <i>App</i>, anche quando cambia l'indirizzo durante la navigazione, viene eseguita questa chiamata:

```js
const match = useMatch('/notes/:id')
```

Se il percorso corrisponde a <i>/notes/:id</i>, <i>match</i> contiene un oggetto dal quale possiamo leggere il parametro <i>id</i>. Lo usiamo per cercare la nota da visualizzare:

```js
const note = match 
  ? notes.find(note => note.id === match.params.id)
  : null
```

Rimane un piccolo problema. Ricaricando il browser sulla pagina di una singola nota, l'applicazione tenta di visualizzarla prima che le note siano state recuperate dal backend:

![Vista della singola nota](../../images/5/u5.png)

Possiamo evitare l'errore con il rendering condizionale:

```js
const Note = ({ note, toggleImportanceOf, deleteNote }) => {
  const id = useParams().id
  const navigate = useNavigate()

// highlight-start
  if(!note) {
    return null
  }
  // highlight-end

  return (
    //...
  )
}
```

L'applicazione ha ancora un limite: tutta la logica di login si trova nella pagina dell'elenco delle note. Per ora la lasciamo in questo stato parzialmente incompleto.

Il codice completo è disponibile su [GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part5-11), nel branch <i>part5-11</i>.

</div>

<div class="tasks">

### Esercizi 5.24–5.28

#### 5.24: Routing dei blog, passo 1

Aggiungi React Router all'applicazione dei blog, in modo che i link nella barra di navigazione permettano di scegliere la vista da visualizzare.

Alla radice dell'applicazione, cioè al percorso <i>/</i>, mostra l'elenco di tutti i blog:

![Elenco dei blog nella pagina iniziale](../../images/5/l1.png)

Il percorso <i>/login</i> deve permettere di effettuare l'accesso:

![Pagina di login](../../images/5/l2.png)

Quando l'utente ha effettuato l'accesso, nella barra di navigazione deve comparire un pulsante per uscire:

![Barra di navigazione con logout](../../images/5/l3.png)

Dopo il login e il logout, l'utente deve essere riportato all'elenco dei blog.

Per il momento non occorre occuparsi della creazione dei blog.

#### 5.25: Routing dei blog, passo 2

Realizza una vista con le informazioni di un singolo blog:

![Dettagli di un blog](../../images/5/l5.png)

La vista deve essere raggiungibile dall'elenco dei blog:

![Link ai dettagli dall'elenco dei blog](../../images/5/l4.png)

Assicurati che la funzionalità dei "like" continui a funzionare! Modificala inoltre in modo che soltanto gli utenti autenticati possano mettere "mi piace".

#### 5.26: Routing dei blog, passo 3

Crea una vista per aggiungere un nuovo blog, raggiungibile dalla navigazione dagli utenti autenticati:

![Vista per creare un blog](../../images/5/l6.png)

Dopo l'aggiunta di un blog o l'eliminazione di uno esistente, l'utente deve tornare all'elenco di tutti i blog.

#### 5.27: Routing dei blog, passo 4

L'aspetto e l'usabilità dell'applicazione sono migliorati. Purtroppo alcuni test non funzionano più.

Aggiorna i test della vista del singolo blog scritti con Vitest, verificando che:

- Gli utenti non autenticati vedano le informazioni del blog e il numero di like, ma non i pulsanti.
- Gli utenti autenticati diversi dal creatore vedano soltanto il pulsante per mettere "mi piace".
- Il creatore del blog veda anche il pulsante di eliminazione.

#### 5.28: Routing dei blog, passo 5

Ora sistemiamo i test end-to-end scritti con Playwright. I cambiamenti alla navigazione richiedono modifiche sostanziali ai test precedenti.

Crea test per questi scenari:

- Il login riesce con nome utente e password corretti.
- Il login fallisce se il nome utente o la password sono errati.
- Un utente autenticato può creare un blog.
- Un utente autenticato può mettere "mi piace" ai blog.
- Un utente autenticato può eliminare un blog che ha creato.

Per il momento non occorre verificare l'ordinamento dei blog in base ai like.

</div>

<div class="content">

### Librerie per l'interfaccia

Nella Parte 2 abbiamo visto due modi per aggiungere stili: un tradizionale [file CSS](/it/part2/aggiungere_stili_allapplicazione_react) e gli [stili inline](/it/part2/aggiungere_stili_allapplicazione_react#stili-inline). In questa sezione ne esploreremo altri.

Un approccio consiste nell'usare un framework per l'interfaccia, o UI framework: una libreria di stili e componenti per costruire l'interfaccia utente.

[Bootstrap](https://getbootstrap.com/), sviluppato da Twitter, è uno degli esempi più noti. Esistono numerose librerie di questo tipo: elencarle tutte non sarebbe utile.

Molti UI framework includono temi predefiniti e "componenti" come pulsanti, menu e tabelle. Qui usiamo le virgolette perché non si tratta necessariamente di componenti React. Spesso queste librerie si utilizzano includendo nell'applicazione i loro fogli di stile CSS e il loro codice JavaScript.

Diversi framework hanno anche versioni pensate per React, nelle quali gli elementi dell'interfaccia sono veri componenti React. Un esempio è [React-Bootstrap](https://react-bootstrap.github.io/).

Qui useremo invece [Material UI](https://mui.com/), una libreria React che implementa il linguaggio visivo [Material Design](https://material.io/) di Google.

Installiamo la libreria:

```bash
npm install @mui/material @emotion/react @emotion/styled
```

Con Material UI possiamo racchiudere il contenuto dell'applicazione nel componente [Container](https://mui.com/material-ui/react-container/):

```js
import { Container } from '@mui/material'

const App = () => {
  // ...
  return (
    <Container>
      // ...
    </Container>
  )
}
```

#### Tabella

Cominciamo da <i>NoteList</i> e mostriamo le note in una [tabella](https://mui.com/material-ui/react-table/#simple-table), aggiungendo anche il nome dell'utente che ha creato ciascuna nota:

```js
import { useState, useEffect } from 'react'

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

//...

const NoteList = ({ notes }) => {

  // ...

  return (
    <div>
      // ...
      <h2>Notes</h2>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>content</TableCell>
              <TableCell>user</TableCell>
              <TableCell>important</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notes.map(note => (
              <TableRow key={note.id}>
                <TableCell>
                  <Link to={`/notes/${note.id}`}>
                    {note.content}
                  </Link>
                </TableCell>
                <TableCell>
                  {note.user.name}
                </TableCell>
                <TableCell>
                  {note.important ? 'yes': ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

    </div>
  )
}

export default NoteList
```

La tabella si presenta così:

![Tabella delle note con autore e importanza](../../images/5/u10.png)

#### Form

Miglioriamo ora <i>NoteForm</i>, la vista per creare una nota, usando i componenti [TextField](https://mui.com/material-ui/react-text-field/) e [Button](https://mui.com/material-ui/react-button/):

```js 
import { TextField, Button } from '@mui/material'

// ...

const NoteForm = ({ createNote }) => {
  // ...

  return (
    <div>
      <h2>Create a new note</h2>

      <form onSubmit={addNote}>
        <TextField
          label="note content"
          value={newNote}
          onChange={event => setNewNote(event.target.value)}
        />
        <div>
          <Button type="submit" variant="contained" style={{ marginTop: 10 }}>
            save
          </Button>
        </div>
      </form>
    </div>
  )
}

export default NoteForm

```

Ecco il risultato:

![Form di creazione con Material UI](../../images/5/u11.png)

#### Notifiche

Miglioriamo il componente delle notifiche usando [Alert](https://mui.com/material-ui/react-alert/) di Material UI:

```js
import { Alert } from '@mui/material'

const Notification = ({ notification }) => {
  if (notification === null) {
    return null
  }

  return (
    <Alert style={{ marginTop: 10, marginBottom: 10 }} severity={notification.type}>
      {notification.text}
    </Alert>
  )
}

export default Notification
```

Spostiamo il componente delle notifiche e la gestione del suo stato in <i>App</i>:

```js
const App = () => {
  const [notes, setNotes] = useState([])
  const [notification, setNotification] = useState(null) // highlight-line

  // ...

  const addNote = noteObject => {
    noteService.create(noteObject).then(returnedNote => {
      setNotes(notes.concat(returnedNote))
      setNotification({ text: `Note '${returnedNote.content}' added!`, type: 'success' }) // highlight-line
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    })
  }

  return (
    <Container>
      <div>
        <Link style={padding} to="/">home</Link>
        <Link style={padding} to="/notes">notes</Link>
        <Link style={padding} to="/create">new note</Link>
      </div>

      <Notification notification={notification} /> // highlight-line

      <Routes>
        <Route path="/notes/:id" element={
          <Note
            note={note}
            toggleImportanceOf={toggleImportanceOf}
            deleteNote={deleteNote}
          />
        } />
        <Route path="/notes" element={
          <NoteList notes={notes} setNotification={setNotification} />
        } />
        <Route path="/create" element={
          <NoteForm createNote={addNote} />
        } />
        <Route path="/" element={<Home />} />
      </Routes>

      <Footer />
    </Container>
  )
}
```

Ecco l'aspetto della notifica:

![Notifica di creazione della nota](../../images/5/u12.png)

#### Menu di navigazione

Realizziamo il menu con il componente [AppBar](https://mui.com/material-ui/react-app-bar/).

Proviamo inizialmente a inserire i link nei pulsanti:

```js
<AppBar position="static">
  <Toolbar>
    <Button color="inherit"><Link to="/">home</Link></Button>
    <Button color="inherit"><Link to="/notes">notes</Link></Button>
    <Button color="inherit"><Link to="/create">new note</Link></Button>
  </Toolbar>
</AppBar>
```

La navigazione funziona, ma l'aspetto non è ancora quello desiderato:

![Barra di navigazione con link dentro i pulsanti](../../images/5/u15.png)

La [documentazione sulla composizione](https://mui.com/material-ui/guides/composition/#component-prop) descrive una soluzione migliore: la prop <i>component</i> permette di scegliere come viene renderizzato l'elemento radice di un componente Material UI.

Scrivendo:

```js
<Button color="inherit" component={Link} to="/">
  home
</Button>
```

l'elemento radice di <i>Button</i> viene renderizzato usando il componente <i>Link</i> di <i>react-router-dom</i>. A questo componente viene passata anche la prop <i>to</i>, che specifica il percorso.

Il codice completo della barra di navigazione è:

```js
<AppBar position="static">
  <Toolbar>
    <Button color="inherit" component={Link} to="/">home</Button>
    <Button color="inherit" component={Link} to="/notes">notes</Button>
    <Button color="inherit" component={Link} to="/create">new note</Button>
  </Toolbar>
</AppBar>
```

Il risultato è quello desiderato:

![Barra di navigazione con pulsanti usati come link](../../images/5/u16.png)

Notiamo però che il cambiamento al passaggio del mouse è poco evidente. Rendiamolo più visibile definendo un colore di sfondo per lo stato hover:

```js
const style = { '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }

return (
  <Container>
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit" component={Link} to="/" sx={style}>
          home
        </Button>
        <Button color="inherit" component={Link} to="/notes" sx={style}>
          notes
        </Button>
        <Button color="inherit" component={Link} to="/create" sx={style}>
          new note
        </Button>
      </Toolbar>
    </AppBar>

    // ...
)
```

Ora siamo soddisfatti:

![Barra di navigazione con evidenziazione al passaggio del mouse](../../images/5/u17.png)

Il codice completo è disponibile su [GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part5-12), nel branch <i>part5-12</i>.

### Styled Components

Oltre alle soluzioni già viste, esistono altri modi per applicare stili a un'applicazione React.

La libreria [styled-components](https://www.styled-components.com/) propone un approccio basato sulla sintassi dei [tagged template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) di ES6.

[Installiamola](https://styled-components.com/docs/basics#installation) e usiamola per modificare l'aspetto dell'applicazione delle note, ripartendo dalla versione precedente all'introduzione di Material UI. Definiamo prima due componenti con i rispettivi stili:

```js
import styled from 'styled-components'

const Button = styled.button`
  background: Bisque;
  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid Chocolate;
  border-radius: 3px;
`

const Input = styled.input`
  margin: 0.25em;
  width: 300px;  
`
```

Il codice crea versioni personalizzate degli elementi HTML <i>button</i> e <i>input</i> e le assegna alle variabili <i>Button</i> e <i>Input</i>.

Le definizioni CSS sono racchiuse tra backtick, grazie alla sintassi dei [tagged template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) di ES6.

I componenti ottenuti si comportano come normali pulsanti e campi di input e si usano nell'applicazione nel modo consueto:

```js
const NoteForm = ({ createNote }) => {
  // ...

  return (
    <div>
      <h2>Create a new note</h2>

      <form onSubmit={addNote}>
        <Input> // highlight-line
          value={newNote}
          onChange={event => setNewNote(event.target.value)}
          placeholder="write note content here"
        />
        <Button type="submit">save</Button> // highlight-line
      </form>
    </div>
  )
}
```

**Attenzione:** nel frammento originale c'è un carattere <i>&gt;</i> di troppo subito dopo <i>Input</i>. Rimuovilo: le prop devono rimanere dentro il tag di apertura, che termina con <i>/&gt;</i> dopo <i>placeholder</i>.

Il form assume questo aspetto:

![Form personalizzato con styled-components](../../images/5/u20.png)

Definiamo anche questi componenti, tutti basati su elementi <i>div</i> con stili personalizzati:

```js
const Page = styled.div`
  padding: 1em;
  background: papayawhip;
`

const Navigation = styled.div`
  background: BurlyWood;
  padding: 1em;
`

const Footer = styled.div`
  background: Chocolate;
  padding: 1em;
  margin-top: 1em;
`
```

Possiamo ora usare i nuovi componenti nell'applicazione. Anche qui il testo del piè di pagina appartiene all'esempio originale e può essere sostituito:

```js
const App = () => {
  // ...

  return (
    <Page> // highlight-line
      <Navigation> // highlight-line
        <Link style={padding} to="/">home</Link>
        <Link style={padding} to="/notes">notes</Link>
        <Link style={padding} to="/create">new note</Link>
      </Navigation> // highlight-line

      <Routes>
        <Route path="/notes/:id" element={
          <Note
            note={note}
            toggleImportanceOf={toggleImportanceOf}
            deleteNote={deleteNote}
          />
        } />
        <Route path="/notes" element={
          <NoteList notes={notes} />
        } />
        <Route path="/create" element={
          <NoteForm createNote={addNote}/>
        } />
        <Route path="/" element={<Home />} />
      </Routes>
// highlight-start
      <Footer>
         Note app, Department of Computer Science, University of Helsinki 2026
      </Footer>
    </Page>
    // highlight-end
  )
}
```

Ecco il risultato finale:

![Applicazione con gli stili di styled-components](../../images/5/u21.png)

Styled-components offre quindi un'alternativa per definire gli stili direttamente insieme ai componenti React.

</div>

<div class="tasks">

### Esercizi 5.29–5.31

Migliora ora l'aspetto dell'applicazione dei blog usando Material UI oppure Styled Components.

#### 5.29: Stili dei blog, passo 1

Aggiungi gli stili ai form dell'applicazione.

La tua soluzione potrebbe assomigliare a questi esempi. Form di login:

![Form di login con stili](../../images/5/l10.png)

Creazione di un nuovo blog:

![Form di creazione di un blog con stili](../../images/5/l11.png)

#### 5.30: Stili dei blog, passo 2

Personalizza la barra di navigazione e il componente delle notifiche. Il risultato potrebbe essere simile a questo:

![Barra di navigazione e notifica con stili](../../images/5/l12.png)

#### 5.31: Stili dei blog, passo 3

Personalizza come preferisci il componente che visualizza un singolo blog. Ecco un esempio:

![Vista del singolo blog con stili](../../images/5/l14.png)

Con questo esercizio si conclude la Parte 5.

</div>
