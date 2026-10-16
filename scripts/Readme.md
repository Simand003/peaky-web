# Script Python di Peaky

Questi script gestiscono le **cime** del sito: le scaricano da OpenStreetMap, le salvano su Firestore e preparano il file `peaks.json` che il sito legge.

## Come funziona, in breve

```
OpenStreetMap  ──add_peak.py──▶  Firestore  ──export_peaks.py──▶  public/peaks.json  ──▶  sito
                                     ▲                                    ▲
                                     └──────────delete_peaks.py───────────┘
```

- **Firestore** (collezione `peaks`) è il database completo delle cime.
- **`peaks.json`** è una copia leggera, con solo i campi utili alla mappa. Il sito legge questo file invece di interrogare Firestore a ogni visita, così non paga una lettura per ogni cima.

## Struttura della cartella

```
peaky-web/
  public/
    peaks.json               <- generato da export_peaks.py, letto dal sito
  scripts/
    README.md
    requirements.txt
    serviceAccountKey.json   <- chiave privata di Firebase (NON va su Git)
    add_peak.py              <- importa le cime di una regione
    export_peaks.py          <- aggiorna peaks.json dalle cime su Firestore
    delete_peaks.py          <- elimina in massa le cime di una regione
    data/
      countries.json         <- paesi, regioni e codici ISO
    common/                  <- codice condiviso dai tre script
      __init__.py
      firebase.py            <- connessione a Firestore
      regions.py             <- carica countries.json e mostra i menu
      status.py              <- conta le cime di ogni regione (Firestore e peaks.json)
      peaks_file.py          <- lettura e scrittura di peaks.json
```

## Preparazione (una volta sola)

1. Installa Python e le librerie, dalla cartella `scripts`:
   ```
   pip install -r requirements.txt
   ```
2. Metti `serviceAccountKey.json` nella cartella `scripts`. Si scarica dalla console Firebase (Impostazioni progetto → Account di servizio). Contiene una chiave con pieni poteri sul progetto: aggiungila al `.gitignore` e non condividerla mai.

Gli script vanno lanciati dalla cartella `scripts`:
```
python add_peak.py
```

## I tre script

Tutti e tre iniziano allo stesso modo: scegli il **paese** e la **regione** da un menu (numero + Invio).

Nel menu delle regioni, ogni riga mostra quante cime ha quella regione su **Firestore** e quante nel **JSON** (`-` significa nessuna):

```
 9. Lombardia               Firestore:   1234   JSON:   1234
12. Piemonte                Firestore:      5   JSON:      -
```

Così vedi subito quali regioni sono già importate e quali già esportate. Una regione con cime su Firestore ma non nel JSON ha bisogno dell'export; una con cime nel JSON ma non su Firestore è stata eliminata dal database ma non dal file. Per contare, lo script fa una richiesta di conteggio per regione (il server conta senza scaricare le cime: circa una lettura ogni 1000 cime). Le cime di `peaks.json` esportate prima che esistesse il campo `region` non possono essere assegnate a una regione: il menu te lo segnala, e riesportando la regione vengono aggiornate.

### `add_peak.py` — importa le cime

1. Chiede a Overpass (il servizio di ricerca di OpenStreetMap) tutte le cime (`natural=peak`) dentro la regione scelta. La regione viene cercata tramite il suo **codice ISO**, non tramite il nome.
2. Scarta le cime con dati incompleti (senza nome, coordinate o quota valida).
3. Ti mostra quante cime valide ha trovato e la quota minima e massima, e **chiede conferma** (`s/n`) prima di scrivere.
4. Se confermi, le salva su Firestore a gruppi da 500 (il limite di Firestore) con una barra di avanzamento.

Le cime sono salvate con l'id di OpenStreetMap come id del documento e `merge=True`: rilanciare lo script sulla stessa regione **aggiorna** le cime esistenti, senza duplicarle e senza toccare altri campi aggiunti in seguito.

Overpass è un servizio pubblico e a volte è sovraccarico. Lo script prova tre server in sequenza, fino a tre giri, con pause crescenti. Gestisce anche il caso in cui un server risponde "ok" ma con un messaggio di errore e nessun dato.

### `export_peaks.py` — aggiorna `peaks.json`

1. Legge da Firestore **solo** le cime della regione scelta (il filtro lo applica Firestore, quindi paghi solo quelle letture).
2. Per ogni cima tiene `id`, `name`, `lat`, `lon`, `elevation`, `country` e `region`. Le coordinate sono arrotondate a 5 decimali (circa 1 metro).
3. **Unisce** le cime al `peaks.json` esistente, usando l'`id`: una cima già presente viene aggiornata, una nuova viene aggiunta, tutte le altre restano intatte.
4. Riscrive il file ordinato dalla cima più alta alla più bassa, una cima per riga.

Per questo puoi esportare una regione alla volta e il file le accumula. Se una regione non ha cime su Firestore, lo script si ferma senza toccare il file.

### `delete_peaks.py` — elimina in massa

