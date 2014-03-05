/*! yamvc v0.2.0 - 2014-03-05 
 *  License:  */
/**
 Main framework object...

 @module ya
 @main ya
 **/
(function (undefined) {
    'use strict';

    var ya = window.ya || {},
        appNamespace = 'app',
        onReadyCallbacks = [],
        readyStateCheckInterval;

    // Run all method when ready
    function run() {
        for (var i = 0, l = onReadyCallbacks.length; i < l; i++) {
            onReadyCallbacks[i]();
        }
    }

    /**
     @class ya
     */

    // Provide way to execute all necessary code after DOM is ready.
    /**
     * @method $onReady
     * @for ya
     * @static
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
     * @method $merge
     * @static
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

    // clone data object
    /**
     *
     * @method $clone
     * @static
     * @param obj
     * @returns {*}
     */
    ya.$clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    /**
     * Set new namespace
     * @method $set
     * @static
     * @param {null||String} module
     * @param {String} namespace
     * @param {*} value
     * @returns {namespace}
     */
    ya.$set = function () {
        var module = arguments.length < 3 ? appNamespace : arguments[0],
            namespaces = arguments.length < 3 ? arguments[0].split('.') : arguments[1].split('.'),
            value = arguments.length < 3 ? arguments[1] : arguments[2],
            pointer = window[module] = window[module] || {},
            current;

        while (namespaces.length) {

            current = namespaces.shift();
            if (namespaces.length === 0) {

                pointer[current] = value;

            } else {

                pointer = pointer[current] = pointer[current] || {};

            }
        }

        return this;
    };

    /**
     * @method $get
     * @static
     * @param module
     * @param namespace
     * @returns {*}
     */
    ya.$get = function () {
        var module = arguments.length < 3 ? appNamespace : arguments[0],
            namespace = arguments.length < 2 ? arguments[0] : arguments[1],
            namespaces = namespace ? (namespace.search(/\./) > 0 ? namespace.split('.') : [namespace]) : [],
            pointer = null,
            current;

        if (namespaces.length) {

            pointer = window[module];

        }

        while (namespaces.length) {

            current = namespaces.shift();
            if (pointer[current]) {

                pointer = pointer[current];

            } else if (current in window) {

                pointer = window[current];
            } else {

                pointer = null;
                break;

            }


        }

        return pointer;
    };

    /**
     *
     * @method $module
     * @static
     * @returns {string}
     */
    ya.$module = function () {
        var module = arguments.length ? arguments [0] : null;

        if (module) {
            appNamespace = module;
        }

        return appNamespace;

    };

    window.ya = ya;
}());
/**
 * @namespace ya.mixins
 * @class Array
 */
ya.$set('ya', 'mixins.Array', {
    /**
     *
     * @param key
     * @returns {Number}
     */
    find: function (key /*[, value]*/) {
        var len = this.length,
            argsLen = arguments.length,
            val = argsLen > 1 ? arguments[1] : null,
            rec;

        while (len--) {

            rec = this[len];
            if (argsLen > 1) {

                if (rec[key] === val) {
                    break;
                }

            } else if (rec === key) {
                break;
            }
        }

        return len;
    },
    /**
     *
     * @param key
     * @returns {Array}
     */
    findAll: function (key /*[, value]*/) {
        var len = this.length,
            argsLen = arguments.length,
            val = argsLen > 1 ? arguments[1] : null,
            result = [],
            rec;

        while (len--) {

            rec = this[len];
            if (argsLen > 1) {

                if (rec[key] === val) {
                    result.push(len);
                }

            } else if (rec === key) {
                result.push(len);
            }
        }

        return result;
    },
    /**
     *
     * @param {Function} fn
     * @returns {Array}
     */
    findAllByFn: function (fn) {
        var len = this.length,
            result = [];

        while (len--) {

            if (fn(this[len])) {

                result.push(len);

            }

        }

        return result;
    },
    each: Array.prototype.forEach || function (fun /*, thisArg */) {

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t)
                fun.call(thisArg, t[i], i, t);
        }
    }
});
/**
 * @namespace ya.mixins
 * @class CoreStatic
 */
ya.$set('ya', 'mixins.CoreStatic', {
    /**
     *
     * @param opts
     * @returns {Function}
     */
    $extend: function (opts) {
        opts = opts || {};

        var Parent = this,
            _super = this.prototype,
            defaults = ya.$merge(Parent.__defaults__ || {}, opts.defaults),
            mixins = (Parent.__mixins__ || []).concat(opts.mixins || []),
            statics = opts.static || {},
            fnTest = /xyz/.test(function () {
                var xyz;
            }) ? /\b__super\b/ : /.*/,
            makeSuper = function (name, fn) {
                return function () {
                    var tmp = this.__super;
                    this.__super = _super[name];
                    var ret = fn.apply(this, arguments);
                    this.__super = tmp;

                    return ret;
                };
            },
            __hasProp = {}.hasOwnProperty,
            __Class,
            __extends;

        __Class = function () {
            var key;
            //
            this._config = {};

            // Initialize defaults.
            for (key in defaults) {
                if (__hasProp.call(defaults, key)) this._config[key] = defaults[key];
            }
            ya.Core.apply(this, arguments);
        };

        __extends = function (child, parent) {
            // inherited
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function Instance() {
                this.constructor = child;
            }

            Instance.prototype = parent.prototype;
            child.prototype = new Instance();

            for (var staticCore in ya.mixins.CoreStatic) {

                if (ya.mixins.CoreStatic.hasOwnProperty(staticCore)) {
                    child[staticCore] = ya.mixins.CoreStatic[staticCore];
                }

            }

            for (var name in opts) {
                // Check if we're overwriting an existing function
                child.prototype[name] = typeof opts[name] == "function" &&
                    typeof _super[name] == "function" && fnTest.test(opts[name]) ?
                    makeSuper(name, opts[name]) :
                    opts[name];
            }

            child.__mixins__ = mixins.slice();
            child.__defaults__ = defaults;

            // Add external mixins.
            while (mixins.length) {
                var mixin = mixins.pop();
                child.$mixin(mixin);
            }

            // Make method static.
            for (var stat in statics) {
                if (__hasProp.call(statics, stat)) {
                    child['$' + stat] = statics[stat];
                }
            }

            return child;
        };

        __extends(__Class, Parent);

        if (opts.alias) {

            ya.$set(opts.module || ya.$module(), opts.alias, opts.singleton ? new __Class() : __Class);

        }

        return __Class;
    },
    $create: function (opts) {
        var Obj = this;
        // for jshint
        return new Obj(opts);
    },
    $mixin: function (obj, mixin) {
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
    }
});

/**
 * @namespace ya.mixins
 * @class GetSet
 */
ya.$set('ya', 'mixins.GetSet', {
    /**
     *
     * @param property
     * @param value
     * @returns {this}
     *
     */
    set: function (property, value) {
        var p = "_" + property,
            oldVal = this[p];
        if (value !== oldVal) {
            this[p] = value;
            this.fireEvent(property + 'Change', this, value, oldVal);
        }
        return this;
    },
    /**
     *
     * @param property
     * @returns {*}
     *
     */
    get: function (property) {
        return this["_" + property];
    }
});

/**
 * @namespace ya.mixins
 * @class Observable
 */
ya.$set('ya', 'mixins.Observable', {
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
            evName = shift.call(arguments),
            scope;

        scope = shift.call(arguments);
        for (var i = 0, li = this._listeners[evName] || [], len = li.length; i < len; i++) {
            if (ret) {
                ret = li[i].apply(scope, arguments);
                ret = typeof ret === 'undefined' ? true : ret;
            }
        }
        return ret;
    },

    /**
     * fire event
     * @version 0.1.12
     * @param evName
     * @param callback
     * @returns {this}
     *
     */
    addEventListener: function (evName, callback) {
        var listeners = this._listeners[evName] || [];
        listeners.push(callback);
        this._listeners[evName] = listeners;
        return this;
    },

    /**
     * fire event
     * @version 0.1.12
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
        this.set('suspendEvents', true);
        return this;
    },
    /**
     * resume all events
     */
    resumeEvents: function () {
        this.set('suspendEvents', false);
        return this;
    }
});

/**
 * @namespace ya.mixins
 * @class Selector
 */
