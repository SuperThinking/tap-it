// TODO:
// icon for the app
// export / import mappings
// show all mappings in a window on pressing cmd+t+i
// publish extension

// background.js

// 1. Content script listens for 'contextmenu' (right-click) and stores the target element.
// 2. User right-clicks -> clicks context menu.
// 3. Background script receives context menu click -> sends a *request* to the content script ("getSelectorForLastRightClick").
// 4. Content script receives request -> generates selector for the stored element -> sends selector back to background script.
// 5. Background script receives selector -> sends "startMapping" message with selector to the content script.

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "tapItMapElement",
    title: "Tap-It: Map Element",
    contexts: ["all"], // Keep 'all' for simplicity now, refinement later if needed
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "tapItMapElement" || !tab || !tab.id) return;

  // Ask the content script for the selector of the last right-clicked element
  try {
    // Send message to the specific frame where the context menu was invoked
    const response = await chrome.tabs.sendMessage(
      tab.id,
      {
        action: "getSelectorForLastRightClick",
      },
      { frameId: info.frameId || 0 },
    );

    if (response && response.selector) {
      // Now tell the content script to start the mapping process with this selector
      chrome.tabs.sendMessage(
        tab.id,
        {
          action: "startMapping",
          elementSelector: response.selector,
        },
        { frameId: info.frameId || 0 },
      ); // Target the same frame
    } else if (response && response.error) {
      console.error(
        "Tap-It: Content script failed to get selector:",
        response.error,
      );
    } else {
      console.warn(
        "Tap-It: No selector received from content script response.",
        response,
      );
    }
  } catch (err) {
    console.error(
      "Tap-It: Error communicating with content script. Is it injected and listening?",
      err,
    );
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, frameIds: [info.frameId || 0] },
        files: ["content-script.js"],
      });
    } catch (injectionError) {
      console.error("Tap-It: Failed to inject content script:", injectionError);
    }
  }
});
