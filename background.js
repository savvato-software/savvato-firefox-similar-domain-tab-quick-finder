let sameDomainTabs = [];
let popupWindowId = null;
let isTabsQueried = false; // Flag to check if tabs have already been queried

// Function to handle command input
function handleCommand(command) {
  if (command === "cycle-domain-tabs") {
    if (!isTabsQueried) {
      console.log("Querying tabs for the first time.");
      updateTabs();
    } else {
      console.log("Cycling through already queried tabs.");
      cycleTabs(); // Cycle through tabs without querying
    }
  }
}

function updateTabs() {
  // Get the current window and active tab to determine the domain to filter by
  browser.windows.getCurrent({populate: true}).then(currentWindow => {
    browser.tabs.query({active: true, windowId: currentWindow.id}).then(activeTabs => {
      let activeTab = activeTabs[0];
      let activeDomain = new URL(activeTab.url).hostname;

      // Now fetch all tabs from all windows
      browser.tabs.query({}).then(allTabs => {
        let currentWindowTabs = [];
        let otherWindowsTabs = {};

        // Filter tabs by the same domain and group by window ID
        allTabs.forEach(tab => {
          if (new URL(tab.url).hostname === activeDomain) {
            if (tab.windowId === currentWindow.id) {
              currentWindowTabs.push(tab);
            } else {
              if (!otherWindowsTabs[tab.windowId]) {
                otherWindowsTabs[tab.windowId] = [];
              }
              otherWindowsTabs[tab.windowId].push(tab);
            }
          }
        });

        // Combine tabs into a single list with current window tabs first
        sameDomainTabs = currentWindowTabs.concat(...Object.values(otherWindowsTabs));
        isTabsQueried = true; // Set flag after querying tabs
        if (!popupWindowId && sameDomainTabs.length > 0) {
          openPopup();
        }
      });
    });
  });
}

function openPopup() {
  if (!popupWindowId) {
    browser.windows.getCurrent({populate: true}).then((currentWindow) => {
      const popupWidth = 400;
      const popupHeight = 600;
      const left = currentWindow.left + (currentWindow.width / 2) - (popupWidth / 2);
      const top = currentWindow.top + (currentWindow.height / 2) - (popupHeight / 2);

      const creating = browser.windows.create({
        url: browser.extension.getURL('popup.html'),
        type: "popup",
        width: popupWidth,
        height: popupHeight,
        left: Math.round(left),
        top: Math.round(top)
      });

      creating.then(windowInfo => {
        popupWindowId = windowInfo.id;
        // Add listener for when the popup is closed
        browser.windows.onRemoved.addListener((closedWindowId) => {
          if (closedWindowId === popupWindowId) {
            popupWindowId = null;
            isTabsQueried = false;  // Reset the flag when the popup closes
          }
        });
      }, onError);
    });
  }
}

// Function to send a message to cycle tabs within the popup
function cycleTabs() {
  if (popupWindowId) {
    browser.runtime.sendMessage({command: "cycle-tab", tabs: sameDomainTabs});
  }
}

function onError(error) {
  console.log(`Error: ${error}`);
}

// Listener for messages from other parts of the extension
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "get-tabs") {
    console.log("Received 'get-tabs' message from popup. tabs length: " + sameDomainTabs.length);
    sendResponse({tabs: sameDomainTabs});
    return true;  // Keep the message channel open to return a response asynchronously
  }
});

// Command listener
browser.commands.onCommand.addListener(handleCommand);
