setTimeout(() => {
    console.log("Hello!");

    const tomate = document.querySelector("h1");
    const html = document.querySelector("html");
    const head = document.querySelector("head")
    const initialStyle = document.querySelector("")

    const newStyle = document.createElement("style")
    newStyle.setAttribute("id", "onetrust-style")
    newStyle.append("#onetrust-reject-all-handler:{color:pink}")

    head.append(newStyle)

    tomate.classList.add("cookiesAway");

    // if (html.innerHTML.includes("onetrust")) {
    //     console.log("inside")

    //     let onetrust = document.querySelector("#onetrust-style")
    //     onetrust.append("#onetrust-reject-all-handler:{color:pink}")

    // }
}
    , 2000);
// "matches": [
//"https://*.carrefour.fr/*"
//"<all_urls>"
//]