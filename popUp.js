// Récupérer les interactions utilisateur·ice avec addEventListener
const btnCustom1 = document.querySelector("#btnCustom1");
const btnCustom2 = document.querySelector("#btnCustom2");
const customText = document.querySelector("#customText");
const customBackground = document.querySelector("#customBackground");
const customSize = document.querySelector("#customSize");
const customInput = document.querySelector("#customInput");
const toggleAccessibility = document.querySelector("#toggleAccessibility");

let colorAccessibility = "color:#FF6BE4 !important;background-color:#000000 !important;font-size: 50px !important;border:3px solid #FF6BE4 !important;border-radius: 100px !important;"


// ============== EVENTS sur les bouttons ==============

btnCustom1.addEventListener("click", async () => {

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
/* Permet d'appliquer le style prédéfini 1 sur le bouton de la popup, en passant 
au-dessus du style du site, sinon, applique le style défini par l'utilisateur·ice.
*/

btnCustom2.addEventListener("click", async () => {

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
/* Même logique que pour le style 1 mais pour le style .
*/

// =============== EVENT SUR CUSTOM SETTINGS ==================

customText.addEventListener("input", async () => {

    let customStyle = getCustomStyle();
    messageToContentScript(customStyle);
})
/* Permet de vérifier si l'utilisateur·ice a modifié la couleur du texte du bouton 
refuser les cookies.
*/

customBackground.addEventListener("input", async () => {

    let customStyle = getCustomStyle();
    messageToContentScript(customStyle);
})
/* Permet de vérifier si l'utilisateur·ice a modifié la couleur de fond du bouton 
refuser les cookies.
*/

customSize.addEventListener("input", async () => {

    let customStyle = getCustomStyle();
    messageToContentScript(customStyle);
})
/* Permet de vérifier si l'utilisateur·ice a modifié la taille de la police du bouton 
refuser les cookies.
*/

customInput.addEventListener("input", async (event) => {
    event.preventDefault();

    let textFromUserInput = getCustomInput();
    messageToContentScript(textFromUserInput);
})
/* Permet de vérifier si l'utilisateur·ice a personnalisé le texte du bouton 
refuser les cookies.
*/

toggleAccessibility.addEventListener("change", async () => {

    if (toggleAccessibility.hasAttribute("checked")) {

        boxUnchecked();

    } else {
        boxChecked();
        setInitialState();

        messageToContentScript({
            type: "style",
            content: colorAccessibility
        });
    }
})
/* Permet de gérér le bouton accessibilité. Si le bouton est coché (OFF) alors 
l'utilisateur·ice pourra choisir de personnaliser son bouton refuser les cookies. 
Si le bouton est décoché (ON) alors les paramètres accessibilité par défaut seront activés.
*/

// ========================= END EVENTS ====================


async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}
/* Permet d'agir sur l'onglet actif.
*/

async function messageToContentScript(text, callback) {

    let data = await getCurrentTab();
    let tabId = await data.id;
    let message = text;

    chrome.tabs.sendMessage(tabId, message, callback)
}
/* Permet de communiquer avec l'onglet actif.
*/

//-----------------------------------------------------------------------------------

function getCustomStyle() {

    let textStyle = `color:${customText.value} !important;`
    let background = `background-color:${customBackground.value} !important;`
    let size = `font-size:${parseInt(customSize.value)}px !important;`
    let outline = `border:3px solid ${customText.value} !important;`
    let finalStyle = textStyle + background + size + outline + "border-radius:100px !important;" + `min-height:${parseInt(customSize.value) / 2}px !important;`

    let cookiesAway = { cookiesAwayUserStyle: finalStyle }

    chrome.storage.local.set(cookiesAway);
    // chrome.storage.local.get().then((data) => console.log(data))

    return { type: "style", content: finalStyle }
}
/* La fonction getCustomStyle permet de récupérer les choix de style de l'utilisateur·ice sur
son bouton refuser les cookies. Ses choix sont sauvegardés dans un objet créé pour ça.
*/

//-----------------------------------------------------------------------------------


function getCustomInput() {
    let input = customInput.value.trim();

    // == Objet pour le stockage du texte custom
    let inputToStore = { cookiesAwayUserText: input }
    chrome.storage.local.set(inputToStore);

    return { type: "input", content: input }
}
/* La fonction getCustomInput permet de récupérer la valeur rentrée par l'utilisateur·ice 
pour nommer son bouton refuser les cookies.
*/

//-----------------------------------------------------------------------------------


async function setInitialState() {

    let localData = await chrome.storage.local.get();
    let existingLocalStyle = await localData.cookiesAwayUserStyle;
    let existingLocalText = await localData.cookiesAwayUserText;
    let existingLocalToggleState = await localData.cookiesAwayToggleAccessibility;

    if (existingLocalText) {
        customInput.value = existingLocalText;
    }
    if (existingLocalToggleState) {
        // mettre etat inital du popup qund la checkbox est cochee
        boxChecked();
    }
    if (existingLocalStyle) {
        let text = existingLocalStyle;

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
        customText.value = "#FF6BE4";
        customBackground.value = "#000000";
    }
}
/* La fonction setInitialState permet de rebasculer sur le style par défaut du bouton refuser
les cookies.
*/

setInitialState();

//-----------------------------------------------------------------------------------


async function boxUnchecked() {
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

    let toggleAccessibilityOFF = { cookiesAwayToggleAccessibility: false };
    chrome.storage.local.set(toggleAccessibilityOFF);
}
/* La fonction boxUnchecked du bouton accessibilité désactive le style par défaut du bouton 
refuser les cookies. Cela permet à l'utilisateur·ice de personnaliser son bouton.
*/

//-----------------------------------------------------------------------------------


async function boxChecked() {
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

    let accessibleStyle = { cookiesAwayUserStyle: colorAccessibility };
    chrome.storage.local.set(accessibleStyle);

    let toggleAccessibilityON = { cookiesAwayToggleAccessibility: true };
    chrome.storage.local.set(toggleAccessibilityON);

}
/* La fonction boxChecked du bouton accessibilité active le style par défaut du bouton 
refuser les cookies.
*/ 