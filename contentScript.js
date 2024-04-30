console.log("Hello!");

chrome.tabs.insertCSS({
    code: 'button { background-color: red; color: white; border-radius: 5px; }'
});