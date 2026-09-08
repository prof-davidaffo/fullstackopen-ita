---
mainImage: ../../../images/part-1.svg
part: 1
letter: c
lang: it
---

<div class="content">

Torniamo a lavorare con React.

Partiamo da un nuovo esempio:

```js
const Hello = (props) => {
  return (
    <div>
      <p>
        Hello {props.name}, you are {props.age} years old
      </p>
    </div>
  )
}

const App = () => {
  const name = 'Peter'
  const age = 10

  return (
    <div>
      <h1>Greetings</h1>
      <Hello name="Maya" age={26 + 10} />
      <Hello name={name} age={age} />
    </div>
  )
}
```

### Funzioni di supporto dei componenti

Estendiamo il componente <i>Hello</i> in modo che calcoli l'anno di nascita della persona salutata:

```js
const Hello = (props) => {
  // highlight-start
  const bornYear = () => {
    const yearNow = new Date().getFullYear()
    return yearNow - props.age
  }
  // highlight-end

  return (
    <div>
      <p>
        Hello {props.name}, you are {props.age} years old
      </p>
      <p>So you were probably born in {bornYear()}</p> // highlight-line
    </div>
  )
}
```

La logica che stima l'anno di nascita è racchiusa in una funzione dedicata, richiamata quando il componente viene visualizzato.

Non è necessario passare esplicitamente l'età come parametro, perché la funzione può accedere direttamente a tutte le props ricevute dal componente.

Osservando il codice, notiamo che la funzione di supporto è definita all'interno di un'altra funzione, quella che determina il comportamento del componente. In Java definire una funzione dentro un'altra può essere complesso ed è poco comune; in JavaScript, invece, è una pratica normale ed efficace.

### Destrutturazione

Prima di proseguire, esaminiamo una piccola ma utile funzionalità introdotta con ES6: l'[assegnamento per destrutturazione](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment), che permette di estrarre valori da oggetti e array durante un'assegnazione.

Nel codice precedente dovevamo riferirci ai dati ricevuti dal componente come _props.name_ e _props.age_, ripetendo due volte _props.age_.

Poiché <i>props</i> è un oggetto

```js
props = {
  name: 'Arto Hellas',
  age: 35,
}
```

possiamo semplificare il componente assegnando direttamente le proprietà a due variabili, _name_ e _age_, da usare nel codice:

```js
const Hello = (props) => {
  // highlight-start
  const name = props.name
  const age = props.age
  // highlight-end

  const bornYear = () => new Date().getFullYear() - age // highlight-line

  return (
    <div>
      <p>Hello {name}, you are {age} years old</p> // highlight-line
      <p>So you were probably born in {bornYear()}</p>
    </div>
  )
}
```

Nella definizione di _bornYear_ abbiamo usato anche la sintassi abbreviata delle funzioni freccia. Come già spiegato, se una funzione freccia contiene una sola espressione, il corpo non deve essere racchiuso tra parentesi graffe: la funzione restituisce direttamente il risultato dell'espressione.

In sintesi, le due definizioni seguenti sono equivalenti:

```js
const bornYear = () => new Date().getFullYear() - age

const bornYear = () => {
  return new Date().getFullYear() - age
}
```

La destrutturazione rende ancora più semplice l'assegnazione, perché consente di estrarre le proprietà di un oggetto in variabili separate:

```js
const Hello = (props) => {
    // highlight-start
  const { name, age } = props
    // highlight-end
  const bornYear = () => new Date().getFullYear() - age

  return (
    <div>
      <p>Hello {name}, you are {age} years old</p>
      <p>So you were probably born in {bornYear()}</p>
    </div>
  )
}
```

Quando l'oggetto che destrutturiamo contiene i valori

```js
props = {
  name: 'Arto Hellas',
  age: 35,
}
```

l'espressione <em>const { name, age } = props</em> assegna il valore `Arto Hellas` a _name_ e il valore 35 ad _age_.

Possiamo spingerci oltre:

```js
const Hello = ({ name, age }) => { // highlight-line
  const bornYear = () => new Date().getFullYear() - age

  return (
    <div>
      <p>
        Hello {name}, you are {age} years old
      </p>
      <p>So you were probably born in {bornYear()}</p>
    </div>
  )
}
```

Le props passate al componente vengono ora destrutturate direttamente nelle variabili _name_ e _age_.

Invece di assegnare l'intero oggetto a una variabile chiamata <i>props</i> e poi assegnarne le proprietà a _name_ e _age_

