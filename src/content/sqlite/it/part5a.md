---
mainImage: ../../../images/part-5.svg
part: 5
letter: a
lang: it
course: sqlite
---

<div class="content">

### Collegamento al backend SQLite

Usa il backend completato nella Parte 4. Non scaricare un backend MongoDB dai repository originali citati negli esempi. Gli esempi frontend restano validi perché le API mantengono lo stesso formato JSON.

Il backend SQLite protegge anche PUT e DELETE: quando estendi services/notes.js, invia il token per tutte le scritture. Il servizio mostrato più avanti include già queste modifiche.

Al logout chiama noteService.setToken(null). Applica lo stesso criterio al servizio dei blog. Prima della Parte 5 assegna un autore alle eventuali note precedenti, come indicato nella 4c.

Nelle ultime due parti ci siamo concentrati soprattutto sul backend. Il frontend sviluppato nella [parte 2](/it/part2) non supporta ancora la gestione degli utenti implementata nella parte 4.

Al momento il frontend mostra le note, ma aggiungerle o modificarne l'importanza richiede ora un token che verifichi l'identità dell'utente. Aggiorniamo quindi il frontend per inviarlo insieme alle richieste di scrittura.

Implementiamo nel frontend parte della gestione degli utenti, iniziando dal login. In questa parte supporremo che i nuovi utenti non vengano creati dal frontend.

### Aggiungere un modulo di login

In cima alla pagina è stato aggiunto un modulo di login:

