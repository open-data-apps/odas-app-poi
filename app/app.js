/*
 * Diese Funktion ist für die Inhalte der Startseite
 * zuständig.
 *
 * @param {Object} configdata - Alle Konfigurationsdaten der App
 * @returns {string} - darzustellendes HTML
 */
let map;

/*
 * Template-Hook (oda-generic 1.4.0). Die Base ruft ihn vor dem Rendern der neuen Seite
 * auf. Diese App haelt eine Leaflet-Karte und eine eigene Sidebar ausserhalb von
 * #main-content; beides muss beim Verlassen der Startseite abgeraeumt bzw. ausgeblendet
 * werden. Frueher stand diese Logik in app/app-base.js und hat die Datei vom Template
 * abweichen lassen.
 */
function onPageLeave(page) {
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
  return `${appPath}/odp-data?path=${encodeURIComponent(
    extractPathFromUrl(targetUrl),
  )}`;
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

async function fetchOdasJson(targetUrl, configdata = {}) {
  return JSON.parse(await fetchOdasResource(targetUrl, configdata));
}

async function initializeMap(configdata) {
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

  try {
    let data;
    try {
      data = await fetchOdasJson(configdata.apiurl, configdata);
    } catch (e) {
      throw new Error("Fehler beim Laden der API-Daten: " + e.message);
    }

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
      resource.format.toLowerCase().includes("csv")
    );

    if (!resources.length) {
      throw new Error("Keine CSV-Dateien gefunden");
    }

    const poiList = document.getElementById("poiList");
    poiList.innerHTML = "";

    for (const resource of resources) {
      const csvText = await fetchOdasResource(resource.url, configdata);
      const parsedPOIs = parseCSV(csvText);

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

    map.addLayer(markerClusterGroup); // Cluster zur Karte hinzufügen
    map.fitBounds(markerClusterGroup.getBounds(), { maxZoom: 5 });

    localStorage.setItem("poisLoaded", "true");

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
    const poiList = document.getElementById("poiList");
    if (poiList) {
      poiList.innerHTML = `<li class="list-group-item text-danger"><strong>Fehler beim Laden:</strong> ${escapeHtml(
        error.message
      )}</li>`;
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

function parseCSV(csvText) {
  const rows = csvText.trim().split("\n").slice(1);
  return rows.map((row) => {
    const [name, latitude, longitude, description] = row.split(",");
    return {
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      description,
    };
  });
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
