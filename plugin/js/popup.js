document.addEventListener('DOMContentLoaded', function() {
  loadStorageCacheUI();

  addGenerators(getRegion());

  initUiValue("title", "extensionname");
  initUiValue("div-status", "defaultStatus");

  document.getElementById("btn-settings").addEventListener('click', function() { toggleDisplay("div-settings"); }, false);
  document.getElementById("btn-settingPunctuation").addEventListener('click', function() { togglePunctuation(); }, false);
  document.getElementById("btn-settingRegion").addEventListener('click', function() { selectNextRegion(); }, false);

  addSettingSwitch("settingPunctuation", (event) => { updatePunctuation(event.target.checked); });
  addSettingSwitch("settingDarkMode", (event) => { updateDarkMode(event.target.checked); });

}, false);

// **************************** Link generators *****************************
function addGenerators(region) {
  const myNode = document.getElementById('div-generators');
  while (myNode.lastElementChild) {
    myNode.removeChild(myNode.lastElementChild);
  }

  //https://stackoverflow.com/questions/256754/how-to-pass-arguments-to-addeventlistener-listener-function
  generators.forEach(function(g) {
    if (shouldDisplayGenerator(g[3], region))
      addGenerator(g[0], g[1], function(x) { return function() { processGenerationRequest(x) }; }(g[2]));
  });
}

function processGenerationRequest(generator) {
  var nr = generator();
  copy(nr);
  setStatus(nr);
}

// **************************** Status functions ******************************

function resetStatus(text) {
  var stat = document.getElementById('div-status');
  stat.classList.add("list-group-item-secondary");
  stat.classList.remove("list-group-item-success");
}

function setStatus(text) {
  var str = "";
  try {
    str = geti18n("copiedToClipboard", [text]);
  } catch (err) {
    str = text + ' copied to clipboard';
  }

  var stat = document.getElementById('div-status');
  stat.innerText = str;
  stat.classList.add("list-group-item-success");
  stat.classList.remove("list-group-item-secondary");
}

// **************************** Settings functions ******************************

function toggleDisplay(elementId) {
  var lmnt = document.getElementById(elementId);

  lmnt.classList.contains("d-none") ?
    lmnt.classList.remove("d-none") :
    lmnt.classList.add("d-none");
}

function isVisible(elementId) {
  var x = document.getElementById(elementId);
  return window.getComputedStyle(x).display !== "none";
}

function updateSetting(key, value) {
  updateSettingBackend(key, value);


  if (key == "settingRegion") {
    var li = document.getElementById("btn-" + key);
    if (li)
      li.innerText = regions[regions.findIndex(x => x[0] == value)][1];
  } else {
    var lmnt = document.getElementById("btn-" + key);
    if (lmnt) {
      if (value) {
        lmnt.classList.add("text-enabled");
        lmnt.classList.remove("text-disabled");
      } else {
        lmnt.classList.add("text-disabled");
        lmnt.classList.remove("text-enabled");
      }
    }

    var chk = document.getElementById("chk-" + key);
    if (chk)
      chk.checked = value;
  }
}

function updatePunctuation(value) {
  updateSetting("settingPunctuation", value);
}

function updateDarkMode(value) {
  updateSetting("settingDarkMode", value);

  value
    ?
    document.body.setAttribute("data-theme", "dark") :
    document.body.removeAttribute("data-theme");
}

function getDarkMode() {
  return storageCache.settingDarkMode;
}

function togglePunctuation() {
  updatePunctuation(!getPunctuation());
}

function updateRegion(value) {
  updateSetting("settingRegion", value);
  addGenerators(value);
}

function selectNextRegion() {
  var current = getRegion();
  var next = (regions.findIndex(x => x[0] == current) + 1) % regions.length;
  updateRegion(regions[next][0]);
}

function toggleDarkMode() {
  updateDarkMode(!getDarkMode());
}

