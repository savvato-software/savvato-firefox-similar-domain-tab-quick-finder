let selectedIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    browser.runtime.sendMessage({ command: "get-tabs" }).then(displayTabs);
});

function displayTabs(tabs) {
    console.log("displayTabs ");
    console.log(tabs);

    tabs = tabs.tabs;

    const list = document.getElementById('tab-list');
    tabs.forEach((tab, index) => {
        const item = document.createElement('li');
        item.textContent = tab.title;
        item.id = 'tab' + index;
        list.appendChild(item);
    });
    selectTab(1); // Start with the first non-current tab selected
}

function selectTab(index) {
    if (document.querySelector('.selected')) {
        document.querySelector('.selected').classList.remove('selected');
    }
    const selectedItem = document.getElementById('tab' + index);
    selectedItem.classList.add('selected');
    selectedIndex = index;

    console.log("Selecting tab " + index);
}

browser.runtime.onMessage.addListener((message) => {
    if (message.command === "cycle-tab") {
        console.log("Cycling tab. prev = " + selectedIndex);
        selectedIndex = (selectedIndex + 1) % sameDomainTabs.length;
        selectTab(selectedIndex);
    }
});
