(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        mixins = yamvc.mixins || {},
        Observable;

    Observable = {
        init: function () {
            this.set('listeners', {});
            this.set('suspendEvents', false);
        },
        /**
         * fire event
         * @returns {boolean}
         *
         */
        fireEvent: function (/** param1, ... */) {
            if (this._suspendEvents)
                return true;
            var ret = true,
                shift = Array.prototype.shift,
                evName = shift.call(arguments);

            for (var i = 0, li = this._listeners[evName] || [], len = li.length; i < len; i++) {
                if (ret) {
                    var scope = shift.call(arguments);
                    ret = li[i].apply(scope, arguments);
                    ret = typeof ret === 'undefined' ? true : ret;
                }
            }
            return ret;
        },

        /**
         * fire event
         * @param evName
         * @param callback
         * @returns {this}
         *
         */
        addListener: function (evName, callback) {
            var listeners = this._listeners[evName] || [];
            listeners.push(callback);
            this._listeners[evName] = listeners;
            return this;
        },

        /**
         * fire event
         * @param evName
         * @param callback
         * @returns {this}
         *
         */
        removeListener: function (evName, callback) {
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
        },

        /**
         * suspend all events
         * @param {Boolean} suspend
         */
        suspendEvents: function (suspend) {
            suspend = suspend || true;
            this.set('suspendEvents', suspend);
            return this;
        }
    };

    mixins.Observable = Observable;
    window.yamvc = yamvc;
    window.yamvc.mixins = mixins;
}(window));