function loadStorageCacheUI() {
  try {
    chrome.storage.sync.get(["settingPunctuation", "settingDarkMode", "settingRegion"], function(result) {
      if (typeof result.settingContextActionInjection == 'undefined')
        result.settingContextActionInjection = true;
      if (typeof result.settingRegion == 'undefined')
        result.settingRegion = "BE";

      storageCache = result;
      updatePunctuation(result.settingPunctuation);
      updateDarkMode(result.settingDarkMode);
      updateRegion(result.settingRegion);

      _gaq.push(['_setCustomVar', 1, 'DarkMode', result.settingDarkMode ? "dark" : "light", 1]); //TODO: This does not work ?? - debug needed
      _gaq.push(['_trackEvent', 'Storage cache load', 'DarkMode ' + (result.settingDarkMode ? "on" : "off")]);
    });
  } catch (e) {}
}

// **************************** Setup functions ******************************

function addGeneratorSection(messageId) {
  let section = document.createElement('div');
  section.id = messageId;

  let header = document.createElement('div');
  header.className = 'list-group-item list-group-item-secondary list-group-header small font-weight-bold';
  header.innerText = geti18n(messageId);
  section.appendChild(header);

  document.getElementById('div-generators').appendChild(section);
  return section;
}

function addGenerator(menuId, messageId, func) {
  let menu = document.getElementById(menuId) || addGeneratorSection(menuId);

  let lmnt = document.createElement('a');
  lmnt.href = '#';
  lmnt.className = 'list-group-item list-group-item-action list-group-compact generator';
  lmnt.id = messageId;
  lmnt.innerText = geti18n(messageId);
  lmnt.addEventListener('click', func, false);
  lmnt.addEventListener('mouseout', function() { resetStatus(); }, false);
  lmnt.addEventListener('click', trackButtonClick);

  menu.appendChild(lmnt);
  return lmnt;
}

function addSettingSwitch(messageId, func) {
  let div = document.createElement('div');
  div.className = 'custom-control custom-switch';

  let input = document.createElement('input');
  input.className = 'custom-control-input';
  input.type = 'checkbox';
  input.id = "chk-" + messageId;
  input.value = "";
  input.addEventListener('change', func, false);
  div.appendChild(input);

  let label = document.createElement('label');
  label.className = 'custom-control-label';
  label.htmlFor = "chk-" + messageId;
  label.id = "lbl-" + messageId;
  label.innerText = geti18n(messageId);
  div.appendChild(label);

  document.getElementById("div-settings").appendChild(div);
  return div;
}

function initUiValue(elementId, messageId) {
  try {
    document.getElementById(elementId).innerText = geti18n(messageId);
  } catch (err) {
    ; //[Uncaught TypeError: Cannot read property 'getMessage' of undefined] if webpage loaded directly
  }
}

// **************************** Google analytics ******************************

function trackButtonClick(e) {
  if (e.target.classList.contains("generator"))
    logGeneratorUsage(e.target.id, e.target.innerText, "popup");
  else if (e.target.id == "btn-settings") {
    _gaq.push(['_trackEvent', 'Settings', (isVisible("div-settings") ? "Open" : "Close") + " settings menu"]);
  } else if (e.target.id == "chk-settingDarkMode") {
    _gaq.push(['_trackEvent', 'Settings', (e.target.checked ? "Enable" : "Disable") + " dark mode"]);
  } else if (e.target.id == "chk-settingPunctuation") {
    _gaq.push(['_trackEvent', 'Settings', (e.target.checked ? "Enable" : "Disable") + " punctuation", "via settings menu"]);
  } else if (e.target.id == "btn-settingPunctuation") {
    _gaq.push(['_trackEvent', 'Settings', (getPunctuation() ? "Enable" : "Disable") + " punctuation", "via onscreen button"]);
  } else if (e.target.id == "btn-settingRegion") {
    _gaq.push(['_trackEvent', 'Settings', "Switch region to " + getRegion(), "via onscreen button"]);
  } else {
    _gaq.push(['_trackEvent', 'Unclassified', e.target.id, e.target.innerText]);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var buttons = document.querySelectorAll('a,input,li');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', trackButtonClick);
  }
});

// **************************** Helper functions ******************************

function geti18n(messageId, content) {
  try {
    return chrome.i18n.getMessage(messageId, [content]);
  } catch (e) {
    if (typeof content !== 'undefined')
      return content + " " + messageId;
    else return messageId;
  }
}