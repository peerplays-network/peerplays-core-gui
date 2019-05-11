/* eslint-disable */
require('public/index.html');
require('file?name=favicon.ico!./favicon.ico');
require('file?name=dictionary.json!../common/dictionary_en.json');
require('babel-polyfill');
require('whatwg-fetch');
require('indexeddbshim');
require('../../src/assets/asset-symbols/symbols.js.js.js');
require('./images/images.js.js');
require('./locales/locales.js.js');