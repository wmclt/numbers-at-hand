// The onClicked callback function.
function onClickHandler(info, tab) {
  // console.log("item " + info.menuItemId + " was clicked");
  // console.log("info: " + JSON.stringify(info));
  // console.log("tab: " + JSON.stringify(tab));
  var value = info.menuItemId == "uuidv4" ? generateUUID() :
    info.menuItemId == "establishmentUnitNumber" ? generateEstablishmentUnitNumber() : "undefined";


  //https://stackoverflow.com/questions/28055887/is-there-a-flexible-way-to-modify-the-contents-of-an-editable-element
  chrome.tabs.executeScript(tab.id, {
    code: 'var l = document.activeElement; var content = "' + value +
      '"; l.value = l.value.slice(0, l.selectionStart) + content + l.value.substr(l.selectionEnd); l.selectionStart = l.selectionStart + content.length; l.selectionEnd = l.selectionStart;',
    frameId: info.frameId
  }); //TODO: debug selectionStart + selectionEnd
};

var parentId = chrome.contextMenus.create({
  "title": "Numbers at hand",
  "contexts": ["editable"],
  "id": "parent"
});

chrome.contextMenus.create({
  "title": chrome.i18n.getMessage("uuidv4"),
  "contexts": ["editable"],
  "id": "uuidv4",
  "parentId": parentId
});

chrome.contextMenus.create({
  "title": chrome.i18n.getMessage("establishmentUnitNumber"),
  "contexts": ["editable"],
  "id": "establishmentUnitNumber",
  "parentId": parentId
});

chrome.contextMenus.onClicked.addListener(onClickHandler);