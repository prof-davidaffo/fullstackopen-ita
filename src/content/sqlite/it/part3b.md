---
mainImage: ../../../images/part-3.svg
part: 3
letter: b
lang: it
course: sqlite
---

<div class="content">

### Due processi durante lo sviluppo

Avvia il backend della 3a sulla porta 3001 e il frontend React con Vite sulla 5173, in due terminali separati. Non serve pubblicare niente: entrambi girano sul tuo computer.

### Same origin policy e CORS

Un'origine comprende protocollo, host e porta. localhost:5173 e localhost:3001 sono origini diverse. Il browser limita le richieste tra origini; CORS permette al server di dichiarare quali origini sono autorizzate, ma non sostituisce autenticazione e autorizzazione.

Durante le esercitazioni usiamo un proxy di sviluppo. Se scegli invece accessi diretti da React alla porta 3001, configura CORS nel backend per la sola origine del frontend, senza aprire indiscriminatamente tutte le origini.

### Proxy

Nel progetto React configura vite.config.js, mantenendo eventuali altre opzioni:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

Riavvia Vite dopo la modifica. Nel servizio Axios usa un URL relativo:

```js
import axios from 'axios'
const baseUrl = '/api/notes'

const getAll = () => axios.get(baseUrl).then(response => response.data)
const create = note => axios.post(baseUrl, note).then(response => response.data)
const update = (id, note) => axios.put(`${baseUrl}/${id}`, note).then(response => response.data)
const remove = id => axios.delete(`${baseUrl}/${id}`)

export default { getAll, create, update, remove }
```

Il browser chiama Vite sulla stessa origine e Vite inoltra /api a Express. Il proxy funziona soltanto con il server di sviluppo: non viene incluso nella build di produzione.

### Verificare il collegamento

Controlla prima http://localhost:3001/api/notes, poi http://localhost:5173/api/notes e infine il frontend. Se il primo funziona e il secondo no, verifica proxy e riavvio di Vite. Usa la scheda Network per controllare metodo, URL, corpo e risposta.

### Build di produzione del frontend

Una build trasforma React in file statici. Non è necessario pubblicarli per provarli. Alla fine del percorso vedremo come Express può servire la directory dist insieme alle API e come trasferire tutto su un server.

Per ora mantieni separati i due processi di sviluppo. Gli esercizi di deploy originali 3.10 e 3.21 sono rimandati alla sezione finale; non servono URL pubblici per proseguire.

</div>

<div class="tasks">

### Esercizi 3.9–3.11

#### 3.9: Backend della rubrica, passo 9
Collega il frontend della rubrica al backend locale. Sostituisci l'URL di JSON Server con /api/persons e configura il proxy.

#### 3.10: Preparare l'avvio locale
Definisci gli script start e dev del backend e documenta come avviare frontend e backend. Questa tappa sostituisce la pubblicazione anticipata: il deploy sarà affrontato alla fine.

#### 3.11: Rubrica full stack locale
Verifica dal browser lettura, creazione ed eliminazione. Per ora i dati del backend sono in memoria: il prossimo capitolo li renderà persistenti.
</div>

