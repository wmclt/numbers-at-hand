// var storageCache = {};

document.addEventListener('DOMContentLoaded', function() {
  loadStorageCacheUI();

  addGenerators();

  initUiValue("title", "extensionname");
  initUiValue("div-status", "defaultStatus");

  document.getElementById("btn-settings").addEventListener('click', function() { toggleDisplay("div-settings"); }, false);
  document.getElementById("btn-settingPunctuation").addEventListener('click', function() { togglePunctuation(); }, false);

  addSettingSwitch("settingPunctuation", (event) => { updatePunctuation(event.target.checked); });
  addSettingSwitch("settingDarkMode", (event) => { updateDarkMode(event.target.checked); });

  // chrome.storage.onChanged.addListener(function(changes, namespace) {
  //   for (var key in changes) {
  //     storageCache[key] = changes[key].newValue;
  //   }
  // });

}, false);

// **************************** Core functionality *****************************
function addGenerators() {
  for (var i = 0; i < generators.length; i++) {
    addGenerator(generators[i][0], generators[i][1], generators[i][2]);
  }
}

function processGenerationRequest(generator) {
  var nr = generator();
  copy(nr);
  setStatus(nr);
}

function getRandomNumberPlate() {
  var nr = generateNumberPlate();
  copy(nr);
  setStatus(nr);
}

function getRandomEstablishmentUnitNumber() {
  var nr = generateEstablishmentUnitNumber();
  copy(nr);
  setStatus(nr);
}

function getNilUuid() {
  var nr = generateNilUuid();
  copy(nr);
  setStatus(nr);
}

function getV4Uuid() {
  var nr = generateUUID();
  copy(nr);
  setStatus(nr);
}

function getRandomNssoNumber() {
  var nr = generateNssoNumber();

  copy(nr);
  setStatus(nr);
}

function getRandomCompanyNumber() {
  var nr = generateRandomCompanyNumber();

  copy(nr);
  setStatus(nr);
}

function getRandomVatNumber() {
  var nr = generateRandomVatNumber();

  copy(nr);
  setStatus(nr);
}

function getRandomRrnNumber() {
  var nr = generateRandomRrnNumber();

  copy(nr);
  setStatus(nr);
}

function getRandomIban() {
  var nr = generateRandomIban();

  copy(nr);
  setStatus(nr);
}

function getCurrentUtcDatetime() {
  var nr = generateCurrentUtcDatetime();
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
  stat.innerHTML = str;
  stat.classList.add("list-group-item-success");
  stat.classList.remove("list-group-item-secondary");
}

// **************************** Settings functions ******************************

function toggleDisplay(elementId) {
  var lmnt = document.getElementById(elementId);

  if (lmnt.classList.contains("d-none"))
    lmnt.classList.remove("d-none");
  else
    lmnt.classList.add("d-none");
}

function isVisible(elementId) {
  var x = document.getElementById(elementId);
  return window.getComputedStyle(x).display !== "none";
}

