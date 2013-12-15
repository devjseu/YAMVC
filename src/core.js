/*
 The MIT License (MIT)

 Copyright (c) 2013 Sebastian Widelak

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


 */
(function (window, undefined) {
    "use strict";

    var yamvc = window.yamvc || {},
        Core,
        onReadyCallbacks = [],
        readyStateCheckInterval;

    function run() {
        for (var i = 0, l = onReadyCallbacks.length; i < l; i++) {
            onReadyCallbacks[i]();
        }
    }

    Core = yamvc.Core || (function () {

        /**
         *
         * @constructor
         *
         */
        function Core() {
            this.set('listeners', {});
            this.set('suspendEvents', false);
            this.bindMethods.apply(this, arguments);
            this.init.apply(this, arguments);
        }

        /**
         *
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
                    me[setter] = function (property, value) {
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

        /**
         * binds custom methods from config object to class instance
         *
         */
        Core.prototype.bindMethods = function (initOpts) {
            for (var property in initOpts) {
                if (initOpts.hasOwnProperty(property) && typeof initOpts[property] === 'function') {
                    this[property] = initOpts[property].bind(this);
                }
            }
        };

        /**
         *
         * @param property
         * @param value
         * @returns {this}
         *
         */
        Core.prototype.set = function (property, value) {
            var p = "_" + property,
                oldVal = this[p];
            if (value !== oldVal) {
                this[p] = value;
                this.fireEvent(property + 'Change', this, value, oldVal);
            }
            return this;
        };

        /**
         *
         * @param property
         * @returns {*}
         *
         */
        Core.prototype.get = function (property) {
            return this["_" + property];
        };


        Core.prototype.init = function () {

        };

        /**
         * fire event
         * @param evName
         * @returns {boolean}
         *
         */
        Core.prototype.fireEvent = function (evName /** param1, ... */) {
            if(!this._listeners){
                this._listeners = [];
            }
            if (this._suspendEvents)
                return true;
            var ret = true,
                shift = Array.prototype.shift;
            shift.call(arguments);
            for (var i = 0, li = this._listeners[evName] || [], len = li.length; i < len; i++) {
                if (ret) {
                    var scope = shift.call(arguments);
                    ret = li[i].apply(scope, arguments);
                }
            }
            return ret;
        };

        /**
         * fire event
         * @param evName
         * @param callback
         * @returns {this}
         *
         */
        Core.prototype.addListener = function (evName, callback) {
            if(!this._listeners){
                this._listeners = [];
            }
            var listeners = this._listeners[evName] || [];
            listeners.push(callback);
            this._listeners[evName] = listeners;
            return this;
        };

        /**
         * fire event
         * @param evName
         * @param callback
         * @returns {this}
         *
         */
        Core.prototype.removeListener = function (evName, callback) {
            var listeners = this._listeners,
                index;
            if (listeners) {
                if (callback) {
                    if (typeof callback === "function") {
                        for (var i = 0, len = listeners.length; i < len; i++) {
                            if (listeners[i] === callback) {
                                index = i;
                            }
                        }
                    } else {
                        index = callback;
                    }
                    listeners.splice(index, 1);
                } else {
                    this._listeners = [];
                }
            }
            return this;
        };

        /**
         * suspend all events
         * @param {Boolean} suspend
         */
        Core.prototype.suspendEvents = function (suspend) {
            suspend = suspend || true;
            this.set('suspendEvents', suspend);
            return this;
        };

        /**
         * add callback to property change event
         * @param property
         * @param callback
         * @returns {this}
         *
         */
        Core.prototype.onChange = function (property, callback) {
            this.addListener(property + 'Change', callback);
            return this;
        };

        /**
         *
         * unbind callback
         * @param property
         * @param callback
         * @returns {this}
         *
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

        /**
         * provide way to execute all necessary code after DOM is ready
         *
         * @param callback
         */
        Core.onReady = function (callback) {
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

        /**
         *
         * @param obj
         * @param mixin
         */
        Core.mixin = function (obj, mixin) {
            var prototype,
                property;

            if(mixin){
                prototype = typeof obj === 'function' ? obj.prototype : obj;
            }else{
                mixin = typeof obj === 'function' ? obj.prototype : obj;
                prototype = this.prototype;

            }

            for (property in mixin) {
                if (mixin.hasOwnProperty(property)) {
                    prototype[property] = mixin[property];
                }
            }

        };

        /**
         * extend passed function
         *
         * @static
         * @param Func
         * @returns {Function}
         *
         */
        Core.extend = function (Func) {
            var Parent = this,
                Class = function () {
                    Func.prototype.constructor.apply(this, arguments);
                };
            for (var method in Parent.prototype) {
                if (Parent.prototype.hasOwnProperty(method)) {
                    Class.prototype[method] = Parent.prototype[method];
                }
            }
            Class.extend = Core.extend;
            Class.mixin = Core.mixin;
            return Class;
        };

        return Core;
    }());

    yamvc.Core = Core;
    window.yamvc = yamvc;
}(window));