```js
const Hello = (props) => {
  const { name, age } = props
```

assegniamo direttamente i valori delle proprietà alle variabili, destrutturando l'oggetto props nel parametro della funzione del componente:

```js
const Hello = ({ name, age }) => {
```

### Nuovo rendering della pagina

Finora le nostre applicazioni sono state statiche: dopo il primo rendering, il loro aspetto non cambia. Che cosa dovremmo fare per creare un contatore che aumenti nel tempo oppure quando viene premuto un pulsante?

Partiamo dal codice seguente. <i>App.jsx</i> diventa:

```js
const App = (props) => {
  const {counter} = props
  return (
    <div>{counter}</div>
  )
}

export default App
```

e <i>main.jsx</i> diventa:

```js
import ReactDOM from 'react-dom/client'

import App from './App'

let counter = 1

ReactDOM.createRoot(document.getElementById('root')).render(
  <App counter={counter} />
)
```

Il componente <i>App</i> riceve il valore del contatore tramite la prop _counter_ e lo visualizza sullo schermo. Che cosa succede quando _counter_ cambia? Anche aggiungendo

```js
counter += 1
```

il componente non viene visualizzato di nuovo. Possiamo forzare un nuovo rendering chiamando una seconda volta il metodo _render_, per esempio così:

```js
let counter = 1

const root = ReactDOM.createRoot(document.getElementById('root'))

const refresh = () => {
  root.render(
    <App counter={counter} />
  )
}

refresh()
counter += 1
refresh()
counter += 1
refresh()
```

La chiamata che aggiorna il rendering è stata racchiusa nella funzione _refresh_ per ridurre la quantità di codice duplicato.

Il componente viene ora visualizzato <i>tre volte</i>: prima con il valore 1, poi con 2 e infine con 3. I valori 1 e 2 rimangono però sullo schermo per un tempo così breve da risultare impercettibili.

Possiamo ottenere un comportamento un po' più interessante aggiornando il rendering e incrementando il contatore ogni secondo tramite [setInterval](https://developer.mozilla.org/it/docs/Web/API/setInterval):

```js
setInterval(() => {
  refresh()
  counter += 1
}, 1000)
```

Chiamare ripetutamente _render_ non è il metodo consigliato per aggiornare un componente. Vedremo ora una soluzione migliore.

### Componenti con stato

Finora i nostri componenti sono stati semplici, perché non contenevano uno stato capace di cambiare durante il loro ciclo di vita.

Aggiungiamo uno stato al componente <i>App</i> usando l'[Hook di stato](https://react.dev/learn/state-a-components-memory) di React.

Modifichiamo l'applicazione. <i>main.jsx</i> torna a essere:

```js
import ReactDOM from 'react-dom/client'

import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

mentre <i>App.jsx</i> diventa:

```js
import { useState } from 'react' // highlight-line

const App = () => {
  const [ counter, setCounter ] = useState(0) // highlight-line

// highlight-start
  setTimeout(
    () => setCounter(counter + 1),
    1000
  )
  // highlight-end

  return (
    <div>{counter}</div>
  )
}

