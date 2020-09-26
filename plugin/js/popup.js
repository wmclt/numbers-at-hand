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
  addGenerator("sectionPeople", "nationalIdentificationNumber", function() { getRandomRrnNumber(); });
  addGenerator("sectionCompanies", "companyNumber", function() { getRandomCompanyNumber(); });
  addGenerator("sectionCompanies", "vatNumber", function() { getRandomVatNumber(); });
  addGenerator("sectionCompanies", "establishmentUnitNumber", function() { getRandomEstablishmentUnitNumber(); });
  addGenerator("sectionCompanies", "nssoNumber", function() { getRandomNssoNumber(); });
  addGenerator("sectionOthers", "numberPlate", function() { getRandomNumberPlate(); });
  addGenerator("sectionOthers", "iban", function() { getRandomIban(); });
  addGenerator("sectionUtilities", "uuid", function() { getNilUuid(); });
  addGenerator("sectionUtilities", "uuidv4", function() { getV4Uuid(); });
  addGenerator("sectionUtilities", "currentDatetime", function() { getCurrentUtcDatetime(); });
}

function getRandomNumberPlate() {
  var firstDigit = randomIntFromInterval(1, 7);
  var firstChar = String.fromCharCode(randomIntFromInterval(65, 90));
  var secondChar = String.fromCharCode(randomIntFromInterval(65, 90));
  var thirdChar = String.fromCharCode(randomIntFromInterval(65, 90));
  var nextDigits = randomIntFromInterval(0, 999);

  var numberPlate = ''.concat(firstDigit).concat(firstChar).concat(secondChar).concat(thirdChar).concat(''.concat(nextDigits).padStart(3, "0"));

  if (getPunctuation())
    numberPlate = numberPlate.splice(4, "-").splice(1, "-");

  copy(numberPlate);
  setStatus(numberPlate);
}

function getRandomEstablishmentUnitNumber() {
  var establishmentUnitNumber = generateEstablishmentUnitNumber();
  // var firstDigit = randomIntFromInterval(2, 7);
  // var nextDigits = randomIntFromInterval(0, 9999999);
  //
  // var base = (firstDigit * 10000000) + nextDigits;
  // var checksum = (97 - base % 97);
  // var establishmentUnitNumber = ''.concat(100 * base + checksum);
  //
  // if (getPunctuation())
  //   establishmentUnitNumber = establishmentUnitNumber.splice(7, ".").splice(4, ".").splice(1, ".");

  copy(establishmentUnitNumber);
  setStatus(establishmentUnitNumber);
}


function getNilUuid() {
  var uuid = "00000000-0000-0000-0000-000000000000";
  copy(uuid);
  setStatus(uuid);
}

function getV4Uuid() {
  var uuid = generateUUID();
  copy(uuid);
  setStatus(uuid);
}

// //https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
// function generateUUID() { // Public Domain/MIT
//   var d = new Date().getTime(); //Timestamp
//   var d2 = (performance && performance.now && (performance.now() * 1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//     var r = Math.random() * 16; //random number between 0 and 16
//     if (d > 0) { //Use timestamp until depleted
//       r = (d + r) % 16 | 0;
//       d = Math.floor(d / 16);
//     } else { //Use microseconds since page-load if supported
//       r = (d2 + r) % 16 | 0;
//       d2 = Math.floor(d2 / 16);
//     }
//     return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
//   });
// }

function getRandomNssoNumber() {
  var base = randomIntFromInterval(1000, 1999999);
  var control = 96 - (100 * base) % 97;
  var nssonbr = ''.concat(100 * base + control).padStart(9, "0");

  if (getPunctuation())
    nssonbr = nssonbr.splice(7, "-");

  copy(nssonbr);
  setStatus(nssonbr);
}

function generateRandomCompanyNumber() {
  var base = randomIntFromInterval(2000000, 19999999);
  var control = 97 - base % 97;
  var companynbr = ''.concat(100 * base + control).padStart(10, "0");

  if (getPunctuation())
    companynbr = companynbr.splice(7, ".").splice(4, ".");

  return companynbr;
}

function getRandomCompanyNumber() {
  companynbr = generateRandomCompanyNumber();

  copy(companynbr);
  setStatus(companynbr);
}

function getRandomVatNumber() {
  var vat = "";
  var companyNbr = generateRandomCompanyNumber();

  if (getPunctuation())
    vat = "BTW BE ".concat(companyNbr);
  else
    vat = "BE".concat(companyNbr);

  copy(vat);
  setStatus(vat);
}

function getRandomRrnNumber() {
  var year = randomIntFromInterval(1920, 2019);
  var month = randomIntFromInterval(1, 12);
  var day = randomIntFromInterval(1, 28);
  var counter = randomIntFromInterval(1, 999);

  var base = ((year % 100) * 10000000) + (month * 100000) + (day * 1000) + (counter);
  var checksum = year >= 2000 ? (97 - (base + 2000000000) % 97) : (97 - base % 97);
  var rrn = ''.concat(100 * base + checksum).padStart(11, "0");

  if (getPunctuation())
    rrn = rrn.splice(6, "-").splice(4, ".").splice(2, ".").splice(12, ".");

  copy(rrn);
  setStatus(rrn);
}

function getRandomIban() {
  var country = "BE";
  var bankcode = randomIntFromInterval(0, 999); //https://www.nbb.be/en/payments-and-securities/payment-standards/bank-identification-codes
  var accountNbr = randomIntFromInterval(0, 9999999);

  var nationalCheck = (10000000 * bankcode + accountNbr) % 97 == 0 ? 97 : (10000000 * bankcode + accountNbr) % 97;
  var checksum = 98 - modulo('' + (1000000000000000 * bankcode + 100000000 * accountNbr + nationalCheck * 1000000 + 111400), '' + 97);
  var iban = country.concat(''.concat(1000000000000 * checksum + 1000000000 * bankcode + 100 * accountNbr + nationalCheck).padStart(14, "0"));

  if (getPunctuation())
    iban = iban.splice(12, " ").splice(8, " ").splice(4, " ");

  copy(iban);
  setStatus(iban);
}

function getCurrentUtcDatetime() {
  var datetime = new Date().toISOString();

  copy(datetime);
  setStatus(datetime);
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