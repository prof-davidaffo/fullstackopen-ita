---
mainImage: ../../../images/part-3.svg
part: 3
letter: d
lang: it
---

<div class="content">

Di solito vogliamo imporre alcuni vincoli ai dati memorizzati nel database. L'applicazione non dovrebbe accettare note senza la proprietà <i>content</i> o con contenuto vuoto. Finora la validità viene controllata nella route:

```js
app.post('/api/notes', (request, response) => {
  const body = request.body
  // highlight-start
  if (!body.content) {
    return response.status(400).json({ error: 'content missing' })
  }
  // highlight-end

  // ...
})
```

Se <i>content</i> manca, rispondiamo con <i>400 Bad Request</i>.

Un metodo più efficace consiste nell'usare le [validazioni](https://mongoosejs.com/docs/validation.html) offerte da Mongoose.

Possiamo definire regole specifiche per ogni campo dello schema:

```js
const noteSchema = new mongoose.Schema({
  // highlight-start
  content: {
    type: String,
    minLength: 5,
    required: true
  },
  // highlight-end
  important: Boolean
})
```

Ora <i>content</i> è obbligatorio e deve contenere almeno cinque caratteri. Non abbiamo aggiunto vincoli a <i>important</i>.

<i>minLength</i> e <i>required</i> sono validatori [integrati](https://mongoosejs.com/docs/validation.html#built-in-validators). Se quelli disponibili non bastano, Mongoose permette di creare [validatori personalizzati](https://mongoosejs.com/docs/validation.html#custom-validators).

Il tentativo di salvare un oggetto non valido genera un'eccezione. Modifichiamo la creazione affinché inoltri gli errori al relativo middleware:

```js
app.post('/api/notes', (request, response, next) => { // highlight-line
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error)) // highlight-line
})
```

Estendiamo il middleware degli errori:

```js
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') { // highlight-line
    return response.status(400).json({ error: error.message }) // highlight-line
  }

  next(error)
}
```

Quando la validazione fallisce, restituiamo il messaggio predefinito di Mongoose:

![messaggio di errore di validazione in Postman](../../images/3/50.png)

### Pubblicare in produzione il backend col database

L'applicazione dovrebbe funzionare quasi senza modifiche su Render o Fly.io. Non occorre generare una nuova build del frontend, perché abbiamo cambiato soltanto il backend.

Il file `.env` viene usato localmente, ma non deve essere distribuito. In produzione dobbiamo impostare l'URL del database nel servizio di hosting.

Su Fly.io usiamo _fly secrets set_:

```bash
fly secrets set MONGODB_URI='mongodb+srv://fullstack:thepasswordishere@cluster0.a5qfl.mongodb.net/noteApp?retryWrites=true&w=majority'
```

Durante il primo deploy è probabile incontrare problemi. Per esempio, l'applicazione potrebbe non mostrare alcuna nota:

![nessuna nota nell'applicazione pubblicata](../../images/3/fly-problem1.png)

La scheda Network può mostrare una richiesta in attesa che termina con stato 502. Tenete sempre aperta la console del browser.

È altrettanto importante seguire i log del server. Con _fly logs_ il problema diventa evidente:

![log Fly.io con URL del database undefined](../../images/3/fly-problem3.png)

Se l'URL è _undefined_, probabilmente non è stato impostato il secret MONGODB_URI.

MongoDB Atlas deve inoltre accettare l'indirizzo IP dell'applicazione. Poiché Fly.io non assegna necessariamente un IPv4 dedicato, per l'esercitazione può essere necessario consentire tutti gli indirizzi in Atlas. In un'applicazione reale sarebbe preferibile una configurazione più restrittiva.

Su Render, MONGODB_URI viene definita nel pannello delle variabili d'ambiente:

![MONGODB_URI nel pannello Render](../../images/3/render-env.png)

Anche i log sono disponibili dal pannello:

![log del server su Render](../../images/3/r7.png)

Il codice completo è nel branch <i>part3-6</i> di [questo repository](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part3-6).

</div>

<div class="tasks">

### Esercizi 3.19.-3.21.

#### 3.19*: Database della rubrica, passo 7

Aggiungete una validazione che richieda nomi lunghi almeno tre caratteri.

Modificate il frontend affinché mostri un messaggio quando si verifica un errore di validazione. Potete aggiungere un blocco <em>catch</em>:

```js
personService
    .create({ ... })
    .then(createdPerson => {
      // ...
    })
    .catch(error => {
      // this is the way to access the error message
      console.log(error.response.data.error)
    })
```

Potete visualizzare il messaggio predefinito restituito da Mongoose, anche se non è molto leggibile:

![errore di validazione nella rubrica](../../images/3/56e.png)

**Nota:** nelle operazioni di aggiornamento i validatori Mongoose sono disattivati per impostazione predefinita. Consultate la [documentazione](https://mongoosejs.com/docs/validation.html) per abilitarli.

#### 3.20*: Database della rubrica, passo 8

Aggiungete una validazione per il formato dei numeri di telefono. Un numero deve:

- contenere almeno 8 caratteri;
- essere formato da due gruppi separati da `-`;
- avere due o tre cifre nel primo gruppo e soltanto cifre nel secondo.

Per esempio, `09-1234556` e `040-22334455` sono validi; `1234556`, `1-22334455` e `10-22-334455` non lo sono.

Usate un [validatore personalizzato](https://mongoosejs.com/docs/validation.html#custom-validators) per la seconda parte. Una POST con un numero non valido deve produrre il codice di stato e il messaggio di errore appropriati.

#### 3.21: Pubblicare in produzione il backend col database

Create una nuova versione full stack generando la build di produzione del frontend e copiandola nel backend. Verificate l'intera applicazione localmente da <http://localhost:3001/>.

Pubblicate l'ultima versione su Render o Fly.io e controllatene il funzionamento.

**Nota:** non pubblicate separatamente il frontend. Distribuite il repository del backend, che contiene e serve la build come spiegato in [Servire file statici dal backend](/it/part3/pubblicare_lapplicazione_su_internet#servire-file-statici-dal-backend).

</div>

<div class="content">

### Lint

Prima di proseguire, introduciamo [lint](<https://en.wikipedia.org/wiki/Lint_(software)>). Un linter esegue l'analisi statica del codice e segnala errori, usi sospetti del linguaggio e problemi di stile.

Nei linguaggi compilati e tipizzati staticamente, gli IDE possono individuare molti problemi prima dell'esecuzione. Strumenti di [analisi statica](https://en.wikipedia.org/wiki/Static_program_analysis), come [Checkstyle](https://checkstyle.sourceforge.io) per Java, estendono questi controlli anche allo stile.

Per JavaScript, lo strumento di riferimento è [ESLint](https://eslint.org/).

Installiamolo nel backend come <i>dipendenza di sviluppo</i>, cioè necessaria soltanto durante lo sviluppo e non in produzione:

```bash
npm install eslint @eslint/js --save-dev
```

<i>package.json</i> conterrà:

```js
{
  //...
  "dependencies": {
    "dotenv": "^16.4.7",
    "express": "^5.1.0",
    "mongoose": "^8.11.0"
  },
  "devDependencies": { // highlight-line
    "@eslint/js": "^9.22.0", // highlight-line
    "eslint": "^9.22.0" // highlight-line
  }
}
```

Il comando aggiunge <i>devDependencies</i> e installa i pacchetti in <i>node_modules</i>.

Inizializziamo la configurazione:

```bash
npx eslint --init
```

Rispondiamo alle domande mostrate:

![inizializzazione di ESLint nel terminale](../../images/3/lint1.png)

La configurazione viene salvata in _eslint.config.mjs_.

### Formattare il file di configurazione

Riscriviamo _eslint.config.mjs_ così:

```js
import globals from 'globals'

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
      ecmaVersion: 'latest',
    },
  },
]
```

_files_ indica di controllare tutti i file JavaScript. _sourceType: commonjs_ descrive il sistema di moduli usato. _globals.node_ abilita le variabili globali di Node, come _process_; per codice browser useremmo _globals.browser_, che comprende _window_ e _document_. _ecmaVersion: latest_ abilita la sintassi JavaScript più recente.

Attiviamo le impostazioni [consigliate da ESLint](https://eslint.org/docs/latest/use/configure/configuration-files#using-predefined-configurations), fornite da _@eslint/js_:

```js
import globals from 'globals'
import js from '@eslint/js' // highlight-line
// ...

export default [
  js.configs.recommended, // highlight-line
  {
    // ...
  },
]
```

La configurazione consigliata viene applicata prima delle nostre opzioni personalizzate.

Installiamo il [plugin di stile](https://eslint.style/packages/js):

```bash
npm install --save-dev @stylistic/eslint-plugin
```

Importiamolo e definiamo quattro regole:

```js
import globals from 'globals'
import js from '@eslint/js'
import stylisticJs from '@stylistic/eslint-plugin' // highlight-line

export default [
  {
    // ...
    // highlight-start
    plugins: { 
      '@stylistic/js': stylisticJs,
    },
    rules: { 
      '@stylistic/js/indent': ['error', 2],
      '@stylistic/js/linebreak-style': ['error', 'unix'],
      '@stylistic/js/quotes': ['error', 'single'],
      '@stylistic/js/semi': ['error', 'never'],
    }, 
    // highlight-end
  },
]
```

I [plugin](https://eslint.org/docs/latest/use/configure/plugins) estendono ESLint con regole e configurazioni aggiuntive. Qui imponiamo indentazione, terminatori di riga Unix, virgolette singole e assenza di punto e virgola.

**Nota per Windows:** consigliamo terminatori di riga Unix, `LF`, perché favoriscono la compatibilità e la collaborazione. Se ESLint segnala `Expected linebreaks to be 'LF' but found 'CRLF'`, configurate VS Code seguendo questa [guida](https://stackoverflow.com/questions/48692741/how-can-i-make-all-line-endings-eols-in-all-files-in-visual-studio-code-unix).

### Eseguire il linter

Controlliamo un singolo file con:

```bash
npx eslint index.js
```

È più comodo creare uno script npm:

```json
{
  // ...
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "test": "echo \"Error: no test specified\" && exit 1",
    "lint": "eslint ." // highlight-line
    // ...
  },
  // ...
}
```

_npm run lint_ controlla tutti i file del progetto.

Non vogliamo analizzare la build in <i>dist</i>. Aggiungiamo una configurazione [ignores](https://eslint.org/docs/latest/use/configure/ignore):

```js
// ...
export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    // ...
  },
  // highlight-start
  { 
    ignores: ['dist/**'], 
  },
  // highlight-end
]
```

ESLint segnalerà numerosi problemi:

![errori prodotti da ESLint](../../images/3/53ea.png)

In alternativa alla riga di comando, installate l'[estensione ESLint per VS Code](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), che esegue continuamente i controlli e sottolinea gli errori:

![violazioni ESLint in VS Code](../../images/3/54a.png)

### Aggiungere altre regole di stile

ESLint offre molte [regole](https://eslint.org/docs/rules/). Aggiungiamo [eqeqeq](https://eslint.org/docs/rules/eqeqeq), che impone l'uguaglianza stretta:

```js
export default [
  // ...
  rules: {
    // ...
   eqeqeq: 'error', // highlight-line
  },
  // ...
]
```

Vietiamo inoltre spazi finali, imponiamo spazi nelle parentesi graffe e rendiamo coerenti gli spazi nelle arrow function:

```js
export default [
  // ...
  rules: {
    // ...
    eqeqeq: 'error',
    // highlight-start
    'no-trailing-spaces': 'error',
    'object-curly-spacing': ['error', 'always'],
    'arrow-spacing': ['error', { before: true, after: true }],
    // highlight-end
  },
]
```

La configurazione consigliata è inclusa con:

```js
// ...

export default [
  js.configs.recommended,
  // ...
]
```

Disattiviamo temporaneamente _no-console_ impostandola a `off`, così <i>console.log</i> rimane disponibile durante il debugging:

```js
[
  {
    // ...
    rules: {
      // ...
      eqeqeq: 'error',
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'arrow-spacing': ['error', { before: true, after: true }],
      'no-console': 'off', // highlight-line
    },
  },
]
```

La configurazione completa è:

```js
import globals from 'globals'
import js from '@eslint/js'
import stylisticJs from '@stylistic/eslint-plugin'

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
      ecmaVersion: 'latest',
    },
    plugins: {
      '@stylistic/js': stylisticJs,
    },
    rules: {
      '@stylistic/js/indent': ['error', 2],
      '@stylistic/js/linebreak-style': ['error', 'unix'],
      '@stylistic/js/quotes': ['error', 'single'],
      '@stylistic/js/semi': ['error', 'never'],
      eqeqeq: 'error',
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'arrow-spacing': ['error', { before: true, after: true }],
      'no-console': 'off',
    },
  },
  {
    ignores: ['dist/**'],
  },
]
```

Dopo ogni modifica a _eslint.config.mjs_, eseguite il linter dal terminale per verificare anche il file di configurazione:

![npm run lint nel terminale](../../images/3/lint2.png)

Una configurazione errata può rendere imprevedibile l'estensione dell'editor.

Molte aziende applicano standard di codice comuni tramite ESLint. Anziché reinventare ogni configurazione, può essere utile adottarne una esistente, per esempio la [guida di stile JavaScript di Airbnb](https://github.com/airbnb/javascript) e la relativa [configurazione ESLint](https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb).

Il codice completo è nel branch <i>part3-7</i> di [questo repository](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part3-7).

</div>

<div class="tasks">

### Esercizio 3.22.

#### 3.22: Configurazione del lint

Aggiungete ESLint all'applicazione e correggete tutti gli avvisi.

Questo è l'ultimo esercizio della Parte 3.

</div>
