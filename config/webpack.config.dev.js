const chalk = require('chalk');
const path = require('path');
const paths = require('./paths');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const getClientEnvironment = require('./env');

// BASE APP DIR
const root_dir = path.resolve(__dirname, '..');
const Config = require('./Config');

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
var publicPath = '/';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
var publicUrl = '';
// Get environment variables to inject into our app.
var env = getClientEnvironment(publicUrl);

// DIRECTORY CLEANER
var cleanDirectories = ['build'];

// GLOBAL VAR DEFINE
var define = {
  APP_PACKAGE_VERSION: JSON.stringify(Config.APP_PACKAGE_VERSION),
  SOFTWARE_UPDATE_REFERENCE_ACCOUNT_NAME: JSON.stringify(
    Config.SOFTWARE_UPDATE_REFERENCE_ACCOUNT_NAME
  ),
  APP_VERSION: JSON.stringify(Config.APP_VERSION),
  __ELECTRON__: false,
  CORE_ASSET: JSON.stringify(Config.CORE_ASSET),
  BLOCKCHAIN_URL: JSON.stringify(Config.BLOCKCHAIN_URLS),
  FAUCET_URL: JSON.stringify(Config.FAUCET_URLS),
  BITSHARES_WS: JSON.stringify(Config.BITSHARES_WS)
};

// COMMON PLUGINS
var plugins = [
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.DefinePlugin(define),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('development')
    }
  }),
  // Generates an `index.html` file with the <script> injected.
  new HtmlWebpackPlugin({
    inject: true,
    template: paths.appHtml
  }),
  // Makes some environment variables available in index.html.
  // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
  // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
  // In development, this will be an empty string.
  new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
  new webpack.HotModuleReplacementPlugin(),
  new CleanWebpackPlugin(),
  new webpack.ProgressPlugin((percentage, msg) => {
    process.stdout.write(chalk.green(
      (percentage * 100).toFixed(2) + '% ' + msg + '                 \033[0G'
    ));
  })
];

module.exports = {
  entry: [
    require.resolve('react-dev-utils/webpackHotDevClient'),
    require.resolve('./polyfills'),
    paths.appIndexJs
  ],
  mode: 'development',
  devtool: 'source-map',
  module: {
    rules: [
      // {
      //   test: /\.(js|jsx)$/,
      //   enforce: 'pre',
      //   loader: 'eslint-loader',
      //   include: paths.appSrc,
      //   exclude: /node_modules/,
      //   options: {
      //     emitError: true,
      //   },
      // },
      {
        test: /\.jsx$/,
        include: [
          paths.appSrc,
          path.join(root_dir, 'node_modules/react-foundation-apps')
        ],
        loaders: ['babel-loader']
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/, paths.appNodeModules],
        loader: 'babel-loader',
        query: {
          compact: false,
          cacheDirectory: true
        }
      },
      {
        type: 'javascript/auto',
        test: /\.json/,
        loader: 'json-loader',
        exclude: [
          paths.locales
        ]
      },
      {
        test: /\.coffee$/,
        loader: 'coffee-loader'
      },
      {
        test: /\.(coffee\.md|litcoffee)$/,
        loader: 'coffee-loader?literate'
      },
      {
        test: /\.scss$/,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          {
            // Transpile CSS
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                // Transform @imports
                require('postcss-import')(),
                // Polyfills to support multiple browsers based on hbrowserslist in package.json
                require('postcss-preset-env')()
              ]
            }
          },
          // Compiles Sass to CSS
          'sass-loader'
        ]
      },
      {
        test: /(\.png$)/,
        loader: 'url-loader?limit=100000',
        exclude: [paths.assetSymbols, paths.assetImages]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
          `image-webpack?${JSON.stringify({
            bypassOnDebug: true,
            optipng: {
              optimizationLevel: true
            },
            gifsicle: {
              interlaced: true
            }
          })}`
        ],
        exclude: [
          path.join(root_dir, 'src/assets/images')
        ]
      },
      {
        test: /\.woff$/,
        loader: 'url-loader?limit=100000&mimetype=application/font-woff'
      },
      {
        test: /.*\.svg$/,
        loaders: ['svg-inline-loader', 'svgo-loader'],
        exclude: [paths.rps]
      },
      {
        test: /\.md/,
        loader: 'html-loader?removeAttributeQuotes=false'
      }
    ],
    noParse: /node_modules\/build/
  },
  output: {
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: paths.appBuild,
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: 'static/js/bundle.js',
    // This is the URL that app is served from. We use "/" in development.
    publicPath: publicPath
  },
  resolve: {
    extensions: ['.js', '.jsx', '.coffee', '.json']
  },
  plugins: plugins
};