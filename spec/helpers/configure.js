var requirejs = require('requirejs');
var Injector = require('../../injector').provide(requirejs);

var REQUIREJS_BASE_URL = 'spec/fixtures/';

// configure default context
requirejs.config({
  baseUrl: REQUIREJS_BASE_URL
});

requirejs.config({
  context: 'other',
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

requirejs.config({
  context: 'withPath',
  baseUrl: REQUIREJS_BASE_URL,
  paths: {
    m: 'mock',
    o: 'module'
  }
});

beforeEach(function() {
  this.Injector = Injector;

  this.injector = this.Injector.create();
  this.otherInjector = Injector.create({ context: 'other' });
  this.injectorWithPath = Injector.create({ context: 'withPath' });
  this.injectorWithMap = this.Injector.create({ context: 'withMap' });
});

afterEach(function() {
  this.injector.destroy();
  this.injectorWithMap.destroy();
  this.injectorWithPath.destroy();
});
