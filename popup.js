let selectedIndex = 0;

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
    selectTab(0);  // Start with the first tab selected
}

// Select tab in the list
function selectTab(index) {
    const previouslySelected = document.querySelector('.selected');
    if (previouslySelected) {
        previouslySelected.classList.remove('selected');
    }
    const selectedItem = document.getElementById('tab' + index);
    selectedItem.classList.add('selected');
    selectedIndex = index;
    console.log("Selected tab " + index);
}

// Listen for cycle command
browser.runtime.onMessage.addListener((message) => {
    if (message.command === "cycle-tab") {
        console.log("Received cycle-tab message");
        selectedIndex = (selectedIndex + 1) % message.tabs.length;
        selectTab(selectedIndex);
    }
});