![modulo di login dell'applicazione delle note](../../images/5/1new.png)

Il componente <i>App</i> appare ora così:

```js
const App = () => {
  const [notes, setNotes] = useState([]) 
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  // highlight-start
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('') 
// highlight-end

  useEffect(() => {
    noteService
      .getAll().then(initialNotes => {
        setNotes(initialNotes)
      })
  }, [])

  // ...

// highlight-start
  const handleLogin = (event) => {
    event.preventDefault()
    console.log('logging in with', username, password)
  }
  // highlight-end

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />
      
      // highlight-start
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>
            username
            <input
              type="text"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            password
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </label>
        </div>
        <button type="submit">login</button>
      </form>
    // highlight-end

      // ...
    </div>
  )
}

export default App
```

Il codice corrente è disponibile su [GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part5-1), nel branch <i>part5-1</i>. Se cloni il repository, esegui _npm install_ prima di avviare il frontend.

Senza connessione al backend il frontend non mostra alcuna nota. Avvia il backend della Parte 4 con _npm run dev_: sarà disponibile sulla porta 3001. Lascialo attivo e, in un altro terminale, avvia il frontend con _npm run dev_. Vedrai così le note salvate nel database SQLite.

Ricordalo per il resto del corso.

Il modulo di login viene gestito come i form della [parte 2](/it/part2/form). Lo stato contiene <i>username</i> e <i>password</i>; i gestori degli eventi sincronizzano i campi con lo stato di <i>App</i>. Ricevono un oggetto, ne destrutturano <i>target</i> e ne salvano il valore nello stato.

```js
({ target }) => setUsername(target.value)
```

Il metodo _handleLogin_, responsabile dei dati del modulo, deve ancora essere implementato.

### Aggiungere la logica di login

Il login invia una richiesta HTTP POST a <i>api/login</i>. Separiamo il codice della richiesta nel modulo <i>services/login.js</i>.

Per la richiesta HTTP useremo <i>async/await</i>:

```js
import axios from 'axios'
const baseUrl = '/api/login'

const login = async credentials => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

export default { login }
```

Il gestore del login può essere implementato così:

```js
import loginService from './services/login' // highlight-line

const App = () => {
  // ...
  const [username, setUsername] = useState('') 
  const [password, setPassword] = useState('') 
// highlight-start
  const [user, setUser] = useState(null)
// highlight-end

  // ...

  const handleLogin = async event => { // highlight-line
    event.preventDefault()
    
    // highlight-start
    try {
      const user = await loginService.login({ username, password })
      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
    // highlight-end
  }

  // ...
}
```

Se il login riesce, i campi vengono svuotati <i>e</i> la risposta del server, contenente il <i>token</i> e i dati dell'utente, viene salvata nello stato <i>user</i>.

Se il login o _loginService.login_ falliscono, l'utente riceve una notifica.

### Rendering condizionale del modulo di login

Il login riuscito non viene ancora mostrato. Visualizziamo il modulo soltanto <i>se l'utente non è autenticato</i>, cioè quando _user === null_, e il form delle note soltanto quando lo stato <i>user</i> contiene i dati dell'utente.

Aggiungiamo ad <i>App</i> due funzioni di supporto che generano i form:

```js
const App = () => {
  // ...

  const loginForm = () => (
    <form onSubmit={handleLogin}>
      <div>
        <label>
          username
          <input
            type="text"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          password
          <input
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </label>
      </div>
      <button type="submit">login</button>
    </form>
  )

  const noteForm = () => (
    <form onSubmit={addNote}>
      <input value={newNote} onChange={handleNoteChange} />
      <button type="submit">save</button>
    </form>
  )

  return (
    // ...
  )
}
```

e renderizziamoli in modo condizionale:

```js
const App = () => {
  // ...

  const loginForm = () => (
    // ...
  )

  const noteForm = () => (
    // ...
  )

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />

      {!user && loginForm()} // highlight-line
      {user && noteForm()} // highlight-line

      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <ul>
        {notesToShow.map(note => (
          <Note
            key={note.id}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
          />
        ))}
      </ul>

      <Footer />
    </div>
  )
}
```

Per il rendering condizionale usiamo un [comune espediente di React](https://react.dev/learn/conditional-rendering#logical-and-operator-):

```js
{!user && loginForm()}
```

Se la prima espressione è false o [falsy](https://developer.mozilla.org/it/docs/Glossary/Falsy), la seconda, che genera il form, non viene eseguita.

Mostriamo inoltre il nome dell'utente autenticato:

```js
return (
  <div>
    <h1>Notes</h1>
    <Notification message={errorMessage} />

    {!user && loginForm()}
    // highlight-start
    {user && (
      <div>
        <p>{user.name} logged in</p>
        {noteForm()}
      </div>
    )}
    // highlight-end

    <div>
      <button onClick={() => setShowAll(!showAll)}>
    // ...
```

La soluzione non è perfetta, ma per ora la lasciamo così.

Il componente <i>App</i> è ormai troppo grande: i form andrebbero estratti in componenti dedicati. Lo faremo in un esercizio facoltativo.

Il codice corrente è disponibile su [GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part5-2), nel branch <i>part5-2</i>.

### Nota sull'elemento label

Nel modulo di login abbiamo associato agli <i>input</i> l'elemento [label](https://developer.mozilla.org/it/docs/Web/HTML/Element/label). L'input dello username è inserito nel relativo <i>label</i>:

```js
<div>
  <label>
    username
    <input
      type="text"
      value={username}
      onChange={({ target }) => setUsername(target.value)}
    />
  </label>
</div>
// ...
```

Perché? Visivamente potremmo ottenere lo stesso risultato senza <i>label</i>:

```js
<div>
  username
  <input
    type="text"
    value={username}
    onChange={({ target }) => setUsername(target.value)}
  />
</div>
// ...
```

Nei form, <i>label</i> descrive e denomina un campo <i>input</i>. La descrizione, collegata programmaticamente al campo, chiarisce quale informazione inserire e migliora l'accessibilità. 

Gli screen reader possono così leggere il nome del campo e un clic sul testo dell'etichetta porta automaticamente il focus all'input corretto. L'uso di <i>label</i> è sempre consigliato, anche quando non cambia l'aspetto visivo.

Esistono [diversi modi](https://react.dev/reference/react-dom/components/input#providing-a-label-for-an-input) per collegare un <i>label</i> a un <i>input</i>. Il più semplice è inserire l'input nel label corrispondente, come negli esempi: l'associazione è automatica e non richiede altra configurazione.

### Creare nuove note

Il token restituito da un login riuscito viene salvato nello stato dell'applicazione, nel campo <i>token</i> di <i>user</i>:

```js
const handleLogin = async (event) => {
  event.preventDefault()
  try {
    const user = await loginService.login({
      username, password,
    })

    setUser(user) // highlight-line
    setUsername('')
    setPassword('')
  } catch (exception) {
    // ...
  }
}
```

Correggiamo la creazione delle note aggiungendo il token dell'utente all'header Authorization della richiesta HTTP.

Il modulo <i>noteService</i> diventa:

```js
import axios from 'axios'
const baseUrl = '/api/notes'

let token = null // highlight-line

// highlight-start
const setToken = newToken => {
  token = newToken ? `Bearer ${newToken}` : null
}
// highlight-end

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

const create = async newObject => {
  // highlight-start
  const config = {
    headers: { Authorization: token }
  }
// highlight-end

  const response = await axios.post(baseUrl, newObject, config) // highlight-line
  return response.data
}

const update = (id, newObject) => {
  const request = axios.put(`${ baseUrl }/${id}`, newObject, {
    headers: { Authorization: token }
  })
  return request.then(response => response.data)
}

const remove = id => axios.delete(`${baseUrl}/${id}`, {
  headers: { Authorization: token }
})

export default { getAll, create, update, remove, setToken } // highlight-line
```

noteService contiene la variabile privata _token_, modificabile tramite la funzione esportata _setToken_. _create_, ora basata su async/await, inserisce il token nell'header <i>Authorization</i>, passato ad axios come terzo parametro di <i>post</i>.

In caso di login riuscito, il gestore deve invocare <code>noteService.setToken(user.token)</code>:

```js
const handleLogin = async (event) => {
  event.preventDefault()

  try {
    const user = await loginService.login({ username, password })
    noteService.setToken(user.token) // highlight-line
    setUser(user)
    setUsername('')
    setPassword('')
  } catch {
    // ...
  }
}
```

Ora l'aggiunta delle note funziona di nuovo.

### Salvare il token nel local storage del browser

L'applicazione ha un difetto: aggiornando il browser, per esempio con F5, i dati di accesso scompaiono.

Possiamo risolvere salvandoli nel [local storage](https://developer.mozilla.org/it/docs/Web/API/Storage), un database [chiave-valore](https://it.wikipedia.org/wiki/Database_chiave-valore) integrato nel browser.

L'uso è semplice: [setItem](https://developer.mozilla.org/it/docs/Web/API/Storage/setItem) salva un <i>valore</i> associato a una <i>chiave</i>. Per esempio:

```js
window.localStorage.setItem('name', 'juha tauriainen')
```

salva la stringa del secondo parametro sotto la chiave <i>name</i>.

[getItem](https://developer.mozilla.org/it/docs/Web/API/Storage/getItem) recupera il valore di una chiave:

```js
window.localStorage.getItem('name')
```

mentre [removeItem](https://developer.mozilla.org/it/docs/Web/API/Storage/removeItem) la elimina.

I valori persistono anche dopo il rendering della pagina. Lo spazio è specifico per ogni [origine](https://developer.mozilla.org/it/docs/Glossary/Origin), quindi ogni applicazione web ha il proprio.

Estendiamo l'applicazione per salvare nel local storage i dati dell'utente autenticato.

I valori salvati sono [DOMString](https://docs.w3cub.com/dom/domstring), quindi un oggetto JavaScript deve prima essere convertito in JSON con _JSON.stringify_. Alla lettura, _JSON.parse_ lo riconverte in JavaScript.

Il metodo di login cambia così:

```js
  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })

      // highlight-start
      window.localStorage.setItem(
        'loggedNoteappUser', JSON.stringify(user)
      ) 
      // highlight-end
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      // ...
    }
  }
```

I dati sono ora salvati nel local storage e si possono vedere nella console digitando _window.localStorage_:

![dati dell'utente salvati nel local storage visibili nella console](../../images/5/3e.png)

Puoi ispezionarlo anche dagli strumenti di sviluppo: in Chrome apri <i>Application</i> e seleziona <i>Local Storage</i> ([dettagli](https://developer.chrome.com/docs/devtools/storage/localstorage)); in Firefox apri <i>Storage</i> e seleziona <i>Local Storage</i> ([dettagli](https://firefox-source-docs.mozilla.org/devtools-user/storage_inspector/index.html)).

All'apertura della pagina l'applicazione deve controllare se nel local storage esistono già i dati di un utente autenticato e, in caso affermativo, salvarli nello stato e in <i>noteService</i>.

Il modo corretto è usare un [effect hook](https://react.dev/reference/react/useEffect), incontrato nella [parte 2](/it/part2/recuperare_dati_dal_server#effect-hook) per recuperare le note dal server.

Possiamo avere più effect hook; creiamone un secondo per il caricamento iniziale:

```js
const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    noteService.getAll().then(initialNotes => {
      setNotes(initialNotes)
    })
  }, [])
  
  // highlight-start
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])
  // highlight-end

  // ...
}
```

L'array vuoto passato all'effetto garantisce che venga eseguito soltanto al [primo rendering](https://react.dev/reference/react/useEffect#parameters).

Ora l'utente rimane autenticato indefinitamente. Dovremmo aggiungere un <i>logout</i> che rimuova i dati dal local storage, ma lo lasciamo come esercizio.

Per ora è sufficiente effettuare il logout dalla console con:

```js
window.localStorage.removeItem('loggedNoteappUser')
```

oppure svuotare completamente il <i>local storage</i> con:

```js
window.localStorage.clear()
```

Il codice corrente è disponibile su [GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part5-3), nel branch <i>part5-3</i>.

</div>

<div class="tasks">

### Esercizi 5.1-5.4

Creiamo un frontend per il backend Bloglist della parte precedente. Puoi usare come base [questa applicazione](https://github.com/fullstack-hy2020/bloglist-frontend). Collega il backend tramite un proxy come mostrato nella [parte 3](/it/part3/pubblicare_l_applicazione_su_internet#proxy).

Puoi creare un commit dopo ogni esercizio, ma non è obbligatorio.

I primi esercizi ripassano quanto appreso finora su React e possono risultare impegnativi, soprattutto se il backend è incompleto. In tal caso puoi partire dall'implementazione di riferimento della Parte 4.

Durante gli esercizi usa le tecniche di debugging già viste, in particolare controllando la console.

**Attenzione:** se mescoli _async/await_ e _then_, quasi certamente c'è qualcosa che non va. Usa un solo approccio.

#### 5.1: Frontend della lista di blog, passo 1

Clona l'applicazione da [GitHub](https://github.com/fullstack-hy2020/bloglist-frontend):

```bash
git clone https://github.com/fullstack-hy2020/bloglist-frontend
```

<i>Rimuovi la configurazione Git dell'applicazione clonata</i>

```bash
cd bloglist-frontend   // go to cloned repository
rm -rf .git
```

Installa le dipendenze e avvia l'applicazione nel modo consueto:

```bash
npm install
npm run dev
```

Implementa il login nel frontend. Salva il token restituito nello stato <i>user</i> dell'applicazione.

Se l'utente non è autenticato, deve essere visibile <i>soltanto</i> il modulo di login.

![browser con il solo modulo di login](../../images/5/4e.png)

Dopo il login vengono mostrati il nome dell'utente e la lista dei blog.

![browser con i blog e l'utente autenticato](../../images/5/5e.png)

Non è ancora necessario salvare i dati dell'utente nel local storage.

**NB** puoi implementare il rendering condizionale, per esempio, così:

```js
  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <form>
          //...
        </form>
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} />
      )}
    </div>
  )
}
```

#### 5.2: Frontend della lista di blog, passo 2

Rendi il login «permanente» usando il local storage e implementa il logout.

![pulsante di logout dopo l'accesso](../../images/5/6e.png)

Assicurati che dopo il logout il browser non conservi i dati dell'utente.

#### 5.3: Frontend della lista di blog, passo 3

Permetti a un utente autenticato di aggiungere nuovi blog:

![modulo per aggiungere un blog](../../images/5/7e.png)

#### 5.4: Frontend della lista di blog, passo 4

Mostra in cima alla pagina notifiche per le operazioni riuscite o fallite. Per esempio, dopo aver aggiunto un blog:

![notifica di operazione riuscita](../../images/5/8e.png)

Un login fallito può mostrare:

![notifica di login fallito](../../images/5/9e.png)

Le notifiche devono restare visibili per alcuni secondi; i colori non sono obbligatori.

</div>

<div class="content">

### Nota sull'uso del local storage

Alla [fine della parte precedente](/it/part4/autenticazione_tramite_token#problemi-dellautenticazione-basata-su-token) abbiamo visto il problema della revoca dell'accesso al possessore di un token.

Una soluzione limita la validità del token, obbligando a un nuovo login dopo la scadenza. L'altra salva nel database del backend lo stato di ogni token ed è chiamata <i>sessione lato server</i>.

Salvare un token nel local storage comporta un rischio se l'applicazione è vulnerabile ad attacchi [Cross-Site Scripting (XSS)](https://owasp.org/www-community/attacks/xss/), nei quali viene iniettato JavaScript arbitrario poi eseguito dall'app. Usando React correttamente il rischio si riduce, perché [React esegue l'escape](https://legacy.reactjs.org/docs/introducing-jsx.html#jsx-prevents-injection-attacks) del testo renderizzato e non lo interpreta come JavaScript.

Se la perdita del token avrebbe conseguenze gravi, la scelta più prudente è non conservarlo nel local storage.

Un'alternativa consiste nei [cookie HttpOnly](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies), inaccessibili a JavaScript. Questa soluzione rende però più complessa una SPA e richiede almeno una pagina separata per il login.

Nemmeno i cookie HttpOnly offrono garanzie assolute; è stato persino sostenuto che [non siano più sicuri](https://academind.com/tutorials/localstorage-vs-cookies-xss/) del local storage.

Qualunque soluzione si scelga, la priorità è [ridurre alla radice il rischio](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html) di attacchi XSS.

</div>
