process.traceDeprecation = false;
const chalk = require('chalk');
const path = require('path');
const paths = require('./paths');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const Config = require('./Config');

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
var publicPath = paths.servedPath;

// GIT HASH DETAILS

let commitHash = require('child_process')
  .execSync('git log -1 origin/master..HEAD ')
  .toString().trim()

// GLOBAL VAR DEFINE

var define = {
  APP_PACKAGE_VERSION: JSON.stringify(Config.APP_PACKAGE_VERSION),
  SOFTWARE_UPDATE_REFERENCE_ACCOUNT_NAME: JSON.stringify(
    Config.SOFTWARE_UPDATE_REFERENCE_ACCOUNT_NAME
  ),
  APP_VERSION: JSON.stringify(Config.APP_VERSION),
  __ELECTRON__: true,
  CORE_ASSET: JSON.stringify(Config.CORE_ASSET),
  BLOCKCHAIN_URL: JSON.stringify(Config.BLOCKCHAIN_URLS),
  FAUCET_URL: JSON.stringify(Config.FAUCET_URLS),
  BITSHARES_WS: JSON.stringify(Config.BITSHARES_WS)
};

// COMMON PLUGINS
var plugins = [
  new HtmlWebpackPlugin({
    inject: true,
    template: paths.appHtml,
    favicon: paths.appIco,
    minify: {
      removeComments: true,
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true
    }
  }),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.DefinePlugin(define),
  new CleanWebpackPlugin(),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    }
  }),
  new webpack.DefinePlugin({
    __COMMIT_HASH__: JSON.stringify(commitHash),
  }),
  new ManifestPlugin({fileName: 'asset-manifest.json'}),
  new webpack.ProgressPlugin((percentage, msg) => {
    process.stdout.write(chalk.green(
      (percentage * 100).toFixed(2) + '% ' + msg + '                 \033[0G'
    ));
  })
];

module.exports = {
  entry: [
    require.resolve('./polyfills'),
    paths.appIndexJs
  ],
  bail: true,
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      // {
      //   test: /\.(js|jsx)$/,
      //   enforce: 'pre',
      //   loader: 'eslint-loader',
      //   include: paths.appSrc
      // },
      {
        test: /\.jsx$/,
        include: [
          paths.appSrc,
          path.join(paths.appNodeModules, '/react-foundation-apps')
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
        query: {
          name: 'static/media/[name].[hash:8].[ext]'
        },
        exclude: [paths.assetSymbols, paths.assetImages]
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
          {
            loader: 'image-webpack',
            options: {
              bypassOnDebug: true,
              optipng: {
                optimizationLevel: true
              },
              gifsicle: {
                interlaced: true
              }
            }
          }
        ],
        exclude: [paths.assetImages]
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
    // The build folder
    path: paths.appBuild,
    // Generated JS file names (with nested folders).
    // There will be one main bundle, and one file per asynchronous chunk.
    // We don't currently advertise code splitting but Webpack supports it.
    filename: 'static/js/[name].[chunkhash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    // We inferred the "public path" (such as / or /my-project) from homepage.
    publicPath: publicPath
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.coffee', '.json']
  },
  plugins: plugins
};
