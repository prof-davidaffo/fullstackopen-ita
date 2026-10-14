---
mainImage: ../../../images/part-0.svg
part: 0
letter: b
lang: it
---

<div class="content">

Prima di iniziare a programmare, esamineremo alcuni principi dello sviluppo web attraverso un'applicazione di esempio disponibile all'indirizzo [/exampleapp](/exampleapp).

L'applicazione serve soltanto a illustrare alcuni concetti di base del corso e non è assolutamente un esempio di <i>come</i> dovrebbe essere realizzata un'applicazione web moderna. Al contrario, mostra alcune vecchie tecniche di sviluppo web che oggi potrebbero essere considerate persino <i>cattive pratiche</i>.

Dalla [parte 1](/it/part1) in poi, il codice seguirà le pratiche moderne.

Apri nel browser l'[applicazione di esempio](/exampleapp). A volte il caricamento richiede un po' di tempo.

Il materiale del corso è stato realizzato e adattato per il browser Chrome.

**Prima regola dello sviluppo web**: mantieni sempre aperta la console degli strumenti per sviluppatori del browser. Su macOS, aprila premendo contemporaneamente _fn_-_F12_ oppure _option-cmd-i_. Su Windows o Linux, premi _Fn_-_F12_ oppure _ctrl-shift-i_. La console può essere aperta anche dal [menu contestuale](https://en.wikipedia.org/wiki/Menu_key).

Ricorda di tenere <i>sempre</i> aperti gli strumenti per sviluppatori quando realizzi applicazioni web.

La console si presenta così:

![Schermata degli strumenti per sviluppatori aperti nel browser](../../images/0/1e.png)

Assicurati che sia aperta la scheda <i>Network</i> e seleziona l'opzione <i>Disable cache</i>, come nell'immagine. Può essere utile anche <i>Preserve log</i>, che conserva i messaggi quando la pagina viene ricaricata, oltre a "Hide extension URLs", che nasconde le richieste effettuate dalle estensioni installate nel browser.

**Nota:** la scheda più importante è <i>Console</i>. In questa introduzione, tuttavia, useremo molto anche la scheda <i>Network</i>.

### HTTP GET

Il server e il browser comunicano tramite il protocollo [HTTP](https://developer.mozilla.org/it/docs/Web/HTTP). La scheda <i>Network</i> mostra questa comunicazione.

Quando ricarichi la pagina, la console mostra che si sono verificati due eventi:

- il browser ha recuperato dal server il contenuto della pagina <i>exampleapp</i>;
- il browser ha scaricato l'immagine <i>kuva.png</i>.

![La console con le due richieste visibili](../../images/0/2e.png)

Su uno schermo piccolo potrebbe essere necessario allargare la finestra della console.

Facendo clic sul primo evento vengono mostrate maggiori informazioni:

![Vista dettagliata della prima richiesta](../../images/0/3e.png)

La sezione superiore, <i>General</i>, mostra che il browser ha richiesto l'indirizzo <i>[/exampleapp](/exampleapp)</i> tramite il metodo [GET](https://developer.mozilla.org/it/docs/Web/HTTP/Methods/GET). La richiesta ha avuto successo, dato che la risposta del server ha codice di stato [200](https://it.wikipedia.org/wiki/Codici_di_stato_HTTP).

La richiesta e la risposta del server contengono diverse [intestazioni HTTP](https://developer.mozilla.org/it/docs/Web/HTTP/Headers):

![Intestazioni della risposta](../../images/0/4e.png)

Le <i>Response headers</i> indicano, tra le altre cose, la dimensione della risposta in byte e l'ora esatta in cui è stata inviata. L'importante intestazione [Content-Type](https://developer.mozilla.org/it/docs/Web/HTTP/Headers/Content-Type) comunica che la risposta è un file di testo in formato [UTF-8](https://it.wikipedia.org/wiki/UTF-8), il cui contenuto è strutturato come HTML. Il browser sa quindi che si tratta di una normale pagina [HTML](https://developer.mozilla.org/it/docs/Web/HTML) e la visualizza come tale.

La scheda <i>Response</i> mostra i dati ricevuti: una normale pagina HTML. La sezione <i>body</i> determina la struttura della pagina visualizzata:

![Contenuto della scheda Response](../../images/0/5e.png)

La pagina contiene un elemento [div](https://developer.mozilla.org/it/docs/Web/HTML/Element/div), che a sua volta contiene un titolo, un collegamento alla pagina <i>notes</i>, un tag [img](https://developer.mozilla.org/it/docs/Web/HTML/Element/img) e il numero di note create.

A causa del tag img, il browser esegue una seconda richiesta HTTP per recuperare dal server l'immagine <i>kuva.png</i>:

![Vista dettagliata della seconda richiesta](../../images/0/6e.png)

La richiesta HTTP GET è inviata a [/exampleapp/kuva.png](/exampleapp/kuva.png). Le intestazioni indicano che la risposta misura 89350 byte e ha [Content-Type](https://developer.mozilla.org/it/docs/Web/HTTP/Headers/Content-Type) <i>image/png</i>. Il browser usa queste informazioni per visualizzare correttamente l'immagine.

La catena di eventi causata dall'apertura della pagina può essere rappresentata dal seguente [diagramma di sequenza](https://it.wikipedia.org/wiki/Diagramma_di_sequenza):

![Diagramma di sequenza del flusso descritto](../../images/0/7m.png)

Il diagramma mostra come browser e server comunicano nel tempo, che scorre dall'alto verso il basso. Il browser invia prima una richiesta HTTP GET per ottenere il codice HTML. Il tag <i>img</i> induce poi il browser a recuperare l'immagine <i>kuva.png</i>. Infine, il browser visualizza la pagina HTML e l'immagine.

Anche se è difficile notarlo, la pagina HTML inizia a essere visualizzata prima che l'immagine sia stata scaricata completamente.

### Applicazioni web tradizionali

La pagina iniziale dell'applicazione di esempio funziona come un'<i>applicazione web tradizionale</i>. Quando vi accediamo, il browser recupera dal server un documento HTML che descrive la struttura e il contenuto testuale della pagina.

Il server ha prodotto questo documento in qualche modo. Potrebbe essere un file di testo <i>statico</i> salvato sul server, oppure potrebbe essere generato <i>dinamicamente</i> dal codice dell'applicazione, per esempio usando dati provenienti da un database. Nell'applicazione di esempio l'HTML è generato dinamicamente, perché contiene il numero delle note create.

Il codice HTML della pagina iniziale viene generato sul server così:

```js
const getFrontPageHtml = noteCount => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
      </head>
      <body>
        <div class='container'>
          <h1>Full stack example app</h1>
          <p>number of notes created ${noteCount}</p>
          <a href='/notes'>notes</a>
          <img src='kuva.png' width='200' />
        </div>
      </body>
    </html>
`
}

app.get('/', (req, res) => {
  const page = getFrontPageHtml(notes.length)
  res.send(page)
})
```

Non è ancora necessario comprendere questo codice.

Il contenuto della pagina HTML è salvato in un template literal, cioè una stringa che permette di inserire al proprio interno valori come <em>noteCount</em>. Il numero delle note viene sostituito ogni volta dal valore corrente di <em>notes.length</em>.

Scrivere HTML in mezzo al codice non è una buona pratica, ma era normale per chi programmava in PHP secondo il vecchio stile.

Nelle applicazioni web tradizionali il browser è "stupido": recupera semplicemente l'HTML dal server, mentre tutta la logica applicativa si trova sul server. Quest'ultimo può essere realizzato, per esempio, con [Java Spring](https://spring.io/projects/spring-framework), [Python Flask](https://flask.palletsprojects.com/) o [Ruby on Rails](https://rubyonrails.org/).

L'esempio utilizza la libreria [Express](https://expressjs.com/) con Node.js. Nel corso useremo Node.js ed Express per creare server web.

### Esecuzione della logica applicativa nel browser

Mantieni aperti gli strumenti per sviluppatori. Svuota la console facendo clic sul simbolo 🚫 oppure digitando `clear()` nella console.

Quando apri la pagina delle [note](/exampleapp/notes), il browser effettua quattro richieste HTTP:

![Le quattro richieste nella console](../../images/0/8e.png)

Le richieste sono tutte di tipo <i>diverso</i>. La prima è di tipo <i>document</i>: contiene il codice HTML della pagina.

![Vista dettagliata della prima richiesta](../../images/0/9e.png)

Confrontando la pagina mostrata dal browser con l'HTML restituito dal server, notiamo che il codice non contiene l'elenco delle note. La sezione [head](https://developer.mozilla.org/it/docs/Web/HTML/Element/head) contiene un tag [script](https://developer.mozilla.org/it/docs/Web/HTML/Element/script), che induce il browser a recuperare un file JavaScript chiamato <i>main.js</i>.

Il codice JavaScript è il seguente:

```js
var xhttp = new XMLHttpRequest()

xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    const data = JSON.parse(this.responseText)
    console.log(data)

    var ul = document.createElement('ul')
    ul.setAttribute('class', 'notes')

    data.forEach(function(note) {
      var li = document.createElement('li')

      ul.appendChild(li)
      li.appendChild(document.createTextNode(note.content))
    })

    document.getElementById('notes').appendChild(ul)
  }
}

xhttp.open('GET', '/data.json', true)
xhttp.send()
```

I dettagli non sono ancora importanti: inizieremo davvero a programmare nella [parte 1](/it/part1). Il codice di esempio di questa parte non rappresenta le tecniche di programmazione adottate nel corso.

> Qualcuno potrebbe chiedersi perché venga usato l'oggetto xhttp invece del moderno fetch. Il motivo è che non vogliamo ancora introdurre le promise e che qui il codice ha un ruolo secondario. Torneremo ai metodi moderni per effettuare richieste al server nella [parte 2](/en/part2).

Subito dopo aver recuperato il file indicato dal tag <i>script</i>, il browser inizia a eseguirlo.

Le ultime due righe fanno eseguire al browser una richiesta HTTP GET all'indirizzo <i>/data.json</i> del server:

```js
xhttp.open('GET', '/data.json', true)
xhttp.send()
```

Si tratta della richiesta più in basso nella scheda Network.

Possiamo aprire direttamente nel browser [/exampleapp/data.json](/exampleapp/data.json):

![Dati JSON non formattati](../../images/0/10e.png)

Qui troviamo le note come dati "grezzi" in formato [JSON](https://it.wikipedia.org/wiki/JavaScript_Object_Notation). Per impostazione predefinita, i browser basati su Chromium non visualizzano molto bene il JSON. È possibile installare un'estensione come [JSONView](https://chromewebstore.google.com/detail/gmegofmjomhknnokphhckolhcffdaihd) e ricaricare la pagina per ottenere una visualizzazione formattata:

![Dati JSON formattati](../../images/0/11e.png)

Il codice JavaScript della pagina scarica quindi i dati JSON delle note e costruisce un elenco puntato con il loro contenuto:

```js
const data = JSON.parse(this.responseText)
console.log(data)

var ul = document.createElement('ul')
ul.setAttribute('class', 'notes')

data.forEach(function(note) {
  var li = document.createElement('li')

  ul.appendChild(li)
  li.appendChild(document.createTextNode(note.content))
})

document.getElementById('notes').appendChild(ul)
```

Il codice crea prima un elenco non ordinato tramite il tag [ul](https://developer.mozilla.org/it/docs/Web/HTML/Element/ul):

```js
var ul = document.createElement('ul')
ul.setAttribute('class', 'notes')
```

Successivamente aggiunge un tag [li](https://developer.mozilla.org/it/docs/Web/HTML/Element/li) per ogni nota. Soltanto il campo <i>content</i> viene inserito nell'elemento; le date presenti nei dati non vengono utilizzate.

```js
data.forEach(function(note) {
  var li = document.createElement('li')

  ul.appendChild(li)
  li.appendChild(document.createTextNode(note.content))
})
```

Apri ora la scheda <i>Console</i>:

![Scheda Console degli strumenti per sviluppatori](../../images/0/12e.png)

Facendo clic sul piccolo triangolo all'inizio della riga puoi espandere il testo mostrato nella console.

![Una voce della console espansa](../../images/0/13e.png)

Questo output è prodotto dal comando <em>console.log</em>:

```js
const data = JSON.parse(this.responseText)
console.log(data)
```

Dopo aver ricevuto i dati dal server, il codice li stampa nella console. Durante il corso, la scheda <i>Console</i> e il comando <em>console.log</em> diventeranno molto familiari.

### Gestori di eventi e funzioni di callback

La struttura del codice può sembrare insolita:

```js
var xhttp = new XMLHttpRequest()

xhttp.onreadystatechange = function() {
  // codice che gestisce la risposta del server
}

xhttp.open('GET', '/data.json', true)
xhttp.send()
```

La richiesta viene inviata nell'ultima riga, mentre il codice che gestisce la risposta si trova più in alto. Che cosa sta succedendo?

```js
xhttp.onreadystatechange = function () {
```

Questa riga definisce sul nostro oggetto <em>xhttp</em> un <i>gestore di eventi</i> per l'evento <i>onreadystatechange</i>. Quando lo stato dell'oggetto cambia, il browser chiama la funzione. Il codice verifica che [readyState](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState) sia uguale a 4, che indica che l'operazione è terminata, e che il codice di stato HTTP della risposta sia 200.

```js
xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    // codice che gestisce la risposta del server
  }
}
```

L'invocazione di gestori di eventi è molto comune in JavaScript. Queste funzioni sono dette funzioni di [callback](https://developer.mozilla.org/it/docs/Glossary/Callback_function). Non è il codice dell'applicazione a invocarle direttamente: è l'ambiente di esecuzione, in questo caso il browser, a chiamarle nel momento appropriato quando si verifica l'<i>evento</i>.

### Document Object Model o DOM

Possiamo immaginare una pagina HTML come una struttura ad albero implicita:

```
html
  head
    link
    script
  body
    div
      h1
      div
        ul
          li
          li
          li
      form
        input
        input
```

La stessa struttura ad albero è visibile nella scheda <i>Elements</i> della console.

![Scheda Elements degli strumenti per sviluppatori](../../images/0/14e.png)

Il funzionamento del browser si basa sulla rappresentazione degli elementi HTML come un albero.

Il Document Object Model, o [DOM](https://it.wikipedia.org/wiki/Document_Object_Model), è un'interfaccia di programmazione, cioè un'<i>API</i>, che permette di modificare tramite codice gli alberi di elementi corrispondenti alle pagine web.

Il codice JavaScript visto in precedenza usa l'API del DOM per aggiungere alla pagina l'elenco delle note. Il codice seguente crea un nuovo nodo, lo assegna alla variabile <em>ul</em> e vi aggiunge alcuni nodi figli:

```js
var ul = document.createElement('ul')

data.forEach(function(note) {
  var li = document.createElement('li')

  ul.appendChild(li)
  li.appendChild(document.createTextNode(note.content))
})
```

Infine, il ramo rappresentato dalla variabile <em>ul</em> viene collegato al punto corretto dell'albero HTML della pagina:

```js
document.getElementById('notes').appendChild(ul)
```

### Manipolare il documento dalla console

Il nodo più alto dell'albero DOM di un documento HTML è chiamato oggetto <em>document</em>. Attraverso l'API del DOM possiamo eseguire diverse operazioni sulla pagina. Digita <em>document</em> nella scheda Console per accedere all'oggetto:

![L'oggetto document nella console](../../images/0/15e.png)

Aggiungiamo una nuova nota alla pagina dalla console. Per prima cosa recuperiamo l'elenco delle note, che si trova nel primo elemento ul della pagina:

```js
list = document.getElementsByTagName('ul')[0]
```

Creiamo poi un nuovo elemento li e gli assegniamo del testo:

```js
newElement = document.createElement('li')
newElement.textContent = 'Manipolare la pagina dalla console è facile'
```

Infine aggiungiamo il nuovo elemento all'elenco:

```js
list.appendChild(newElement)
```

![Pagina con la nuova nota aggiunta](../../images/0/16e.png)

Anche se la pagina si aggiorna nel browser, la modifica non è permanente. Ricaricandola, la nuova nota scompare perché il cambiamento non è stato inviato al server. Il codice JavaScript costruisce sempre l'elenco a partire dai dati JSON disponibili all'indirizzo [/exampleapp/data.json](/exampleapp/data.json).

### CSS

L'elemento <i>head</i> della pagina Notes contiene un tag [link](https://developer.mozilla.org/it/docs/Web/HTML/Element/link), che fa recuperare al browser il foglio di stile [main.css](/exampleapp/main.css).

CSS, Cascading Style Sheets, è un linguaggio utilizzato per definire l'aspetto delle pagine web. Il file recuperato ha questo contenuto:

```css
.container {
  padding: 10px;
  border: 1px solid;
}

.notes {
  color: blue;
}
```

Il file definisce due [selettori di classe](https://developer.mozilla.org/it/docs/Web/CSS/Class_selectors), usati per selezionare parti della pagina e applicare loro regole di stile. Un selettore di classe inizia sempre con un punto seguito dal nome della classe.

Le classi sono [attributi](https://developer.mozilla.org/it/docs/Web/HTML/Global_attributes/class) che possono essere aggiunti agli elementi HTML. Possiamo esaminarli nella scheda <i>Elements</i>:

![Attributi CSS nella scheda Elements](../../images/0/17e.png)

L'elemento <i>div</i> più esterno appartiene alla classe <i>container</i>, mentre l'elemento <i>ul</i> che contiene le note appartiene alla classe <i>notes</i>.

La prima regola CSS aggiunge agli elementi con classe <i>container</i> un [bordo](https://developer.mozilla.org/it/docs/Web/CSS/border) largo un pixel e un [padding](https://developer.mozilla.org/it/docs/Web/CSS/padding) di 10 pixel, creando spazio tra contenuto e bordo. La seconda regola rende blu il testo della classe <i>notes</i>.

Gli elementi HTML possono avere attributi diversi dalla classe. Il <i>div</i> delle note possiede un attributo [id](https://developer.mozilla.org/it/docs/Web/HTML/Global_attributes/id), usato dal codice JavaScript per trovare l'elemento.

La scheda <i>Elements</i> permette anche di modificare gli stili:

![Regole CSS applicate alla classe container](../../images/0/18e.png)

Le modifiche effettuate dalla console non sono permanenti. Per conservarle devono essere salvate nel foglio di stile CSS sul server.

### Riepilogo del caricamento di una pagina con JavaScript

Rivediamo che cosa accade quando il browser apre [/exampleapp/notes](/exampleapp/notes).

![Diagramma della comunicazione tra browser e server](../../images/0/19m.png)

- Il browser recupera dal server il codice HTML che definisce contenuto e struttura della pagina tramite una richiesta HTTP GET.
- I collegamenti contenuti nell'HTML fanno recuperare anche il foglio di stile <i>main.css</i>...
- ...e il file JavaScript <i>main.js</i>.
- Il browser esegue il codice JavaScript, che invia una richiesta HTTP GET a [/exampleapp/data.json](/exampleapp/data.json) e riceve le note in formato JSON.
- Quando i dati sono disponibili, il browser esegue un <i>gestore di eventi</i> che usa l'API del DOM per visualizzare le note.

### Form e HTTP POST

Vediamo ora come viene aggiunta una nuova nota.

La pagina Notes contiene un [elemento form](https://developer.mozilla.org/it/docs/Learn/Forms/Your_first_form):

![Elemento form evidenziato nella pagina](../../images/0/20e.png)

Quando si fa clic sul pulsante, il browser invia al server il testo inserito dall'utente. Apriamo la scheda <i>Network</i> e osserviamo l'invio del form:

![Richieste prodotte dall'invio del form](../../images/0/21e.png)

Sorprendentemente, l'invio produce ben <i>cinque</i> richieste HTTP. La prima corrisponde all'invio del form:

![Dettaglio della prima richiesta](../../images/0/22e.png)

È una richiesta [HTTP POST](https://developer.mozilla.org/it/docs/Web/HTTP/Methods/POST) all'indirizzo <i>new\_note</i>. Il server risponde con il codice 302, un [reindirizzamento](https://it.wikipedia.org/wiki/Redirect), chiedendo al browser di effettuare una nuova richiesta HTTP GET all'indirizzo indicato nell'intestazione <i>Location</i>, cioè <i>notes</i>.

Il browser ricarica quindi la pagina Notes. Il caricamento causa altre tre richieste: il foglio di stile <i>main.css</i>, il file JavaScript <i>main.js</i> e i dati delle note <i>data.json</i>.

La scheda Network mostra anche i dati inviati dal form. Seleziona la richiesta e apri la scheda <i>Payload</i>:

![Dati del form negli strumenti per sviluppatori](../../images/0/23g.png)

Il tag Form possiede gli attributi <i>action</i> e <i>method</i>, che stabiliscono l'invio tramite una richiesta HTTP POST all'indirizzo <i>new\_note</i>.

![Attributi action e method](../../images/0/24e.png)

Il codice del server che gestisce la richiesta POST è piuttosto semplice. Nota che questo codice si trova sul server, non nel JavaScript scaricato dal browser:

```js
app.post('/new_note', (req, res) => {
  notes.push({
    content: req.body.note,
    date: new Date(),
  })

  return res.redirect('/notes')
})
```

I dati vengono inviati nel [corpo](https://developer.mozilla.org/it/docs/Web/HTTP/Methods/POST) della richiesta POST. Il server vi accede tramite il campo <em>req.body</em> dell'oggetto richiesta <em>req</em>.

Il server crea un nuovo oggetto nota e lo aggiunge all'array <em>notes</em>:

```js
notes.push({
  content: req.body.note,
  date: new Date(),
})
```

Ogni nota ha due campi: <i>content</i>, che contiene il testo, e <i>date</i>, che contiene data e ora di creazione. Le nuove note non vengono salvate in un database e scompaiono quando il server viene riavviato.

### AJAX

La pagina Notes segue uno stile di sviluppo dei primi anni Novanta e usa "Ajax", una tecnologia all'avanguardia nei primi anni Duemila.

[AJAX](<https://it.wikipedia.org/wiki/AJAX>) (Asynchronous JavaScript and XML) è un termine introdotto nel febbraio 2005 per descrivere un approccio allora rivoluzionario: recuperare contenuti tramite il JavaScript incluso nell'HTML senza dover ricaricare l'intera pagina.

Prima di AJAX, tutte le pagine funzionavano come le [applicazioni web tradizionali](/it/part0/fondamenti_delle_applicazioni_web#applicazioni-web-tradizionali) viste in precedenza: tutti i dati erano inclusi nell'HTML generato dal server.

La pagina Notes usa AJAX per recuperare i dati delle note, mentre il form viene ancora inviato con il meccanismo tradizionale.

Gli URL dell'applicazione riflettono quei tempi: i dati JSON vengono recuperati da [/exampleapp/data.json](/exampleapp/data.json) e le nuove note inviate a [/exampleapp/new_note](/exampleapp/new_note). Oggi URL simili non sarebbero considerati adeguati, perché non seguono le convenzioni delle API [RESTful](https://it.wikipedia.org/wiki/Representational_state_transfer), che approfondiremo nella [parte 3](/en/part3).

AJAX è ormai così comune da essere dato per scontato. Il termine è quasi scomparso e molti sviluppatori più giovani non lo hanno mai sentito.

### Applicazione a pagina singola

Nella nostra applicazione di esempio, la pagina iniziale funziona in modo tradizionale: tutta la logica si trova sul server e il browser si limita a visualizzare l'HTML ricevuto.

La pagina Notes affida invece al browser parte della responsabilità di generare l'HTML delle note. Il browser esegue il JavaScript ricevuto dal server, recupera le note come JSON e aggiunge alla pagina gli elementi HTML necessari attraverso l'[API del DOM](/it/part0/fondamenti_delle_applicazioni_web#document-object-model-o-dom).

Negli ultimi anni si è diffuso lo stile [Single-page application](https://it.wikipedia.org/wiki/Single-page_application), o SPA. Una SPA non recupera dal server una pagina HTML distinta per ogni schermata: riceve una sola pagina, il cui contenuto viene modificato dal JavaScript eseguito nel browser.

La pagina Notes somiglia in parte a una SPA, ma non lo è ancora del tutto. La visualizzazione delle note avviene nel browser, ma l'aggiunta di una nuova nota usa ancora il form tradizionale: i dati vengono inviati al server, che ordina al browser di ricaricare la pagina tramite un <i>redirect</i>.

Una versione SPA dell'applicazione è disponibile all'indirizzo [/exampleapp/spa](/exampleapp/spa). A prima vista è identica alla precedente. L'HTML è quasi uguale, ma il file JavaScript è diverso, <i>spa.js</i>, e cambia leggermente la definizione del form:

![Form privo degli attributi action e method](../../images/0/25e.png)

Il form non possiede gli attributi <i>action</i> o <i>method</i> che definiscono dove e come inviare i dati.

Apri la scheda <i>Network</i> e svuotala. Creando una nuova nota, vedrai che il browser invia al server una sola richiesta:

![Una richiesta POST a new_note_spa](../../images/0/26e.png)

La richiesta POST a <i>new\_note\_spa</i> contiene la nuova nota come JSON, con il testo, <i>content</i>, e la data, <i>date</i>:

```js
{
  content: "single page app does not reload the whole page",
  date: "2019-05-25T15:15:59.905Z"
}
```

L'intestazione <i>Content-Type</i> comunica al server che i dati sono rappresentati in formato JSON:

![Intestazione Content-Type con valore application/json](../../images/0/27e.png)

Senza questa intestazione, il server non saprebbe come interpretare correttamente i dati.

Il server risponde con il codice [201 Created](https://httpstatuses.com/201). Questa volta non richiede un reindirizzamento: il browser rimane sulla stessa pagina e non effettua altre richieste HTTP.

La versione SPA non invia il form nel modo tradizionale, ma usa il JavaScript recuperato dal server. Esaminiamo brevemente il codice, anche se non è ancora necessario comprenderne tutti i dettagli:

```js
var form = document.getElementById('notes_form')
form.onsubmit = function(e) {
  e.preventDefault()

  var note = {
    content: e.target.elements[0].value,
    date: new Date(),
  }

  notes.push(note)
  e.target.elements[0].value = ''
  redrawNotes()
  sendToServer(note)
}
```

Il comando <em>document.getElementById('notes\_form')</em> recupera un riferimento al form con ID "notes\_form" e registra un <i>gestore di eventi</i> per l'invio. Il gestore chiama subito <em>e.preventDefault()</em>, impedendo il comportamento predefinito che invierebbe i dati e provocherebbe una nuova richiesta GET.

Il gestore crea poi una nuova nota, la aggiunge all'elenco con <em>notes.push(note)</em>, aggiorna l'elenco visualizzato e invia la nota al server.

Il codice che invia la nota è il seguente:

```js
var sendToServer = function(note) {
  var xhttpForPost = new XMLHttpRequest()
  // ...

  xhttpForPost.open('POST', '/new_note_spa', true)
  xhttpForPost.setRequestHeader('Content-type', 'application/json')
  xhttpForPost.send(JSON.stringify(note))
}
```

Il codice stabilisce che i dati vengano inviati tramite HTTP POST e che il loro tipo sia JSON. Il tipo è indicato dall'intestazione <i>Content-Type</i>; i dati vengono infine convertiti in una stringa JSON.

Il codice completo dell'applicazione è disponibile su <https://github.com/mluukkai/example_app>. Ricorda che serve soltanto a illustrare i concetti del corso: in diversi punti adotta uno stile scadente e non deve essere preso come modello. Lo stesso vale per gli URL, come <i>new\_note\_spa</i>, che non rispetta le pratiche attuali.

### Librerie JavaScript

L'applicazione di esempio è realizzata con il cosiddetto [vanilla JavaScript](https://www.freecodecamp.org/news/is-vanilla-javascript-worth-learning-absolutely-c2c67140ac34/), usando soltanto JavaScript e l'API del DOM per manipolare la struttura delle pagine.

Spesso si usano librerie che offrono strumenti più comodi rispetto all'API del DOM. Una delle più note è [jQuery](https://jquery.com/).

jQuery nacque quando le applicazioni web seguivano soprattutto il modello tradizionale: il server generava pagine HTML, poi arricchite nel browser tramite JavaScript. Una ragione del suo successo fu la compatibilità tra browser: funzionava indipendentemente dal produttore e riduceva la necessità di soluzioni specifiche. Oggi, grazie all'evoluzione di JavaScript e al buon supporto delle funzionalità di base nei browser moderni, il suo utilizzo è meno giustificato.

La diffusione delle SPA portò strumenti più moderni. [BackboneJS](https://backbonejs.org/) fu uno dei preferiti della prima generazione. Dopo il [lancio](https://github.com/angular/angular.js/blob/master/CHANGELOG.md#100rc1-moir%C3%A9-vision-2012-03-13) nel 2012, [AngularJS](https://angularjs.org/) di Google divenne rapidamente quasi uno standard di fatto.

La popolarità di Angular calò nell'ottobre 2014, quando il team [annunciò la fine del supporto alla versione 1](https://web.archive.org/web/20151208002550/https://jaxenter.com/angular-2-0-announcement-backfires-112127.html) e l'assenza di compatibilità con Angular 2. Angular 2 e le versioni successive non ricevettero inizialmente un'accoglienza altrettanto calorosa.

Attualmente uno degli strumenti più popolari per realizzare la logica eseguita nel browser è la libreria [React](https://react.dev/). Nel corso conosceremo React e la libreria [Zustand](https://github.com/pmndrs/zustand), spesso usate insieme.

La posizione di React appare solida, ma il mondo JavaScript cambia continuamente. Anche [Vue.js](https://vuejs.org/), per esempio, ha conquistato grande interesse.

### Sviluppo web full stack

Che cosa significa il nome <i>Full stack web development</i>? Full stack è un'espressione molto usata, ma non possiede una definizione universalmente condivisa.

Quasi tutte le applicazioni web hanno almeno due "livelli": il browser, più vicino all'utente, e il server. Spesso sotto il server si trova anche un database. Possiamo quindi rappresentare l'<i>architettura</i> di un'applicazione web come una pila, o <i>stack</i>, di livelli.

Si parla anche di [frontend e backend](https://it.wikipedia.org/wiki/Front-end_e_back-end). Il browser costituisce il frontend e il JavaScript che vi viene eseguito è codice frontend. Il server costituisce invece il backend.

Nel contesto del corso, sviluppo web full stack significa occuparsi di tutte le parti dell'applicazione: frontend, backend e database. A volte vengono inclusi nello stack anche il software del server e il suo sistema operativo, ma non li approfondiremo.

Programmeremo il backend in JavaScript usando l'ambiente di esecuzione [Node.js](https://nodejs.org/). Usare lo stesso linguaggio in più livelli offre possibilità interessanti, ma non è un requisito dello sviluppo full stack.

In passato era più comune specializzarsi in un singolo livello, per esempio nel backend, perché le tecnologie frontend e backend erano molto diverse. Con la diffusione del full stack è diventato comune conoscere tutti i livelli e il database. Spesso uno sviluppatore full stack deve anche possedere competenze sufficienti di configurazione e amministrazione per eseguire l'applicazione, per esempio nel cloud.

### JavaScript fatigue

Lo sviluppo web full stack è impegnativo: molte cose accadono contemporaneamente in punti diversi e il debug è più difficile che nelle normali applicazioni desktop. JavaScript non si comporta sempre come ci si aspetterebbe e l'esecuzione asincrona introduce ulteriori difficoltà. La comunicazione sul web richiede la conoscenza di HTTP; bisogna inoltre gestire database, configurazione e amministrazione dei server. Infine, è utile conoscere abbastanza CSS da rendere le applicazioni almeno presentabili.

Il mondo JavaScript evolve rapidamente. Strumenti, librerie e linguaggio cambiano di continuo; questa instabilità ha dato origine all'espressione <em>JavaScript fatigue</em>. Puoi leggere [How to Manage JavaScript Fatigue su Auth0](https://auth0.com/blog/how-to-manage-javascript-fatigue/) oppure [JavaScript fatigue su Medium](https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4).

Durante il corso proverai probabilmente anche tu un po' di JavaScript fatigue. Per fortuna esistono modi per rendere più graduale l'apprendimento e possiamo iniziare dal codice anziché dalla configurazione. Non potremo evitarla completamente, ma nelle prossime settimane potremo procedere senza affrontare subito gli aspetti peggiori.

</div>

<div class="tasks">
  <h3>Esercizi 0.1-0.6</h3>

Organizza gli elaborati in cartelle con nomi chiari, distinguendo le parti e i gruppi di esercizi.

Una possibile struttura è la seguente:

```text
part0
part1
  courseinfo
  unicafe
  anecdotes
part2
  courseinfo
  phonebook
  countries
```

Ogni parte ha una propria cartella, che contiene una sottocartella per ciascun gruppo di esercizi.

  <h4>0.1: HTML</h4>

Ripassa le basi di HTML leggendo il tutorial di Mozilla: [Introduzione all'HTML](https://developer.mozilla.org/it/docs/Learn/HTML/Introduction_to_HTML/Getting_started).

<i>È sufficiente leggere il tutorial; non è richiesto un elaborato.</i>

  <h4>0.2: CSS</h4>

Ripassa le basi di CSS leggendo il tutorial di Mozilla: [Nozioni fondamentali di CSS](https://developer.mozilla.org/it/docs/Learn/Getting_started_with_the_web/CSS_basics).

<i>È sufficiente leggere il tutorial; non è richiesto un elaborato.</i>

  <h4>0.3: Form HTML</h4>

Studia le basi dei form HTML attraverso il tutorial Mozilla [Il tuo primo form](https://developer.mozilla.org/it/docs/Learn/Forms/Your_first_form).

<i>È sufficiente leggere il tutorial; non è richiesto un elaborato.</i>

  <h4>0.4: Diagramma di una nuova nota</h4>

Nella sezione [Riepilogo del caricamento di una pagina con JavaScript](/it/part0/fondamenti_delle_applicazioni_web#riepilogo-del-caricamento-di-una-pagina-con-java-script), la catena di eventi prodotta dall'apertura di [/exampleapp/notes](/exampleapp/notes) è rappresentata mediante un [diagramma di sequenza](https://it.wikipedia.org/wiki/Diagramma_di_sequenza).

Il diagramma è stato creato in un file Markdown di GitHub usando la sintassi [Mermaid](https://docs.github.com/it/get-started/writing-on-github/working-with-advanced-formatting/creating-diagrams):

```text
sequenceDiagram
    participant browser
    participant server

    browser->>server: GET /exampleapp/notes
    activate server
    server-->>browser: documento HTML
    deactivate server

    browser->>server: GET /exampleapp/main.css
    activate server
    server-->>browser: file CSS
    deactivate server

    browser->>server: GET /exampleapp/main.js
    activate server
    server-->>browser: file JavaScript
    deactivate server

    Note right of browser: il browser esegue il JavaScript che recupera il JSON dal server

    browser->>server: GET /exampleapp/data.json
    activate server
    server-->>browser: [{ "content": "HTML is easy", "date": "2023-1-1" }, ... ]
    deactivate server

    Note right of browser: il browser esegue la callback che visualizza le note
```

**Crea un diagramma simile** che rappresenti la situazione in cui l'utente crea una nuova nota nella pagina [/exampleapp/notes](/exampleapp/notes), scrivendo nel campo di testo e facendo clic sul pulsante <i>Save</i>.

Se necessario, rappresenta le operazioni eseguite nel browser o sul server come commenti nel diagramma. Non è obbligatorio usare un diagramma di sequenza: va bene qualsiasi rappresentazione sensata degli eventi.

Tutte le informazioni necessarie per questo esercizio e per i due successivi si trovano nella sezione [Form e HTTP POST](/it/part0/fondamenti_delle_applicazioni_web#form-e-http-post). Lo scopo è rileggere il testo e ragionare su ciò che accade. Non è necessario leggere il [codice dell'applicazione](https://github.com/mluukkai/example_app), anche se naturalmente è possibile farlo.

Puoi creare i diagrammi con qualsiasi programma, ma probabilmente il metodo più semplice è usare la sintassi [Mermaid](https://github.com/mermaid-js/mermaid#sequence-diagram-docs---live-editor), supportata direttamente nelle pagine Markdown di [GitHub](https://github.blog/2022-02-14-include-diagrams-markdown-files-mermaid/).

  <h4>0.5: Diagramma dell'applicazione a pagina singola</h4>

Crea un diagramma che rappresenti la situazione in cui l'utente apre la versione [single-page app](/it/part0/fondamenti_delle_applicazioni_web#applicazione-a-pagina-singola) dell'applicazione Notes all'indirizzo [/exampleapp/spa](/exampleapp/spa).

  <h4>0.6: Nuova nota nell'applicazione a pagina singola</h4>

Crea un diagramma che rappresenti la situazione in cui l'utente crea una nuova nota usando la versione single-page dell'applicazione.

</div>
