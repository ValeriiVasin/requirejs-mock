'use strict';

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
    injector.destroy();
    injectorWithMap.destroy();
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

    it('allows remap during the execution', function() {
      injector.map('module/a', 'mock/a');
      expect(injector.require('module/a')).toBe('mockA');

      injector.map('module/a', 'mock/b');
      expect(injector.require('module/a')).toBe('mockB');
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

    it('throws if trying to map mocked before module', function() {
      function mockAndMap() {
        injector.mock('module/a', 123);
        injector.map('module/a', 'mock/a');
      }

      expect(mockAndMap).toThrow();
    });
  });

  describe('Unmapping', function() {
    it('unmap', function() {
      injector.map('module/b', 'mock/b');
      expect(injector.require('module/b')).toBe('mockB');
      injector.unmap('module/b');
      expect(injector.require('module/b')).toBe('b');
    });

    it('unmap to original mapping', function() {
      injectorWithMap.map('module/a', 'mock/b');
      expect(injectorWithMap.require('module/a')).toBe('mockB');
      injectorWithMap.unmap('module/a');
      expect(injectorWithMap.require('module/a')).toBe('mockA');
    });

    it('unmap few modules at once', function() {
      injector.map({
        'module/a': 'mock/a',
        'module/b': 'mock/b'
      });

      injector.unmap('module/a', 'module/b');

      expect(injector.require('module/a')).toBe('a');
      expect(injector.require('module/b')).toBe('b');
    });

    it('unmap all previously mapped modules', function() {
      injector.map({
        'module/a': 'mock/a',
        'module/b': 'mock/b'
      });

      injector.unmap();

      expect(injector.require('module/a')).toBe('a');
      expect(injector.require('module/b')).toBe('b');
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
      otherInjector.destroy();
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

    it('mock with an object', function() {
      var obj = { toString: function() { return 'O'; } };

      injector.mock('module/a', obj);
      expect(injector.require('module/a')).toBe(obj);
    });

    it('mock with a function', function() {
      function f() {}

      injector.mock('module/a', f);
      expect(injector.require('module/a')).toBe(f);
    });

    it('supports multiple mocks notations', function() {
      injector.mock({
        'module/a': 'hello',
        'module/b': 'world'
      });

      expect(injector.require('module/a')).toBe('hello');
      expect(injector.require('module/b')).toBe('world');
    });

    it('throws error if incorrect mock syntax is used for mock', function() {
      function createMock() {
        injector.mock(123);
      }

      expect(createMock).toThrow();
    });

    it('mock mapped (by configuration) modules', function() {
      injectorWithMap.mock('module/a', 123);
      expect(injectorWithMap.require('module/a')).toBe(123);
    });

    it('possible to mock mocked before module', function() {
      pending('Not supported yet.');

      injector.mock('module/a', 123);
      expect(injector.require('module/a')).toBe(123);

      injector.mock('module/a', 456);
      expect(injector.require('module/a')).toBe(456);
    });

    it('throws error if trying to mock and map in same time', function() {
      function mapAndMock() {
        injector.map('module/a', 'mock/a');
        injector.mock('module/a', 123);
      }

      expect(mapAndMock).toThrow();
    });
  });

  describe('Unmock', function() {
    pending('Implementation is not ready');

    it('restores module value', function() {
      injector.mock('module/a', 123);
      injector.unmock('module/a');

      expect(injector.require('module/a')).toBe('a');
    });

    it('unmocks mapped module', function() {
      injector.mock('module/a', 123);
      injector.unmock('module/a');

      expect(injector.require('module/a')).toBe('mockA');
    });

    it('mocking few times does not affect mapping', function() {
      injectorWithMap.mock('module/a', 123);
      injectorWithMap.mock('module/a', 456);
      injectorWithMap.unmock('module/a');

      expect(injectorWithMap.require('module/a')).toBe('mockA');
    });
  });
});
