// Récupérer les interactions utilisateur avec addEventListener

const btn = document.querySelector("#sendmessageid");

btn.addEventListener("click", async () => {
    console.log("Bouton popup clicked")

    let style = btn.attributes.style.nodeValue;

    messageToContentScript({
        type: "style",
        content: style + "font-size:50px !important;"
    });

    // infos about the current tab
    // let infosTab = await getCurrentTab();
    // messageToContentScript(infosTab);
})

// Taken from API doc
async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
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