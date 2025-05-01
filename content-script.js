const modifierKeys = ["shift", "control", "alt", "meta"];
let lastRightClickedElement = null;
let isMappingMode = false;
let currentSelectorForMapping = null;
const KEY_CAPTURE_OVERLAY_ID = "tap-it-key-capture-overlay";

// --- Right Click Handling ---

document.addEventListener(
  "contextmenu",
  (event) => {
    lastRightClickedElement = event.target;
  },
  true,
);

// --- Selector Generation ---

function getUniqueSelector(el) {
  if (!el || !(el instanceof Element)) {
    console.error("Tap-It: Invalid element passed to getUniqueSelector");
    return null;
  }
  if (el.id) {
    try {
      if (document.querySelectorAll(`#${CSS.escape(el.id)}`).length === 1) {
        return `#${CSS.escape(el.id)}`;
      }
    } catch (e) {
      console.warn("Tap-It: Error validating ID uniqueness.", e);
    }
  }

  if (el === document.body) return "body";
  let path = [];
  let currentEl = el;
  while (
    currentEl &&
    currentEl.nodeType === Node.ELEMENT_NODE &&
    currentEl !== document.body
  ) {
    let selector = currentEl.nodeName.toLowerCase();

    //     const classes = currentEl.className.trim().split(/\s+/).join('.');
    //     if (classes) {
    //        selector += "." + classes;
    //     }
    // }

    let sibling = currentEl;
    let nth = 1;
    while ((sibling = sibling.previousElementSibling)) {
      if (sibling.nodeName === currentEl.nodeName) nth++;
    }

    let needsNthOfType = false;
    sibling = currentEl.nextElementSibling;
    while (sibling) {
      if (sibling.nodeName === currentEl.nodeName) {
        needsNthOfType = true;
        break;
      }
      sibling = sibling.nextElementSibling;
    }
    if (nth > 1 || needsNthOfType) {
      selector += `:nth-of-type(${nth})`;
    }

    path.unshift(selector);
    currentEl = currentEl.parentElement;
  }

  const finalPath = "body > " + path.join(" > ");

  try {
    if (document.querySelector(finalPath) === el) {
      return finalPath;
    } else {
      console.warn(
        "Tap-It: Generated selector doesn't uniquely identify the element. Trying simpler path.",
      );

      path = [];
      currentEl = el;
      while (
        currentEl &&
        currentEl.nodeType === Node.ELEMENT_NODE &&
        currentEl !== document.body
      ) {
        let selector = currentEl.nodeName.toLowerCase();
        let sibling = currentEl;
        let nth = 1;
        while ((sibling = sibling.previousElementSibling)) {
          if (sibling.nodeName === currentEl.nodeName) nth++;
        }
        selector += `:nth-of-type(${nth})`;
        path.unshift(selector);
        currentEl = currentEl.parentElement;
      }
      return "body > " + path.join(" > ");
    }
  } catch (e) {
    console.error("Tap-It: Error validating selector:", finalPath, e);
    return null;
  }

  return null;
}

// --- Input Focus Check ---

function isInputFocused() {
  const activeEl = document.activeElement;
  if (!activeEl) return false;
  const tagName = activeEl.tagName.toUpperCase();
  return (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT" ||
    activeEl.isContentEditable
  );
}

// --- Element Querying ---

function queryElementBySelector(selector) {
  if (!selector) return null;
  try {
    return document.querySelector(selector);
  } catch (e) {
    console.error(`Tap-It: Invalid selector "${selector}":`, e);
    return null;
  }
}

// --- Key Capture UI ---

function showKeyCaptureOverlay(elementToHighlight, onKey) {
  const existingOverlay = document.getElementById(KEY_CAPTURE_OVERLAY_ID);
  if (existingOverlay) {
    existingOverlay.remove();
  }

  if (!document.body.contains(elementToHighlight)) {
    alert(
      "Tap-It: The element to map seems to have disappeared. Please try again.",
    );
    return;
  }

  const originalOutline = elementToHighlight.style.outline;
  elementToHighlight.style.outline = "3px solid #FFDE03";

  const overlay = document.createElement("div");
  overlay.id = KEY_CAPTURE_OVERLAY_ID;
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "sans-serif",
    fontSize: "24px",
    zIndex: "2147483647",
    userSelect: "none",
    textAlign: "center",
    padding: "20px",
  });
  overlay.innerHTML =
    "<p>Press the key you want to map to the highlighted element (Esc to cancel)<br/><i>Note: shift, control, alt, meta keys won't work</i></p>";
  document.body.appendChild(overlay);

  function handleKey(e) {
    e.preventDefault();
    e.stopPropagation();

    const key = e.key.toLowerCase();

    overlay.remove();
    document.removeEventListener("keydown", handleKey, true);

    elementToHighlight.style.outline = originalOutline;

    if (key === "escape") {
      console.log("Tap-It: Mapping cancelled by user.");
      isMappingMode = false;
      currentSelectorForMapping = null;
      return;
    }

    if (modifierKeys.includes(key)) {
      console.log("Tap-It: Modifier keys cannot be mapped. Mapping cancelled.");
      isMappingMode = false;
      currentSelectorForMapping = null;
      return;
    }

    onKey(key);
  }

  document.addEventListener("keydown", handleKey, true);
}

