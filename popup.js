let selectedIndex = 0;
let listOfTabs   = [];

// Setup initial display of tabs
document.addEventListener('DOMContentLoaded', () => {
    browser.runtime.sendMessage({ command: "get-tabs" }).then(displayTabs);
});

function displayTabs(tabs) {
    console.log("Displaying tabs");
    console.log(tabs);

    listOfTabs = tabs.tabs;

    const list = document.getElementById('tab-list');
    listOfTabs.forEach((tab, index) => {
        const item = document.createElement('li');
        item.textContent = tab.title;
        item.id = 'tab' + index;
        item.addEventListener('click', () => {
            selectTab(index);  // Select tab on click
            activateTab(index); // Optionally activate tab on click
        });
        list.appendChild(item);
    });

    selectTab(0);  // Start with the first tab selected
}

document.addEventListener('keydown', (event) => {
    const numberOfTabs = listOfTabs.length;

    if (event.key === "Enter") {
        console.log("Enter key pressed. Activating selected tab and closing popup.");
        // Activate the selected tab
        browser.tabs.update(listOfTabs[selectedIndex].id, {active: true}).then(() => {
            // Close the popup window after activating the tab
            window.close();
        }, onError);
    } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        console.log("Arrow Down/Right key pressed. Moving to next tab.");
        // Move selection down
        selectedIndex = (selectedIndex + 1) % numberOfTabs;
        selectTab(selectedIndex);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        console.log("Arrow Up/Left key pressed. Moving to previous tab.");
        // Move selection up
        selectedIndex = (selectedIndex - 1 + numberOfTabs) % numberOfTabs;
        selectTab(selectedIndex);
    } else if (event.key === "Escape") {
        console.log("ESC key pressed. Closing popup.");
        // Close the popup window
        window.close();
    }
});

// Error handling function
function onError(error) {
    console.log(`Error: ${error}`);
}

// Function to update the 'selected' class based on selectedIndex
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

function activateTab(index) {
    console.log("Activating tab: " + index);
    browser.tabs.update(listOfTabs[index].id, {active: true}).then(() => {
        window.close();  // Close the popup after activating the tab
    }, onError);
}

// Listen for cycle command
browser.runtime.onMessage.addListener((message) => {
    if (message.command === "cycle-tab") {
        console.log("Received cycle-tab message");
        selectedIndex = (selectedIndex + 1) % message.tabs.length;
        selectTab(selectedIndex);
    }
});
