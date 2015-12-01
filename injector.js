'use strict';

var toArray = require('lodash.toarray');
var assign = require('lodash.assign');
var uniqueId = require('lodash.uniqueid');
var forEach = require('lodash.foreach');

function Injector(options) {
  Injector._ensureRequireJS();

  this.options = assign({ context: Injector.DEFAULT_CONTEXT }, options || {});

  this._contextName = uniqueId('__MockContext__');

  // create new context based on provided to prent modifications
  this.context = Injector.Util.createContext(
    this._contextName,
    { extend: this.options.context }
  );

  // mapping initialization
  if (!this.context.config.map) {
    this.context.config.map = { '*': {} };
  }

  if (!this.context.config.map['*']) {
    this.context.config.map['*'] = {};
  }

  // @todo Think about per module mapping support

  // Save original context mapping
  // to allow unmap properly for contexts that use mappings
  this._originalMaps = this.context.config.map['*'];

  // mocked maps allow properly mock/unmock mapped modules
  this._mockedMaps = {};

  // Mapping config for all modules (*).
  // Changes in this config will be reflected in context using _applyMaps()
  // Notice: copied from original to prevent its changes
  this._maps = assign({}, this.context.config.map['*']);

  // store for mocked modules ids
  // is needed to determine is module mocked or not
  this._mocked = {};
}

// Default requirejs context name
Injector.DEFAULT_CONTEXT = '_';

/**
 * Allow map real modules for mocks easy
 *
 * @param {String|Object} id       Module name to mock / module mapping
 * @param {String}        [mockId] Mock module ID, if single module mock notation
 *                                 is used
 * @return {Injector} Injector
 *
 * @example
 *
 *   injector.map('moduleA', 'mock/moduleA');
 *   injector.map({
 *     'moduleA': 'mock/moduleA',
 *     'moduleB': 'mock/moduleB'
 *   });
 */
Injector.prototype.map = function(id, mockId) {
  // Support object notation
  if (id && typeof id === 'object') {
    forEach(id, function(value, key) {
      this.map(key, value);
    }, this);

    return this;
  }

  if (typeof id !== 'string' || typeof mockId !== 'string') {
    throw new TypeError('Module ID and mock ID should be a string.');
  }

  if (this._isMocked(id)) {
    throw new Error('It is not possible to mock and map module `' + id + '` at same time`');
  }

  this._maps[id] = mockId;
  this._applyMaps();

  return this;
};

/**
 * Check if module has been mapped by injector
 * @return {Boolean} Check result
 */
Injector.prototype._isMapped = function(id) {
  return this._maps[id] && !this._originalMaps[id];
};

/**
 * Copy mapping settings from original context
 *
 * @param {String|Array} [...ids] Module id(s) to unmap
 * @return {Injector}   Injector instance
 *
 * @example Unmap previously mocked module
 *   injector.unmap('module/a');
 *
 * @example Unmap few modules at once
 *   injector.unmap('module/a', 'module/b');
 *
 * @example Unmap all mapped before modules
 *    injector.unmap();
 *
 * @example Chaining
 *  injector
 *    .unmap('module/a');
 *    .require('module/a'); // => original module a
 */
Injector.prototype.unmap = function(ids) {
  if (typeof ids === 'undefined') {
    // restore all
    this._maps = assign({}, this._originalMaps);
    this._applyMaps();
    return this;
  }

  ids = toArray(arguments);

  ids.forEach(function(id) {
    this._maps[id] = this._originalMaps[id];
  }, this);

  this._applyMaps();

  return this;
};

/**
 * Apply mapping for the context
 * @private
 */
Injector.prototype._applyMaps = function() {
  this.context.config.map['*'] = this._maps;
};

/**
 * Mock module with a value
 * @param  {String|Object} id      Module id to mock / Object with id/value for mock
 * @param  {*}             [value] Value that will be provides as a module result
 * @return {Injector}              Injector instance
 *
 * @example Mock module
 *   injector.mock('module/a', 123);
 *   injector.require('module/a'); // => 123
 *
 * @example Mock few modules at once
 *   injector.mock({
 *     'module/a': 123,
 *     'module/b': 456
 *   });
 *
 *   injector.require('module/a'); // => 123
 *   injector.require('module/b'); // => 456
 *
 * @example Chaining
 *   injector
 *     .mock('module/a', 123)
 *     .require('module/a');       // => 123
 */
