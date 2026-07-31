# Changelog

## 1.6.0 - 2026-07-31
- CHG: toter Konfigurationsschlüssel lizenz entfernt (F-17)
- CHG: brandingCSS und brandingCSSFile als Base-Abhängigkeiten deklariert und lokal gespiegelt (F-17)
- CHG: format.typ von "String" auf v1-sicheres "string" korrigiert (F-18)
- CHG: dropdown-Default auf Feldebene verschoben statt in format (F-18)
- CHG: Platzhalter-Entwickler mueller-gmbh durch ondics-gmbh ersetzt (F-21)
- CHG: Platzhalter Mueller GmbH aus der Fußzeile entfernt (F-21)
- CHG: daten.schema auf assets/schema.json gesetzt (F-20)
- FIX: doppelte sprache-Deklaration in instanz-config entfernt

## 1.5.0 - 2026-07-30

- **FIX:** Der Marker `_multiline_` erscheint nicht mehr im Text von Beschreibung, Kontakt, Datenschutz und Impressum. Mehrzeilige Konfigurationswerte werden jetzt mit erhaltenen Zeilenumbruechen dargestellt
- **FIX:** Laufzeitfehler nach dem Laden der Konfiguration werden jetzt sichtbar gemeldet; `handleRouting()` wird `await`et und besitzt einen Fehlerpfad
- **FIX:** `getConfigUrl()` schneidet bei einer URL ohne abschliessenden Schraegstrich nicht mehr das letzte Verzeichnis ab
- **FIX:** Klick auf einen Hash-Link, der bereits die aktive Seite bezeichnet, rendert die Seite neu (`setupSamePageLinks()`)
- **ENH:** `app/app-base.js` ist wieder byte-identisch zum Template `oda-generic` 1.4.0. Das Abraeumen der Leaflet-Karte und das Ausblenden der Sidebar sind als `onPageLeave(page)` nach `app/app.js` gewandert

## 1.4.0 - 2026-07-24

- **FIX:** Laufzeit-Fehlermeldung wird vor der Anzeige HTML-maskiert (`escapeHtmlForBase`); ein Fehlertext kann kein Markup mehr in die Seite einschleusen (XSS)
- **FIX:** Startseiten-Renderer wird nun `await`et; bei asynchronen Apps erscheint kein kurzzeitiges `[object Promise]` in `#main-content`

## 1.3.0 - 2026-07-23

- **ENH:** Datenabruf auf den Schalter `proxyAktiv` umgestellt; direkte Abrufe sind der Standard, der ODAS-Proxy wird nur noch bei `ja` verwendet
- **ENH:** Einfachen Standalone-Betrieb hinter Traefik mit derselben `odas-config/config.json` wie in der Entwicklung ergänzt
- **ENH:** Traefik-Anbindung auf das externe Netzwerk `proxynet`, den EntryPoint `websecure` und den Zertifikatsresolver `letsencrypt` festgelegt
- **FIX:** Proxy-Basispfad funktioniert jetzt auch bei URLs mit `index.html`; der Ziel-Pfad wird URL-kodiert
- **FIX:** POI-Namen und -Beschreibungen im Karten-Popup werden HTML-maskiert
- **FIX:** Ladefehler werden sichtbar in der POI-Liste gemeldet statt nur auf der Konsole
- **DOC:** Start über `STANDALONE=true make up` dokumentiert

## v1.2.0

- ENH: escapeHtml()-Hilfsfunktion für XSS-Schutz hinzugefügt
- ENH: renderWeitereInfos()-Sektion mit konfigurierbaren weiterführenden Links
- ENH: Datenfrische-Indikator aus CKAN metadata_modified
- ENH: Beschreibung aktualisiert mit „Für wen ist diese App?“-Abschnitt

## 8.11.2024

- ENH: Initial commit

## 11.11.2024

- ENH: Titel wird von der config.json eingelesen

## 21.11.2024

- ENH: Sidebar mit Suchfunktion
- ENH: Überarbeitete CSS

## 28.11.2024

- ENH: POIs import über Url möglich

## 06.12.2024

- ENH: Import der POIs über Datensatz möglich (ApiUrl)
- FIX: POIs werden nicht mehr doppelt angezeigt bei mehrfachen klicken der Startseite
- ENH: Beschreibung "Über diese App" hinzugefügt

## 09.12.2024

- ENH: Konzentrations-Icons