ya.$set('ya', 'mixins.Selector', {
    /**
     * check if passed selector match to main DOM element
     * @param selector String with selector
     */
    isQueryMatch: function (selector, el) {
        var match = true, tag, id, classes;

        el = this._el || el;

        if (selector.search(" ") === -1) {
            // If selector is only for one lvl element
            // (ex. div.class and not div .class),
            // find tag,
            tag = selector.match(/^[^\.#]+/gi);
            // find id,
            id = selector.match(/#[^\.#]+/gi);
            // and find classes.
            classes = selector.match(/\.[^\.#]+/gi);

            // Check if tag of the element match to the one founded
            // in selector string.
            if (tag && el.nodeName.toLowerCase() !== tag.pop()) {

                match = false;

            }

            if (classes) {
                // If any classes were founded
                while (classes.length) {

                    // check if the element have all of them.
                    if (!el.classList.contains(classes.pop().substring(1))) {
                        match = false;
                        break;
                    }

                }
            }

            // Do the same with id.
            if (id && el.getAttribute('id') !== id.pop().substring(1)) {

                match = false;

            }

        } else {

            match = false;

        }

        // And return the result.
        return match;

    }
});
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
        this.bindMethods.apply(this, arguments);
        this.init.apply(this, arguments);
    }

    /**
     @method init
     */
    Core.prototype.init = function () {
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
    Core.prototype.onChange = function (property, callback) {
        var me = this;

        me.addEventListener(property + 'Change', callback);

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

    // Stores all mixins initializing functions.
    Core.__mixins__ = [];

    // Stores all defaults.
    Core.__defaults__ = {};

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
/**
 * @namespace ya
 * @class Collection
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Collection',
    defaults: {
        /**
         * @attribute config.namespace
         * @type String Namespace of collection
         * @required
         */
        namespace: null,
        /**
         * @attribute config.namespace
         * @type ya.data.Proxy Instance of proxy for transfering data
         * @required
         */
        proxy: null
    },
    /**
     * @method init
     * initialize collection
     * @param opts
     */
    init: function (opts) {
        var me = this, config;

        me.__super(opts);

        opts = opts || {};
        config = ya.$merge(me._config, opts.config);

        me.set('initOpts', opts);
        me.set('config', config);
        me.set('set', []);
        me.set('cache', []);
        me.set('removed', []);
        me.set('filters', []);

        me.initConfig();
        me.initData();

        return me;
    },
    /**
     * @method initData
     * initialize data
     */
    initData: function () {
        var me = this,
            data = me.getData() || [];

        me.set('raw', data);
        me.prepareData(data);

        return me;
    },
    /**
     * @method forEach
     * @param fn
     * @chainable
     */
    forEach: function (fn) {
        var me = this,
            records = me._set,
            t, len;

        t = Object(records);
        len = t.length >>> 0;
        if (typeof fn !== "function")
            throw new TypeError();

        for (var i = 0; i < len; i++) {
            if (i in t)
                fn.call(me, t[i], i, t);
        }

        return me;
    },
    /**
     * @method push
     * @param records
     * @returns {*}
     * @chainable
     */
    push: function (records) {
        var me = this,
            record,
            ModelDefinition = me.getModel(),
            namespace = me.getNamespace();

        if (!Array.isArray(records)) {
            records = [records];
        }

        while (records.length) {

            record = records.pop();
            record = new ModelDefinition(
                {
                    config: {
                        namespace: namespace,
                        data: record
                    }
                }
            );

            me._cache.push(record);

            me.fireEvent('pushed', me, record);

        }

        me.filter();

        return me;
    },
    // return number of records in collection
    /**
     * @method count
     * @chainable
     * @returns {Number}
     */
    count: function () {
        return this._set.length;
    },
    /**
     * @method clearFilters
     * @chainable
     * @returns {*}
     */
    clear: function () {
        var me = this;

        me.set('set', []);
        me.set('cache', []);
        me.set('removed', []);

        return me;
    },
    /**
     * @method clearFilters
     * @returns {*}
     * @chainable
     */
    clearFilters: function () {
        var me = this;

        //TODO: clear by multiple filters id
        me.set('filters', []);
        me.filter();

        return me;
    },
    /**
     *
     * @method clearFilter
     * @param id
     * @returns {*}
     * @chainable
     */
    clearFilter: function (id) {
        var me = this,
            filters = me._filters,
            filLength,
            filter;

        filLength = filters.length;
        while (filLength--) {

            filter = filters[filLength];
            if (typeof filter !== 'function' && filter.id === id) {

                filters.splice(filLength, 1);

                break;

            }

        }

        me.filter();

        return me;
    },
    /**
     *
     * @method filter
     * @param fn
     * @returns {*}
     * @chainable
     */
    filter: function (fn) {
        var me = this,
            filters = me._filters,
            filterFn,
            passed = true,
            filtered = [],
            records = me._cache,
            filLength = 0,
            id = null;

        if (arguments.length > 1) {
            id = arguments[0];
            fn = arguments[1];
        }


        if (typeof fn === 'function') {

            if (id) {

                filters.push({
                    id: id,
                    fn: fn
                });

            } else {

                filters.push(fn);

            }

            me.fireEvent('beforeFilter', me, filters);

        }

        for (var i = 0, l = records.length; i < l; i++) {

            passed = true;
            filLength = filters.length;
            while (filLength--) {

                filterFn = typeof filters[filLength] === 'function' ? filters[filLength] : filters[filLength].fn;
                passed = passed && filterFn(records[i]);

            }

            if (passed) {

                filtered.push(records[i]);

            }

        }

        me.set('set', filtered);
        me.fireEvent('afterFilter', me, filters);

        return me;
    },
    /**
     * get record at
     * @method getAt
     * @param index
     * @returns {ya.Model}
     */
    getAt: function (index) { // Return record by index.
        return this._set[index];
    },
    /**
     * @method getBy
     * @param fn
     * @returns {Array}
     */
    getBy: function (fn) { // Return all matched record.
        var me = this,
            records = me._set,
            filtered = [];

        for (var i = 0, l = records.length; i < l; i++) {

            if (fn(records[i])) {

                filtered.push(records[i]);

            }

        }
        return filtered;
    },
    /**
     * @param fn
     * @returns {}
     */
    findOneBy: function (fn) { // Return index of first matched record.
        var me = this,
            records = me._set,
            len = records.length;

        while (len--) {

            if (fn(records[len])) break;

        }

        return len;
    },
    /**
     * @param fn
     * @returns {Array}
     */
    getOneBy: function (fn) { // Return first matched record.
        var me = this,
            records = me._set,
            record,
            len = records.length;

        while (len--) {

            if (fn(records[len])) {
                record = records[len];
                break;

            }

        }

        return record;
    },
    /**
     * return real number of records
     * @returns {Number}
     */
    getTotal: function () {
        return this._total;
    },
    /**
     * load data
     * proxy need to be set
     * @param params
     */
    load: function (params) {
        var me = this,
            data = me.get('data'),
            idProperty = me.get('idProperty'),
            deferred = ya.$promise.deferred(),
            namespace = me.getNamespace(),
            action = new ya.data.Action(),
            callback,
            key, i = 0;

        for (key in params) i++;

        if (
            i === 0
            )
            throw new Error('You need to pass at least one condition to load model collection');

        if (!me.getProxy())
            throw new Error('To load collection you need to set proxy');


        callback = function () {

            if (me.getProxy().getStatus() === 'success') {

                me.fireEvent('loaded', me, action.getResponse(), 'read');

            } else {

                me.fireEvent('error', me, 'read');

            }
        };

        action
            .setOptions({
                callback: callback,
                params: params,
                namespace: namespace
            });

        me.getProxy().read(action);

        return deferred.promise;
    },
    save: function () {
        var me = this,
            deferred = ya.$promise.deferred(),
            action,
            toCreate = [],
            toUpdate = [],
            toRemove = me._removed,
            records = me._cache,
            namespace = me.getNamespace(),
            proxy = me.getProxy(),
            toFinish = 0,
            exceptions = [],
            callback,
            record,
            byIdFn;

        for (var i = 0, l = records.length; i < l; i++) {

            record = records[i];
            if (record._isDirty) {

                if (record.hasId()) {

                    toUpdate.push(record._data);

                } else {

                    record._data.__clientId__ = record.get('clientId');
                    toCreate.push(record._data);

                }
            }

        }

        byIdFn = function (record) {
            return function (_record) {
                return record.__clientId__ ?
                    _record.data('__clientId__') === record.__clientId__ :
                    _record.data('id') === record.id;
            };
        };

        callback = function (proxy, action) {

            toFinish--;

            if (action.getStatus() === ya.data.Action.$status.SUCCESS) {

                var response = action.getResponse(),
                    data = response.result,
                    len;

                record = data[0];
                len = data.length;

                // If record has __clientId__ property it's create process
                // or if it has id it's update.
                if (record && (record.__clientId__ || record.id)) {

                    while (len--) {

                        record = me.getOneBy(byIdFn(data[len]));
                        record.setDirty(false);

                        delete record._data.__clientId__;

                    }

                } else { // Else it's remove process.

                    me.set('removed', []);

                }

            } else {

                exceptions.push(action.getResponse().error);

            }

            if (toFinish === 0) {

                if (exceptions.length) {

                    me.fireEvent('error', me, exceptions);

                    deferred.reject({
                        errors: exceptions
                    });

                } else {

                    me.fireEvent('success', me);

                    deferred.resolve({scope: me});

                }

            }

        };

        if (toCreate.length) {

            toFinish++;

            action = new ya.data.Action();

            action
                .setOptions({
                    namespace: namespace,
                    callback: callback
                })
                .setData(toCreate);

            proxy.create(action);

        }

        if (toUpdate.length) {

            toFinish++;

            action = new ya.data.Action();

            action
                .setOptions({
                    namespace: namespace,
                    callback: callback
                })
                .setData(toUpdate);

            proxy.update(action);
        }

        if (toRemove.length) {

            toFinish++;

            action = new ya.data.Action();

            action
                .setOptions({
                    namespace: namespace,
                    callback: callback
                })
                .setData(toRemove);

            proxy.destroy(action);
        }

        return deferred.promise;
    },
    /**
     * Prepare data
     * @private
     * @param data
     * @param {Number||null} total
     * @returns {Collection}
     */
    prepareData: function (data, total) {
        var me = this,
            ModelInstance = me.getModel(),
            modelConfig = { namespace: me.getNamespace()},
            l = data.length,
            models = [];

        total = total || l;
        for (var i = 0; i < l; i++) {

            modelConfig.data = data[i];
            models.push(new ModelInstance({
                config: modelConfig
            }));

        }

        me.set('cache', models);
        me.set('total', total);

        me.filter();

        return me;
    },
    setData: function () {
        var me = this;

        me.setRawData(data);
        me.prepareData(data);

        return me;
    },
    getData: function () {
        return this._set;
    },
    getRawData: function () {
        return this._raw;
    },
    setRawData: function (data) {

        this.set('raw', data);

        return this;
    },
    isDirty: function () {
        var records = this._cache,
            len = records.length,
            isDirty = false;

        while (len--) {
            if (records[len]._isDirty) {
                isDirty = true;
            }
        }

        if (this._remove) {
            isDirty = true;
        }

        return isDirty;
    }
});

/**
 * @description
 * ## Basic controller usage
 *
 *     @example
 *     var ctl = new Controller({
 *         config: {
 *             name: 'Main',
 *             views: {
 *                 layout: view.$Manager.get('view-0')
 *             },
 *             routes: {
 *                 "page/{\\d+}": 'changePage'
 *             },
 *         },
 *         bindElements : function (){
 *             var me = this;
 *             me.set('$arrowRight', document.querySelector('#arrow-right'));
 *             me.set('$arrowLeft', document.querySelector('#arrow-left'));
 *         },
 *         bindEvents: function () {
 *             var me = this;
 *             me.get('$arrowRight').addEventListener('click', this.nextPage.bind(this));
 *             me.get('$arrowLeft').addEventListener('click', this.prevPage.bind(this));
 *         },
 *         changePage: function (id) {
 *             // changing page mechanism
 *         },
 *         nextPage: function () {
 *             // changing page mechanism
 *         },
 *         prevPage: function () {
 *             // changing page mechanism
 *         }
 *     });
 * @namespace ya
 * @class Controller
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Controller',
    static: {
        id: 0,
        router: null,
        idGenerator: function () {
            return ya.Controller.id++;
        },
        getRouter: function () {
            ya.Controller.$router = ya.Controller.$router || new ya.Router();

            return ya.Controller.$router;
        }
    },
    init: function (opts) {
        var me = this, config;

        opts = opts || {};
        config = ya.$merge(me._config, opts.config);
        config.id = config.id || 'controller-' + ya.Controller.$idGenerator();
        me.router = ya.Controller.$getRouter();

        me.set('initOpts', opts);
        me.set('config', config);
        me.set('routes', config.routes || {});
        me.set('events', config.events || {});
        me.set('views', config.views || {});

        me.initConfig();

        ya.$onReady(function () {
            me.restoreRouter();
        });

        return me;
    },
    initConfig: function () {
        ya.Core.prototype.initConfig.apply(this);
        var me = this,
            routes = me.get('routes'),
            events = me.get('events'),
            views = [],
            rx = new RegExp('\\$([^\\s]+)'),
            matches, view, l, obj;

        if (routes) {
            for (var k in routes) {
                if (routes.hasOwnProperty(k)) {
                    var callback = me[routes[k]].bind(me);
                    router.when(k, callback);
                }
            }
        }

        if (events) {

            for (var e in events) {

                if (events.hasOwnProperty(e)) {

                    obj = {};
                    obj[e] = events[e];
                    ya.event.$dispatcher.add(me, obj);

                    matches = e.match(rx);
                    if (matches) {

                        if (views.indexOf(matches[1]) < 0) {

                            views.push(matches[1]);

                        }

                    } else {

                        throw new Error('Event query should begin from id of the view (current query: ' + e + ')');

                    }

                }

            }

            l = views.length;
            while (l--) {

                view = ya
                    .view.$Manager
                    .get(views[l]);
                if (view) {

                    if (view.isInDOM()) {

                        me.resolveEvents(view);

                    } else {

                        view.addEventListener('render', me.resolveEvents.bind(me));

                    }

                }
            }

        }
        return this;
    },
    resolveEvents: function (view) {
        var events = this.get('events'),
            newScope = function (func, scope, arg) {
                return func.bind(scope, arg);
            },
            rx = new RegExp('\\$([^\\s]+)'),
            matches,
            viewEvents,
            elements,
            selector,
            scope;

        for (var query in events) {

            if (events.hasOwnProperty(query)) {

                matches = query.match(rx);
                if (matches && matches[1] === view.getId()) {
                    viewEvents = events[query];
                    selector = query.split(" ").slice(1);
                    if (selector.length) {

                        elements = view.get('el').querySelectorAll(selector.join(" "));

                    } else {

                        elements = [view.get('el')];

                    }

                    for (var i = 0, l = elements.length; i < l; i++) {

                        for (var event in viewEvents) {

                            if (viewEvents.hasOwnProperty(event)) {

                                scope = newScope(viewEvents[event], this, view);

                                elements[i].addEventListener(event, scope);

                            }

                        }

                    }
                }


            }

        }

    },
    getRouter: function () {
        return router;
    },
    restoreRouter: function () {
        var me = this;

        me.getRouter().restore();

        return me;
    },
    redirectTo: function (path) {

        window.location.hash = path;

        return this;
    }
});
/**
 * @namespace ya.data
 * @class Action
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'data.Action',
    static: {
        status: {
            PENDING: 0,
            SUCCESS: 1,
            FAIL: 2
        }
    },
    /**
     * @methods init
     * @param opts
     */
    init: function (opts) {
        var me = this, config;

        opts = opts || {};

        me.__super(opts);
        config = ya.$merge(me._config, opts.config);

        me.set('initOpts', opts);
        me.set('config', config);
        me.set('response', {});
        me.set('status', ya.data.Action.$status.PENDING);

        me.initConfig();
    },
    /**
     * @methods init
     * @param data
     * @returns {*}
     */
    setData: function (data) {
        this.set('data', data);
        return this;
    },
    /**
     * @methods getData
     * @returns {Function}
     */
    getData: function () {
        return this._data;
    },
    /**
     * @methods setOptions
     * @param opts
     * @returns {*}
     */
    setOptions: function (opts) {
        this.set('options', opts);
        return this;
    },
    /**
     * @methods getOptions
     * @returns {Object}
     */
    getOptions: function () {
        return this._options;
    },
    /**
     * @methods getOption
     * @param name
     * @returns {*}
     */
    getOption: function (name) {
        return this._options[name];
    },
    /**
     * @methods setResponse
     * @param response
     * @returns {*|StyleSheet|this|set}
     */
    setResponse: function (response) {
        return this.set('response', response);
    },
    /**
     * @methods getResponse
     * @returns {Object}
     */
    getResponse: function () {
        return this.get('response');
    },
    /**
     * @methods setStatus
     * @param status
     * @returns {Number}
     */
    setStatus: function (status) {
        var statuses = ya.data.Action.$status,
            check = false, st;

        for (st in statuses) {
            if (statuses.hasOwnProperty(st) && statuses[st] === status)
                check = true;
        }

        if (!check)
            throw new Error('ya.data.Action: Wrong status');

        return this.set('status', status);
    },
    /**
     * @methods getStatus
     * @returns {Object}
     */
    getStatus: function () {
        return this.get('status');
    }
});

/**
 * @namespace ya.data
 * @class Proxy
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'data.Proxy',
    /**
     * @methods init
     * @param opts
     */
    init: function (opts) {
        var me = this, config;

        opts = opts || {};

        me.__super(opts);

        config = ya.$merge(me._config, opts.config);

        me.set('initOpts', opts);
        me.set('config', config);

        me.initConfig();

    },
    /**
     * @methods read
     * @param action
     * @returns {*}
     */
    read: function (action) {
        var me = this,
            opts,
            id;

        if (!(action instanceof ya.data.Action))
            throw new Error('ya.data.Proxy: read argument action should be instance of ya.data.Action');

        opts = action.getOptions();
        id = opts.params && opts.params.id;

        if (!action.getOption('namespace'))
            throw new Error('ya.data.Proxy: namespace should be set');

        if (typeof id === 'undefined') {
            me.readBy(action);
        } else {
            me.readById(action);
        }

        return me;
    },
    /**
     * @methods create
     * @param action
     * @returns {*}
     */
    create: function (action) {
        var me = this;

        if (!(action instanceof ya.data.Action))
            throw new Error('ya.data.Proxy: create argument action should be instance of ya.data.Action');

        if (!action.getOption('namespace'))
            throw new Error('ya.data.Proxy: namespace should be set');

        if (!action.getData() || typeof action.getData() !== 'object')
            throw new Error('ya.data.Proxy: Data should be object');

        return me;
    },
    /**
     * @methods update
     * @param action
     * @returns {*}
     */
    update: function (action) {
        var me = this;

        if (!(action instanceof ya.data.Action))
            throw new Error('ya.data.Proxy: update argument action should be instance of ya.data.Action');

        if (!action.getOption('namespace'))
            throw new Error('ya.data.Proxy: namespace should be set');

        if (!action.getData() || typeof action.getData() !== 'object')
            throw new Error('ya.data.Proxy: Data should be object');

        return me;
    },
    /**
     * @methods destroy
     * @param action
     * @returns {*}
     */
    destroy: function (action) {
        var me = this;

        if (!(action instanceof ya.data.Action))
            throw new Error('ya.data.Proxy: destroy argument action should be instance of ya.data.Action');

        if (!action.getOption('namespace'))
            throw new Error('ya.data.Proxy: namespace should be set');

        if (!action.getData() || typeof action.getData() !== 'object')
            throw new Error('Data should be pass as object');

        return me;
    }
});

