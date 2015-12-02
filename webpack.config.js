module.exports = {
  entry: {
    'injector': './src/injector'
  },
  output: {
    path: 'build',
    filename: '[name].js',
    library: 'Injector',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
    ]
  }
};
