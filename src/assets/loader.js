/* eslint-disable */
require('file-loader?name=dictionary.json!../common/dictionary_en.json');
require('babel-polyfill');
require('whatwg-fetch');
require('indexeddbshim');
require('./asset-symbols/symbols.js');
require('./images/images.js');
require('./locales/locales.js');