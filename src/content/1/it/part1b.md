---
mainImage: ../../../images/part-1.svg
part: 1
letter: b
lang: it
---

<div class="content">

Durante il corso dovremo imparare, oltre allo sviluppo web, una quantità sufficiente di JavaScript.

JavaScript si è evoluto rapidamente negli ultimi anni e in questo corso useremo funzionalità appartenenti alle versioni più recenti. Il nome ufficiale dello standard JavaScript è [ECMAScript](https://it.wikipedia.org/wiki/ECMAScript). Al momento, la versione più recente è quella pubblicata nel giugno 2025 con il nome [ECMAScript® 2025](https://www.ecma-international.org/ecma-262/), conosciuta anche come ES16.

I browser non supportano ancora tutte le funzionalità più nuove di JavaScript. Per questo motivo, molto codice eseguito nei browser viene <i>transpilato</i> da una versione recente di JavaScript a una versione precedente e più compatibile.

Oggi lo strumento più diffuso per la transpilazione è [Babel](https://babeljs.io/). Nelle applicazioni React create con Vite la transpilazione è configurata automaticamente. Ne esamineremo più attentamente la configurazione nella [parte 7](/en/part7) del corso.

[Node.js](https://nodejs.org/en/) è un ambiente di esecuzione JavaScript basato sul motore [Chrome V8](https://developers.google.com/v8/) di Google e funziona praticamente ovunque, dai server ai telefoni cellulari. Esercitiamoci a scrivere JavaScript usando Node. Le versioni più recenti di Node comprendono già le versioni più nuove di JavaScript, quindi il codice non deve essere transpilato.

Il codice viene scritto in file con estensione <i>.js</i>, eseguiti con il comando <em>node nome_del_file.js</em>.

È anche possibile scrivere JavaScript nella console di Node.js, che si apre digitando _node_ dalla riga di comando, oppure nella console degli strumenti per sviluppatori del browser. [Le versioni più recenti di Chrome gestiscono piuttosto bene le nuove funzionalità di JavaScript](https://compat-table.github.io/compat-table/es2016plus/) senza bisogno di transpilazione. In alternativa si può utilizzare uno strumento come [JS Bin](https://jsbin.com/?js,console).

Per nome e sintassi JavaScript può ricordare Java, ma i meccanismi fondamentali dei due linguaggi sono profondamente diversi. Per chi proviene da Java, il comportamento di JavaScript può sembrare insolito, soprattutto se non si dedica tempo a studiarne le caratteristiche.

In alcuni ambienti è stato popolare tentare di "simulare" in JavaScript funzionalità e design pattern propri di Java. Non lo consigliamo: i due linguaggi e i rispettivi ecosistemi sono molto diversi.

### Variabili

JavaScript offre diversi modi per definire le variabili:

```js
const x = 1
let y = 5

console.log(x, y)   // stampa 1 5
y += 10
console.log(x, y)   // stampa 1 15
y = 'sometext'
console.log(x, y)   // stampa 1 sometext
x = 4               // provoca un errore
```

[const](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Statements/const) non definisce una variabile, ma una <i>costante</i> il cui valore non può più essere riassegnato. [let](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Statements/let), invece, definisce una normale variabile.

L'esempio mostra anche che il tipo di dato di una variabile può cambiare durante l'esecuzione. All'inizio _y_ contiene un numero intero; alla fine contiene una stringa.

In JavaScript è possibile definire variabili anche con la parola chiave [var](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Statements/var). Per molto tempo è stato l'unico modo disponibile; <i>const</i> e <i>let</i> sono stati introdotti nel 2015 con ES6. In alcune situazioni <i>var</i> si comporta diversamente dalle dichiarazioni di variabili della maggior parte dei linguaggi. Per approfondire, consulta [JavaScript Variables - Should You Use let, var or const?](https://medium.com/craft-academy/javascript-variables-should-you-use-let-var-or-const-394f7645c88f) oppure [Keyword: var vs. let](http://www.jstips.co/en/javascript/keyword-var-vs-let/). Durante questo corso è sconsigliato usare <i>var</i>: utilizza <i>const</i> e <i>let</i>.

Puoi trovare altro materiale sull'argomento anche su YouTube, per esempio [var, let and const - ES6 JavaScript Features](https://youtu.be/sjyJBL5fkp8).

### Array

Ecco un [array](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Array) e alcuni esempi del suo utilizzo:

```js
const t = [1, -1, 3]

t.push(5)

console.log(t.length) // stampa 4
console.log(t[1])     // stampa -1

t.forEach(value => {
  console.log(value)  // stampa i numeri 1, -1, 3 e 5, uno per riga
})
```

È importante notare che, anche se una variabile dichiarata con <i>const</i> non può essere riassegnata a un altro valore, il contenuto dell'oggetto a cui fa riferimento può comunque essere modificato. La dichiarazione <i>const</i> rende immutabile il riferimento, non i dati a cui esso punta. È come cambiare i mobili all'interno di una casa senza cambiarne l'indirizzo.

Un modo per scorrere gli elementi dell'array è usare <i>forEach</i>, come nell'esempio. <i>forEach</i> riceve come parametro una <i>funzione</i> definita con la sintassi a freccia:

```js
value => {
  console.log(value)
}
```

<i>forEach</i> chiama la funzione <i>per ogni elemento dell'array</i>, passandole ogni volta il singolo elemento come argomento. La funzione fornita a <i>forEach</i> può ricevere anche [altri argomenti](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach).

Nell'esempio precedente abbiamo aggiunto un elemento all'array con il metodo [push](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Array/push). Con React si usano spesso tecniche proprie della programmazione funzionale, tra cui l'impiego di strutture dati [immutabili](https://it.wikipedia.org/wiki/Oggetto_immutabile). Nel codice React è preferibile usare [concat](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Array/concat), che crea un nuovo array contenente anche l'elemento aggiunto e lascia invariato quello originale.

```js
const t = [1, -1, 3]

const t2 = t.concat(5)  // crea un nuovo array

console.log(t)  // stampa [1, -1, 3]
console.log(t2) // stampa [1, -1, 3, 5]
```

La chiamata <i>t.concat(5)</i> non aggiunge un elemento al vecchio array, ma ne restituisce uno nuovo che contiene sia gli elementi originali sia quello aggiunto.

Gli array dispongono di molti metodi utili. Vediamo un breve esempio del metodo [map](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Array/map):

```js
const t = [1, 2, 3]

const m1 = t.map(value => value * 2)
console.log(m1)   // stampa [2, 4, 6]
```

Partendo dal vecchio array, <i>map</i> crea un <i>nuovo array</i>. Gli elementi vengono prodotti dalla funzione passata come parametro; in questo esempio ogni valore originale viene moltiplicato per due.

<i>map</i> può anche trasformare l'array in qualcosa di completamente diverso:

```js
const m2 = t.map(value => '<li>' + value + '</li>')
console.log(m2)
// stampa [ '<li>1</li>', '<li>2</li>', '<li>3</li>' ]
```

Qui un array di numeri interi viene trasformato in un array di stringhe HTML. Nella [parte 2](/en/part2) vedremo che <i>map</i> viene usato molto spesso con React.

I singoli elementi di un array possono essere assegnati facilmente a variabili mediante l'[assegnamento per destrutturazione](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment):

```js
const t = [1, 2, 3, 4, 5]

const [first, second, ...rest] = t

console.log(first, second)  // stampa 1 2
console.log(rest)           // stampa [3, 4, 5]
```

La variabile _first_ riceve il primo numero dell'array e _second_ il secondo. La variabile _rest_ "raccoglie" i valori rimanenti in un proprio array.

### Oggetti

Esistono diversi modi per definire oggetti in JavaScript. Uno dei più comuni consiste nell'usare gli [object literal](https://developer.mozilla.org/it/docs/Web/JavaScript/Guide/Grammar_and_types#object_literals), elencandone le proprietà tra parentesi graffe:

```js
const object1 = {
  name: 'Arto Hellas',
  age: 35,
  education: 'PhD',
}

const object2 = {
  name: 'Full Stack web application development',
  level: 'intermediate studies',
  size: 5,
}

const object3 = {
  name: {
    first: 'Dan',
    last: 'Abramov',
  },
  grades: [2, 3, 5, 3],
  department: 'Stanford University',
}
```

I valori delle proprietà possono essere di qualsiasi tipo: numeri interi, stringhe, array, oggetti e così via.

Si accede alle proprietà di un oggetto con la notazione a punto oppure con le parentesi quadre:

```js
console.log(object1.name)          // stampa Arto Hellas
const fieldName = 'age'
console.log(object1[fieldName])    // stampa 35
```

È inoltre possibile aggiungere proprietà a un oggetto in qualsiasi momento usando entrambe le notazioni:

```js
object1.address = 'Helsinki'
object1['secret number'] = 12341
```

La seconda proprietà deve essere aggiunta con le parentesi quadre perché, a causa dello spazio, <i>secret number</i> non è un nome di proprietà valido per la notazione a punto.

Naturalmente gli oggetti JavaScript possono avere anche metodi. Durante il corso, tuttavia, non avremo bisogno di definire oggetti dotati di metodi propri; per questo ne parleremo soltanto brevemente.

Gli oggetti possono essere definiti anche mediante le cosiddette funzioni costruttrici, ottenendo un meccanismo che ricorda le classi di altri linguaggi, come Java. Nonostante la somiglianza, JavaScript non possiede classi nello stesso senso dei linguaggi orientati agli oggetti. A partire da ES6 è stata però aggiunta la <i>sintassi class</i>, che in alcuni casi aiuta a strutturare il codice orientato agli oggetti.

### Funzioni

Abbiamo già incontrato le funzioni freccia. La forma completa della loro definizione è la seguente:

```js
const sum = (p1, p2) => {
  console.log(p1)
  console.log(p2)
  return p1 + p2
}
```

La funzione si richiama nel modo prevedibile:

```js
const result = sum(1, 5)
console.log(result)
```

Se esiste un solo parametro, nella definizione possiamo omettere le parentesi:

```js
const square = p => {
  console.log(p)
  return p * p
}
```

Se la funzione contiene una sola espressione, non servono neppure le parentesi graffe: la funzione restituisce direttamente il risultato dell'espressione. Eliminando la stampa nella console, la definizione può essere abbreviata ulteriormente:

```js
const square = p => p * p
```

Questa forma è particolarmente comoda quando si manipolano gli array, per esempio con <i>map</i>:

```js
const t = [1, 2, 3]
const tSquared = t.map(p => p * p)
// ora tSquared vale [1, 4, 9]
```

Le funzioni freccia sono state aggiunte a JavaScript nel 2015 con [ES6](https://rse.github.io/es6-features/). Prima di allora le funzioni potevano essere definite soltanto con la parola chiave _function_.

Esistono due modi tradizionali per definire una funzione. Il primo assegna un nome mediante una [dichiarazione di funzione](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Statements/function):

```js
function product(a, b) {
  return a * b
}

const result = product(2, 6)
// ora result vale 12
```

Il secondo usa un'[espressione di funzione](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Operators/function). In questo caso non è necessario assegnare un nome alla funzione e la definizione può trovarsi in mezzo al resto del codice:

```js
const average = function(a, b) {
  return (a + b) / 2
}

const result = average(2, 5)
// ora result vale 3.5
```

Nel corso definiremo tutte le funzioni con la sintassi a freccia.

</div>

<div class="tasks">

  <h3>Esercizi 1.3-1.5</h3>

<i>Continuiamo a sviluppare l'applicazione iniziata negli esercizi precedenti. Puoi scrivere il codice nello stesso progetto, perché ci interessa soltanto lo stato finale dell'applicazione.</i>

**Suggerimento:** potresti incontrare difficoltà con la struttura delle <i>props</i> ricevute dai componenti. Un buon modo per chiarirla consiste nello stampare le props nella console, per esempio così:

```js
const Header = (props) => {
  console.log(props) // highlight-line
  return <h1>{props.course}</h1>
}
```

Se, o meglio <i>quando</i>, incontrerai il messaggio di errore

> <i>Objects are not valid as a React child</i>

ricorda quanto spiegato [qui](/it/part1/introduzione_a_react#non-visualizzare-oggetti).

  <h4>1.3: Informazioni sui corsi, passo 3</h4>

Iniziamo a usare gli oggetti nella nostra applicazione. Modifica le definizioni delle variabili di <i>App</i> come segue e riorganizza l'applicazione in modo che continui a funzionare:

```js
const App = () => {
  const course = 'Half Stack application development'
  const part1 = {
    name: 'Fundamentals of React',
    exercises: 10
  }
  const part2 = {
    name: 'Using props to pass data',
    exercises: 7
  }
  const part3 = {
    name: 'State of a component',
    exercises: 14
  }

  return (
    <div>
      ...
    </div>
  )
}
```

  <h4>1.4: Informazioni sui corsi, passo 4</h4>

Inserisci gli oggetti in un array. Modifica le definizioni delle variabili di <i>App</i> come mostrato di seguito e adatta di conseguenza il resto dell'applicazione:

```js
const App = () => {
  const course = 'Half Stack application development'
  const parts = [
    {
      name: 'Fundamentals of React',
      exercises: 10
    },
    {
      name: 'Using props to pass data',
      exercises: 7
    },
    {
      name: 'State of a component',
      exercises: 14
    }
  ]

  return (
    <div>
      ...
    </div>
  )
}
```

**Nota:** a questo punto <i>puoi presumere che gli elementi siano sempre tre</i>, quindi non è necessario scorrere l'array con un ciclo. Approfondiremo la generazione di componenti dagli elementi di un array nella [parte successiva del corso](/en/part2).

Non passare però i diversi oggetti come props separate da <i>App</i> ai componenti <i>Content</i> e <i>Total</i>. Passa direttamente l'intero array:

```js
const App = () => {
  // const definitions

  return (
    <div>
      <Header course={course} />
      <Content parts={parts} />
      <Total parts={parts} />
    </div>
  )
}
```

  <h4>1.5: Informazioni sui corsi, passo 5</h4>

Portiamo le modifiche un passo più avanti. Trasforma il corso e le sue parti in un unico oggetto JavaScript e correggi tutto ciò che smette di funzionare:

```js
const App = () => {
  const course = {
    name: 'Half Stack application development',
    parts: [
      {
        name: 'Fundamentals of React',
        exercises: 10
      },
      {
        name: 'Using props to pass data',
        exercises: 7
      },
      {
        name: 'State of a component',
        exercises: 14
      }
    ]
  }

  return (
    <div>
      ...
    </div>
  )
}
```

</div>

<div class="content">

### Metodi degli oggetti e "this"

Poiché il corso usa una versione di React dotata degli Hook, non abbiamo bisogno di definire oggetti con metodi. **Il contenuto di questo capitolo non è necessario per il corso**, ma è comunque utile da conoscere sotto molti aspetti. In particolare, chi usa versioni meno recenti di React deve comprendere gli argomenti trattati qui.

Le funzioni freccia e quelle definite con la parola chiave _function_ si comportano in modo molto diverso rispetto alla parola chiave [this](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Operators/this), che fa riferimento all'oggetto stesso.

Possiamo assegnare metodi a un oggetto definendo proprietà il cui valore è una funzione:

```js
const arto = {
  name: 'Arto Hellas',
  age: 35,
  education: 'PhD',
  // highlight-start
  greet: function() {
    console.log('hello, my name is ' + this.name)
  },
  // highlight-end
}

arto.greet()  // stampa "hello, my name is Arto Hellas"
```

I metodi possono essere aggiunti anche dopo la creazione dell'oggetto:

```js
const arto = {
  name: 'Arto Hellas',
  age: 35,
  education: 'PhD',
  greet: function() {
    console.log('hello, my name is ' + this.name)
  },
}

// highlight-start
arto.growOlder = function() {
  this.age += 1
}
// highlight-end

console.log(arto.age)   // stampa 35
arto.growOlder()
console.log(arto.age)   // stampa 36
```

Modifichiamo leggermente l'oggetto:

```js
const arto = {
  name: 'Arto Hellas',
  age: 35,
  education: 'PhD',
  greet: function() {
    console.log('hello, my name is ' + this.name)
  },
  // highlight-start
  doAddition: function(a, b) {
    console.log(a + b)
  },
  // highlight-end
}

arto.doAddition(1, 4)         // stampa 5

const referenceToAddition = arto.doAddition
referenceToAddition(10, 15)   // stampa 25
```

L'oggetto possiede ora il metodo _doAddition_, che calcola la somma dei numeri ricevuti come parametri. Possiamo chiamarlo normalmente con <em>arto.doAddition(1, 4)</em>, oppure salvare un <i>riferimento al metodo</i> in una variabile e richiamarlo attraverso quest'ultima: <em>referenceToAddition(10, 15)</em>.

Se proviamo a fare lo stesso con _greet_, incontriamo un problema:

```js
arto.greet()       // stampa "hello, my name is Arto Hellas"

const referenceToGreet = arto.greet
referenceToGreet() // stampa "hello, my name is undefined"
```

Quando viene chiamato tramite un riferimento, il metodo perde l'informazione sul valore originale di _this_. A differenza di altri linguaggi, in JavaScript il valore di [this](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Operators/this) dipende da <i>come viene chiamato il metodo</i>. Se la chiamata avviene attraverso un riferimento, _this_ assume come valore il cosiddetto [oggetto globale](https://developer.mozilla.org/it/docs/Glossary/Global_object) e spesso il risultato non è quello desiderato dallo sviluppatore.

Perdere il riferimento a _this_ può provocare diversi problemi. Capita spesso che React o Node, o più precisamente il motore JavaScript del browser, debba chiamare un metodo definito dallo sviluppatore all'interno di un oggetto. Nel corso eviteremo questi problemi usando JavaScript senza _this_.

Una situazione in cui _this_ "scompare" si verifica quando impostiamo un timer affinché chiami il metodo _greet_ dell'oggetto _arto_ tramite [setTimeout](https://developer.mozilla.org/it/docs/Web/API/setTimeout):

```js
const arto = {
  name: 'Arto Hellas',
  greet: function() {
    console.log('hello, my name is ' + this.name)
  },
}

setTimeout(arto.greet, 1000)  // highlight-line
```

Come detto, il valore di _this_ dipende dal modo in cui il metodo viene chiamato. In questo caso la chiamata è effettuata dal motore JavaScript tramite <em>setTimeout</em> e _this_ fa riferimento all'oggetto globale.

Esistono diversi modi per conservare il valore originale di _this_. Uno consiste nell'usare il metodo [bind](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Function/bind):

```js
setTimeout(arto.greet.bind(arto), 1000)
```

La chiamata <em>arto.greet.bind(arto)</em> crea una nuova funzione in cui _this_ è vincolato all'oggetto <i>arto</i>, indipendentemente da dove e come la funzione verrà chiamata.

Le [funzioni freccia](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Functions/Arrow_functions) permettono di risolvere alcuni problemi legati a _this_. Non dovrebbero però essere usate come metodi degli oggetti, perché in quel caso _this_ non funziona affatto. Torneremo più avanti sul comportamento di _this_ nelle funzioni freccia.

Per comprendere più a fondo il funzionamento di _this_, online si trova molto materiale. È particolarmente consigliata la serie di screencast [Understand JavaScript's this Keyword in Depth](https://egghead.io/courses/understand-javascript-s-this-keyword-in-depth) di [egghead.io](https://egghead.io).

### Classi

Come anticipato, JavaScript non possiede un meccanismo di classi analogo a quello dei linguaggi orientati agli oggetti. Dispone però di funzionalità che consentono di simulare le [classi](https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Classes).

Esaminiamo brevemente la <i>sintassi class</i> introdotta con ES6, che semplifica notevolmente la definizione di classi, o meglio di strutture simili alle classi.

Nell'esempio seguente definiamo una "classe" chiamata <i>Person</i> e due oggetti <i>Person</i>:

```js
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
  greet() {
    console.log('hello, my name is ' + this.name)
  }
}

const adam = new Person('Adam Ondra', 33)
adam.greet()

const janja = new Person('Janja Garnbret', 27)
janja.greet()
```

Per sintassi, le classi JavaScript e le loro istanze ricordano molto classi e oggetti Java; anche il comportamento è piuttosto simile. In realtà rimangono normali oggetti JavaScript basati sull'[ereditarietà prototipale](https://developer.mozilla.org/it/docs/Web/JavaScript/Inheritance_and_the_prototype_chain). Il tipo di un'istanza rimane _Object_, perché JavaScript definisce fondamentalmente un insieme limitato di tipi: [Boolean, Null, Undefined, Number, String, Symbol, BigInt e Object](https://developer.mozilla.org/it/docs/Web/JavaScript/Data_structures).

L'introduzione della sintassi delle classi è stata controversa. Per approfondire puoi leggere [Not Awesome: ES6 Classes](https://github.com/petsel/not-awesome-es6-classes) oppure [Is “Class” In ES6 The New “Bad” Part?](https://medium.com/@rajaraodv/is-class-in-es6-the-new-bad-part-6c4e6fe1ee65).

La sintassi delle classi ES6 è molto usata nel "vecchio" React e anche in Node.js, perciò comprenderla è utile anche in questo corso. Poiché però useremo sempre gli [Hook](https://react.dev/reference/react/hooks) moderni di React, non avremo un impiego concreto per le classi JavaScript.

### Materiale su JavaScript

Online esistono guide a JavaScript sia ottime sia scadenti. La maggior parte dei collegamenti di questa pagina rimanda alla [guida JavaScript di Mozilla](https://developer.mozilla.org/it/docs/Web/JavaScript).

È fortemente consigliato leggere subito la [panoramica del linguaggio JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Language_overview) sul sito di Mozilla.

Per approfondire davvero JavaScript è disponibile gratuitamente l'ottima serie di libri [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS).

Un'altra eccellente risorsa è [javascript.info](https://javascript.info).

Il libro gratuito e coinvolgente [Eloquent JavaScript](https://eloquentjavascript.net) conduce rapidamente dai fondamenti ad argomenti interessanti. Combina teoria, progetti ed esercizi e tratta sia concetti generali di programmazione sia il linguaggio JavaScript.

[Namaste 🙏 JavaScript](https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP) è un altro corso gratuito molto consigliato per capire il funzionamento interno di JavaScript. Pubblicato su YouTube, approfondisce i concetti fondamentali e ciò che accade dietro le quinte nel motore JavaScript.

[egghead.io](https://egghead.io) offre molti screencast di qualità su JavaScript, React e altri argomenti interessanti. Una parte del materiale è purtroppo a pagamento.

</div>
