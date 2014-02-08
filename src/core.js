(function (window, undefined) {
    "use strict";

    var ya = window.ya || {},
        Core,
        onReadyCallbacks = [],
        readyStateCheckInterval;

    // Run all method when ready
    function run() {
        for (var i = 0, l = onReadyCallbacks.length; i < l; i++) {
            onReadyCallbacks[i]();
        }
    }

    // Provide way to execute all necessary code after DOM is ready.
    /**
     * @param callback
     */
    ya.$onReady = function (callback) {
        onReadyCallbacks.push(callback);
        if (!readyStateCheckInterval && document.readyState !== "complete") {
            readyStateCheckInterval = setInterval(function () {
                if (document.readyState === "complete") {
                    clearInterval(readyStateCheckInterval);
                    run();
                }
            }, 10);
        }
    };

    // Merge two objects.
    /**
     * @param obj1
     * @param obj2
     * @returns {*}
     */
    ya.$merge = function (obj1, obj2) {
        var nObj = {},
            property;

        for (property in obj1) {
            if (obj1.hasOwnProperty(property)) {
                nObj[property] = obj1[property];
            }
        }

        for (property in obj2) {
            if (obj2.hasOwnProperty(property)) {
                nObj[property] = obj2[property];
            }
        }

        return nObj;
    };

    //
    ya.$clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    // Definition of Core object.
    Core = ya.Core || (function () {

        /**
         *
         * @constructor
         *
         */
        function Core() {
            this.set('listeners', {});
            this.bindMethods.apply(this, arguments);
            this.init.apply(this, arguments);
        }

        /**
         * @abstract
         */
        Core.prototype.init = function () {
        };

        /**
         *
         */
        Core.prototype.initConfig = function () {
            var me = this,
                config = me.get('config'),
                getter,
                setter,
                property,
                init = function (property) {
                    getter = "get" + property.charAt(0).toUpperCase() + property.slice(1);
                    setter = "set" + property.charAt(0).toUpperCase() + property.slice(1);
                    me[getter] = function () {
                        return me.get('config')[property];
                    };
                    me[setter] = function (value) {
                        var oldVal = me.get('config')[property];
                        if (value !== oldVal) {
                            me.get('config')[property] = value;
                            me.fireEvent(property + 'Change', this, value, oldVal);
                        }
                    };
                };
            for (property in config) {
                if (config.hasOwnProperty(property)) {
                    init(property);
                }
            }
        };

        // Binds custom methods from config object to class instance.
        /**
         * @param initOpts
         */
        Core.prototype.bindMethods = function (initOpts) {
            for (var property in initOpts) {
                if (initOpts.hasOwnProperty(property) && typeof initOpts[property] === 'function') {
                    this[property] = initOpts[property].bind(this);
                    delete initOpts[property];
                }
            }
        };

        // Add callback to property change event.
        /**
         * @param property
         * @param callback
         * @returns {this}
         */
        Core.prototype.onChange = function (property, callback) {
            this.addEventListener(property + 'Change', callback);
            return this;
        };

        // Unbind callback.
        /**
         * @param property
         * @param callback
         * @returns {this}
         */
        Core.prototype.unbindOnChange = function (property, callback) {
            var listeners = this._listeners[property + 'Change'] || [];
            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i] === callback) {
                    listeners.splice(i, 1);
                }
            }
            this._listeners[property + 'Change'] = listeners;
            return this;
        };

        Core.$create = function (opts) {
            var Obj = this;
            return new Obj(opts);
        };

        // Add mixin to object definition.
        /**
         * @static
         * @param obj
         * @param {*} mixin
         */
        Core.$mixin = function (obj, mixin) {
            var prototype,
                property;

            if (mixin) {
                prototype = typeof obj === 'function' ? obj.prototype : obj;
            } else {
                mixin = typeof obj === 'function' ? obj.prototype : obj;
                prototype = this.prototype;

            }

            for (property in mixin) {
                if (mixin.hasOwnProperty(property)) {
                    prototype[property] = mixin[property];
                }
            }
        };

        // Stores all mixins initializing functions.
        /**
         * @type {Array}
         * @private
         */
        Core.__mixins__ = [];

        // Stores all defaults.
        /**
         * @type {Object}
         * @private
         */
        Core.__defaults__ = {};

        // Extend object definition using passed options.
        /**
         * @static
         * @param opts Object
         * @returns {Function}
         */
        Core.$extend = function (opts) {
            opts = opts || {};
            var Parent = this,
                Class = function () {
                    var key;
                    //
                    this._config = {};

                    // Initialize defaults.
                    for (key in defaults) {
                        if (__hasProp.call(defaults, key)) this._config[key] = defaults[key];
                    }
                    Core.apply(this, arguments);
                },
                defaults = ya.$merge(Parent.__defaults__ || {}, opts.defaults),
                mixins = opts.mixins || [],
                statics = opts.static || {},
                __hasProp = {}.hasOwnProperty,
                __extends = function (child, parent) {
                    // inherited
                    for (var key in parent) {
                        if (__hasProp.call(parent, key)) child[key] = parent[key];
                    }
                    function Instance() {
                        this.constructor = child;
                    }

                    Instance.prototype = parent.prototype;
                    child.Parent = parent.prototype;
                    child.prototype = new Instance();
                    child.$extend = Core.$extend;
                    child.$mixin = Core.$mixin;
                    child.$create = Core.$create;
                    child.__mixins__ = [];
                    child.__defaults__ = defaults;

                    // Add methods to object definition.
                    for (var method in opts) {
                        if (
                            __hasProp.call(opts, method) &&
                                typeof opts[method] === 'function'
                            ) {
                            child.prototype[method] = opts[method];
                        }
                    }

                    // Add external mixins.
                    while (mixins.length) {
                        child.mixin(mixins.pop());
                    }

                    // Make method static.
                    for (var stat in statics) {
                        if (__hasProp.call(statics, stat)) {
                            child['$' + stat] = statics[stat];
                        }
                    }

                    return child;
                };

            __extends(Class, Parent);

            return Class;
        };

        // Add Getters and Setters.
        Core.$mixin(ya.mixins.GetSet);

        // Add observable methods.
        Core.$mixin(ya.mixins.Observable);

        return Core;
    }());

    ya.Core = Core;
    window.ya = ya;
}(window));