/*
 * Diese Funktion ist für die Inhalte der Startseite
 * zuständig.
 *
 * @param {Object} configdata - Alle Konfigurationsdaten der App
 * @returns {string} - darzustellendes HTML
 */
let map;
// F-70: Dispose-/Token-Guard fuer initializeMap(). Ein alter, noch laufender
// initializeMap()-Aufruf darf nach einem Re-Init (erneuter Start, Seitenwechsel)
// weder in die neue map-Referenz noch ins DOM schreiben. mapDisposed faengt den
// Fall "Startseite verlassen, waehrend ein Ladevorgang laeuft" ab; mapLoadToken
// faengt den Fall "Startseite erneut initialisiert, waehrend ein alter Ladevorgang
// noch laeuft" ab (z.B. schnelles zweimaliges Rendern von #startseite).
let mapDisposed = false;
let mapLoadToken = 0;

/*
 * Template-Hook (oda-generic 1.4.0). Die Base ruft ihn vor dem Rendern der neuen Seite
 * auf. Diese App haelt eine Leaflet-Karte und eine eigene Sidebar ausserhalb von
 * #main-content; beides muss beim Verlassen der Startseite abgeraeumt bzw. ausgeblendet
 * werden. Frueher stand diese Logik in app/app-base.js und hat die Datei vom Template
 * abweichen lassen.
 */
function onPageLeave(page) {
  if (page !== "startseite") {
    // F-70: markiert einen evtl. noch laufenden initializeMap()-Aufruf als verworfen,
    // damit dessen asynchrone Fortsetzung nach dem Verlassen der Startseite nichts
    // mehr in DOM oder Karte schreibt.
    mapDisposed = true;
  }
  if (page !== "startseite" && map) {
    try {
      map.remove();
    } catch (e) {
      console.warn("Fehler beim Entfernen der Leaflet-Karte:", e);
    }
    map = null;
  }

  const poiSidebar = document.getElementById("poiSidebar");
  const sidebartoggle = document.getElementById("sidebartoggle");
  if (page === "startseite") {
    if (sidebartoggle) sidebartoggle.style.visibility = "";
  } else {
    if (sidebartoggle) sidebartoggle.style.visibility = "hidden";
    if (poiSidebar) poiSidebar.style.display = "none";
  }
}

function escapeHtml(str) {
  const s = String(str ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderWeitereInfos(configdata) {
  const links = (configdata.weiterfuehrendeLinks || "").trim();
  if (!links) return "";
  return (
    '<section class="poi-weitere-infos mt-4">' +
    '<h2 class="h5 mb-3">Weitere Informationen</h2>' +
    '<div class="poi-weitere-infos-content">' +
    links +
    "</div></section>"
  );
}

function extractDatenStand(apiResponse) {
  const raw = apiResponse?.result?.metadata_modified || null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toLocaleDateString("de-DE");
}

function app(configdata, enclosingHtmlDivElement) {
  enclosingHtmlDivElement.innerHTML = `
    <header class="header">
      <h1>Points of Interest</h1>
    </header>
    <div id="map"></div>
  `;
  initializeMap(configdata);
  document.getElementById("poiSidebar").style.display = "block";
}

function isOdasProxyEnabled(configdata = {}) {
  return String(configdata.proxyAktiv || "").trim().toLowerCase() === "ja";
}

/**
 * Extrahiert den Pfad aus einer vollständigen URL.
 * @param {string} url
 * @returns {string}
 */
function extractPathFromUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname + parsedUrl.search;
  } catch (_error) {
    return String(url || "");
  }
}

function getOdasAppBasePath(pathname) {
  let appPath =
    pathname === undefined
      ? typeof window !== "undefined"
        ? window.location.pathname
        : "/"
      : String(pathname || "/");

  if (!appPath.endsWith("/")) {
    const lastSlashIndex = appPath.lastIndexOf("/");
    const lastSegment = appPath.substring(lastSlashIndex + 1);
    if (lastSegment.includes(".")) {
      appPath = appPath.substring(0, lastSlashIndex + 1);
    }
  }

  return appPath.replace(/\/+$/, "");
}

