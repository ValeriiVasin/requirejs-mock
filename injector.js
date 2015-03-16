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
  var mapping = {};

  if (typeof id === 'string') {
    mapping[id] = mockId;
  } else {
    mapping = id;
  }

  if (!this.context.config.map) {
    this.context.config.map = { '*': {} };
  }

  if (!this.context.config.map['*']) {
    this.context.config.map['*'] = {};
  }

  _.extend(this.context.config.map['*'], mapping);

  return this;
};

/**
 * Copy mapping settings from original context
 *
 * @param {String} [id] Module id to unmap
 * @return {Injector}   Injector instance
 *
 * @example
 *   injector
 *     .map('module/a', 'mock/a');
 *     .require('module/a');        // returns mock/a
 *
 *   injector.unmap('module/a')
 *     .require('module/a');        // returns original module/a
 *
 */
Injector.prototype.unmap = function(id) {
  return this;
};

Injector.prototype.mock = function(id, value) {

  // Support object notation
  if (typeof id === 'object') {
    _.each(id, function(value, key) {
      this.mock(key, value);
    }, this);

    return this;
  }

  if (typeof id !== 'string') {
    throw new TypeError('Module name should be a string.');
  }

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
 * @param  {String} contextName New context name
 * @param  {Object} options     Options
 * @return {Context}            RequireJS context
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
