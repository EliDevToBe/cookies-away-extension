const defaultStyle = "color:#FF6BE4 !important;background-color:black !important;border:3px solid #FF6BE4 !important;font-size: 50px !important;border-radius: 100px !important;";
//chrome.storage.local.clear(); // <-- - - EASY ERASE STORAGE

// == selector > HTML element
// == style > String, will be set inline as attribute 'style='
function setStyleOnSelector(selector, style = defaultStyle) {
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

// ==== Function to identify which type of Cookie Banner is used
// == callback > Fn() that will be call on the selector when found
// == argumentCallback > argument passed on for the callback Fn()
const findSelector = (callback, argumentCallback) => {
    let cookiesAwayWithClass = document.querySelector(".cookiesAwayWithClass");

    let oneTrustId = document.getElementById("onetrust-reject-all-handler");
    let oneTrustClass = document.querySelector(".onetrust-reject-all-handler");
    let oneTrustClass2 = document.querySelector(".onetrust-close-btn-handler");
    let didomiClass = document.querySelector(".didomi-continue-without-agreeing");

    let arraySelector = [cookiesAwayWithClass, oneTrustId, oneTrustClass, didomiClass, oneTrustClass2];

    for (let i = 0; i < arraySelector.length; i++) {

        const element = arraySelector[i];

        try { // Instruction: Ici on essaie tout ce qu'on veut faire fonctionner. Si erreur, alors on bascule dans catch(error) sans stopper tout le code.
            callback(element, argumentCallback);
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

// ==== Search the page HTML for keyword "paywall"
// == return alert(...)
const detectPaywall = () => {

    let paywallFinder = document.querySelector("body").innerHTML.includes("paywall");

    if (paywallFinder) {

        alert("Attention, ce site ne te laisse pas le choix, tu devras accepter les cookies, ou payer!");

    }

};

// ==== ---- A CHECK SI COQUILLE NECESSAIRE OU DIRECT setTimeout ---- A TESTER
window.onload = function () {//Attend que la page soit chargée pour déclencher le script

    setTimeout(async () => {//Retarde l'execution du code 
        // Save le storage-local
        let localData = await chrome.storage.local.get()
        let existingLocalStyle = await localData.cookiesAwayUserStyle
        let existingLocalText = await localData.cookiesAwayUserText

        // Ici nous permettra de verifier la présence d'un style local
        // == S'il existe, applique setStyleOnSelector avec le Style du user
        // == Sinon, applique setStyleOnSelector avec le style par défaut
        if (existingLocalStyle) {
            findSelector(setStyleOnSelector, existingLocalStyle)
        } else {
            findSelector(setStyleOnSelector);
        }
        if (existingLocalText) {
            findSelector(updateInnerText, existingLocalText)
        }
        detectPaywall();

        // ==== Debugger call
        chrome.storage.local.get().then((data) => console.log(data));

    }, 600);

}
/* La fonction anonyme [pas l'async] (lui donner un nom, peut-être chosenStyle ?) permet de prendre
en compte les préférences utilisateur·ice. Si pas de préférences,le style par défaut 
est attribué au bouton refuser les cookies. Cette fonction ne se déclenche qu'une fois la page 
chargée (+ ajout d'un setTimeout dans le cas d'un site très lent à l'affichage).
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
        findSelector(setStyleOnSelector, message.content);

    }
    if (message.type == "input") {
        // console.log("custom text")
        findSelector(updateInnerText, message.content)
    }

    // console.log(message)
})
/* Permet d'écouter un message spécifique en provenance de la popup pour prendre en compte
les préférences utilisateur·ice. L'event se déclenche dans toute l'extension avec un message vide
puis rempli avec {type: xxx, content: xxx}
*/

//----------------------------------------------------------------------------------

// ==== Fonctionne mais pas receptionné dans le popupJs
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



// ==== Fonction pour modifier le contenu d'un selecteur
// == selector > HTML element
// == text > String, will be the content of Selector
function updateInnerText(selector, text) {
    selector.innerText = text
}