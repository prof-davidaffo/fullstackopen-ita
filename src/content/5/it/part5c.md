---
mainImage: ../../../images/part-5.svg
part: 5
letter: c
lang: it
---

<div class="content">

Esistono molti modi per testare le applicazioni React. In questa sezione ne esploreremo alcuni.

In precedenza il corso utilizzava [Jest](http://jestjs.io/), sviluppato da Facebook, per testare i componenti React. Ora useremo [Vitest](https://vitest.dev/), uno strumento di nuova generazione legato all'ecosistema Vite. A parte la configurazione, le due librerie offrono interfacce molto simili: il codice dei test cambia quindi poco.

Iniziamo installando Vitest e [jsdom](https://github.com/jsdom/jsdom), che simula l'ambiente di un browser:

```
npm install --save-dev vitest jsdom
```

Oltre a Vitest, ci serve una libreria che permetta di renderizzare i componenti durante i test. Useremo [React Testing Library](https://github.com/testing-library/react-testing-library). Aggiungeremo anche [jest-dom](https://github.com/testing-library/jest-dom), che offre asserzioni espressive per verificare il contenuto del DOM.

Installiamo le librerie:

```js
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

Prima di scrivere il primo test, occorre completare la configurazione.

Aggiungiamo a <i>package.json</i> uno script per eseguire i test:

```js 
{
  "scripts": {
    // ...
    "test": "vitest run"
  }
  // ...
}
```

Creiamo nella radice del progetto un file _testSetup.js_ con questo contenuto:

```js
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
})
```

Dopo ogni test viene eseguita _cleanup_, che smonta i componenti renderizzati e ripulisce il DOM usato dai test.

Estendiamo _vite.config.js_ così:

```js
export default defineConfig({
  // ...
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './testSetup.js', 
  }
})
```

Con _globals: true_ non è necessario importare nei test funzioni come _describe_, _test_ ed _expect_.

Cominciamo dal componente che visualizza una nota:

```js
const Note = ({ note, toggleImportance }) => {
  const label = note.important
    ? 'make not important'
    : 'make important'

  return (
    <li className='note'> // highlight-line
      {note.content}
      <button onClick={toggleImportance}>{label}</button>
    </li>
  )
}
```

L'elemento <i>li</i> ha una proprietà className con valore <i>note</i>, che definisce una classe [CSS](https://react.dev/learn#adding-styles). Potremmo usarla per individuare l'elemento nei test.

### Renderizzare il componente nei test

Scriveremo il test nel file <i>src/components/Note.test.jsx</i>, nella stessa directory del componente.

Il primo test verifica che venga renderizzato il contenuto della nota:

```js
import { render, screen } from '@testing-library/react'
import Note from './Note'

test('renders content', () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  render(<Note note={note} />)

  const element = screen.getByText('Component testing is done with react-testing-library')
  expect(element).toBeDefined()
})
```

Dopo aver preparato i dati, il test renderizza il componente usando [render](https://testing-library.com/docs/react-testing-library/api#render), fornita da React Testing Library:

```js
render(<Note note={note} />)
```

Normalmente React renderizza i componenti nel [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model) del browser. Anche [render](https://testing-library.com/docs/react-testing-library/api#render) usa il DOM: nella nostra configurazione è quello fornito da jsdom, senza aprire un browser reale.

L'oggetto [screen](https://testing-library.com/docs/queries/about#screen) permette di cercare gli elementi renderizzati. Usiamo [getByText](https://testing-library.com/docs/queries/bytext) per trovare un elemento con il contenuto della nota e verificarne la presenza:

```js
  const element = screen.getByText('Component testing is done with react-testing-library')
  expect(element).toBeDefined()
```

La verifica usa [expect](https://vitest.dev/api/expect.html#expect) di Vitest, che permette di formulare asserzioni sull'argomento ricevuto tramite diversi metodi di confronto. Qui [toBeDefined](https://vitest.dev/api/expect.html#tobedefined) verifica che _element_ non sia undefined.

Esegui il test con _npm test_:

```js
$ npm test

