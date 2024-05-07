// Récupérer les interactions utilisateur avec addEventListener
const btnCustom1 = document.querySelector("#btnCustom1");
const btnCustom2 = document.querySelector("#btnCustom2");
const customText = document.querySelector("#customText");
const customBackground = document.querySelector("#customBackground");
const customSize = document.querySelector("#customSize");
const customInput = document.querySelector("#customInput");

let colorAccessibility = "color:#FF6BE4 !important;background-color:black !important;border:3px solid #FF6BE4 !important;font-size: 30px !important;border-radius: 25px !important;"
customText.value = "#FFc0cb";
customBackground.value = "#000000";

// ============== EVENTS sur les bouttons ==============
btnCustom1.addEventListener("click", async () => {
    console.log("Bouton popup clicked")

    let size = `font-size:${parseInt(customSize.value)}px !important;`

    let btnStyle = btnCustom1.attributes.style.nodeValue + size;
    customText.value = "#FFFFFF";
    customBackground.value = "#000000";

    messageToContentScript({
        type: "style",
        content: btnStyle
    });
})
btnCustom2.addEventListener("click", async () => {
    console.log("Bouton popup clicked")

    let size = `font-size:${parseInt(customSize.value)}px !important;`


    let btnStyle = btnCustom2.attributes.style.nodeValue + size;
    customText.value = "#000000";
    customBackground.value = "#FFFFFF";

    messageToContentScript({
        type: "style",
        content: btnStyle
    });
})

// =============== EVENT SUR CUSTOM SETTINGS ==================
// ==== Event sur color text
customText.addEventListener("input", async () => {

    let customStyle = getCustomStyle();
    messageToContentScript(customStyle);
})
// ==== Event sur background color
customBackground.addEventListener("input", async () => {

    let customStyle = getCustomStyle();
    messageToContentScript(customStyle);
})
// ==== Event sur Font-Size
customSize.addEventListener("input", async () => {

    let customStyle = getCustomStyle();
    messageToContentScript(customStyle);
})
// ==== Event sur le custom input Text
customInput.addEventListener("input", async (event) => {
    event.preventDefault();

    let customText = customInput.value.trim();
    let customTextMessage = { type: "input", content: customText }
    messageToContentScript(customTextMessage);
})
// ========================= END EVENTS ====================


// Taken from API doc
async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function messageToContentScript(text, callback) {

    let data = await getCurrentTab();
    let tabId = await data.id;
    let message = text;

    chrome.tabs.sendMessage(tabId, message, callback)
}

// Return un objet pour la réponse {type: , content: }
// Objet necessaire pour les messages
function getCustomStyle() {

    let textStyle = `color:${customText.value} !important;`
    let background = `background-color:${customBackground.value} !important;`
    let size = `font-size:${parseInt(customSize.value)}px !important;`
    let finalStyle = textStyle + background + size + "border-radius: 100px !important;"
    //+ `width:${parseInt(customSize.value * 5)}px;height:${parseInt(customSize.value) * 2}px`

    return { type: "style", content: finalStyle }
}

function getCustomInput() {
    let input = customInput.value;

    return { type: "input", content: input }
}