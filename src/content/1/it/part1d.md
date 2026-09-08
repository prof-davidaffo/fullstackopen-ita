---
mainImage: ../../../images/part-1.svg
part: 1
letter: d
lang: it
---

<div class="content">

### Stato complesso

Nell'esempio precedente lo stato dell'applicazione era semplice: consisteva in un unico numero intero. Che cosa possiamo fare quando serve uno stato più complesso?

Nella maggior parte dei casi, la soluzione più semplice e migliore consiste nel chiamare _useState_ più volte per creare diverse "parti" di stato.

Nel codice seguente creiamo due parti dello stato, _left_ e _right_, entrambe inizializzate a 0:

```js
const App = () => {
  const [left, setLeft] = useState(0)
  const [right, setRight] = useState(0)

  return (
    <div>
      {left}
      <button onClick={() => setLeft(left + 1)}>
        left
      </button>
      <button onClick={() => setRight(right + 1)}>
        right
      </button>
      {right}
    </div>
  )
}
```

Il componente ottiene le funzioni _setLeft_ e _setRight_, con le quali può aggiornare separatamente le due parti dello stato.

Lo stato di un componente, o una sua parte, può essere di qualsiasi tipo. Potremmo realizzare la stessa funzionalità salvando il numero di pressioni dei pulsanti <i>left</i> e <i>right</i> in un unico oggetto:

```js
{
  left: 0,
  right: 0
}
```

In questo caso l'applicazione sarebbe così:

```js
const App = () => {
  const [clicks, setClicks] = useState({
    left: 0, right: 0
  })

  const handleLeftClick = () => {
    const newClicks = { 
      left: clicks.left + 1, 
      right: clicks.right 
    }
    setClicks(newClicks)
  }

  const handleRightClick = () => {
    const newClicks = { 
      left: clicks.left, 
      right: clicks.right + 1 
    }
    setClicks(newClicks)
  }

  return (
    <div>
      {clicks.left}
      <button onClick={handleLeftClick}>left</button>
      <button onClick={handleRightClick}>right</button>
      {clicks.right}
    </div>
  )
}
```

Ora il componente possiede una sola parte di stato e i gestori devono occuparsi di modificare <i>l'intero stato dell'applicazione</i>.

Il gestore appare un po' complicato. Quando viene premuto il pulsante sinistro, viene chiamata questa funzione:

```js
const handleLeftClick = () => {
  const newClicks = { 
    left: clicks.left + 1, 
    right: clicks.right 
  }
  setClicks(newClicks)
}
```

Come nuovo stato dell'applicazione viene impostato l'oggetto seguente:

```js
{
  left: clicks.left + 1,
  right: clicks.right
}
```

Il nuovo valore della proprietà <i>left</i> corrisponde al valore precedente di <i>left</i> più uno; quello di <i>right</i> rimane uguale alla proprietà <i>right</i> dello stato precedente.

Possiamo definire il nuovo oggetto in modo più ordinato usando la sintassi [spread per gli oggetti](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Operators/Spread_syntax), aggiunta alle specifiche del linguaggio nell'estate del 2018:

```js
const handleLeftClick = () => {
  const newClicks = { 
    ...clicks, 
    left: clicks.left + 1 
  }
  setClicks(newClicks)
}

const handleRightClick = () => {
  const newClicks = { 
    ...clicks, 
    right: clicks.right + 1 
  }
  setClicks(newClicks)
}
```

All'inizio la sintassi può sembrare strana. In pratica, <em>{ ...clicks }</em> crea un nuovo oggetto contenente copie di tutte le proprietà di _clicks_. Quando specifichiamo una proprietà, per esempio <i>right</i> in <em>{ ...clicks, right: 1 }</em>, la proprietà _right_ del nuovo oggetto assume il valore 1.

Nell'esempio precedente

```js
{ ...clicks, right: clicks.right + 1 }
```

crea una copia di _clicks_ in cui il valore della proprietà _right_ è aumentato di uno.

Non è necessario assegnare il nuovo oggetto a una variabile nei gestori, quindi possiamo abbreviare le funzioni:

```js
const handleLeftClick = () =>
  setClicks({ ...clicks, left: clicks.left + 1 })

const handleRightClick = () =>
  setClicks({ ...clicks, right: clicks.right + 1 })
```

Qualcuno potrebbe chiedersi perché non aggiorniamo direttamente lo stato così:

```js
const handleLeftClick = () => {
  clicks.left++
  setClicks(clicks)
}
```

L'applicazione sembra funzionare. In React, però, <i>è vietato modificare direttamente lo stato</i>, perché [può produrre effetti collaterali imprevisti](https://stackoverflow.com/a/40309023). Lo stato deve essere sempre aggiornato assegnando un nuovo oggetto. Le proprietà che non cambiano vanno semplicemente copiate dallo stato precedente nel nuovo oggetto.

Conservare tutto lo stato in un singolo oggetto è una cattiva scelta per questa applicazione: non offre vantaggi evidenti e rende il codice molto più complesso. In questo caso è decisamente preferibile mantenere i due contatori in parti separate dello stato.

