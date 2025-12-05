let focusActive = false;
let observer = null;

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

chrome.runtime.onMessage.addListener((msg) => {
  console.log("Message reçu :", msg);

  if (msg.action === "FOCUS_ADS_STATE") {
    focusActive = msg.enabled;
    console.log("Toggle état :", focusActive);

    if (focusActive) startAdBlock();
    else stopAdBlock();
  }

  if (msg.action === "FOCUS_BLOCK") {
    applyFocusOverlay();
  }
});

// ------------------- AD BLOCKING -------------------
function hideAds() {
  adSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      // Masque uniquement si toggle ON
      if (focusActive && el.style.display !== "none") {
        el.style.setProperty('display', 'none', 'important');
        console.log("Pub masquée :", el);
      }
    });
  });
}

function showAds() {
  adSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      // Supprime la règle display:none inline
      el.style.removeProperty('display');
      console.log("Pub restaurée :", el);
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
    if (child !== blocker) child.style.filter = "blur(5px)";
  });

  document.body.appendChild(blocker);
}
