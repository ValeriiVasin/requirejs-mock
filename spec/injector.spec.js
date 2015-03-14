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
    injector = new Injector();
    injectorWithMap = new Injector({ context: 'withMap' });
  });

  afterEach(function() {
    injector.release();
    injectorWithMap.release();
  });

  describe('Contstructor', function() {
    beforeEach(function() {
      Injector.requirejs = null;
    });

    afterEach(function() {
      Injector.requirejs = requirejs;
    });

    it('should throw if requirejs has not been provided', function() {
      function initInjector() {
        return Injector.create();
      }

      expect(initInjector).toThrow();
    });

    it('should throw if we are going to use non-exited context for injector', function() {
      function initInjector() {
        Injector.create({ context: 'nonExistingContext' });
      }

      expect(initInjector).toThrow();
    });
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

    it('works on nested require calls', function() {
      injector.map({
        'module/a': 'mock/a',
        'module/b': 'mock/b'
      });

      expect(injector.require('module/c')).toBe('mockAmockB');
    });

    it('works on nested require calls with relative path', function() {
      injector.map({
        'module/a': 'mock/a',
        'module/b': 'mock/b'
      });

      expect(injector.require('module/c_local')).toBe('mockAmockB');
    });
  });

  describe('Mocks', function() {
    var otherInjector;

    beforeEach(function() {
      // create `other` context
      Injector.Util.createContext('other', { extend: Injector.DEFAULT_CONTEXT });
      otherInjector = Injector.create({ context: 'other' });
    });

    afterEach(function() {
      otherInjector.release();
    });

    it('mock with a simple value', function() {
      injector.mock('module/a', 15);
      expect(injector.require('module/a')).toBe(15);
    });

    it('nested requires with simple value', function() {
      injector.mock('module/a', 'A');
      injector.mock('module/b', 'B');

      expect(injector.require('module/c')).toBe('AB');
    });

    it('mock different contexts at a time', function() {
      injector.mock('module/a', 'A');
      injector.mock('module/b', 'B');

      otherInjector.mock('module/a', 'C');
      otherInjector.mock('module/b', 'D');

      expect(injector.require('module/c')).toBe('AB');
      expect(otherInjector.require('module/c')).toBe('CD');
    });

    it('mock mapped modules');

    it('mock with an object');

    it('mock with a function');
  });
});
