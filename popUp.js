// Récupérer les interactions utilisateur·ice avec addEventListener
const btnCustom1 = document.querySelector("#btnCustom1");
const btnCustom2 = document.querySelector("#btnCustom2");
const customColorText = document.querySelector("#customText");
const customBackground = document.querySelector("#customBackground");
const customSize = document.querySelector("#customSize");
const customInput = document.querySelector("#customInput");
const toggleAccessibility = document.querySelector("#toggleAccessibility");

let colorAccessibility = "color:#FF6BE4 !important;background-color:#000000 !important;font-size: 50px !important;border:3px solid #FF6BE4 !important;border-radius: 100px !important;"
let predefColorPrimary = "#FFFFFF";
let predefColorSecondary = "#39a3e4";

// ============== EVENTS sur les bouttons ==============

btnCustom1.addEventListener("click", async () => {

    let size = `font-size:${parseInt(customSize.value)}px !important;`
    let btnStyle = btnCustom1.attributes.style.nodeValue + size;

    setColorValueOfCustom(predefColorPrimary, predefColorSecondary)

    messageToContentScript({
        type: "style",
        content: btnStyle
    });
})
/* Permet d'appliquer le style prédéfini 1 sur le bouton de la popup, en passant 
au-dessus du style du site, sinon, applique le style défini par l'utilisateur·ice.
*/

btnCustom2.addEventListener("click", async () => {

    let size = `font-size:${parseInt(customSize.value)}px !important;`
    let btnStyle = btnCustom2.attributes.style.nodeValue + size;

    setColorValueOfCustom(predefColorSecondary, predefColorPrimary)

    messageToContentScript("style", btnStyle);
})
/* Même logique que pour le style 1 mais pour le style 2.
*/

// =============== EVENT SUR CUSTOM SETTINGS ==================
// ==== Array of each possible customization selector
const customHTMLSelectors = [customColorText, customBackground, customSize];

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
/* Permet de vérifier si l'utilisateur·ice a personnalisé le texte du bouton 
refuser les cookies.
*/

toggleAccessibility.addEventListener("change", async () => {

    if (toggleAccessibility.hasAttribute("checked")) {

        boxUnchecking();

    } else { // Si elle est décochée
        boxChecking();
        // Remet tout bien les valeurs des customs settings
        applyPreferencesOnInterface();

        messageToContentScript("style", colorAccessibility);
    }
})
/* Permet de gérér le bouton accessibilité. Si le bouton est coché (OFF) alors 
l'utilisateur·ice pourra choisir de personnaliser son bouton refuser les cookies. 
Si le bouton est décoché (ON) alors les paramètres accessibilité par défaut seront activés.
*/

// ========================= END EVENTS ====================


// Taken from API doc
async function getCurrentTabObject() {
    let queryOptions = { active: true, currentWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}
/* Permet d'agir sur l'onglet actif.
*/

async function messageToContentScript(typeOfMessage, messageContent, callback) {

    let data = await getCurrentTabObject();
    let tabId = await data.id;
    let message = { type: typeOfMessage, content: messageContent };

    chrome.tabs.sendMessage(tabId, message, callback)
}
/* Permet de communiquer avec l'onglet actif.
*/

//-----------------------------------------------------------------------------------

// Return le style final à appliquer
// finalStyle => String
function getFinalCustomStyle() {

    let textStyle = `color:${customColorText.value} !important;`
    let background = `background-color:${customBackground.value} !important;`
    let size = `font-size:${parseInt(customSize.value)}px !important;`
    let outline = `border:3px solid ${customColorText.value} !important;`

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
/* La fonction getCustomStyle permet de récupérer les choix de style de l'utilisateur·ice sur
son bouton refuser les cookies. Ses choix sont sauvegardés dans un objet créé pour ça.
*/

//-----------------------------------------------------------------------------------


function getCustomInput() {
    let input = customInput.value.trim();

    // == Sauvegarde chrome storage
    savePreferences("cookiesAwayUserText", input);

    return { type: "input", content: input }
}
/* La fonction getCustomInput permet de récupérer la valeur rentrée par l'utilisateur·ice 
pour nommer son bouton refuser les cookies.
*/

//-----------------------------------------------------------------------------------

async function applyPreferencesOnInterface() {

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

        customColorText.value = textColorValue;
        customBackground.value = backgroundColorValue;
        customSize.value = parseInt(userSize);

        // console.log(nearFontSize)
    } else {
        // === Accessible PINK text and BLACK background
        setColorValueOfCustom("#FF6Be4", "#000000")
    }
}
/* La fonction setInitialState permet de garder les pref utilisateur, et si pas,
bascule sur le style par défaut du bouton refuser
les cookies.
*/

applyPreferencesOnInterface();

// ===== Fonctions des états de la checkbox accessibilité =====
async function boxUnchecking() {
    toggleAccessibility.removeAttribute("checked");

    customColorText.removeAttribute("disabled");
    customBackground.removeAttribute("disabled");
    customSize.removeAttribute("disabled");
    btnCustom1.removeAttribute("disabled");
    btnCustom2.removeAttribute("disabled");

    customColorText.removeAttribute("title");
    customBackground.removeAttribute("title");
    customSize.removeAttribute("title");
    btnCustom1.removeAttribute("title");
    btnCustom2.removeAttribute("title");

    // === Save preferences to chrome storage
    savePreferences("cookiesAwayToggleAccessibility", false)

}
/* La fonction boxUnchecked du bouton accessibilité bloque le style du bouton 
refuser les cookies sur l'accessibilité.
*/

//-----------------------------------------------------------------------------------


async function boxChecking() {
    toggleAccessibility.setAttribute("checked", "");

    customColorText.setAttribute("disabled", "");
    customBackground.setAttribute("disabled", "");
    customSize.setAttribute("disabled", "");
    btnCustom1.setAttribute("disabled", "");
    btnCustom2.setAttribute("disabled", "");

    customColorText.setAttribute("title", "/!\\ Option d'accessibilité activée");
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
    customColorText.value = textColorValue;
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
/* La fonction boxChecked du bouton accessibilité permet le style personnalisable du bouton 
refuser les cookies. Ne force pas le style accessibilité
*/ 