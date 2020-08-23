document.addEventListener('DOMContentLoaded', function() {
  setupGeneratingButton("btn-uuid","uuid",function() { getRandomUuid(); }  );
  setupGeneratingButton("btn-rrn","nationalIdentificationNumber",function() { getRandomRrnNumber(); } );
  setupGeneratingButton("btn-companynbr","companyNumber",function() { getRandomCompanyNumber(); } );
  setupGeneratingButton("btn-rsznbr","rszNumber",function() { getRandomRszNumber(); } );
  setupGeneratingButton("btn-iban","iban",function() { getRandomIban(); } );

  initUiValue("status", "defaultStatus");
  initUiValue("title", "pluginname");
}, false);

function setupGeneratingButton(elementId, messageId, func) {
  var btn = document.getElementById(elementId);
  btn.addEventListener('click', func , false);
  btn.addEventListener('mouseout', function() { resetStatus(); }, false);
  initUiValue(elementId, messageId);
}

function initUiValue(elementId, messageId) {
  try {
    document.getElementById(elementId).innerHTML = chrome.i18n.getMessage(messageId);
  }
  catch(err) {
    ; //[Uncaught TypeError: Cannot read property 'getMessage' of undefined] if webpage loaded directly
  }
}

//https://www.uuidgenerator.net/
function getRandomUuid() {
	var uuid = "00000000-0000-0000-0000-000000000000"
	copy(uuid);
	setStatus(uuid);
}
//https://nl.wikipedia.org/wiki/RSZ-nummer
function getRandomRszNumber() {
	var base = randomIntFromInterval(1000,1999999);
	var control = 96- (100*base)%97;
	var rsznbr = ''.concat( 100 * base + control).padStart(9, "0");

	copy(rsznbr);
	setStatus(rsznbr);
}

//https://nl.wikipedia.org/wiki/Kruispuntbank_van_Ondernemingen
function getRandomCompanyNumber() {
	var base = randomIntFromInterval(2000000,19999999);
	var control = 97 - base % 97;
	var companynbr = ''.concat( 100 * base + control).padStart(10, "0");

	copy( companynbr);
	setStatus(companynbr);
}

//https://nl.wikipedia.org/wiki/Rijksregisternummer
function getRandomRrnNumber() {
	var year = randomIntFromInterval(1920,2019);
	var month = randomIntFromInterval(1,12);
	var day = randomIntFromInterval(1,28);
	var counter = randomIntFromInterval(1,999);

	var base = ((year%100)*10000000) + (month*100000) + (day*1000) + (counter);
	var checksum = year>=2000 ? (97 - (base+2000000000) % 97) : (97 - base % 97);
	var rrn = ''.concat( 100 * base + checksum).padStart(11, "0");

	copy(rrn);
	setStatus(rrn);
}

//https://www.iban.com/calculate-iban https://nl.wikipedia.org/wiki/International_Bank_Account_Number
function getRandomIban() {
	var country = "BE";
	var bankcode = randomIntFromInterval(0,999); //https://www.nbb.be/en/payments-and-securities/payment-standards/bank-identification-codes
	var accountNbr = randomIntFromInterval(0,9999999);

  var nationalCheck = (10000000*bankcode + accountNbr)%97==0 ? 97 : (10000000*bankcode + accountNbr)%97;
	var checksum = 98 - modulo(''+(1000000000000000*bankcode + 100000000*accountNbr + nationalCheck*1000000 + 111400), ''+97);
	var iban = country.concat(''.concat(1000000000000*checksum + 1000000000*bankcode + 100*accountNbr + nationalCheck).padStart(14,"0"));

	copy(iban);
	setStatus(iban);
}

function resetStatus(text) {
  try {
    var str = chrome.i18n.getMessage("defaultStatus");
  }
  catch(err) {
    var str = 'Click a number-type to generate it';
  }

  var stat = document.getElementById('status');
	stat.innerHTML = str;
	stat.classList.add("list-group-item-secondary");
	stat.classList.remove("list-group-item-success");
}

function setStatus(text) {
  try {
    var str = chrome.i18n.getMessage("copiedToClipboard",[text]);
  }
  catch(err) {
    var str = text + ' copied to clipboard';
  }

  var stat = document.getElementById('status');
	stat.innerHTML = str;
	stat.classList.add("list-group-item-success");
	stat.classList.remove("list-group-item-secondary");
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

function modulo (divident, divisor) {
  var cDivident = '';
  var cRest = '';

  for (var i in divident ) {
    var cChar = divident[i];
    var cOperator = cRest + '' + cDivident + '' + cChar;

    if ( cOperator < parseInt(divisor) ) {
            cDivident += '' + cChar;
    } else {
            cRest = cOperator % divisor;
            if ( cRest == 0 ) {
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
