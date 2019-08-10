(function() {
  // contextMenus
  function onCreated() {
    if (chrome.runtime.lastError) {
      // console.log(`Error: ${chrome.runtime.lastError}`);
    } else {
      // console.log("Item created successfully");
    }
  }
  function onError(error) {
    // console.log(`Error: ${error}`);
  }
  chrome.contextMenus.create({
    id: "contextMenu_appendtexttoclipboard",
    title: "Append",
    contexts: ["selection"]
  }, onCreated);
  chrome.contextMenus.create({
    id: "contextMenu_appendtexttoclipboard_withline",
    title: "Append with newline",
    contexts: ["selection"]
  }, onCreated);

  // main
  var isAppending = false;
  var isClearing = false;
  var curData  = "";
  var copyedText = "";
  var isWithNewLine = false;

  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    // set input
    switch (info.menuItemId) {
    case "contextMenu_appendtexttoclipboard":
      isWithNewLine = false;
      break;
    case "contextMenu_appendtexttoclipboard_withline":
      isWithNewLine = true;
      break;
    }
    copyedText = info.selectionText;

    // main
    appendText();
  });

  chrome.commands.onCommand.addListener(function(command) {
     // console.log('Command:', command);

     switch (command) {
     case "toggle-Append":
       isWithNewLine = false;
       break;
     case "toggle-Append-With-New-Line":
       isWithNewLine = true;
       break;
     }

     chrome.tabs.query(
       {currentWindow: true, active: true},
       function (tabs) {
         chrome.tabs.sendMessage(
           tabs[0].id, {text: "selection"},
           function (response) {
             if (response.text) {
               copyedText = response.text;
               appendText();
             }
             else {
               clearClipboard();
             }
           });
       });
  });

  function appendText() {
    // start append
    isAppending = true;

    // create textarea
    var ta = document.createElement("textarea");
    ta.setAttribute("id", "appendTextarea")
    document.body.appendChild(ta);

    ta.focus();
    if (document.execCommand('paste')) {
      // console.log("pasted: ", curData);
      document.execCommand("copy");
    }

    // delete textarea
    ta.parentElement.removeChild(ta);

    // end append
    isAppending = false;
  }

  function clearClipboard() {
    isClearing = true;
    document.execCommand("copy");
    isClearing = false;

    chrome.notifications.create({
      "type": "basic",
      "iconUrl": chrome.extension.getURL("icons/icon-appendtexttoclipboard-64.png"),
      "title": "Append Text To Clipboard",
      "message": "Clear text in clipboard!"
    });
  }

  document.addEventListener('paste', function(e) {
    if (isAppending) {
      // console.log("fire paste");
      curData = e.clipboardData.getData("text/plain");
    }
  });

  document.addEventListener('copy', function(e) {
    if (isAppending) {
      // console.log("fire Append");
      var data = "";
      if (isWithNewLine) {
        data = curData + newLine() + copyedText;
      }
      else {
        data = curData + copyedText;
      }
      e.clipboardData.setData('text/plain', data);
      e.preventDefault();
    }
    else if(isClearing) {
      var data = "";
      e.clipboardData.setData('text/plain', data);
      e.preventDefault();
    }
  });

  function newLine() {
    var platform = navigator.platform.toLowerCase();
    if (platform.indexOf('win') != -1) {
        return "\r\n";
    }
    else if (platform.indexOf('mac') != -1) {
        return "\r";
    }
    else {
        return "\n";
    }
  }
})();
