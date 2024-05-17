// Récupérer les interactions utilisateur avec addEventListener
const btnCustom1 = document.querySelector("#btnCustom1");
const btnCustom2 = document.querySelector("#btnCustom2");
const customText = document.querySelector("#customText");
const customBackground = document.querySelector("#customBackground");
const customSize = document.querySelector("#customSize");
const customInput = document.querySelector("#customInput");
const toggleAccessibility = document.querySelector("#toggleAccessibility");

let colorAccessibility = "color:#FF6BE4 !important;background-color:#000000 !important;font-size: 50px !important;border:3px solid #FF6BE4 !important;border-radius: 100px !important;"
let predefStylePrimary = "#FFFFFF";
let predefStyleSecondary = "#39a3e4";

// ============== EVENTS sur les bouttons ==============
btnCustom1.addEventListener("click", async () => {
    // console.log("Bouton popup clicked")

    let size = `font-size:${parseInt(customSize.value)}px !important;`
    let btnStyle = btnCustom1.attributes.style.nodeValue + size;

    setColorValueOfCustom(predefStylePrimary, predefStyleSecondary)

    messageToContentScript("style", btnStyle);
    savePreferences("test", "this is my test");
})
btnCustom2.addEventListener("click", async () => {
    // console.log("Bouton popup clicked")

    let size = `font-size:${parseInt(customSize.value)}px !important;`
    let btnStyle = btnCustom2.attributes.style.nodeValue + size;

    setColorValueOfCustom(predefStyleSecondary, predefStylePrimary)

    messageToContentScript("style", btnStyle);
})

// =============== EVENT SUR CUSTOM SETTINGS ==================
// ==== Array of each possible customization selector
const customHTMLSelectors = [customText, customBackground, customSize];

for (selector of customHTMLSelectors) {
    // == Set an event listener on each customization selector
    selector.addEventListener("input", async () => {

        let customStyle = getFinalCustomStyle();
        messageToContentScript("style", customStyle);
    })
}

// ==== Event sur le custom input Text
// == We need the custom text inside the selector to be independant of color/size
customInput.addEventListener("input", async (event) => {
    event.preventDefault();

    let textFromUserInput = getCustomInput();
    messageToContentScript("input", textFromUserInput);
})

// ==== Event sur le toggle accessibilité
toggleAccessibility.addEventListener("change", async () => {
    // Si la case est cochée
    if (toggleAccessibility.hasAttribute("checked")) {

        boxUnchecking();

    } else { // Si elle est décochée
        boxChecking();
        // Remet tout bien les valeurs des customs settings
        setInitialState();

        messageToContentScript("style", colorAccessibility);
    }
})
// ========================= END EVENTS ====================


// Taken from API doc
async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function messageToContentScript(typeOfMessage, messageContent, callback) {

    let data = await getCurrentTab();
    let tabId = await data.id;
    let message = { type: typeOfMessage, content: messageContent };

    chrome.tabs.sendMessage(tabId, message, callback)
}

// Return le style final à appliquer
// Objet necessaire pour les messages
function getFinalCustomStyle() {

    let textStyle = `color:${customText.value} !important;`
    let background = `background-color:${customBackground.value} !important;`
    let size = `font-size:${parseInt(customSize.value)}px !important;`
    let outline = `border:3px solid ${customText.value} !important;`

    let finalStyle = textStyle
        + background
        + size
        + outline
        + "border-radius:100px !important;"
        + `min-height:${parseInt(customSize.value) / 2}px !important;`

    // Sauvegarde dans le storage local
    savePreferences("cookiesAwayUserStyle", finalStyle);

    return finalStyle
}

// ==== Allows us to take user input from input-box
function getCustomInput() {
    let input = customInput.value.trim();

    // == Sauvegarde chrome storage
    savePreferences("cookiesAwayUserText", input);

    return input
}

// ===== Permet de mettre les valeurs initiales de nos parametres
async function setInitialState() {

    let userData = await chrome.storage.local.get();
    let existingUserStyle = await userData.cookiesAwayUserStyle;
    let existingUserText = await userData.cookiesAwayUserText;
    let existingUserToggleState = await userData.cookiesAwayToggleAccessibility;

    if (existingUserText) {
        customInput.value = existingUserText;
    }
    if (existingUserToggleState) {
        // mettre etat inital du popup qund la checkbox est cochee
        boxChecking();
    }
    if (existingUserStyle) {
        let text = existingUserStyle;

        let colors = text.split("#");
        let textColorValue = "#" + colors[1].slice(0, 6);
        let backgroundColorValue = "#" + colors[2].slice(0, 6);

        let nearFontSize = text.split("font-size:");
        let userSize = nearFontSize[1].slice(0, 4);

        customText.value = textColorValue;
        customBackground.value = backgroundColorValue;
        customSize.value = parseInt(userSize);

        // console.log(nearFontSize)
    } else {
        // === Accessible PINK text and BLACK background
        setColorValueOfCustom("#FF6Be4", "#000000")
    }
}
setInitialState();

// ===== Fonctions des états de la checkbox accessibilité =====
async function boxUnchecking() {
    toggleAccessibility.removeAttribute("checked");

    customText.removeAttribute("disabled");
    customBackground.removeAttribute("disabled");
    customSize.removeAttribute("disabled");
    btnCustom1.removeAttribute("disabled");
    btnCustom2.removeAttribute("disabled");

    customText.removeAttribute("title");
    customBackground.removeAttribute("title");
    customSize.removeAttribute("title");
    btnCustom1.removeAttribute("title");
    btnCustom2.removeAttribute("title");

    // === Save preferences to chrome storage
    savePreferences("cookiesAwayToggleAccessibility", false)

}
async function boxChecking() {
    toggleAccessibility.setAttribute("checked", "");

    customText.setAttribute("disabled", "");
    customBackground.setAttribute("disabled", "");
    customSize.setAttribute("disabled", "");
    btnCustom1.setAttribute("disabled", "");
    btnCustom2.setAttribute("disabled", "");

    customText.setAttribute("title", "/!\\ Option d'accessibilité activée");
    customBackground.setAttribute("title", "/!\\ Option d'accessibilité activée");
    customSize.setAttribute("title", "/!\\ Option d'accessibilité activée");
    btnCustom1.setAttribute("title", "/!\\ Option d'accessibilité activée")
    btnCustom2.setAttribute("title", "/!\\ Option d'accessibilité activée")

    // ==== Save to chrome storage
    savePreferences("cookiesAwayUserStyle", colorAccessibility);
    savePreferences("cookiesAwayToggleAccessibility", true);
}

// ==== Function to set value of custom Text and Background
// == Arguments > String, hexadecimal format (#ff00ff)
function setColorValueOfCustom(textColorValue, backgroundColorValue) {
    customText.value = textColorValue;
    customBackground.value = backgroundColorValue;
}

// ==== Save into chrome storage local
// == category > STRING, key under the value is saved
// == value > any type
async function savePreferences(category, value) {
    let save = {
        [category]: value
    }
    chrome.storage.local.set(save);
}