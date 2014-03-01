ya.$set('ya', 'Core', (function () {
    "use strict";

    var ya = window.ya;

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
        var me = this;

        for (var property in initOpts) {
            if (initOpts.hasOwnProperty(property) && typeof initOpts[property] === 'function') {
                me[property] = initOpts[property].bind(me);
                delete initOpts[property];
            }
        }

        return me;
    };

    // Add callback to property change event.
    /**
     * @param property
     * @param callback
     * @returns {this}
     */
    Core.prototype.onChange = function (property, callback) {
        var me = this;

        me.addEventListener(property + 'Change', callback);

        return me;
    };

    // Unbind callback.
    /**
     * @param property
     * @param callback
     * @returns {this}
     */
    Core.prototype.unbindOnChange = function (property, callback) {
        var me = this,
            listeners = me._listeners[property + 'Change'] || [];
        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i] === callback) {
                listeners.splice(i, 1);
            }
        }
        this._listeners[property + 'Change'] = listeners;

        return me;
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

    for (var staticCore in ya.mixins.CoreStatic) {

        if (ya.mixins.CoreStatic.hasOwnProperty(staticCore)) {
            Core[staticCore] = ya.mixins.CoreStatic[staticCore];
        }

    }

    // Add Getters and Setters.
    Core.$mixin(ya.mixins.GetSet);

    // Add observable methods.
    Core.$mixin(ya.mixins.Observable);

    return Core;
}()));