1. Scegli da dove eliminare: **Firestore e peaks.json**, **solo Firestore** o **solo peaks.json**.
2. Lo script conta le cime trovate e mostra il riepilogo, senza eliminare nulla.
3. Per procedere devi scrivere `ELIMINA`. Qualsiasi altra risposta annulla tutto.
4. Elimina prima da Firestore (a gruppi da 500) e poi dal file. Se Firestore va in errore, `peaks.json` resta intatto.

> **Attenzione:** l'eliminazione da Firestore non si può annullare. Inoltre le salite del diario (collezione `climbs`) si riferiscono alle cime tramite il loro id: eliminare una cima già scalata da qualcuno lascia quella salita senza cima.

## Il file dei paesi: `data/countries.json`

È l'unica fonte di verità per i menu: tutti e tre gli script lo leggono.

```json
{
  "Italia": {
    "iso": "IT",
    "regions": {
      "Lombardia": "IT-25",
      "Valle d'Aosta": "IT-23"
    }
  }
}
```

Ogni regione ha un nome (mostrato nel menu e salvato su Firestore) e un codice ISO 3166-2 (usato per cercare l'area su OpenStreetMap). Il campo `iso` del paese per ora è solo informativo: gli script non lo usano.

### Aggiungere un paese o una regione

1. Aggiungi il blocco nel file, nello stesso formato.
2. Trova il codice ISO di ogni regione su Wikipedia, alla pagina "ISO 3166-2:XX" (con XX il codice del paese), oppure nel tag `ISO3166-2` della relazione su openstreetmap.org.
3. Non serve toccare gli script.

Se un paese non ha regioni con un codice ISO (come la Slovenia, che ha solo comuni), puoi usare come unica "regione" l'intero paese con il codice del paese **senza trattino** (per esempio `SI`). Lo script lo riconosce dall'assenza del trattino e lo cerca come paese intero.

Il nome di una regione, una volta usato per importare cime, finisce nei documenti su Firestore (campi `country` e `region`). Se lo cambi nel file, le cime già importate non combaceranno più con il nuovo nome.

## Dati salvati

**Documento su Firestore** (`peaks/{id OSM}`):

| Campo | Esempio |
|---|---|
| `name` | `"Piz de l'Avartel SO"` |
| `elevation` | `2130` (metri, intero) |
| `lat`, `lon` | `46.2492812`, `9.2814517` |
| `country` | `"Italia"` |
| `region` | `"Lombardia"` |
| `source` | `"OSM"` |
| `osm_id` | `10017564820` |

**Voce di `peaks.json`** (una per riga):

```json
{"id":"10017564820","name":"Piz de l'Avartel SO","lat":46.24928,"lon":9.28145,"elevation":2130,"country":"Italia","region":"Lombardia"}
```

## Flusso tipico

**Aggiungere una regione nuova**
1. `python add_peak.py` → scegli la regione, controlla il riepilogo, conferma.
2. `python export_peaks.py` → scegli la stessa regione.
3. Ricarica il sito: la regione compare con le sue cime.

**Aggiornare una regione già importata**
Ripeti i due passaggi: le cime esistenti vengono aggiornate, quelle nuove aggiunte.

**Togliere una regione**
`python delete_peaks.py` → scegli la regione e da dove eliminare.

## Problemi comuni

| Messaggio | Cosa significa |
|---|---|
| `ModuleNotFoundError: No module named 'common...'` | Un file della cartella `common` manca o ha un nome diverso. Controlla che ci siano `__init__.py`, `firebase.py`, `regions.py` e `peaks_file.py`, e che lanci lo script dalla cartella `scripts`. |
| `AttributeError: ... has no attribute 'count'` (nel menu delle regioni) | La libreria Firebase è troppo vecchia per il conteggio. Aggiornala con `pip install -U firebase-admin`. |
| `Errore HTTP: 502 / 504 / 500` | Il server Overpass è sovraccarico. Lo script ritenta da solo; se fallisce tutto, riprova più tardi. |
| `Il server ha segnalato un problema: ...` | Il server ha risposto ma non ha completato la ricerca (di solito per timeout). Stesso rimedio: riprova più tardi. |
| `Nessuna cima trovata: controlla il codice ...` | Overpass ha risposto bene ma non ha trovato l'area: il codice ISO in `countries.json` è probabilmente sbagliato. |
| `Nessuna cima trovata per ...` (in export) | Quella regione non ha cime su Firestore: importala prima con `add_peak.py`. |
| Errore leggendo `peaks.json` | Il file non è un JSON valido. Gli script si fermano **prima** di scrivere, quindi non lo danneggiano: sistemalo a mano o eliminalo e riesporta le regioni. |

## Costi su Firestore

Il piano gratuito di Firebase ha quote giornaliere di letture, scritture ed eliminazioni (controlla i valori attuali nella console Firebase). Ogni cima importata è una scrittura, ogni cima esportata una lettura, ogni cima eliminata una eliminazione. Importare paesi interi con migliaia di cime consuma una parte importante della quota: per questo `add_peak.py` chiede conferma mostrando il numero esatto prima di scrivere.