function getOdasProxyEndpoint(targetUrl, pathname) {
  const appPath = getOdasAppBasePath(pathname);
  return `${appPath}/odp-data?path=${encodeURIComponent(targetUrl)}`;
}

async function fetchViaOdasProxy(targetUrl) {
  const response = await fetch(getOdasProxyEndpoint(targetUrl), {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`ODAS-Proxy-Fehler: HTTP ${response.status}`);
  }

  const proxyData = await response.json();
  if (!proxyData || typeof proxyData.content !== "string") {
    throw new Error("ODAS-Proxy-Antwort enthält keinen content-String.");
  }

  return proxyData.content;
}

async function fetchOdasResource(targetUrl, configdata = {}) {
  if (isOdasProxyEnabled(configdata)) {
    return fetchViaOdasProxy(targetUrl);
  }

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.text();
  } catch (error) {
    throw new Error(
      `Direkter Datenabruf fehlgeschlagen (${error.message}). Bitte prüfen Sie die Daten-URL und die CORS-Freigabe der Datenquelle.`,
    );
  }
}

/**
 * Löst eine benannte Datenressource aus configdata.apiurls auf.
 * Neue apiurls-Form (typ: "array"); das frühere skalare apiurl wird nicht mehr gelesen.
 * @returns {string} getrimmte URL, oder "" für den Zustand "keine Quelle konfiguriert"
 */
function getOdasApiUrl(configdata, name) {
  const liste = Array.isArray(configdata && configdata.apiurls) ? configdata.apiurls : [];
  const treffer = liste.find((eintrag) => eintrag && eintrag.name === name);
  return String((treffer && treffer.url) || "").trim();
}

async function fetchOdasJson(targetUrl, configdata = {}) {
  const rawContent = await fetchOdasResource(targetUrl, configdata);
  try {
    return JSON.parse(rawContent);
  } catch (_error) {
    throw new Error(
      `Die konfigurierte Daten-URL liefert kein JSON, sondern ${describeNonJsonPayload(rawContent)}. ` +
        "Bitte in der Instanzkonfiguration den API-Endpunkt der Datenquelle eintragen, " +
        "nicht den Datensatz- oder Download-Link.",
    );
  }
}

function describeNonJsonPayload(rawContent) {
  const text = String(rawContent == null ? "" : rawContent).trim();
  if (!text) return "eine leere Antwort";
  if (text.startsWith("<")) return "eine HTML-Seite";
  const firstLine = text.split(/\r?\n/, 1)[0];
  if (/[,;]/.test(firstLine)) return "eine CSV- oder Textdatei";
  return "unlesbaren Inhalt";
}