function updateSetting(key, value) {
  try {
    chrome.storage.sync.set({
      [key]: value
    });
  } catch (e) {
    console.log(e);
  } finally {
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

    document.getElementById("chk-" + key).checked = value;
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
//
// function getPunctuation() {
//   return storageCache.settingPunctuation || storageCache.punctuation; //Backward compatibility ; remove in a next release
// }

function getDarkMode() {
  return storageCache.settingDarkMode || storageCache.darkMode; //Backward compatibility ; remove in a next release
}

function togglePunctuation() {
  updatePunctuation(!getPunctuation());
}

function toggleDarkMode() {
  updateDarkMode(!getDarkMode());
}

function loadStorageCacheUI() {
  try {
    chrome.storage.sync.get(['settingPunctuation', 'settingDarkMode'], function(result) {
      storageCache = result;
      updatePunctuation(result.settingPunctuation);
      updateDarkMode(result.settingDarkMode);
      _gaq.push(['_setCustomVar', 1, 'DarkMode', result.settingDarkMode ? "dark" : "light", 1]); //TODO: This does not work ?? - debug needed
      _gaq.push(['_trackEvent', 'Storage cache load', 'DarkMode ' + (result.settingDarkMode ? "on" : "off")]);
    });
  } catch (e) {

  }
}

// **************************** Setup functions ******************************

function addGeneratorSection(messageId) {
  let section = document.createElement('div');
  section.id = messageId;

  let header = document.createElement('div');
  header.className = 'list-group-item list-group-item-secondary list-group-header small font-weight-bold';
  header.innerHTML = geti18n(messageId);
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
  lmnt.innerHTML = geti18n(messageId);
  lmnt.addEventListener('click', func, false);
  lmnt.addEventListener('mouseout', function() { resetStatus(); }, false);

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
  label.innerHTML = geti18n(messageId);
  div.appendChild(label);

  document.getElementById("div-settings").appendChild(div);
  return div;
}

function initUiValue(elementId, messageId) {
  try {
    document.getElementById(elementId).innerHTML = geti18n(messageId);
  } catch (err) {
    ; //[Uncaught TypeError: Cannot read property 'getMessage' of undefined] if webpage loaded directly
  }
}

// **************************** Google analytics ******************************

function getAnalyticsCode() {
  return isDevMode() ? 'UA-177843535-1' : 'UA-177843535-2';
}

/**
 * Below is a modified version of the Google Analytics asynchronous tracking
 * code snippet.  It has been modified to pull the HTTPS version of ga.js
 * instead of the default HTTP version.  It is recommended that you use this
 * snippet instead of the standard tracking snippet provided when setting up
 * a Google Analytics account.
 */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', getAnalyticsCode()]);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();
/**
 * Track a click on a button using the asynchronous tracking API.
 *
 * See http://code.google.com/apis/analytics/docs/tracking/asyncTracking.html
 * for information on how to use the asynchronous tracking API.
 */
function trackButtonClick(e) {
  if (e.target.classList.contains("generator"))
    _gaq.push(['_trackEvent', 'Number generation', e.target.id, e.target.innerText + " (punct:" + (getPunctuation() ? "Y)" : "N)"), getPunctuation() ?
      1 : 0
    ]);
  else if (e.target.id == "btn-settings") {
    _gaq.push(['_trackEvent', 'Settings', (isVisible("div-settings") ? "Open" : "Close") + " settings menu"]);
  } else if (e.target.id == "chk-settingDarkMode") {
    _gaq.push(['_trackEvent', 'Settings', (getDarkMode() ? "Disable" : "Enable") + " dark mode"]);
  } else if (e.target.id == "chk-settingPunctuation") {
    _gaq.push(['_trackEvent', 'Settings', (getPunctuation() ? "Disable" : "Enable") + " punctuation", "via settings menu"]);
  } else if (e.target.id == "btn-settingPunctuation") {
    _gaq.push(['_trackEvent', 'Settings', (getPunctuation() ? "Disable" : "Enable") + " punctuation", "via onscreen button"]);
  } else {
    _gaq.push(['_trackEvent', 'Unclassified', e.target.id, e.target.innerText]);
  }
}

/**
 * Now set up your event handlers for the popup's `button` elements once the
 * popup's DOM has loaded.
 */
document.addEventListener('DOMContentLoaded', function() {
  var buttons = document.querySelectorAll('a,input,li'); //TODO: use class to mark trackable items?
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', trackButtonClick);
  }
});

// **************************** Helper functions ******************************

// function randomIntFromInterval(min, max) { // min and max included
//   return Math.floor(Math.random() * (max - min + 1) + min);
// }
//
// function copy(text) {
//   var input = document.createElement('input');
//   input.setAttribute('value', text);
//   document.body.appendChild(input);
//   input.select();
//   var result = document.execCommand('copy');
//   document.body.removeChild(input);
//   return result;
// }
//
// function modulo(divident, divisor) {
//   var cDivident = '';
//   var cRest = '';
//
//   for (var i in divident) {
//     if (i == "splice")
//       break;
//
//     var cChar = divident[i];
//     var cOperator = cRest + '' + cDivident + '' + cChar;
//
//     if (cOperator < parseInt(divisor)) {
//       cDivident += '' + cChar;
//     } else {
//       cRest = cOperator % divisor;
//       if (cRest == 0) {
//         cRest = '';
//       }
//       cDivident = '';
//     }
//   }
//   cRest += '' + cDivident;
//   if (cRest == '') {
//     cRest = 0;
//   }
//   return cRest;
// }
//
// if (String.prototype.splice === undefined) {
//   /**
//    * Splices text within a string.
//    * @param {int} offset The position to insert the text at (before)
//    * @param {string} text The text to insert
//    * @param {int} [removeCount=0] An optional number of characters to overwrite
//    * @returns {string} A modified string containing the spliced text.
//    */
//   String.prototype.splice = function(offset, text, removeCount = 0) {
//     let calculatedOffset = offset < 0 ? this.length + offset : offset;
//     return this.substring(0, calculatedOffset) +
//       text + this.substring(calculatedOffset + removeCount);
//   };
// }

function geti18n(messageId, content) {
  try {
    return chrome.i18n.getMessage(messageId, [content]);
  } catch (e) {
    if (typeof content !== 'undefined')
      return content + " " + messageId;
    else return messageId;
  }
}

function isDevMode() {
  try {
    return !('update_url' in chrome.runtime.getManifest());
  } catch (e) { return true; }
}