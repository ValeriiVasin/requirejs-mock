'use strict';

describe('Map', function() {
  it('single module mapping', function(done) {
    this.injector.map('module/a', 'mock/a');

    this.requireAndCheck(this.injector, {
      'module/a': 'mockA'
    }).then(done);
  });

  it('multiple modules mapping', function(done) {
    this.injector.map({
      'module/a': 'mock/a',
      'module/b': 'mock/b'
    });

    this.requireAndCheck(this.injector, {
      'module/a': 'mockA',
      'module/b': 'mockB'
    }).then(done);
  });

  it('not overrides existed mapping', function(done) {
    this.injectorWithMap.map('module/b', 'mock/b');

    this.requireAndCheck(this.injectorWithMap, {
      'module/a': 'mockA',
      'module/b': 'mockB'
    }).then(done);
  });

  it('allows remap during the execution', function(done) {
    this.injector.map('module/a', 'mock/a');

    this.requireAndCheck(this.injector, {
      'module/a': 'mockA'
    }).then(function() {
      this.injector.map('module/a', 'mock/b');

      return this.requireAndCheck(this.injector, {
        'module/a': 'mockB'
      });
    }.bind(this)).then(done);
  });

  it('works on nested require calls', function(done) {
    this.injector.map({
      'module/a': 'mock/a',
      'module/b': 'mock/b'
    });

    this.requireAndCheck(this.injector, {
      'module/c': 'mockAmockB'
    }).then(done);
  });

  it('works on nested require calls with relative path', function(done) {
    this.injector.map({
      'module/a': 'mock/a',
      'module/b': 'mock/b'
    });

    this.requireAndCheck(this.injector, {
      'module/c_local': 'mockAmockB'
    }).then(done);
  });

  it('throws if trying to map mocked before module', function() {
    function mockAndMap() {
      this.injector.mock('module/a', 123);
      this.injector.map('module/a', 'mock/a');
    }

    expect(mockAndMap.bind(this)).toThrow();
  });
});