// --- Storage Interaction ---

async function saveMapping(hostname, selector, key) {
  try {
    const data = await chrome.storage.sync.get([hostname]);
    let mappings = data[hostname] || [];

    mappings = mappings.filter((m) => m.key !== key);

    mappings.push({ selector: selector, key: key, label: "" });
    await chrome.storage.sync.set({ [hostname]: mappings });
    console.log(`Tap-It: Saved mapping for key "${key}" on ${hostname}`);
  } catch (error) {
    console.error("Tap-It: Error saving mapping to storage:", error);
    alert("Tap-It: Error saving mapping. See console for details.");
  }
}

async function getMappings(hostname) {
  try {
    const data = await chrome.storage.sync.get([hostname]);
    return data[hostname] || [];
  } catch (error) {
    console.error("Tap-It: Error getting mappings from storage:", error);
    return [];
  }
}

// --- Message Handling ---

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getSelectorForLastRightClick") {
    if (lastRightClickedElement) {
      const selector = getUniqueSelector(lastRightClickedElement);
      if (selector) {
        sendResponse({ selector: selector });
      } else {
        console.error(
          "Tap-It: Failed to generate selector for:",
          lastRightClickedElement,
        );
        sendResponse({ error: "Failed to generate selector." });
      }
    } else {
      console.warn("Tap-It: No element stored from right-click.");
      sendResponse({ error: "No element recorded from right-click." });
    }

    return true;
  } else if (msg.action === "startMapping" && msg.elementSelector) {
    if (isMappingMode) {
      console.warn("Tap-It: Already in mapping mode. Ignoring request.");
      return;
    }
    const targetElement = queryElementBySelector(msg.elementSelector);
    if (!targetElement) {
      console.error(
        "Tap-It: Cannot start mapping. Element not found for selector:",
        msg.elementSelector,
      );
      alert(
        "Tap-It: Could not find the element to map. It might have changed. Please try right-clicking again.",
      );
      return;
    }

    isMappingMode = true;
    currentSelectorForMapping = msg.elementSelector;

    showKeyCaptureOverlay(targetElement, (pressedKey) => {
      const hostname = window.location.hostname;
      saveMapping(hostname, currentSelectorForMapping, pressedKey).then(() => {
        isMappingMode = false;
        currentSelectorForMapping = null;
        targetElement.style.outline = "3px solid lightgreen";
        setTimeout(() => {
          targetElement.style.outline = "";
        }, 1000);
      });
    });
  }
  return true;
});

// --- Keydown Listener for Triggering Clicks ---

document.addEventListener("keydown", async (e) => {
  if (isMappingMode || isInputFocused()) {
    return;
  }

  const key = e.key.toLowerCase();

  if (
    modifierKeys.includes(key) ||
    e.shiftKey ||
    e.ctrlKey ||
    e.altKey ||
    e.metaKey
  ) {
    return;
  }

  const hostname = window.location.hostname;
  const mappings = await getMappings(hostname);
  const mapping = mappings.find((m) => m.key === key);

  if (mapping) {
    const el = queryElementBySelector(mapping.selector);
    if (el) {
      e.preventDefault();
      el.click();
    } else {
      console.warn(
        `Tap-It: Element for key "${key}" not found with selector "${mapping.selector}". Page might have changed.`,
      );
    }
  }
});

// --- Function to Log Bindings ---

async function logCurrentBindings() {
  const hostname = window.location.hostname;
  console.groupCollapsed(`Tap-It: Active Key Bindings for ${hostname}`);

  try {
    const mappings = await getMappings(hostname);

    if (mappings.length === 0) {
      console.log("No bindings found for this site.");
    } else {
      mappings.forEach((mapping) => {
        const element = queryElementBySelector(mapping.selector);
        const labelInfo = mapping.label ? ` (${mapping.label})` : "";
        if (element) {
          console.log(`${mapping.key}:${labelInfo}`, element);
        } else {
          console.warn(
            `Key: ${mapping.key} - Element not found (selector: "${mapping.selector}")`,
          );
        }
      });
    }
  } catch (error) {
    console.error("Tap-It: Error retrieving or logging bindings:", error);
  } finally {
    console.groupEnd();
  }
}

if (document.readyState === "complete") {
  logCurrentBindings();
} else {
  window.addEventListener("load", logCurrentBindings);
}
