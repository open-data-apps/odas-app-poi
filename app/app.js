/*
 * Diese Funktion ist für die Inhalte der Startseite
 * zuständig.
 *
 * @param {Object} configdata - Alle Konfigurationsdaten der App
 * @returns {string} - darzustellendes HTML
 */

function app() {
  document.addEventListener("DOMContentLoaded", () => {
    // Setzen, dass POIs geladen wurden
    localStorage.setItem("poisLoaded", "false");
    loadConfig();
    // Leert das Textfeld searchInput beim Neuladen
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.value = "";
    }
  });
  document.getElementById("main-content").innerHTML = `<header class="header">
        <h1>Points of Interest</h1>
      <div id="map"></div>`;
  initializeMap();
  poiSidebar.style.display = "block"; // Zeige die Sidebar an
  // Erstellt ein MediaQueryList-Objekt
  const mediaQuery = window.matchMedia("(max-width: 768px)");

  // Funktion, die bei Änderungen in der Media Query ausgeführt wird
  function handleMediaQueryChange(e) {
    if (e.matches) {
      // Die Breite ist kleiner oder gleich 768px
      console.log("Die Ansicht ist kleiner oder gleich 768px breit.");
      const sidebartoggle = document.getElementById("sidebartoggle");
      sidebartoggle.style.visibility = "visible";
    }
  }

  // Direktes Einmaliges Ausführen der Funktion mit dem aktuellen Status
  handleMediaQueryChange(mediaQuery);

  // Listener hinzufügen, um auf Änderungen in der Media Query zu reagieren
  mediaQuery.addListener(handleMediaQueryChange);
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
async function initializeMap() {
  const map = L.map("map").setView([51.1657, 10.4515], 4);
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
    //Burger Menu schließ Funktion
    document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        const navbarToggler = document.querySelector(".navbar-toggler");
        const navbarCollapse = document.querySelector(".navbar-collapse");
        if (navbarCollapse.classList.contains("show")) {
          navbarToggler.click(); // Schließt das Menü
        }
      });
    });

    //Sidebar Suchfunktion
    document
      .getElementById("searchInput")
      .addEventListener("keyup", function () {
        let filter = this.value.toLowerCase();
        let items = document.querySelectorAll("#poiList .list-group-item");

        items.forEach((item) => {
          let text = item.textContent.toLowerCase();
          item.style.display = text.includes(filter) ? "" : "none";
        });
      });

    document
      .getElementById("sidebartoggle")
      .addEventListener("click", function () {
        if (poiSidebar.style.visibility === "hidden") {
          poiSidebar.style.visibility = "visible";
        } else {
          poiSidebar.style.visibility = "hidden";
        }
      });
  } catch (error) {
    console.error("Fehler beim Laden der Daten:", error);
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
