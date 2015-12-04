(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Injector"] = factory();
	else
		root["Injector"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _objectAssign = __webpack_require__(1);

	var _objectAssign2 = _interopRequireDefault(_objectAssign);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var each = function each(obj, callback) {
	  for (var key in obj) {
	    if (obj.hasOwnProperty(key)) {
	      callback(obj[key], key);
	    }
	  }
	};

	// Default requirejs context name
	var DEFAULT_CONTEXT = '_';

	var Injector = (function () {
	  function Injector() {
	    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    _classCallCheck(this, Injector);

	    if (typeof Injector.requirejs !== 'function') {
	      throw new Error('RequireJS has not been provided! Use `Injector.provide(requirejs)` to provide it.');
	    }

	    this.options = (0, _objectAssign2.default)({ context: DEFAULT_CONTEXT }, options);

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
	    this._maps = (0, _objectAssign2.default)({}, this.context.config.map['*']);

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

	  _createClass(Injector, [{
	    key: 'map',
	    value: function map(id, mockId) {
	      var _this = this;

	      // Support object notation
	      if (id && (typeof id === 'undefined' ? 'undefined' : _typeof(id)) === 'object') {
	        each(id, function (value, key) {
	          return _this.map(key, value);
	        });
	        return this;
	      }

	      if (typeof id !== 'string' || typeof mockId !== 'string') {
	        throw new TypeError('Module ID and mock ID should be a string.');
	      }

	      if (this._isMocked(id)) {
	        throw new Error('It is not possible to mock and map module "' + id + '" at same time');
	      }

	      this._maps[id] = mockId;
	      this._applyMaps();

	      return this;
	    }

	    /**
	     * Check if module has been mapped by injector
	     * @return {Boolean} Check result
	     */

	  }, {
	    key: '_isMapped',
	    value: function _isMapped(id) {
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

	  }, {
	    key: 'unmap',
	    value: function unmap() {
	      var _this2 = this;

	      for (var _len = arguments.length, ids = Array(_len), _key = 0; _key < _len; _key++) {
	        ids[_key] = arguments[_key];
	      }

	      if (ids.length === 0) {
	        // restore all
	        this._maps = (0, _objectAssign2.default)({}, this._originalMaps);
	      } else {
	        // restore provided
	        ids.forEach(function (id) {
	          return _this2._maps[id] = _this2._originalMaps[id];
	        });
	      }

	      this._applyMaps();
	      return this;
	    }

	    /**
	     * Apply mapping for the context
	     */

	  }, {
	    key: '_applyMaps',
	    value: function _applyMaps() {
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

	  }, {
	    key: 'mock',
	    value: function mock(id, value) {
	      var _this3 = this;

	      // object notation
	      if (id && (typeof id === 'undefined' ? 'undefined' : _typeof(id)) === 'object') {
	        each(id, function (value, key) {
	          return _this3.mock(key, value);
	        });

	        return this;
	      }

	      if (typeof id !== 'string') {
	        throw new TypeError('Module name should be a string.');
	      }

	      if (this._isMapped(id)) {
	        throw new Error('It is not possible to map and mock module "' + id + '" at same time');
	      }

	      if (this._isMocked(id)) {
	        throw new Error('Module "' + id + '" has been mocked before!');
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
	  }, {
	    key: '_isMocked',
	    value: function _isMocked(id) {
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

	  }, {
	    key: 'unmock',
	    value: function unmock() {
	      var _this4 = this;

	      for (var _len2 = arguments.length, ids = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	        ids[_key2] = arguments[_key2];
	      }

	      if (ids.length === 0) {

	        // unmock all
	        each(this._mocked, function (value, key) {
	          return _this4.unmock(key);
	        });

	        return this;
	      }

	      ids.forEach(function (id) {
	        delete _this4._mocked[id];
	        delete _this4.context.defined[id];

	        // restore mocked maps
	        if (_this4._mockedMaps[id]) {
	          _this4._maps[id] = _this4._mockedMaps[id];
	          _this4._applyMaps();
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

	  }, {
	    key: 'require',
	    value: function require() {
	      return this.context.require.apply(this.context, arguments);
	    }

	    /**
	     * Remove module from RequireJS cache
	     * @param  {String}   id... Module ids to forget
	     * @return {Injector}       Injector instance
	     */

	  }, {
	    key: 'undef',
	    value: function undef() {
	      var _this5 = this;

	      for (var _len3 = arguments.length, ids = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
	        ids[_key3] = arguments[_key3];
	      }

	      ids.forEach(function (id) {
	        // remove mock if module has been mocked before
	        if (_this5._isMocked(id)) {
	          _this5.unmock(id);
	        }

	        // remove from cache
	        _this5.context.require.undef(id);
	      });

	      return this;
	    }

	    /**
	     * Destroy injector and cleanup
	     */

	  }, {
	    key: 'destroy',
	    value: function destroy() {
	      delete Injector.requirejs.s.contexts[this._contextName];
	      return this;
	    }
	  }]);

	  return Injector;
	})();

	/**
	 * Provide initialization data
	 * @param  {Function} requirejs RequireJS instance
	 * @return {Injector}           Injector function
	 */

	Injector.provide = function (requirejs) {
	  Injector.requirejs = requirejs;
	  return Injector;
	};

	Injector.create = function (options) {
	  return new Injector(options);
	};

	// Generate context uniq ID
	var uid = 0;
	var contextUID = function contextUID() {
	  return '__MockContext__' + ++uid;
	};

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
	var createContext = function createContext(requirejs, contextName) {
	  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	  if (!options.extend) {
	    requirejs.config({ context: contextName });
	    return getContext(requirejs, contextName);
	  }

	  var context = getContext(requirejs, options.extend);

	  if (!context) {
	    throw new Error('Context does not exist: ' + options.extend);
	  }

	  // create new requirejs context based on provided
	  requirejs.config((0, _objectAssign2.default)({}, getContext(requirejs, options.extend).config,

	  // redefine context name, reset deps and replace callback
	  // Note:
	  // callback / deps should not be used for mock contexts to prevent their calls after the .config() call
	  // There was an issue with window.__karma__start callback that was called called more then once for async tests
	  { context: contextName, deps: [], callback: function callback() {} }));

	  return getContext(requirejs, contextName);
	};

	/**
	 * Get RequireJS context
	 * @param  {Function} requirejs   RequireJS instance
	 * @param  {String}   contextName Context name
	 * @return {RequireJS.Context}    RequireJS context
	 */
	var getContext = function getContext(requirejs, contextName) {
	  return requirejs.s.contexts[contextName];
	};

	// `export default` work incorrect in Webpack
	// https://github.com/webpack/webpack/issues/706
	module.exports = Injector;

/***/ },
/* 1 */
/***/ function(module, exports) {

	/* eslint-disable no-unused-vars */
	'use strict';
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	module.exports = Object.assign || function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};


/***/ }
/******/ ])
});
;