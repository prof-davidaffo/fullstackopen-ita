---
mainImage: ../../../images/part-1.svg
part: 1
letter: a
lang: it
---

<div class="content">

Iniziamo a conoscere quello che probabilmente è l'argomento più importante del corso: la libreria [React](https://react.dev/). Creeremo una semplice applicazione React e, nel frattempo, ne studieremo i concetti fondamentali.

Il modo più semplice per cominciare è utilizzare uno strumento chiamato [Vite](https://vitejs.dev/).

Creiamo una nuova applicazione con lo strumento <i>create-vite</i>:

```bash
npm create vite@latest
```

Rispondiamo alle domande come mostrato nell'immagine:

![Selezione di create-vite: il progetto si chiama part1, il framework è React, la variante è JavaScript e alle altre domande si risponde No](../../images/1/1-create-vite.png)

Abbiamo creato un'applicazione chiamata <i>part1</i>. Se avessimo risposto "Yes" alla domanda "Install with npm and start now?", lo strumento avrebbe potuto installare automaticamente le dipendenze necessarie e avviare l'applicazione. Eseguiremo invece questi passaggi manualmente, per vedere come funzionano.

Entriamo nella cartella dell'applicazione e installiamo le librerie necessarie:

```bash
cd part1
npm install
```

Avviamo l'applicazione così:

```bash
npm run dev
```

La console indica che l'applicazione è stata avviata sulla porta 5173 di localhost, cioè all'indirizzo <http://localhost:5173/>:

![Console che mostra Vite in esecuzione su localhost alla porta 5173](../../images/1/1-vite1.png)

Per [impostazione predefinita](https://vitejs.dev/config/server-options.html#server-port), Vite usa la porta 5173. Se è occupata, utilizza la prima porta libera successiva.

Apri il browser e un editor di testo, in modo da vedere contemporaneamente il codice e la pagina web:

![Pagina iniziale di Vite e struttura dei file in VS Code](../../images/1/1-vite4.png)

Il codice dell'applicazione si trova nella cartella <i>src</i>. Semplifichiamo il codice generato facendo in modo che il file <i>main.jsx</i> contenga:

```js
import ReactDOM from 'react-dom/client'

import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

e che il file <i>App.jsx</i> contenga:

```js
const App = () => {
  return (
    <div>
      <p>Hello world</p>
    </div>
  )
}

export default App
```

I file <i>App.css</i> e <i>index.css</i> e la cartella <i>assets</i> possono essere eliminati: per ora non servono.

### Componenti

Il file <i>App.jsx</i> definisce ora un [componente React](https://react.dev/learn/your-first-component) chiamato <i>App</i>. Il comando nell'ultima riga di <i>main.jsx</i>

```js
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

visualizza il suo contenuto nell'elemento <i>div</i> con valore <i>id</i> uguale a `root`, definito nel file <i>index.html</i>.

Per impostazione predefinita, <i>index.html</i> non contiene markup HTML visibile nel browser:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>part1</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Puoi provare ad aggiungere del codice HTML al file. Con React, tuttavia, tutto ciò che deve essere visualizzato viene normalmente definito mediante componenti React.

Esaminiamo più attentamente il codice che definisce il componente:

```js
const App = () => (
  <div>
    <p>Hello world</p>
  </div>
)
```

Come probabilmente hai intuito, il componente viene visualizzato come un tag <i>div</i> che contiene un tag <i>p</i> con il testo <i>Hello world</i>.

Tecnicamente il componente è definito come una funzione JavaScript. Quella seguente è una funzione che non riceve parametri:

```js
() => (
  <div>
    <p>Hello world</p>
  </div>
)
```

La funzione viene assegnata alla variabile costante <i>App</i>:

```js
const App = ...
```

Esistono diversi modi per definire una funzione in JavaScript. Qui useremo le [funzioni freccia](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Functions/Arrow_functions), introdotte nella versione di JavaScript chiamata [ECMAScript 6](https://262.ecma-international.org/6.0/index.html), o ES6.

Poiché la funzione contiene una sola espressione, abbiamo usato una forma abbreviata equivalente a questo codice:

```js
const App = () => {
  return (
    <div>
      <p>Hello world</p>
    </div>
  )
}
```

In altre parole, la funzione restituisce il valore dell'espressione.

La funzione che definisce il componente può contenere qualsiasi codice JavaScript. Modifica il componente nel modo seguente:

```js
const App = () => {
  console.log('Hello from component')
  return (
    <div>
      <p>Hello world</p>
    </div>
  )
}

export default App
```

e osserva che cosa appare nella console del browser:

![Console del browser con il messaggio Hello from component](../../images/1/30.png)

La prima regola dello sviluppo frontend è:

> <i>tieni sempre aperta la console</i>

Ripetiamolo insieme: <i>prometto di tenere sempre aperta la console</i> durante questo corso e, in futuro, ogni volta che svilupperò applicazioni web.

All'interno di un componente è possibile visualizzare anche contenuto dinamico.

Modifica il componente così:

```js
const App = () => {
  const now = new Date()
  const a = 10
  const b = 20
  console.log(now, a+b)

  return (
    <div>
      <p>Hello world, it is {now.toString()}</p>
      <p>
        {a} plus {b} is {a + b}
      </p>
    </div>
  )
}
```

Il codice JavaScript racchiuso tra parentesi graffe viene valutato e il risultato viene inserito nella posizione corrispondente dell'HTML prodotto dal componente.

Non eliminare la riga alla fine del file:

```js
export default App
```

Nella maggior parte degli esempi del materiale l'esportazione non viene mostrata. Senza di essa, però, il componente e l'intera applicazione smettono di funzionare.

Hai mantenuto la promessa di lasciare aperta la console? Che cosa vi è stato stampato?

### JSX

I componenti React sembrano restituire markup HTML, ma non è così. La loro struttura è scritta principalmente in [JSX](https://react.dev/learn/writing-markup-with-jsx). Anche se assomiglia all'HTML, JSX è un modo per scrivere JavaScript: dietro le quinte, il JSX restituito dai componenti viene compilato in JavaScript.

Dopo la compilazione, la nostra applicazione assomiglia a questa:

```js
const App = () => {
  const now = new Date()
  const a = 10
  const b = 20
  return React.createElement(
    'div',
    null,
    React.createElement(
      'p', null, 'Hello world, it is ', now.toString()
    ),
    React.createElement(
      'p', null, a, ' plus ', b, ' is ', a + b
    )
  )
}
```

La compilazione è gestita da [Babel](https://babeljs.io/repl/). I progetti creati con <i>Vite</i> sono già configurati per compilarlo automaticamente. Approfondiremo l'argomento nella [parte 7](/en/part7).

È possibile scrivere React anche in "JavaScript puro", senza JSX, ma nessuno con un minimo di buon senso lo farebbe.

In pratica JSX è molto simile all'HTML, con la differenza che permette di inserire facilmente contenuto dinamico scrivendo codice JavaScript tra parentesi graffe. L'idea ricorda molti linguaggi di templating eseguiti sul server, come Thymeleaf con Java Spring.

JSX è simile a [XML](https://developer.mozilla.org/it/docs/Web/XML/XML_introduction): ogni tag deve essere chiuso. Per esempio, in HTML un'interruzione di riga è un elemento vuoto che può essere scritto così:

```html
<br>
```

In JSX il tag deve invece essere chiuso:

```html
<br />
```

### Più componenti

Modifichiamo <i>App.jsx</i> come segue:

```js
// highlight-start
const Hello = () => {
  return (
    <div>
      <p>Hello world</p>
    </div>
  )
}
// highlight-end

const App = () => {
  return (
    <div>
      <h1>Greetings</h1>
      <Hello /> // highlight-line
    </div>
  )
}
```

Abbiamo definito un nuovo componente <i>Hello</i> e lo abbiamo usato all'interno del componente <i>App</i>. Naturalmente, uno stesso componente può essere utilizzato più volte:

```js
const App = () => {
  return (
    <div>
      <h1>Greetings</h1>
      <Hello />
      // highlight-start
      <Hello />
      <Hello />
      // highlight-end
    </div>
  )
}
```

**Nota:** in questi esempi, e nei successivi, l'istruzione <em>export</em> alla fine del file viene omessa. Perché il codice funzioni continua comunque a essere necessaria.

Scrivere componenti con React è semplice e, combinandoli, anche un'applicazione complessa può rimanere relativamente facile da gestire. Una filosofia fondamentale di React consiste proprio nel comporre le applicazioni con molti componenti specializzati e riutilizzabili.

Un'altra convenzione importante prevede un <i>componente radice</i> chiamato <i>App</i>, posto in cima all'albero dei componenti. Come vedremo nella [parte 6](/en/part6), esistono tuttavia casi in cui <i>App</i> non è esattamente la radice, ma viene racchiuso in un opportuno componente di supporto.

### Props: passare dati ai componenti

È possibile passare dati ai componenti attraverso le cosiddette [props](https://react.dev/learn/passing-props-to-a-component).

Modifichiamo <i>Hello</i> così:

```js
const Hello = (props) => { // highlight-line
  return (
    <div>
      <p>Hello {props.name}</p> // highlight-line
    </div>
  )
}
```

La funzione che definisce il componente ha ora un parametro chiamato <i>props</i>. Come argomento riceve un oggetto i cui campi corrispondono a tutte le props definite da chi utilizza il componente.

Le props vengono definite così:

```js
const App = () => {
  return (
    <div>
      <h1>Greetings</h1>
      <Hello name='George' /> // highlight-line
      <Hello name='Daisy' /> // highlight-line
    </div>
  )
}
```

Il numero di props è libero e i loro valori possono essere stringhe scritte direttamente oppure risultati di espressioni JavaScript. Quando il valore deriva da JavaScript, deve essere racchiuso tra parentesi graffe.

Modifichiamo il codice affinché <i>Hello</i> utilizzi due props:

```js
const Hello = (props) => {
  console.log(props) // highlight-line
  return (
    <div>
      <p>
        Hello {props.name}, you are {props.age} years old // highlight-line
      </p>
    </div>
  )
}

const App = () => {
  const name = 'Peter' // highlight-line
  const age = 10       // highlight-line

  return (
    <div>
      <h1>Greetings</h1>
      <Hello name='Maya' age={26 + 10} /> // highlight-line
      <Hello name={name} age={age} />     // highlight-line
    </div>
  )
}
```

Le props inviate da <i>App</i> sono i valori delle variabili, il risultato dell'espressione di somma e una normale stringa.

Il componente <i>Hello</i> stampa inoltre nella console il valore dell'oggetto props.

Spero davvero che la console fosse aperta. Se non lo era, ricorda la promessa:

> <i>prometto di tenere sempre aperta la console durante questo corso e, in futuro, ogni volta che svilupperò applicazioni web</i>

Sviluppare software è difficile e lo diventa ancora di più se non si usano tutti gli strumenti disponibili, come la console del browser e le stampe di debug con <i>console.log</i>. I professionisti li utilizzano <i>continuamente</i>: non c'è alcun motivo perché un principiante rinunci a strumenti così utili.

### Un possibile messaggio di errore

Se nel progetto è installata la versione 18 o una versione precedente di React, a questo punto potresti vedere il seguente messaggio:

![VS Code mostra l'avviso ESLint name is missing in props validation](../../images/1/1-vite5.png)

Non è un vero errore, ma un avviso prodotto da [ESLint](https://eslint.org/). Puoi disattivare la regola [react/prop-types](https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prop-types.md) aggiungendo la riga seguente a <i>eslint.config.js</i>:

```js
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
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/prop-types': 0, // highlight-line
    },
  },
]
```

Conosceremo ESLint più nel dettaglio nella [parte 3](/en/part3/validation_and_es_lint#lint).

### Alcune osservazioni

React è configurato per generare messaggi di errore piuttosto chiari. Nonostante questo, soprattutto all'inizio, conviene procedere a **passi molto piccoli** e verificare che ogni modifica funzioni come previsto.

**La console deve rimanere sempre aperta.** Se il browser segnala un errore, non continuare a scrivere altro codice sperando in un miracolo. Cerca invece di comprenderne la causa e, per esempio, torna all'ultima versione funzionante:

![Errore causato da una prop non definita](../../images/1/1-vite6.png)

Come abbiamo già ricordato, programmando con React è possibile e utile inserire nel codice istruzioni <em>console.log()</em> che stampano informazioni nella console.

Ricorda inoltre che **la prima lettera del nome di un componente React deve essere maiuscola**. Se definisci un componente così:

```js
const footer = () => {
  return (
    <div>
      greeting app created by <a href='https://github.com/mluukkai'>mluukkai</a>
    </div>
  )
}
```

e lo utilizzi in questo modo:

```js
const App = () => {
  return (
    <div>
      <h1>Greetings</h1>
      <Hello name='Maya' age={26 + 10} />
      <footer /> // highlight-line
    </div>
  )
}
```

la pagina non visualizza il contenuto definito nel componente footer. React crea invece un elemento [footer](https://developer.mozilla.org/it/docs/Web/HTML/Element/footer) vuoto, cioè l'elemento HTML incorporato che ha lo stesso nome. Rendendo maiuscola la prima lettera, React crea il <i>div</i> definito dal componente <i>Footer</i> e lo visualizza nella pagina.

Il contenuto di un componente React deve normalmente avere **un solo elemento radice**. Se, per esempio, proviamo a definire <i>App</i> senza il <i>div</i> più esterno:

```js
const App = () => {
  return (
    <h1>Greetings</h1>
    <Hello name='Maya' age={26 + 10} />
    <Footer />
  )
}
```

otteniamo un messaggio di errore.

![Errore dovuto a più elementi radice](../../images/1/1-vite7.png)

Un elemento radice non è l'unica soluzione possibile. Anche un <i>array</i> di componenti è valido:

```js
const App = () => {
  return [
    <h1>Greetings</h1>,
    <Hello name='Maya' age={26 + 10} />,
    <Footer />
  ]
}
```

Questa soluzione non è però particolarmente adatta al componente radice dell'applicazione e rende il codice poco elegante.

L'obbligo di un elemento radice può introdurre <i>div</i> superflui nell'albero DOM. Possiamo evitarli usando i [fragment](https://react.dev/reference/react/Fragment), cioè racchiudendo gli elementi restituiti dal componente in un tag vuoto:

```js
const App = () => {
  const name = 'Peter'
  const age = 10

  return (
    <>
      <h1>Greetings</h1>
      <Hello name='Maya' age={26 + 10} />
      <Hello name={name} age={age} />
      <Footer />
    </>
  )
}
```

Il codice ora viene compilato correttamente e il DOM generato da React non contiene più il <i>div</i> aggiuntivo.

### Non visualizzare oggetti

Consideriamo un'applicazione che mostra nomi ed età dei nostri amici:

```js
const App = () => {
  const friends = [
    { name: 'Peter', age: 4 },
    { name: 'Maya', age: 10 },
  ]

  return (
    <div>
      <p>{friends[0]}</p>
      <p>{friends[1]}</p>
    </div>
  )
}

export default App
```

Sullo schermo, però, non appare nulla. Dopo avere cercato inutilmente il problema nel codice per quindici minuti, finalmente ricordiamo la promessa:

> <i>prometto di tenere sempre aperta la console durante questo corso e, in futuro, ogni volta che svilupperò applicazioni web</i>

La console mostra un errore in rosso:

![DevTools mostra l'errore Objects are not valid as a React child](../../images/1/34new.png)

Il punto essenziale è <i>Objects are not valid as a React child</i>: l'applicazione tenta di visualizzare degli <i>oggetti</i> e non può farlo.

Il codice prova a mostrare i dati di un amico così:

```js
<p>{friends[0]}</p>
```

Questo causa un problema perché il valore tra parentesi graffe è un oggetto:

```js
{ name: 'Peter', age: 4 }
```

I singoli valori visualizzati tra parentesi graffe in React devono essere primitivi, per esempio numeri o stringhe.

La correzione è la seguente:

```js
const App = () => {
  const friends = [
    { name: 'Peter', age: 4 },
    { name: 'Maya', age: 10 },
  ]

  return (
    <div>
      <p>{friends[0].name} {friends[0].age}</p>
      <p>{friends[1].name} {friends[1].age}</p>
    </div>
  )
}

export default App
```

Ora il nome dell'amico viene visualizzato separatamente:

```js
{friends[0].name}
```

e lo stesso avviene per l'età:

```js
{friends[0].age}
```

Dopo aver corretto l'errore, cancella i messaggi dalla console premendo 🚫, ricarica la pagina e verifica che non compaiano altri errori.

Un'ultima osservazione: React permette anche di visualizzare direttamente un array, <i>se</i> contiene valori adatti al rendering, come numeri o stringhe. Il programma seguente funziona, anche se il risultato potrebbe non essere quello desiderato:

```js
const App = () => {
  const friends = [ 'Peter', 'Maya']

  return (
    <div>
      <p>{friends}</p>
    </div>
  )
}
```

In questa parte non conviene ancora tentare di visualizzare direttamente gli array: torneremo sull'argomento nella parte successiva.

</div>

<div class="tasks">
  <h3>Esercizi 1.1-1.2</h3>

Questa parte contiene [altri esercizi](/en/part1/a_more_complex_state_debugging_react_apps#exercises-1-6-1-14) oltre a quelli riportati qui sotto.

Organizza i progetti in cartelle con nomi chiari, distinguendo le parti e le applicazioni.

Una possibile struttura è questa:

```text
part0
part1
  courseinfo
  unicafe
  anecdotes
part2
  phonebook
  countries
```

Ogni parte del corso ha una propria cartella, suddivisa a sua volta nelle cartelle delle diverse serie di esercizi, come <i>unicafe</i> nella parte 1.

  <h4>1.1: Informazioni sui corsi, passo 1</h4>

Usa Vite per inizializzare una nuova applicazione. Modifica <i>main.jsx</i> nel modo seguente:

```js
import ReactDOM from 'react-dom/client'

import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

e <i>App.jsx</i> così:

```js
const App = () => {
  const course = 'Half Stack application development'
  const part1 = 'Fundamentals of React'
  const exercises1 = 10
  const part2 = 'Using props to pass data'
  const exercises2 = 7
  const part3 = 'State of a component'
  const exercises3 = 14

  return (
    <div>
      <h1>{course}</h1>
      <p>
        {part1} {exercises1}
      </p>
      <p>
        {part2} {exercises2}
      </p>
      <p>
        {part3} {exercises3}
      </p>
      <p>Number of exercises {exercises1 + exercises2 + exercises3}</p>
    </div>
  )
}

export default App
```

Elimina i file superflui <i>App.css</i> e <i>index.css</i> e anche la cartella <i>assets</i>.

Al momento l'intera applicazione è racchiusa nello stesso componente. Riorganizza il codice introducendo tre componenti: <i>Header</i>, <i>Content</i> e <i>Total</i>. Tutti i dati rimangono in <i>App</i>, che passa a ciascun componente quelli necessari mediante le <i>props</i>. <i>Header</i> visualizza il nome del corso, <i>Content</i> le parti e il relativo numero di esercizi, mentre <i>Total</i> mostra il numero totale degli esercizi.

Definisci i nuovi componenti nel file <i>App.jsx</i>.

Il corpo di <i>App</i> sarà all'incirca così:

```js
const App = () => {
  // const-definitions

  return (
    <div>
      <Header course={course} />
      <Content ... />
      <Total ... />
    </div>
  )
}
```

**ATTENZIONE:** non provare a programmare tutti i componenti contemporaneamente, perché quasi certamente romperesti l'intera applicazione. Procedi a piccoli passi: crea prima, per esempio, <i>Header</i> e passa al componente successivo soltanto quando sei certo che funzioni.

Procedere con attenzione e per piccoli passi può sembrare lento, ma in realtà è <i>di gran lunga il modo più veloce</i>. Il celebre sviluppatore Robert "Uncle Bob" Martin ha affermato:

> <i>"The only way to go fast, is to go well"</i>

Secondo Martin, dunque, procedere bene e con cautela è l'unico modo per essere veloci.

<h4>1.2: Informazioni sui corsi, passo 2</h4>

Riorganizza <i>Content</i> affinché non visualizzi direttamente i nomi delle parti né il numero dei relativi esercizi. Deve invece visualizzare tre componenti <i>Part</i>, ognuno responsabile del nome e del numero di esercizi di una parte:

```js
const Content = ... {
  return (
    <div>
      <Part .../>
      <Part .../>
      <Part .../>
    </div>
  )
}
```

Al momento l'applicazione passa le informazioni in modo piuttosto rudimentale, basandosi su singole variabili. Sistemeremo questo aspetto nella [parte 2](/en/part2); prima, però, passiamo alla sezione 1b per approfondire JavaScript.

</div>
