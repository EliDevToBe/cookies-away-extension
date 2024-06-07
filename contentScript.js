const defaultStyle = "color:#FF6BE4 !important;background-color:black !important;border:3px solid #FF6BE4 !important;font-size: 50px !important;border-radius: 100px !important;";
//chrome.storage.local.clear(); // <-- - - EASY ERASE STORAGE


function cookiesAway(selector, style = defaultStyle) {
    selector.setAttribute("style", style);
    selector.setAttribute("type", "button");
    selector.setAttribute("title", "Cliquez pour refuser tous les cookies");
    selector.setAttribute("class", "");
    selector.setAttribute("class", "cookiesAwayWithClass");
}
/* La fonction cookiesAway(peut-être la renommer refuseCookiesButtonStyle ?) permet d'attribuer 
un style prédéfini sur le bouton refuser les cookies afin de le rendre plus visible.
*/

//----------------------------------------------------------------------------------

const findSelector = (callback, newStylePassing) => {
    let cookiesAwayWithClass = document.querySelector(".cookiesAwayWithClass");

    let oneTrustId = document.getElementById("onetrust-reject-all-handler");
    let oneTrustClass = document.querySelector(".onetrust-reject-all-handler");
    let oneTrustClass2 = document.querySelector(".onetrust-close-btn-handler");
    let didomiClass = document.querySelector(".didomi-continue-without-agreeing");

    let arraySelector = [cookiesAwayWithClass, oneTrustId, oneTrustClass, didomiClass, oneTrustClass2];

    for (let i = 0; i < arraySelector.length; i++) {

        const element = arraySelector[i];

        try {
            callback(element, newStylePassing);
            // messageToPopupScript({ type: "contentUpdate", content: newStylePassing });
        } catch (error) {

            // console.log("pas d'element");

        }

    }
};
/* La fonction findSelector (peut-être la renommer findCookiesButtonName ?) permet de 
définir quels éléments doivent être identifiés par la fonction pour modifier le style 
du bouton refuser les cookies.
*/

//----------------------------------------------------------------------------------

const openPopup = () => {

    let paywallFinder = document.querySelector("body").innerHTML.includes("paywall");

    if (paywallFinder) {

        alert("Attention, ce site ne te laisse pas le choix, tu devras accepter les cookies, ou payer!");

    }

};
/* La fonction openPopup sert à gérer les sites ne permettant pas de refuser 
les cookies (soit accepter les cookies, soit obligation de s'abonner pour accéder au site).
*/

//----------------------------------------------------------------------------------

function updateInnerText(selector, text) {
    selector.innerText = text
}
/* La fonction updateInnerText permet d'appliquer des préférences de style sur le bouton 
refuser les cookies.
*/

//----------------------------------------------------------------------------------

window.onload = function () {

    setTimeout(async () => {
        let localData = await chrome.storage.local.get()
        let existingLocalStyle = await localData.cookiesAwayUserStyle
        let existingLocalText = await localData.cookiesAwayUserText

        if (existingLocalStyle) {
            findSelector(cookiesAway, existingLocalStyle)
        } else {
            findSelector(cookiesAway);
        }
        if (existingLocalText) {
            findSelector(updateInnerText, existingLocalText)
        }
        openPopup();

        // ==== Debugger call
        // chrome.storage.local.get().then((data) => console.log(data));

    }, 600);

}
/* La fonction (lui donner un nom, peut-être chosenStyle ?) permet de prendre
en compte les préférences utilisateur·ice. Si pas de préférences,le style par défaut 
est attribué au bouton refuser les cookies. Cette fonction ne se déclenche qu'une fois la page 
chargée (+ ajout d'un setTimeout dans le cas d'un site très lent à l'affichage).
*/

/* NOTE : Cette fonction fait deux choses : prendre en compte les pref et gérer l'appel des
fonctions précédentes (il me semble). Est-ce qu'on ne devrait pas créer deux fonctions
distinctes ?
*/

//----------------------------------------------------------------------------------

// Detects any event
/* chrome.runtime.onMessage.addListener(
 console.log("onMessage event has been fired ! ")
)
*/


chrome.runtime.onMessage.addListener((message, sender) => {
    // console.log("event detection on ContentScript");

    if (message.type == "style") {
        // console.log(`Received - - --> ${message.content}`);
        findSelector(cookiesAway, message.content);

    }
    if (message.type == "input") {
        // console.log("custom text")
        findSelector(updateInnerText, message.content)
    }

    // console.log(message)
})
/* Permet d'écouter un message spécifique en provenance de la popup pour prendre en compte
les préférences utilisateur·ice.
*/

//----------------------------------------------------------------------------------

async function messageToPopupScript(content) {
    let message = {
        type: "contentUpdate",
        content: content
    };

    chrome.runtime.sendMessage(message);
    // console.log("message sent to popup")
}
/* La fonction messageToPopupScript sert à communiquer avec la popup.
*/


