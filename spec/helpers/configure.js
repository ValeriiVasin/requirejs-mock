var requirejs = require('requirejs');
var Injector = require('../../dist/injector').provide(requirejs);

var REQUIREJS_BASE_URL = 'spec/fixtures/';

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

configure(requirejs, REQUIREJS_BASE_URL);

beforeEach(function() {
  this.Injector = Injector;

  this.injector = this.Injector.create();
  this.otherInjector = Injector.create({ context: 'other' });
  this.injectorWithPath = Injector.create({ context: 'withPath' });
  this.injectorWithMap = this.Injector.create({ context: 'withMap' });

  /**
   * Requires modules using the injector and checks afterwards
   *
   * for Node env it is sync
   *
   * @param  {Injector} injector Injector instance
   * @param  {Object} mapping    Module/value mapping
   * @return {Promise}           Promise that will be resolved on done
   */
  this.requireAndCheck = function(injector, mapping) {
    return new Promise(function(resolve) {
      Object.keys(mapping).forEach(function(module) {
        expect(injector.require(module)).toBe(mapping[module]);
      });

      resolve();
    });
  };
});

afterEach(function() {
  this.injector.destroy();
  this.injectorWithMap.destroy();
  this.injectorWithPath.destroy();
});