async function initializeMap(configdata) {
  // F-70: Dieser Aufruf beginnt einen neuen Ladevorgang – eine evtl. gesetzte
  // Dispose-Markierung eines Vorgaengers gilt fuer ihn nicht mehr, und ein eigener
  // Token identifiziert ihn, damit spaetere, noch aeltere Aufrufe erkennbar bleiben.
  const token = ++mapLoadToken;
  mapDisposed = false;

  if (typeof map !== 'undefined' && map) {
    try {
      map.remove();
    } catch (e) {
      console.warn("Fehler beim Entfernen der Leaflet-Karte in initializeMap:", e);
    }
    map = null;
  }

  map = L.map("map").setView([51.1657, 10.4515], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);

  const poiNames = new Set();
  const markerClusterGroup = L.markerClusterGroup(); // Cluster-Gruppe erstellen

  const quelle = getOdasApiUrl(configdata, "poi");
  if (!quelle || /^\{\{.*\}\}$/.test(quelle) || /^<.*>$/.test(quelle)) {
    const poiListEmpty = document.getElementById("poiList");
    if (poiListEmpty) {
      poiListEmpty.innerHTML =
        '<li class="list-group-item"><div class="alert alert-info mb-0" role="alert">Es ist keine Datenquelle konfiguriert.</div></li>';
    }
    return;
  }

  try {
    let data;
    try {
      data = await fetchOdasJson(getOdasApiUrl(configdata, "poi"), configdata);
    } catch (e) {
      throw new Error("Fehler beim Laden der API-Daten: " + e.message);
    }

    // F-70: nach dem Await pruefen, ob dieser Ladevorgang inzwischen ueberholt
    // (Re-Init) oder verworfen (Seite verlassen) wurde, bevor DOM/Karte angefasst werden.
    if (mapDisposed || token !== mapLoadToken) return;

    const stand = extractDatenStand(data);
    if (stand) {
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        const frischeEl = document.createElement("div");
        frischeEl.className = "text-muted small text-end mb-2";
        frischeEl.textContent = "Aktualisiert: " + stand;
        mainContent.insertBefore(frischeEl, mainContent.firstChild);
      }
    }

    const resources = data.result.resources.filter((resource) =>
      String((resource && resource.format) || "")
        .toLowerCase()
        .includes("csv")
    );

    if (!resources.length) {
      const poiList = document.getElementById("poiList");
      if (poiList) {
        poiList.innerHTML =
          '<li class="list-group-item"><div class="alert alert-info mb-0" role="alert">Keine CSV-Dateien im Datensatz gefunden.</div></li>';
      }
      return;
    }

    const poiList = document.getElementById("poiList");
    poiList.innerHTML = "";

    let verworfenGesamt = 0;
    for (const resource of resources) {
      const csvText = await fetchOdasResource(resource.url, configdata);

      // F-70: erneut nach dem Await pruefen (jede Schleifeniteration awaitet neu).
      if (mapDisposed || token !== mapLoadToken) return;

      const { pois: parsedPOIs, verworfen } = parseCSV(csvText);
      verworfenGesamt += verworfen;

      parsedPOIs.forEach((poi) => {
        if (poiNames.has(poi.name)) {
          return;
        }
        poiNames.add(poi.name);

        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${poi.latitude},${poi.longitude}`;
        const popupContent = `
          <strong>${escapeHtml(poi.name)}</strong><br>
          ${escapeHtml(poi.description)}<br>
          <a href="${escapeHtml(googleMapsUrl)}" target="_blank" rel="noopener">In Google Maps ansehen</a>
        `;

        const marker = L.marker([poi.latitude, poi.longitude]).bindPopup(
          popupContent
        );

        markerClusterGroup.addLayer(marker);

        const poiItem = document.createElement("li");
        poiItem.classList.add("list-group-item");
        poiItem.textContent = poi.name;
        poiItem.addEventListener("click", () => {
          markerClusterGroup.zoomToShowLayer(marker, () => {
            marker.openPopup();
          });
        });
        poiList.appendChild(poiItem);
      });
    }

    if (!poiNames.size) {
      poiList.innerHTML =
        '<li class="list-group-item"><div class="alert alert-info mb-0" role="alert">Keine Daten gefunden.</div></li>';
    } else if (verworfenGesamt > 0) {
      console.warn(
        `POI: ${verworfenGesamt} Zeile(n) ohne verwertbare Koordinaten übersprungen.`,
      );
      const hinweis = document.createElement("li");
      hinweis.className = "list-group-item";
      hinweis.innerHTML =
        '<div class="alert alert-warning mb-0" role="alert">' +
        escapeHtml(String(verworfenGesamt)) +
        " Eintrag/Einträge der Datenquelle haben keine verwertbaren Koordinaten und fehlen auf der Karte.</div>";
      poiList.insertBefore(hinweis, poiList.firstChild);
    }

    // F-70: letzte Absicherung unmittelbar vor der map/markerClusterGroup-Mutation,
    // die im Audit-Finding als Rennbedingung identifiziert wurde.
    if (mapDisposed || token !== mapLoadToken) return;

    map.addLayer(markerClusterGroup); // Cluster zur Karte hinzufügen
    if (poiNames.size) {
      map.fitBounds(markerClusterGroup.getBounds(), { maxZoom: 5 });
    }

    setupEventListeners();

    const weitereHTML = renderWeitereInfos(configdata);
    if (weitereHTML) {
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        const weitereEl = document.createElement("div");
        weitereEl.innerHTML = weitereHTML;
        mainContent.appendChild(weitereEl);
      }
    }
  } catch (error) {
    console.error("Fehler beim Laden der Daten:", error);

    // F-70: eine ueberholte/verworfene Ladung soll keine Fehlermeldung mehr in ein
    // inzwischen fremdes poiList schreiben.
    if (mapDisposed || token !== mapLoadToken) return;

    const poiList = document.getElementById("poiList");
    if (poiList) {
      poiList.innerHTML = `<li class="list-group-item"><div class="alert alert-danger mb-0" role="alert"><strong>Fehler beim Laden der Daten:</strong> ${escapeHtml(
        error.message
      )}</div></li>`;
    }
  }
}

function setupEventListeners() {
  // Search-Listener
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.onkeyup = function () {
      let filter = this.value.toLowerCase();
      let items = document.querySelectorAll("#poiList .list-group-item");
      items.forEach((item) => {
        let text = item.textContent.toLowerCase();
        item.style.display = text.includes(filter) ? "" : "none";
      });
    };
  }

  // Sidebar Toggle-Listener
  const sidebartoggle = document.getElementById("sidebartoggle");
  if (sidebartoggle) {
    sidebartoggle.onclick = function () {
      const poiSidebar = document.getElementById("poiSidebar");
      if (poiSidebar) {
        poiSidebar.classList.toggle("show");
      }
    };
  }
}

// ── CSV-PARSING ──────────────────────────────────────────────────────────────
// Kommunale Open-Data-CSVs sind häufig Semikolon-getrennt, enthalten gequotete
// Felder und CRLF-Zeilenenden. Naives split(",") verschiebt bei einem Komma im
// Namen oder in der Beschreibung die Koordinatenspalten.

function detectCsvDelimiter(text) {
  const firstLine = String(text).split(/\r\n|\r|\n/)[0] || "";
  let best = ",";
  let bestCount = 0;
  [";", ",", "\t", "|"].forEach((cand) => {
    let count = 0;
    let inQuotes = false;
    for (let i = 0; i < firstLine.length; i++) {
      const c = firstLine[i];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === cand && !inQuotes) count++;
    }
    if (count > bestCount) {
      bestCount = count;
      best = cand;
    }
  });
  return best;
}

function parseCsv(text, delimiter) {
  const sep = delimiter || detectCsvDelimiter(text);
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === sep) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

// Liefert { pois, verworfen } — Zeilen ohne brauchbare Koordinaten werden
// gezählt statt stillschweigend verworfen.
function parseCSV(csvText) {
  const rows = parseCsv(csvText);
  if (rows.length < 2) return { pois: [], verworfen: 0 };

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (...namen) => {
    for (const n of namen) {
      const i = headers.indexOf(n);
      if (i !== -1) return i;
    }
    return -1;
  };
  // Kopfzeile bevorzugen, Spaltenposition als Rückfallebene.
  const iName = idx("name", "bezeichnung", "titel");
  const iLat = idx("latitude", "lat", "breitengrad");
  const iLon = idx("longitude", "lon", "lng", "längengrad", "laengengrad");
  const iDesc = idx("description", "beschreibung", "info");
  const spalte = (cols, i, fallback) =>
    (cols[i !== -1 ? i : fallback] || "").trim();

  const pois = [];
  let verworfen = 0;
  rows.slice(1).forEach((cols) => {
    const name = spalte(cols, iName, 0);
    const latitude = parseFloat(spalte(cols, iLat, 1).replace(",", "."));
    const longitude = parseFloat(spalte(cols, iLon, 2).replace(",", "."));
    if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      verworfen++;
      return;
    }
    pois.push({
      name,
      latitude,
      longitude,
      description: spalte(cols, iDesc, 3),
    });
  });
  return { pois, verworfen };
}

// Funktion zum Ersetzen von "\n" durch Zeilenumbrüche
function formatTextWithLineBreaks(text) {
  return text
    .replace(/\n/g, "<br>")
    .replace(
      /(\+?\d[\d\s()-]{4,}\d)/g,
      '<a href="tel:$1" class="phone-link">$1</a>'
    );
}

/*
 * Diese Funktion kann Bibliotheken und benötigte Skripte laden.
 * Sie hängt den zurückgegebenen HTML Code in die Head Section an.

 * @returns {string} - HTML mit script, link, etc. Tags
 */
function addToHead() {}
