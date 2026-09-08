---
mainImage: ../../../images/part-2.svg
part: 2
letter: e
lang: it
---

<div class="content">

L'aspetto attuale dell'applicazione Notes è piuttosto essenziale. Nell'[esercizio 0.2](/it/part0/fondamenti_delle_applicazioni_web#esercizi-01-06) era richiesto di seguire il [tutorial CSS](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics) di Mozilla.

Vediamo come aggiungere stili a un'applicazione React. Esistono diversi metodi e ne incontreremo altri più avanti. Iniziamo nel modo tradizionale: un unico file CSS, senza [preprocessori CSS](https://developer.mozilla.org/en-US/docs/Glossary/CSS_preprocessor), anche se in seguito scopriremo che questa affermazione non è del tutto esatta.

Creiamo il file <i>index.css</i> nella directory <i>src</i> e importiamolo in <i>main.jsx</i>:

```js
import './index.css'
```

Aggiungiamo a <i>index.css</i> la regola seguente:

```css
h1 {
  color: green;
}
```

Le regole CSS sono composte da <i>selettori</i> e <i>dichiarazioni</i>. Il selettore stabilisce a quali elementi applicare la regola. In questo caso è <i>h1</i> e corrisponde a tutti i titoli <i>h1</i> dell'applicazione.

La dichiarazione assegna alla proprietà _color_ il valore <i>green</i>.

Una regola può contenere un numero qualsiasi di proprietà. Modifichiamola rendendo il testo corsivo con <i>font-style: italic</i>:

```css
h1 {
  color: green;
  font-style: italic;  // highlight-line
}
```

Gli elementi possono essere individuati mediante [diversi tipi di selettori CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors).

Per applicare uno stile a tutte le note potremmo usare il selettore <i>li</i>, dato che ogni nota si trova in un elemento <i>li</i>:

```js
const Note = ({ note, toggleImportance }) => {
  const label = note.important 
    ? 'make not important' 
    : 'make important'

  return (
    <li>
      {note.content} 
      <button onClick={toggleImportance}>{label}</button>
    </li>
  )
}
```

Aggiungiamo questa regola al foglio di stile; gli stili non sono particolarmente eleganti, ma sono sufficienti per l'esempio:

```css
li {
  color: grey;
  padding-top: 3px;
  font-size: 15px;
}
```

Usare il tipo dell'elemento nei selettori è però problematico: la regola verrebbe applicata anche a eventuali altri elementi <i>li</i> dell'applicazione.

