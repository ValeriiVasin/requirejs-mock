'use strict';

var _ = require('lodash');

var DEFAULT_CONTEXT = '_';

function Injector(options) {
  Injector._ensureRequireJS();

  this.options = _.extend({ context: DEFAULT_CONTEXT }, options || {});

  this._contextName = _.uniqueId('__mocks__');

  // create new context based on provided to prent modifications
  this.context = Injector.Util.createContext(
    this._contextName,
    { extend: this.options.context }
  );
}

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

Injector.prototype.require = function() {
  return this.context.require.apply(this.context, arguments);
};

Injector.prototype.release = function() {
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
