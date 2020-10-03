// let validator = {
//   set: function(obj, prop, value) {
//     // The default behavior to store the value
//     obj[prop] = value;
//
//     chrome.runtime.sendMessage(Message: "settingsUpdated");
//     // Indicate success
//     return true;
//   }
// };
//
// var storageCache = new Proxy({}, validator);


var storageCache = {};

loadStorageCacheBackend();

try {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
      storageCache[key] = changes[key].newValue;
      // chrome.runtime.sendMessage(Message: "settingsUpdated");
      try { applyContextMenuButtons(); } catch (e) {}
    }
  });
} catch (e) {}

var generators = [
  ["sectionPeople", "nationalIdentificationNumber", generateRandomRrnNumber, "BE"],
  ["sectionPeople", "nationalIdentificationNumberNL", generateRandomBsn, "NL"],
  ["sectionCompanies", "companyNumber", generateRandomCompanyNumber, "BE"],
  ["sectionCompanies", "vatNumber", generateRandomVatNumber, "BE"],
  ["sectionCompanies", "establishmentUnitNumber", generateRandomEstablishmentUnitNumber, "BE"],
  ["sectionCompanies", "nssoNumber", generateRandomNssoNumber, "BE"],
  ["sectionOthers", "numberPlate", generateRandomNumberPlate, "BE"],
  ["sectionOthers", "iban", generateRandomIban, "BE"],
  ["sectionUtilities", "nilUuid", generateNilUuid, "-"],
  ["sectionUtilities", "v4Uuid", generateRandomV4Uuid, "-"],
  ["sectionUtilities", "currentUtcDatetime", generateCurrentUtcDatetime, "-"]
];

function generateRandomBsn() //NL Burgerservicenummer
{
  var a = randomIntFromInterval(0, 6);
  var b = randomIntFromInterval(0, 9);
  var c = randomIntFromInterval(0, 9);
  var d = randomIntFromInterval(0, 9);
  var e = randomIntFromInterval(0, 9);
  var f = randomIntFromInterval(0, 9);
  var g = randomIntFromInterval(0, 9);
  var h = randomIntFromInterval(0, 9);

  if ((a == 0) && (b == 0)) b = 1;
  var i = (9 * a + 8 * b + 7 * c + 6 * d + 5 * e + 4 * f + 3 * g + 2 * h) % 11;
  if (i == 10) {
    if (h > 0) {
      h -= 1;
      i -= 2;
    } else {
      h += 1;
      i -= 9;
    }
  }
  return "" + a + b + c + d + e + f + g + h + i;
}