Per applicare lo stile specificamente alle note è preferibile usare i [selettori di classe](https://developer.mozilla.org/en-US/docs/Web/CSS/Class_selectors).

Nel normale HTML, una classe si assegna mediante l'attributo <i>class</i>:

```html
<li class="note">some text...</li>
```

In React dobbiamo usare [className](https://react.dev/learn#adding-styles) al posto di class. Modifichiamo il componente <i>Note</i>:

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

I selettori di classe usano la sintassi _.nomeclasse_:

```css
.note {
  color: grey;
  padding-top: 5px;
  font-size: 15px;
}
```

Gli altri elementi <i>li</i> eventualmente aggiunti all'applicazione non saranno interessati da questa regola.

### Un messaggio di errore migliore

In precedenza abbiamo mostrato con <em>alert</em> l'errore che si verifica quando l'utente tenta di cambiare l'importanza di una nota già eliminata. Realizziamo ora il messaggio come componente React nel file <i>src/components/Notification.jsx</i>.

Il componente è molto semplice:

```js
const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className="error">
      {message}
    </div>
  )
}

export default Notification
```

Se la prop <em>message</em> vale <em>null</em>, il componente non renderizza nulla; altrimenti mostra il messaggio in un elemento div.

Aggiungiamo al componente <i>App</i> lo stato <i>errorMessage</i>. Inizializziamolo temporaneamente con un messaggio per poter provare subito il componente:

```js
import { useState, useEffect } from 'react'
import Note from './components/Note'
import noteService from './services/notes'
import Notification from './components/Notification' // highlight-line

const App = () => {
  const [notes, setNotes] = useState([]) 
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState('some error happened...') // highlight-line

  // ...

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} /> // highlight-line
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all' }
        </button>
      </div>      
      // ...
    </div>
  )
}
```

Aggiungiamo una regola adatta ai messaggi di errore:

```css
.error {
  color: red;
  background: lightgrey;
  font-size: 20px;
  border-style: solid;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
}
```

Possiamo ora implementare la logica del messaggio modificando <em>toggleImportanceOf</em>:

```js
  const toggleImportanceOf = id => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important }

    noteService
      .update(id, changedNote).then(returnedNote => {
        setNotes(notes.map(note => note.id !== id ? note : returnedNote))
      })
      .catch(error => {
        // highlight-start
        setErrorMessage(
          `Note '${note.content}' was already removed from server`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        // highlight-end
        setNotes(notes.filter(n => n.id !== id))
      })
  }
```

Quando si verifica l'errore, salviamo un messaggio descrittivo nello stato <em>errorMessage</em>. Contemporaneamente avviamo un timer che, dopo cinque secondi, reimposta lo stato a <em>null</em>.

Il risultato è questo:

![messaggio che indica la rimozione della nota dal server](../../images/2/26e.png)

Il codice attuale dell'applicazione si trova nel branch <i>part2-7</i> su [GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part2-7).

### Stili inline

React permette anche di scrivere gli stili direttamente nel codice mediante i cosiddetti [stili inline](https://react-cn.github.io/react/tips/inline-styles.html).

L'idea è semplice: tramite l'attributo [style](https://react.dev/reference/react-dom/components/common#applying-css-styles), qualsiasi componente o elemento React può ricevere un oggetto JavaScript contenente proprietà CSS.

Le regole hanno una sintassi leggermente diversa rispetto ai normali file CSS. Per assegnare colore verde e carattere corsivo, in CSS scriveremmo:

```css
{
  color: green;
  font-style: italic;
}
```

Come oggetto JavaScript per uno stile inline React scriveremmo invece:

```js
{
  color: 'green',
  fontStyle: 'italic'
}
```

Ogni proprietà CSS diventa una proprietà dell'oggetto JavaScript. I valori numerici in pixel possono essere indicati come numeri interi. La differenza principale è che le proprietà CSS con trattini, scritte in kebab case, diventano camelCase.

Aggiungiamo il componente footer <i>Footer</i> e definiamone gli stili inline. Il componente si trova in _components/Footer.jsx_ e viene usato in _App.jsx_:

```js
const Footer = () => {
  const footerStyle = {
    color: 'green',
    fontStyle: 'italic'
  }

  return (
    <div style={footerStyle}>
      <br />
      <p>
        Note app, Department of Computer Science, University of Helsinki 2025
      </p>
    </div>
  )
}

export default Footer
```

```js
import { useState, useEffect } from 'react'
import Footer from './components/Footer' // highlight-line
import Note from './components/Note'
import Notification from './components/Notification'
import noteService from './services/notes'

const App = () => {
  // ...

  return (
    <div>
      <h1>Notes</h1>

      <Notification message={errorMessage} />

      // ...  

      <Footer /> // highlight-line
    </div>
  )
}
```

Gli stili inline presentano alcune limitazioni: per esempio, non consentono di usare direttamente le [pseudo-classi](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes).

Gli stili inline e altri modi di definire gli stili nei componenti React sono in netto contrasto con le vecchie convenzioni. Tradizionalmente si riteneva buona pratica separare completamente CSS, contenuto HTML e funzionalità JavaScript in file distinti.

La filosofia di React è quasi opposta. Poiché separare CSS, HTML e JavaScript non si adattava bene alle applicazioni di grandi dimensioni, React suddivide l'applicazione secondo le sue entità funzionali e logiche.

Queste unità strutturali sono i componenti React. Un componente definisce nello stesso luogo l'HTML che struttura il contenuto, le funzioni JavaScript che ne stabiliscono il comportamento e gli stili. L'obiettivo è creare componenti il più possibile indipendenti e riutilizzabili.

Il codice della versione finale dell'applicazione è disponibile nel branch <i>part2-8</i> su [GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part2-8).

</div>

<div class="tasks">

<h3>Esercizi 2.16.-2.17.</h3>

<h4>2.16: La rubrica, passo 11</h4>

Usate come guida l'esempio del [messaggio di errore migliorato](/it/part2/aggiungere_stili_allapplicazione_react#un-messaggio-di-errore-migliore) per mostrare per alcuni secondi una notifica dopo un'operazione riuscita, cioè l'aggiunta di una persona o la modifica di un numero:

![notifica verde di operazione riuscita](../../images/2/27e.png)

<h4>2.17*: La rubrica, passo 12</h4>

Aprite l'applicazione in due browser. **Eliminate una persona nel browser 1** e, poco dopo, provate a <i>modificarne il numero nel browser 2</i>. Otterrete questi messaggi di errore:

![errore 404 durante la modifica da due browser](../../images/2/29b.png)

Correggete il problema seguendo l'esempio [promesse ed errori](/it/part2/modificare_i_dati_sul_server#promesse-ed-errori). Mostrate un messaggio all'utente quando l'operazione non riesce. Le notifiche di successo e di errore devono avere un aspetto diverso:

![messaggio di errore mostrato nell'interfaccia](../../images/2/28e.png)

**Nota:** anche gestendo l'eccezione, il primo errore «404» viene comunque stampato nella console. Non dovrebbe però comparire «Uncaught (in promise) Error».

</div>

<div class="content">

### Un paio di osservazioni importanti

Alla fine di questa parte sono presenti alcuni esercizi più impegnativi. Se in questa fase risultano eccessivamente difficili, potete saltarli: torneremo sugli stessi argomenti più avanti. Vale comunque la pena leggere il materiale.

Nell'applicazione abbiamo fatto una scelta che nasconde una causa di errore molto comune.

Abbiamo inizializzato lo stato _notes_ con un array vuoto:

```js
const App = () => {
  const [notes, setNotes] = useState([])

  // ...
}
```

È un valore iniziale naturale perché le note costituiscono una collezione: lo stato ne conterrà molte.

Se lo stato memorizzasse una sola «cosa», sarebbe più appropriato inizializzarlo a _null_, indicando che inizialmente non contiene <i>nulla</i>. Vediamo cosa accade:

```js
const App = () => {
  const [notes, setNotes] = useState(null) // highlight-line

  // ...
}
```

L'applicazione si interrompe:

![TypeError: impossibile leggere map da null](../../images/2/31a.png)

Il messaggio indica la causa e la posizione dell'errore. Il codice problematico è:

```js
  // notesToShow gets the value of notes
  const notesToShow = showAll
    ? notes
    : notes.filter(note => note.important)

  // ...

  {notesToShow.map(note =>  // highlight-line
    <Note key={note.id} note={note} />
  )}
```

Il messaggio è:

```bash
Cannot read properties of null (reading 'map')
```

_notesToShow_ riceve il valore dello stato _notes_, quindi il codice tenta di chiamare <em>map</em> su un oggetto inesistente, cioè _null_.

Perché accade?

L'hook di effetto usa _setNotes_ per assegnare a _notes_ i dati restituiti dal backend:

```js
  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)  // highlight-line
      })
  }, [])
```

Il problema è che l'effetto viene eseguito soltanto <i>dopo il primo rendering</i>. Poiché inizialmente _notes_ vale null:

```js
const App = () => {
  const [notes, setNotes] = useState(null) // highlight-line

  // ...
```

durante il primo rendering viene eseguito:

```js
notesToShow = notes

// ...

notesToShow.map(note => ...)
```

e l'applicazione si interrompe perché non è possibile chiamare <em>map</em> sul valore _null_. Con un array vuoto iniziale non si verifica alcun errore, dato che chiamare <em>map</em> su un array vuoto è consentito.

L'inizializzazione dello stato aveva quindi «nascosto» il problema dovuto al fatto che i dati non sono ancora arrivati dal backend.

Un'altra soluzione consiste nel <i>rendering condizionale</i>: restituiamo null finché lo stato non è inizializzato correttamente.

```js
const App = () => {
  const [notes, setNotes] = useState(null) // highlight-line
  // ... 

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)
      })
  }, [])

  // do not render anything if notes is still null
  // highlight-start
  if (!notes) { 
    return null 
  }
  // highlight-end

  // ...
} 
```

Al primo rendering non viene mostrato nulla. Quando le note arrivano, l'effetto aggiorna _notes_ con _setNotes_, causando un secondo rendering che visualizza le note.

Il rendering condizionale è adatto quando non è possibile scegliere uno stato iniziale che consenta il primo rendering.

Dobbiamo ancora esaminare il secondo parametro di useEffect:

```js
  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)  
      })
  }, []) // highlight-line
```

Il secondo parametro di <em>useEffect</em> [stabilisce quando eseguire l'effetto](https://react.dev/reference/react/useEffect#parameters). L'effetto viene sempre eseguito dopo il primo rendering e ogni volta che cambia il valore del secondo parametro.

Se il parametro è un array vuoto, <em>[]</em>, il suo contenuto non cambia mai e l'effetto viene eseguito soltanto dopo il primo rendering. È proprio ciò che serve per inizializzare lo stato dal server.

In altri casi vogliamo eseguire l'effetto anche successivamente, per esempio quando lo stato cambia in un modo particolare.

Consideriamo questa applicazione che recupera i tassi di cambio dalla [Exchange Rate API](https://www.exchangerate-api.com/):

```js
import { useState, useEffect } from 'react'
import axios from 'axios'

const App = () => {
  const [value, setValue] = useState('')
  const [rates, setRates] = useState({})
  const [currency, setCurrency] = useState(null)

  useEffect(() => {
    console.log('effect run, currency is now', currency)

    // skip if currency is not defined
    if (currency) {
      console.log('fetching exchange rates...')
      axios
        .get(`https://open.er-api.com/v6/latest/${currency}`)
        .then(response => {
          setRates(response.data.rates)
        })
    }
  }, [currency])

  const handleChange = (event) => {
    setValue(event.target.value)
  }

  const onSearch = (event) => {
    event.preventDefault()
    setCurrency(value)
  }

  return (
    <div>
      <form onSubmit={onSearch}>
        currency: <input value={value} onChange={handleChange} />
        <button type="submit">exchange rate</button>
      </form>
      <pre>
        {JSON.stringify(rates, null, 2)}
      </pre>
    </div>
  )
}

export default App
```

L'interfaccia contiene un form in cui inserire il nome della valuta. Se esiste, l'applicazione mostra i relativi tassi di cambio:

![tassi di cambio con eur inserito e messaggio nella console](../../images/2/32new.png)

Quando viene premuto il pulsante, il valore inserito viene assegnato allo stato _currency_. Al cambiamento di _currency_, l'effetto recupera i tassi:

```js
const App = () => {
  // ...
  const [currency, setCurrency] = useState(null)

  useEffect(() => {
    console.log('effect run, currency is now', currency)

    // skip if currency is not defined
    if (currency) {
      console.log('fetching exchange rates...')
      axios
        .get(`https://open.er-api.com/v6/latest/${currency}`)
        .then(response => {
          setRates(response.data.rates)
        })
    }
  }, [currency]) // highlight-line
  // ...
}
```

Il secondo parametro è ora _[currency]_. L'effetto viene eseguito dopo il primo rendering e ogni volta che cambia questo array di dipendenze, cioè quando _currency_ riceve un nuovo valore.

_null_ è un valore iniziale naturale perché _currency_ rappresenta un singolo elemento e inizialmente non contiene nulla. È anche facile verificare con un if se sia stato assegnato un valore:

```js
if (currency) { 
  // exchange rates are fetched
}
```

La condizione impedisce la richiesta subito dopo il primo rendering, quando _currency_ vale ancora _null_.

Se l'utente scrive <i>eur</i>, Axios esegue una GET verso <https://open.er-api.com/v6/latest/eur> e salva la risposta nello stato _rates_. Inserendo poi <i>usd</i>, l'effetto viene eseguito nuovamente e richiede i tassi della nuova valuta.

Questo modo di eseguire le richieste può sembrare macchinoso. Questa applicazione potrebbe essere realizzata senza useEffect, effettuando la richiesta direttamente nel gestore del form:

```js
  const onSearch = (event) => {
    event.preventDefault()
    axios
      .get(`https://open.er-api.com/v6/latest/${value}`)
      .then(response => {
        setRates(response.data.rates)
      })
  }
```

Esistono però situazioni in cui questa tecnica non funziona. Potreste incontrarne una nell'esercizio 2.20, dove useEffect può offrire una soluzione; dipende comunque dall'approccio scelto e la soluzione di riferimento non usa necessariamente questo metodo.

</div>

<div class="tasks">

<h3>Esercizi 2.18.-2.20.</h3>

<h4>2.18*: Dati sui paesi, passo 1</h4>

All'indirizzo [https://studies.cs.helsinki.fi/restcountries/](https://studies.cs.helsinki.fi/restcountries/) è disponibile un servizio REST che offre in formato leggibile dalle macchine molte informazioni sui diversi paesi. Create un'applicazione che consenta di consultarle.

L'interfaccia è molto semplice: il paese da visualizzare viene individuato digitando una ricerca.

Se i risultati sono troppi, più di 10, l'utente deve rendere la ricerca più specifica:

![troppi risultati corrispondenti](../../images/2/19b1.png)

Se i risultati sono al massimo dieci ma più di uno, vengono mostrati tutti i paesi corrispondenti:

![elenco dei paesi corrispondenti](../../images/2/19b2.png)

Quando corrisponde un solo paese, mostratene i dati principali, per esempio capitale e area, la bandiera e le lingue parlate:

![bandiera e informazioni del paese](../../images/2/19c3.png)

**Nota:** è sufficiente che l'applicazione funzioni per la maggior parte dei paesi. Alcuni casi, come <i>Sudan</i>, sono difficili perché il nome compare anche in <i>South Sudan</i>; non è necessario gestire questi casi limite.

<h4>2.19*: Dati sui paesi, passo 2</h4>

**Resta ancora molto da fare in questa parte: non bloccatevi su questo esercizio!**

Migliorate l'applicazione precedente: quando vengono elencati più paesi, aggiungete accanto a ciascun nome un pulsante che ne mostri la vista dettagliata:

![pulsanti per mostrare ciascun paese](../../images/2/19b4.png)

Anche qui è sufficiente che l'applicazione funzioni per la maggior parte dei paesi; potete ignorare i casi in cui il nome di un paese compare in quello di un altro.

<h4>2.20*: Dati sui paesi, passo 3</h4>

Aggiungete alla vista del singolo paese le condizioni meteorologiche della sua capitale. Esistono molti servizi meteorologici; una possibile API è [OpenWeather](https://openweathermap.org). Dopo la creazione, la chiave API potrebbe richiedere alcuni minuti prima di diventare valida.

![informazioni meteorologiche aggiunte alla vista](../../images/2/19x.png)

Se usate OpenWeather, [qui](https://openweathermap.org/weather-conditions#Icon-list) trovate le indicazioni per ottenere le icone meteorologiche.

**Nota:** in alcuni browser, come Firefox, l'API scelta potrebbe restituire un errore relativo al supporto della cifratura HTTPS, anche se l'URL della richiesta inizia con _http://_. In tal caso potete completare l'esercizio usando Chrome.

**Nota:** quasi tutti i servizi meteorologici richiedono una chiave API. Non salvate la chiave nel controllo di versione e non inseritela direttamente nel codice sorgente. Per questo esercizio usate una [variabile d'ambiente](https://vitejs.dev/guide/env-and-mode.html). Nelle applicazioni reali è insicuro inviare queste chiavi direttamente dal browser, perché chiunque apra gli strumenti di sviluppo può intercettarle. Nella parte successiva implementeremo un backend separato.

Supponendo che la chiave sia <i>54l41n3n4v41m34rv0</i>, l'applicazione può essere avviata così:

```bash
export VITE_SOME_KEY=54l41n3n4v41m34rv0 && npm run dev // For Linux/macOS Bash
($env:VITE_SOME_KEY="54l41n3n4v41m34rv0") -and (npm run dev) // For Windows PowerShell
set "VITE_SOME_KEY=54l41n3n4v41m34rv0" && npm run dev // For Windows cmd.exe
```

Il valore è disponibile nell'oggetto _import.meta.env_:

```js
const api_key = import.meta.env.VITE_SOME_KEY
// variable api_key now has the value set in startup
```

**Nota:** per evitare la diffusione accidentale di variabili d'ambiente al client, Vite espone soltanto quelle il cui nome inizia con `VITE_`.

Dopo una modifica alle variabili d'ambiente dovete riavviare il server di sviluppo affinché abbia effetto.

Questo era l'ultimo esercizio della Parte 2.

</div>
