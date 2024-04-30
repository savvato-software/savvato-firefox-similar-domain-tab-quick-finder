let sameDomainTabs = [];

function updateTabs() {
  browser.tabs.query({currentWindow: true, active: true}).then(activeTabs => {
    let activeTab = activeTabs[0];
    browser.tabs.query({currentWindow: true}).then(allTabs => {
      sameDomainTabs = allTabs.filter(tab => new URL(tab.url).hostname === new URL(activeTab.url).hostname);
      if (sameDomainTabs.length > 0) {
        openPopup();
      }
    });
  });
}

let popupWindowId = null;

function openPopup() {
  if (popupWindowId) {
    // If popup is already open, send a message to cycle to the next tab
    console.log("Popup exists. Sending message to cycle tab");
    browser.runtime.sendMessage({command: "cycle-tab"});
  } else {
    // Open popup only if it's not already open
    console.log("Opening popup");
    const popupURL = browser.extension.getURL('popup.html');
    const creating = browser.windows.create({
      url: popupURL,
      type: "popup",
      width: 400,
      height: 600
    });
    creating.then(windowInfo => {
      popupWindowId = windowInfo.id;
      // Add a listener to reset popupWindowId when the window is closed
      browser.windows.onRemoved.addListener((windowId) => {
        if (windowId === popupWindowId) {
          popupWindowId = null;
        }
      });
    }, onError);
  }
}

function onError(error) {
  console.log(`Error: ${error}`);
}

browser.commands.onCommand.addListener((command) => {
  if (command === "cycle-domain-tabs") {
    updateTabs();
  }
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "get-tabs") {
    // Logic to handle the message
    sendResponse({tabs: sameDomainTabs});
    return true; // to indicate you're responding asynchronously
  }
});

browser.commands.onCommand.addListener((command) => {
  if (command === "close-and-activate-tab") {
    if (popupWindowId) {
      browser.tabs.update(sameDomainTabs[selectedIndex].id, { active: true });
      browser.windows.remove(popupWindowId);
      popupWindowId = null;
    }
  }
});