Injector.prototype.mock = function(id, value) {

  // Support object notation
  if (id && typeof id === 'object') {
    forEach(id, function(value, key) {
      this.mock(key, value);
    }, this);

    return this;
  }

  if (typeof id !== 'string') {
    throw new TypeError('Module name should be a string.');
  }

  if (this._isMapped(id)) {
    throw new Error('It is not possible to map and mock module `' + id + '` at same time`');
  }

  if (this._isMocked(id)) {
    throw new Error('Module `' + id + '` has been mocked before!');
  }

  // remove module cache
  this.undef(id);

  // move mappings into _mockedMaps object to allow mock mapped modules
  // and properly handle unmock()
  this._mockedMaps[id] = this._maps[id];
  delete this._maps[id];
  this._applyMaps();

  // add to mocked list
  this._mocked[id] = true;

  this.context.defined[id] = value;
  return this;

  /**
   * Requirejs.define register module in global queue.
   *
   * See:
   * https://github.com/jrburke/requirejs/blob/dbcfc05df1cec15768a79f12b67c1824c1c484eb/require.js#L2062
   */
  Injector.requirejs.define(id, function() {
    return value;
  });

  // Require it from global context to current context
  // Should be called here - otherwice module will be registered in first context
  // that will require it (lazy initialization)
  //
  // See:
  // https://github.com/jrburke/requirejs/blob/dbcfc05df1cec15768a79f12b67c1824c1c484eb/require.js#L1230
  this.require(id);

  return this;
};

Injector.prototype._isMocked = function(id) {
  return Boolean(this._mocked[id]);
};

/**
 * Unmock module(s)
 * @param  {String}   [ids...] Module id to unmock
 * @return {Injector}          Injector instance
 *
 * @example Unmock single module
 *   injector.unmock('module/a');
 *
 * @example Unmock few modules
 *   injector.unmock('module/a', 'module/b');
 *
 * @example Chaining
 *   injector.unmock('module/a')
 *     .mock('module/a', 345);
 *
 */
Injector.prototype.unmock = function(ids) {
  if (typeof ids === 'undefined') {
    // unmock all
    forEach(this._mocked, function(value, key) {
      this.unmock(key);
    }, this);

    return this;
  }

  ids = toArray(arguments);

  ids.forEach(function(id) {
    delete this._mocked[id];
    delete this.context.defined[id];

    // restore mocked maps
    if (this._mockedMaps[id]) {
      this._maps[id] = this._mockedMaps[id];
      this._applyMaps();
    }
  }, this);

  return this;
};

Injector.prototype.require = function() {
  return this.context.require.apply(this.context, arguments);
};

/**
 * Remove module from RequireJS cache
 * @param  {String}   id... Module ids to forget
 * @return {Injector}       Injector instance
 */
Injector.prototype.undef = function() {
  var ids = toArray(arguments);

  ids.forEach(function(id) {
    // remove mock if module has been mocked before
    if (this._isMocked(id)) {
      this.unmock(id);
    }

    // fails for browsers
    // return;

    // remove from cache
    this.context.require.undef(id);
  }, this);

  return this;
};

/**
 * Destroy injector and cleanup
 */
Injector.prototype.destroy = function() {
  delete Injector.requirejs.s.contexts[this._contextName];
  return this;
};

/**
 * Utils
 */
Injector.Util = {};

/**
 * Create new context inside RequireJS
 *
 * @param  {String} contextName      New context name
 * @param  {Object} options          Options
 * @param  {String} [options.extend] Context that will be extended
 *                                   (all settings copied from)
 * @return {Context}                 RequireJS context
 *
 * @example
 *   // create new context based on default context
 *   Injector.Util.createContext(requirejs, 'mock_25', { extend: '_' })
 */
Injector.Util.createContext = function(contextName, options) {
  Injector._ensureRequireJS();

  if (typeof options === 'undefined') {
    options = {};
  }

  if (!options.extend) {
    Injector.requirejs.config({
      context: contextName
    });

    return Injector.Util.getContext(contextName);
  }

  var context = Injector.Util.getContext(options.extend);

  if (!context) {
    throw new Error('Context does not exist: ' + options.extend);
  }

  // create new requirejs context based on provided
  Injector.requirejs.config(assign(
    {},
    Injector.Util.getContext(options.extend).config,

    // redefine context name, clear deps and replace callback
    { context: contextName, deps: [], callback: function() {} }
  ));

  return Injector.Util.getContext(contextName);
};

/**
 * Get RequireJS context
 * @param  {Function} requirejs   RequireJS instance
 * @param  {String}   contextName Context name
 * @return {RequireJS.Context}    RequireJS context
 */
Injector.Util.getContext = function(contextName) {
  Injector._ensureRequireJS();
  return Injector.requirejs.s.contexts[contextName];
};

/**
 * Provide initialization data
 * @param  {Function} requirejs RequireJS instance
 * @return {Injector}           Injector function
 */
Injector.provide = function(requirejs) {
  Injector.requirejs = requirejs;
  return Injector;
};

Injector._ensureRequireJS = function() {
  if (typeof Injector.requirejs !== 'function') {
    throw new Error('RequireJS has not been provided!');
  }
};

Injector.create = function(options) {
  return new Injector(options);
};

module.exports = Injector;
