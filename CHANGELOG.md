# Changelog

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
