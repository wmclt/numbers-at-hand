var storageCache = {};

loadStorageCacheBackend();

try {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
      storageCache[key] = changes[key].newValue;
      try { applyContextMenuButtons(); } catch (e) {}
    }
  });
} catch (e) {}

var regions = [
  ["BE", "🇧🇪"],
  ["NL", "🇳🇱"]
];

var generators = [
  ["sectionPeople", "nationalIdentificationNumber", generateRandomRrnNumber, "BE"],
  ["sectionPeople", "nationalIdentificationNumberNL", generateRandomBsn, "NL"],
  ["sectionCompanies", "companyNumber", generateRandomCompanyNumber, "BE"],
  ["sectionCompanies", "vatNumber", generateRandomVatNumber, "BE"],
  ["sectionCompanies", "establishmentUnitNumber", generateRandomEstablishmentUnitNumber, "BE"],
  ["sectionCompanies", "nssoNumber", generateRandomNssoNumber, "BE"],
  ["sectionOthers", "numberPlate", generateRandomNumberPlate, "BE"],
  ["sectionOthers", "iban", generateRandomIban, "BE"],
  ["sectionOthers", "bic", generateRandomBic, "BE"],
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

function generateRandomCompanyNumber() {
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
  var bankcode = selectRandomBankcode();
  var accountNbr = randomIntFromInterval(0, 9999999);

  var nationalCheck = (10000000 * bankcode + accountNbr) % 97 == 0 ? 97 : (10000000 * bankcode + accountNbr) % 97;
  var checksum = 98 - modulo(
    ''.concat(
      ('000' + bankcode).slice(-3),
      ('0000000' + accountNbr).slice(-7),
      ('00' + nationalCheck).slice(-2),
      11 /*B*/ ,
      14 /*E*/ ,
      "00"), 97);

  return "oocc bbba aaaa aann".punctuate()
    .fill("o", country)
    .fill("c", checksum)
    .fill("b", bankcode)
    .fill("a", accountNbr)
    .fill("n", nationalCheck);
}

function selectRandomBankcode() {
  //https://www.nbb.be/en/payments-and-securities/payment-standards/bank-identification-codes
  var listOfBankcodes = ["000", "001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012", "013", "014", "015", "016",
    "017", "018", "019",
    "020", "021", "022", "023", "024", "025", "026", "027", "028", "029", "030", "031", "032", "033", "034", "035", "036", "037", "038", "039",
    "040", "041", "042", "043",
    "044", "045", "046", "047", "048", "049", "050", "051", "052", "053", "054", "055", "056", "057", "058", "059", "060", "061", "062", "063",
    "064", "065", "066", "067",
    "068", "069", "070", "071", "072", "073", "074", "075", "076", "077", "078", "079", "080", "081", "082", "083", "084", "085", "086", "087",
    "088", "089", "090", "091",
    "092", "093", "094", "095", "096", "097", "098", "099", "100", "101", "103", "104", "105", "106", "107", "108", "109", "110", "111", "113",
    "114", "119", "120", "121",
    "122", "123", "124", "125", "126", "127", "129", "131", "132", "133", "134", "137", "140", "141", "142", "143", "144", "145", "146", "147",
    "148", "149", "150", "171",
    "172", "173", "176", "178", "179", "183", "185", "189", "190", "191", "192", "193", "194", "195", "196", "197", "198", "199", "200", "201",
    "202", "203", "204", "205",
    "206", "207", "208", "209", "210", "211", "212", "213", "214", "220", "221", "222", "223", "224", "225", "226", "227", "228", "229", "230",
    "231", "232", "233", "234",
    "235", "236", "237", "238", "239", "240", "241", "242", "243", "244", "245", "246", "247", "248", "249", "250", "251", "252", "253", "254",
    "255", "256", "257", "258",
    "259", "260", "261", "262", "263", "264", "265", "266", "267", "268", "269", "270", "271", "272", "273", "274", "275", "276", "277", "278",
    "279", "280", "281", "282",
    "283", "284", "285", "286", "287", "288", "289", "290", "291", "292", "293", "294", "295", "296", "297", "298", "299", "300", "301", "302",
    "303", "304", "305", "306",
    "307", "308", "309", "310", "311", "312", "313", "314", "315", "316", "317", "318", "319", "320", "321", "322", "323", "324", "325", "326",
    "327", "328", "329", "330",
    "331", "332", "333", "334", "335", "336", "337", "338", "339", "340", "341", "342", "343", "344", "345", "346", "347", "348", "349", "350",
    "351", "352", "353", "354",
    "355", "356", "357", "358", "359", "360", "361", "362", "363", "364", "365", "366", "367", "368", "369", "370", "371", "372", "373", "374",
    "375", "376", "377", "378",
    "379", "380", "381", "382", "383", "384", "385", "386", "387", "388", "389", "390", "391", "392", "393", "394", "395", "396", "397", "398",
    "399", "400", "401", "402",
    "403", "404", "405", "406", "407", "408", "409", "410", "411", "412", "413", "414", "415", "416", "417", "418", "419", "420", "421", "422",
    "423", "424", "425", "426",
    "427", "428", "429", "430", "431", "432", "433", "434", "435", "436", "437", "438", "439", "440", "441", "442", "443", "444", "445", "446",
    "447", "448", "449", "450",
    "451", "452", "453", "454", "455", "456", "457", "458", "459", "460", "461", "462", "463", "464", "465", "466", "467", "468", "469", "470",
    "471", "472", "473", "474",
    "475", "476", "477", "478", "479", "480", "481", "482", "483", "484", "485", "486", "487", "488", "489", "490", "491", "492", "493", "494",
    "495", "496", "497", "498",
    "499", "500", "501", "504", "507", "508", "509", "510", "512", "513", "514", "515", "521", "522", "523", "524", "525", "530", "541", "546",
    "548", "549", "550", "551",
    "552", "553", "554", "555", "556", "557", "558", "559", "560", "562", "563", "564", "565", "566", "567", "568", "569", "570", "571", "572",
    "573", "574", "575", "576",
    "577", "578", "579", "581", "583", "585", "586", "587", "588", "590", "591", "592", "593", "594", "595", "596", "597", "598", "599", "600",
    "601", "605", "607", "610",
    "611", "612", "613", "624", "625", "630", "631", "634", "635", "636", "638", "640", "642", "643", "645", "646", "647", "648", "649", "651",
    "652", "653", "657", "658",
    "663", "664", "667", "668", "671", "672", "673", "674", "675", "676", "677", "678", "679", "680", "682", "683", "684", "685", "686", "687",
    "688", "693", "694", "696",
    "700", "701", "702", "703", "704", "705", "706", "707", "708", "709", "719", "722", "725", "726", "727", "728", "729", "730", "731", "732",
    "733", "734", "735", "736",
    "737", "738", "739", "740", "741", "742", "743", "744", "745", "746", "747", "748", "749", "750", "751", "752", "753", "754", "755", "756",
    "757", "758", "759", "760",
    "761", "762", "763", "764", "765", "766", "767", "768", "769", "770", "771", "772", "773", "774", "775", "776", "777", "778", "779", "780",
    "781", "782", "783", "784",
    "785", "786", "787", "788", "789", "790", "791", "792", "793", "794", "795", "796", "797", "798", "799", "800", "801", "802", "803", "804",
    "805", "806", "807", "808",
    "809", "810", "811", "812", "813", "814", "815", "816", "817", "823", "825", "826", "828", "830", "831", "832", "833", "834", "835", "836",
    "837", "838", "839", "840",
    "844", "845", "850", "851", "852", "853", "859", "860", "862", "863", "865", "866", "868", "871", "873", "876", "877", "878", "879", "880",
    "881", "883", "884", "887",
    "888", "890", "891", "892", "893", "894", "895", "896", "897", "898", "899", "906", "908", "910", "911", "913", "914", "915", "916", "920",
    "922", "923", "924", "926",
    "927", "928", "929", "930", "931", "934", "936", "939", "940", "941", "942", "945", "949", "950", "951", "952", "953", "954", "955", "956",
    "957", "958", "959", "960",
    "961", "963", "966", "967", "968", "969", "971", "973", "974", "975", "976", "978", "979", "980", "981", "982", "983", "984", "985", "986",
    "987", "988"
  ]

  return listOfBankcodes[Math.floor(Math.random() * listOfBankcodes.length)];
}

function generateRandomBic() {
  //https://www.nbb.be/en/payments-and-securities/payment-standards/bank-identification-codes
  var listOfBics = ["ABERBE22", "ABNABE2AIDJ", "ABNABE2AIPC", "ABNABE2AXXX", "ADIABE22", "ARSPBE22", "AXABBE22", "BARBBEBB", "BARCBEBB", "BBRUBEBB",
    "BBVABEBB", "BCDMBEBB", "BCMCBEBB", "BIBLBE21", "BKCHBEBB", "BKIDBE22", "BLUXBEBB", "BMEUBEB1", "BMPBBEBB", "BMPBBEBBVOD", "BNAGBEBB",
    "BOFABE3X", "BOTKBEBX", "BPOTBEB1", "BSCHBEBB", "BSCHBEBBRET", "BYBBBEBB", "CBPXBE99", "CEKVBE88", "CEPABEB2", "CFFRBEB1", "CHASBEBX",
    "CITIBEBX", "CLIQBEB1", "CMCIBEB1BTB", "CMCIBEB1CIC", "COBABEBX", "CPHBBE75", "CREGBEBB", "CRLYBEBB", "CTBKBEBX", "CVMCBEBB", "DEGRBEBB",
    "DELEBE22", "DEUTBEBE", "DHBNBEBB", "DIERBE21", "DNIBBE21", "EBPBBEB1", "ENIBBEBB", "EPBFBEBB", "EURBBE99", "FMMSBEB1", "FVLBBE22", "FXBBBEBB",
    "GEBABEBB", "GKCCBEBB", "GOCFBEB1", "HABBBEBB", "HSBCBEBB", "ICBKBEBB", "IRVTBEBB", "ISAEBEBB", "JPMGBEBB", "JVBABE22", "KEYTBEBB", "KREDBEBB",
    "LOCYBEBB", "MBWMBEBB", "MGTCBEBE", "MHCBBEBB", "MTPSBEBB", "NBBEBEBB203", "NBBEBEBBHCC", "NEECBEB2", "NICABEBB", "OONXBEBB", "PANXBEB1",
    "PARBBEBZMDC", "PCHQBEBB", "PESOBEB1", "PRIBBEBB", "PUILBEBB", "RABOBE22", "RABOBE23", "RCBPBEBB", "SBINBE2X", "SGABBEB2", "SHIZBEBB",
    "SMBCBEBB", "TRIOBEBB", "TRWIBEB1", "TUNZBEB1", "UTWBBEBB", "VAPEBE22", "VDSPBE91", "VPAYBE21", "WAFABEBB"
  ]

  return listOfBics[Math.floor(Math.random() * listOfBics.length)];
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

function shouldDisplayGenerator(generatorRegion, region = getRegion()) {
  if (region == "*")
    return true;
  if (generatorRegion == "-" || generatorRegion == "*")
    return true;
  return generatorRegion == region;
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
    storageCache[key] = value;
  } catch (e) {
    console.log(e);
  }
}

function getRegion() {
  return storageCache.settingRegion;
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
      "settingContextActionInjection",
      "settingRegion"
    ], function(
      result) {
      if (typeof result.settingContextActionInjection == 'undefined')
        result.settingContextActionInjection = true;
      if (typeof result.settingRegion == 'undefined')
        result.settingRegion = "BE";

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