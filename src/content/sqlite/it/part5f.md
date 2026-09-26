---
mainImage: ../../../images/part-5.svg
part: 5
letter: f
lang: it
course: sqlite
---

<div class="content">

### Prima completa l'applicazione locale

Questo capitolo conclude il corso base SQLite, dopo test, login e routing. Riprende gli obiettivi di pubblicazione degli esercizi originali 3.10 e 3.21. Non serve per eseguire le parti precedenti in laboratorio.

Prima di pubblicare, verifica CRUD, autorizzazioni e test. Il database di test deve essere separato; /api/testing/reset non deve esistere nell'avvio normale.

### Provare la build senza pubblicarla

Nel progetto React esegui npm run build. Copia la directory dist generata nella radice del backend. Non copiare node_modules. In app.js, dopo i router API e prima del gestore 404, aggiungi:

```js
const path = require('node:path')
const frontend = path.join(__dirname, 'dist')
app.use(express.static(frontend))
app.use((request, response, next) => {
  if (request.method === 'GET'
    && !request.path.startsWith('/api')
    && request.accepts('html')) {
    return response.sendFile(path.join(frontend, 'index.html'))
  }
  next()
})
```

Il fallback serve index.html per le rotte di React Router come /notes/123, ma non trasforma gli errori /api in pagine HTML.

Ferma Vite e avvia il backend: ora http://localhost:3001 serve sia React sia le API. Mantieni gli URL Axios relativi /api/notes e /api/blogs. Prova anche un aggiornamento del browser su una rotta interna.

### Scegliere un server adatto a SQLite

Per questa architettura servono un processo Node e **un disco persistente scrivibile**, montato in un percorso stabile. Un server della scuola, una macchina virtuale o un servizio di hosting che offra queste caratteristiche possono andare bene. Un filesystem temporaneo che viene ricreato a ogni deploy non è sufficiente.

GitHub Pages ospita il sito del corso e può ospitare file frontend statici, ma non esegue questo backend Node e non conserva il database SQLite dell'applicazione. Non caricare notes.db nella cartella pubblica.

Questa esercitazione usa una sola istanza del backend. Più istanze con file locali distinti non condividono i dati; per un'applicazione distribuita bisogna ripensare la persistenza.

### Configurazione di produzione

Sul server prepara Node, una directory per il codice e una separata per i dati. L'utente che esegue Node deve poter scrivere soltanto dove necessario. Conserva il package-lock.json del backend e installa le dipendenze con npm ci --omit=dev.

Configura nell'ambiente del servizio:

```text
NODE_ENV=production
PORT=3001
HOST=127.0.0.1
DATABASE_PATH=/percorso/persistente/notes.db
SECRET=un-segreto-casuale-generato-per-questo-server
```

Il percorso deve esistere e non deve essere dentro dist. Se il servizio di hosting inoltra il traffico direttamente al processo da un'altra interfaccia, configura HOST=0.0.0.0 e la porta richiesta dalla piattaforma. Con un reverse proxy sulla stessa macchina puoi mantenere Node su 127.0.0.1.

Avvia **node index.js** con queste variabili già impostate: lo script locale che usa --env-file=.env non è necessario quando l'ambiente viene fornito dal servizio.

Il processo deve essere supervisionato dal sistema o dalla piattaforma: non lasciarlo dipendere da un terminale SSH aperto. Predisponi HTTPS tramite il reverse proxy o il servizio di hosting. Prima di esporre l'applicazione aggiungi almeno limiti ai tentativi di login e una politica password adeguata. Non usare dati reali degli studenti per una prova pubblica.

### Primo deploy e aggiornamenti

Trasferisci codice, lockfile e build, non il database di sviluppo o i segreti. All'avvio lo schema viene creato nel file persistente. Crea gli utenti necessari attraverso l'API; non distribuire account condivisi con password predefinite.

Per gli aggiornamenti: esegui i test, crea la nuova build, fai un backup, applica le eventuali migrazioni e riavvia il servizio. Non sostituire la directory dei dati insieme a quella del codice.

### Backup e ripristino

Copiare soltanto un file mentre il database viene scritto può produrre un backup incoerente, soprattutto se è attivo WAL. Usa l'[API di backup SQLite](https://www.sqlite.org/backup.html) oppure arresta tutti i processi che scrivono prima di effettuare una copia coerente.

Esempio backup.cjs, eseguito con DATABASE_PATH corretto:

```js
const { DatabaseSync, backup } = require('node:sqlite')
const path = require('node:path')
const source = process.env.DATABASE_PATH || path.join(__dirname, 'notes.db')
const destination = process.argv[2]

if (!destination) throw new Error('Specify a new backup file path')
const db = new DatabaseSync(source, { readOnly: true })
backup(db, destination)
  .then(() => console.log('Backup completed'))
  .catch(error => { console.error(error); process.exitCode = 1 })
  .finally(() => db.close())
```

Passa come argomento un percorso nuovo, diverso dal database attivo, in una directory esistente. Proteggi il backup come il database: contiene anche gli hash delle password. Conservane una copia fuori dal server e verifica un ripristino su un file di prova. Non sovrascrivere il database attivo per fare questa verifica.

### Verifica finale

Controlla HTTPS, login valido e non valido, creazione e modifica, eliminazione negata agli altri utenti, ricaricamento di una rotta React e assenza dell'endpoint di reset. Riavvia il processo e verifica che i dati rimangano. Leggi i log senza registrare password o token.

</div>
<div class="tasks">

### Esercizio finale: pubblicazione

Pubblica una delle applicazioni completate su un ambiente con disco persistente. Documenta avvio, variabili necessarie senza valori segreti, aggiornamento, backup e ripristino. Verifica i dati dopo un riavvio e dopo un nuovo deploy. Se non hai un server disponibile, completa la prova della build locale e lascia questa tappa come attività successiva: il corso base locale resta utilizzabile.
</div>

