---
mainImage: ../../../images/part-4.svg
part: 4
letter: a
lang: it
course: sqlite
---

<div class="content">

### Struttura del progetto

Il backend SQLite della Parte 3 separa già le responsabilità:

- index.js apre la porta HTTP.
- app.js configura Express e i middleware, senza avviare il server.
- db.js apre il database e inizializza lo schema.
- models/note.js contiene SQL e conversione delle righe in oggetti.
- controllers/notes.js traduce richieste HTTP in operazioni del modello.

Un test può importare app.js senza aprire la porta 3001. Un modello può essere provato separatamente da HTTP. Non mescolare nei modelli oggetti request o response.

### Configurazione

DATABASE_PATH sceglie il file locale; PORT e HOST configurano il server. Puoi usare un file .env ignorato da Git e avviare Node con --env-file=.env. In modalità test db.js sceglie sempre :memory:, indipendentemente dal file di sviluppo.

```text
DATABASE_PATH=./notes.db
PORT=3001
HOST=127.0.0.1
```

Un percorso relativo è risolto rispetto alla directory da cui avvii Node. Per evitare ambiguità, avvia sempre dalla radice del backend oppure usa un percorso assoluto.

### Testare funzioni pure

Il test runner è integrato in Node. Crea utils/for_testing.js:

```js
const average = array => array.length
  ? array.reduce((sum, value) => sum + value, 0) / array.length
  : 0

module.exports = { average }
```

Crea tests/average.test.js:

```js
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { average } = require('../utils/for_testing')

test('average of an empty array is zero', () => {
  assert.equal(average([]), 0)
})

test('average of several values', () => {
  assert.equal(average([1, 2, 3]), 2)
})
```

Esegui node --test. Distingui i casi normali dai casi limite e dai valori non ammessi. I test sono codice del progetto, da conservare in Git.

</div>
<div class="tasks">

### Esercizi 4.1–4.7

#### 4.1: Lista di blog, passo 1
Crea un nuovo backend per i blog con un proprio file blogs.db. La tabella blogs contiene id TEXT PRIMARY KEY, title TEXT NOT NULL, author TEXT NOT NULL, url TEXT NOT NULL e likes INTEGER NOT NULL DEFAULT 0 CHECK(likes >= 0). Usa UUID stringa. Implementa GET e POST /api/blogs con query parametrizzate.

#### 4.2: Lista di blog, passo 2
Separa avvio, configurazione Express, accesso SQLite e router come nell'esempio delle note. Verifica l'API prima di proseguire.

#### 4.3: Funzioni di supporto e test unitari, passo 1
Crea utils/list_helper.js con una funzione dummy che riceve una lista di blog e restituisce 1. Scrivi un test.

#### 4.4: Funzioni di supporto e test unitari, passo 2
Implementa totalLikes: somma i like, restituendo 0 per una lista vuota. Testa lista vuota, un elemento e più elementi.

#### 4.5*: Funzioni di supporto e test unitari, passo 3
Implementa favoriteBlog: restituisce il blog con più like, oppure null per una lista vuota. In caso di parità è sufficiente uno dei massimi.

#### 4.6*: Funzioni di supporto e test unitari, passo 4
Implementa mostBlogs: restituisce { author, blogs } per l'autore con più blog. Definisci e testa anche il comportamento per una lista vuota.

#### 4.7*: Funzioni di supporto e test unitari, passo 5
Implementa mostLikes: restituisce { author, likes } per l'autore con più like complessivi. Verifica anche autori ripetuti e parità.
</div>