export default App
```

La prima riga importa la funzione _useState_:

```js
import { useState } from 'react'
```

Il corpo della funzione che definisce il componente inizia con questa chiamata:

```js
const [ counter, setCounter ] = useState(0)
```

La chiamata aggiunge uno <i>stato</i> al componente e lo inizializza con il valore zero. La funzione restituisce un array di due elementi, che assegniamo alle variabili _counter_ e _setCounter_ mediante la sintassi di destrutturazione vista in precedenza.

La variabile _counter_ riceve il valore iniziale dello <i>stato</i>, cioè zero. A _setCounter_ viene assegnata una funzione da utilizzare per <i>modificare lo stato</i>.

L'applicazione chiama [setTimeout](https://developer.mozilla.org/it/docs/Web/API/setTimeout) con due parametri: una funzione che incrementa lo stato del contatore e un intervallo di un secondo:

```js
setTimeout(
  () => setCounter(counter + 1),
  1000
)
```

La funzione fornita come primo parametro a _setTimeout_ viene eseguita un secondo dopo la chiamata:

```js
() => setCounter(counter + 1)
```

Quando viene chiamata la funzione _setCounter_ che modifica lo stato, <i>React esegue nuovamente il rendering del componente</i>. Ciò significa che il corpo della funzione del componente viene eseguito di nuovo:

```js
() => {
  const [ counter, setCounter ] = useState(0)

  setTimeout(
    () => setCounter(counter + 1),
    1000
  )

  return (
    <div>{counter}</div>
  )
}
```

Alla seconda esecuzione, la funzione del componente chiama _useState_ e riceve il nuovo valore dello stato: 1. L'esecuzione del corpo crea anche una nuova chiamata a _setTimeout_, che dopo un secondo incrementa ancora lo stato _counter_. Poiché _counter_ vale 1, l'incremento equivale a impostarlo a 2:

```js
() => setCounter(2)
```

Nel frattempo, sullo schermo viene mostrato il vecchio valore di _counter_, cioè 1.

Ogni volta che _setCounter_ modifica lo stato, il componente viene visualizzato nuovamente. Dopo un secondo lo stato aumenta ancora e il processo continua finché l'applicazione rimane in esecuzione.

Se il componente non viene aggiornato quando ti aspetti, oppure viene aggiornato nel "momento sbagliato", puoi eseguire il debug stampando nella console i valori delle sue variabili. Aggiungiamo questa riga:

```js
const App = () => {
  const [ counter, setCounter ] = useState(0)

  setTimeout(
    () => setCounter(counter + 1),
    1000
  )

  console.log('rendering...', counter) // highlight-line

  return (
    <div>{counter}</div>
  )
}
```

Diventa facile seguire le chiamate alla funzione di rendering di <i>App</i>:

![Console degli strumenti per sviluppatori con i messaggi di rendering](../../images/1/4e.png)

La console del browser era aperta? Se non lo era, prometti che questa sarà l'ultima volta in cui dovremo ricordartelo.

### Gestione degli eventi

Nella [parte 0](/it/part0) abbiamo già citato più volte i <i>gestori di eventi</i>, funzioni registrate per essere chiamate quando si verificano determinati eventi. L'interazione dell'utente con gli elementi di una pagina può generare numerosi tipi di evento.

Modifichiamo l'applicazione affinché il contatore aumenti quando l'utente preme un elemento [button](https://developer.mozilla.org/it/docs/Web/HTML/Element/button).

I pulsanti supportano i cosiddetti [eventi del mouse](https://developer.mozilla.org/it/docs/Web/API/MouseEvent), tra i quali [click](https://developer.mozilla.org/it/docs/Web/API/Element/click_event) è il più comune. Nonostante il nome, l'evento click di un pulsante può essere attivato anche con la tastiera o con uno schermo touch.

In React si [registra una funzione per gestire l'evento](https://react.dev/learn/responding-to-events) <i>click</i> in questo modo:

```js
const App = () => {
  const [ counter, setCounter ] = useState(0)

  // highlight-start
  const handleClick = () => {
    console.log('clicked')
  }
  // highlight-end

  return (
    <div>
      <div>{counter}</div>
      // highlight-start
      <button onClick={handleClick}>
        plus
      </button>
      // highlight-end
    </div>
  )
}
```

Assegniamo all'attributo <i>onClick</i> del pulsante un riferimento alla funzione _handleClick_ definita nel codice.

Ogni pressione del pulsante <i>plus</i> chiama ora _handleClick_ e stampa il messaggio <i>clicked</i> nella console del browser.

Il gestore può essere definito anche direttamente durante l'assegnazione dell'attributo <i>onClick</i>:

```js
const App = () => {
  const [ counter, setCounter ] = useState(0)

  return (
    <div>
      <div>{counter}</div>
      <button onClick={() => console.log('clicked')}> // highlight-line
        plus
      </button>
    </div>
  )
}
```

Modificando il gestore così

```js
<button onClick={() => setCounter(counter + 1)}>
  plus
</button>
```

otteniamo il comportamento desiderato: _counter_ aumenta di uno <i>e</i> il componente viene visualizzato nuovamente.

Aggiungiamo anche un pulsante che azzera il contatore:

```js
const App = () => {
  const [ counter, setCounter ] = useState(0)

  return (
    <div>
      <div>{counter}</div>
      <button onClick={() => setCounter(counter + 1)}>
        plus
      </button>
      // highlight-start
      <button onClick={() => setCounter(0)}> 
        zero
      </button>
      // highlight-end
    </div>
  )
}
```

La nostra applicazione è pronta.

### Un gestore di eventi è una funzione

Definiamo i gestori dei pulsanti nei rispettivi attributi <i>onClick</i>:

```js
<button onClick={() => setCounter(counter + 1)}> 
  plus
</button>
```

Che cosa accadrebbe se provassimo a definirli in una forma più semplice?

```js
<button onClick={setCounter(counter + 1)}> 
  plus
