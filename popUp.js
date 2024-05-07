// Récupérer les interactions utilisateur avec addEventListener
const btnCustom1 = document.querySelector("#btnCustom1");
const btnCustom2 = document.querySelector("#btnCustom2");
const customText = document.querySelector("#customText");
const customBackground = document.querySelector("#customBackground");
const customSize = document.querySelector("#customSize");
const customInput = document.querySelector("#customInput");

let colorAccessibility = "color:#FF6BE4 !important;background-color:black !important;border:3px solid #FF6BE4 !important;font-size: 50px !important;border-radius: 100px !important;"


// ============== EVENTS sur les bouttons ==============
btnCustom1.addEventListener("click", async () => {
    console.log("Bouton popup clicked")

    let size = `font-size:${parseInt(customSize.value)}px !important;`

    let btnStyle = btnCustom1.attributes.style.nodeValue + size;
    customText.value = "#FFFFFF";
    customBackground.value = "#39a3e4";

    messageToContentScript({
        type: "style",
        content: btnStyle
    });
    getCustomStyle();
})
btnCustom2.addEventListener("click", async () => {
    console.log("Bouton popup clicked")

    let size = `font-size:${parseInt(customSize.value)}px !important;`


    let btnStyle = btnCustom2.attributes.style.nodeValue + size;
    customText.value = "#39a3e4";
    customBackground.value = "#FFFFFF";

    messageToContentScript({
        type: "style",
        content: btnStyle
    });
    getCustomStyle();
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

    let textFromUserInput = getCustomInput();
    messageToContentScript(textFromUserInput);
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
    let outline = `border:3px solid ${customText.value} !important;`
    let finalStyle = textStyle + background + size + outline + "border-radius:100px !important;"

    // == Objet pour le stocker dans le Storage.local
    let cookiesAway = { cookiesAwayUserStyle: finalStyle }

    // Sauvegarde dans le storage local
    chrome.storage.local.set(cookiesAway);
    // chrome.storage.local.get().then((data) => console.log(data))

    return { type: "style", content: finalStyle }
}

// ==== Allows us to take user input from input-box
function getCustomInput() {
    let input = customInput.value.trim();

    // == Objet pour le stockage du texte custom
    let inputToStore = { cookiesAwayUserText: input }
    chrome.storage.local.set(inputToStore);

    return { type: "input", content: input }
}

// ===== Permet de mettre les valeurs initiales de nos parametres
async function setInitialState() {

    let localData = await chrome.storage.local.get();
    let existingLocalStyle = await localData.cookiesAwayUserStyle;
    let existingLocalText = await localData.cookiesAwayUserText;

    if (existingLocalText) {
        customInput.value = existingLocalText;
    }
    if (existingLocalStyle) {
        let text = existingLocalStyle

        let colors = text.split("#");
        let textColorValue = "#" + colors[1].slice(0, 6);
        let backgroundColorValue = "#" + colors[2].slice(0, 6);

        let nearFontSize = text.split("font-size:");
        let userSize = nearFontSize[1].slice(0, 4);

        customText.value = textColorValue;
        customBackground.value = backgroundColorValue;
        customSize.value = parseInt(userSize);

        console.log(nearFontSize)
    } else {
        customText.value = "#FF6BE4";
        customBackground.value = "#000000";
    }
}
setInitialState();