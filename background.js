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
  // Get current tab
  const tab = await getCurrentTab();

  // Get selected text
  const results = await chrome.scripting.executeScript({
      target: {tabId: tab.id, allFrames: false},
      func: function(){
        let selectedText = document.selection ? document.selection.createRange().text :
          window.getSelection ? window.getSelection() :
            document.getSelection ? document.getSelection() :
            "";
        selectedText = String(selectedText).replace(/\r?\n|\r/g, ''); // Remove line breaks
        return encodeURIComponent(selectedText);
      }
    })

    // Return value
    if(results.length <= 0){
      // Failed
      console.warn("[Failed] getSelectedText() returns \"\"", "results:", results);
      return "";
    }
    else{
      const searchText = results[0].result;
      if (searchText !== "" && !searchText){
        // InvalidResult
        console.warn("[InvalidResult] getSelectedText() returns \"\"", "results:" ,results);
        return "";
      } else {
        // Success
        console.log("[Success] getSelectedText() retunrs encoded", `"${searchText}"`, "of", `"${decodeURIComponent(searchText)}"`, "results:", results);
        return searchText;
      }
    }
}

function openSearchTab(baseURL_bef, baseURL_aft="", f_Active){
  getSelectedText().then(result => {
    var searchString = result; // Do not decode here.
    var searchURL = baseURL_bef + searchString + baseURL_aft;
    chrome.tabs.create({
      'url':searchURL,
      'active':f_Active
    });
  });   
  return true;
}

function openSearchTab_DefaultEngine(disposition){
  getSelectedText().then(result => {
    var searchString = decodeURIComponent(result);
    if(searchString !== ""){
      chrome.search.query({
        text: searchString,
        disposition
      });
    }
  });
  return true;
}