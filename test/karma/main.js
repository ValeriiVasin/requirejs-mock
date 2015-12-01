// Karma serves files under /base, which is the basePath from your config file
var REQUIREJS_BASE_URL = '/base/spec/fixtures/';

// configure default context
require.config({
  baseUrl: REQUIREJS_BASE_URL
});

require.config({
  context: 'withMap',
  baseUrl: REQUIREJS_BASE_URL,
  map: {
    '*': {
      'module/a': 'mock/a'
    }
  }
});

require.config({
  context: 'withPath',
  baseUrl: REQUIREJS_BASE_URL,
  paths: {
    m: 'mock',
    o: 'module'
  }
});

Injector.provide(require);

// Helpers
beforeEach(function() {
  this.injector = Injector.create();
  this.injectorWithMap = Injector.create({ context: 'withMap' });
  this.injectorWithPath = Injector.create({ context: 'withPath' });

  // general require interface
  this.require = function(injector, modules) {
    return new Promise(function(resolve, reject) {
      injector.require(modules, function() {
        console.log(arguments);
        resolve.apply(null, arguments);
      });
    });
  }
});

afterEach(function() {
  this.injector.destroy();
  this.injectorWithMap.destroy();
  this.injectorWithPath.destroy();
});

// let other files to load
setTimeout(window.__karma__.start, 0);
