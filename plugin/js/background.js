function onClickHandler(info, tab) {
  var g = generators.filter(x => x[1] == info.menuItemId)[0][2];

  //https://stackoverflow.com/questions/28055887/is-there-a-flexible-way-to-modify-the-contents-of-an-editable-element
  chrome.tabs.executeScript(tab.id, {
    code: 'var l = document.activeElement; var content = "' + g() +
      '";var s = l.selectionStart; l.value = l.value.slice(0, l.selectionStart) + content + l.value.substr(l.selectionEnd); l.selectionStart = s + content.length; l.selectionEnd = l.selectionStart;',
    frameId: info.frameId
  });

  logGeneratorUsage(info.menuItemId, chrome.i18n.getMessage(info.menuItemId), "context");
};

var parentId = chrome.contextMenus.create({
  "title": chrome.i18n.getMessage("extensionname"),
  "contexts": ["editable"],
  "id": "parent"
});

for (var i = 0; i < generators.length; i++) {
  if (shouldDisplayGenerator(generators[i][3]))
    chrome.contextMenus.create({
      "title": chrome.i18n.getMessage(generators[i][1]),
      "contexts": ["editable"],
      "id": generators[i][1],
      "parentId": parentId
    });
}

chrome.contextMenus.onClicked.addListener(onClickHandler);