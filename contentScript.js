console.log("Hello!");
const defaultStyle = "color:pink !important; font-size:50px !important;background-color:black !important;border-radius: 100px !important;";

function cookiesAway(selector, style = defaultStyle) {
    selector.setAttribute("style", style);
    selector.setAttribute("type", "button");
    selector.setAttribute("title", "Cliquez pour refuser tous les cookies");
    selector.setAttribute("class", "");
    selector.setAttribute("class", "cookiesAwayWithClass");
}
//----------------------------------------------------------------------------------

const findSelector = (callback, newStylePassing) => {
    let cookiesAwayWithClass = document.querySelector(".cookiesAwayWithClass");

    let oneTrustId = document.getElementById("onetrust-reject-all-handler");
    let oneTrustClass = document.querySelector(".onetrust-reject-all-handler");
    let oneTrustClass2 = document.querySelector(".onetrust-close-btn-handler");
    let didomiClass = document.querySelector(".didomi-continue-without-agreeing");
    // let didomiPaywall = document.querySelector(".didomi-popup-open");

    let arraySelector = [cookiesAwayWithClass, oneTrustId, oneTrustClass, didomiClass, oneTrustClass2];

    for (let i = 0; i < arraySelector.length; i++) {

        const element = arraySelector[i];

        try { // Instruction: Ici on essaie tout ce qu'on veut faire fonctionner. Si erreur, alors on bascule dans catch(error) sans stopper tout le code.
            callback(element, newStylePassing);
            // messageToPopupScript({ type: "contentUpdate", content: newStylePassing });
        } catch (error) {

            console.log("pas d'element");

        }

    }
};

const openPopup = () => {

    let paywallFinder = document.querySelector("body").innerHTML.includes("paywall");

    if (paywallFinder) {

        alert("Attention, ceci est un faux choix, tu devras accepter les cookies, ou payer !");

    }

};

window.onload = function () {//Attend que la page soit chargée pour déclencher le script

    setTimeout(() => {//Retarde l'execution du code 
        //On attribue une variable pour chaque élément à pointer
        findSelector(cookiesAway);
        openPopup();
        messageToPopupScript(defaultStyle)

    }, 600);// delay (en millisecondes)

}


// Detects any event
// chrome.runtime.onMessage.addListener(
//     console.log("onMessage event has been fired ! ")
// )

// Detect a specific event message
chrome.runtime.onMessage.addListener((message, sender) => {
    console.log("event detection on ContentScript");

    if (message.type == "style") {
        console.log(`Received - - --> ${message.content}`);
        findSelector(cookiesAway, message.content);

    }
    if (message.type == "input") {
        // console.log("custom text")
        findSelector(updateInnerText, message.content)
    }

    // console.log(message)
})

async function messageToPopupScript(content) {
    let message = {
        type: "contentUpdate",
        content: content
    };

    chrome.runtime.sendMessage(message);
    console.log("message sent to popup")
}

function updateInnerText(selector, text) {
    selector.innerText = text
}