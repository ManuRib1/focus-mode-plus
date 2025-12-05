// Quand un onglet est mis à jour
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  chrome.storage.sync.get(["enabled", "blockedSites"], data => {
    const enabled = data.enabled || false;

    // 1️⃣ Envoie l'état du toggle au content.js
    chrome.tabs.sendMessage(tabId, {
      action: "FOCUS_ADS_STATE",
      enabled: enabled
    });

    // 2️⃣ Active/désactive le ruleset de blocage de pub selon le toggle
    chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: enabled ? ["ruleset_1"] : [],
      disableRulesetIds: enabled ? [] : ["ruleset_1"]
    });

    // 3️⃣ Si toggle OFF → pas besoin de bloquer le site
    if (!enabled) return;

    // 4️⃣ Vérifie si l'URL correspond à un site à bloquer
    const url = new URL(tab.url);
    const domain = url.hostname;

    const isBlocked = (data.blockedSites || []).some(site =>
      domain.includes(site)
    );

    if (isBlocked) {
      chrome.tabs.sendMessage(tabId, { action: "FOCUS_BLOCK" });
    }
  });
});

// Écoute les messages depuis popup.js pour mettre à jour le ruleset dynamiquement
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "UPDATE_RULESET") {
    chrome.storage.sync.get("enabled", data => {
      const enabled = data.enabled || false;
      chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: enabled ? ["ruleset_1"] : [],
        disableRulesetIds: enabled ? [] : ["ruleset_1"]
      });
      console.log("Ruleset mis à jour selon toggle :", enabled);
    });
  }
});
