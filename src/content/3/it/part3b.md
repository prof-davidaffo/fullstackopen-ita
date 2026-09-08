---
mainImage: ../../../images/part-3.svg
part: 3
letter: b
lang: it
---

<div class="content">

Colleghiamo il frontend realizzato nella [parte 2](/it/part2) al backend Express costruito nella sezione 3a.

Nella parte 2 il frontend recuperava le note da json-server all'indirizzo <http://localhost:3001/notes>. Il backend Express usa invece <http://localhost:3001/api/notes>. Modifichiamo quindi __baseUrl__ in <i>src/services/notes.js</i>:

```js
import axios from 'axios'
const baseUrl = 'http://localhost:3001/api/notes' //highlight-line

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

// ...

export default { getAll, create, update }
```

La richiesta GET del frontend non funziona:

![errore della richiesta GET negli strumenti di sviluppo](../../images/3/3ae.png)

Eppure possiamo accedere al backend dal browser e da Postman. Che cosa succede?

### Same-origin policy e CORS

Il problema è la _same-origin policy_. L'origine di un URL è determinata dalla combinazione di protocollo, hostname e porta:

```text
http://example.com:80/index.html
  
protocol: http
host: example.com
port: 80
```

Quando visitiamo un sito, il browser richiede al server il documento HTML, che può fare riferimento ad altre risorse. Se una risorsa proviene dalla stessa origine, la risposta viene elaborata normalmente. Se protocollo, host o porta differiscono, il browser controlla l'header _Access-Control-Allow-Origin_: accetta la risposta soltanto se questo autorizza l'origine della pagina, oppure tutte le origini mediante `*`.

La <strong>same-origin policy</strong> è un meccanismo di sicurezza dei browser che aiuta a prevenire il dirottamento delle sessioni e altre vulnerabilità.

Per consentire richieste legittime tra origini diverse esiste <strong>CORS</strong>, Cross-Origin Resource Sharing. In sintesi, alcune risorse come immagini e fogli di stile possono essere incorporate da altri domini, mentre richieste Ajax tra domini sono vietate per impostazione predefinita e devono essere autorizzate esplicitamente.

Il codice JavaScript nel browser può quindi comunicare, per impostazione predefinita, soltanto con server della stessa [origine](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy). Il frontend usa localhost:5173 e il backend localhost:3001: le porte diverse producono origini diverse.

Same-origin policy e CORS non appartengono specificamente a React o Node: sono principi generali di sicurezza delle applicazioni web.