/**
 * @description
 * ## Localstorage
 *   Proxy provides access to localStorage object. Gives possibility to retrieve data
 *   by id or trough parameters.
 * @namespace ya.data.proxy
 * @class Localstorage
 * @extends ya.data.Proxy
 */
ya.data.Proxy.$extend({
    module: 'ya',
    alias: 'data.proxy.Localstorage',
    static: {
        /**
         *
         * @param tables
         */
        clear: function (tables) {
            var len = 0, table;
            if (!tables) {
                for (var store in localStorage) {
                    delete localStorage[store];
                    delete localStorage[store + '$Sequence'];
                }
            } else {
                if (!Array.isArray(tables)) {
                    tables = [tables];
                }
                len = tables.length;
                while (len--) {
                    table = tables[len];
                    delete localStorage[table];
                    delete localStorage[table + '$Sequence'];
                }
            }
        }
    },
    /**
     * @method readBy
     * @param action
     * @returns {Localstorage}
     */
    readBy: function (action) {
        var me = this,
            opts = action.getOptions(),
            namespace = opts.namespace,
            callback = opts.callback,
            limit = opts.limit || null,
            offset = opts.offset || 0,
            filters = opts.filters || [],
            sorters = opts.sorters || [],
            response = {},
            filtered = [],
            records = [],
            meet = true,
            total = 0,
            async,
            operator,
            property,
            sorter,
            sorterFn,
            order,
            len;

        sorterFn = function (a, b) {
            var va = "" + a[property],
                vb = "" + b[property],
                alc = va.toLowerCase(), blc = vb.toLowerCase();
            return (alc > blc ? 1 : alc < blc ? -1 : va > vb ? 1 : va < vb ? -1 : 0) * (order.toLowerCase() === 'desc' ? -1 : 1);
        };

        async = function () {

            if (localStorage[namespace]) {
                records = JSON.parse(localStorage[namespace]);

                // firstly we need to filter records
                for (var i = 0, l = records.length; i < l; i++) {
                    meet = true;
                    len = filters.length;
                    while (len--) {
                        if (filters[len].length > 3) {
                            operator = filters[len][0];
                        } else {
                            operator = '&&';
                        }
                        if (operator === '&&') {
                            meet = me.executeCondition(records[i], filters[len]) && meet;
                        } else if (operator === '||') {
                            meet = me.executeCondition(records[i], filters[len]) || meet;
                        }
                    }

                    if (meet) {
                        filtered.push(records[i]);
                    }

                }

                records = filtered;
                total = filtered.length;

                // next we do sorting
                len = sorters.length;
                while (len--) {
                    sorter = sorters[len];
                    property = sorter[0];
                    order = sorter[1] || 'ASC';
                    records.sort(sorterFn);
                }
                // and take care about offset and limit
                if (!limit) {
                    limit = records.length - offset;
                }

                if (offset > 0 || limit) {
                    records = records.splice(offset, limit);
                }
            }

            response.total = total;
            response.result = records;

            action
                .setStatus(ya.data.Action.$status.SUCCESS)
                .setResponse(response);

            callback(me, action);

        };

        setTimeout(function () {

            try {

                async();

            } catch (e) {

                response.error = e;
                callback(me, action);

            }
        }, 0);

        return me;
    },
    /**
     *
     * @method readById
     * @param action
     * @returns {Localstorage}
     */
    readById: function (action) {
        var me = this,
            opts = action.getOptions(),
            params = opts.params,
            namespace = opts.namespace,
            callback = opts.callback,
            id = params.id,
            records = [],
            result = {},
            response = {},
            async;

        async = function () {

            if (localStorage[namespace]) {

                records = JSON.parse(localStorage[namespace]);
                for (var i = 0, l = records.length; i < l; i++) {

                    if (records[i].id === id) {
                        result = records[i];
                    }

                }

                if (typeof result.id !== 'undefined') {

                    response.total = 1;
                    response.result = result;

                    action
                        .setStatus(ya.data.Action.$status.SUCCESS)
                        .setResponse(response);

                    callback(me, action);

                    return me;
                }
            }

            me.setStatus(ya.data.Action.$status.FAIL);
            response.error = new Error("Not found");
            callback(me, action);
        };

        setTimeout(async, 0);

        return me;
    },
    /**
     * @methods create
     * @param action
     * @returns {Localstorage}
     */
    create: function (action) {
        var me = this,
            data = action.getData(),
            namespace = action.getOption('namespace'),
            callback = action.getOption('callback'),
            records = [],
            sequence = 1,
            response = {},
            result,
            async;

        me.__super.apply(this, arguments);

        if (localStorage[namespace]) {

            records = JSON.parse(localStorage[namespace]);
            sequence = localStorage[namespace + "$Sequence"];

        }

        if (Array.isArray(data)) {

            result = [];
            for (var i = 0, l = data.length; i < l; i++) {

                // Add id to the new record,
                data[i].id = sequence++;

                // remove client id,
                delete data[i].__clientId__;

                // push to records
                records.push(data[i]);

                // and to return array.
                result.push(data[i]);
            }

        } else {

            data.id = sequence++;

            delete data.__clientId__;

            records.push(data);

            result = data;

        }

        async = function () {
            try {

                localStorage[namespace] = JSON.stringify(records);
                localStorage[namespace + "$Sequence"] = sequence;

                response.result = result;

                action
                    .setStatus(ya.data.Action.$status.SUCCESS)
                    .setResponse(response);

            } catch (e) {

                response.error = e;

                action
                    .setStatus(ya.data.Action.$status.FAIL)
                    .setResponse(response);

            }

            callback(me, action);
        };

        setTimeout(async, 0);

        return me;
    },
    /**
     * @methods update
     * @param action
     * @returns {Localstorage}
     */
    update: function (action) { //
        var me = this,
            data = action.getData(),
            namespace = action.getOption('namespace'),
            callback = action.getOption('callback'),
            records = [],
            result,
            response = {},
            id, l, l2, async;

        async = function () { // update record asynchronously
            if (localStorage[namespace]) { // but only if namespace for saving object exist

                records = JSON.parse(localStorage[namespace]);

                if (Array.isArray(data)) {

                    result = [];
                    l = data.length;
                    while (l--) {
                        l2 = records.length;
                        id = data[l].id;
                        while (l2--) {
                            if (records[l2].id === id) {
                                records[l2] = data[l];
                                result.splice(0, 0, data[l]);
                            }
                        }
                    }

                } else {
                    l = records.length;
                    id = data.id;
                    while (l--) {
                        if (records[l].id === id) {
                            result = records[l] = data;
                        }
                    }

                }

                try {

                    localStorage[namespace] = JSON.stringify(records);
                    response.success = true;
                    response.result = result;

                    action
                        .setStatus(ya.data.Action.$status.SUCCESS)
                        .setResponse(response);

                } catch (e) {

                    response.success = false;
                    response.error = e;

                    action
                        .setStatus(ya.data.Action.$status.FAIL)
                        .setResponse(response);

                }

                callback(me, action);

                return me;
            }

            response.success = false;
            response.error = new Error("Not found");

            action
                .setStatus(ya.data.Action.$status.FAIL)
                .setResponse(response);

            callback(me, action);
        };

        setTimeout(async, 0);
        return me;
    },
    /**
     * @methods destroy
     * @param action
     * @returns {Localstorage}
     */
    destroy: function (action) {
        var me = this,
            data = action.getData(),
            namespace = action.getOption('namespace'),
            callback = action.getOption('callback'),
            records = [],
            response = {},
            id, l, l2, async;

        async = function () {

            if (localStorage[namespace]) {

                records = JSON.parse(localStorage[namespace]);

                if (Array.isArray(data)) {

                    l = data.length;
                    while (l--) {
                        l2 = records.length;
                        id = data[l].id;
                        while (l2--) {
                            if (records[l2].id === id) {
                                records.splice(l2, 1);
                            }
                        }
                    }

                } else {

                    l = records.length;
                    id = data.id;
                    while (l--) {
                        if (records[l].id === id) {
                            records.splice(l, 1);
                        }
                    }

                }

                try {

                    localStorage[namespace] = JSON.stringify(records);
                    response.success = true;

                    action
                        .setStatus(ya.data.Action.$status.SUCCESS)
                        .setResponse(response);

                } catch (e) {

                    response.success = false;
                    response.error = e;

                    action
                        .setStatus(ya.data.Action.$status.FAIL)
                        .setResponse(response);

                }
                callback(me, action);
                return me;
            }

            response.success = false;
            response.error = new Error("Not found");

            action
                .setStatus(ya.data.Action.$status.FAIL)
                .setResponse(response);

            callback(me, action);

        };

        setTimeout(async, 0);

        return me;
    },
    /**
     * @methods executeCondition
     * @param record
     * @param filter
     * @returns {boolean}
     */
    executeCondition: function (record, filter) {
        var result = false, condition, property, value, regex;
        if (filter.length > 3) {
            property = filter[1];
            condition = filter[2];
            value = filter[3];
        } else {
            property = filter[0];
            condition = filter[1];
            value = filter[2];
        }
        switch (condition) {
            case '>' :
                if (record[property] > value) {
                    result = true;
                }
                break;
            case '<' :
                if (record[property] < value) {
                    result = true;
                }
                break;
            case '>=' :
                if (record[property] >= value) {
                    result = true;
                }
                break;
            case '<=' :
                if (record[property] <= value) {
                    result = true;
                }
                break;
            case 'like' :
                if (value.charAt(0) !== '%') {
                    value = "^" + value;
                }
                if (value.charAt(value.length - 1) !== '%') {
                    value = value + "$";
                }
                value = value.replace(/%/g, "");
                regex = new RegExp(value);
                if (regex.test(record[property])) {
                    result = true;
                }
                break;
        }
        return result;
    }
});