> notes-frontend@0.0.0 test
> vitest run


 RUN  v3.2.3 /home/vejolkko/repot/fullstack-examples/notes-frontend

 ✓ src/components/Note.test.jsx (1 test) 19ms
   ✓ renders content 18ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  14:31:54
   Duration  874ms (transform 51ms, setup 169ms, collect 19ms, tests 19ms, environment 454ms, prepare 87ms)
```

ESLint segnala _test_ ed _expect_ come nomi non definiti. Possiamo risolvere aggiungendo questa configurazione a <i>eslint.config.js</i>:

```js
// ...

export default [
  // ...
  // highlight-start
  {
    files: ['**/*.test.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.vitest
      }
    }
  }
  // highlight-end
]
```

In questo modo informiamo ESLint che le funzioni globali di Vitest sono disponibili nei file di test.

### Dove collocare i file di test

Nei progetti React esistono almeno [due convenzioni](https://medium.com/@JeffLombardJr/organizing-tests-in-jest-17fc431ff850) per la posizione dei file di test. Noi li abbiamo collocati nella stessa directory del componente verificato.

L'alternativa consiste nel raccoglierli in una directory _test_ separata. Entrambe le scelte hanno sostenitori e detrattori.

Per questo corso continueremo a tenere test e componenti vicini, un'organizzazione comune nei piccoli progetti.

### Cercare contenuti in un componente

React Testing Library offre diversi modi per esaminare il contenuto del componente sottoposto a test. A rigore, l'_expect_ del nostro test non è indispensabile:

```js
import { render, screen } from '@testing-library/react'
import Note from './Note'

test('renders content', () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  render(<Note note={note} />)

  const element = screen.getByText('Component testing is done with react-testing-library')

  expect(element).toBeDefined() // highlight-line
})
```

Se _getByText_ non trova l'elemento cercato, il test fallisce comunque.

Per impostazione predefinita, _getByText_ cerca una corrispondenza esatta con il **testo passato come parametro**. Supponiamo che il componente renderizzi il testo in questo modo:

```js
const Note = ({ note, toggleImportance }) => {
  const label = note.important
    ? 'make not important' : 'make important'

  return (
    <li className='note'>
      Your awesome note: {note.content} // highlight-line
      <button onClick={toggleImportance}>{label}</button>
    </li>
  )
}

export default Note
```

Il metodo _getByText_ usato nel test <i>non</i> trova più l'elemento:

```js
test('renders content', () => {
  const note = {
    content: 'Does not work anymore :(',
    important: true
  }

  render(<Note note={note} />)

  const element = screen.getByText('Does not work anymore :(')

  expect(element).toBeDefined()
})
```

Per cercare un elemento che <i>contenga</i> il testo, possiamo aggiungere un'opzione:

```js
const element = screen.getByText(
  'Does not work anymore :(', { exact: false }
)
```

Un altro metodo è _findByText_, utile quando l'elemento compare in modo asincrono. Questa chiamata attende un elemento con il testo esatto indicato:

```js
const element = await screen.findByText('Does not work anymore :(')
```

A differenza di _getByText_ e _queryByText_, _findByText_ restituisce una promise. **Attenzione:** attende la comparsa dell'elemento, ma non attiva la ricerca parziale. Con il prefisso «Your awesome note:» dell'esempio precedente occorre passare anche qui _{ exact: false }_ oppure usare un'espressione regolare. Le [opzioni di ricerca](https://testing-library.com/docs/queries/about/#precision) valgono anche per questo metodo.

In altre situazioni è utile _queryByText_: restituisce l'elemento oppure null se non lo trova, <i>senza generare un'eccezione per l'assenza</i>.

Possiamo usarlo, per esempio, per verificare che un contenuto <i>non sia renderizzato</i>:

```js
test('does not render this', () => {
  const note = {
    content: 'This is a reminder',
    important: true
  }

  render(<Note note={note} />)

  const element = screen.queryByText('do not want this thing to be rendered')
  expect(element).toBeNull()
})
```

Esistono anche altri metodi, come [getByTestId](https://testing-library.com/docs/queries/bytestid/), che cerca gli elementi tramite identificatori predisposti appositamente per i test.

Possiamo inoltre cercare con [selettori CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors), usando [querySelector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) sull'oggetto [container](https://testing-library.com/docs/react-testing-library/api/#container-1) restituito da render:

```js
import { render, screen } from '@testing-library/react'
import Note from './Note'

