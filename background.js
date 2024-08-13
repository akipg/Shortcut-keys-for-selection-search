chrome.commands.onCommand.addListener(function(command) {
  console.log("command:", command);
  if (command == "search_selection_in_Google_1Foreground") {
    openSearchTab("https://www.google.com/search?q=", "",  true);
  }
  else if (command == "search_selection_in_Google_2Background") {
    openSearchTab("https://www.google.com/search?q=", "",  false);
  }
  else if (command == "search_selection_in_DefaultEngine_3NewTab") {
    openSearchTab_DefaultEngine("NEW_TAB");
  }
  else if (command == "search_selection_in_DefaultEngine_4NewWindow") {
    openSearchTab_DefaultEngine("NEW_WINDOW");
  }
  else if (command == "search_selection_in_DefaultEngine_5CurrentTab") {
    openSearchTab_DefaultEngine("CURRENT_TAB");
  }
});

async function getCurrentTab(){
  const tabs = await chrome.tabs.query({active: true, currentWindow: true});
  return tabs[0];
}

async function getSelectedText(){
  const tab = await getCurrentTab();
  const results = await chrome.scripting.executeScript({
      target: {tabId: tab.id, allFrames: false},
      func: function(){
        return encodeURI(
          document.selection ? document.selection.createRange().text :
          window.getSelection ? window.getSelection() :
          document.getSelection ? document.getSelection() :
          ""
        );
      }
    })
    console.log("getSelectedText()", results[0])
    return results[0].result;
}

function openSearchTab(baseURL_bef, baseURL_aft="", f_Active){
  getSelectedText().then(result => {
    if(!result) return false;
    var searchString = decodeURI(result);
    var searchURL = baseURL_bef + searchString + baseURL_aft;
    chrome.tabs.create({
      'url':searchURL,
      'active':f_Active
    });
  });   
  return true
}

function openSearchTab_DefaultEngine(disposition){
  getSelectedText().then(results => {
    if(!results) return false;
    var searchString = decodeURI(result);
    chrome.search.query({
      text: searchString,
      disposition
    })
  });
  return true

}