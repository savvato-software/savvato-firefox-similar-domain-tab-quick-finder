let selectedIndex = 0;
let listOfTabs   = [];

// Setup initial display of tabs
document.addEventListener('DOMContentLoaded', () => {
    browser.runtime.sendMessage({ command: "get-tabs" }).then(displayTabs);
});

function displayTabs(tabs) {
    console.log("Displaying tabs");
    console.log(tabs);

    const list = document.getElementById('tab-list');
    tabs.tabs.forEach((tab, index) => {
        const item = document.createElement('li');
        item.textContent = tab.title;
        item.id = 'tab' + index;
        list.appendChild(item);
    });

    listOfTabs = tabs.tabs;

    selectTab(0);  // Start with the first tab selected
}

// Select tab in the list
function selectTab(index) {
    // Remove 'selected' class from all items
    document.querySelectorAll('#tab-list li').forEach(item => {
        item.classList.remove('selected');
    });

    // Add 'selected' class to the new active item
    const selectedItem = document.getElementById('tab' + index);
    selectedItem.classList.add('selected');
    selectedIndex = index;
    console.log("Selecting tab " + index);
}

// Listen for key presses within the popup
document.addEventListener('keydown', (event) => {
    if (event.key === "Enter") {
        console.log("Enter key pressed. Activating selected tab and closing popup.");

        // Activate the selected tab
        browser.tabs.update(listOfTabs[selectedIndex].id, {active: true}).then(() => {
            // Close the popup window after activating the tab
            window.close();
        }, onError);
    }
});

// Error handling function
function onError(error) {
    console.log(`Error: ${error}`);
}

// Listen for cycle command
browser.runtime.onMessage.addListener((message) => {
    if (message.command === "cycle-tab") {
        console.log("Received cycle-tab message");
        selectedIndex = (selectedIndex + 1) % message.tabs.length;
        selectTab(selectedIndex);
    }
});