test('renders content', () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  const { container } = render(<Note note={note} />) // highlight-line

// highlight-start
  const div = container.querySelector('.note')
  expect(div).toHaveTextContent(
    'Component testing is done with react-testing-library'
  )
  // highlight-end
})
```

È però preferibile cercare gli elementi usando le caratteristiche percepibili dall'utente, per esempio il testo con _getByText_, anziché basarsi su <i>container</i> e sui selettori CSS. Le classi possono cambiare senza modificare il comportamento dell'applicazione e gli utenti non le conoscono. Cercare ciò che l'utente vede avvicina il test al modo in cui il componente viene realmente utilizzato.

### Debugging dei test

Durante la scrittura dei test è normale incontrare problemi di vario tipo.

L'oggetto _screen_ offre [debug](https://testing-library.com/docs/dom-testing-library/api-debugging#screendebug), che stampa l'HTML nel terminale. Modificando il test così:

```js
import { render, screen } from '@testing-library/react'
import Note from './Note'

test('renders content', () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  render(<Note note={note} />)

  screen.debug() // highlight-line

  // ...

})
```

otteniamo questo output nella console:

```js
console.log
  <body>
    <div>
      <li
        class="note"
      >
        Component testing is done with react-testing-library
        <button>
          make not important
        </button>
      </li>
    </div>
  </body>
```

Possiamo anche stampare soltanto l'elemento che ci interessa:

```js
import { render, screen } from '@testing-library/react'
import Note from './Note'

test('renders content', () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }

  render(<Note note={note} />)

  const element = screen.getByText('Component testing is done with react-testing-library')

  screen.debug(element)  // highlight-line

  expect(element).toBeDefined()
})
```

In questo caso viene mostrato l'HTML dell'elemento selezionato:

```js
  <li
    class="note"
  >
    Component testing is done with react-testing-library
    <button>
      make not important
    </button>
  </li>
```

### Fare clic sui pulsanti nei test

Oltre a mostrare il contenuto, il componente <i>Note</i> deve invocare il gestore _toggleImportance_ quando viene premuto il pulsante associato alla nota.

Installiamo [user-event](https://testing-library.com/docs/user-event/intro), che semplifica la simulazione delle interazioni dell'utente:

```bash
npm install --save-dev @testing-library/user-event
```

Possiamo verificare il comportamento con questo test:

```js
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event' // highlight-line
import Note from './Note'

// ...

test('clicking the button calls event handler once', async () => {
  const note = {
    content: 'Component testing is done with react-testing-library',
    important: true
  }
  
  const mockHandler = vi.fn()  // highlight-line

  render(
    <Note note={note} toggleImportance={mockHandler} />  // highlight-line
  )

  const user = userEvent.setup()  // highlight-line
  const button = screen.getByText('make not important')  // highlight-line
  await user.click(button)  // highlight-line

  expect(mockHandler.mock.calls).toHaveLength(1)  // highlight-line
})
```

Il test introduce alcuni concetti interessanti. Il gestore dell'evento è una funzione [mock](https://vitest.dev/api/mock), creata con Vitest:

```js
const mockHandler = vi.fn()
```

Avviamo una [sessione](https://testing-library.com/docs/user-event/setup/) per interagire con il componente renderizzato:

```js
const user = userEvent.setup()
```

Il test individua il pulsante <i>in base al testo</i> e vi fa clic:

```js
const button = screen.getByText('make not important')
await user.click(button)
```

Il clic viene simulato dal metodo [click](https://testing-library.com/docs/user-event/convenience/#click) di user-event.

L'asserzione usa [toHaveLength](https://vitest.dev/api/expect.html#tohavelength) per verificare che la <i>funzione mock</i> sia stata chiamata esattamente una volta:

```js
expect(mockHandler.mock.calls).toHaveLength(1)
```

Le chiamate alla funzione mock vengono registrate nell'array [mock.calls](https://vitest.dev/api/mock#mock-calls) dell'oggetto funzione.

Gli [oggetti e le funzioni mock](https://en.wikipedia.org/wiki/Mock_object) sono sostituti usati nei test per rimpiazzare le dipendenze del componente. Come gli [stub](https://en.wikipedia.org/wiki/Method_stub), possono fornire risposte predefinite; permettono inoltre di controllare quante volte una funzione sia stata chiamata e con quali argomenti.

Nel nostro caso il mock è adatto perché consente di verificare facilmente che il gestore venga invocato una sola volta.

### Test del componente Togglable

Scriviamo alcuni test per <i>Togglable</i>:

```js
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Togglable from './Togglable'