/**
 * @namespace ya.event
 * @class $dispatcher
 * @extends ya.Core
 * @static
 */
ya.Core.$extend({
    module : 'ya',
    singleton : true,
    alias : 'event.$dispatcher',
        defaults: {
            delegates: null
        },
        /**
         * @methods init
         * @param opts
         * @returns {Dispatcher}
         */
        init: function (opts) {
            // Standard way of initialization.
            var me = this, config;

            me.__super(opts);

            opts = opts || {};
            config = ya.$merge(me._config, opts.config);

            me.set('initOpts', opts);
            me.set('config', config);

            me.initConfig();

            return me;
        },
    /**
     * @methods initConfig
     * @returns {*}
     */
        initConfig: function () {
            var me = this;

            // After calling parent method
            me.__super.apply(me, arguments);

            // set defaults.
            me.setDelegates([]);

            return me;
        },
        /**
         * @methods add
         * @param scope
         * @param e
         * @returns {Dispatcher}
         */
        add: function (scope, e) {
            var me = this,
                selector = Object.keys(e).pop();

            me.getDelegates().push({
                selector: selector,
                scope: scope,
                events: e[selector]
            });

            return me;
        },
        /**
         * @methods apply
         * @methods apply
         * @param view
         */
        apply: function (view) {
            // Apply delegated events.
            var me = this,
            // Get all delegated events.
                delegates = me.getDelegates(),
            // Define array in which matched events from delegation array
            // will be stored.
                matchPos = [],
            // Cache new view in other variable.
                newView = view,
            // Define array for elements which match to last part
            // of query from delegated event object
                els = [],
            // Function which will be used to match if there are any
            // delegated events for particular view.
                matchIdFn = function (r) {
                    return r.selector.search(regExp) >= 0;

                },
                isQueryMatch = ya.mixins.Selector.isQueryMatch,
                __findAllByFn = ya.mixins.Array.findAllByFn,
                __each = ya.mixins.Array.each,
            // Other variables which need to be defined.
                selector, delegate, regExp, cpSelector, e;


            while (view) {
                // If view is not null define regexp for
                // searching view id in delegated event
                // query.
                regExp = new RegExp('^\\$' + view.getId() + "[\\s]");
                // Get position for events which were matched.
                matchPos = __findAllByFn.call(delegates, matchIdFn);
                if (matchPos.length) {
                    /*jshint -W083 */
                    // If we found any events which need to be delegated,
                    __each.call(matchPos, function (r) {
                        // iterate through all of them.
                        // As first step clear the array of elements
                        els.length = 0;
                        delegate = delegates[r];
                        //
                        selector = delegate
                            .selector
                            .split(" ");
                        // Remove item id from selectors array.
                        selector.shift();

                        if (selector.length) {
                            // If still anything left get last part
                            // from query and find in new view elements
                            // which match to the selector.
                            els = newView.querySelectorAll(selector.pop());
                            // Copy array with rest of them
                            cpSelector = selector.slice();
                            __each.call(els, function (el) {
                                // and iterate through all founded elements.
                                if (cpSelector.length) {

                                    var node = el,
                                        lastSelector = cpSelector.pop();
                                    while (view.getId() !== node.getAttribute('id')) {

                                        if (isQueryMatch(lastSelector, node)) {

                                            if (cpSelector.length === 0) {

                                                me.assignEvents(el, delegate, view);

                                                break;
                                            }
                                            lastSelector = cpSelector.pop();

                                        }
                                        node = node.parentNode;

                                    }

                                } else {

                                    me.assignEvents(el, delegate, view);

                                }

                            });

                        }

                    });

                }

                view = view.getParent();


            }


        },
        assignEvents: function (el, delegate, view) {
            var e = delegate.events,
                eType;

            for (eType in e) {

                if (e.hasOwnProperty(eType)) {

                    el.addEventListener(eType, e[eType].bind(delegate.scope, view), false);

                }

            }
        },
        /**
         * Clear delegates array
         * @returns {Dispatcher}
         */
        clear: function () {
            this.getDelegates().length = 0;
            return this;
        }
    });

