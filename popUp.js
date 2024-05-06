// Récupérer les interactions utilisateur avec addEventListener
const btnCustom1 = document.querySelector("#btnCustom1");
const btnCustom2 = document.querySelector("#btnCustom2");
const customText = document.querySelector("#customText");
const customBackground = document.querySelector("#customBackground");
const customSize = document.querySelector("#customSize");
const customInput = document.querySelector("#customInput");

let colorAccessibility = "color:#FF6BE4 !important;background-color:black !important;border:3px solid #FF6BE4 !important;font-size: 30px !important;border-radius: 25px !important;"

// ============== EVENTS sur les bouttons ==============
btnCustom1.addEventListener("click", async () => {
    console.log("Bouton popup clicked")

    let btnStyle = btnCustom1.attributes.style.nodeValue;

    messageToContentScript({
        type: "style",
        content: btnStyle
    });
})
btnCustom2.addEventListener("click", async () => {
    console.log("Bouton popup clicked")

    let btnStyle = btnCustom2.attributes.style.nodeValue;

    messageToContentScript({
        type: "style",
        content: btnStyle
    });
})

customText.addEventListener("change", async () => {
    let customStyle = getCustomStyle();

    messageToContentScript(customStyle);
})
// ========================= END EVENTS ====================
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

function getCustomStyle() {

    let textStyle = `color:${customText.value} !important;`
    let background = `background-color:${customBackground.value} !important;`
    let size = `font-size:${parseInt(customSize.value)}px !important;`
    let finalStyle = textStyle + background + size

    return { type: "style", content: finalStyle }
}

function getCustomInput() {
    let input = customInput.value;

    return { type: "input", content: input }
}