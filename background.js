chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  chrome.storage.sync.get(["enabled", "blockedSites"], data => {

    // Envoie l'état du toggle au content.js
    chrome.tabs.sendMessage(tabId, {
      action: "FOCUS_ADS_STATE",
      enabled: data.enabled || false
    });

    // Si focus OFF : pas besoin d'aller plus loin
    if (!data.enabled) return;

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