describe('<Togglable />', () => {
  beforeEach(() => {
    render(
      <Togglable buttonLabel="show...">
        <div>togglable content</div>
      </Togglable>
    )
  })

  test('renders its children', () => {
    screen.getByText('togglable content')
  })

  test('at start the children are not displayed', () => {
    const element = screen.getByText('togglable content')
    expect(element).not.toBeVisible()
  })

  test('after clicking the button, children are displayed', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('show...')
    await user.click(button)

    const element = screen.getByText('togglable content')
    expect(element).toBeVisible()
  })
})
```

La funzione _beforeEach_ viene eseguita prima di ogni test e renderizza <i>Togglable</i>.

Il primo test verifica che il componente renderizzi il proprio figlio:

```js
<div>
  togglable content
</div>
```

Gli altri test usano _toBeVisible_ per verificare la visibilità del figlio. Inizialmente è nascosto perché il div che lo contiene ha lo stile _{ display: 'none' }_. Dopo il clic sul pulsante deve diventare visibile: lo stile che lo nasconde <i>non è più</i> applicato.

Aggiungiamo un test che verifichi che il secondo pulsante nasconda nuovamente il contenuto:

```js
describe('<Togglable />', () => {

  // ...

  test('toggled content can be closed', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('show...')
    await user.click(button)

    const closeButton = screen.getByText('cancel')
    await user.click(closeButton)

    const element = screen.getByText('togglable content')
    expect(element).not.toBeVisible()
  })
})
```

### Testare i form

Nei test precedenti abbiamo usato _click_ di [user-event](https://testing-library.com/docs/user-event/intro) per premere i pulsanti:

```js
const user = userEvent.setup()
const button = screen.getByText('show...')
await user.click(button)
```

Con <i>userEvent</i> possiamo simulare anche l'inserimento di testo.

Scriviamo un test per <i>NoteForm</i>. Questo è il codice del componente:

```js
import { useState } from 'react'

