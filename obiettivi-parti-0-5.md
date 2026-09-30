# Obiettivi didattici delle parti 0–5

## Parte 0 – Fondamenti del web

Spiegare il ruolo di browser e server e il loro scambio di richieste e risposte.
Interpretare una richiesta HTTP GET e descrivere l’invio di dati con POST.
Distinguere le applicazioni web tradizionali da quelle a pagina singola.
Descrivere come JavaScript viene caricato ed eseguito nel browser.
Riconoscere il DOM e modificarne elementi con JavaScript.
Spiegare il ruolo degli eventi e delle funzioni di callback.
Descrivere l’uso di CSS, AJAX e librerie JavaScript nello sviluppo web.

### Obiettivi minimi

Riconoscere browser e server come componenti che comunicano attraverso richieste e risposte.
Distinguere, con un esempio, un sito tradizionale da un’applicazione a pagina singola.
Riconoscere che JavaScript può modificare il contenuto della pagina nel browser.

## Parte 1 – Introduzione a React e JavaScript

Definire componenti React e comporre un’interfaccia a partire da più componenti.
Scrivere markup JSX e inserire espressioni JavaScript.
Passare dati ai componenti tramite props e usare la destrutturazione.
Usare variabili, array, oggetti e funzioni JavaScript.
Gestire lo stato di un componente con gli Hook e aggiornarlo in risposta agli eventi.
Spiegare come le modifiche allo stato causano un nuovo rendering.
Condividere lo stato tra componenti e passare funzioni gestore ai componenti figli.
Gestire array e oggetti nello stato, rendering condizionale e debug di un’applicazione React.
Applicare le regole fondamentali degli Hook.

### Obiettivi minimi

Riconoscere e descrivere la funzione di un componente React.
Usare JSX per visualizzare testo e dati nell’interfaccia.
Passare un dato a un componente tramite props.
Gestire un semplice stato e aggiornarlo in risposta a un evento.

## Parte 2 – Rendering di liste, form e comunicazione con il server

Visualizzare collezioni di dati con `map` e assegnare chiavi stabili agli elementi.
Organizzare il codice in moduli e usare funzioni di supporto.
Gestire dati dei form tramite componenti controllati.
Filtrare i dati e aggiornare lo stato dell’interfaccia in base alle azioni dell’utente.
Descrivere il ruolo di npm e dell’ambiente di esecuzione del browser.
Recuperare dati da un servizio backend tramite Axios e promesse.
Usare l’Hook `useEffect` per sincronizzare il componente con i dati esterni.
Inviare modifiche al server tramite API REST e gestire errori e risposte.
Separare le operazioni di comunicazione con il backend in un modulo dedicato.
Applicare stili CSS e stili inline a un’applicazione React.

### Obiettivi minimi

Visualizzare una lista di elementi a partire da un array.
Gestire un form semplice e aggiornare i dati inseriti dall’utente.
Recuperare e mostrare dati ricevuti da un servizio backend.
Riconoscere e segnalare un errore essenziale durante il recupero o l’invio dei dati.

## Parte 3 – Backend con Node.js ed Express

Creare un server con Node.js ed Express e definire route per le risorse.
Implementare operazioni REST per elencare, recuperare, aggiungere, modificare ed eliminare risorse.
Leggere i dati inviati dal client e restituire risposte HTTP appropriate.
Usare middleware per elaborare richieste, registrare informazioni e gestire errori.
Comprendere same-origin policy e configurare CORS quando necessario.
Collegare il backend a un database SQLite e configurarne l’accesso.
Progettare tabelle e relazioni per rappresentare i dati dell’applicazione.
Usare query SQL per inserire, leggere, modificare ed eliminare dati.
Integrare le operazioni sul database nelle route e nei servizi del backend.
Configurare variabili d’ambiente e separare la configurazione dal codice applicativo.
Integrare frontend e backend e fare il debug del server.
Pubblicare l’applicazione e il database in un ambiente di produzione.
Usare un linter per individuare problemi e mantenere uno stile coerente.

### Obiettivi minimi

Avviare un server Express e definire almeno una route che restituisce dati.
Realizzare le operazioni essenziali per leggere e aggiungere risorse tramite API.
Salvare e recuperare dati persistenti da SQLite usando query SQL predisposte.
Restituire una risposta di errore comprensibile quando una richiesta non è valida o una risorsa non esiste.

## Parte 4 – Test del backend e autenticazione

Organizzare un’applicazione backend separando route, controller, modelli e configurazione.
Scrivere test unitari per le funzioni di supporto.
Configurare un ambiente di test e usare Supertest per verificare le API HTTP.
Preparare e ripristinare i dati del database tra i test.
Verificare i casi di successo e di errore delle operazioni sulle risorse.
Usare `async/await` per gestire operazioni asincrone.
Modellare utenti nel database e collegare le risorse al loro creatore.
Creare utenti e gestire in modo sicuro le password.
Implementare il login e generare token di autenticazione.
Proteggere le route e autorizzare le operazioni in base all’utente autenticato.
Valutare i limiti dell’autenticazione basata su token e gestire gli errori associati.

### Obiettivi minimi

Eseguire un test semplice per verificare il comportamento di una funzione o route.
Verificare almeno un caso corretto e un caso di errore di un’API.
Riconoscere un utente autenticato tramite un token e limitare almeno un’operazione agli utenti autorizzati.

## Parte 5 – Autenticazione e test del frontend

Realizzare nel frontend un modulo di login e gestire login riuscito e fallito.
Inviare token nelle richieste protette e conservarlo nel browser.
Mostrare o nascondere contenuti e form in base allo stato di autenticazione.
Creare e gestire risorse dal frontend con un utente autenticato.
Organizzare componenti riutilizzabili e usare `props.children`.
Usare i riferimenti ai componenti quando necessari per interazioni e test.
Configurare i test dei componenti React e renderizzare componenti nell’ambiente di test.
Verificare contenuti, eventi, form, notifiche e interazioni dell’utente.
Scrivere test di integrazione ed end-to-end per i flussi principali dell’applicazione.
Valutare la copertura dei test e usare i risultati per individuare scenari non verificati.
Definire rotte frontend con React Router, parametri e navigazione programmatica.
Applicare librerie di interfaccia e soluzioni di stile come Styled Components.

### Obiettivi minimi

Effettuare il login tramite il frontend e mostrare un esito comprensibile.
Usare il token per inviare una richiesta autenticata al backend.
Realizzare un test semplice che controlli la visualizzazione o l’interazione con un componente.
Navigare tra almeno due viste dell’applicazione tramite le rotte configurate.
