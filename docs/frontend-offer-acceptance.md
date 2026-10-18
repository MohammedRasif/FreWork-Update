# Ripristino frontend dell'accettazione delle offerte

Il flusso usa la chat già esistente e le API del backend attuale:

- `PATCH /final-offer/{offer_id}/`: l'agenzia invia la propria offerta finale.
- `PATCH /accept-or-decline/{conversation_id}/`: il titolare della richiesta accetta o rifiuta.
- `POST /chat/conversations/{conversation_id}/message/`: conferma nella stessa chat la decisione e, per l'accettazione, il consenso espresso dal cliente.

Il riepilogo mostra l'offerta realmente associata all'agenzia, con prezzo,
date e partecipanti. L'accettazione è disponibile solo al titolare della
richiesta e richiede di selezionare il consenso alla condivisione di nome,
telefono ed email. Le opzioni di rifiuto esistenti sono mantenute.

Le risposte invalidano le cache di offerte, richieste e conversazioni.
L'interfaccia aggiorna lo stato anche nell'altra sessione tramite polling
e messaggi WebSocket. L'agenzia vede i contatti solo quando le API indicano
che la propria offerta è stata accettata; le altre agenzie mantengono il
nome generico del viaggiatore. La vista di dettaglio applica lo stesso
controllo ai dati di contatto.

I pulsanti delle offerte che aprivano una conversazione o accettavano
direttamente ora conducono alla conversazione già associata all'offerta,
usando `room_id`. Se questo dato manca, si apre l'elenco delle conversazioni:
non viene creata una nuova chat e non viene registrata un'accettazione
anticipata.

In caso di errore dell'API l'azione resta ripetibile. Se il server ha salvato
la decisione ma la risposta HTTP si perde, il frontend la riconcilia con
lo stato riletto. Se fallisce il messaggio di conferma, rimane disponibile
un tentativo per il solo messaggio, conservato nella sessione del browser
anche dopo il ricaricamento. Prima di ritentare si controlla che il messaggio
non sia già stato salvato, così non si ripete l'accettazione e non si duplica
la conferma.

## Confine con il backend

Nessun file del backend è stato modificato. Il consenso viene riportato
come messaggio di chat attraverso l'API esistente; il backend non dispone
ancora di un campo dedicato al consenso. La visibilità descritta sopra è
un controllo dell'interfaccia: le API attuali restituiscono alcuni dati
personali anche prima dell'accettazione. La protezione delle API e la
registrazione strutturata del consenso richiedono un intervento separato
lato server. L'accesso del backoffice amministrativo resta quello esistente.

## Verifiche

Build di produzione e prove browser con API simulate aderenti alle risposte
del backend attuale, per rumeno e russo a 320, 390 e 1440 px: invio finale,
consenso obbligatorio, accettazione, rifiuto, stato nelle due sessioni,
ricaricamento, contatti della sola agenzia scelta, errori e tentativi
successivi, risposte HTTP perse, doppio clic e collegamenti dalle richieste.