</button>
```

L'applicazione smetterebbe completamente di funzionare:

![Errore causato da un ciclo continuo di rendering](../../images/1/5c.png)

Che cosa succede? Un gestore di eventi deve essere una <i>funzione</i> oppure un <i>riferimento a una funzione</i>. Scrivendo

```js
<button onClick={setCounter(counter + 1)}>
```

il gestore è in realtà una <i>chiamata di funzione</i>. In molte situazioni potrebbe essere corretto, ma non in questa. All'inizio _counter_ vale 0. Quando React visualizza il componente per la prima volta, esegue <em>setCounter(0+1)</em> e imposta lo stato a 1. Questo provoca un nuovo rendering, durante il quale React richiama ancora _setCounter_, modificando di nuovo lo stato e causando un altro rendering, e così via.

Definiamo il gestore come in precedenza:

```js
<button onClick={() => setCounter(counter + 1)}> 
  plus
</button>
```

Ora l'attributo che stabilisce che cosa avviene al click, <i>onClick</i>, contiene il valore _() => setCounter(counter + 1)_. La funzione _setCounter_ viene chiamata soltanto quando l'utente preme il pulsante.

Di solito non è una buona idea definire i gestori direttamente nei template JSX. Qui è accettabile perché sono molto semplici.

Separiamoli comunque in funzioni dedicate:

```js
const App = () => {
  const [ counter, setCounter ] = useState(0)

// highlight-start
  const increaseByOne = () => setCounter(counter + 1)
  
  const setToZero = () => setCounter(0)
  // highlight-end

  return (
    <div>
      <div>{counter}</div>
      <button onClick={increaseByOne}> // highlight-line
        plus
      </button>
      <button onClick={setToZero}> // highlight-line
        zero
      </button>
    </div>
  )
}
```

I gestori sono ora definiti correttamente. Il valore dell'attributo <i>onClick</i> è una variabile che contiene un riferimento a una funzione:

```js
<button onClick={increaseByOne}> 
  plus