Possiamo autorizzare le altre origini con il middleware [cors](https://github.com/expressjs/cors). Installiamolo nel backend:

```bash
npm install cors
```

e abilitiamolo per tutte le origini:

```js
const cors = require('cors')

app.use(cors())
```

**Nota:** in un'applicazione reale CORS va configurato con attenzione. Se il backend deve essere usato soltanto da uno specifico frontend, è preferibile autorizzare esclusivamente quell'origine.

Ora quasi tutte le funzioni del frontend operano correttamente. La modifica dell'importanza non funziona ancora perché non è stata implementata nel backend.

Potete approfondire CORS nella [documentazione di Mozilla](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

La configurazione è ora questa:

![diagramma del browser, dell'app React e del server](../../images/3/100_25.png)

L'applicazione React nel browser recupera i dati dal server Node/Express in esecuzione su localhost:3001.

### Pubblicare l'applicazione su Internet

Ora che l'intero stack è pronto, possiamo pubblicarlo.

I servizi PaaS, Platform as a Service, installano l'ambiente di esecuzione, per esempio Node.js, e possono offrire servizi aggiuntivi come i database.

Per questo corso consigliamo [Render](https://render.com/), che continua a offrire istanze web gratuite adatte a esercitazioni e prototipi. Le istanze gratuite si sospendono dopo 15 minuti senza traffico e impiegano del tempo a riattivarsi. [Fly.io](https://fly.io/) rimane un'alternativa più flessibile, ma dopo una prova limitata richiede un metodo di pagamento ed è quindi facoltativo.

Esistono anche altri servizi, come [Railway](https://railway.app) e [CodeSandbox](https://codesandbox.io), ma condizioni e piani gratuiti possono cambiare. Le istruzioni principali useranno Render.

Entrambi i servizi richiedono che il backend ascolti la porta indicata dall'ambiente di esecuzione. Modifichiamo la fine di <i>index.js</i>:

```js
const PORT = process.env.PORT || 3001  // highlight-line
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

Usiamo la porta definita nella [variabile d'ambiente](https://en.wikipedia.org/wiki/Environment_variable) _PORT_, oppure 3001 quando la variabile non esiste.

#### Fly.io

<i>Fly.io è una possibilità facoltativa e generalmente richiede una carta di pagamento dopo la breve prova iniziale.</i>

Installate `flyctl` seguendo la [guida ufficiale](https://fly.io/docs/hands-on/install-flyctl/), create un account ed eseguite l'accesso:

```bash
fly auth login
```

In alcuni sistemi il comando completo è _flyctl_. Se non funziona, potete usare Render, che non richiede l'installazione di un programma locale.

Inizializzate l'applicazione dalla directory principale:

```bash
fly launch --no-deploy
```

Scegliete un nome e una regione, senza creare database Postgres o Redis. Fly.io genera <i>fly.toml</i>; verificate la configurazione della porta:

```bash
[build]

[env]
  PORT = "3001" # add this

[http_service]
  internal_port = 3001 # ensure that this is same as PORT
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]
```

La variabile PORT deve coincidere con _internal_port_. Pubblicate con:

```bash
fly deploy
```

e aprite l'applicazione con:

```bash
fly apps open
```

Il comando _fly logs_ mostra i log del server: durante il debugging è utile mantenerli visibili.

**Nota:** se vengono create più macchine, lo stato memorizzato nella variabile `notes` può cambiare da una richiesta all'altra. Controllate con `fly scale show` e, se necessario, limitate l'applicazione a una macchina con `fly scale count 1`.

Se soprattutto su Windows WSL il comando seguente rimane bloccato:

```bash
flyctl ping -o personal
```

il computer non riesce a collegarsi a Fly.io. Questa [procedura](https://github.com/fullstack-hy2020/misc/blob/master/fly_io_problem.md) descrive una possibile soluzione. Un risultato regolare è simile a:

```bash
$ flyctl ping -o personal
35 bytes from fdaa:0:8a3d::3 (gateway), seq=0 time=65.1ms
35 bytes from fdaa:0:8a3d::3 (gateway), seq=1 time=28.5ms
35 bytes from fdaa:0:8a3d::3 (gateway), seq=2 time=29.3ms
...
```

Dopo ogni modifica, una nuova versione si pubblica con:

```bash
fly deploy
```

#### Render

Accedete al [pannello Render](https://dashboard.render.com/) con GitHub e create un nuovo **Web Service**:

![creazione di un Web Service](../../images/3/r1.png)

Collegate il repository dell'applicazione:

![repository collegato a Render](../../images/3/r2.png)

Il repository deve essere accessibile a Render. Se il backend non si trova nella radice, configurate correttamente <i>Root Directory</i>:

![campo Root Directory](../../images/3/r3.png)

Selezionate il piano gratuito per le esercitazioni. Al termine della configurazione, il pannello mostra lo stato e l'URL pubblico:

![stato e URL dell'applicazione](../../images/3/r4.png)

Normalmente ogni commit inviato a GitHub avvia una nuova distribuzione. Se non accade, usate il deploy manuale dal pannello:

![deploy manuale dell'ultimo commit](../../images/3/r5.png)

I log sono disponibili nella relativa scheda:

![log dell'applicazione su Render](../../images/3/r7.png)

Render assegna la porta tramite `PORT`, quindi <i>index.js</i> deve contenere:

```js
const PORT = process.env.PORT || 3001  // highlight-line
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

Le istanze gratuite hanno un filesystem temporaneo e si sospendono dopo un periodo di inattività. È normale che la prima richiesta dopo la sospensione sia più lenta; i dati salvati soltanto in memoria scompaiono al riavvio.

### Build di produzione del frontend

Finora abbiamo eseguito React in <i>modalità di sviluppo</i>, che offre messaggi chiari e aggiornamento immediato delle modifiche.

Per pubblicare l'applicazione serve una [build di produzione](https://vitejs.dev/guide/build.html), ottimizzata per l'esecuzione pubblica. Nel progetto frontend della [parte 2](/it/part2) eseguiamo:

```bash
npm run build
```

Vite crea la directory <i>dist</i>, contenente <i>index.html</i>, gli asset e una versione [minificata](<https://en.wikipedia.org/wiki/Minification_(programming)>) del codice e delle dipendenze. Anche se il sorgente è suddiviso in più file, il risultato viene raggruppato e ottimizzato.

Il codice minificato è difficilmente leggibile:

```js
!function(e){function r(r){for(var n,f,i=r[0],l=r[1],a=r[2],c=0,s=[];c<i.length;c++)f=i[c],o[f]&&s.push(o[f][0]),o[f]=0;for(n in l)Object.prototype.hasOwnProperty.call(l,n)&&(e[n]=l[n]);for(p&&p(r);s.length;)s.shift()();return u.push.apply(u,a||[]),t()}function t(){for(var e,r=0;r<u.length;r++){for(var t=u[r],n=!0,i=1;i<t.length;i++){var l=t[i];0!==o[l]&&(n=!1)}n&&(u.splice(r--,1),e=f(f.s=t[0]))}return e}var n={},o={2:0},u=[];function f(r){if(n[r])return n[r].exports;var t=n[r]={i:r,l:!1,exports:{}};return e[r].call(t.exports,t,t.exports,f),t.l=!0,t.exports}f.m=e,f.c=n,f.d=function(e,r,t){f.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:t})},f.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"})
```

### Servire file statici dal backend

Una possibilità consiste nel copiare la build <i>dist</i> nella radice del backend e configurare Express affinché ne serva la pagina principale.

Da macOS o Linux, nella directory del frontend:

```bash
cp -r dist ../backend
```

Su Windows potete usare [copy](https://www.windows-commandline.com/windows-copy-command-syntax-examples/), [xcopy](https://www.windows-commandline.com/xcopy-command-syntax-examples/) oppure copiare la directory manualmente.

Il backend avrà questa struttura:

![directory dist nel backend](../../images/3/27v.png)

Per servire <i>index.html</i>, JavaScript, CSS e gli altri contenuti statici usiamo il middleware integrato [static](http://expressjs.com/en/starter/static-files.html):

```js
app.use(express.static('dist'))
```

Per ogni GET, Express controlla prima se in <i>dist</i> esista un file corrispondente all'indirizzo. La radice e <i>/index.html</i> mostrano il frontend React; <i>/api/notes</i> continua a essere gestito dal backend.

Poiché frontend e backend hanno ora lo stesso indirizzo, possiamo usare un URL [relativo](https://www.w3.org/TR/WD-html40-970917/htmlweb.html#h-5.1.2):

```js
import axios from 'axios'
const baseUrl = '/api/notes' // highlight-line

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

// ...
```

Dopo la modifica ricreiamo la build del frontend e copiamola nuovamente nel backend. L'intera applicazione è ora disponibile da <http://localhost:3001>:

![applicazione Notes su localhost:3001](../../images/3/28new.png)

Funziona come l'esempio di [single-page application](/it/part0/fondamenti_delle_applicazioni_web#applicazione-a-pagina-singola) studiato nella parte 0.

Visitando la radice, il server restituisce <i>dist/index.html</i>:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
    <script type="module" crossorigin src="/assets/index-5f6faa37.js"></script>
    <link rel="stylesheet" href="/assets/index-198af077.css">
  </head>
  <body>
    <div id="root"></div>
    
  </body>
</html>

```

Il file ordina al browser di recuperare il CSS e il JavaScript dell'applicazione React. Quest'ultima richiede poi le note da <http://localhost:3001/api/notes>. La comunicazione è visibile nella scheda Network:

![richieste dell'applicazione nella scheda Network](../../images/3/29new.png)

La configurazione pronta per la produzione è:

![diagramma della configurazione pronta alla pubblicazione](../../images/3/101.png)

Tutto risiede nel backend Node/Express su localhost:3001: il browser riceve index.html, scarica la build React e questa recupera i dati JSON da `/api/notes`.

### Pubblicare l'intera applicazione

Dopo aver verificato localmente la build di produzione, distribuiamo l'applicazione sul servizio scelto.

<strong>Con Fly.io</strong> eseguiamo:

```bash
fly deploy
```

<strong>Nota:</strong> controllate _.dockerignore_: se contiene `dist`, rimuovete quella riga affinché la build del frontend venga caricata.

<strong>Con Render</strong>, aggiungete `dist` al repository del backend, create un commit e inviatelo a GitHub. Assicuratevi che <i>dist</i> non sia ignorata. Se il deploy automatico non parte, avviatelo manualmente dal pannello.

L'applicazione funziona, tranne la modifica dell'importanza che non è ancora implementata nel backend:

![applicazione Notes pubblicata](../../images/3/30new.png)

<i>**Nota:** la modifica dell'importanza NON funziona ancora.</i>

Le note sono salvate in una variabile: se l'applicazione si arresta o viene riavviata, tutti i dati scompaiono. Serve un database, che introdurremo fra poco.

![backend Node/Express sul servizio di hosting](../../images/3/102.png)

Il backend risiede ora su Render o Fly.io. Alla radice il browser carica React, che richiede i dati JSON allo stesso server.

### Semplificare la pubblicazione del frontend

Per creare e copiare automaticamente la build, aggiungiamo alcuni script al <i>package.json</i> del backend.

#### Script per Fly.io

```json
{
  "scripts": {
    // ...
    "build:ui": "rm -rf dist && cd ../notes-frontend/ && npm run build && cp -r dist ../notes-backend",
    "deploy": "fly deploy",
    "deploy:full": "npm run build:ui && npm run deploy",    
    "logs:prod": "fly logs"
  }
}
```

_npm run build:ui_ costruisce il frontend e lo copia nel backend; _npm run deploy_ pubblica il backend; _npm run deploy:full_ combina le due operazioni; _npm run logs:prod_ mostra i log. Adattate i percorsi alla posizione reale delle directory.

##### Nota per chi usa Windows

I comandi shell dello script non funzionano direttamente in Windows. In PowerShell potete usare:

```json
"build:ui": "@powershell Remove-Item -Recurse -Force dist && cd ../frontend && npm run build && @powershell Copy-Item dist -Recurse ../backend",
```

Verificate di usare PowerShell e non il Prompt dei comandi. Git Bash consente invece di usare comandi simili a quelli Linux.

#### Render

Per Render è consigliato un repository separato per il backend, selezionato direttamente dal pannello. Gli script possono essere:

```json
{
  "scripts": {
    //...
    "build:ui": "rm -rf dist && cd ../frontend && npm run build && cp -r dist ../backend",
    "deploy:full": "npm run build:ui && git add . && git commit -m uibuild && git push"
  }
}
```

Il primo script costruisce e copia il frontend; il secondo aggiorna il repository del backend. Anche qui i percorsi dipendono dalla disposizione delle directory.

> **Nota:** in Windows gli script npm usano normalmente `cmd.exe`, che non comprende i comandi Bash. È possibile configurare Git Bash:

```md
npm config set script-shell "C:\Program Files\git\bin\bash.exe"
```

Un'altra possibilità è [shx](https://www.npmjs.com/package/shx).

### Proxy

Dopo aver reso relativo l'URL, il frontend non funziona più in sviluppo:

![errore 404 nel frontend di sviluppo](../../images/3/32new.png)

Con:

```js
const baseUrl = '/api/notes'
```

il frontend su localhost:5173 invia la richiesta a <i>localhost:5173/api/notes</i>, ma il backend è su localhost:3001.

Con Vite basta configurare un proxy in <i>vite.config.js</i>:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // highlight-start
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    }
  },
  // highlight-end
})

```

Dopo il riavvio, il server di sviluppo agisce da [proxy](https://vitejs.dev/config/server-options.html#server-proxy): inoltra al backend le richieste che iniziano con `/api` e gestisce normalmente le altre.

Il frontend funziona così sia in sviluppo sia in produzione. Dal suo punto di vista tutte le richieste hanno un'unica origine; possiamo quindi rimuovere il middleware CORS dal backend e la dipendenza:

```bash
npm remove cors
```

L'applicazione completa è ora pubblicata. Separare frontend e backend può essere utile in altre architetture e per realizzare una [pipeline di deployment](https://martinfowler.com/bliki/DeploymentPipeline.html), cioè un processo automatizzato che porta il codice attraverso test e controlli fino alla produzione. L'argomento viene trattato nella [parte 11](/it/part11).

Il backend di riferimento è nel branch <i>part3-3</i> su [GitHub](https://github.com/fullstack-hy2020/part3-notes-backend/tree/part3-3); le modifiche al frontend sono nel branch <i>part3-1</i> del [relativo repository](https://github.com/fullstack-hy2020/part2-notes-frontend/tree/part3-1).

</div>

<div class="tasks">

### Esercizi 3.9.-3.11

Gli esercizi richiedono poco codice, ma possono essere impegnativi: bisogna comprendere esattamente dove avviene ogni operazione e configurare correttamente tutte le parti.

#### 3.9: Backend della rubrica, passo 9

Collegate il backend al frontend della rubrica realizzato nella parte precedente. Non implementate ancora la modifica dei numeri, prevista nell'esercizio 3.17.

Probabilmente dovrete cambiare almeno gli URL nel frontend. Tenete aperte la console e la scheda Network del browser, oltre al terminale del backend. Per le POST è utile stampare `request.body`.

#### 3.10: Backend della rubrica, passo 10

Pubblicate il backend, preferibilmente su Render. Se scegliete Fly.io, eseguite i comandi dalla directory che contiene il <i>package.json</i> del backend.

**Suggerimento:** durante i primi deploy mantenete sempre visibili i log dell'applicazione.

Provate il backend pubblico con browser, Postman o REST Client. Create inoltre un <i>README.md</i> nella radice del repository e aggiungetevi il collegamento all'applicazione online.

#### 3.11: Rubrica full stack

Generate la build di produzione del frontend e aggiungetela all'applicazione pubblicata con il metodo descritto in questa sezione.

Verificate che il frontend continui a funzionare anche localmente con _npm run dev_. Se usate Render, assicuratevi che <i>dist</i> non sia ignorata da Git nel backend.

**Nota:** in questa parte non dovete pubblicare il frontend separatamente. Viene pubblicato soltanto il repository del backend, che contiene e serve la build del frontend come spiegato in [Servire file statici dal backend](/it/part3/pubblicare_lapplicazione_su_internet#servire-file-statici-dal-backend).

</div>
