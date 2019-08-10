(function () {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Get selected text
    var selectedString="";
    selectedString = window.getSelection().toString();
    if (!selectedString) {
      var selectedTextArea = document.activeElement;

      try {
        selectedString = selectedTextArea.value.substring(selectedTextArea.selectionStart, selectedTextArea.selectionEnd);
      }
      catch(e) {
        // console.log(e);
      }
    }

    // send selected text to search on background
    // console.log(selectedString);
    sendResponse({text: selectedString});
    return true;
  });
})();
