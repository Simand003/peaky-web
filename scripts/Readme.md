# Script Python di Peaky

Questi script gestiscono il **catalogo delle cime** del sito: scaricano le cime da OpenStreetMap e scrivono i file JSON che il sito legge. Firestore non è coinvolto: contiene solo i dati degli utenti.

```
OpenStreetMap  ──add_peak.py──▶  public/data/peaks/*.json  ──▶  sito
                                          ▲
                                          └── delete_peaks.py
```

## Struttura della cartella

```
peaky-web/
  public/
    data/
      peaks/
        manifest.json        <- indice di tutte le regioni (piccolo, il sito lo legge sempre)
        IT-25.json           <- le cime di una regione (il nome del file è il codice della regione)
        CH-TI.json
        ...
  scripts/
    README.md
    requirements.txt
    add_peak.py              <- importa o aggiorna le cime di una regione
    delete_peaks.py          <- elimina una regione dal catalogo
    data/
      countries.json         <- paesi, regioni e codici ISO
    common/                  <- codice condiviso dagli script
      __init__.py            <- vuoto, dice a Python che common è un pacchetto
      catalog.py             <- lettura e scrittura dei file di regione e del manifest
      overpass.py            <- download da OpenStreetMap, con più server e tentativi
      regions.py             <- carica countries.json e mostra i menu
```

## Preparazione (una volta sola)

Dalla cartella `scripts`:

```
pip install -r requirements.txt
```

Serve solo la libreria `requests`. `serviceAccountKey.json` non serve più a questi script: se non ti serve per altro, puoi revocarla dalla console Firebase (Impostazioni progetto → Account di servizio).

Gli script si lanciano dalla cartella `scripts`:

```
python add_peak.py
```

> **Nota di transizione.** Finché il sito non viene aggiornato, legge ancora il vecchio `public/peaks.json`. Non eliminarlo e non aspettarti che le regioni importate con questi script compaiano sulla mappa: il passaggio ai nuovi file è il passo successivo.

## Gli script

Entrambi iniziano allo stesso modo: scegli il **paese** e la **regione** da un menu (numero + Invio). Ogni riga mostra il codice della regione e quante cime ha già nel catalogo (`-` significa nessuna):

```
 9. Lombardia               IT-25     2400
10. Marche                  IT-57        -
```

### `add_peak.py` — importa o aggiorna una regione

1. Chiede a Overpass (il servizio di ricerca di OpenStreetMap) le cime (`natural=peak`) che hanno nome e quota, dentro la regione scelta. La regione è cercata tramite il suo **codice ISO**, non tramite il nome.
2. Scarta le cime con dati non validi (senza nome, coordinate o quota utilizzabile).
3. Confronta le cime con quelle già nel catalogo e mostra un riepilogo: quante sono **nuove**, **modificate**, **invariate**, e quante **non sono più su OpenStreetMap**.
4. **Chiede conferma** (`s/n`). Se rispondi `n`, o se non c'è nulla da cambiare, non scrive niente.
5. Se confermi, scrive il file della regione e aggiorna il manifest.

Le cime che spariscono da OpenStreetMap **restano** nel catalogo: un id non deve mai sparire, altrimenti le salite del diario che lo usano perderebbero la cima. Reimportare una regione aggiorna e aggiunge, non toglie.

Overpass è un servizio pubblico e a volte è sovraccarico. Lo script prova tre server in sequenza, fino a tre giri, con pause crescenti. Gestisce anche il caso in cui un server risponde "ok" ma con un messaggio di errore e nessun dato.

### `delete_peaks.py` — elimina una regione dal catalogo

1. Scegli la regione: lo script mostra quante cime ha nel catalogo.
2. Per procedere devi scrivere `ELIMINA`. Qualsiasi altra risposta annulla tutto.
3. Toglie la regione dal manifest e poi elimina il suo file.

> **Attenzione:** le salite del diario (collezione `climbs`) si riferiscono alle cime tramite il loro id. Eliminare una cima già scalata da qualcuno lascia quella salita senza coordinate. Il file eliminato si può recuperare solo da Git o reimportando la regione.

## Il catalogo

### File di una regione (`IT-25.json`)

Un elenco di cime, una per riga, ordinato dalla più alta alla più bassa:

```json
[
{"id":"10017564820","name":"Piz de l'Avartel SO","lat":46.24928,"lon":9.28145,"elevation":2130},
...
]
```

