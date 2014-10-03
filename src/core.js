ya.$set('ya', 'Core', (function () {
    "use strict";

    var ya = window.ya;

    /**
     * @namespace ya
     * @class Core
     * @constructor
     */
    function Core() {
        this.set('listeners', {});
        this.set('suspendEvents', false);
        this.bindMethods.apply(this, arguments);
        this.init.apply(this, arguments);
    }

    /**
     @method init
     @abstract
     */
    Core.prototype.init = function (opts) {
        return this
            .initConfig(opts)
            .initDefaults()
            .initRequired();
    };


    /**
     @method initDefaults
     */
    Core.prototype.initConfig = function (opts) {
        return this;
    };


    /**
     @method initDefaults
     */
    Core.prototype.initDefaults = function () {
        return this;
    };

    /**
     @method initRequired
     @abstract
     */
    Core.prototype.initRequired = function () {
        return this;
    };

    /**
     * Initialize getters and setters for each property passed
     * in `config` object.
     * To track changes assign an event on for ex. `propertyChange`
     * @example
     * var obj = ya.Core.$create({
     *   config : {
     *     value : true
     *   }
     * });
     *
     * obj.addEventListener(
     *   'valueChange',
     *   function () { alert('property changed!') }
     * );
     * @method initConfig
     * @chainable
     */
    Core.prototype.initConfig = function (opts) {
        var me = this,
            getter,
            setter,
            config,
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

                    return this;
                };
            };

        opts = opts || {};
        config = ya.$merge(me._config, opts.config);

        me.set('initOpts', opts);
        me.set('config', config);

        for (property in config) {
            if (config.hasOwnProperty(property)) {
                init(property);
            }
        }

        return me;
    };

    // Binds custom methods from config object to class instance.
    /**
     * Include to newly created object dynamically defined methods
     * @method bindMethods
     * @param initOpts
     * @chainable
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
     * @method onChange
     * @param property
     * @param callback
     * @chainable
     */
    Core.prototype.onChange = function (property, callback, single) {
        var me = this;

        me.addEventListener(property + 'Change', callback, me, single);

        return me;
    };

    // Unbind callback.
    /**
     * @method unbindOnChange
     * @param property
     * @param callback
     * @chainable
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

    Core.prototype.destroy = function () {
        var me = this,
            config = me._config,
            property;

        me.fireEvent('destroy', me);


        for (property in config) {
            if (config.hasOwnProperty(property)) {
                if (property !== 'id') {
                    config[property] = null;
                }
            }
        }


        for (property in me) {
            if (me.hasOwnProperty(property)) {
                if (property !== '_config') {
                    me[property] = null;
                }
            }
        }

        me._destroyed = true;

        return me;
    };

    // Stores all mixins initializing functions.
    Core.__mixins__ = [];

    // Stores all defaults.
    Core.__defaults__ = [];

    for (var staticCore in ya.mixins.CoreStatic) {

        if (ya.mixins.CoreStatic.hasOwnProperty(staticCore)) {
            Core[staticCore] = ya.mixins.CoreStatic[staticCore];
        }

    }

    // Add Getters and Setters.
    Core.$mixin(ya.mixins.GetSet);

    /**
     * @method set
     * @param property
     * @param value
     * @chainable
     */

    /**
     * @method get
     * @param property
     * @returns {*} value stored under passed property
     */

        // Add observable methods.
    Core.$mixin(ya.mixins.Observable);

    return Core;
}()));