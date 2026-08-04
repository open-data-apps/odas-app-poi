# Changelog

## 1.13.0 - 2026-08-04
- FIX: Datenschutzhinweis "Beim Aufruf kontaktierte Drittanbieter" an das Vendoring angepasst — jetzt lokal ausgelieferte Bibliotheken (Bootstrap/Leaflet/Chart.js) sind aus der Liste entfernt, weiterhin extern geladene Dienste (Kartenkacheln, Zusatzbibliotheken) bleiben genannt

## 1.12.0 - 2026-08-04
- FIX: Bootstrap, Leaflet vendored in `app/vendor/` statt von CDN geladen (F-07 Teil 2) — Standalone-Betrieb laedt diese Bibliotheken nicht mehr extern

## 1.11.0 - 2026-08-04
- FIX: Leaflet von 1.7.1 auf 1.9.4 gehoben — vereinheitlicht mit dem Rest des Portfolios, Voraussetzung für das geplante Vendoring (F-07 Teil 2)

## 1.10.0 - 2026-08-04
- FIX: Drittanbieter (CDN, Kartendienste) in `datenschutz`-Default und README dokumentiert (F-07 Teil 1)
- FIX: Bootstrap CSS/JS auf einheitlich 5.3.8 gezogen (vorher gemischt 5.3.0/5.3.1 bzw. 5.3.0/5.3.0) (F-31)
- FIX: lokale `odas-config/config.json`: leere Pflichtfelder `beschreibung` und `datenschutz` mit dem App-Paket-Default befuellt

## 1.9.0 - 2026-07-31
- FIX: ZIP-Name aus dem Verzeichnis abgeleitet statt hart verdrahtet (F-22)
- ENH: Fehlendes `check-app`-Target im Makefile ergaenzt (F-22)
- FIX: Markdown-Reste in `beschreibung` und `impressum` durch HTML ersetzt (F-23) -
  Ueberschriften und Adressbloecke werden nicht mehr ohne Umbruch aneinandergehaengt

## 1.8.0 - 2026-07-31
- FIX: CSV-Zerlegung auf den Konventions-Parser umgestellt (F-14) - ein Komma im Namen
  oder in der Beschreibung verschiebt die Koordinatenspalten nicht mehr
- FIX: Spaltenzuordnung ueber die Kopfzeile statt ueber die Position
- FIX: Eintraege ohne verwertbare Koordinaten werden gezaehlt und angezeigt statt
  stillschweigend verworfen
- FIX: CKAN-Ressourcen ohne format-Feld loesen keinen TypeError mehr aus
- ENH: Empty-State "Keine Daten gefunden." ergaenzt

## 1.7.0 - 2026-07-31
- CHG: fehlendes Pflicht-Asset assets/branding.css ergaenzt und brandingCSSFile lokal aktiviert

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