</button>
```

### Passare lo stato ai componenti figli

È consigliabile scrivere componenti React piccoli e riutilizzabili nell'intera applicazione, o persino in progetti diversi. Riorganizziamo l'applicazione dividendola in tre componenti più piccoli: uno per visualizzare il contatore e due per i pulsanti.

Iniziamo implementando un componente <i>Display</i>, responsabile della visualizzazione del valore del contatore.

Una buona pratica di React consiste nel [sollevare lo stato](https://react.dev/learn/sharing-state-between-components) lungo la gerarchia dei componenti. La documentazione afferma:

> <i>Spesso più componenti devono riflettere gli stessi dati che cambiano. È consigliabile spostare lo stato condiviso nel loro antenato comune più vicino.</i>

Conserviamo quindi lo stato dell'applicazione in <i>App</i> e passiamolo a <i>Display</i> mediante le <i>props</i>:

```js
const Display = (props) => {
  return (
    <div>{props.counter}</div>
  )
}
```

Usare il componente è semplice: basta passargli lo stato _counter_:

```js
const App = () => {
  const [ counter, setCounter ] = useState(0)

  const increaseByOne = () => setCounter(counter + 1)
  const setToZero = () => setCounter(0)

  return (
    <div>
      <Display counter={counter}/> // highlight-line
      <button onClick={increaseByOne}>
        plus
      </button>
      <button onClick={setToZero}> 
        zero
      </button>
    </div>
  )
}
```

Tutto continua a funzionare. Quando i pulsanti vengono premuti e <i>App</i> viene visualizzato nuovamente, anche tutti i componenti figli, compreso <i>Display</i>, vengono aggiornati.

Creiamo ora un componente <i>Button</i> per i pulsanti dell'applicazione. Dobbiamo passargli tramite props sia il gestore di eventi sia il testo del pulsante:

```js
const Button = (props) => {
  return (
    <button onClick={props.onClick}>
      {props.text}
    </button>
  )
}
```

Il componente <i>App</i> diventa:

```js
const App = () => {
  const [ counter, setCounter ] = useState(0)

  const increaseByOne = () => setCounter(counter + 1)
  //highlight-start
  const decreaseByOne = () => setCounter(counter - 1)
  //highlight-end
  const setToZero = () => setCounter(0)

  return (
    <div>
      <Display counter={counter}/>
      // highlight-start
      <Button
        onClick={increaseByOne}
        text='plus'
      />
      <Button
        onClick={setToZero}
        text='zero'
      />     
      <Button
        onClick={decreaseByOne}
        text='minus'
      />           
      // highlight-end
    </div>
  )
}
```

Ora che disponiamo di un componente <i>Button</i> facilmente riutilizzabile, abbiamo aggiunto anche una nuova funzione: un pulsante che diminuisce il contatore.

Il gestore viene passato a <i>Button</i> tramite la prop _onClick_. Quando crei componenti personalizzati, in teoria puoi scegliere liberamente il nome delle props; in questo caso, però, la scelta non è del tutto arbitraria.

Il [tutorial ufficiale](https://react.dev/learn/tutorial-tic-tac-toe) di React suggerisce di usare convenzionalmente nomi del tipo _onQualcosa_ per le props che ricevono funzioni di gestione degli eventi e _handleQualcosa_ per le funzioni che gestiscono effettivamente tali eventi.

### Le modifiche allo stato provocano un nuovo rendering

Ripassiamo ancora una volta i principi fondamentali del funzionamento dell'applicazione.

All'avvio viene eseguito il codice di _App_. Questo usa l'Hook [useState](https://react.dev/reference/react/useState) per creare lo stato dell'applicazione e assegnare un valore iniziale alla variabile _counter_. Il componente contiene <i>Display</i>, che mostra il valore iniziale 0, e tre componenti <i>Button</i>. Tutti i pulsanti possiedono gestori di eventi usati per modificare lo stato del contatore.

Quando viene premuto un pulsante, il relativo gestore modifica lo stato di <i>App</i> tramite _setCounter_. **Chiamare una funzione che modifica lo stato provoca un nuovo rendering del componente.**

Se l'utente preme <i>plus</i>, il gestore porta _counter_ a 1 e <i>App</i> viene visualizzato nuovamente. Di conseguenza vengono aggiornati anche i componenti figli <i>Display</i> e <i>Button</i>. <i>Display</i> riceve come prop il nuovo valore 1, mentre i componenti <i>Button</i> ricevono i gestori che permettono di cambiare lo stato.

Per assicurarci di comprendere il programma, aggiungiamo alcune istruzioni _console.log_:

```js
const App = () => {
  const [counter, setCounter] = useState(0)
  console.log('rendering with counter value', counter) // highlight-line

  const increaseByOne = () => {
    console.log('increasing, value before', counter) // highlight-line
    setCounter(counter + 1)
  }

  const decreaseByOne = () => { 
    console.log('decreasing, value before', counter) // highlight-line
    setCounter(counter - 1)
  }

  const setToZero = () => {
    console.log('resetting to zero, value before', counter) // highlight-line
    setCounter(0)
  }

  return (
    <div>
      <Display counter={counter} />
      <Button onClick={increaseByOne} text="plus" />
      <Button onClick={setToZero} text="zero" />
      <Button onClick={decreaseByOne} text="minus" />
    </div>
  )
} 
```

Vediamo che cosa appare nella console premendo, nell'ordine, i pulsanti <i>plus</i>, <i>zero</i> e <i>minus</i>:

![Browser con i valori di rendering evidenziati nella console](../../images/1/31.png)

Non cercare mai di indovinare che cosa fa il codice. È meglio usare _console.log_ e <i>vederlo con i propri occhi</i>.

### Riorganizzare i componenti

Il componente che mostra il valore del contatore è il seguente:

```js
const Display = (props) => {
  return (
    <div>{props.counter}</div>
  )
}
```

Il componente utilizza soltanto il campo _counter_ delle proprie <i>props</i>. Possiamo quindi semplificarlo tramite la [destrutturazione](/it/part1/stato_dei_componenti_e_gestione_degli_eventi#destrutturazione):

```js
const Display = ({ counter }) => {
  return (
    <div>{counter}</div>
  )
}
```

La funzione che definisce il componente contiene soltanto l'istruzione <i>return</i>, quindi possiamo adottare la forma abbreviata delle funzioni freccia:

```js
const Display = ({ counter }) => <div>{counter}</div>
```

Possiamo semplificare allo stesso modo il componente <i>Button</i>:

```js
const Button = (props) => {
  return (
    <button onClick={props.onClick}>
      {props.text}
    </button>
  )
}
```

Usando la destrutturazione per estrarre da <i>props</i> soltanto i campi necessari e la forma abbreviata delle funzioni freccia otteniamo:

```js
const Button = ({ onClick, text }) => <button onClick={onClick}>{text}</button>
```

Questa soluzione è possibile perché il componente contiene una sola istruzione di ritorno.

</div>
