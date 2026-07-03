/*
 * Diese Funktion ist für die Inhalte der Startseite
 * zuständig.
 *
 * @param {Object} configdata - Alle Konfigurationsdaten der App
 * @returns {string} - darzustellendes HTML
 */
let map;

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

/**
 * Extrahiert den Pfad aus einer vollständigen URL.
 * @param {string} url
 * @returns {string}
 */
function extractPathFromUrl(url) {
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch (e) {
    return url;
  }
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
    // Proxy-Endpunkt für package_show
    const fullPath = window.location.pathname.replace(/\/+$/, "");
    const proxyEndpoint = `${fullPath}/odp-data?path=${extractPathFromUrl(
      configData.apiurl
    )}`;
    const response = await fetch(proxyEndpoint, { method: "POST" });
    const proxyData = await response.json();
    let data;
    try {
      data = JSON.parse(proxyData.content);
    } catch (e) {
      throw new Error("Fehler beim Parsen der API-Daten");
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
      // Proxy-Endpunkt für CSV-Ressource
      const csvProxyEndpoint = `${fullPath}/odp-data?path=${extractPathFromUrl(
        resource.url
      )}`;
      const csvResponse = await fetch(csvProxyEndpoint, { method: "POST" });
      const csvProxyData = await csvResponse.json();
      const csvText = csvProxyData.content;
      const parsedPOIs = parseCSV(csvText);

      parsedPOIs.forEach((poi) => {
        if (poiNames.has(poi.name)) {
          return;
        }
        poiNames.add(poi.name);

        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${poi.latitude},${poi.longitude}`;
        const popupContent = `
          <strong>${poi.name}</strong><br>
          ${poi.description}<br>
          <a href="${googleMapsUrl}" target="_blank">In Google Maps ansehen</a>
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
