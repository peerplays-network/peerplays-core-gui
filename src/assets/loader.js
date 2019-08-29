/* eslint-disable */
// require('file-loader?name=index.html!../../public/index.html');
// require('file-loader?name=favicon.ico!./favicon.ico');
require('file-loader?name=dictionary.json!../common/dictionary_en.json');
require('babel-polyfill');
require('whatwg-fetch');
require('indexeddbshim');
require('./asset-symbols/symbols.js');
require('./images/images.js');
require('./locales/locales.js');


// require("./stylesheets/app.scss");
// require("file-loader?name=favicon.ico!./favicon.ico");
// require("babel-polyfill");
// require("whatwg-fetch");
// require("indexeddbshim");
// require("./asset-symbols/symbols.js");
// require("./images-loader.js");
// require("./language-dropdown/flags.js");