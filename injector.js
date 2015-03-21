'use strict';

var _ = require('lodash');

/**
 * @todo  Check `paths` support
 */

function Injector(options) {
  Injector._ensureRequireJS();

  this.options = _.extend({ context: Injector.DEFAULT_CONTEXT }, options || {});

  this._contextName = _.uniqueId('__MockContext__');

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
  this._maps = _.extend({}, this.context.config.map['*']);

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
 *   Injector.map('moduleA', 'mock/moduleA');
 *   Injector.map({
 *     'moduleA': 'mock/moduleA',
 *     'moduleB': 'mock/moduleB'
 *   });
 */
Injector.prototype.map = function(id, mockId) {
  // Support object notation
  if (id && typeof id === 'object') {
    _.each(id, function(value, key) {
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
 * @example
 *  injector
 *    .map('module/a', 'mock/a');
 *    .require('module/a');        // returns mock/a
 *
 *  injector.unmap('module/a')
 *     .require('module/a');       // returns original module/a
 *
 *  @example
 *    injector.unmap('module/a', 'module/b'); // restore original modules
 *
 *  @example
 *    injector.unmap(); // restore all mapped before modules
 *
 */
Injector.prototype.unmap = function(ids) {
  if (typeof ids === 'undefined') {
    // restore all
    this._maps = _.extend({}, this._originalMaps);
    this._applyMaps();
    return this;
  }

  ids = _.toArray(arguments);

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

Injector.prototype.mock = function(id, value) {

  // Support object notation
  if (id && typeof id === 'object') {
    _.each(id, function(value, key) {
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

  // move mappings into _mockedMaps object to allow mock mapped modules
  // and properly handle unmock()
  this._mockedMaps[id] = this._maps[id];
  delete this._maps[id];
  this._applyMaps();

  // add to mocked list
  this._mocked[id] = true;

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
  return this._mocked[id];
};

Injector.prototype.require = function() {
  return this.context.require.apply(this.context, arguments);
};

/**
 * Destroy injector and cleanup
 */
Injector.prototype.destroy = function() {
  delete Injector.requirejs.s.contexts[this.context.contextName];
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
  Injector.requirejs.config(_.extend(
    {},
    Injector.Util.getContext(options.extend).config,
    { context: contextName, __originalContext: options.extend }
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
