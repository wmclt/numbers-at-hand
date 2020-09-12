var storageCache = {};

document.addEventListener('DOMContentLoaded', function() {
  setupGeneratingButton("a-rrn", "nationalIdentificationNumber", function() { getRandomRrnNumber(); });
  setupGeneratingButton("a-company", "companyNumber", function() { getRandomCompanyNumber(); });
  setupGeneratingButton("a-vat", "vatNumber", function() { getRandomVatNumber(); });
  setupGeneratingButton("a-establishmentunit", "establishmentUnitNumber", function() { getRandomEstablishmentUnitNumber(); });
  setupGeneratingButton("a-nsso", "nssoNumber", function() { getRandomNssoNumber(); });
  setupGeneratingButton("a-iban", "iban", function() { getRandomIban(); });
  setupGeneratingButton("a-numberplate", "numberPlate", function() { getRandomNumberPlate(); });

  setupGeneratingButton("a-uuid", "uuid", function() { getNilUuid(); });
  setupGeneratingButton("a-uuidv4", "uuidv4", function() { getV4Uuid(); });
  setupGeneratingButton("a-datetime", "currentDatetime", function() { getCurrentUtcDatetime(); });

  initUiValue("title", "extensionname");
  initUiValue("div-status", "defaultStatus");
  initUiValue("div-people", "sectionPeople");
  initUiValue("div-companies", "sectionCompanies");
  initUiValue("div-others", "sectionOthers");
  initUiValue("div-utilities", "sectionUtilities");
  initUiValue("lbl-punctuation", "settingPunctuation");
  initUiValue("lbl-darkMode", "settingDarkMode");

  loadStorageCache();

  document.getElementById("btn-settings").addEventListener('click', function() { toggleDisplay("div-settings"); }, false);
  document.getElementById("chk-punctuation").addEventListener('change', (event) => { updatePunctuation(event.target.checked); }, false);
  document.getElementById("btn-punctuation").addEventListener('click', function() { togglePunctuation(); }, false);
  document.getElementById("chk-darkMode").addEventListener('change', (event) => { updateDarkMode(event.target.checked); }, false);

  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
      storageCache[key] = changes[key].newValue;
    }
  });

}, false);

// **************************** Core functionality *****************************

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
  var firstDigit = randomIntFromInterval(2, 8);
  var nextDigits = randomIntFromInterval(0, 9999999);

  var base = (firstDigit * 10000000) + nextDigits;
  var checksum = (97 - base % 97);
  var establishmentUnitNumber = ''.concat(100 * base + checksum);

  if (getPunctuation())
    establishmentUnitNumber = establishmentUnitNumber.splice(7, ".").splice(4, ".").splice(1, ".");

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

//https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
function generateUUID() { // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 = (performance && performance.now && (performance.now() * 1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) { //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else { //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

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
    str = chrome.i18n.getMessage("copiedToClipboard", [text]);
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

function updatePunctuation(value) {
  chrome.storage.sync.set({ 'punctuation': value }, function() {
    console.log('Value is set to ' + value);
  });

  var lmnt = document.getElementById("btn-punctuation");

  if (value) {
    lmnt.classList.add("text-enabled");
    lmnt.classList.remove("text-disabled");
  } else {
    lmnt.classList.add("text-disabled");
    lmnt.classList.remove("text-enabled");
  }

  document.getElementById("chk-punctuation").checked = value;
}

function updateDarkMode(value) {
  chrome.storage.sync.set({ 'darkMode': value }, function() {
    console.log('Value is set to ' + value);
  });

  value
    ?
    document.body.setAttribute("data-theme", "dark") :
    document.body.removeAttribute("data-theme");

  document.getElementById("chk-darkMode").checked = value;
}

function getPunctuation() {
  return storageCache.punctuation;
}

function getDarkMode() {
  return storageCache.darkMode;
}

function togglePunctuation() {
  updatePunctuation(!getPunctuation());
}

function toggleDarkMode() {
  updateDarkMode(!getDarkMode());
}

function loadStorageCache() {
  chrome.storage.sync.get(['punctuation', 'darkMode'], function(result) {
    storageCache = result;
    updatePunctuation(result.punctuation);
    updateDarkMode(result.darkMode);
  });
}

// **************************** Setup functions ******************************

function setupGeneratingButton(elementId, messageId, func) {
  var lmnt = document.getElementById(elementId);
  lmnt.addEventListener('click', func, false);
  lmnt.addEventListener('mouseout', function() { resetStatus(); }, false);
  initUiValue(elementId, messageId);
  lmnt.classList.add("generator");
}

function initUiValue(elementId, messageId) {
  try {
    document.getElementById(elementId).innerHTML = chrome.i18n.getMessage(messageId);
  } catch (err) {
    ; //[Uncaught TypeError: Cannot read property 'getMessage' of undefined] if webpage loaded directly
  }
}

// **************************** Google analytics ******************************

var _AnalyticsCode = 'UA-177843535-1';

/**
 * Below is a modified version of the Google Analytics asynchronous tracking
 * code snippet.  It has been modified to pull the HTTPS version of ga.js
 * instead of the default HTTP version.  It is recommended that you use this
 * snippet instead of the standard tracking snippet provided when setting up
 * a Google Analytics account.
 */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', _AnalyticsCode]);
_gaq.push(['_trackPageview']);
_gaq.push(['_setCustomVar', 1, 'DarkMode', getDarkMode(), 1]);
_gaq.push(['_setCustomVar', 2, 'DarkMode', getDarkMode(), 1]);

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
    _gaq.push(['_trackEvent', 'Number generation', e.target.innerText, "Punctuation " + (getPunctuation() ? "on" : "off"), ]);
  else
    _gaq.push(['_trackEvent', 'Unclassified', e.target.id, e.target.innerText]);
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


function readTextFile(file) { //https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        var allText = rawFile.responseText;
        //  alert(allText);
        return allText;
      }
    }
  }
  rawFile.send(null);
}

function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function copy(text) {
  var input = document.createElement('input');
  input.setAttribute('value', text);
  document.body.appendChild(input);
  input.select();
  var result = document.execCommand('copy');
  document.body.removeChild(input);
  return result;
}

function modulo(divident, divisor) {
  var cDivident = '';
  var cRest = '';

  for (var i in divident) {
    if (i == "splice")
      break;

    var cChar = divident[i];
    var cOperator = cRest + '' + cDivident + '' + cChar;

    if (cOperator < parseInt(divisor)) {
      cDivident += '' + cChar;
    } else {
      cRest = cOperator % divisor;
      if (cRest == 0) {
        cRest = '';
      }
      cDivident = '';
    }
  }
  cRest += '' + cDivident;
  if (cRest == '') {
    cRest = 0;
  }
  return cRest;
}

if (String.prototype.splice === undefined) {
  /**
   * Splices text within a string.
   * @param {int} offset The position to insert the text at (before)
   * @param {string} text The text to insert
   * @param {int} [removeCount=0] An optional number of characters to overwrite
   * @returns {string} A modified string containing the spliced text.
   */
  String.prototype.splice = function(offset, text, removeCount = 0) {
    let calculatedOffset = offset < 0 ? this.length + offset : offset;
    return this.substring(0, calculatedOffset) +
      text + this.substring(calculatedOffset + removeCount);
  };
}

function getLang() { //https://stackoverflow.com/questions/673905/best-way-to-determine-users-locale-within-browser
  if (navigator.languages != undefined)
    return navigator.languages[0];
  else
    return navigator.language;
}