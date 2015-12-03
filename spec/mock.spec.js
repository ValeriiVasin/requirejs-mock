'use strict';

describe('Mock', function() {
  it('mock with a simple value', function(done) {
    this.injector.mock('module/a', 15);

    this.requireAndCheck(this.injector, {
      'module/a': 15
    }).then(done);
  });

  it('nested requires with simple value', function(done) {
    this.injector.mock('module/a', 'A');
    this.injector.mock('module/b', 'B');

    this.requireAndCheck(this.injector, {
      'module/c': 'AB'
    }).then(done);
  });

  it('mock different contexts at a time', function(done) {
    this.injector.mock('module/a', 'A');
    this.injector.mock('module/b', 'B');

    this.otherInjector.mock('module/a', 'C');
    this.otherInjector.mock('module/b', 'D');

    this.requireAndCheck(this.injector, {
      'module/c': 'AB'
    }).then(function() {
      return this.requireAndCheck(this.otherInjector, {
        'module/c': 'CD'
      });
    }.bind(this)).then(done);
  });

  it('mock with an object', function(done) {
    var obj = {
      toString: function() {
        return 'O';
      }
    };

    this.injector.mock('module/a', obj);

    this.requireAndCheck(this.injector, {
      'module/a': obj
    }).then(done);
  });

  it('mock with a function', function(done) {
    function f() {}

    this.injector.mock('module/a', f);

    this.requireAndCheck(this.injector, {
      'module/a': f
    }).then(done);
  });

  it('supports multiple mocks notations', function(done) {
    this.injector.mock({
      'module/a': 'hello',
      'module/b': 'world'
    });

    this.requireAndCheck(this.injector, {
      'module/a': 'hello',
      'module/b': 'world'
    }).then(done);
  });

  it('throws error if incorrect mock syntax is used for mock', function() {
    function createMock() {
      this.injector.mock(123);
    }

    expect(createMock.bind(this)).toThrow();
  });

  it('mock mapped (by configuration) modules', function(done) {
    this.injectorWithMap.mock('module/a', 123);

    this.requireAndCheck(this.injectorWithMap, {
      'module/a': 123
    }).then(done);
  });

  it('throws if mocking module that previously mocked', function() {
    function mockMocked() {
      this.injector.mock('module/a', 123);
      this.injector.mock('module/a', 456);
    }

    expect(mockMocked.bind(this)).toThrow();
  });

  it('throws error if trying to mock and map in same time', function() {
    function mapAndMock() {
      this.injector.map('module/a', 'mock/a');
      this.injector.mock('module/a', 123);
    }

    expect(mapAndMock.bind(this)).toThrow();
  });

  it('mock module cached before', function(done) {
    // cache module
    this.requireAndCheck(this.injector, {
      'module/a': 'a'
    }).then(function() {
      this.injector.mock('module/a', 123);

      return this.requireAndCheck(this.injector, {
        'module/a': 123
      });
    }.bind(this)).then(done);
  });
});