/**
 * Created by sebastian on 01.03.14.
 */

/**
 * @namespace ya
 * @class Model
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Model',
    static: {
        id: 0,
        /**
         * @for Model
         * @method $idGenerator
         * @static
         * @returns {number}
         */
        idGenerator: function () {
            return ya.Model.$id++;
        }
    },
    defaults: {
        /**
         * @attribute config.idProperty
         * @type String key under which id is stored
         * @default id
         * @required
         */
        idProperty: 'id',
        /**
         * @attribute config.proxy
         * @type ya.data.Proxy
         */
        proxy: null
    },
    /**
     * @method init
     * @param opts
     */
    init: function (opts) {
        var me = this, config;

        me.__super(opts);

        opts = opts || {};
        config = ya.$merge(me._config, opts.config);

        me.set('initOpts', opts);
        me.set('config', config);
        me.set('isDirty', true);

        me.initConfig();
        me.initData();

    },
    /**
     * @method initConfig
     * @returns {Model}
     */
    initConfig: function () {
        var me = this,
            config = me._config;

        if (!config.namespace)
            throw new Error("Model need to have namespace");

        if (!config.data)
            config.data = {};

        me.set('clientId', config.namespace + '-' + ya.Model.$idGenerator());

        me.__super();

        return me;
    },
    /**
     * @method initData
     */
    initData: function () {
        var me = this;

        me.set('data', me.getData() || {});

        return me;
    },
    /**
     * @method setDataProperty
     * @param property
     * @param value
     */
    setDataProperty: function (property, value) {
        var me = this,
            data = me._data,
            oldVal = data[property];
        if (value !== oldVal) {
            data[property] = value;
            me.set('isDirty', true);
            me.fireEvent('data' + property.charAt(0).toUpperCase() + property.slice(1) + 'Change', me, value, oldVal);
        }
    },
    /**
     * @method getDataProperty
     * @param property
     * @returns {*}
     */
    getDataProperty: function (property) {
        return this.get('data')[property];
    },
    /**
     * @method data
     * @param property name of property in data
     * @param data Optional | if passed data will be set
     * @returns {*}
     *
     */
    data: function (property, data) {
        // `data` function is an alias for `setDataProperty` and `getDataProperty` methods.
        // If two arguments are passed data will be set and
        // in other case data will be returned.
        var me = this,
            len = arguments.length,
            key;

        if (len > 1) {

            this.setDataProperty.apply(this, arguments);

        } else {

            if (typeof property === 'object') {

                for (key in property) {

                    if (property.hasOwnProperty(key)) {

                        me.setDataProperty(key, property[key]);

                    }

                }

            } else {
                return this.getDataProperty.apply(this, arguments);
            }

        }

        return me;
    },
    /**
     * @method clear
     */
    clear: function () {
        var me = this,
            data = me.get('data'),
            key;

        for (key in data) {
            if (data.hasOwnProperty(key)) {
                me.data(key, null);
            }
        }
        me.set('data', {});
        me.fireEvent('dataChange', me, data);
    },
    /**
     * @method load
     * @param params
     */
    load: function (params) {
        var me = this,
            data = me.get('data'),
            idProperty = me.getIdProperty(),
            deferred = ya.$promise.deferred(),
            action = new ya.data.Action(),
            opts = {},
            response;

        if (
            typeof params[idProperty] === 'undefined' && typeof data[idProperty] === 'undefined'
            )
            throw new Error('You need to pass id to load model');

        params[idProperty] = data[idProperty];

        opts.namespace = me.getNamespace();
        opts.params = params;
        opts.callback = function () {

            response = me.getProxy().getResponse();

            if (me.getProxy().getStatus() === 'success') {

                me.set('isDirty', false);
                me.set('data', response);

                deferred.resolve({scope: me, response: response, action: 'read'});
                me.fireEvent('loaded', me, response, 'read');

            } else {

                deferred.reject({scope: me, response: response, action: 'read'});
                me.fireEvent('error', me, response, 'read');

            }

        };

        action.setOptions(opts);

        me.getProxy().read(action);

        return deferred.promise;
    },
    /**
     * @method save
     * @returns {boolean}
     */
    save: function () {
        var me = this,
            data = me.get('data'),
            idProperty = me.getIdProperty(),
            deferred = ya.$promise.deferred(),
            action = new ya.data.Action(),
            proxy = me.getProxy(),
            opts = {},
            response,
            type;

        if (me.get('isProcessing') || !me.get('isDirty')) {
            return false;
        }

        me.set('isProcessing', true);

        opts.namespace = me.getNamespace();
        opts.callback = function (proxy, action) {

            response = action.getResponse();

            me.set('isProcessing', false);
            if (action.getStatus() === ya.data.Action.$status.SUCCESS) {

                me.set('isDirty', false);
                me.set('data', response.result);

                deferred.resolve({scope: me, action: action, type: type});
                me.fireEvent('saved', me, action, type);

            } else {

                deferred.reject({scope: me, action: action, type: type});
                me.fireEvent('error', me, action, type);

            }

        };

        action
            .setOptions(opts)
            .setData(data);


        if (typeof data[idProperty] === 'undefined') {

            type = 'create';
            proxy.create(action);

        } else {

            type = 'update';
            proxy.update(action);

        }

        return deferred.promise;
    },
    /**
     * @method remove
     */
    remove: function () {
        var me = this,
            data = me.get('data'),
            idProperty = me.getIdProperty(),
            deferred = ya.$promise.deferred(),
            action = new ya.data.Action(),
            proxy = me.getProxy(),
            opts = {},
            response;

        if (typeof data[idProperty] === 'undefined')
            throw new Error('Can not remove empty model');

        opts.namespace = me.getNamespace();
        opts.callback = function (proxy, action) {

            response = action.getResponse();

            if (action.getStatus() === ya.data.Action.$status.SUCCESS) {

                me.set('isDirty', false);
                me.set('data', {});

                deferred.resolve({scope: me, action: action, type: 'remove'});
                me.fireEvent('removed', me, 'remove');

            } else {

                deferred.reject({scope: me, action: action, type: 'remove'});
                me.fireEvent('error', me, 'remove');

            }

        };

        action
            .setOptions(opts)
            .setData(data);

        proxy.destroy(action);
        proxy.destroy(action);

        return deferred.promise;
    },
    /**
     * @method hasId
     * @returns {boolean}
     */
    hasId: function () {
        return !!this._data[this._config.idProperty];
    },
    /**
     * @method setDirty
     * @param dirty
     * @returns {*}
     */
    setDirty: function (dirty) {
        this.set('isDirty', !!dirty);
        return this;
    },
    /**
     * @method isDirty
     * @returns {*}
     */
    isDirty: function () {
        return this._isDirty;
    }
});

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {
            },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-01-07
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

if ("document" in self && !("classList" in document.createElement("_"))) {

    (function (view) {

        "use strict";

        if (!('Element' in view)) return;

        var
            classListProp = "classList",
            protoProp = "prototype",
            elemCtrProto = view.Element[protoProp],
            objCtr = Object,
            strTrim = String[protoProp].trim || function () {
                return this.replace(/^\s+|\s+$/g, "");
            },
            arrIndexOf = Array[protoProp].indexOf || function (item) {
                var
                    i = 0,
                    len = this.length;

                for (; i < len; i++) {
                    if (i in this && this[i] === item) {
                        return i;
                    }
                }
                return -1;
            },
        // Vendors: please allow content code to instantiate DOMExceptions

            DOMEx = function (type, message) {
                this.name = type;
                this.code = DOMException[type];
                this.message = message;
            },
            checkTokenAndGetIndex = function (classList, token) {
                if (token === "") {
                    throw new DOMEx(
                        "SYNTAX_ERR",
                        "An invalid or illegal string was specified"
                    );
                }
                if (/\s/.test(token)) {
                    throw new DOMEx(
                        "INVALID_CHARACTER_ERR",
                        "String contains an invalid character"
                    );
                }
                return arrIndexOf.call(classList, token);
            },
            ClassList = function (elem) {
                var
                    trimmedClasses = strTrim.call(elem.getAttribute("class") || ""),
                    classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [],
                    i = 0,
                    len = classes.length;

                for (; i < len; i++) {
                    this.push(classes[i]);
                }

                this._updateClassName = function () {
                    elem.setAttribute("class", this.toString());
                };
            },
            classListProto = ClassList[protoProp] = [],
            classListGetter = function () {
                return new ClassList(this);
            };
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
        DOMEx[protoProp] = Error[protoProp];
        classListProto.item = function (i) {
            return this[i] || null;
        };
        classListProto.contains = function (token) {
            token += "";
            return checkTokenAndGetIndex(this, token) !== -1;
        };
        classListProto.add = function () {
            var
                tokens = arguments, i = 0, l = tokens.length, token, updated = false;
            do {
                token = tokens[i] + "";
                if (checkTokenAndGetIndex(this, token) === -1) {
                    this.push(token);
                    updated = true;
                }
            }
            while (++i < l);

            if (updated) {
                this._updateClassName();
            }
        };
        classListProto.remove = function () {
            var
                tokens = arguments, i = 0, l = tokens.length, token, updated = false;

            do {
                token = tokens[i] + "";
                var index = checkTokenAndGetIndex(this, token);
                if (index !== -1) {
                    this.splice(index, 1);
                    updated = true;
                }
            }
            while (++i < l);

            if (updated) {
                this._updateClassName();
            }
        };
        classListProto.toggle = function (token, forse) {
            token += "";

            var
                result = this.contains(token),
                method = result ?
                    forse !== true && "remove"
                    :
                    forse !== false && "add"
                ;

            if (method) {
                this[method](token);
            }

            return !result;
        };
        classListProto.toString = function () {
            return this.join(" ");
        };

        if (objCtr.defineProperty) {
            var classListPropDesc = {
                get: classListGetter, enumerable: true, configurable: true
            };
            try {
                objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
            } catch (ex) { // IE 8 doesn't support enumerable:true
                if (ex.number === -0x7FF5EC54) {
                    classListPropDesc.enumerable = false;
                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                }
            }
        } else if (objCtr[protoProp].__defineGetter__) {
            elemCtrProto.__defineGetter__(classListProp, classListGetter);
        }

    }(self));

}
/**
 * @author angularjs
 * @contributed mkalafior
 * @namespace ya
 * @class $promise
 * @static
 */
