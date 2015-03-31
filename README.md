# Requirejs-mock [![Build Status](https://travis-ci.org/ValeriiVasin/requirejs-mock.svg?branch=master)](https://travis-ci.org/ValeriiVasin/requirejs-mock) [![Coverage Status](https://coveralls.io/repos/ValeriiVasin/requirejs-mock/badge.svg)](https://coveralls.io/r/ValeriiVasin/requirejs-mock)

# About
**requirejs-mock** is a dependency injector for RequireJS modules. It allows you easily mock your module dependencies.

# Installation
```
npm install requirejs-mock --save-dev
```

# Usage example
```js
var requirejs = require('requirejs');
var Injector = require('requirejs-mock').provide(requirejs);

describe('Test', function() {
  var injector;
  var mockA;
  var mockB;

  beforeEach(function() {
    // instantiate injector
    injector = Injector.create();

    // remapping to mock module (defined in separate file)
    injector.map('module/a', 'mock/a');

    // if you need to check smth on mockA
    mockA = injector.require('module/a');

    // use direct mock
    mockB = { someAction: jasmine.createSpy() };
    injector.mock('module/b', mockB);
  });

  // cleanup
  afterEach(function() {
    injector.destroy();
  });

  it('should work', function() {
    // require module C that depends on A and B
    var c = injector.require('module/c');
    c.doSmth();

    expect(mockB.someAction).toHaveBeenCalled();
    expect(mockA.someAction).toHaveBeenCalled();
  });
});
```

# API
## Instantiate injector
First of all you need to create an injector that will allow you to mock your modules dependencies.

```js
var requirejs = require('requirejs');

// Get Injector and provide requirejs to it
var Injector = require('requirejs-mock').provide(requirejs);

beforeEach(function() {
  // instantiate injector (default context)
  var injector = Injector.create();

  // instantiate injector for non-default context
  var otherInjector = Injector.create({ context: 'specs' });
});
```

## Maps
### Setup maps
If you have a module mock in a separate file and just need to replace module with it - you should use module mapping.

```js
beforeEach(function() {
  var injector = Injector.create();

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
```

You could also provide different maps at the same time and restore original module value:

```js
beforeEach(function() {
  var injector = Injector.create();

  // get original module value
  var aOrig = injector.require('module/a');

  // remap module/a => mock/a
  injector.map('module/a', 'mock/a');

  var a = injector.require('module/a');
  console.log(a === aOrig); // => false

  // remap module A => mock/a_one
  injector.map('module/a', 'mock/a_one');

  var aOne = injector.require('module/a');
  console.log(aOne === a); // => false
  console.log(aOne === aOrig); // => false

  // restore original module
  injector.unmap('module/a');
  console.log(
    injector.require('module/a') === aOrig
  ); // => true
});
```

### Cleanup maps
If you need to get an original module instead of mapped mock - you could `unmap` the module.

```js
// unmap single module
injector.unmap('module/a');

// unmap few modules at once
injector.unmap('module/a', 'module/b');

// unmap all modules mapped before
injector.unmap();
```

**Notice:** It's not possible to use `injector.mock()` and `injector.map()` for module at the same time.

## Mocks

### Setup mocks
If you do not have a prepared module mock in a separate file and want to do it in the runtime - you could use mocks. It's possible to provide any value (function, object, number, string, etc) as a result for the mocked module.

```js
describe('Mocks', function() {
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
**Notice:** It's not possible to use `injector.mock()` and `injector.map()` for module at the same time.
**Notice:** It's not possible to mock module that has been mocked before.

### Cleanup mocks
If you don't need a mock anymore it's possible to remove it. Afterwards original module value will be returned if you require the module.

```js
// Unmock single module
injector.unmock('module/a');

// Unmock few modules at once
injector.unmock('module/a', 'module/b');

// Unmock all previiously mocked modules
injector.unmock();
```

# Undefining a module
When you require a module - RequireJS will automatically cache it with all dependencies. If you need to provide another dependency mocks you should undefine module and then get fresh copy of module.

```js
// Assume that you have module C that depends on module A and B
// module C is required and cached
var c = injector.require('module/c');

// provide mocks for dependencies
injector.mock('module/a', 123);
injector.mock('module/b', 456);

// undefine module C to get fresh dependencies afterwards
injector.undef('module/c');

// get module C with mocked dependencies
c = injector.require('module/c');
```

**Notice:** During the mock setup - module cache will be removed automatically for you and mocked module value will be returned afterwards, as expected.

```js
// get original A value
var a = injector.require('module/a');

// mock module A
injector.mock('module/a', 123);
injector.require('module/a'); // => 123
```

## Destroying the injector
You should always destroy injector to cleanup after it.

```js
afterEach(function() {
  // cleanup
  injector.destroy();
});
```

# RequireJS versions support
`requirejs-mock` supports RequireJS versions starting from **2.1.12**. Previous versions are **not supported**.

# Changelog
**1.0.0 -** Mar. 22, 2015

First stable release that supports all planned injector features.

* **[breaking]** It's not possible to `mock()` and `map()` module at the same time. Previous behavior was not specified
* Added ability to remove mocks and maps used before
* Added ability to remove module from RequireJS cache

**0.9.0 -** Mar. 16, 2015

Initial release with basic capabilities

