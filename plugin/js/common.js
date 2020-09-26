var storageCache = {};

loadStorageCacheBackend();

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    storageCache[key] = changes[key].newValue;
  }
});


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

function generateEstablishmentUnitNumber() {
  var firstDigit = randomIntFromInterval(2, 7);
  var nextDigits = randomIntFromInterval(0, 9999999);

  var base = (firstDigit * 10000000) + nextDigits;
  var checksum = (97 - base % 97);
  var establishmentUnitNumber = ''.concat(100 * base + checksum);

  if (getPunctuation())
    establishmentUnitNumber = establishmentUnitNumber.splice(7, ".").splice(4, ".").splice(1, ".");

  return establishmentUnitNumber;
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


function getPunctuation() {
  return storageCache.settingPunctuation || storageCache.punctuation; //Backward compatibility ; remove in a next release
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


function loadStorageCacheBackend() {
  try {
    chrome.storage.sync.get(['settingPunctuation', 'settingDarkMode'], function(result) {
      storageCache = result;
    });
  } catch (e) {}
}