ya.$set('ya', '$promise', function (undefined) {
    "use strict";

    var ya = window.ya || {},
        isFunction = function (func) {
            return typeof func === 'function';
        },
        forEach = ya.mixins.Array.each,
        _promise;


    /**
     * Constructs a promise manager.
     * @returns {object} Promise manager.
     */
    function promise(exceptionHandler) {

        /**
         * @method deferred
         * @static
         * @description
         * Creates a `Deferred` object which represents a task which will finish in the future.
         *
         * @returns {Deferred} Returns a new instance of deferred.
         */
        var defer = function () {
            var pending = [],
                value, deferred;

            deferred = {
                resolve: function (val) {
                    if (pending) {
                        var callbacks = pending;
                        pending = undefined;
                        value = ref(val);

                        if (callbacks.length) {
                            setTimeout(function () {
                                var callback;
                                for (var i = 0, ii = callbacks.length; i < ii; i++) {
                                    callback = callbacks[i];
                                    value.then(callback[0], callback[1], callback[2]);
                                }
                            }, 0);
                        }
                    }
                },
                reject: function (reason) {
                    deferred.resolve(createInternalRejectedPromise(reason));
                },
                notify: function (progress) {
                    if (pending) {
                        var callbacks = pending;

                        if (pending.length) {
                            setTimeout(function () {
                                var callback;
                                for (var i = 0, ii = callbacks.length; i < ii; i++) {
                                    callback = callbacks[i];
                                    callback[2](progress);
                                }
                            }, 0);
                        }
                    }
                },


                promise: {
                    then: function (callback, errback, progressback) {
                        var result = defer();

                        var wrappedCallback = function (value) {
                            try {
                                result.resolve((isFunction(callback) ? callback : defaultCallback)(value));
                            } catch (e) {
                                result.reject(e);
                                exceptionHandler(e);
                            }
                        };

                        var wrappedErrback = function (reason) {
                            try {
                                result.resolve((isFunction(errback) ? errback : defaultErrback)(reason));
                            } catch (e) {
                                result.reject(e);
                                exceptionHandler(e);
                            }
                        };

                        var wrappedProgressback = function (progress) {
                            try {
                                result.notify((isFunction(progressback) ? progressback : defaultCallback)(progress));
                            } catch (e) {
                                exceptionHandler(e);
                            }
                        };

                        if (pending) {
                            pending.push([wrappedCallback, wrappedErrback, wrappedProgressback]);
                        } else {
                            value.then(wrappedCallback, wrappedErrback, wrappedProgressback);
                        }

                        return result.promise;
                    },

                    "catch": function (callback) {
                        return this.then(null, callback);
                    },

                    "finally": function (callback) {

                        function makePromise(value, resolved) {
                            var result = defer();
                            if (resolved) {
                                result.resolve(value);
                            } else {
                                result.reject(value);
                            }
                            return result.promise;
                        }

                        function handleCallback(value, isResolved) {
                            var callbackOutput = null;
                            try {
                                callbackOutput = (callback || defaultCallback)();
                            } catch (e) {
                                return makePromise(e, false);
                            }
                            if (callbackOutput && isFunction(callbackOutput.then)) {
                                return callbackOutput.then(function () {
                                    return makePromise(value, isResolved);
                                }, function (error) {
                                    return makePromise(error, false);
                                });
                            } else {
                                return makePromise(value, isResolved);
                            }
                        }

                        return this.then(function (value) {
                            return handleCallback(value, true);
                        }, function (error) {
                            return handleCallback(error, false);
                        });
                    }
                }
            };

            return deferred;
        };


        var ref = function (value) {
            if (value && isFunction(value.then)) return value;
            return {
                then: function (callback) {
                    var result = defer();
                    setTimeout(function () {
                        result.resolve(callback(value));
                    }, 0);
                    return result.promise;
                }
            };
        };


        /**
         * @static
         * @method reject
         * @description
         * Creates a promise that is resolved as rejected with the specified `reason`. This api should be
         * used to forward rejection in a chain of promises. If you are dealing with the last promise in
         * a promise chain, you don't need to worry about it.
         *
         * When comparing deferreds/promises to the familiar behavior of try/catch/throw, think of
         * `reject` as the `throw` keyword in JavaScript. This also means that if you "catch" an error via
         * a promise error callback and you want to forward the error to the promise derived from the
         * current promise, you have to "rethrow" the error by returning a rejection constructed via
         * `reject`.
         *
         * ```js
         *   promiseB = promiseA.then(function(result) {
         *     // success: do something and resolve promiseB
         *     //          with the old or a new result
         *     return result;
         *   }, function(reason) {
         *     // error: handle the error if possible and
         *     //        resolve promiseB with newPromiseOrValue,
         *     //        otherwise forward the rejection to promiseB
         *     if (canHandle(reason)) {
         *      // handle the error and recover
         *      return newPromiseOrValue;
         *     }
         *     return promise.reject(reason);
         *   });
         * ```
         *
         * @param {*} reason Constant, message, exception or an object representing the rejection reason.
         * @returns {Promise} Returns a promise that was already resolved as rejected with the `reason`.
         */
        var reject = function (reason) {
            var result = defer();
            result.reject(reason);
            return result.promise;
        };

        var createInternalRejectedPromise = function (reason) {
            return {
                then: function (callback, errback) {
                    var result = defer();
                    setTimeout(function () {
                        try {
                            result.resolve((isFunction(errback) ? errback : defaultErrback)(reason));
                        } catch (e) {
                            result.reject(e);
                            exceptionHandler(e);
                        }
                    });
                    return result.promise;
                }
            };
        };


        /**
         * @static
         * @method when
         * @description
         * Wraps an object that might be a value or a (3rd party) then-able promise into a new promise.
         * This is useful when you are dealing with an object that might or might not be a promise, or if
         * the promise comes from a source that can't be trusted.
         *
         * @param {*} value Value or a promise
         * @returns {Promise} Returns a promise of the passed value or promise
         */
        var when = function (value, callback, errback, progressback) {
            var result = defer(),
                done;

            var wrappedCallback = function (value) {
                try {
                    return (isFunction(callback) ? callback : defaultCallback)(value);
                } catch (e) {
                    exceptionHandler(e);
                    return reject(e);
                }
            };

            var wrappedErrback = function (reason) {
                try {
                    return (isFunction(errback) ? errback : defaultErrback)(reason);
                } catch (e) {
                    exceptionHandler(e);
                    return reject(e);
                }
            };

            var wrappedProgressback = function (progress) {
                try {
                    return (isFunction(progressback) ? progressback : defaultCallback)(progress);
                } catch (e) {
                    exceptionHandler(e);
                }
            };

            setTimeout(function () {
                ref(value).then(function (value) {
                    if (done) return;
                    done = true;
                    result.resolve(ref(value).then(wrappedCallback, wrappedErrback, wrappedProgressback));
                }, function (reason) {
                    if (done) return;
                    done = true;
                    result.resolve(wrappedErrback(reason));
                }, function (progress) {
                    if (done) return;
                    result.notify(wrappedProgressback(progress));
                });
            });

            return result.promise;
        };


        function defaultCallback(value) {
            return value;
        }


        function defaultErrback(reason) {
            return reject(reason);
        }


        /**
         * @static
         * @method all
         * @description
         * Combines multiple promises into a single promise that is resolved when all of the input
         * promises are resolved.
         *
         * @param {Array.<Promise>|Object.<Promise>} promises An array or hash of promises.
         * @returns {Promise} Returns a single promise that will be resolved with an array/hash of values,
         *   each value corresponding to the promise at the same index/key in the `promises` array/hash.
         *   If any of the promises is resolved with a rejection, this resulting promise will be rejected
         *   with the same rejection value.
         */
        function all(promises) {
            var deferred = defer(),
                counter = 0,
                results = isArray(promises) ? [] : {};

            forEach(promises, function (promise, key) {
                counter++;
                ref(promise).then(function (value) {
                    if (results.hasOwnProperty(key)) return;
                    results[key] = value;
                    if (!(--counter)) deferred.resolve(results);
                }, function (reason) {
                    if (results.hasOwnProperty(key)) return;
                    deferred.reject(reason);
                });
            });

            if (counter === 0) {
                deferred.resolve(results);
            }

            return deferred.promise;
        }

        return {
            deferred: defer,
            reject: reject,
            when: when,
            all: all
        };
    }

    var stack = [];

    _promise = promise(function (e) {
        stack.push(e);
    });

    _promise.getStack = function () {
        return stack;
    };

    return _promise;

}());
/**
 * @description
 * ## Router
 * Router is used internally in controller, so don't instantiated it again.
 * @namespace ya
 * @class Router
 * @extends ya.Core
 * @constructor
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Router',
    /**
     * @method init
     */
    init: function () {
        var me = this;

        me.set('routing', {});
        me.bindEvents();

        return me;
    },
    /**
     * @method bindEvents
     * @chainable
     */
    bindEvents: function () {
        var me = this;

        window.onhashchange = me.onHashChange.bind(me);

        return this;
    },
    /**
     * @method onHashChange
     * @chainable
     */
    onHashChange: function () {
        var routing = this.get('routing'),
            hash = window.location.hash.substr(1),
            paths = hash.split("/"),
            action = paths.shift();

        if (routing[action]) {
            var args = [];
            if (routing[action].params) {
                for (var i = 0, len = routing[action].params.length; i < len; i++) {
                    var param = routing[action].params[i],
                        hashParam = paths[i],
                        regEx = new RegExp(param.substr(1, param.length - 2));
                    args.push(hashParam.match(regEx).input);
                }
            }
            routing[action].callback.apply(null, args);
        }
        return this;
    },
    /**
     * @method restore
     * @chainable
     */
    restore: function () {
        this.onHashChange();
        return this;
    },
    /**
     * @method when
     * @param path
     * @param callback
     * @returns {*}
     * @chainable
     */
    when: function (path, callback) {
        var me = this,
            routing = me.get('routing'),
            paths = path.split("/"),
            action = paths.shift();

        routing[action] = {
            callback: callback,
            params: paths
        };

        me.set('routing', routing);

        return me;
    }
});
/**
 * @author Sebastian Widelak <sebakpl@gmail.com>
 *
 */
