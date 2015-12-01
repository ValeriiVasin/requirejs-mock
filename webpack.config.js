module.exports = {
  entry: {
    'injector.build': './injector'
  },
  output: {
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
