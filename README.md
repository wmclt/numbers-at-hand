**This is a fork of philipdeherdt/numbers-at-hand in order to add Firefox support.**

# Numbers at hand
A Chrome extension that allows you to generate randomized valid numbers that can identify people, companies, etc.
Suggested use case: generate randomized test-data that passes validation checks.

## Functionality
Generate randomized valid Belgian numbers for these types:
* National Identification Number _(Rijksregisternummer / Numéro du Registre national / Nationalversicherungsnummer)_
* Enterprise number _(Ondernemingsnummer / Numéro d'entreprise / Unternehmensnummer)_
* VAT number _(BTW-nummer / Numéro de TVA / Umsatzsteuer-Identifikationsnummer)_
* Establishment unit number _(Vestigingseenheidsnummer / Numéro d’unité d’établissement / Niederlassungseinheitsnummer)_
* NSSO number _(RSZ-nummer / Numéro ONSS / LSS-Nummer)_
* Number plate _(Nummerplaat / Plaque d'immatriculation / Kfz-Kennzeichen)_
* IBAN
* BIC

Generate randomized valid Dutch numbers for these types:
* National Identification Number _(Burgerservicenummer)_

Generate other useful strings:
* Nil UUID / randomized v4 UUID
* Current UTC datetime (ISO 8601)


How to use this extension:
* In any input-field : right-click and select a number-type to fill it in directly and/or copy it to your clipboard
* Through the extension popup : select a number-type to copy it to your clipboard

Options can be configured through the popup and the context-menu:
* Numbers can be generated either with or without the default punctuation
* Switch between BE and NL region
* The popup can be shown in Dark or Light mode
* Choose what happens when generating a number through context-menu: inject and/or copy to clipboard


## How to use this code

Install the extension from the [Chrome web store](https://chrome.google.com/webstore/detail/numbers-at-hand/jncgcehddiijpaiopleohniplpafmmio)

## Similar tools

If you're looking for generators for other kinds of randomized test-data, you might like these:
* [Bug Magnet](https://bugmagnet.org/)
* [Mobilefish Test data generator](https://www.mobilefish.com/services/random_test_data_generator/random_test_data_generator.php)
