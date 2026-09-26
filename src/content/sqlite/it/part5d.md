---
mainImage: ../../../images/part-5.svg
part: 5
letter: d
lang: it
course: sqlite
---

<div class="content">

**Percorso SQLite:** usa test-env.cjs della Parte 4, con NODE_ENV=test e un SECRET destinato soltanto ai test. Il backend E2E usa un database in memoria distinto dal file di sviluppo. Non avviarlo con --watch: eventuali riavvii azzererebbero lo stato durante i test. Per il progetto blog, nel reset sostituisci DELETE FROM notes con DELETE FROM blogs e cancella prima i blog, poi gli utenti. Il router di reset non deve mai essere registrato nell’avvio normale.

Finora abbiamo verificato il backend nel suo insieme, a livello di API, con test di integrazione, e alcuni componenti del frontend con test unitari.

Vediamo ora come verificare il [sistema completo](https://en.wikipedia.org/wiki/System_testing) tramite test <i>end-to-end</i> (E2E).

Per testare un'applicazione web da un capo all'altro possiamo usare un browser e una libreria di test. Ne esistono diverse: [Selenium](http://www.seleniumhq.org/), per esempio, supporta quasi tutti i browser. Possiamo anche usare un browser in modalità [headless](https://en.wikipedia.org/wiki/Headless_browser), cioè senza interfaccia grafica. Chrome, per esempio, offre questa possibilità.

I test E2E sono potenzialmente molto utili perché verificano il sistema attraverso la stessa interfaccia utilizzata dagli utenti reali.

Presentano però alcuni svantaggi. La configurazione è più impegnativa rispetto ai test unitari o di integrazione e l'esecuzione tende a essere lenta: su sistemi grandi può durare minuti o persino ore. Questo rallenta lo sviluppo, durante il quale è utile eseguire spesso i test per individuare eventuali [regressioni](https://en.wikipedia.org/wiki/Regression_testing).

I test E2E possono anche essere [instabili](https://hackernoon.com/flaky-tests-a-war-that-never-ends-9aa32fdef359), o <i>flaky</i>: lo stesso test può passare una volta e fallire la successiva senza che il codice sia cambiato.

Tra gli strumenti accessibili per questi test troviamo [Playwright](https://playwright.dev/) e [Cypress](https://www.cypress.io/).

Il grafico di [npmtrends.com](https://npmtrends.com/cypress-vs-playwright) riportato nel materiale originale mostra il sorpasso di Playwright nei download durante il 2024:

![confronto storico dei download di Cypress e Playwright su npm trends](../../images/5/pwc.png)

Il corso ha utilizzato Cypress per diversi anni; qui useremo Playwright.

[Playwright](https://playwright.dev/) ha iniziato a diffondersi rapidamente verso la fine del 2023. I due strumenti hanno una facilità d'uso comparabile, ma funzionano diversamente: il codice dei test di Cypress viene eseguito nel browser, mentre i test di Playwright vengono eseguiti in un processo Node che comunica con il browser attraverso apposite interfacce.

Iniziamo a esplorare Playwright.

### Configurare i test

A differenza dei test del backend e dei test unitari dei componenti React, i test E2E possono risiedere in un progetto npm separato dall'applicazione. Creiamo un nuovo progetto con _npm init_, poi installiamo Playwright eseguendo nella nuova directory:

```js
npm init playwright@latest
```

Lo script di installazione pone alcune domande. Rispondi come nell'immagine:

![scelte di installazione: JavaScript, tests, niente workflow GitHub Actions e installazione dei browser](../../images/5/play0.png)

Il sistema operativo potrebbe non avere tutte le dipendenze necessarie ai browser di Playwright. In tal caso può comparire un messaggio simile:

```
Webkit 18.0 (playwright build v2070) downloaded to /home/user/.cache/ms-playwright/webkit-2070
Playwright Host validation warning: 
╔══════════════════════════════════════════════════════╗
║ Host system is missing dependencies to run browsers. ║
║ Missing libraries:                                   ║
║     libicudata.so.66                                 ║
║     libicui18n.so.66                                 ║
║     libicuuc.so.66                                   ║
║     libjpeg.so.8                                     ║
║     libwebp.so.6                                     ║
║     libpcre.so.3                                     ║
║     libffi.so.7                                      ║
╚══════════════════════════════════════════════════════╝
```

Puoi limitare i test ai browser disponibili usando `--project=` nello script di _package.json_:

```js
    "test": "playwright test --project=chromium --project=firefox",
```

oppure rimuovere dalla configurazione _playwright.config.js_ la voce del browser che presenta problemi:

```js
  projects: [
    // ...
    //{
    //  name: 'webkit',
    //  use: { ...devices['Desktop Safari'] },
    //},
    // ...
  ]
```

Definiamo in _package.json_ gli script npm per eseguire i test e aprire i report:

```js
{
  // ...
  "scripts": {
    "test": "playwright test",
    "test:report": "playwright show-report"
  },
  // ...
}
```

Durante l'installazione viene stampato questo messaggio:

```
And check out the following files:
  - ./tests/example.spec.js - Example end-to-end test
  - ./tests-examples/demo-todo-app.spec.js - Demo Todo App end-to-end tests
  - ./playwright.config.js - Playwright Test configuration
```

Sono i percorsi dei test di esempio e del file di configurazione creati dall'installazione.

Eseguiamo i test:

```bash
$ npm test

> notes-e2e@1.0.0 test
> playwright test


Running 6 tests using 5 workers
  6 passed (3.9s)

To open last HTML report run:

  npx playwright show-report
```

I test passano. Possiamo aprire un report dettagliato con il comando suggerito nell'output oppure con lo script appena definito:

```
npm run test:report
```

Possiamo anche avviarli tramite l'interfaccia grafica:

```
npm run test -- --ui
```

I test di esempio nel file _tests/example.spec.js_ hanno questa forma:

```js
// @ts-check
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/'); // highlight-line

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
```

La prima istruzione delle funzioni di test apre il sito [playwright.dev](https://playwright.dev/).

### Testare la nostra applicazione

Rimuoviamo ora i test di esempio e iniziamo a verificare la nostra applicazione.

Con la configurazione usata qui, frontend e backend devono essere già in esecuzione: i test non li avviano automaticamente. Playwright permette anche di configurare un [web server](https://playwright.dev/docs/test-webserver) da avviare insieme ai test, ma qui li avvieremo separatamente.

Nel <i>backend</i> aggiungiamo uno script npm per avviare l'applicazione in modalità test, assegnando a <i>NODE_ENV</i> il valore <i>test</i>:

```js
{
  // ...
  "scripts": {
    "start": "node --env-file=.env index.js",
    "dev": "node --env-file=.env --watch index.js",
    "test": "node --require ./test-env.cjs --test",
    "lint": "eslint .",
    // ...
    "start:test": "node --require ./test-env.cjs index.js" // highlight-line
  },
  // ...
}
```

Avviamo frontend e backend e creiamo il primo file di test, <code>tests/note_app.spec.js</code>.

La stringa del footer nei prossimi esempi corrisponde all'applicazione di riferimento e alle schermate originali. Se hai personalizzato il footer, usa nei test il testo effettivamente mostrato dalla tua applicazione:

```js
const { test, expect } = require('@playwright/test')

test('front page can be opened', async ({ page }) => {
  await page.goto('http://localhost:5173')

  const locator = page.getByText('Notes')
  await expect(locator).toBeVisible()
  await expect(page.getByText('Note app, Department of Computer Science, University of Helsinki 2024')).toBeVisible()
})
```

Il test apre l'applicazione con [page.goto](https://playwright.dev/docs/writing-tests#navigation). Poi [page.getByText](https://playwright.dev/docs/api/class-page#page-get-by-text) crea un [locator](https://playwright.dev/docs/locators), cioè un riferimento che permette di individuare l'elemento contenente <i>Notes</i>.

[toBeVisible](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-be-visible) verifica che l'elemento individuato sia visibile.

La seconda verifica fa lo stesso senza una variabile di appoggio.

Il test fallisce perché il testo atteso contiene un anno diverso da quello del footer. Il report mostra che il test è stato eseguito con tre browser: Chromium, Firefox e WebKit, il motore usato da Safari:

![report con il test fallito sui tre browser](../../images/5/play2.png)

Aprendo il risultato di un browser vediamo l'errore in dettaglio:

![dettaglio del messaggio di errore](../../images/5/play3a.png)

Verificare tutti e tre i motori è utile, ma richiede più tempo. Durante lo sviluppo dei test possiamo limitarci a uno, selezionandolo dalla riga di comando:

```js
npm test -- --project chromium
```

Correggiamo il testo atteso con l'anno mostrato nell'esempio e raggruppiamo i test in un blocco _describe_:

```js
const { test, describe, expect } = require('@playwright/test')

describe('Note app', () => {  // highlight-line
  test('front page can be opened', async ({ page }) => {
    await page.goto('http://localhost:5173')

    const locator = page.getByText('Notes')
    await expect(locator).toBeVisible()
    await expect(page.getByText('Note app, Department of Computer Science, University of Helsinki 2025')).toBeVisible()
  })
})
```

Prima di proseguire, facciamo fallire di nuovo il test. Notiamo che un test riuscito termina rapidamente, mentre uno fallito impiega molto più tempo. Playwright attende infatti che gli elementi siano [pronti per l'interazione](https://playwright.dev/docs/actionability) e ripete le asserzioni che prevedono un'attesa. Se la condizione non si verifica entro il limite, il test fallisce per timeout. I limiti predefiniti variano [in base all'operazione](https://playwright.dev/docs/test-timeouts#introduction): per esempio, cinque secondi per le asserzioni e trenta per un test.

Durante lo sviluppo possiamo ridurre il timeout del test a pochi secondi modificando _playwright.config.js_, come indicato nella [documentazione](https://playwright.dev/docs/test-timeouts):

```js
export default defineConfig({
  // ...
  timeout: 3000, // highlight-line
  fullyParallel: false, // highlight-line
  workers: 1, // highlight-line
  // ...
})
```

Abbiamo modificato anche due impostazioni per [eseguire i test uno alla volta](https://playwright.dev/docs/test-parallel). La configurazione predefinita consente l'esecuzione parallela, che qui causerebbe interferenze perché i test condividono il database.

### Compilare il form

Scriviamo un test che effettui il login. Supponiamo che nel database esista un utente con username <i>mluukkai</i> e password <i>salainen</i>.

Iniziamo aprendo il modulo di login:

```js
describe('Note app', () => {
  // ...

  test('user can log in', async ({ page }) => {
    await page.goto('http://localhost:5173')

    await page.getByRole('button', { name: 'login' }).click()
  })
})
```

Il test usa [page.getByRole](https://playwright.dev/docs/api/class-page#page-get-by-role) per trovare un pulsante in base al suo nome accessibile. Il metodo restituisce un [Locator](https://playwright.dev/docs/api/class-locator); il metodo [click](https://playwright.dev/docs/api/class-locator#locator-click) esegue il clic.

Durante lo sviluppo possiamo usare la [modalità UI](https://playwright.dev/docs/test-ui-mode), che offre un'interfaccia grafica. Avviamola così:

```
npm test -- --ui
```

Vediamo che il test trova il pulsante:

![interfaccia Playwright con il pulsante di login dell'applicazione](../../images/5/play4.png)

Dopo il clic compare il form:

![interfaccia Playwright con il modulo di login aperto](../../images/5/play5.png)

Il test deve ora individuare i campi e compilare username e password. Facciamo un primo tentativo con [page.getByRole](https://playwright.dev/docs/api/class-page#page-get-by-role):

```js
describe('Note app', () => {
  // ...

  test('user can log in', async ({ page }) => {
    await page.goto('http://localhost:5173')

    await page.getByRole('button', { name: 'login' }).click()
    await page.getByRole('textbox').fill('mluukkai')  // highlight-line
  })
})
```

Quando il locator corrisponde a più campi, otteniamo un errore di questo tipo, riportato nell'esempio originale:

```bash
Error: locator.fill: Error: strict mode violation: getByRole('textbox') resolved to 2 elements:
  1) <input value=""/> aka locator('div').filter({ hasText: /^username$/ }).getByRole('textbox')
  2) <input value="" type="password"/> aka locator('input[type="password"]')
```

Il messaggio indica che _getByRole_ ha individuato due elementi. [fill](https://playwright.dev/docs/api/class-locator#locator-fill) richiede invece un unico destinatario.

**Nota:** un input HTML con _type="password"_ non ha un ruolo implicito _textbox_. L'errore sopra e gli esempi con due textbox illustrano il problema dei selettori ambigui; con il form di login mostrato qui non vanno considerati una soluzione affidabile per raggiungere la password. Poco più avanti useremo le etichette con _getByLabel_.

Quando i campi condividono davvero lo stesso ruolo, possiamo distinguerli con [first](https://playwright.dev/docs/api/class-locator#locator-first) e [last](https://playwright.dev/docs/api/class-locator#locator-last):

```js
describe('Note app', () => {
  // ...

  test('user can log in', async ({ page }) => {
    await page.goto('http://localhost:5173')

    await page.getByRole('button', { name: 'login' }).click()
    // highlight-start
    await page.getByRole('textbox').first().fill('mluukkai')
    await page.getByRole('textbox').last().fill('salainen')
    await page.getByRole('button', { name: 'login' }).click()
  
    await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
    // highlight-end
  })
})
```

Dopo la compilazione, il test preme _login_ e verifica che compaiano i dati dell'utente autenticato.

Con più di due campi, _first_ e _last_ non bastano a selezionare quelli intermedi. [all](https://playwright.dev/docs/api/class-locator#locator-all) restituisce un array di locator, accessibili tramite indice:

```js
describe('Note app', () => {
  // ...
  test('user can log in', async ({ page }) => {
    await page.goto('http://localhost:5173')

    await page.getByRole('button', { name: 'login' }).click()
    // highlight-start
    const textboxes = await page.getByRole('textbox').all()

    await textboxes[0].fill('mluukkai')
    await textboxes[1].fill('salainen')
    // highlight-end

    await page.getByRole('button', { name: 'login' }).click()
  
    await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
  })  
})
```

Entrambe le strategie dipendono dall'ordine dei campi e possono rompersi se il form cambia. Come appena osservato, nel nostro form la password va inoltre individuata con un metodo diverso dal ruolo textbox.

Se un elemento è difficile da trovare, possiamo assegnargli un attributo <i>data-testid</i> e usare [getByTestId](https://playwright.dev/docs/api/class-page#page-get-by-test-id).

Qui sfruttiamo invece le <i>etichette</i> già associate ai campi del modulo di login:

```js
// ...
<form onSubmit={handleSubmit}>
  <div>
    <label> // highlight-line
      username // highlight-line
      <input
        type="text"
        value={username}
        onChange={handleUsernameChange}
      />
    </label> // highlight-line
  </div>
  <div>
    <label> // highlight-line
      password // highlight-line
      <input
        type="password"
        value={password}
        onChange={handlePasswordChange}
      />
    </label> // highlight-line
  </div>
  <button type="submit">login</button>
</form>
// ...
```

Possiamo individuare i campi tramite le loro etichette con [getByLabel](https://playwright.dev/docs/api/class-page#page-get-by-label):

```js
describe('Note app', () => {
  // ...

  test('user can log in', async ({ page }) => {
    await page.goto('http://localhost:5173')

    await page.getByRole('button', { name: 'login' }).click()
    await page.getByLabel('username').fill('mluukkai') // highlight-line
    await page.getByLabel('password').fill('salainen')  // highlight-line
  
    await page.getByRole('button', { name: 'login' }).click() 
  
    await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
  })
})
```

Nella ricerca degli elementi conviene usare le informazioni percepibili dall'utente: i test rispecchiano così il modo in cui una persona trova un campo nell'interfaccia.

Per superare il test deve esistere nel database <i>di test</i> l'utente <i>mluukkai</i> con password <i>salainen</i>. Crealo se necessario.

### Preparare ogni test

Entrambi i test iniziano aprendo <i>http://localhost:5173</i>. Estraiamo quindi questa operazione in un blocco <i>beforeEach</i>, eseguito prima di ogni test:

```js
const { test, describe, expect, beforeEach } = require('@playwright/test')

describe('Note app', () => {
  // highlight-start
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })
  // highlight-end

  test('front page can be opened', async ({ page }) => {
    const locator = page.getByText('Notes')
    await expect(locator).toBeVisible()
    await expect(page.getByText('Note app, Department of Computer Science, University of Helsinki 2025')).toBeVisible()
  })

  test('user can log in', async ({ page }) => {
    await page.getByRole('button', { name: 'login' }).click()
    await page.getByLabel('username').fill('mluukkai')
    await page.getByLabel('password').fill('salainen')
    await page.getByRole('button', { name: 'login' }).click()
    await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
  })
})
```

### Testare la creazione di note

Aggiungiamo un test che crei una nuova nota:

```js
const { test, describe, expect, beforeEach } = require('@playwright/test')

describe('Note app', () => {
  // ...

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'login' }).click()
      await page.getByLabel('username').fill('mluukkai')
      await page.getByLabel('password').fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()
    })

    test('a new note can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new note' }).click()
      await page.getByRole('textbox').fill('a note created by playwright')
      await page.getByRole('button', { name: 'save' }).click()
      await expect(page.getByText('a note created by playwright')).toBeVisible()
    })
  })  
})
```

Il test si trova in un blocco _describe_ dedicato. Per creare una nota bisogna essere autenticati: il login viene effettuato nel _beforeEach_ del gruppo.

Il test presuppone che il form abbia un solo campo di testo e lo cerca così:

```js
page.getByRole('textbox')
```

Con più campi la ricerca diventerebbe ambigua. Potremmo assegnare al campo un <i>data-testid</i> e cercarlo tramite questo identificatore.

**Nota:** al momento il test passa soltanto alla prima esecuzione. Questa asserzione:

```js
await expect(page.getByText('a note created by playwright')).toBeVisible()
```

diventa ambigua se l'applicazione contiene più note con lo stesso testo. Risolveremo il problema nella prossima sezione.

La struttura dei test è ora:

```js
const { test, describe, expect, beforeEach } = require('@playwright/test')

describe('Note app', () => {
  // ....

  test('user can log in', async ({ page }) => {
    await page.getByRole('button', { name: 'login' }).click()
    await page.getByLabel('username').fill('mluukkai')
    await page.getByLabel('password').fill('salainen')
    await page.getByRole('button', { name: 'login' }).click()
    await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'login' }).click()
      await page.getByLabel('username').fill('mluukkai')
      await page.getByLabel('password').fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()
    })

    test('a new note can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new note' }).click()
      await page.getByRole('textbox').fill('a note created by playwright')
      await page.getByRole('button', { name: 'save' }).click()
      await expect(page.getByText('a note created by playwright')).toBeVisible()
    })
  })
})
```

Avendo disabilitato il parallelismo, i test del file vengono eseguiti nell'ordine in cui sono definiti. Prima _user can log in_ effettua il login; poi _a new note can be created_ lo ripete nel proprio _beforeEach_.

Il secondo login serve perché <i>ogni</i> test parte con un contesto browser nuovo: lo stato lasciato dal test precedente non viene conservato.

### Controllare lo stato del database

Quando i test modificano il database, la situazione si complica. Per ottenere risultati affidabili e ripetibili, ogni test dovrebbe partire da uno stato noto.

Come per i test unitari e di integrazione, conviene svuotare il database di test e preparare i dati necessari prima dell'esecuzione. In questa configurazione, però, i test E2E interagiscono con l'applicazione dall'esterno e non accedono direttamente al database.

Creiamo quindi un endpoint del backend dedicato ai test, tramite il quale ripristinare i dati. Aggiungiamo il router <i>controllers/testing.js</i>:

```js
const router = require('express').Router()
const db = require('../db')

router.post('/reset', (request, response) => {
  // This connection is in memory and this router is only mounted in test mode.
  db.exec('BEGIN')
  try {
    db.exec('DELETE FROM notes')
    db.exec('DELETE FROM users')
    db.exec('COMMIT')
    response.status(204).end()
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
})

module.exports = router
```

Registriamolo nel backend soltanto <i>quando l'applicazione viene eseguita in modalità test</i>:

```js
// ...

app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)
app.use('/api/notes', notesRouter)

// highlight-start
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}
// highlight-end

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
```

Una richiesta POST a <i>/api/testing/reset</i> ora svuota il database. Avvia il backend in modalità test con lo script già definito in package.json:

```js
  npm run start:test
```

Il backend modificato è disponibile su [GitHub](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part5-1), nel branch <i>part5-1</i>.

Modifichiamo il _beforeEach_ affinché svuoti il database prima di ogni test.

Poiché il frontend non permette ancora di creare utenti, aggiungiamone uno tramite l'API nello stesso blocco:

```js
describe('Note app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3001/api/testing/reset')
    await request.post('http://localhost:3001/api/users', {
      data: {
        name: 'Matti Luukkainen',
        username: 'mluukkai',
        password: 'salainen'
      }
    })

    await page.goto('http://localhost:5173')
  })
  
  test('front page can be opened',  () => {
    // ...
  })

  test('user can login', () => {
    // ...
  })

  describe('when logged in', () => {
    // ...
  })
})
```

Durante la preparazione, il test invia richieste HTTP al backend con il metodo [post](https://playwright.dev/docs/api/class-apirequestcontext#api-request-context-post) dell'oggetto _request_.

Ora ogni test parte dallo stesso stato: un utente e nessuna nota nel database.

Verifichiamo anche che l'importanza di una nota possa essere modificata. Possiamo farlo in diversi modi; qui creiamo una nota, premiamo <i>make not important</i> e verifichiamo che compaia <i>make important</i>:

```js
describe('Note app', () => {
  // ...

  describe('when logged in', () => {
    // ...

    // highlight-start
    describe('and a note exists', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: 'new note' }).click()
        await page.getByRole('textbox').fill('another note by playwright')
        await page.getByRole('button', { name: 'save' }).click()
      })
  
      test('importance can be changed', async ({ page }) => {
        await page.getByRole('button', { name: 'make not important' }).click()
        await expect(page.getByText('make important')).toBeVisible()
      })
    // highlight-end
    })
  })
})
```

Il test trova il pulsante <i>make not important</i> e lo preme. Poiché il database contiene una sola nota, il pulsante è univoco.

La seconda istruzione controlla che il testo sia diventato <i>make important</i>.

Il codice dei test è disponibile su [GitHub](https://github.com/fullstack-hy2020/notes-e2e/tree/part5-1), nel branch <i>part5-1</i>.

### Testare un login fallito

Scriviamo un test che verifichi il fallimento del login con una password errata.

Una prima versione è:

```js
describe('Note app', () => {
  // ...

  test('login fails with wrong password', async ({ page }) => {
    await page.getByRole('button', { name: 'login' }).click()
    await page.getByLabel('username').fill('mluukkai')
    await page.getByLabel('password').fill('wrong')
    await page.getByRole('button', { name: 'login' }).click()

    await expect(page.getByText('wrong credentials')).toBeVisible()
  })

  // ...
})
```

Il test cerca il messaggio di errore con [page.getByText](https://playwright.dev/docs/api/class-page#page-get-by-text) e ne verifica la visibilità.

L'applicazione visualizza il messaggio in un elemento con classe CSS <i>error</i>:

```js
const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div className="error"> // highlight-line
      {message}
    </div>
  )
}
```

Possiamo rendere il test più preciso, verificando che il messaggio compaia proprio nell'elemento con classe <i>error</i>:

```js
test('login fails with wrong password', async ({ page }) => {
  // ...

  const errorDiv = page.locator('.error') // highlight-line
  await expect(errorDiv).toContainText('wrong credentials')
})
```

[page.locator](https://playwright.dev/docs/api/class-page#page-locator) individua l'elemento con classe <i>error</i> e il locator viene salvato in una variabile. [toContainText](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-contain-text) controlla il testo. Ricorda che un [selettore CSS di classe](https://developer.mozilla.org/en-US/docs/Web/CSS/Class_selectors) inizia con un punto: in questo caso è <i>.error</i>.

Possiamo controllare anche gli stili con [toHaveCSS](https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-css). Verifichiamo, per esempio, che il messaggio sia rosso e abbia un bordo:

```js
test('login fails with wrong password', async ({ page }) => {
  // ...

  const errorDiv = page.locator('.error')
  await expect(errorDiv).toContainText('wrong credentials')
  await expect(errorDiv).toHaveCSS('border-style', 'solid') // highlight-line
  await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)') // highlight-line
})
```

Qui il colore viene confrontato nella rappresentazione [RGB](https://rgbcolorcode.com/color/red) restituita dal browser.

Completiamo il test verificando anche che il testo <i>'Matti Luukkainen logged in'</i>, che indica un login riuscito, **non sia visibile**:

```js
test('login fails with wrong password', async ({ page }) =>{
  await page.getByRole('button', { name: 'login' }).click()
  await page.getByLabel('username').fill('mluukkai')
  await page.getByLabel('password').fill('wrong')
  await page.getByRole('button', { name: 'login' }).click()

  const errorDiv = page.locator('.error')
  await expect(errorDiv).toContainText('wrong credentials')
  await expect(errorDiv).toHaveCSS('border-style', 'solid')
  await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

  await expect(page.getByText('Matti Luukkainen logged in')).not.toBeVisible() // highlight-line
})
```

### Eseguire un test alla volta

Per impostazione predefinita Playwright esegue tutti i test. Con l'aumentare del loro numero, questo richiede più tempo. Durante lo sviluppo o il debugging possiamo sostituire <i>test</i> con <i>test.only</i> per eseguire soltanto il test selezionato:

```js
describe(() => {
  // this is the only test executed!
  test.only('login fails with wrong password', async ({ page }) => {  // highlight-line
    // ...
  })

  // this test is skipped...
  test('user can login with correct credentials', async ({ page }) => {
    // ...
  })

  // ...
})
```

Quando il test è pronto, <i>only</i> **deve essere rimosso**.

Un'alternativa è selezionare il test dalla riga di comando:

```
npm test -- -g "login fails with wrong password"
```

### Funzioni di supporto per i test

Attualmente i test hanno questa struttura:

```js 
const { test, describe, expect, beforeEach } = require('@playwright/test')

describe('Note app', () => {
  // ...

  test('user can login with correct credentials', async ({ page }) => {
    await page.getByRole('button', { name: 'login' }).click()
    await page.getByLabel('username').fill('mluukkai')
    await page.getByLabel('password').fill('salainen')
    await page.getByRole('button', { name: 'login' }).click()
    await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
  })

  test('login fails with wrong password', async ({ page }) =>{
    // ...
  })

  describe('when logged in', () => {
    beforeEach(async ({ page, request }) => {
      await page.getByRole('button', { name: 'login' }).click()
      await page.getByLabel('username').fill('mluukkai')
      await page.getByLabel('password').fill('salainen')
      await page.getByRole('button', { name: 'login' }).click()
    })

    test('a new note can be created', async ({ page }) => {
      // ...
    })
  
    // ...
  })  
})
```

Prima verifichiamo il login. Un secondo blocco _describe_ raccoglie poi i test che richiedono un utente autenticato; il suo _beforeEach_ effettua l'accesso.

Ogni test riparte dallo stato iniziale: database svuotato e un utente appena creato. La posizione nel file non implica che un test erediti lo stato lasciato da quello precedente.

Anche nei test conviene evitare duplicazioni. Estraiamo il login in una funzione di supporto, per esempio nel file _tests/helper.js_:

```js 
const loginWith = async (page, username, password)  => {
  await page.getByRole('button', { name: 'login' }).click()
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

export { loginWith }
```

I test diventano più semplici e leggibili:

```js
const { test, describe, expect, beforeEach } = require('@playwright/test')
const { loginWith } = require('./helper') // highlight-line

describe('Note app', () => {
  // ...

  test('user can log in', async ({ page }) => {
    await loginWith(page, 'mluukkai', 'salainen') // highlight-line
    await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
  })

  test('login fails with wrong password', async ({ page }) => {
    await loginWith(page, 'mluukkai', 'wrong') // highlight-line

    const errorDiv = page.locator('.error')
    // ...
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen') // highlight-line
    })

    // ...
  })
})
```

Playwright offre anche una [modalità di autenticazione condivisa](https://playwright.dev/docs/auth): si effettua il login prima dei test e ciascun test carica uno stato browser già autenticato.

Per usarla dovremmo cambiare la preparazione dei dati. Attualmente eliminiamo e ricreiamo l'utente prima di ogni test, invalidando il riferimento contenuto nel token ottenuto in precedenza. Dovremmo invece inizializzare l'utente una sola volta. Per semplicità manteniamo il login nel _beforeEach_.

Anche la creazione di note contiene codice ripetuto: usiamo il form sia nel test dedicato sia nel _beforeEach_ che prepara il test sull'importanza:

```js
describe('Note app', function() {
  // ...

  describe('when logged in', () => {
    test('a new note can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new note' }).click()
      await page.getByRole('textbox').fill('a note created by playwright')
      await page.getByRole('button', { name: 'save' }).click()
      await expect(page.getByText('a note created by playwright')).toBeVisible()
    })
  
    describe('and a note exists', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: 'new note' }).click()
        await page.getByRole('textbox').fill('another note by playwright')
        await page.getByRole('button', { name: 'save' }).click()
      })
  
      test('it can be made important', async ({ page }) => {
        // ...
      })
    })
  })
})
```

Estraiamo quindi anche la creazione di note in una funzione di supporto. Il file _tests/helper.js_ diventa:

```js
const loginWith = async (page, username, password)  => {
  await page.getByRole('button', { name: 'login' }).click()
  await page.getByLabel('username').fill(username)
  await page.getByLabel('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

// highlight-start
const createNote = async (page, content) => {
  await page.getByRole('button', { name: 'new note' }).click()
  await page.getByRole('textbox').fill(content)
  await page.getByRole('button', { name: 'save' }).click()
}
// highlight-end

export { loginWith, createNote } // highlight-line
```

I test si semplificano così:

```js
const { test, describe, expect, beforeEach } = require('@playwright/test')
const { createNote, loginWith } = require('./helper') // highlight-line

describe('Note app', () => {
  // ...

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'mluukkai', 'salainen')
    })

    test('a new note can be created', async ({ page }) => {
      await createNote(page, 'a note created by playwright') // highlight-line
      await expect(page.getByText('a note created by playwright')).toBeVisible()
    })

    describe('and a note exists', () => {
      beforeEach(async ({ page }) => {
        await createNote(page, 'another note by playwright') // highlight-line
      })
  
      test('importance can be changed', async ({ page }) => {
        await page.getByRole('button', { name: 'make not important' }).click()
        await expect(page.getByText('make important')).toBeVisible()
      })
    })
  })
})
```

Rimane una ripetizione: gli indirizzi <i>http://localhost:5173</i> e <i>http://localhost:3001</i> sono scritti direttamente nei test. Il secondo non è necessario, perché il proxy configurato in Vite inoltra al backend le richieste dirette a <i>http://localhost:5173/api</i>:

```js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    }
  },
  // ...
})
```

Possiamo quindi sostituire nei test _http://localhost:3001/api/..._ con _http://localhost:5173/api/..._.

Definiamo poi l'opzione _baseURL_ nel file <i>playwright.config.js</i>:

```js
export default defineConfig({
  // ...
  use: {
    baseURL: 'http://localhost:5173',
    // ...
  },
  // ...
})
```

Le istruzioni che usano l'indirizzo dell'applicazione, per esempio:

```js
await page.goto('http://localhost:5173')
await request.post('http://localhost:5173/api/testing/reset')
```

possono diventare:

```js
await page.goto('/')
await request.post('/api/testing/reset')
```

Il codice aggiornato è disponibile su [GitHub](https://github.com/fullstack-hy2020/notes-e2e/tree/part5-2), nel branch <i>part5-2</i>.

### Tornare al test sulla modifica dell'importanza

Riprendiamo il test che verifica la modifica dell'importanza di una nota.

Modifichiamo la preparazione affinché crei due note:

```js
describe('when logged in', () => {
  // ...
  describe('and several notes exists', () => { // highlight-line
    beforeEach(async ({ page }) => {
      // highlight-start
      await createNote(page, 'first note')
      await createNote(page, 'second note')
      // highlight-end
    })

    test('one of those can be made nonimportant', async ({ page }) => {
      const otherNoteElement = page.getByText('first note')

      await otherNoteElement
        .getByRole('button', { name: 'make not important' }).click()
      await expect(otherNoteElement.getByText('make important')).toBeVisible()
    })
  })
})
```

Il test cerca l'elemento della prima nota con _page.getByText_ e salva il locator in una variabile. Al suo interno trova il pulsante <i>make not important</i> e lo preme, poi verifica che il testo sia diventato <i>make important</i>.

Possiamo scrivere il test anche senza la variabile di appoggio:

```js
test('one of those can be made nonimportant', async ({ page }) => {
  page.getByText('first note')
    .getByRole('button', { name: 'make not important' }).click()

  await expect(page.getByText('first note').getByText('make important'))
    .toBeVisible()
})
```

**Nota:** nell'esempio originale appena riportato manca _await_ davanti alla chiamata che termina con _.click()_. Aggiungilo quando usi questa variante, così il test attende il completamento del clic.

Modifichiamo ora _Note_ per racchiudere il contenuto della nota in uno _span_:

```js
const Note = ({ note, toggleImportance }) => {
  const label = note.important
    ? 'make not important' : 'make important'

  return (
    <li className='note'>
      <span>{note.content}</span> // highlight-line
      <button onClick={toggleImportance}>{label}</button>
    </li>
  )
}
```

Il test si rompe: _page.getByText('first note')_ ora individua lo _span_, mentre il pulsante si trova al di fuori di esso.

Possiamo correggerlo così:

```js
test('one of those can be made nonimportant', async ({ page }) => {
  const otherNoteText = page.getByText('first note') // highlight-line
  const otherNoteElement = otherNoteText.locator('..') // highlight-line

  await otherNoteElement.getByRole('button', { name: 'make not important' }).click()
  await expect(otherNoteElement.getByText('make important')).toBeVisible()
})
```

La prima riga trova lo _span_ contenente il testo della prima nota. La seconda usa _locator('..')_ per risalire al genitore.

Il metodo locator accetta sia selettori CSS sia [selettori XPath](https://playwright.dev/docs/locators#locate-by-css-or-xpath). Qui usiamo [XPath](https://developer.mozilla.org/en-US/docs/Web/XPath), che permette di indicare il genitore con _.._. Potremmo ottenere lo stesso risultato con un selettore CSS appropriato, ma questa espressione è particolarmente breve.

Possiamo anche usare una sola variabile di appoggio:

```js
test('one of those can be made nonimportant', async ({ page }) => {
  const secondNoteElement = page.getByText('second note').locator('..')
  await secondNoteElement.getByRole('button', { name: 'make not important' }).click()
  await expect(secondNoteElement.getByText('make important')).toBeVisible()
})
```

Modifichiamo il gruppo per creare tre note e cambiare l'importanza della seconda:

```js
describe('when logged in', () => {
  beforeEach(async ({ page }) => {
    await loginWith(page, 'mluukkai', 'salainen')
  })

  test('a new note can be created', async ({ page }) => {
    await createNote(page, 'a note created by playwright', true)
    await expect(page.getByText('a note created by playwright')).toBeVisible()
  })

  describe('and several notes exists', () => {
    beforeEach(async ({ page }) => {
      await createNote(page, 'first note')
      await createNote(page, 'second note')
      await createNote(page, 'third note') // highlight-line
    })

    test('one of those can be made nonimportant', async ({ page }) => {
      const otherNoteText = page.getByText('second note') // highlight-line
      const otherNoteElement = otherNoteText.locator('..')
    
      await otherNoteElement.getByRole('button', { name: 'make not important' }).click()
      await expect(otherNoteElement.getByText('make important')).toBeVisible()
    })
  })
}) 
```

Il test inizia a comportarsi in modo instabile: a volte passa e a volte fallisce. È il momento di imparare a eseguire il debugging dei test.

### Sviluppare e correggere i test

Quando un test fallisce e sospettiamo un problema nel test stesso, possiamo eseguirlo in [modalità debug](https://playwright.dev/docs/debug#run-in-debug-mode-1).

Il seguente comando avvia il test problematico in questa modalità:

```
npm test -- -g'one of those can be made nonimportant' --debug
```

Playwright Inspector mostra l'esecuzione passo per passo. Il pulsante con la freccia e il punto permette di avanzare di un'istruzione; il browser evidenzia gli elementi individuati e le interazioni:

![Playwright Inspector evidenzia l'elemento trovato dal locator](../../images/5/play6a.png)

Seguire un test complesso dall'inizio può essere laborioso. Possiamo fermarci direttamente nel punto che ci interessa con _await page.pause()_:

```js
describe('Note app', () => {
  beforeEach(async ({ page, request }) => {
    // ...
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      // ...
    })

    describe('and several notes exists', () => {
      beforeEach(async ({ page }) => {
        await createNote(page, 'first note')
        await createNote(page, 'second note')
        await createNote(page, 'third note')
      })
  
      test('one of those can be made nonimportant', async ({ page }) => {
        await page.pause() // highlight-line
        const otherNoteText = page.getByText('second note')
        const otherNoteElement = otherNoteText.locator('..')
      
        await otherNoteElement.getByRole('button', { name: 'make not important' }).click()
        await expect(otherNoteElement.getByText('make important')).toBeVisible()
      })
    })
  })
})
```

Premendo la freccia verde nell'Inspector, il test prosegue fino a _page.pause()_.

A quel punto osserviamo un dettaglio interessante:

![stato dell'applicazione quando il test si ferma su page.pause](../../images/5/play6b.png)

Il browser <i>non mostra</i> tutte le note create nel _beforeEach_.

Il test comincia a creare una nuova nota prima che il server abbia risposto alla richiesta precedente e che la nota sia comparsa a schermo. Quando arrivano le risposte, gli aggiornamenti si basano sullo stato delle note catturato all'avvio delle rispettive operazioni: un aggiornamento può quindi sovrascriverne un altro. Nell'immagine la seconda nota è scomparsa dall'elenco visualizzato.

Per rendere sequenziali le operazioni del test, dopo ogni inserimento attendiamo che la nota compaia usando [waitFor](https://playwright.dev/docs/api/class-locator#locator-wait-for):

```js
const createNote = async (page, content) => {
  await page.getByRole('button', { name: 'new note' }).click()
  await page.getByRole('textbox').fill(content)
  await page.getByRole('button', { name: 'save' }).click()
  await page.getByText(content).waitFor() // highlight-line
}
```

In alternativa, o insieme al debugger, possiamo usare la modalità UI:

```
npm run test -- --ui
```

Un'altra possibilità è [Trace Viewer](https://playwright.dev/docs/trace-viewer-intro). Registra una traccia visiva del test, consultabile anche dopo l'esecuzione. Per registrarla:

```
npm run test -- --trace on
```

Apri poi il report con:

```
npx playwright show-report
```

oppure con _npm run test:report_ e seleziona la traccia del test.

Trace Viewer offre una vista simile alla modalità UI.

Entrambi gli strumenti consentono di cercare i locator in modo assistito: premi l'icona con i due cerchi nella barra inferiore e seleziona un elemento dell'interfaccia. Playwright ne propone un locator:

![ricerca assistita dei locator in Trace Viewer](../../images/5/play8.png)

Per il pulsante della terza nota propone:

```js
page.locator('li').filter({ hasText: 'third note' }).getByRole('button')
```

[page.locator](https://playwright.dev/docs/api/class-page#page-locator) riceve _li_ e seleziona gli elementi della lista. [filter](https://playwright.dev/docs/api/class-locator#locator-filter) restringe la selezione a quello contenente <i>third note</i>; [getByRole](https://playwright.dev/docs/api/class-locator#locator-get-by-role) cerca infine il pulsante al suo interno.

Il locator generato è diverso da quello usato in precedenza nei nostri test:

```js
page.getByText('first note').locator('..').getByRole('button', { name: 'make not important' })
```

La scelta dipende dalla struttura dell'interfaccia e da quanto il selettore resta comprensibile e stabile quando il markup cambia.

Playwright include inoltre un [generatore di test](https://playwright.dev/docs/codegen-intro), capace di registrare le interazioni con l'interfaccia. Avvialo con:

```
npx playwright codegen http://localhost:5173/
```

Quando la modalità <i>Record</i> è attiva, le interazioni vengono registrate nell'Inspector. Puoi poi copiare locator e azioni nei test:

![modalità Record e codice generato dalle interazioni](../../images/5/play9.png)

Puoi usare Playwright anche tramite l'estensione per [VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright), che offre funzionalità come i breakpoint per il debugging.

Per comprendere meglio lo strumento consulta la [documentazione](https://playwright.dev/docs/intro), in particolare:

- [Locator](https://playwright.dev/docs/locators), per trovare gli elementi nei test
- [Azioni](https://playwright.dev/docs/input), per simulare le interazioni con il browser
- [Asserzioni](https://playwright.dev/docs/test-assertions), per verificare i risultati

La documentazione delle [API](https://playwright.dev/docs/api/class-playwright) contiene i dettagli. Sono particolarmente utili le classi [Page](https://playwright.dev/docs/api/class-page), che rappresenta una pagina del browser, e [Locator](https://playwright.dev/docs/api/class-locator), che rappresenta una ricerca di elementi.

La versione finale dei test è su [GitHub](https://github.com/fullstack-hy2020/notes-e2e/tree/part5-3), nel branch <i>part5-3</i>.

Il frontend aggiornato è su [GitHub](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part5-9), nel branch <i>part5-9</i>.

</div>

<div class="tasks">

### Esercizi 5.17-5.23

Scriviamo alcuni test E2E per Bloglist. Il materiale precedente copre la maggior parte degli esercizi, ma consulta anche la [documentazione](https://playwright.dev/docs/intro) e le [API di Playwright](https://playwright.dev/docs/api/class-playwright), almeno nelle sezioni appena indicate.

#### 5.17: Test end-to-end della lista di blog, passo 1

Crea un progetto npm separato per i test e configura Playwright.

Scrivi un test che verifichi che all'apertura dell'applicazione sia mostrato il modulo di login.

Usa questa struttura:

```js 
const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    // ...
  })
})

```

#### 5.18: Test end-to-end della lista di blog, passo 2

Verifica sia il login riuscito sia quello fallito. Crea l'utente necessario nel blocco _beforeEach_.

La struttura dei test diventa:

```js 
const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // empty the db here
    // create a user for the backend here
    // ...
  })

  test('Login form is shown', async ({ page }) => {
    // ...
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      // ...
    })

    test('fails with wrong credentials', async ({ page }) => {
      // ...
    })
  })
})
```

Il _beforeEach_ deve svuotare il database, per esempio usando l'endpoint di ripristino visto nel [materiale](/it/part5/test_end_to_end_con_playwright#controllare-lo-stato-del-database).

#### 5.19: Test end-to-end della lista di blog, passo 3

Scrivi un test che verifichi che un utente autenticato possa creare un blog. Puoi usare questa struttura:

```js 
describe('When logged in', () => {
  beforeEach(async ({ page }) => {
    // ...
  })

  test('a new blog can be created', async ({ page }) => {
    // ...
  })
})
```

Il test deve verificare che il nuovo blog sia visibile nella lista.

#### 5.20: Test end-to-end della lista di blog, passo 4

Scrivi un test che verifichi la possibilità di aggiungere un like a un blog.

#### 5.21: Test end-to-end della lista di blog, passo 5

Scrivi un test che verifichi che l'autore di un blog possa eliminarlo. Se usi _window.confirm_, approfondisci come gestire le finestre di dialogo nei test Playwright.

#### 5.22: Test end-to-end della lista di blog, passo 6

Scrivi un test che verifichi che soltanto l'utente che ha aggiunto un blog ne veda il pulsante di eliminazione.

#### 5.23: Test end-to-end della lista di blog, passo 7

Scrivi un test che verifichi che i blog siano ordinati per numero di like, dal più apprezzato al meno apprezzato.

<i>Questo esercizio è sensibilmente più impegnativo dei precedenti.</i>

</div>
