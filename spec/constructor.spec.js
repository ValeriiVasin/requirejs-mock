'use strict';

describe('Contstructor', function() {
  it('should throw if requirejs has not been provided', function() {
    var _requirejs;

    function initInjector() {
      _requirejs = this.Injector.requirejs;
      this.Injector.requirejs = null;
      this.Injector.create();
    }

    expect(initInjector.bind(this)).toThrow();
    this.Injector.provide(_requirejs);
  });

  it('should throw if we are going to use non-exited context for injector', function() {
    function initInjector() {
      this.Injector.create({ context: 'nonExistingContext' });
    }

    expect(initInjector.bind(this)).toThrow();
  });
});
