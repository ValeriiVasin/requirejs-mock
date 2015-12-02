// Karma serves files under /base, which is the basePath from your config file
var REQUIREJS_BASE_URL = '/base/spec/fixtures/';

Injector.provide(require);

function configure(requirejs, baseUrl) {
  requirejs.config({
    baseUrl: baseUrl
  });

  requirejs.config({
    context: 'other',
    baseUrl: baseUrl
  });

  requirejs.config({
    context: 'withMap',
    baseUrl: baseUrl,
    map: {
      '*': {
        'module/a': 'mock/a'
      }
    }
  });

  requirejs.config({
    context: 'withPath',
    baseUrl: baseUrl,
    paths: {
      m: 'mock',
      o: 'module'
    }
  });
}

configure(require, REQUIREJS_BASE_URL);

// enable es6 Promise polyfill for PhantomJS2
ES6Promise.polyfill();

// Helpers
beforeEach(function() {
  this.Injector = Injector;

  this.injector = this.Injector.create();
  this.otherInjector = Injector.create({ context: 'other' });
  this.injectorWithPath = Injector.create({ context: 'withPath' });
  this.injectorWithMap = this.Injector.create({ context: 'withMap' });

  /**
   * Requires modules using the injector and checks afterwards
   *
   * for Browser env it is async
   *
   * @param  {Injector} injector Injector instance
   * @param  {Object} mapping    Module/value mapping
   * @return {Promise}           Promise that will be resolved on done
   */
  this.requireAndCheck = function(injector, mapping) {
    return new Promise(function(resolve) {
      var modules = Object.keys(mapping);

      injector.require(modules, function() {
        var values = Array.prototype.slice.call(arguments);

        modules.forEach(function(module, index) {
          expect(values[index]).toBe(mapping[modules[index]]);
        });

        resolve();
      });
    });
  };
});

afterEach(function() {
  this.injector.destroy();
  this.injectorWithMap.destroy();
  this.injectorWithPath.destroy();
});

// let other files to load
setTimeout(window.__karma__.start, 0);
