const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const globImporter = require('node-sass-glob-importer');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Determines the entry points for the webpack by looking at activity
// implementations in src/components/activities folder
const populateEntries = () => {

  // These are the non-activity bundles
  const initialEntries = {
    app: ['babel-polyfill', './src/phoenix/app.ts'],
    components: ['./src/components.tsx'],
    resourceeditor: ['./src/components/resource/ResourceEditorApp.tsx'],
    activityeditor: ['./src/components/activity/ActivityEditorApp.tsx'],
    authoring: ['./src/apps/AuthoringApp.tsx'],
    delivery: ['./src/apps/DeliveryApp.tsx'],
  };

  const manifests = glob.sync("./src/components/activities/*/manifest.json", {});

  const foundActivities = manifests.map((manifestPath) => {
    const manifest = require(manifestPath);
    const rootPath = manifestPath.substr(0, manifestPath.indexOf('manifest.json'));
    return {
      [manifest.id + '_authoring']: [rootPath + manifest.authoring.entry],
      [manifest.id + '_delivery']: [rootPath + manifest.delivery.entry],
    };
  });

  const themePaths = [
    ...glob.sync("./styles/themes/authoring/*.scss").map(p => ({ prefix: 'authoring_theme_', themePath: p })),
    ...glob.sync("./styles/themes/delivery/*.scss").map(p => ({ prefix: 'delivery_theme_', themePath: p })),
  ];

  const foundThemes = themePaths.map(({ prefix, themePath }) => {
    const name = path.basename(themePath, '.scss');
    return {
      [prefix + name]: themePath,
    };
  });

  // Merge the attributes of all found activities and the initialEntries
  // into one single object.
  const merged = [...foundActivities, ...foundThemes].reduce((p, c) => Object.assign({}, p, c), initialEntries);

  // Validate: We should have (2 * foundActivities.length) + number of keys in initialEntries
  // If we don't it is likely due to a naming collision in two or more manifests
  if (Object.keys(merged).length != Object.keys(initialEntries).length + (2 * foundActivities.length) + foundThemes.length) {
    throw new Error('Encountered a possible naming collision in activity manifests. Aborting.');
  }

  return merged;
};

module.exports = (env, options) => ({
  devtool: 'source-map',
  optimization: {
    chunkIds: "named",
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: "initial",
          name: "vendor",
          priority: 10,
          enforce: true
        }
      }
    },
    minimizer: [
      new UglifyJsPlugin({ cache: true, parallel: true, sourceMap: true }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  entry: populateEntries(),
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../priv/static/js')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.scss'],
    // Add webpack aliases for top level imports
    alias: {
      components: path.resolve(__dirname, 'src/components'),
      hooks: path.resolve(__dirname, 'src/hooks'),
      actions: path.resolve(__dirname, 'src/actions'),
      data: path.resolve(__dirname, 'src/data'),
      state: path.resolve(__dirname, 'src/state'),
      utils: path.resolve(__dirname, 'src/utils'),
      styles: path.resolve(__dirname, 'styles'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js(x?)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.ts(x?)$/, use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            },
          },
          { loader: 'ts-loader' }
        ], exclude: /node_modules/
      },
      {
        test: /\.[s]?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [
                  path.join(__dirname, 'src'),
                  path.join(__dirname, 'styles'),
                ],
                importer: globImporter(),
              },
              sourceMap: true
            }
          }
        ],
      },
      { test: /\.(png|gif|jpg|jpeg|svg)$/, use: 'file-loader' },
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      React: 'react',
    }),
    new MiniCssExtractPlugin({ filename: '../css/[name].css' }),
    new CopyWebpackPlugin([{ from: 'static/', to: '../' }]),
  ]
});