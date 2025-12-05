const toggleFocus = document.getElementById("toggleFocus");
const siteInput = document.getElementById("siteInput");
const addSiteBtn = document.getElementById("addSite");
const blockedList = document.getElementById("blockedList");

// Charge l'état au lancement de la popup
chrome.storage.sync.get(["enabled", "blockedSites"], data => {
  toggleFocus.checked = data.enabled || false;
  renderList(data.blockedSites || []);
});

// Active/désactive le mode Focus
toggleFocus.addEventListener("change", () => {
  const newState = toggleFocus.checked;

  // Met à jour le storage
  chrome.storage.sync.set({ enabled: newState }, () => {

    // Envoie un message à tous les onglets pour appliquer le nouveau toggle
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: "FOCUS_ADS_STATE",
          enabled: newState
        });
      });
    });

  });
});

// Ajout d’un site
addSiteBtn.addEventListener("click", () => {
  const site = siteInput.value.trim();
  if (!site) return;

  chrome.storage.sync.get("blockedSites", data => {
    const list = data.blockedSites || [];
    list.push(site);

    chrome.storage.sync.set({ blockedSites: list }, () => {
      renderList(list);
      siteInput.value = "";
    });
  });
});

// Affichage de la liste + boutons supprimer
function renderList(sites) {
  blockedList.innerHTML = "";

  sites.forEach((site, index) => {
    const li = document.createElement("li");
    li.textContent = site;

    const del = document.createElement("button");
    del.textContent = "❌";
    del.className = "delete-btn";

    del.addEventListener("click", () => {
      const newList = sites.filter((_, i) => i !== index);
      chrome.storage.sync.set({ blockedSites: newList });
      renderList(newList);
    });

    li.appendChild(del);
    blockedList.appendChild(li);
  });
}
