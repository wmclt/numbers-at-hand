try {
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message == "settingsUpdated")
      applyContextMenuButtons();
  });
} catch (e) {}

function onClickHandler(info, tab) {
  if (info.menuItemId == "modeInject")
    setContextActionInjection();
  else if (info.menuItemId == "modeInjectClipboard")
    setContextActionInjectionAndClipboard();
  else if (info.menuItemId == "modeClipboard")
    setContextActionClipboard();
  else if (info.menuItemId == "settingPunctuation")
    togglePunctuationBackend();
  else {
    var g = generators.filter(x => x[1] == info.menuItemId)[0][2];
    var value = g();

    if (getContextActionInjection()) {
      //https://stackoverflow.com/questions/28055887/is-there-a-flexible-way-to-modify-the-contents-of-an-editable-element
      chrome.tabs.executeScript(tab.id, {
        code: 'var l = document.activeElement; var content = "' + value +
          '";var s = l.selectionStart; l.value = l.value.slice(0, l.selectionStart) + content + l.value.substr(l.selectionEnd); l.selectionStart = s + content.length; l.selectionEnd = l.selectionStart;',
        frameId: info.frameId
      });
    }
    if (getContextActionClipboard())
      copy(value);

    logGeneratorUsage(info.menuItemId, chrome.i18n.getMessage(info.menuItemId), "context");
  }
};


applyContextMenuButtons();

function applyContextMenuButtons() {

  chrome.contextMenus.removeAll();

  for (var i = 0; i < generators.length; i++) {
    if (shouldDisplayGenerator(generators[i][3]))
      chrome.contextMenus.create({
        "title": chrome.i18n.getMessage(generators[i][1]),
        "contexts": ["editable"],
        "id": generators[i][1],
      });
  }

  chrome.contextMenus.create({
    "contexts": ["editable"],
    "id": "separator",
    "type": "separator",
  });

  chrome.contextMenus.create({
    "contexts": ["editable"],
    "title": "Inject",
    "type": "radio",
    "id": "modeInject",
    "checked": getContextActionInjection() && !getContextActionClipboard()
  });
  chrome.contextMenus.create({
    "contexts": ["editable"],
    "title": "Inject + copy to clipboard",
    "type": "radio",
    "id": "modeInjectClipboard",
    "checked": getContextActionClipboard() && getContextActionInjection()
  });
  chrome.contextMenus.create({
    "contexts": ["editable"],
    "title": "Copy to clipboard",
    "type": "radio",
    "id": "modeClipboard",
    "checked": getContextActionClipboard() && !getContextActionInjection()
  });

  chrome.contextMenus.create({
    "contexts": ["editable"],
    "id": "separator2",
    "type": "separator"
  });

  chrome.contextMenus.create({
    "contexts": ["editable"],
    "title": "Punctuation",
    "type": "checkbox",
    "id": "settingPunctuation",
    "checked": getPunctuation()
  });

  chrome.contextMenus.onClicked.addListener(onClickHandler);
}