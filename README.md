# ODAS App Karten

Karten-App für den Open Data App-Store (ODAP)

Die App zeigt Orte von Interesse an.

Die App ist eine "ODAP App V1".

## Funktionen

- Interaktive Karte mit POI-Markern und Clustering
- Seitenleiste mit Suchfunktion
- Datenfrische-Indikator (CKAN metadata_modified)
- Weiterführende Links (konfigurierbar)
- Direkter Datenabruf in Entwicklung und Standalone-Betrieb
- Optionaler ODAS-Proxy bei der Auslieferung über den ODAS

## Entwicklung

### Aufbau der App

#### Desktop Version

![Alt-Text](/assets/Desktop_Screenshot.png)

#### Mobile Version

![Alt-Text](/assets/Mobile_Screenshot.png)
![Alt-Text](/assets/Mobile_Screenshot_2.png)

- CSS: Bootstrap 4.5.2

### Start der App

    $ make up
    $ curl http://localhost:8080

## Betriebsarten

Die App kann lokal, eigenstaendig hinter einem Traefik-Reverse-Proxy oder ueber den ODAS
betrieben werden.

### Datenabruf: `proxyAktiv`

| Wert    | Bedeutung                                                          |
| ------- | ------------------------------------------------------------------ |
| `nein`  | Direkter Abruf der Daten-URL. Standard fuer Entwicklung und Standalone. |
| `ja`    | Abruf ueber den ODAS-Proxy `…/odp-data`. Nur im ODAS-Live-System verfuegbar. |

Bei `nein` muss die Datenquelle CORS freigeben.

### Standalone-Betrieb

Voraussetzung: ein laufender Traefik mit dem externen Docker-Netzwerk `proxynet`,
dem EntryPoint `websecure` und dem Zertifikatsresolver `letsencrypt`.

1. In `docker-compose.standalone.yml` den Platzhalter `app1.example.com` durch den
   echten FQDN ersetzen.
2. In `odas-config/config.json` `proxyAktiv` auf `nein` belassen.
3. Starten:

```bash
STANDALONE=true make up
STANDALONE=true make logs
STANDALONE=true make down
```

Im Standalone-Betrieb entfaellt die lokale Portfreigabe; Traefik terminiert TLS und
leitet auf den internen Nginx-Port 80 weiter. Die Konfiguration wird aus derselben
`odas-config/config.json` gelesen wie in der Entwicklung und von Nginx unter `/config`
ausgeliefert.

### Beim Aufruf kontaktierte Drittanbieter

Beim Aufruf dieser App werden folgende externe Server kontaktiert:

- `tile.openstreetmap.org` — Kartenkacheln (OpenStreetMap)
- `google.com/maps` — externer Routen-/Kartenlink (öffnet erst bei Klick in einem neuen Tab)

Diese Anbieter bleiben auch im Standalone-Betrieb extern; ein vollständig autarker Betrieb ohne Internetzugang ist derzeit nicht möglich. Bootstrap, Leaflet und Chart.js werden seit Version 1.12.0 und Leaflet MarkerCluster seit Version 1.16.0 lokal aus `app/vendor/` ausgeliefert und nicht mehr extern geladen.

### Auslieferung an den ODAS

`make zip` erzeugt das Liefer-ZIP mit `app/`, `assets/`, `app-package.json` und
`CHANGELOG.md`. Die Infrastrukturdateien (`Dockerfile`, `docker-compose*.yml`,
`nginx.conf`, `Makefile`) sind nicht Teil der Auslieferung. Das ZIP ist ein Bauartefakt und wird nicht mitversioniert, sondern bei Bedarf mit `make zip` erzeugt.

## Autor

(C) 2025, Ondics GmbH
