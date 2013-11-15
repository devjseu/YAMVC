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
    var Base = window.Base || (function () {
        /**
         *
         * @constructor
         */
        function Base() {
            this.set('listeners', {});
            this.set('suspendEvents', false);
        }

        /**
         *
         * @param property
         * @param value
         * @returns {*}
         */
        Base.prototype.set = function (property, value) {
            var p = "_" + property,
                oldVal = this[p];
            if (value !== oldVal) {
                this[p] = value;
                if (!this._suspendEvents)
                    this.fireEvent(property + 'Change', this, value, oldVal);
            }
            return this;
        };

        /**
         *
         * @param property
         * @returns {*}
         */
        Base.prototype.get = function (property) {
            return this["_" + property];
        };

        /**
         * fire event
         * @param evName
         * @returns {boolean}
         */
        Base.prototype.fireEvent = function (evName /** param1, ... */) {
            var ret = true, shift = Array.prototype.shift;
            shift.call(arguments);
            for (var i = 0, li = this._listeners[evName] || [], len = li.length; i < len; i++) {
                if (ret) {
                    ret = li[i].call(shift.apply(arguments), arguments);
                }
            }
            return ret;
        };

        /**
         * add listener on event
         * @param evName
         * @param callback
         * @returns {this}
         */
        Base.prototype.addListener = function (evName, callback) {
            var listeners = this._listeners[evName] || [];
            listeners.push(callback);
            this._listeners[evName] = listeners;
            return this;
        };

        /**
         * add callback to property change event
         * @param property
         * @param callback
         * @returns {this}
         */
        Base.prototype.onChange = function (property, callback) {
            this.addListener(property + 'Change', callback);
            return this;
        };

        /**
         *
         * unbind onChange callback
         * @param property
         * @param callback
         * @returns {this}
         */
        Base.prototype.unbindOnChange = function (property, callback) {
            var listeners = this._listeners[property + 'Change'] || [];
            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i] === callback) {
                    listeners.splice(i, 1);
                }
            }
            this._listeners[property + 'Change'] = listeners;
            return this;
        };

        Base.prototype.suspendEvents = function (suspend) {
            this.set('suspendEvents', suspend);
        };

        /**
         * extend object
         * @static
         * @param Func constructor of new one
         * @returns {Function}
         */
        Base.extend = function (Func) {
            var Parent = this;
            var Class = function () {
                for (var key in Class.prototype) {
                    if (typeof Class.prototype[key] === 'object') {
                        this[key] = Class.prototype[key].constructor();
                    }
                }
                Func.prototype.constructor.apply(this, arguments);
            };
            for (var method in Parent.prototype) {
                if (Parent.prototype.hasOwnProperty(method)) {
                    Class.prototype[method] = Parent.prototype[method];
                }
            }
            Class._parent = Parent.prototype;
            Class.extend = Base.extend;
            return Class;
        };
        return Base;
    }());
    window.Base = Base;
}(window));