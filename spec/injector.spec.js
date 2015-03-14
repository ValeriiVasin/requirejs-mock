var requirejs = require('requirejs');
var Injector = require('../injector').provide(requirejs);

var REQUIREJS_BASE_URL = 'spec/fixtures/';

// configure default context
requirejs.config({
  baseUrl: REQUIREJS_BASE_URL
});

requirejs.config({
  context: 'withMap',
  baseUrl: REQUIREJS_BASE_URL,
  map: {
    '*': {
      'module/a': 'mock/a'
    }
  }
});

describe('Injector', function() {
  var injector;
  var injectorWithMap;

  beforeEach(function() {
    injector = new Injector(requirejs);
    injectorWithMap = new Injector(requirejs, { context: 'withMap' });
  });

  afterEach(function() {
    injector.release();
    injectorWithMap.release();
  });

  describe('Contexts', function() {
    it('should allow different contexts', function() {
      expect(injector.require('module/a')).toBe('a');
      expect(injectorWithMap.require('module/a')).toBe('mockA');
    });
  });

  describe('Mapping', function() {
    it('single module mapping', function() {
      injector.map('module/a', 'mock/a');
      expect(injector.require('module/a')).toBe('mockA');
    });

    it('multiple modules mapping', function() {
      injector.map({
        'module/a': 'mock/a',
        'module/b': 'mock/b'
      });

      expect(injector.require('module/a')).toBe('mockA');
      expect(injector.require('module/b')).toBe('mockB');
    });

    it('not overrides existed mapping', function() {
      injectorWithMap.map('module/b', 'mock/b');

      expect(injectorWithMap.require('module/a')).toBe('mockA');
      expect(injectorWithMap.require('module/b')).toBe('mockB');
    });

    it('unmaps to original', function() {
      pending('Implementation is not ready');

      injectorWithMap.map('module/a', 'mock/a');
      expect(injectorWithMap.require('module/a')).toBe('mockA');
      injectorWithMap.unmap('module/a');
      expect(injectorWithMap.require('module/a')).toBe('a');
    });
  });
});
