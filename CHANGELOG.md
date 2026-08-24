# Changelog

## 1.29.0 - 2026-08-22
- **CHG:** `api-version` im Paket vor `instanz-config` verschoben (Template-Reihenfolge, keine Inhaltsänderung).

## 1.28.0 - 2026-08-22
- **CHG:** `version` in `app-package.json` zu `app-version` umbenannt.
- **ENH:** Top-Level-Feld `app-package-version` ergänzt (Wert `"2"`: mehrere benannte API-URLs über `instanz-config.apiurls`).

## 1.27.0 - 2026-08-21
- **CHG:** Skalares `apiurl` durch das Array-Feld `apiurls` ersetzt (`typ: "array"`, Eintrag `poi`). Neuer Standard portfolioweit; `apiurl` entfällt. `app.js` liest die Datenquelle jetzt über `getOdasApiUrl(configdata, "poi")`.

## 1.26.0 - 2026-08-20
- Markdown-Metadaten: Paketbeschreibungen auf echtes Markdown umgestellt, exakte Identität Top-Level/Instanz hergestellt, lokale HTML-Fixture semantisch gespiegelt.

## 1.25.0 - 2026-08-20
- FIX: Dispose-/Token-Guard in `initializeMap()` ergänzt — ein alter, noch laufender Ladevorgang kann nach einem Re-Init (erneutes Rendern der Startseite) oder nach Verlassen der Startseite nicht mehr seine `markerClusterGroup` an die neue Karte hängen oder ins DOM schreiben (F-70)

## 1.24.0 - 2026-08-17
- `apiurl.hilfe` verwendete das Wort „Datensatz" für das Feld, das explizit NICHT die Datensatzseite sein soll (plus Tippfehler „Ressoucen"); jetzt mit expliziter Abgrenzung zu `urlDaten` formuliert (F-68)

## 1.23.0 - 2026-08-17
- `fetchOdasJson()` wirft jetzt bei nicht-JSON-Antworten (CSV, HTML, leerer Body) eine sprechende Konfigurationsfehlermeldung statt der rohen `JSON.parse`-Parserfehlermeldung (F-66)
- `urlDaten` zeigte auf einen nicht mehr existierenden Host (`offenedaten.esslingen.de`/`open-data-esslingen.de`, NXDOMAIN) bzw. auf den Platzhalter `.../testdaten` (HTTP 404) — jetzt auf die reale Datensatz-Landingpage der tatsächlich konfigurierten `apiurl`-Quelle verweisend, live per HTTP-Abruf verifiziert (F-67)

## 1.22.0 - 2026-08-17
- **CHG:** `instanz-config`-`category`-Vokabular auf Deutsch umgestellt (`allgemein`, `beschreibung`, `datenherkunft`, `kontakt-rechtliches`, `sonstiges`); die entfallenen Kategorien `metrics` und `advanced` wurden auf `beschreibung` bzw. `sonstiges` verteilt

## 1.21.0 - 2026-08-12
- FIX: Ungenutztes `app/app-base.css` aus der Auslieferung entfernt (F-54c): Die Datei wurde nie eingebunden — diese App trägt ihr Layout vollständig in `app/app.css`. Ein Einbinden schied aus, weil die Base-Regeln für `body` (display, flex-direction, height) nicht überschrieben werden und das Legacy-Layout verändert hätten.

## 1.20.0 - 2026-08-12
- FIX: Toten Storage-Schreibzugriff (`poisLoaded`) entfernt — bei blockiertem Browserspeicher konnte der Fehlerzweig korrekt geladene Daten als Fehler rendern und die Suche/Sidebar deaktivieren (F-50)

## 1.19.0 - 2026-08-06
- FIX: Datenschutzangabe beschreibt den tatsaechlichen Stand nach dem Vendoring (Welle G)

## 1.18.0 - 2026-08-06
- FIX: Drittanbietersektion nennt keine Beim-Aufruf-Behauptung mehr (Welle G)

## 1.17.0 - 2026-08-06
- FIX: Drittanbieterliste "Beim Aufruf kontaktierte Drittanbieter" an das Vendoring angepasst — jetzt lokal ausgelieferte Bibliotheken (Leaflet MarkerCluster) sind aus der Liste entfernt, weiterhin extern geladene Dienste (Kartenkacheln, Google-Maps-Link) bleiben genannt

## 1.16.0 - 2026-08-06
- FIX: Leaflet MarkerCluster vendored in `app/vendor/` statt von CDN geladen (Vendoring Teil 3) — Standalone-Betrieb laedt die Zusatzbibliotheken nicht mehr extern

## 1.15.0 - 2026-08-06
- FIX: Logo in der Navigationsleiste fuehrt wieder zur Startseite zurueck — der Link zeigte auf `#` statt `#startseite` und wurde von `setupSamePageLinks()` verworfen; das blockierende `onclick="event.preventDefault();"` ist entfernt (F-28, Nachtrag)

## 1.14.0 - 2026-08-06
- FIX: Base auf Template oda-generic 1.6.0 vereinheitlicht (Hook renderPageOverride)

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