(function (undefined) {
    "use strict";

    var ya = window.ya || {},
        style = document.createElement('style'),
        __slice = Array.prototype.slice,
        VM,
        VTM,
        View,
        renderId = 0,
        fillAttrs,
        resize = 0,
        iv = 0;

    function makeMap(str) {
        // Make object map from string.
        var obj = {}, items = str.split(",");
        for (var i = 0; i < items.length; i++)
            obj[ items[i] ] = true;
        return obj;
    }

    function onWindowResize(e) {
        // When resize event occur wait 32 miliseconds
        // to not firing it to often.

        if (resize === 0) {
            iv = setInterval(fireResizeEvent, 32);
        }

        resize = +new Date();
    }

    function fireResizeEvent() {
        // Fire ya resize event only on components
        // which need to be fitted to their parents.
        var views,
            l,
            i,
            now = +new Date();

        if (now - resize >= 32) {

            clearInterval(iv);

            resize = 0;
            views = VM.views;
            l = views.length;
            i = 0;

            while (i < l) {

                if (views[i].getFit()) {
                    views[i].fireEvent('resize', views[i]);
                }

                i++;
            }
        }
    }

    // Make object with attributes that not need any value.
    fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

    // Append some basic css to document.
    style.innerHTML = ".ya.inline {display:inline;} .ya.hidden {display: none !important;}";
    style.setAttribute('type', 'text/css');

    document.body.appendChild(style);
    window.addEventListener('resize', onWindowResize);

    VM = {
        // `ya.view.$Manager` stores all created views and allow as to
        // use `get` method (with id as argument) to return requested view.
        views: [],
        toRender: [],
        i: 0,
        /**
         * @method add
         * @for ya.view.$Manager
         * @param id
         * @param view
         */
        add: function (id, view) {
            // Add view to manager.
            var me = this;

            if (view.getAutoCreate()) {

                view.render();

            }

            me.views.push(view);
            me.i++;
        },
        /**
         * @method get
         * @for ya.view.$Manager
         * @param id
         * @returns {View}
         */
        get: function (id) {
            // Get view by its id.
            var me = this,
                len = me.views.length;

            while (len--) {

                if (me.views[len].getId() === id) break;

            }

            return me.views[len];
        }
    };

    ya.$set('ya', 'view.$Manager', VM);


    VTM = {
        // `VTM` is a private object that stores all templates used
        // in application.
        tpl: {},
        add: function (id, view) {
            var me = this;

            me.tpl[id] = view;
        },
        get: function (id) {
            var me = this;

            return me.tpl[id];
        }
    };

    /**
     * @namespace ya
     * @class View
     * @constructor
     * @extends ya.Core
     * @uses ya.mixins.Selector
     * @params opts Object with configuration properties
     * @type {function}
     */
    ya.Core.$extend({
        module: 'ya',
        alias: 'View',
        // `ya.View` accept few configuration properties:
        // * `parent` - pointer to parent view
        // * `fit` - if true, component will fire resize event when size
        // of window was changed
        // * `hidden` - if true, component will be hidden after render
        defaults: {
            /**
             * @attribute config.parent
             * @type ya.View
             */
            parent: null,
            /**
             * @attribute config.fit
             * @type boolean
             */
            fit: false,
            /**
             * @attribute config.hidden
             * @type boolean
             */
            hidden: false,
            /**
             * @attribute config.models
             * @type ya.Model
             */
            models: null,
            /**
             * @attribute config.autoCreate
             * @type boolean
             */
            autoCreate: false
        },
        mixins: [
            ya.mixins.Selector
        ],
        /**
         * @method init
         * @param opts
         * @returns {View}
         * @chainable
         */
        init: function (opts) {
            // Initializing function in which we call parent method, merge previous
            // configuration with new one, set id of component, initialize config
            // and save reference to component in View Manager.
            var me = this;

            me.__super();

            me.initDefaults(opts);
            me.initConfig();
            me.initTemplate();
            me.initParent();
            VM.add(me.getId(), me);

            return me;
        },
        /**
         *
         * @method initDefaults
         * @param opts
         * @chainable
         */
        initDefaults: function (opts) {
            var me = this, config;

            opts = opts || {};
            config = ya.$merge(me._config, opts.config);
            config.id = config.id || 'view-' + VM.i;
            config.children = config.children || [];

            me.set('initOpts', opts);
            me.set('config', config);

            return me;
        },
        /**
         * @method initTemplate
         * @returns {View}
         * @chainable
         */
        initTemplate: function () {
            var me = this,
                config = me.get('config'),
                div = document.createElement('div'),
                Instance,
                _tpl;

            if (!config.tpl) {

                throw new Error(config.id + ': no tpl set');

            }

            if (config.tpl instanceof ya.view.Template) {

                div.innerHTML = config.tpl.getHtml().innerHTML;

            } else if (typeof config.tpl === 'object') {

                Instance = ya.$get(config.tpl.alias);
                config.tpl = Instance ? Instance.$create({config: config.tpl}) : ya.view.Template.$create({config: config.tpl});
                div.innerHTML = config.tpl.getHtml().innerHTML;

            } else if (typeof config.tpl == 'string' || config.tpl instanceof String) {

                if (VTM.get(config.tpl)) {

                    div.innerHTML = VTM.get(config.tpl).innerHTML;

                } else {

                    _tpl = document.getElementById(config.tpl);

                    if (!_tpl)
                        throw new Error('no tpl ' + config.tpl + ' found');

                    VTM.add(config.tpl, _tpl.parentNode.removeChild(_tpl));
                    div.innerHTML = VTM.get(config.tpl).innerHTML;

                }
            }

            me.set('tpl', div);

            return me;
        },
        initParent: function () {
            var me = this,
                parent = me.getParent();

            if (parent) {

                parent.getChildren().push(me);

            }

        },
        /**
         * @returns {View}
         */
        setModel: function (namespace, model) {
            var me = this,
                models = me.getModels();

            models.push(model);
            me.setModels(models);
            me.resolveModelBindings(model);

            return me;
        },
        /**
         * @param namespace
         * @returns {ya.Model}
         */
        getModel: function (namespace) {
            var me = this,
                models = me.getModels(),
                model = null,
                l;

            l = models.length;
            while (l--) {
                if (models[l].getNamespace() === namespace) {
                    model = models[l];
                    break;
                }
            }

            return model;
        },
        /**
         * @version 0.1.11
         * @returns {Node}
         */
        render: function () {
            var me = this,
                tpl = me._tpl,
                config = me._config,
                id = config.renderTo,
                parent = config.parent,
                parentView = config.parent,
                bindings = [],
                headers = [],
                results,
                result,
                header,
                ret,
                value,
                parsedTpl,
                walker,
                node,
                el,
                i = 0,
                l = 0,
                j = 0,
                len = 0,
                attrs = [],
                attr;

            if (me.isInDOM()) {

                me.removeRendered();

            }

            if (parent) {// If parent is set,

                if (id && parent.querySelector(id)) { // search for element to which we will append component.
                    parent = parent.querySelector(id);
                } else {// If not found, append to parent root element.
                    parent = parent._el;
                }

            } else {// If parent not set,

                if (id) { // but we have an id of element to which we want render new one,
                    parent = document.querySelector(id);// we search for it in the whole document.
                }

            }

            parsedTpl = tpl.cloneNode(true); // Next, clone template.

            walker = document.createTreeWalker( // Create walker object and
                parsedTpl,
                NodeFilter.SHOW_ALL,
                null,
                false
            );

            node = walker.nextNode();
            while (node) { // walk through all nodes.

                if (node.nodeType === 3) { // If our element is text node
                    results = node.data.match(/\{\{(.*?)\}\}/gi);// we searching for mustached text inside it
                    if (results) { // and if we have positive match
                        var text = node.value || node.data,
                            doc = document.createElement('span'),// we create new span element
                            rId = "v-r-b-" + renderId++;

                        i = 0;
                        len = results.length;
                        headers = [];

                        doc.setAttribute('id', rId); // and add generated id.

                        // In the end we replace all match via data.
                        while (i < len) {

                            result = results[i++];
                            header = result.substr(2, (result.length - 4)).split('.');

                            if (me.getModel(header[0])) {
                                ret = me.getModel(header[0]).data(header[1]);
                                if (ret === undefined) {
                                    ret = "";
                                }
                            } else {
                                ret = "";
                            }

                            text = text.replace(result, ret);
                            headers.push(header);

                        }

                        doc.appendChild(
                            document.createTextNode(text)
                        );

                        // We also keep founded bindings.
                        bindings.push({
                            original: node.value || node.data,
                            headers: headers,
                            type: 3,
                            pointer: doc,
                            oldDOM: node
                        });

                    }
                    /*node.value = node.value.replace(bindRegEx, function (match) {
                     return replaceFn(match, 1, node);
                     });*/
                }
                else {

                    attrs = node.attributes;
                    l = attrs.length;

                    while (l--) {

                        attr = attrs.item(l);
                        results = attr.value && attr.value.match(/\{\{(.*?)\}\}/gi);

                        if (results) {
                            var original = attr.value,
                                fillAttr = fillAttrs[attr.nodeName];

                            i = 0;
                            len = results.length;
                            headers = [];

                            ret = fillAttr ? true : "";

                            while (i < len) {

                                result = results[i++];
                                header = result.substr(2, (result.length - 4)).split('.');

                                if (!fillAttr) {

                                    if (me.getModel(header[0])) {
                                        ret = me.getModel(header[0]).data(header[1]) || "";
                                    }

                                    attr.value = attr.value.replace(result, ret);

                                } else {

                                    ret = ret && me.getModel(header[0]).data(header[1]);

                                }

                                headers.push(header);

                            }

                            if (fillAttr) {

                                if (!ret) {

                                    node.removeAttribute(attr.nodeName);

                                } else {

                                    node.setAttribute(attr.nodeName, ret);

                                }

                            } else {

                                if (attr.nodeName === 'css') {

                                    value = attr.value;

                                    attr = document.createAttribute("style");

                                    attr.value = value;

                                    node.removeAttribute('css');

                                    attrs.setNamedItem(attr);

                                }

                            }

                            bindings.push({
                                original: original,
                                headers: headers,
                                fillAttr: fillAttr || false,
                                type: 2,
                                attrName: attr.nodeName,
                                pointer: node
                            });

                        } else {

                            if (attr.nodeName === 'css') {

                                value = attr.value;

                                attr = document.createAttribute("style");

                                attr.value = value;

                                node.removeAttribute('css');

                                attrs.setNamedItem(attr);

                            }

                        }

                        /*attrs.item(l).value = attrs[l].value.replace(bindRegEx, function (match) {
                         return replaceFn(match, 0, attrs[l]);
                         });*/
                    }
                }

                node = walker.nextNode();

            }

            if (parsedTpl.childNodes.length === 1 && parsedTpl.childNodes.item(0).nodeType === 1) {
                el = parsedTpl.childNodes.item(0);
            } else {
                el = parsedTpl;
                el.classList.add('inline');
            }

            el.setAttribute('id', config.id);
            el.classList.add('ya');

            me.set('el', el);
            me.set('bindings', bindings);

            me.resolveBindings();

            if (me.getHidden())
                me.hide();

            if (parent) {

                parent.appendChild(el);

                if (parentView) {

                    if (parentView.findChild(me.getId()) < 0) {

                        parentView.getChildren().push(me);

                    }

                }

                me.set('isInDOM', true);
                me.reAppendChildren();
                me.fireEvent('render', null, me);
            }

            return el;
        },
        /**
         * @version 0.1.12
         * @param model
         */
        resolveModelBindings: function (model) {
            var me = this,
                bindings = me._bindings,
                bindFnFactory,
                headers,
                header,
                binding,
                eventName,
                lenM = 0,
                len = 0;

            bindFnFactory = function (binding) {
                return function () {
                    me.partialRender(binding);
                };
            };

            len = bindings.length;
            while (len--) {

                binding = bindings[len];
                headers = binding.headers;
                lenM = headers.length;
                while (lenM--) {

                    if (model.getNamespace() === headers[lenM][0]) {

                        header = headers[lenM][1];
                        eventName = 'data' + header.charAt(0).toUpperCase() + header.slice(1) + 'Change';
                        binding.fn = bindFnFactory(binding);

                        model.addEventListener(eventName, binding.fn);

                        binding.fn();

                    }

                }
            }
        },
        /**
         * @version 0.1.12
         */
        resolveBindings: function () {
            var me = this,
                bindings = me._bindings,
                bindFnFactory,
                model,
                headers,
                header,
                binding,
                eventName,
                lenM = 0,
                len = 0;

            bindFnFactory = function (binding) {
                return function () {
                    me.partialRender(binding);
                };
            };

            len = bindings.length;
            while (len--) {

                binding = bindings[len];
                headers = binding.headers;

                if (binding.type === 3 && binding.oldDOM) {
                    binding.oldDOM.parentNode.replaceChild(binding.pointer, binding.oldDOM);
                    delete binding.oldDOM;
                }

                lenM = headers.length;
                while (lenM--) {

                    model = me.getModel(headers[lenM][0]);
                    header = headers[lenM][1];

                    if (model) {

                        binding.fn = bindFnFactory(binding);
                        eventName = 'data' + header.charAt(0).toUpperCase() + header.slice(1) + 'Change';

                        model.addEventListener(eventName, binding.fn);

                    }

                }
            }
        },
        /**
         * @version 0.1.11
         * @param binding
         */
        partialRender: function (binding) {
            var me = this,
                element = binding.type === 3,
                org = element ? binding.original : (binding.fillAttr ? true : binding.original),
                headers = binding.headers,
                len = headers.length,
                header;

            while (len--) {

                header = headers[len];

                if (element || !binding.fillAttr) {

                    org = org.replace("{{" + header.join(".") + "}}", me.getModel(header[0]).data(header[1]));

                } else {

                    org = org && me.getModel(header[0]).data(header[1]);

                }
            }

            if (element) {

                binding.pointer.textContent = org;


            } else {

                if (binding.fillAttr && !org) {

                    binding.pointer.removeAttribute(binding.attrName);

                } else {

                    binding.pointer.setAttribute(binding.attrName, org);

                }

            }

            return me;
        },
        /**
         * @version 0.1.12
         */
        removeBindings: function () {
            var me = this,
                bindings = me._bindings,
                l = bindings.length,
                binding,
                model,
                header,
                l2,
                eventName;

            while (l--) {

                binding = bindings[l];
                l2 = binding.headers.length;
                while (l2--) {

                    header = binding.headers[l2];
                    model = me.getModel(header[0]);
                    eventName = 'data' + header[1].charAt(0).toUpperCase() + header[1].slice(1) + 'Change';

                    model.removeEventListener(eventName, binding.fn);

                }

            }

            return me;
        },
        /**
         * @version 0.1.12
         */
        removeRendered: function () {
            var me = this;

            me._el.parentNode.removeChild(me._el);
            me.removeBindings();
            me.set('el', null);
            me.set('isInDOM', false);

            return me;
        },
        /**
         * @param selector
         * @returns {Node}
         */
        querySelector: function (selector) {
            return this.get('el').querySelector(selector) ||
                (this.isQueryMatch(selector) ? this.get('el') : null);
        },
        /**
         * @param selector
         * @returns {Array}
         */
        querySelectorAll: function (selector) {
            var results = __slice.call(this.get('el').querySelectorAll(selector) || [], 0);

            if (this.isQueryMatch(selector)) {

                results.push(this.get('el'));

            }

            return results;
        },
        /**
         * @param view
         * @param selector
         * @returns {View}
         */
        addChild: function (view, selector) {
            var me = this;
            view.appendTo(me, selector);
            ya.event.$dispatcher.apply(view);
            me.fireEvent('elementAdded', me, view);
            return me;
        },
        /**
         * @param id
         * @returns {View||Boolean}
         */
        getChild: function (id) {
            var me = this;

            if (me.findChild(id) < 0)
                return false;

            return me.findChild(id);
        },
        /**
         *
         * @param id
         * @returns {*|length|length|Function|length|length}
         */
        findChild: function (id) {
            var views = this.getChildren(),
                l = views.length;

            while (l--) {
                if (views[l].getId() === id)
                    break;
            }

            return l;
        },
        /**
         *
         * @param id
         * @returns {*|null}
         */
        removeChild: function (id) {
            var views = this.getChildren(),
                l = views.length,
                view = [];

            while (l--) {
                if (views[l].getId() === id) {

                    view = views.splice(l, 1);
                    view[0].clear();

                }
            }

            return view[0] || null;
        },
        /**
         * @returns {Array}
         */
        removeChildren: function () {
            var views = this.getChildren(),
                l = views.length,
                removed = [];

            while (l--) {
                removed.push(views[l].clear());
            }


            return removed;
        },
        /**
         * @returns {View}
         */
        clear: function () {
            var me = this,
                el = me._el;

            if (me.isInDOM()) {
                el.parentNode.removeChild(el);
                me.set('isInDOM', false);
            }

            return me;
        },
        /**
         * @returns {Boolean}
         */
        isInDOM: function () {
            return this._isInDOM;
        },
        /**
         * @param parent
         * @param selector
         * @returns {View}
         */
        appendTo: function (parent, selector) {
            var me = this,
                config = me.get('config'),
                id = me.getId(),
                views = parent.getChildren(),
                oldParent = config.parent,
                parentEl = selector ? parent._el.querySelector(selector) : parent._el;

            if (selector) {

                config.renderTo = selector;

            }

            if (!oldParent) {

                config.parent = parent;

            }
            else if (oldParent && oldParent.getId() !== parent.getId()) {

                if (oldParent.findChild(id) > -1) {

                    oldParent
                        .getChildren()
                        .splice(
                            oldParent.findChild(id), 1
                        );

                }

            }


            views.push(me);
            config.parent = parent;
            me.fireEvent('append', null, me, parent);


            if (!me.isInDOM() && parent.isInDOM()) {

                if (!me._el) {

                    me.render();
                    ya.event.$dispatcher.apply(me);

                } else {

                    parentEl.appendChild(me._el);
                    me.set('isInDOM', true);
                    me.reAppendChildren();
                    me.fireEvent('render', null, me);

                }

            }
            return me;
        },
        /**
         * @returns {View}
         */
        reAppendChildren: function () {
            var views = this.getChildren(),
                l = views.length,
                i = 0;

            for (; i < l; i++) {
                views[i].appendTo(this);
            }

            return this;
        },
        /**
         * @returns {View}
         */
        show: function () {
            var me = this;

            if (!me._el)
                return me;

            me._el.classList.remove('hidden');

            me.set('visible', true);
            me.fireEvent('show', me);

            return me;
        },
        /**
         * @returns {View}
         */
        hide: function () {
            var me = this;

            if (!me._el)
                return me;


            me._el.classList.add('hidden');

            me.set('visible', false);
            me.fireEvent('hide', me);

            return me;
        },
        toggle: function () {
            var me = this;

            if (me._visible) {

                me.hide();

            } else {

                me.show();

            }

        },
        /**
         * @returns {Boolean}
         */
        isVisible: function () {
            return this.get('visible') && this.isInDOM();
        }
    });

}());
/**
 * @namespace ya.view
 * @class DOM
 * @extends ya.Core
 */
ya.Core.$extend({
    module : 'ya',
    alias : 'view.DOM',
    defaults: {
        el: null
    }
});
/**
 * @namespace ya.view
 * @class Template
 * @extends ya.Core
 */
ya.Core.$extend({
    module : 'ya',
    alias : 'view.Template',
    defaults: {
        tpl: null
    },
    init: function (opts) {
        var me = this, config;

        me.__super(opts);

        opts = opts || {};
        config = ya.$merge(me._config, opts.config);

        me.set('initOpts', opts);
        me.set('config', config);

        me.initConfig();
        me.initTpl();

    },
    initConfig: function () {
        var me = this,
            config = me.get('config');

        me.__super();

        if (!config.id)
            throw new Error("ya.view.Template: Template need to have id");

        return me;
    },
    initTpl: function () {
        var me = this,
            html = me.getTpl(),
            tpl = document.createElement('div');

        if (Array.isArray(html)) {
            html = html.join("");
        }

        tpl.innerHTML = html;

        me.set('html', tpl);
    },
    getHtml: function () {
        return this._html;
    }
});
