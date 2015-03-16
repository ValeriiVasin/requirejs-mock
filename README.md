# About
`requirejs-mock` is a dependency injector for RequireJS modules.

## Injector creation
First of all you need to create an injector that will allow you to mock your modules dependencies.

```js
var requirejs = require('requirejs');

// Get Injector and provide requirejs to it
var Injector = require('requirejs-mock').provide(requirejs);

// instantiate injector (default context)
var injector = Injector.create();

// instantiate injector for non-default context
var otherInjector = Injector.create({ context: 'specs' });
```

## Maps
If you have a module mock in a separate file and just need to replace module with it - you should use module mapping.

```js
describe('Remapping dependencies', function() {
  var injector;

  beforeEach(function() {
    injector = Injector.create();

    // remap module A to its mock
    injector.map('module/a', 'mock/a');
    injector.map('module/b', 'mock/b');

    // or as an object
    injector.map({
      'module/a': 'mock/a',
      'module/b': 'mock/b'
    });

    // load module C (that depends on A and B)
    var c = injector.require('module/c');
  });
});
```

## Mocks
If you do not have a prepared module mock in a separate file and want to do it in the runtime - use mocks. You could provide any value (function, object, number, string etc) as a result of mocked module.

```js
describe('Mocks', function() {
  var injector;

  beforeEach(function() {
    // provide a value that will be returned as a module
    injector.mock('module/a', valueA);
    injector.mock('module/b', valueB);

    injector.mock({
      'module/a': valueA,
      'module/b': valueB
    });
  });

  it('should work', function() {
    expect(injector.require('module/a')).toBe(valueA);
    expect(injector.require('module/b')).toBe(valueB);
  });
});
```

## Destroying injector
You should always destroy injector to cleanup after it.

```js
afterEach(function() {
  // cleanup
  injector.destroy();
});
```

# How it works
TBD

