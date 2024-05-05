// Récupérer les interactions utilisateur avec addEventListener

const btn = document.querySelector("#sendmessageid");
btn.addEventListener("click", () => {
    // tabID().then((tab) => {
    //     console.log(tab)
    // })
    console.log("Bouton popup clicked")
    messageToContentScript("lolilol");

})

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function messageToContentScript(text) {

    let data = await getCurrentTab();
    let tabId = await data.id;
    let message = text

    chrome.tabs.sendMessage(tabId, message, () => {
        console.log(`message '${message}' sent!`)
    })
}