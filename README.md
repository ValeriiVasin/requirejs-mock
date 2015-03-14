# About
`requirejs-mock` is a dependency injector for RequireJS modules.

# How it works
TBD

# API
## Initialization
```js
var requirejs = require('requirejs');

// Get Injector and provide requirejs to it
var Injector = require('requirejs-mock').provide(requirejs);

// instantiate injector
var injector = Injector.create();

// instantiate injector for non-default context
var otherInjector = Injector.create({ context: 'specs' });
```

## Remapping dependencies to mocks
```js
describe('Remapping dependencies', function() {
  beforeEach(function() {
    injector = Injector.create();

    // remap module A to its mock
    injector.map('module/a', 'mock/a');
    injector.map('module/b', 'mock/b');

    // or
    injector.map({
      'module/a': 'mock/a',
      'module/b': 'mock/b'
    });

    // load module C that depends on A and B
    var c = injector.require('module/c');
  });
});
```
