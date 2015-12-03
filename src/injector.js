'use strict';

import assign from 'lodash.assign';
import forEach from'lodash.foreach';

// Default requirejs context name
const DEFAULT_CONTEXT = '_';

class Injector {
  constructor(options = {}) {
    if (typeof Injector.requirejs !== 'function') {
      throw new Error('RequireJS has not been provided! Use `Injector.provide(requirejs)` to provide it.');
    }

    this.options = assign({ context: DEFAULT_CONTEXT }, options);

    this._contextName = contextUID();

    // create new context based on provided to prent modifications
    this.context = createContext(Injector.requirejs, this._contextName, { extend: this.options.context });

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

  /**
   * Allow map real modules to mocks easily
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
  map(id, mockId) {
    // Support object notation
    if (id && typeof id === 'object') {
      forEach(id, (value, key) => this.map(key, value));
      return this;
    }

    if (typeof id !== 'string' || typeof mockId !== 'string') {
      throw new TypeError('Module ID and mock ID should be a string.');
    }

    if (this._isMocked(id)) {
      throw new Error(`It is not possible to mock and map module "${id}" at same time`);
    }

    this._maps[id] = mockId;
    this._applyMaps();

    return this;
  }

  /**
   * Check if module has been mapped by injector
   * @return {Boolean} Check result
   */
  _isMapped(id) {
    return this._maps[id] && !this._originalMaps[id];
  }

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
  unmap(...ids) {
    if (ids.length === 0) {
      // restore all
      this._maps = assign({}, this._originalMaps);
    } else {
      // restore provided
      ids.forEach(id => this._maps[id] = this._originalMaps[id]);
    }

    this._applyMaps();
    return this;
  }

  /**
   * Apply mapping for the context
   */
  _applyMaps() {
    this.context.config.map['*'] = this._maps;
  }

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
  mock(id, value) {

    // object notation
    if (id && typeof id === 'object') {
      forEach(id, (value, key) => this.mock(key, value));

      return this;
    }

    if (typeof id !== 'string') {
      throw new TypeError('Module name should be a string.');
    }

    if (this._isMapped(id)) {
      throw new Error(`It is not possible to map and mock module "${id}" at same time`);
    }

    if (this._isMocked(id)) {
      throw new Error(`Module "${id}" has been mocked before!`);
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
  }

  _isMocked(id) {
    return Boolean(this._mocked[id]);
  }

  /**
   * Unmock module(s)
   * @param  {String}   [...ids] Module id to unmock
   * @return {Injector}          Injector instance
   *
   * @example Unmock single module
   *   injector.unmock('module/a');
   *
   * @example Unmock few modules
   *   injector.unmock('module/a', 'module/b');
   *
   * @example Chaining
   *   injector
   *     .unmock('module/a')
   *     .mock('module/a', 345);
   *
   */
  unmock(...ids) {
    if (ids.length === 0) {

      // unmock all
      forEach(this._mocked, (value, key) => this.unmock(key));

      return this;
    }

    ids.forEach(id => {
      delete this._mocked[id];
      delete this.context.defined[id];

      // restore mocked maps
      if (this._mockedMaps[id]) {
        this._maps[id] = this._mockedMaps[id];
        this._applyMaps();
      }
    });

    return this;
  }

  /**
   * Require AMD module
   *
   * Proxying require call to RequireJS context loader.
   *
   * @example Sync env [node]
   *   let MyModule = injector.require('my/module');
   *
   * @example Async env [browser]
   *   injector.require(['module/a', 'module/b'], (A, B) => {
   *     // do smth
   *   });
   */
  require() {
    return this.context.require.apply(this.context, arguments);
  }

  /**
   * Remove module from RequireJS cache
   * @param  {String}   id... Module ids to forget
   * @return {Injector}       Injector instance
   */
  undef(...ids) {
    ids.forEach(id => {
      // remove mock if module has been mocked before
      if (this._isMocked(id)) {
        this.unmock(id);
      }

      // remove from cache
      this.context.require.undef(id);
    });

    return this;
  }

  /**
   * Destroy injector and cleanup
   */
  destroy() {
    delete Injector.requirejs.s.contexts[this._contextName];
    return this;
  }
}

/**
 * Provide initialization data
 * @param  {Function} requirejs RequireJS instance
 * @return {Injector}           Injector function
 */
Injector.provide = function(requirejs) {
  Injector.requirejs = requirejs;
  return Injector;
};

Injector.create = function(options) {
  return new Injector(options);
};

// Generate context uniq ID
let uid = 0;
const contextUID = () => `__MockContext__${++uid}`;

/**
 * Create new context inside RequireJS
 *
 * @param  {Function} requirejs        requirejs function
 * @param  {String}   contextName      New context name
 * @param  {Object}   options          Options
 * @param  {String}   [options.extend] Context that will be extended (all settings copied from)
 * @return {Context}                   RequireJS context
 *
 * @example
 *   // create new context based on default context
 *   createContext(requirejs, 'mock_25', { extend: '_' })
 */
const createContext = (requirejs, contextName, options = {}) => {
  if (!options.extend) {
    requirejs.config({ context: contextName });
    return getContext(requirejs, contextName);
  }

  let context = getContext(requirejs, options.extend);

  if (!context) {
    throw new Error(`Context does not exist: ${options.extend}`);
  }

  // create new requirejs context based on provided
  requirejs.config(assign(
    {},
    getContext(requirejs, options.extend).config,

    // redefine context name, reset deps and replace callback
    // Note:
    // callback / deps should not be used for mock contexts to prevent their calls after the .config() call
    // There was an issue with window.__karma__start callback that was called called more then once for async tests
    { context: contextName, deps: [], callback: function() {} }
  ));

  return getContext(requirejs, contextName);
};

/**
 * Get RequireJS context
 * @param  {Function} requirejs   RequireJS instance
 * @param  {String}   contextName Context name
 * @return {RequireJS.Context}    RequireJS context
 */
const getContext = (requirejs, contextName) => requirejs.s.contexts[contextName];

// `export default` work incorrect in Webpack
// https://github.com/webpack/webpack/issues/706
module.exports = Injector;
