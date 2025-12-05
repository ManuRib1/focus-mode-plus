let focusActive = false;
let observer = null;

// ------------------- AD SELECTORS -------------------
const adSelectors = [
  "[id^='ad-']",
  "[class^='ad-']",
  "[id*='advert']",
  "[class*='advert']",
  "[id*='promo']",
  "[class*='promo']",
  "[id*='banner']",
  "[class*='banner']",
  "[id*='sponsor']",
  "[class*='sponsor']"
];

// ------------------- MESSAGE LISTENER -------------------
chrome.runtime.onMessage.addListener((msg) => {
  console.log("Message reçu dans content.js :", msg);

  if (msg.action === "FOCUS_ADS_STATE") {
    focusActive = msg.enabled;
    console.log("Toggle état actuel :", focusActive);

    if (focusActive) {
      console.log("Activation du blocage des pubs");
      startAdBlock();
    } else {
      console.log("Désactivation du blocage des pubs");
      stopAdBlock();
    }
  }

  if (msg.action === "FOCUS_BLOCK") {
    console.log("Blocage complet du site activé");
    applyFocusOverlay();
  }
});

// ------------------- FOCUS OVERLAY -------------------
function applyFocusOverlay() {
  if (document.getElementById("focus-blocker")) return;

  const blocker = document.createElement("div");
  blocker.id = "focus-blocker";

  Object.assign(blocker.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.85)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    zIndex: "2147483647",
    pointerEvents: "all",
    textAlign: "center"
  });

  blocker.innerText = "⛔ Ce site est bloqué en mode Focus.";

  document.documentElement.style.overflow = "hidden";

  const bodyChildren = Array.from(document.body.children);
  bodyChildren.forEach(child => {
    if (child !== blocker) {
      child.style.filter = "blur(5px)";
    }
  });

  document.body.appendChild(blocker);
}

// ------------------- AD BLOCKING -------------------
function hideAds() {
  console.log("hideAds() appelé");
  adSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      console.log("Masquage pub :", el);
      el.dataset.wasVisible = el.style.display !== "none";
      el.style.display = "none";
    });
  });
}

function showAds() {
  console.log("showAds() appelé");
  adSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (el.dataset.wasVisible) {
        console.log("Restoration pub :", el);
        el.style.display = "";
        delete el.dataset.wasVisible;
      }
    });
  });
}

function startAdBlock() {
  console.log("startAdBlock() appelé");
  hideAds();

  if (!observer) {
    observer = new MutationObserver(() => {
      if (focusActive) hideAds();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    console.log("MutationObserver activé");
  }
}

function stopAdBlock() {
  console.log("stopAdBlock() appelé");
  showAds();

  if (observer) {
    observer.disconnect();
    observer = null;
    console.log("MutationObserver désactivé");
  }
}
