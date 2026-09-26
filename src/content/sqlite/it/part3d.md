---
mainImage: ../../../images/part-3.svg
part: 3
letter: d
lang: it
course: sqlite
---

<div class="content">

### Validazione delle richieste e vincoli SQL

Una buona interfaccia non basta: le API possono essere chiamate senza il frontend. Il router delle note controlla tipo e lunghezza di content e tipo booleano di important. Il vincolo CHECK nel database protegge ulteriormente il contenuto salvato.

Valida anche gli aggiornamenti. Non usare Boolean(request.body.important): la stringa "false" diventerebbe true. Accetta soltanto i tipi previsti dal contratto.

Per la rubrica, controlla name e number prima di eseguire INSERT o UPDATE. Imposta UNIQUE sul nome per evitare duplicati anche in presenza di richieste concorrenti. Una SELECT preventiva migliora il messaggio, ma non sostituisce il vincolo del database.

### Gestire gli errori

Restituisci 400 per input non valido, 404 per una risorsa assente e 409 per un conflitto come un nome duplicato. Per un errore inatteso usa 500 e un messaggio generico. Le query SQL restano nel modello, non nei componenti React.

Il frontend può leggere il messaggio da error.response.data.error e mostrarlo con il componente Notification. Gestisci anche gli errori di rete, nei quali response potrebbe non esistere.

### Lint

Il lint non dipende dal database. Installa ESLint nel backend:

```bash
npm install --save-dev eslint @eslint/js globals
```

Crea eslint.config.mjs:

```js
import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['dist/**'] },
  {
    files: ['**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
      ecmaVersion: 'latest'
    },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] }
  }
]
```

Aggiungi "lint": "eslint ." agli script. Negli error handler Express mantieni tutti e quattro i parametri, anche quando non li usi: puoi chiamarli _request e _next per rispettare la regola.

### Dati e schema

CREATE TABLE IF NOT EXISTS non modifica le tabelle già presenti. Scrivi una migrazione quando cambi lo schema; fai un backup prima di applicarla a dati importanti. Non cancellare un database per risolvere un errore senza capire quali dati contiene.

La pubblicazione rimane nella sezione conclusiva della Parte 5.

</div>
<div class="tasks">

### Esercizi 3.19–3.22

#### 3.19: Database della rubrica, passo 7
Richiedi un nome di almeno tre caratteri e un numero non vuoto. Mostra gli errori del backend nel frontend. Verifica sia POST sia PUT.

#### 3.20*: Database della rubrica, passo 8
Il telefono deve contenere almeno otto caratteri ed essere formato da due gruppi separati da un trattino: due o tre cifre nel primo gruppo e soltanto cifre nel secondo. Sono validi 09-1234556 e 040-22334455. Usa una funzione di validazione JavaScript nel backend, non Mongoose.

#### 3.21: Verifica completa locale
Avvia frontend e backend, aggiungi e modifica persone, riavvia il backend e verifica la persistenza. Controlla lo stesso file con DBeaver. La parte di pubblicazione di questo esercizio è rimandata alla conclusione del corso base.

#### 3.22: Configurazione del lint
Configura ESLint, correggi gli errori e verifica che il progetto resti funzionante.
</div>