- `id` è l'id del nodo OpenStreetMap, come stringa. È l'identità della cima in tutto il sito e **non deve mai cambiare**.
- `lat` e `lon` hanno 5 decimali (circa 1 metro).
- Regione e paese **non** sono nelle cime: li dice il manifest. Il sito li aggiunge in memoria quando carica i file.

### Manifest (`manifest.json`)

```json
{
  "regions": [
    {
      "code": "IT-25",
      "countryCode": "IT",
      "country": "Italia",
      "region": "Lombardia",
      "file": "IT-25.json",
      "version": "a447abaf",
      "count": 2400,
      "bytes": 280000,
      "bbox": [45.5, 8.5, 46.6, 10.7],
      "maxElevation": 3905
    }
  ]
}
```

- `version` è un codice calcolato dal contenuto del file. Il sito scarica `IT-25.json?v=a447abaf`: se il file cambia cambia anche la versione e nessuno vede dati vecchi; se non cambia, il browser usa la copia che ha già.
- `bbox` è il riquadro geografico `[sud, ovest, nord, est]`. Serve, più avanti, a caricare solo le regioni visibili sulla mappa.
- Il manifest è ordinato per codice, così in Git cambiano solo le righe che cambiano davvero.

### Regole del catalogo

- Il **codice ISO** identifica la regione; i nomi servono solo da mostrare.
- Una cima sul confine può comparire in due regioni: il sito scarta i doppioni per id.
- I file sono scritti in un solo passaggio (prima un file temporaneo, poi la sostituzione), e se il manifest è rovinato gli script si fermano **prima** di scrivere o eliminare qualsiasi cosa.
- In futuro i rifugi avranno una cartella propria (`public/data/huts/`) con un manifest proprio, perché hanno campi diversi dalle cime.

## Il file dei paesi: `data/countries.json`

È l'unica fonte per i menu e per i codici.

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

Il codice del paese (`iso`) va nel manifest; il codice di ogni regione dà il nome al file e viene usato per cercare l'area su OpenStreetMap.

### Aggiungere un paese o una regione

1. Aggiungi il blocco nel file, nello stesso formato.
2. Trova il codice ISO di ogni regione su Wikipedia, alla pagina "ISO 3166-2:XX" (con XX il codice del paese), oppure nel tag `ISO3166-2` della relazione su openstreetmap.org.
3. Non serve toccare gli script.

Se un paese non ha regioni con un codice ISO (come la Slovenia, che ha solo comuni), usa come unica "regione" l'intero paese con il codice del paese **senza trattino** (per esempio `SI`). Lo script lo riconosce dall'assenza del trattino e lo cerca come paese intero.

Il nome della regione finisce nel manifest e quindi nei filtri del sito. Cambiarlo in `countries.json` e reimportare la regione basta ad aggiornarlo ovunque.

## Flusso tipico

**Aggiungere una regione nuova**
1. `python add_peak.py` → scegli la regione, controlla il riepilogo, conferma.
2. Pubblica il sito con i nuovi file in `public/data/peaks/`.

**Aggiornare una regione già importata**
Stessi passaggi: le cime esistenti vengono aggiornate, quelle nuove aggiunte, quelle sparite da OpenStreetMap restano.

**Togliere una regione**
`python delete_peaks.py` → scegli la regione e conferma con `ELIMINA`.

## Problemi comuni

| Messaggio | Cosa significa |
|---|---|
| `ModuleNotFoundError: No module named 'common...'` | Un file della cartella `common` manca o ha un nome diverso. Controlla che ci siano `__init__.py`, `catalog.py`, `overpass.py` e `regions.py`, e che lanci lo script dalla cartella `scripts`. |
| `Errore HTTP: 502 / 504 / 500` | Il server Overpass è sovraccarico. Lo script ritenta da solo; se falliscono tutti i tentativi, riprova più tardi. |
| `Il server ha segnalato un problema: ...` | Il server ha risposto ma non ha completato la ricerca (di solito per timeout). Stesso rimedio: riprova più tardi. |
| `Nessuna cima trovata: controlla il codice ...` | Overpass ha risposto bene ma non ha trovato l'area o nessuna cima: il codice ISO in `countries.json` è probabilmente sbagliato. |
| `manifest.json non è un JSON valido` | Il file è rovinato. Gli script si fermano senza toccare nulla: ripristinalo da Git, oppure eliminalo e reimporta le regioni. |
| `Il catalogo è già aggiornato` | La regione non ha cime nuove o modificate rispetto a OpenStreetMap: non c'è nulla da salvare. |