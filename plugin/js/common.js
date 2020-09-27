var storageCache = {};

loadStorageCacheBackend();

chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (var key in changes) {
    storageCache[key] = changes[key].newValue;
  }
});


var generators = [
  ["sectionPeople", "nationalIdentificationNumber", function() { getRandomRrnNumber(); }],
  ["sectionCompanies", "companyNumber", function() { getRandomCompanyNumber(); }],
  ["sectionCompanies", "vatNumber", function() { getRandomVatNumber(); }],
  ["sectionCompanies", "establishmentUnitNumber", function() { getRandomEstablishmentUnitNumber(); }],
  ["sectionCompanies", "nssoNumber", function() { getRandomNssoNumber(); }],
  ["sectionOthers", "numberPlate", function() { getRandomNumberPlate(); }],
  ["sectionOthers", "iban", function() { getRandomIban(); }],
  ["sectionUtilities", "uuid", function() { getNilUuid(); }],
  ["sectionUtilities", "uuidv4", function() { getV4Uuid(); }],
  ["sectionUtilities", "currentDatetime", function() { getCurrentUtcDatetime(); }]
];


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

function generateNilUuid() { return "00000000-0000-0000-0000-000000000000"; }

function generateNssoNumber() {
  var base = randomIntFromInterval(1000, 1999999);
  var control = 96 - (100 * base) % 97;
  var nssonbr = ''.concat(100 * base + control).padStart(9, "0");

  if (getPunctuation())
    nssonbr = nssonbr.splice(7, "-");

  return nssonbr;
}

function generateRandomCompanyNumber() {
  var base = randomIntFromInterval(2000000, 19999999);
  var control = 97 - base % 97;
  var companynbr = ''.concat(100 * base + control).padStart(10, "0");

  if (getPunctuation())
    companynbr = companynbr.splice(7, ".").splice(4, ".");

  return companynbr;
}

function generateRandomVatNumber() {
  var vat = "";
  var companyNbr = generateRandomCompanyNumber();

  if (getPunctuation())
    vat = "BTW BE ".concat(companyNbr);
  else
    vat = "BE".concat(companyNbr);

  return vat;
}

function generateRandomRrnNumber() {
  var year = randomIntFromInterval(1920, 2019);
  var month = randomIntFromInterval(1, 12);
  var day = randomIntFromInterval(1, 28);
  var counter = randomIntFromInterval(1, 999);

  var base = ((year % 100) * 10000000) + (month * 100000) + (day * 1000) + (counter);
  var checksum = year >= 2000 ? (97 - (base + 2000000000) % 97) : (97 - base % 97);
  var rrn = ''.concat(100 * base + checksum).padStart(11, "0");

  if (getPunctuation())
    rrn = rrn.splice(6, "-").splice(4, ".").splice(2, ".").splice(12, ".");

  return rrn;
}

function generateRandomIban() {
  var country = "BE";
  var bankcode = randomIntFromInterval(0, 999); //https://www.nbb.be/en/payments-and-securities/payment-standards/bank-identification-codes
  var accountNbr = randomIntFromInterval(0, 9999999);

  var nationalCheck = (10000000 * bankcode + accountNbr) % 97 == 0 ? 97 : (10000000 * bankcode + accountNbr) % 97;
  var checksum = 98 - modulo('' + (1000000000000000 * bankcode + 100000000 * accountNbr + nationalCheck * 1000000 + 111400), '' + 97);
  var iban = country.concat(''.concat(1000000000000 * checksum + 1000000000 * bankcode + 100 * accountNbr + nationalCheck).padStart(14, "0"));

  if (getPunctuation())
    iban = iban.splice(12, " ").splice(8, " ").splice(4, " ");

  return iban;
}

function generateNumberPlate() {
  var firstDigit = randomIntFromInterval(1, 7);
  var firstChar = String.fromCharCode(randomIntFromInterval(65, 90));
  var secondChar = String.fromCharCode(randomIntFromInterval(65, 90));
  var thirdChar = String.fromCharCode(randomIntFromInterval(65, 90));
  var nextDigits = randomIntFromInterval(0, 999);

  var numberPlate = ''.concat(firstDigit).concat(firstChar).concat(secondChar).concat(thirdChar).concat(''.concat(nextDigits).padStart(3, "0"));

  if (getPunctuation())
    numberPlate = numberPlate.splice(4, "-").splice(1, "-");

  return numberPlate;
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

function generateCurrentUtcDatetime() {
  return new Date().toISOString();
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