const NoteForm = ({ createNote }) => {
  const [newNote, setNewNote] = useState('')

  const addNote = event => {
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

Il form invoca la funzione _createNote_, ricevuta come prop, passando i dati della nuova nota.

Il test è il seguente:

```js
import { render, screen } from '@testing-library/react'
import NoteForm from './NoteForm'
import userEvent from '@testing-library/user-event'

test('<NoteForm /> updates parent state and calls onSubmit', async () => {
  const createNote = vi.fn()
  const user = userEvent.setup()

  render(<NoteForm createNote={createNote} />)

  const input = screen.getByRole('textbox')
  const sendButton = screen.getByText('save')

  await user.type(input, 'testing a form...')
  await user.click(sendButton)

  expect(createNote.mock.calls).toHaveLength(1)
  expect(createNote.mock.calls[0][0].content).toBe('testing a form...')
})
```

Il test trova il campo di input con [getByRole](https://testing-library.com/docs/queries/byrole).

Il metodo [type](https://testing-library.com/docs/user-event/utility#type) di user-event simula la digitazione nel campo.

La prima asserzione verifica che l'invio del form chiami _createNote_ una volta. La seconda controlla gli argomenti del gestore, verificando che il contenuto della nota corrisponda al testo digitato.

Anche nei test il buon vecchio _console.log_ funziona come sempre. Per esaminare le chiamate registrate dal mock possiamo scrivere:

```js
test('<NoteForm /> updates parent state and calls onSubmit', async() => {
  const user = userEvent.setup()
  const createNote = vi.fn()

  render(<NoteForm createNote={createNote} />)

  const input = screen.getByRole('textbox')
  const sendButton = screen.getByText('save')

  await user.type(input, 'testing a form...')
  await user.click(sendButton)

  console.log(createNote.mock.calls) // highlight-line
})
```

Durante l'esecuzione viene stampato:

```
[ [ { content: 'testing a form...', important: true } ] ]
```

### Come trovare gli elementi

Supponiamo che il form contenga due campi di input:

```js
const NoteForm = ({ createNote }) => {
  // ...

  return (
    <div>
      <h2>Create a new note</h2>

      <form onSubmit={addNote}>
        <input
          value={newNote}
          onChange={event => setNewNote(event.target.value)}
        />
        // highlight-start
        <input
          value={...}
          onChange={...}
        />
        // highlight-end
        <button type="submit">save</button>
      </form>
    </div>
  )
}
```

La ricerca usata dal test:

```js
const input = screen.getByRole('textbox')
```

ora genera un errore:

![errore di getByRole perché esistono due elementi con ruolo textbox](../../images/5/40.png)

Il messaggio suggerisce di usare <i>getAllByRole</i>. Potremmo correggere il test così:

```js
const inputs = screen.getAllByRole('textbox')

await user.type(inputs[0], 'testing a form...')
```

<i>getAllByRole</i> restituisce un array e il campo desiderato è il primo elemento. Questa soluzione è però fragile, perché dipende dall'ordine dei campi.

Se associamo un <i>label</i> al campo, possiamo individuarlo tramite getByLabelText. Aggiungiamo, per esempio, un'etichetta:

```js
  // ...
  <label> // highlight-line
    content // highlight-line
    <input
      value={newNote}
      onChange={event => setNewNote(event.target.value)}
    />
  </label> // highlight-line
  // ...
```

Il test può ora trovare il campo così:

```js
test('<NoteForm /> updates parent state and calls onSubmit', async () => {
  const user = userEvent.setup()
  const createNote = vi.fn()

  render(<NoteForm createNote={createNote} />) 

  const input = screen.getByLabelText('content') // highlight-line
  const sendButton = screen.getByText('save')

  await user.type(input, 'testing a form...')
  await user.click(sendButton)

  expect(createNote.mock.calls).toHaveLength(1)
  expect(createNote.mock.calls[0][0].content).toBe('testing a form...')
})
```

Spesso i campi hanno un testo <i>placeholder</i> che suggerisce quali dati inserire. Aggiungiamone uno al form:

```js
const NoteForm = ({ createNote }) => {
  // ...

  return (
    <div>
      <h2>Create a new note</h2>

      <form onSubmit={addNote}>
        <input
          value={newNote}
          onChange={event => setNewNote(event.target.value)}
          placeholder='write note content here' // highlight-line 
        />
        <input
          value={...}
          onChange={...}
        />    
        <button type="submit">save</button>
      </form>
    </div>
  )
}
```

Ora il metodo [getByPlaceholderText](https://testing-library.com/docs/queries/byplaceholdertext) permette di trovare facilmente il campo:

```js
test('<NoteForm /> updates parent state and calls onSubmit', async () => {
  const user = userEvent.setup()
  const createNote = vi.fn()

  render(<NoteForm createNote={createNote} />) 

  const input = screen.getByPlaceholderText('write note content here') // highlight-line 
  const sendButton = screen.getByText('save')

  await user.type(input, 'testing a form...')
  await user.click(sendButton)

  expect(createNote.mock.calls).toHaveLength(1)
  expect(createNote.mock.calls[0][0].content).toBe('testing a form...')
})
```

Talvolta individuare l'elemento con questi metodi può essere difficile. Un'alternativa è <i>querySelector</i> sull'oggetto _container_ restituito da _render_, come visto [in precedenza](/it/part5/testare_le_applicazioni_react#cercare-contenuti-in-un-componente). Possiamo passargli qualsiasi selettore CSS.

Supponiamo di assegnare un _id_ univoco al campo:

```js
const NoteForm = ({ createNote }) => {
  // ...

  return (
    <div>
      <h2>Create a new note</h2>

      <form onSubmit={addNote}>
        <input
          value={newNote}
          onChange={event => setNewNote(event.target.value)}
          id='note-input' // highlight-line 
        />
        <input
          value={...}
          onChange={...}
        />    
        <button type="submit">save</button>
      </form>
    </div>
  )
}
```

Il test può individuarlo così:

```js
const { container } = render(<NoteForm createNote={createNote} />)

const input = container.querySelector('#note-input')
```

Per il nostro test continueremo comunque a usare _getByPlaceholderText_.

### Copertura dei test

Possiamo misurare la [copertura](https://vitest.dev/guide/coverage.html#coverage) eseguendo:

```js
npm test -- --coverage
```

Alla prima esecuzione Vitest chiede di installare la libreria _@vitest/coverage-v8_. Installala ed esegui nuovamente il comando:

![riepilogo della copertura dei test nel terminale](../../images/5/18new.png)

Nella directory <i>coverage</i> viene generato un report HTML che evidenzia le righe di codice non eseguite dai test per ciascun componente:

![report HTML della copertura dei test](../../images/5/19newer.png)

Aggiungiamo <i>coverage/</i> a <i>.gitignore</i> per escludere i report dal controllo di versione:

```js
//...

coverage/
```

Il codice completo dell'applicazione è disponibile nel branch <i>part5-8</i> di [questo repository GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part5-8).

</div>

<div class="tasks">

### Esercizi 5.13-5.16

#### 5.13: Test della lista di blog, passo 1

Scrivi un test che verifichi che il componente di un blog mostri titolo e autore, ma inizialmente non mostri URL e numero di like.

Se necessario, aggiungi classi CSS al componente per facilitare il test.

#### 5.14: Test della lista di blog, passo 2

Scrivi un test che verifichi che URL e numero di like siano visibili dopo un clic sul pulsante che apre i dettagli.

#### 5.15: Test della lista di blog, passo 3

Scrivi un test che verifichi che, premendo due volte <i>like</i>, il gestore ricevuto dal componente tramite props venga invocato due volte.

#### 5.16: Test della lista di blog, passo 4

Scrivi un test per il form di creazione dei blog. Verifica che, alla creazione di un blog, il form chiami il gestore ricevuto tramite props con i dati corretti.

</div>

<div class="content">

### Test di integrazione del frontend

Nella parte precedente abbiamo scritto test di integrazione del backend, verificandone la logica e l'interazione con il database attraverso le API. Abbiamo scelto consapevolmente questo approccio: la logica dei singoli elementi era semplice e gli errori potevano emergere soprattutto in scenari più complessi, difficili da coprire con soli test unitari.

Finora i test del frontend hanno verificato il funzionamento di singoli componenti. Sono test unitari utili, ma neppure una suite completa garantisce che l'intera applicazione funzioni correttamente.

Potremmo scrivere anche test di integrazione del frontend, che verifichino la collaborazione tra più componenti. Sono più complessi dei test unitari: dovremmo, per esempio, simulare i dati restituiti dal server.

Qui ci concentreremo sui test end-to-end, che verificano l'applicazione nel suo insieme. Li affronteremo nella prossima sezione.

### Test tramite snapshot

Vitest offre anche i test tramite [snapshot](https://vitest.dev/guide/snapshot). Si scrive un test che acquisisce l'output del componente e lo confronta con una versione di riferimento salvata, senza dover elencare manualmente ogni dettaglio atteso.

Il principio consiste nel confrontare l'output renderizzato dopo una modifica con quello precedentemente approvato.

Quando lo snapshot cambia, il test segnala la differenza. Lo sviluppatore deve stabilire se sia intenzionale e aggiornare il riferimento oppure correggere un errore. Una variazione inattesa può rivelare una regressione, ma lo snapshot richiede comunque una revisione attenta: approvare automaticamente ogni modifica ne annullerebbe l'utilità.

</div>