//https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
function generateRandomV4Uuid() { // Public Domain/MIT
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

function generateNilUuid() { return "00000000-0000-0000-0000-000000000000"; }

function generateRandomNssoNumber() {
  var base = randomIntFromInterval(1000, 1999999);
  var control = 96 - (100 * base) % 97;

  return "bbbbbbb-cc".punctuate()
    .fill("b", base)
    .fill("c", control);
}

function generateRandomCompanyNumber() { //1878.924.444
  var base = randomIntFromInterval(2000000, 19999999);
  var control = 97 - base % 97;

  return "bbbb.bbb.bcc".punctuate()
    .fill("b", base)
    .fill("c", control);
}

function generateRandomVatNumber() {
  var companyNbr = generateRandomCompanyNumber();

  return getPunctuation() ?
    "BTW BE ".concat(companyNbr) :
    "BE".concat(companyNbr);
}

function generateRandomRrnNumber() {
  var year = randomIntFromInterval(1920, 2019);
  var month = randomIntFromInterval(1, 12);
  var day = randomIntFromInterval(1, 28);
  var counter = randomIntFromInterval(1, 999);

  var base = ((year % 100) * 10000000) + (month * 100000) + (day * 1000) + (counter);
  var checksum = year >= 2000 ? (97 - (base + 2000000000) % 97) : (97 - base % 97);

  return "yy.mm.dd-nnn.cc".punctuate()
    .fill("y", year % 100)
    .fill("m", month)
    .fill("d", day)
    .fill("n", counter)
    .fill("c", checksum);
}

function generateRandomIban() {
  var country = "BE";
  var bankcode = randomIntFromInterval(0, 999); //https://www.nbb.be/en/payments-and-securities/payment-standards/bank-identification-codes
  var accountNbr = randomIntFromInterval(0, 9999999);

  var nationalCheck = (10000000 * bankcode + accountNbr) % 97 == 0 ? 97 : (10000000 * bankcode + accountNbr) % 97;
  var checksum = 98 - modulo((1000000000000000 * bankcode + 100000000 * accountNbr + nationalCheck * 1000000 + 111400 /*B=11 E=14*/ ), 97);

  return "oocc bbba aaaa aann".punctuate()
    .fill("o", country)
    .fill("c", checksum)
    .fill("b", bankcode)
    .fill("a", accountNbr)
    .fill("n", nationalCheck);
}

function generateRandomNumberPlate() {
  return "n-abc-NNN".punctuate()
    .fill("n", randomIntFromInterval(1, 7))
    .fill("a", String.fromCharCode(randomIntFromInterval(65, 90)))
    .fill("b", String.fromCharCode(randomIntFromInterval(65, 90)))
    .fill("c", String.fromCharCode(randomIntFromInterval(65, 90)))
    .fill("N", randomIntFromInterval(0, 999));
}

function generateRandomEstablishmentUnitNumber() {
  var base = randomIntFromInterval(20000000, 79999999);
  var checksum = (97 - base % 97);

  return "b.bbb.bbb.bcc".punctuate()
    .fill("b", base)
    .fill("c", checksum)
}

function generateCurrentUtcDatetime() { return new Date().toISOString(); }

function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function shouldDisplayGenerator(generatorRegion) {
  if (getRegion() == "*")
    return true;
  if (generatorRegion == "-" || generatorRegion == "*")
    return true;
  return generatorRegion == getRegion();
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

function togglePunctuationBackend() {
  updateSettingBackend("settingPunctuation", !getPunctuation());
}

function getPunctuation() {
  return storageCache.settingPunctuation;
}

function setContextActionInjection() {
  updateSettingBackend("settingContextActionClipboard", false);
  updateSettingBackend("settingContextActionInjection", true);
}

function setContextActionClipboard() {
  updateSettingBackend("settingContextActionClipboard", true);
  updateSettingBackend("settingContextActionInjection", false);
}

function setContextActionInjectionAndClipboard() {
  updateSettingBackend("settingContextActionClipboard", true);
  updateSettingBackend("settingContextActionInjection", true);
}

function getContextActionInjection() {
  return storageCache.settingContextActionInjection;
}

function getContextActionClipboard() {
  return storageCache.settingContextActionClipboard;
}

function updateSettingBackend(key, value) {
  try {
    chrome.storage.sync.set({
      [key]: value
    });
  } catch (e) {
    console.log(e);
  }
}

function getRegion() {
  return isDevMode() ? "*" : "BE";
  //return storageCache.settingRegion;
}

function modulo(divident, divisor) {
  var dividentString = divident.toString();
  var divisorString = divisor.toString();
  var cDivident = '';
  var cRest = '';

  for (var i in dividentString) {
    if (i == "fill" || i == "punctuate")
      break;

    var cChar = dividentString[i];
    var cOperator = cRest + '' + cDivident + '' + cChar;

    if (cOperator < parseInt(divisorString)) {
      cDivident += '' + cChar;
    } else {
      cRest = cOperator % divisorString;
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

if (String.prototype.fill === undefined) {
  String.prototype.fill = function(c, val, pad = "0") {
    var re = new RegExp(c, "g");
    var length = (this.match(re) || []).length;
    var i = 0,
      v = val.toString().padStart(length, pad);
    return this.replace(re, _ => v[i++]);
  };
}

if (String.prototype.punctuate === undefined) {
  String.prototype.punctuate = function() {
    return getPunctuation() ?
      this :
      this.replace(/[^a-zA-Z]/g, '');
  };
}

function loadStorageCacheBackend() {
  try {
    chrome.storage.sync.get([
      "settingPunctuation",
      "settingDarkMode",
      "settingContextActionClipboard",
      "settingContextActionInjection"
    ], function(
      result) {
      if (typeof result.settingContextActionInjection == 'undefined')
        result.settingContextActionInjection = true;

      storageCache = result;
      try { applyContextMenuButtons(); } catch (e) {}
    });
  } catch (e) {}
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

function isDevMode() {
  try {
    return !('update_url' in chrome.runtime.getManifest());
  } catch (e) { return true; }
}

function logGeneratorUsage(generatorId, label, source) {
  _gaq.push(['_trackEvent', 'Number generation', generatorId, label + " (punct:" + (getPunctuation() ? "Y" : "N") + ",src=" + source + ")",
    getPunctuation() ? 1 : 0
  ]);
}