Esistono comunque situazioni in cui conviene conservare una parte dello stato in una struttura dati più complessa. La [documentazione ufficiale di React](https://react.dev/learn/choosing-the-state-structure) contiene indicazioni utili sull'argomento.

### Gestire gli array

Aggiungiamo allo stato dell'applicazione un array _allClicks_ che ricordi ogni pressione avvenuta:

```js
const App = () => {
  const [left, setLeft] = useState(0)
  const [right, setRight] = useState(0)
  const [allClicks, setAll] = useState([]) // highlight-line

// highlight-start
  const handleLeftClick = () => {
    setAll(allClicks.concat('L'))
    setLeft(left + 1)
  }
// highlight-end  

// highlight-start
  const handleRightClick = () => {
    setAll(allClicks.concat('R'))
    setRight(right + 1)
  }
// highlight-end  

  return (
    <div>
      {left}
      <button onClick={handleLeftClick}>left</button>
      <button onClick={handleRightClick}>right</button>
      {right}
      <p>{allClicks.join(' ')}</p> // highlight-line
    </div>
  )
}
```

Ogni pressione viene salvata nella parte di stato _allClicks_, inizializzata come array vuoto:

```js
const [allClicks, setAll] = useState([])
```

Quando viene premuto <i>left</i>, aggiungiamo la lettera <i>L</i> all'array _allClicks_:

```js
const handleLeftClick = () => {
  setAll(allClicks.concat('L'))
  setLeft(left + 1)
}
```

Il nuovo valore di _allClicks_ è un array che contiene tutti gli elementi dello stato precedente e, in aggiunta, la lettera <i>L</i>. Usiamo il metodo [concat](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Array/concat), che non modifica l'array esistente ma ne restituisce una <i>nuova copia</i> con l'elemento aggiunto.

Come già detto, in JavaScript è possibile aggiungere elementi a un array anche con [push](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Array/push). Se modificassimo _allClicks_ con <i>push</i> e aggiornassimo poi lo stato, l'applicazione sembrerebbe ancora funzionare:

```js
const handleLeftClick = () => {
  allClicks.push('L')
  setAll(allClicks)
  setLeft(left + 1)
}
```

Tuttavia, **non farlo**. Come spiegato in precedenza, lo stato dei componenti React, compreso _allClicks_, non deve essere modificato direttamente. Anche se talvolta sembra funzionare, può causare problemi molto difficili da individuare.

Esaminiamo più attentamente come viene mostrata la cronologia delle pressioni:

```js
const App = () => {
  // ...

  return (
    <div>
      {left}
      <button onClick={handleLeftClick}>left</button>
      <button onClick={handleRightClick}>right</button>
      {right}
      <p>{allClicks.join(' ')}</p> // highlight-line
    </div>
  )
}
```

Chiamiamo il metodo [join](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Array/join) sull'array _allClicks_. Il metodo unisce tutti gli elementi in un'unica stringa, separandoli con la stringa ricevuta come parametro, in questo caso uno spazio.

### L'aggiornamento dello stato è asincrono

Estendiamo l'applicazione affinché tenga traccia del numero totale di pressioni nello stato _total_, aggiornato ogni volta che viene premuto un pulsante:

```js
const App = () => {
  const [left, setLeft] = useState(0)
  const [right, setRight] = useState(0)
  const [allClicks, setAll] = useState([])
  const [total, setTotal] = useState(0) // highlight-line

  const handleLeftClick = () => {
    setAll(allClicks.concat('L'))
    setLeft(left + 1)
    setTotal(left + right)  // highlight-line
  }

  const handleRightClick = () => {
    setAll(allClicks.concat('R'))
    setRight(right + 1)
    setTotal(left + right)  // highlight-line
  }

  return (
    <div>
      {left}
      <button onClick={handleLeftClick}>left</button>
      <button onClick={handleRightClick}>right</button>
      {right}
      <p>{allClicks.join(' ')}</p>
      <p>total {total}</p>  // highlight-line
    </div>
  )
}
```

La soluzione non funziona del tutto:

![Il browser mostra due pressioni a sinistra, una a destra, RLL e total 2](../../images/1/33.png)

Per qualche motivo il totale è sempre inferiore di uno rispetto al numero reale di pressioni.

Aggiungiamo alcune istruzioni _console.log_ al gestore:

```js
const App = () => {
  // ...
  const handleLeftClick = () => {
    setAll(allClicks.concat('L'))
    console.log('left before', left)  // highlight-line
    setLeft(left + 1)
    console.log('left after', left)  // highlight-line
    setTotal(left + right) 
  }

  // ...
}
```

La console rivela il problema:

![La console mostra left before 4 e left after 4](../../images/1/32.png)

Anche se abbiamo impostato un nuovo valore per _left_ chiamando _setLeft(left + 1)_, subito dopo è ancora disponibile quello precedente. Il tentativo di calcolare il totale produce quindi un risultato troppo piccolo:

```js
setTotal(left + right) 
```

Il motivo è che gli aggiornamenti dello stato in React avvengono [in modo asincrono](https://react.dev/learn/queueing-a-series-of-state-updates): non immediatamente, ma dopo che la funzione corrente del componente ha terminato la propria esecuzione e prima del rendering successivo.

Possiamo correggere l'applicazione così:

```js
const App = () => {
  // ...
  const handleLeftClick = () => {
    setAll(allClicks.concat('L'))
    const updatedLeft = left + 1
    setLeft(updatedLeft)
    setTotal(updatedLeft + right) 
  }

  // ...
}
```

Il totale si basa ora con certezza sul numero corretto di pressioni del pulsante sinistro.

Gestiamo allo stesso modo l'aggiornamento asincrono del pulsante destro:

```js
const App = () => {
  // ...
  const handleRightClick = () => {
    setAll(allClicks.concat('R'));
    const updatedRight = right + 1;
    setRight(updatedRight);
    setTotal(left + updatedRight);
  };

  // ...
}
```

### Rendering condizionale

Modifichiamo l'applicazione affidando la visualizzazione della cronologia a un nuovo componente <i>History</i>:

```js
// highlight-start
const History = (props) => {
  if (props.allClicks.length === 0) {
    return (
      <div>
        the app is used by pressing the buttons
      </div>
    )
  }

  return (
    <div>
      button press history: {props.allClicks.join(' ')}
    </div>
  )
}
// highlight-end

const App = () => {
  // ...

  return (
    <div>
      {left}
      <button onClick={handleLeftClick}>left</button>
      <button onClick={handleRightClick}>right</button>
      {right}
      <History allClicks={allClicks} /> // highlight-line
    </div>
  )
}
```

Il comportamento del componente dipende ora dal fatto che sia stato premuto almeno un pulsante. Se _allClicks_ è vuoto, il componente mostra un <i>div</i> con alcune istruzioni:

```js
<div>the app is used by pressing the buttons</div>
```

In tutti gli altri casi mostra la cronologia:

```js
<div>
  button press history: {props.allClicks.join(' ')}
</div>
```

<i>History</i> visualizza elementi React completamente diversi a seconda dello stato dell'applicazione. Questo meccanismo prende il nome di <i>rendering condizionale</i>.

React offre molti altri modi per effettuare il [rendering condizionale](https://react.dev/learn/conditional-rendering). Li approfondiremo nella [parte 2](/en/part2).

Apportiamo un'ultima modifica usando il componente _Button_ definito in precedenza:

```js
const History = (props) => {
  if (props.allClicks.length === 0) {
    return (
      <div>
        the app is used by pressing the buttons
      </div>
    )
  }

  return (
    <div>
      button press history: {props.allClicks.join(' ')}
    </div>
  )
}

const Button = ({ onClick, text }) => <button onClick={onClick}>{text}</button> // highlight-line

const App = () => {
  const [left, setLeft] = useState(0)
  const [right, setRight] = useState(0)
  const [allClicks, setAll] = useState([])

  const handleLeftClick = () => {
    setAll(allClicks.concat('L'))
    setLeft(left + 1)
  }

  const handleRightClick = () => {
    setAll(allClicks.concat('R'))
    setRight(right + 1)
  }

  return (
    <div>
      {left}
      // highlight-start
      <Button onClick={handleLeftClick} text='left' />
      <Button onClick={handleRightClick} text='right' />
      // highlight-end
      {right}
      <History allClicks={allClicks} />
    </div>
  )
}
```

### Il vecchio React

Nel corso usiamo l'[Hook di stato](https://react.dev/learn/state-a-components-memory) per aggiungere uno stato ai componenti React. È disponibile a partire dalla versione [16.8.0](https://www.npmjs.com/package/react/v/16.8.0). Prima dell'introduzione degli Hook non era possibile aggiungere uno stato ai componenti funzione: quelli che ne avevano bisogno dovevano essere definiti come componenti [classe](https://react.dev/reference/react/Component), usando la sintassi delle classi JavaScript.

Abbiamo preso la decisione piuttosto radicale di usare esclusivamente gli Hook fin dal primo giorno, così da imparare il React attuale e futuro. Sebbene i componenti funzione rappresentino il futuro di React, è comunque importante conoscere la sintassi delle classi: esistono miliardi di righe di vecchio codice React che un giorno potresti dover mantenere. Lo stesso vale per la documentazione e gli esempi meno recenti che si trovano online.

Approfondiremo i componenti classe di React più avanti nel corso.

### Debug delle applicazioni React

Uno sviluppatore trascorre gran parte del proprio tempo a eseguire il debug e a leggere codice esistente. Ogni tanto scriviamo una o due righe nuove, ma molto spesso cerchiamo di capire perché qualcosa non funzioni o come sia stato realizzato. Per questo sono fondamentali buone pratiche e strumenti di debugging.

Fortunatamente React è una libreria molto amichevole nei confronti degli sviluppatori anche durante il debug.

Prima di proseguire, ricordiamo una delle regole più importanti dello sviluppo web.

<h4>La prima regola dello sviluppo web</h4>

> **Tieni sempre aperta la console degli strumenti per sviluppatori del browser.**
>
> In particolare, la scheda <i>Console</i> dovrebbe rimanere aperta, salvo quando esiste un motivo preciso per consultarne un'altra.

Mantieni il codice e la pagina web aperti **contemporaneamente, sempre**.

Se il codice non viene compilato e il browser si illumina come un albero di Natale:

![Errore che indica la riga di codice in cui si è verificato](../../images/1/6x.png)

non continuare a scrivere: individua e correggi il problema **immediatamente**. Nella storia della programmazione non è mai accaduto che del codice non compilabile iniziasse miracolosamente a funzionare dopo l'aggiunta di molte altre righe. È improbabile che succeda proprio durante questo corso.

Il vecchio metodo di debug basato sulle stampe rimane sempre valido. Se il componente

```js
const Button = ({ onClick, text }) => <button onClick={onClick}>{text}</button>
```

non si comporta come previsto, conviene iniziare stampando le sue variabili nella console. Per farlo efficacemente, trasformiamo la funzione nella forma estesa e riceviamo l'intero oggetto props senza destrutturarlo subito:

```js
const Button = (props) => { 
  console.log(props) // highlight-line
  const { onClick, text } = props
  return (
    <button onClick={onClick}>
      {text}
    </button>
  )
}
```

In questo modo, per esempio, un errore nel nome di uno degli attributi diventa immediatamente visibile.

**Nota:** quando usi _console.log_ per il debug, non concatenare gli _oggetti_ con l'operatore più, come si farebbe in Java:

```js
console.log('props value is ' + props)
```
  
Otterresti un messaggio poco utile:

```js
props value is [object Object]
```

Separa invece gli elementi da stampare con una virgola:

```js
console.log('props value is', props)
```

Così tutti gli elementi rimangono disponibili nella console e possono essere esaminati separatamente.

Stampare informazioni non è l'unico modo per eseguire il debug. Puoi sospendere l'esecuzione del codice nella console per sviluppatori di Chrome inserendo l'istruzione [debugger](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Statements/debugger) in qualsiasi punto:

![Esecuzione sospesa dal debugger negli strumenti per sviluppatori](../../images/1/7a.png)

Quando l'esecuzione raggiunge l'istruzione _debugger_ viene interrotta. Nella scheda <i>Console</i> è quindi facile esaminare i valori correnti delle variabili:

![Ispezione delle variabili nella console](../../images/1/8a.png)

Individuata la causa del problema, puoi rimuovere l'istruzione _debugger_ e aggiornare la pagina.

Il debugger permette anche di eseguire il codice una riga alla volta tramite i controlli sul lato destro della scheda <i>Sources</i>.

Puoi utilizzarlo senza inserire l'istruzione _debugger_, aggiungendo punti di interruzione direttamente nella scheda <i>Sources</i>. I valori delle variabili del componente sono visibili nella sezione <i>Scope</i>:

![Punto di interruzione negli strumenti per sviluppatori](../../images/1/9a.png)

È fortemente consigliato installare in Chrome l'estensione [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi). Aggiunge agli strumenti per sviluppatori una scheda <i>Components</i>, con cui esaminare gli elementi React, il loro stato e le props:

![React Developer Tools mostra i componenti dell'applicazione](../../images/1/10ea.png)

Lo stato di <i>App</i> è definito così:

```js
const [left, setLeft] = useState(0)
const [right, setRight] = useState(0)
const [allClicks, setAll] = useState([])
```

Gli strumenti mostrano gli stati degli Hook nello stesso ordine in cui sono stati definiti:

![Gli stati degli Hook in React Developer Tools](../../images/1/11ea.png)

Il primo elemento <i>State</i> contiene il valore di _left_, il secondo quello di _right_ e l'ultimo quello di _allClicks_.

Per approfondire il debug di JavaScript in Chrome puoi consultare, per esempio, il [video della guida a Chrome DevTools](https://developer.chrome.com/docs/devtools/javascript).

### Regole degli Hook

Per usare correttamente le funzioni di stato basate sugli Hook dobbiamo rispettare alcune limitazioni e [regole](https://react.dev/warnings/invalid-hook-call-warning#breaking-rules-of-hooks).

La funzione _useState_, così come _useEffect_ che introdurremo più avanti, <i>non deve essere chiamata</i> all'interno di cicli, espressioni condizionali o in punti diversi dalla funzione che definisce un componente. Gli Hook devono essere chiamati sempre nello stesso ordine; in caso contrario l'applicazione si comporterà in modo imprevedibile.

In sintesi, gli Hook possono essere chiamati soltanto nel corpo di una funzione che definisce un componente React:

```js
const App = () => {
  // queste chiamate sono corrette
  const [age, setAge] = useState(0)
  const [name, setName] = useState('Juha Tauriainen')

  if ( age > 10 ) {
    // questa chiamata non funziona
    const [foobar, setFoobar] = useState(null)
  }

  for ( let i = 0; i < age; i++ ) {
    // neppure questa è corretta
    const [rightWay, setRightWay] = useState(false)
  }

  const notGood = () => {
    // anche questa chiamata è vietata
    const [x, setX] = useState(-1000)
  }

  return (
    //...
  )
}
```

### Ancora sulla gestione degli eventi

Nelle precedenti edizioni del corso, la gestione degli eventi si è dimostrata un argomento difficile. Per questo la riprendiamo qui.

Supponiamo di sviluppare una semplice applicazione con il componente <i>App</i> seguente:

```js
const App = () => {
  const [value, setValue] = useState(10)

  return (
    <div>
      {value}
      <button>reset to zero</button>
    </div>
  )
}
```

Vogliamo che premendo il pulsante lo stato contenuto in _value_ venga azzerato.

Per far reagire il pulsante al click dobbiamo assegnargli un <i>gestore di eventi</i>.

Un gestore deve essere sempre una funzione o un riferimento a una funzione. Il pulsante non funziona se gli assegniamo una variabile di un altro tipo.

Se il gestore fosse una stringa:

```js
<button onClick="crap...">button</button>
```

React mostrerebbe un avviso nella console:

```js
index.js:2178 Warning: Expected `onClick` listener to be a function, instead got a value of `string` type.
    in button (at index.js:20)
    in div (at index.js:18)
    in App (at index.js:27)
```

Non funzionerebbe neppure questo tentativo:

```js
<button onClick={value + 1}>button</button>
```

Abbiamo assegnato al gestore _value + 1_, che restituisce semplicemente il risultato dell'operazione. React ci avvisa nella console:

```js
index.js:2178 Warning: Expected `onClick` listener to be a function, instead got a value of `number` type.
```

Anche il codice seguente non funziona:

```js
<button onClick={value = 0}>button</button>
```

Il gestore non è una funzione, ma un'assegnazione, e React mostra nuovamente un avviso. Inoltre, come sappiamo, in React non dobbiamo mai modificare direttamente lo stato.

Che cosa accade con questo codice?

```js
<button onClick={console.log('clicked the button')}>
  button
</button>
```

Il messaggio viene stampato una volta quando il componente è visualizzato, ma premendo il pulsante non succede nulla. Perché non funziona, anche se nel gestore compare una funzione come _console.log_?

Il problema è che abbiamo definito una <i>chiamata di funzione</i>. Al gestore viene quindi assegnato il valore restituito dalla chiamata, che nel caso di _console.log_ è <i>undefined</i>.

La chiamata viene eseguita durante il rendering del componente e per questo il messaggio appare una sola volta nella console.

Anche il tentativo seguente è errato:

```js
<button onClick={setValue(0)}>button</button>
```

Abbiamo assegnato ancora una volta una chiamata di funzione come gestore. Inoltre, durante il rendering viene eseguito _setValue(0)_, che provoca un nuovo rendering. Questo richiama di nuovo _setValue(0)_, producendo una ricorsione infinita.

Possiamo eseguire una funzione al click in questo modo:

```js
<button onClick={() => console.log('clicked the button')}>
  button
</button>
```

Il gestore è ora la funzione freccia _() => console.log('clicked the button')_. Durante il rendering non viene chiamata alcuna funzione: al gestore viene assegnato soltanto il riferimento alla funzione freccia. La chiamata avviene quando viene premuto il pulsante.

Con la stessa tecnica possiamo azzerare lo stato:

```js
<button onClick={() => setValue(0)}>button</button>
```

Il gestore è la funzione _() => setValue(0)_.

Definire i gestori direttamente negli attributi dei pulsanti non è sempre la soluzione migliore. Spesso vengono dichiarati separatamente. Nella versione seguente assegniamo una funzione alla variabile _handleClick_ nel corpo del componente:

```js
const App = () => {
  const [value, setValue] = useState(10)

  const handleClick = () =>
    console.log('clicked the button')

  return (
    <div>
      {value}
      <button onClick={handleClick}>button</button>
    </div>
  )
}
```

La variabile _handleClick_, che contiene il riferimento alla funzione, viene passata al pulsante come attributo <i>onClick</i>:

```js
<button onClick={handleClick}>button</button>
```

Naturalmente un gestore può contenere più istruzioni. In questo caso usiamo la forma estesa delle funzioni freccia con le parentesi graffe:

```js
const App = () => {
  const [value, setValue] = useState(10)

  // highlight-start
const handleClick = () => {
    console.log('clicked the button')
    setValue(0)
  }
   // highlight-end

  return (
    <div>
      {value}
      <button onClick={handleClick}>button</button>
    </div>
  )
}
```

### Una funzione che restituisce una funzione

Un altro modo per definire un gestore di eventi consiste nell'usare una <i>funzione che restituisce una funzione</i>.

Probabilmente non avrai bisogno di questa tecnica negli esercizi del corso. Se l'argomento ti sembra particolarmente confuso, puoi saltare per ora questa sezione e tornarvi più avanti.

Modifichiamo il codice così:

```js
const App = () => {
  const [value, setValue] = useState(10)

  // highlight-start
  const hello = () => {
    const handler = () => console.log('hello world')

    return handler
  }
  // highlight-end

  return (
    <div>
      {value}
      <button onClick={hello()}>button</button>
    </div>
  )
}
```

Il codice funziona correttamente, anche se sembra complicato.

Il gestore è ora impostato mediante una chiamata di funzione:

```js
<button onClick={hello()}>button</button>
```

In precedenza abbiamo affermato che un gestore non può essere una chiamata, ma deve essere una funzione o un riferimento a una funzione. Perché allora questo caso funziona?

Durante il rendering del componente viene eseguita la funzione seguente:

```js
const hello = () => {
  const handler = () => console.log('hello world')

  return handler
}
```

Il <i>valore restituito</i> è un'altra funzione, assegnata alla variabile _handler_.

Quando React elabora la riga

```js
<button onClick={hello()}>button</button>
```

assegna all'attributo <i>onClick</i> il valore restituito da _hello()_. In sostanza, la riga viene trasformata in:

```js
<button onClick={() => console.log('hello world')}>
  button
</button>
```

Poiché _hello_ restituisce una funzione, il gestore è effettivamente una funzione.

A che cosa serve questo meccanismo? Modifichiamo leggermente il codice:

```js
const App = () => {
  const [value, setValue] = useState(10)

  // highlight-start
  const hello = (who) => {
    const handler = () => {
      console.log('hello', who)
    }

    return handler
  }
  // highlight-end  

  return (
    <div>
      {value}
  // highlight-start      
      <button onClick={hello('world')}>button</button>
      <button onClick={hello('react')}>button</button>
      <button onClick={hello('function')}>button</button>
  // highlight-end      
    </div>
  )
}
```

L'applicazione contiene ora tre pulsanti i cui gestori sono creati dalla funzione parametrica _hello_.

Il primo pulsante è definito così:

```js
<button onClick={hello('world')}>button</button>
```

Il gestore viene creato <i>eseguendo</i> _hello('world')_, che restituisce:

```js
() => {
  console.log('hello', 'world')
}
```

Il secondo pulsante è definito così:

```js
<button onClick={hello('react')}>button</button>
```

La chiamata _hello('react')_ restituisce:

```js
() => {
  console.log('hello', 'react')
}
```

Ogni pulsante riceve quindi un gestore personalizzato.

Le funzioni che restituiscono funzioni permettono di definire comportamenti generici configurabili mediante parametri. Possiamo considerare _hello_ come una fabbrica che produce gestori personalizzati per salutare utenti diversi.

La definizione attuale è piuttosto prolissa:

```js
const hello = (who) => {
  const handler = () => {
    console.log('hello', who)
  }

  return handler
}
```

Eliminiamo la variabile di supporto restituendo direttamente la funzione creata:

```js
const hello = (who) => {
  return () => {
    console.log('hello', who)
  }
}
```

Poiché _hello_ contiene soltanto un'istruzione <i>return</i>, possiamo omettere le parentesi graffe e usare la forma abbreviata:

```js
const hello = (who) =>
  () => {
    console.log('hello', who)
  }
```

Infine, scriviamo entrambe le frecce sulla stessa riga:

```js
const hello = (who) => () => {
  console.log('hello', who)
}
```

Possiamo usare la stessa tecnica per creare gestori che assegnano un valore specifico allo stato:

```js
const App = () => {
  const [value, setValue] = useState(10)
  
  // highlight-start
  const setToValue = (newValue) => () => {
    console.log('value now', newValue)  // stampa il nuovo valore
    setValue(newValue)
  }
  // highlight-end
  
  return (
    <div>
      {value}
      // highlight-start
      <button onClick={setToValue(1000)}>thousand</button>
      <button onClick={setToValue(0)}>reset</button>
      <button onClick={setToValue(value + 1)}>increment</button>
      // highlight-end
    </div>
  )
}
```

Durante il rendering viene creato il pulsante <i>thousand</i>:

```js
<button onClick={setToValue(1000)}>thousand</button>
```

Il suo gestore è il valore restituito da _setToValue(1000)_, cioè:

```js
() => {
  console.log('value now', 1000)
  setValue(1000)
}
```

Il pulsante che incrementa il valore è dichiarato così:

```js
<button onClick={setToValue(value + 1)}>increment</button>
```

Il gestore viene creato da _setToValue(value + 1)_, che riceve il valore corrente dello stato aumentato di uno. Se _value_ vale 10, il gestore prodotto è:

```js
() => {
  console.log('value now', 11)
  setValue(11)
}
```

Non è indispensabile usare funzioni che restituiscono funzioni. Riportiamo _setToValue_ a una funzione normale:

```js
const App = () => {
  const [value, setValue] = useState(10)

  const setToValue = (newValue) => {
    console.log('value now', newValue)
    setValue(newValue)
  }

  return (
    <div>
      {value}
      <button onClick={() => setToValue(1000)}>
        thousand
      </button>
      <button onClick={() => setToValue(0)}>
        reset
      </button>
      <button onClick={() => setToValue(value + 1)}>
        increment
      </button>
    </div>
  )
}
```

Il gestore può ora essere una funzione che chiama _setToValue_ con il parametro opportuno. Per azzerare lo stato useremo:

```js
<button onClick={() => setToValue(0)}>reset</button>
```

La scelta tra i due modi presentati dipende soprattutto dalle preferenze personali.

### Passare i gestori di eventi ai componenti figli

Estraiamo il pulsante in un componente dedicato:

```js
const Button = (props) => (
  <button onClick={props.onClick}>
    {props.text}
  </button>
)
```

Il componente riceve il gestore dalla prop _onClick_ e il testo dalla prop _text_. Usiamolo nell'applicazione:

```js
const App = (props) => {
  // ...
  return (
    <div>
      {value}
      <Button onClick={() => setToValue(1000)} text="thousand" /> // highlight-line
      <Button onClick={() => setToValue(0)} text="reset" /> // highlight-line
      <Button onClick={() => setToValue(value + 1)} text="increment" /> // highlight-line
    </div>
  )
}
```

Usare <i>Button</i> è semplice, ma dobbiamo assicurarci di scegliere i nomi corretti degli attributi con cui passiamo le props:

![Uso dei nomi corretti per gli attributi](../../images/1/12f.png)

### Non definire componenti dentro altri componenti

Iniziamo a mostrare il valore dell'applicazione in un componente <i>Display</i>.

Modifichiamo l'applicazione definendo il nuovo componente all'interno di <i>App</i>:

```js
// Questo è il posto corretto in cui definire un componente
const Button = (props) => (
  <button onClick={props.onClick}>
    {props.text}
  </button>
)

const App = () => {
  const [value, setValue] = useState(10)

  const setToValue = newValue => {
    console.log('value now', newValue)
    setValue(newValue)
  }

  // Non definire componenti dentro un altro componente
  const Display = props => <div>{props.value}</div> // highlight-line

  return (
    <div>
      <Display value={value} /> // highlight-line
      <Button onClick={() => setToValue(1000)} text="thousand" />
      <Button onClick={() => setToValue(0)} text="reset" />
      <Button onClick={() => setToValue(value + 1)} text="increment" />
    </div>
  )
}
```

L'applicazione sembra ancora funzionare, ma **non realizzare mai i componenti in questo modo**. Definire un componente dentro un altro non offre vantaggi e causa soltanto problemi. React considera il componente interno come un "nuovo componente" a ogni rendering, rendendo impossibile ottimizzarlo.

Spostiamo <i>Display</i> nel posto corretto, all'esterno della funzione <i>App</i>:

```js
const Display = props => <div>{props.value}</div>

const Button = (props) => (
  <button onClick={props.onClick}>
    {props.text}
  </button>
)

const App = () => {
  const [value, setValue] = useState(10)

  const setToValue = newValue => {
    console.log('value now', newValue)
    setValue(newValue)
  }

  return (
    <div>
      <Display value={value} />
      <Button onClick={() => setToValue(1000)} text="thousand" />
      <Button onClick={() => setToValue(0)} text="reset" />
      <Button onClick={() => setToValue(value + 1)} text="increment" />
    </div>
  )
}
```

### Letture utili

Internet è pieno di materiale su React, ma noi utilizziamo lo stile moderno e gran parte di ciò che si trova online è ormai superato.

Possono essere utili i collegamenti seguenti:

- Vale la pena consultare la [documentazione ufficiale di React](https://react.dev/learn), anche se gran parte diventerà rilevante soltanto più avanti. Tutto ciò che riguarda i componenti basati su classi, invece, non ci interessa.
- Alcuni corsi di [Egghead.io](https://egghead.io), come [Start learning React](https://egghead.io/courses/start-learning-react), sono di buona qualità. Anche il più recente [Beginner's Guide to React](https://egghead.io/courses/the-beginner-s-guide-to-reactjs) è valido. Entrambi anticipano concetti che incontreremo nel corso. **Nota:** il primo usa componenti classe, il secondo componenti funzione moderni.

### Il giuramento del programmatore web

Programmare è difficile. Per questo, come sviluppatore, userò ogni mezzo disponibile per renderlo più semplice.

- Terrò sempre aperta la console degli strumenti per sviluppatori del browser.
- Procederò a piccoli passi, verificando a ogni passaggio che il codice funzioni.
- Scriverò molti _console.log_ per comprendere il comportamento del codice e individuare i problemi.
- Se il codice non funziona, non ne aggiungerò altro. Eliminerò invece codice finché non tornerà a funzionare oppure ripristinerò uno stato funzionante.
- Quando chiederò aiuto, formulerò correttamente la domanda. Consulta [questa sezione](/it/part0) per sapere come farlo.

### Uso dei modelli linguistici di grandi dimensioni

I modelli linguistici di grandi dimensioni, come [ChatGPT](https://chat.openai.com/auth/login), [Claude](https://claude.ai/) e [GitHub Copilot](https://github.com/features/copilot), si sono dimostrati molto utili nello sviluppo software.

Personalmente uso soprattutto GitHub Copilot, oggi [integrato direttamente in Visual Studio Code](https://code.visualstudio.com/docs/copilot/overview). Gli studenti universitari possono ottenere gratuitamente Copilot Pro tramite il [GitHub Student Developer Pack](https://education.github.com/pack).

Copilot può essere utile in molte situazioni. Per esempio, gli si può chiedere di generare codice per un file aperto descrivendo a parole la funzionalità desiderata:

![Richiesta a Copilot in Visual Studio Code](../../images/1/gpt1.png)

Se il codice sembra corretto, Copilot lo aggiunge al file:

![Codice aggiunto da Copilot](../../images/1/gpt2.png)

Nel nostro esempio Copilot ha creato soltanto un pulsante: il gestore _handleResetClick_ non è definito.

È possibile generare anche il gestore. Dopo aver scritto la prima riga della funzione, Copilot propone il resto del codice:

![Suggerimento di codice proposto da Copilot](../../images/1/gpt3.png)

Nella finestra di chat di Copilot si può chiedere una spiegazione del codice selezionato:

![Copilot spiega il funzionamento del codice selezionato](../../images/1/gpt4.png)

Copilot è utile anche per il debugging. Incollando un messaggio di errore nella chat si ottengono una spiegazione e una possibile correzione:

![Copilot spiega un errore e suggerisce una correzione](../../images/1/gpt5.png)

La chat consente inoltre di creare funzionalità più estese. Nell'immagine seguente Copilot realizza un componente di login usando l'Hook _useState_:

![Copilot crea su richiesta un componente di login](../../images/1/gpt6.png)

L'utilità di Copilot e degli altri modelli linguistici nella programmazione è variabile. Il problema principale è costituito dalle [allucinazioni](https://it.wikipedia.org/wiki/Allucinazione_(intelligenza_artificiale)): talvolta generano risposte apparentemente corrette ma completamente sbagliate. Nel codice gli errori vengono spesso scoperti rapidamente quando il programma non parte; tuttavia, del codice generato può funzionare inizialmente e nascondere errori logici o vulnerabilità di sicurezza.

Un'altra difficoltà è la comprensione dei progetti più grandi. I modelli possono non riuscire ad applicare modifiche coerenti a più file o a generalizzare il codice esistente. Se una nuova funzionalità potrebbe riutilizzare funzioni o componenti già disponibili, magari con piccoli adattamenti, il modello potrebbe ignorarli e produrre duplicati, peggiorando la qualità del progetto. Per approfondire, leggi [questo articolo](https://visualstudiomagazine.com/articles/2024/01/25/copilot-research.aspx).

Se scegli di utilizzare modelli linguistici durante la programmazione, ricorda che sei responsabile del loro output.

La loro rapida evoluzione pone gli studenti in una posizione difficile: vale ancora la pena, o è addirittura necessario, imparare a programmare in dettaglio quando sembra possibile ottenere quasi tutto già pronto?

Conviene ricordare la vecchia massima di [Brian Kernighan](https://en.wikipedia.org/wiki/Brian_Kernighan), coautore di <i>The C Programming Language</i>:

![Tutti sanno che il debugging è due volte più difficile della scrittura iniziale di un programma. Quindi, se lo scrivi usando tutta la tua intelligenza, come riuscirai mai a eseguirne il debug? — Brian Kernighan](../../images/1/kerningham.png)

In altre parole, poiché il debugging è due volte più difficile della programmazione, non conviene creare codice che si comprende appena. Come si potrebbe correggere un programma che lo sviluppatore non capisce perché ne ha affidato la scrittura a un modello linguistico?

Per ora i modelli e l'intelligenza artificiale non sono ancora autosufficienti e lasciano agli esseri umani i problemi più difficili. Anche gli sviluppatori alle prime armi devono quindi imparare a programmare molto bene. Non è escluso che, nonostante l'evoluzione dei modelli, servano conoscenze ancora più profonde: l'intelligenza artificiale svolge le operazioni semplici, mentre una persona deve risolvere i problemi più complessi, compresi quelli causati dall'IA. GitHub Copilot ha un nome appropriato: è un copilota che assiste il pilota principale. Il programmatore rimane il comandante e conserva la responsabilità finale.

Durante il corso potrebbe essere nel tuo interesse disattivare Copilot per impostazione predefinita e ricorrervi soltanto in caso di reale necessità.

</div>

<div class="tasks">

<h3>Esercizi 1.6-1.14</h3>

Per consegnare le soluzioni, pubblica prima il codice su GitHub e poi contrassegna gli esercizi completati nella scheda "my submissions" dell'[applicazione per le consegne](https://studies.cs.helsinki.fi/stats/courses/fullstackopen).

Ricorda di consegnare **tutti** gli esercizi di una parte **in un'unica soluzione**. Dopo aver consegnato una parte, **non potrai più aggiungervi altri esercizi**.

<i>Alcuni esercizi sviluppano la stessa applicazione. In questi casi è sufficiente consegnarne la versione finale. Se vuoi, puoi creare un commit al termine di ogni esercizio, ma non è obbligatorio.</i>

In alcune situazioni potrebbe essere necessario eseguire dalla radice del progetto il comando seguente:

```bash
rm -rf node_modules/ && npm i
```

Se, o meglio <i>quando</i>, incontrerai il messaggio di errore

> <i>Objects are not valid as a React child</i>

ricorda quanto spiegato [qui](/it/part1/introduzione_a_react#non-visualizzare-oggetti).

<h4>1.6: unicafe, passo 1</h4>

Come molte aziende, il ristorante per studenti [Unicafe](https://www.unicafe.fi) dell'Università di Helsinki raccoglie le opinioni dei propri clienti. Il tuo compito è realizzare un'applicazione web per raccogliere il feedback, che può essere soltanto <i>good</i>, <i>neutral</i> oppure <i>bad</i>.

L'applicazione deve mostrare il numero totale di feedback raccolti per ciascuna categoria. Il risultato finale potrebbe essere simile a questo:

![Pulsanti per lasciare un feedback](../../images/1/13e.png)

L'applicazione deve funzionare soltanto durante una singola sessione del browser. Quando la pagina viene aggiornata, i feedback raccolti possono scomparire.

È consigliabile usare la stessa struttura adottata nel materiale e negli esercizi precedenti. Il file <i>main.jsx</i> sarà:

```js
import ReactDOM from 'react-dom/client'

import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

Puoi usare il codice seguente come punto di partenza per <i>App.jsx</i>:

```js
import { useState } from 'react'

const App = () => {
  // salva le pressioni di ogni pulsante in uno stato separato
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  return (
    <div>
      code here
    </div>
  )
}

export default App
```

<h4>1.7: unicafe, passo 2</h4>

Estendi l'applicazione affinché mostri altre statistiche sui feedback: il numero totale, il punteggio medio (i valori sono: good 1, neutral 0 e bad -1) e la percentuale di feedback positivi.

![Media e percentuale di feedback positivi](../../images/1/14e.png)

<h4>1.8: unicafe, passo 3</h4>

Riorganizza l'applicazione estraendo la visualizzazione delle statistiche in un componente <i>Statistics</i>. Lo stato deve rimanere nel componente radice <i>App</i>.

Ricorda che i componenti non devono essere definiti all'interno di altri componenti:

```js
// un posto corretto in cui definire un componente
const Statistics = (props) => {
  // ...
}

const App = () => {
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  // non definire un componente dentro un altro componente
  const Statistics = (props) => {
    // ...
  }

  return (
    // ...
  )
}
```

<h4>1.9: unicafe, passo 4</h4>

Modifica l'applicazione affinché mostri le statistiche soltanto dopo che è stato raccolto almeno un feedback.

![Messaggio mostrato quando non esistono feedback](../../images/1/15e.png)

<h4>1.10: unicafe, passo 5</h4>

Continuiamo a riorganizzare l'applicazione. Estrai i due componenti seguenti:

- <i>Button</i> gestisce il funzionamento di ciascun pulsante per l'invio di un feedback.

- <i>StatisticLine</i> mostra una singola statistica, per esempio il punteggio medio.

Per chiarezza, <i>StatisticLine</i> mostra sempre una sola statistica; l'applicazione usa quindi più istanze del componente per visualizzarle tutte:

```js
const Statistics = (props) => {
  /// ...
  return(
    <div>
      <StatisticLine text="good" value={...} />
      <StatisticLine text="neutral" value={...} />
      <StatisticLine text="bad" value={...} />
      // ...
    </div>
  )
}

```

Lo stato dell'applicazione deve rimanere nel componente radice <i>App</i>.

<h4>1.11*: unicafe, passo 6</h4>

Mostra le statistiche in una [tabella](https://developer.mozilla.org/it/docs/Learn/HTML/Tables/Basics) HTML, in modo che l'applicazione assomigli approssimativamente a questa:

![Tabella contenente le statistiche](../../images/1/16e.png)

Ricorda di tenere sempre aperta la console. Se vi compare questo avviso:

![Avviso nella console](../../images/1/17a.png)

apporta le modifiche necessarie per farlo scomparire. Se non sai come procedere, prova a incollare il messaggio in un motore di ricerca.

<i>L'errore _Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist._ è spesso causato da un'estensione di Chrome. Apri _chrome://extensions/_, disabilita le estensioni una alla volta e aggiorna la pagina dell'applicazione React: a un certo punto l'errore dovrebbe scomparire.</i>

**Da questo momento assicurati che la console non contenga alcun avviso.**

<h4>1.12*: anecdotes, passo 1</h4>

Il mondo dell'ingegneria del software è ricco di [aforismi](http://www.comp.nus.edu.sg/~damithch/pages/SE-quotes.htm) che condensano in poche parole verità senza tempo sul nostro settore.

Estendi l'applicazione seguente aggiungendo un pulsante che mostri un aforisma <i>casuale</i> sull'ingegneria del software:

```js
import { useState } from 'react'

const App = () => {
  const anecdotes = [
    'If it hurts, do it more often.',
    'Adding manpower to a late software project makes it later!',
    'The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Premature optimization is the root of all evil.',
    'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.',
    'Programming without an extremely heavy use of console.log is same as if a doctor would refuse to use x-rays or blood tests when diagnosing patients.',
    'The only way to go fast, is to go well.'
  ]
   
  const [selected, setSelected] = useState(0)

  return (
    <div>
      {anecdotes[selected]}
    </div>
  )
}

export default App
```

Il contenuto di <i>main.jsx</i> è uguale a quello degli esercizi precedenti.

Scopri come generare numeri casuali in JavaScript, per esempio usando un motore di ricerca o il [Mozilla Developer Network](https://developer.mozilla.org). Ricorda che puoi fare esperimenti direttamente nella console del browser.

L'applicazione completata potrebbe essere simile a questa:

![Aforisma casuale con il pulsante next](../../images/1/18a.png)

<h4>1.13*: anecdotes, passo 2</h4>

Estendi l'applicazione affinché sia possibile votare l'aforisma visualizzato.

![Applicazione con il pulsante per votare](../../images/1/19a.png)

**Nota:** conserva i voti di ogni aforisma in un array o in un oggetto nello stato del componente. Ricorda che per aggiornare strutture dati complesse come oggetti e array bisogna creare una copia dello stato.

Puoi copiare un oggetto così:

```js
const votes = { 0: 1, 1: 3, 2: 4, 3: 2 }

const copy = { ...votes }
// incrementa di uno il valore della proprietà 2
copy[2] += 1     
```

Oppure puoi copiare un array così:

```js
const votes = [1, 4, 6, 3]

const copy = [...votes]
// incrementa di uno il valore nella posizione 2
copy[2] += 1     
```

In questo caso un array potrebbe essere la scelta più semplice. Cercando online troverai molti suggerimenti su come [creare un array della lunghezza desiderata riempito di zeri](https://stackoverflow.com/questions/20222501/how-to-create-a-zero-filled-javascript-array-of-arbitrary-length/22209781).

<h4>1.14*: anecdotes, passo 3</h4>

Realizza la versione finale dell'applicazione, che mostra l'aforisma con il maggior numero di voti:

![Aforisma con il maggior numero di voti](../../images/1/20a.png)

Se più aforismi si trovano a pari merito al primo posto, è sufficiente mostrarne uno.

Questo era l'ultimo esercizio della parte. È il momento di pubblicare il codice su GitHub e contrassegnare tutti gli esercizi completati nella scheda "my submissions" dell'[applicazione per le consegne](https://studies.cs.helsinki.fi/stats/courses/fullstackopen).

</div>
