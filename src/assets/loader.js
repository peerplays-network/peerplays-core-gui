/* eslint-disable */
require('file?name=index.html!../../public/index.html');
require('file?name=favicon.ico!./favicon.ico');
require('file?name=dictionary.json!../common/dictionary_en.json');
require('babel-polyfill');
require('whatwg-fetch');
require('indexeddbshim');
require('./asset-symbols/symbols.js');
require('./images/images.js');
require('./locales/locales.js');