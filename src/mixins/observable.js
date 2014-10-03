/**
 * @namespace ya.mixins
 * @class Observable
 */
ya.$set('ya', 'mixins.Observable', {
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
            evName = shift.call(arguments),
            listener;

        for (var i = 0, li = this._listeners[evName] || [], len = li.length; i < len; i++) {

            if (ret) {

                listener = li[i];
                ret = listener.apply(listener, arguments);
                ret = typeof ret === 'undefined' ? true : ret;
                if(listener.single) {
                    this.removeEventListener(evName, listener);
                }

            }

        }
        return ret;
    },

    /**
     * fire event
     * @param evName
     * @param callback
     * @param scope
     * @param single
     * @returns {this}
     *
     */
    addEventListener: function (evName, callback, scope, single) {
        var listeners = this._listeners[evName] || [];
        if(single) callback.single = true;
        listeners.push(scope ? callback.bind(scope) : callback);
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
    removeEventListener: function (evName, callback) {
        var listeners = this._listeners[evName] || [],
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
                this._listeners[evName] = [];
            }
        }
        return this;
    },

    /**
     * suspend all events
     */
    suspendEvents: function () {
        var me = this;

        me.set('suspendEvents', (me._suspendEvents || 0) + 1);

        return this;
    },
    /**
     * resume all events
     */
    resumeEvents: function () {
        var me = this;

        me.set('suspendEvents', --me._suspendEvents);

        return me;
    }
});