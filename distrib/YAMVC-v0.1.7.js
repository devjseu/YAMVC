/*! YAMVC v0.1.7 - 2014-01-12 
 *  License:  */
(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        mixins = yamvc.mixins || {},
        GetSet;

    GetSet = {
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
    };

    mixins.GetSet = GetSet;
    window.yamvc = yamvc;
    window.yamvc.mixins = mixins;
}(window));

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
         * @param evName
         * @returns {boolean}
         *
         */
        fireEvent: function (evName /** param1, ... */) {
            if (this._suspendEvents)
                return true;
            var ret = true,
                shift = Array.prototype.shift;
            shift.call(arguments);
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

(function (window, undefined) {
    "use strict";

    var yamvc = window.yamvc || {},
        Core,
        onReadyCallbacks = [],
        readyStateCheckInterval;

    // Provide way to execute all necessary code after DOM is ready.
    /**
     * @param callback
     */
    yamvc.onReady = function (callback) {
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

    // Run all method when ready
    function run() {
        for (var i = 0, l = onReadyCallbacks.length; i < l; i++) {
            onReadyCallbacks[i]();
        }
    }

    // Merge two objects.
    function merge(obj1, obj2) {
        for (var property in obj2) {
            if (obj2.hasOwnProperty(property)) {
                obj1[property] = obj2[property];
            }
        }
        return obj1;
    }

    // Definition of Core object.
    Core = yamvc.Core || (function () {

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
            this.addListener(property + 'Change', callback);
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

        // Add mixin to object definition.
        /**
         * @static
         * @param obj
         * @param mixin
         */
        Core.mixin = function (obj, mixin) {
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
        Core.extend = function (opts) {
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
                defaults = merge(opts.defaults || {}, Parent.__defaults__),
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
                    child.extend = Core.extend;
                    child.mixin = Core.mixin;
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
        Core.mixin(yamvc.mixins.GetSet);

        // Add observable methods.
        Core.mixin(yamvc.mixins.Observable);

        return Core;
    }());

    yamvc.Core = Core;
    yamvc.merge = merge;
    window.yamvc = yamvc;
}(window));
(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Collection;

    Collection = yamvc.Core.extend({
        defaults : {
            proxy : null
        },
        /**
         * initialize collection
         * @param opts
         */
        init: function (opts) {
            Collection.Parent.init.apply(this, arguments);
            var me = this, config;
            opts = opts || {};
            config = yamvc.merge(me._config, opts.config);
            me.set('initOpts', opts);
            me.set('config', config);
            me.set('set', []);
            me.set('cache', []);
            me.initConfig();
            me.initData();
        },
        /**
         * initialize data
         */
        initData: function () {
            var me = this,
                opts = me.get('initOpts'),
                config = me.get('config'),
                data = opts.data || [];
            me.set('raw', data);
            me.prepareData(data);
            return me;
        },
        // return number of records in collection
        /**
         * @returns {Number}
         */
        count: function () {
            return this._set.length;
        },
        clear: function () {
            var me = this;
            me.set('set', []);
            me.set('cache', []);
            return me;
        },
        clearFilterFn: function () {
            this.set('set', this._cache);
            return this;
        },
        filterFn: function (fn) {
            var me = this,
                filtered = [],
                records = me._cache;

            for (var i = 0, l = records.length; i < l; i++) {
                if (fn(records[i])) {
                    filtered.push(records[i]);
                }
            }
            me.set('set', filtered);
            return me;
        },
        /**
         * get record at
         * @param index
         * @returns {*}
         */
        getAt: function (index) {
            return this._set[index];
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
                namespace = me.getModelConfig().namespace,
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
                    me.fireEvent('loaded', me, me.getProxy().getResponse(), 'read');
                } else {
                    me.fireEvent('error', me, 'read');
                }
            };
            me.getProxy().read(namespace, params, callback);
            return me;
        },
        /**
         * Prepare data
         * @private
         * @param data
         * @param total
         * @returns {Collection}
         */
        prepareData: function (data, total) {
            var me = this,
                ModelInstance = me.getModel(),
                modelConfig = me.getModelConfig ? me.getModelConfig() : {},
                l = data.length,
                models = [];
            total = total || l;
            for (var i = 0; i < l; i++) {
                models.push(new ModelInstance({
                    data: data[i],
                    config: modelConfig
                }));
            }
            me.set('set', models);
            me.set('cache', models);
            me.set('total', total);
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
        }
    });

    window.yamvc = yamvc;
    window.yamvc.Collection = Collection;
}(window));

/**
 * ## Basic controller usage
 *
 *     @example
 *     var ctl = new Controller({
 *         config: {
 *             name: 'Main',
 *             views: {
 *                 layout: ViewManager.get('view-0')
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
 *
 * ## Configuration properties
 *
 * @cfg config.name {String} Name of the controller
 * @cfg config.routes {Object} Object with defined routes and callbacks
 * @cfg config.views {Object} List of views connected with controller
 *
 */
(function (window, undefined) {
    "use strict";

    var yamvc = window.yamvc || {},
        Controller,
        router;

    /**
     *
     * @type {*}
     */
    Controller = yamvc.Core.extend({
        init: function (opts) {
            var config,
                me = this;
            opts = opts || {};
            config = opts.config || {};
            router = router || new yamvc.Router();
            me.set('initOpts', opts);
            me.set('config', config);
            me.set('routes', config.routes || {});
            me.set('events', config.events || {});
            me.set('views', config.views || {});
            me.initConfig();
            me.renderViews();
            me.restoreRouter();
            return me;
        },
        initConfig: function () {
            yamvc.Core.prototype.initConfig.apply(this);
            var me = this,
                routes = me.get('routes'),
                events = me.get('events'),
                views = me.get('views'),
                query,
                rx = /(^\$|,$)/,
                view;
            if (routes) {
                for (var k in routes) {
                    if (routes.hasOwnProperty(k)) {
                        var callback = me[routes[k]].bind(me);
                        router.when(k, callback);
                    }
                }
            }
            if (events && views) {
                for (view in views) {
                    if (views.hasOwnProperty(view)) {
                        views[view].addListener('render', me.resolveEvents.bind(me));
                    }
                }

                for (query in events) {
                    if (events.hasOwnProperty(query)) {
                        if (rx.test(query)) {
                            view = views[query.substr(1)];
                            if (view) {
                                for (var event in events[query]) {
                                    if (events[query].hasOwnProperty(event)) {
                                        view.addListener(event, events[query][event].bind(me, view));
                                    }
                                }
                            }
                            delete events[query];
                        }
                    }
                }
            }
            return this;
        },
        renderViews: function () {
            var me = this,
                views = me.get('views');
            for (var view in views) {
                if (views.hasOwnProperty(view)) {
                    if (views[view].getAutoCreate && views[view].getAutoCreate()) {
                        views[view].render();
                    }
                }
            }
        },
        resolveEvents: function (view) {
            var events = this.get('events'),
                viewEvents,
                newScope = function (func, scope, arg) {
                    return func.bind(scope, arg);
                },
                scope;
            for (var query in events) {
                if (events.hasOwnProperty(query)) {
                    viewEvents = events[query];
                    var elements = view.get('el').querySelectorAll(query);
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
        },
        getRouter: function () {
            return router;
        },
        restoreRouter: function () {
            var me = this;
            me.getRouter().restore();
            return me;
        }, redirectTo: function (path) {
            window.location.hash = path;
            return this;
        }
    });

    window.yamvc.Controller = Controller;
}(window));
(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Proxy,
        Status;

    Status = {
        PENDING: 0,
        SUCCESS: 1,
        FAIL: 2
    };

    Proxy = yamvc.Core.extend({
        defaults: {
            propertyResults: 'results',
            status: Status.PENDING
        },
        init: function (opts) {
            var me = this, config;
            Proxy.Parent.init.apply(this, arguments);
            opts = opts || {};
            config = yamvc.merge(me._config, opts.config);
            me.set('initOpts', opts);
            me.set('config', config);
            me.initConfig();
        },
        initConfig: function () {
            var me = this;
            Proxy.Parent.initConfig.call(this);
            me.set('lastResponse', {});
        },
        read: function (namespace, data, callback) {
            if (!namespace)
                throw new Error('namespace should be set');

        },
        create: function (namespace, data, callback) {
            if (!namespace)
                throw new Error('namespace should be set');
            if (!data || typeof data !== 'object')
                throw new Error('Data should be pass as object');
        },
        update: function () {

        },
        destroy: function () {
        },
        setResponse: function (response) {
            return this.set('response', response);
        },
        getResponse: function () {
            return this.get('response');
        }
    });

    // statics
    Proxy.Status = Status;

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.Proxy = Proxy;
}(window));

(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Localstorage,
        Proxy = yamvc.data.Proxy;

    /**
     * Extend Proxy class
     *
     * @type {*}
     */
    Localstorage = Proxy.extend({
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
         *
         * @param opts
         */
        init: function (opts) {
            var me = this;
            Localstorage.Parent.init.apply(me, arguments);
        },
        /**
         *
         */
        initConfig: function () {
            Localstorage.Parent.initConfig.apply(this);
        },
        /**
         *
         * @param namespace
         * @param data
         * @param callback
         */
        read: function (namespace, data, callback) {
            var me = this;

            Localstorage.Parent.read.apply(this, arguments);


            if (typeof data === 'object') {
                me.readBy(namespace, data, callback);
            } else {
                me.readById(namespace, data, callback);
            }
        },
        /**
         *
         * @param namespace
         * @param opts
         * @param callback
         * @returns {Localstorage}
         */
        readBy: function (namespace, opts, callback) {
            var me = this,
                limit = opts.limit || null,
                offset = opts.offset || 0,
                filters = opts.filters || [],
                sorters = opts.sorters || [],
                response = {},
                filtered = [],
                records = [],
                meet = true,
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

            response.success = true;
            response.result = records;
            callback(me, response);
            return me;
        },
        /**
         *
         * @param namespace
         * @param id
         * @param callback
         * @returns {Localstorage}
         */
        readById: function (namespace, id, callback) {
            var me = this, records = [], result = {}, response = {};
            if (localStorage[namespace]) {
                records = JSON.parse(localStorage[namespace]);
                for (var i = 0, l = records.length; i < l; i++) {
                    if (records[i].id === id) {
                        result = records[i];
                    }
                }
                if (typeof result.id !== 'undefined') {
                    response.success = true;
                    response.result = result;
                    callback(me, response);
                    return me;
                }
            }

            response.success = false;
            response.error = new Error("Not found");
            callback(me, response);
            return me;
        },
        /**
         *
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
        },
        /**
         *
         * @param namespace
         * @param data
         * @param callback
         * @returns {Localstorage}
         */
        create: function (namespace, data, callback) {
            var me = this, records = [], sequence = 0, response = {};
            Localstorage.Parent.create.apply(this, arguments);
            if (localStorage[namespace]) {
                records = JSON.parse(localStorage[namespace]);
                sequence = localStorage[namespace + "$Sequence"];
            }
            if (Array.isArray(data)) {
                for (var i = 0, l = data.length; i < l; i++) {
                    data[i].id = sequence++;
                    records.push(data[i]);
                }
            } else {
                data.id = sequence++;
                records.push(data);
            }
            try {
                localStorage[namespace] = JSON.stringify(records);
                localStorage[namespace + "$Sequence"] = sequence;
                response.success = true;
                response.result = data;
            } catch (e) {
                response.success = false;
                response.error = e;
            }
            me.setResponse(response);
            callback(me, response);
            return me;
        },
        /**
         *
         * @param namespace
         * @param data
         * @param callback
         * @returns {Localstorage}
         */
        update: function (namespace, data, callback) {
            var me = this, records = [], result = {}, response = {}, id, l, l2;

            if (localStorage[namespace]) {

                records = JSON.parse(localStorage[namespace]);

                if (Array.isArray(data)) {

                    l = data.length;
                    while (l--) {
                        l2 = records.length;
                        id = data[l].id;
                        while (l2--) {
                            if (records[l2].id === id) {
                                records[l2] = data[l];
                            }
                        }
                    }
                    result = records;

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
                } catch (e) {
                    response.success = false;
                    response.error = e;
                }
                callback(me, response);
                return me;
            }

            response.success = false;
            response.error = new Error("Not found");
            callback(me, response);
            return me;
        },
        /**
         *
         * @param namespace
         * @param data
         * @param callback
         * @returns {Localstorage}
         */
        destroy: function (namespace, data, callback) {
            var me = this, records = [], response = {}, id, l, l2;

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
                } catch (e) {
                    response.success = false;
                    response.error = e;
                }
                callback(me, response);
                return me;
            }

            response.success = false;
            response.error = new Error("Not found");
            callback(me, response);
            return me;
        }
    });

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.proxy = window.yamvc.data.proxy || {};
    window.yamvc.data.proxy.Localstorage = Localstorage;
}(window));

(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Ydn;

    Ydn = yamvc.data.Proxy.extend(function () {
        var me = this;
        yamvc.data.Proxy.apply(me, arguments);
        return me;
    });

    Ydn.prototype.init = function (opts) {
        var me = this, config;
        yamvc.data.Proxy.prototype.init.apply(this, arguments);
        opts = opts || {};
        config = opts.config || {};
        config.idProperty = 'id';
        me.set('initOpts', opts);
        me.set('config', config);
        me.initConfig();
        return me;
    };

    Ydn.prototype.getStatus = function () {
        return this.get('status');
    };

    Ydn.prototype.getResponse = function () {
        return this.get('response');
    };

    Ydn.prototype.read = function (namespace, data, callback) {
        var me = this, fSet, idProperty, req;
        idProperty = me.getIdProperty();
        if (typeof data[idProperty] === 'object') {
            console.log(idProperty);
        }
        fSet = me.set.bind(me);
        req = me.getDb().getConnection().get(namespace, data[idProperty]);
        req.done(function (key) {
            fSet('status', 'success');
            data[idProperty] = key;
            fSet('response', data);
            callback();
        });
        req.fail(function (e) {
            fSet('status', 'error');
            fSet('response', e);
            callback();
        });
        return me;
    };

    Ydn.prototype.create = function (namespace, data, callback) {
        var me = this, fSet, idProperty, req;
        fSet = me.set.bind(me);
        idProperty = me.getIdProperty();
        req = me.getDb().getConnection().put({
            name: namespace,
            keyPath: idProperty
        }, data);
        req.done(function (key) {
            fSet('status', 'success');
            data[idProperty] = key;
            fSet('response', data);
            callback();
        });
        req.fail(function (e) {
            fSet('status', 'error');
            fSet('response', e);
            callback();
        });
        return me;
    };

    Ydn.prototype.update = function (namespace, data, callback) {
        var me = this, fSet, req;
        fSet = me.set.bind(me);
        req = me.getDb().getConnection().put(namespace, data);
        req.done(function () {
            fSet('status', 'success');
            fSet('response', data);
            return callback();
        });
        req.fail(function (e) {
            fSet('status', 'error');
            fSet('response', e);
            callback();
        });
        return me;
    };

    Ydn.prototype.destroy = function (namespace, data, callback) {
        var me = this, fSet, idProperty, req;
        idProperty = me.getIdProperty();
        fSet = me.set.bind(me);
        req = me.getDb().getConnection().remove(namespace, data[idProperty]);
        req.done(function () {
            fSet('status', 'success');
            fSet('response', {});
            callback();
        });
        req.fail(function (e) {
            fSet('status', 'error');
            fSet('response', e);
            callback();
        });
        return me;
    };

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.proxy = window.yamvc.data.proxy || {};
    window.yamvc.data.proxy.Ydn = Ydn;

}(window));

/*
 //@ sourceMappingURL=ydnDb.map
 */

(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Model,
        config;

    Model = yamvc.Core.extend({
        /**
         * @defaults
         */
        defaults: {
            idProperty: 'id',
            proxy : null
        },
        /**
         *
         * @param opts
         */
        init: function (opts) {
            yamvc.Core.prototype.init.apply(this, arguments);
            var me = this, config;
            opts = opts || {};
            config = yamvc.merge(me._config, opts.config);
            me.set('initOpts', opts);
            me.set('config', config);
            me.initConfig();
            me.initData();
        },
        /**
         *
         * @returns {Model}
         */
        initConfig: function () {
            var me = this,
                config = me.get('config');
            yamvc.Core.prototype.initConfig.apply(this);
            if (!config.namespace)
                throw new Error("Model need to have namespace property in your model configuration");
            return this;
        },
        /**
         *
         */
        initData: function () {
            var me = this,
                opts = me.get('initOpts'),
                config = me.get('config');
            me.set('data', opts.data || {});
        },
        /**
         *
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
         *
         * @param property
         * @returns {*}
         */
        getDataProperty: function (property) {
            var me = this;
            return me.get('data')[property];
        },
        // alias for set and get data property
        // if two arguments are passed data will be set
        // in other case data will be returned
        /**
         * @param property name of property in data
         * @param data Optional | if passed data will be set
         * @returns {*}
         *
         */
        data: function (property, data) {
            var len = arguments.length;
            if (len > 1) {
                return this.setDataProperty.apply(this, arguments);
            } else {
                return this.getDataProperty.apply(this, arguments);
            }
        },
        /**
         *
         * @param newData
         */
        setData: function (newData) {
            var me = this,
                data = me.get('data'),
                key;

            for (key in newData) {
                if (newData.hasOwnProperty(key)) {
                    me.data(key, newData[key]);
                }
            }

            me.fireEvent('dataChange', me, data);
        },
        /**
         *
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
         *
         * @param params
         */
        load: function (params) {
            var me = this,
                data = me.get('data'),
                idProperty = me.get('idProperty'),
                callback,
                key, i = 0;

            for (key in params) i++;

            if (
                i === 0 &&
                    typeof data[idProperty] === 'undefined'
                )
                throw new Error('You need to pass at least one condition to load model');

            if (i === 0) {
                params[idProperty] = data[idProperty];
            }

            callback = function () {
                if (me.getProxy().getStatus() === 'success') {
                    me.set('isDirty', false);
                    me.set('data', me.getProxy().getResponse());
                    me.fireEvent('loaded', me, me.getProxy().getResponse(), 'read');
                } else {
                    me.fireEvent('error', me, 'read');
                }
            };
            me.getProxy().read(me.getNamespace(), params, callback);
        },
        /**
         *
         * @returns {boolean}
         */
        save: function () {
            var me = this,
                data = me.get('data'),
                idProperty = me.get('idProperty'),
                callback,
                type;
            if (me.get('isProcessing')) {
                return false;
            }
            me.set('isProcessing', true);
            callback = function () {
                me.set('isProcessing', false);
                if (me.getProxy().getStatus() === 'success') {
                    me.set('isDirty', false);
                    me.set('data', me.getProxy().getResponse());
                    me.fireEvent('saved', me, me.getProxy().getResponse(), type);
                } else {
                    me.fireEvent('error', me, type);
                }
            };

            if (typeof data[idProperty] === 'undefined') {
                type = 'create';
                me.getProxy().create(me.getNamespace(), data, callback);
            } else {
                type = 'update';
                me.getProxy().update(me.getNamespace(), data, callback);
            }
            return true;
        },
        /**
         *
         */
        remove: function () {
            var me = this,
                data = me.get('data'),
                idProperty = me.get('idProperty'),
                callback;

            if (typeof data[idProperty] === 'undefined')
                throw new Error('Can not remove empty model');

            callback = function () {
                if (me.getProxy().getStatus() === 'success') {
                    delete data[idProperty];
                    me.set('isDirty', false);
                    me.set('data', {});
                    me.fireEvent('removed', me, 'destroy');
                } else {
                    me.fireEvent('error', me, 'destroy');
                }
            };
            me.getProxy().destroy(me.getNamespace(), data, callback);
        }
    });

    window.yamvc = yamvc;
    window.yamvc.Model = Model;
}(window));

/**
 * @author rhysbrettbowen
 * @contributed devjseu
 */
(function (window, undefined) {
    "use strict";

    var yamvc = window.yamvc || {},
        Promise,
        State,
        resolve;


    /**
     * @type {{PENDING: number, FULFILLED: number, REJECTED: number}}
     */
    State = {
        PENDING: 0,
        FULFILLED: 1,
        REJECTED: 2
    };

    /**
     * @param fn
     * @constructor
     */
    Promise = function (fn) {
        var me = this,
            onResolve,
            onReject;

        me._state = State.PENDING;
        me._queue = [];

        onResolve = function (value) {
            resolve(me, value);
        };

        onReject = function (reason) {
            me.transition(State.REJECTED, reason);
        };

        if (fn) fn(onResolve, onReject);
    };

    /**
     * @param state
     * @param value
     * @returns {boolean}
     */
    Promise.prototype.transition = function (state, value) {
        var me = this;

        if (me._state == state ||          // must change the state
            me._state !== State.PENDING || // can only change from pending
            (state != State.FULFILLED &&    // can only change to fulfill or reject
                state != State.REJECTED) ||
            arguments.length < 2) {         // must provide value/reason
            return false;
        }

        me._state = state;                 // change state
        me._value = value;
        me.run();
    };


    Promise.prototype.run = function () {
        var me = this,
            value,
            fulfill,
            reject;

        fulfill = function (x) {
            return x;
        };

        reject = function (x) {
            throw x;
        };

        if (me._state == State.PENDING) return;
        setTimeout(function () {
            while (me._queue.length) {
                var obj = me._queue.shift();
                try {
                    // resolve returned promise based on return
                    value = (me._state == State.FULFILLED ?
                        (obj.fulfill || fulfill) :
                        (obj.reject || reject))
                        (me._value);
                } catch (e) {
                    // reject if an error is thrown
                    obj.promise.transition(State.REJECTED, e);
                    continue;
                }
                resolve(obj.promise, value);
            }
        }, 0);
    };

    /**
     * @param onFulfilled
     * @param onRejected
     * @returns {Promise}
     */
    Promise.prototype.then = function (onFulfilled, onRejected) {
        // need to return a promise
        var me = this,
            promise = new Promise();

        me._queue.push({
            fulfill: typeof onFulfilled == 'function' && onFulfilled,
            reject: typeof onRejected == 'function' && onRejected,
            promise: promise
        });
        me.run();

        return promise;
    };

    /**
     * @param promise
     * @param x
     */
    Promise.prototype.resolve = function (promise, x) {
        if (promise === x) {
            promise.transition(State.REJECTED, new TypeError());
        } else if (x && x.constructor == Promise) { // must know it’s implementation
            if (x.state == State.PENDING) { // 2.3.2.1
                x.then(function (value) {
                    resolve(promise, value);
                }, function (reason) {
                    promise.transition(State.REJECTED, reason);
                });
            } else {
                promise.transition(x.state, x.value);
            }
        } else if ((typeof x == 'object' || typeof x == 'function') && x !== null) {
            var called = false;
            try {
                var then = x.then;
                if (typeof then == 'function') {
                    then.call(x, function (y) {
                        if (!called) {
                            resolve(promise, y);
                            called = true;
                        }
                    }, function (r) {
                        if (!called) {
                            promise.transition(State.REJECTED, r);
                            called = true;
                        }
                    });
                } else {
                    promise.transition(State.FULFILLED, x);
                }
            } catch (e) {
                if (!called) {
                    promise.transition(State.REJECTED, e);
                }
            }
        } else {
            promise.transition(State.FULFILLED, x);
        }
    };

    /**
     * @returns {number}
     */
    Promise.prototype.getState = function () {
        return this._state;
    };

    resolve = Promise.prototype.resolve;

    // static
    Promise.State = State;

    /**
     * @param value
     * @returns {Promise}
     */
    Promise.resolved = function (value) {
        return new Promise(function (res) {
            res(value);
        });
    };

    /**
     * @param reason
     * @returns {Promise}
     */
    Promise.rejected = function (reason) {
        return new Promise(function (res, rej) {
            rej(reason);
        });
    };

    /**
     * @returns {{promise: Promise, resolve: (Function|resolve|resolve), reject: (*|Function|reject|reject|reject|reject)}}
     */
    Promise.deferred = function () {
        var resolve, reject;
        return {
            promise: new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            }),
            resolve: resolve,
            reject: reject
        };
    };

    yamvc.Promise = Promise;
    window.yamvc = yamvc;
}(window));
/**
 *
 * ## Router
 * Router is used internally in controller, so don't instantiated it again.
 */
(function (window, undefined) {
    "use strict";

    var yamvc = window.yamvc || {},
        Router;
    /**
     * @constructor
     * @type {function}
     */
    Router = yamvc.Core.extend({
        init: function () {
            this.set('routing', {});
            this.bindEvents();
        },
        bindEvents: function () {
            window.onhashchange = this.onHashChange.bind(this);
            return this;
        },
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
        restore: function () {
            this.onHashChange();
            return this;
        },
        when: function (path, callback) {
            var routing = this.get('routing'),
                paths = path.split("/"),
                action = paths.shift();
            routing[action] = {
                callback: callback,
                params: paths
            };
            this.set('routing', routing);
            return this;
        }
    });

    window.yamvc.Router = Router;
}(window));
/**
 *
 * ## View Manager usage
 * View Manager is singleton object and helps to get proper view instance Cored on passed id
 *
 *      @example
 *      VM
 *          .get('layout')
 *          .render();
 *
 * ## Basic view
 * Views are an excellent way to bind template with the data from proper models.
 *
 *     @example
 *     var view = new View({
 *         config: {
 *             id: 'users',
 *             tpl: 'user-lists',
 *             models : window.users
 *             renderTo: '#body'
 *         }
 *     });
 *
 * ## Configuration properties
 *
 * @cfg config.id {String} Unique id of the view. If not passed id will be assigned automatically
 * @cfg config.tpl {String} Id of the template
 * @cfg config.models {String} Simple object storing appropriate data
 * @cfg config.renderTo {String} Selector to which view should be rendered
 *
 * ## Extending views
 * Views are easily expendable, so you can fell free to add more awesome functionality to it.
 *
 *     @example
 *     window.OverlayView = View.extend(function OverlayView(opts) {
 *         View.prototype.constructor.call(this, opts);
 *     });
 *     OverlayView.prototype.show = function (callback) {
 *         var me = this,
 *             dom = me.get('el'),
 *         config = me.get('config');
 *         if (me.get('isAnimated')) {
 *             jQuery(dom).stop();
 *         }
 *         me.set('isAnimated', true);
 *         jQuery(dom).css({
 *             display: 'block',
 *             opacity: 0
 *         }).animate({
 *             opacity: 1
 *         }, config.showDuration || 500, function () {
 *             me.set('isAnimated', false);
 *             if (callback)
 *                 callback(me, this);
 *             });
 *     };
 *
 *     OverlayView.prototype.hide = function (callback) {
 *             var me = this,
 *                 dom = me.get('el'),
 *                 config = me.get('config');
 *             if (me.get('isAnimated')) {
 *                 jQuery(dom).stop();
 *             }
 *             me.set('isAnimated', true);
 *             jQuery(dom).animate({
 *                 opacity: 0
 *             }, config.hideDuration || 500, function () {
 *                 jQuery(dom).css({
 *                     display: 'none'
 *                 });
 *                 me.set('isAnimated', false);
 *                 if (callback)
 *                     callback(me, this);
 *             });
 *     };
 *     var overlay = new OverlayView({
 *       config: {
 *          tpl: 'container',
 *          renderTo: '#body',
 *          models: window.models
 *     });
 *     overlay.render();
 *     overlay.show();
 *
 *
 */
(function (window, undefined) {
    "use strict";

    var yamvc = window.yamvc || {},
        VM,
        VTM,
        View;

    // Object that stores all views
    /**
     * @type {{views: {}, i: number, add: Function, get: Function}}
     */
    VM = {
        views: {},
        i: 0,
        // Add view to manager
        /**
         * @param id
         * @param view
         */
        add: function (id, view) {
            this.views[id] = view;
            this.i++;
        },
        // Get view by its id
        /**
         * @param id
         * @returns {View}
         */
        get: function (id) {
            return this.views[id];
        }
    };

    //Private object, keeps all templates in one place
    /**
     * @type {{tpl: {}, add: Function, get: Function}}
     */
    VTM = {
        tpl: {},
        add: function (id, view) {
            this.tpl[id] = view;
        },
        get: function (id) {
            return this.tpl[id];
        }
    };
    // Definition of View object
    /**
     * @constructor
     * @params opts Object with configuration properties
     * @type {function}
     */
    View = yamvc.Core.extend({
        // Initializing function in which we call parent method, merge previous
        // configuration with new one, set id of component, initialize config
        // and save reference to component in View Manager.
        /**
         *
         * @param opts
         * @returns {View}
         */
        init: function (opts) {
            yamvc.Core.prototype.init.apply(this);
            var me = this, config, id;
            opts = opts || {};
            config = yamvc.merge(me._config, opts.config);
            config.id = id = config.id || 'view-' + VM.i;
            config.views = config.views || {};
            me.set('initOpts', opts);
            me.set('config', config);
            me.initConfig();
            VM.add(id, me);
            return me;
        },
        /**
         * @returns {View}
         */
        initConfig: function () {
            yamvc.Core.prototype.initConfig.apply(this);
            this.initTemplate();
            this.initModels();
            return this;
        },
        /**
         * @returns {View}
         */
        initTemplate: function () {
            var me = this,
                config = me.get('config'),
                div = document.createElement('div'),
                _tpl;
            if (!config.tpl) {
                throw new Error(config.id + ': no tpl set');
            }
            if (!VTM.get(config.tpl)) {
                _tpl = document.getElementById(config.tpl);
                if (!_tpl)
                    throw new Error('no tpl ' + config.tpl + ' found');
                VTM.add(config.tpl, _tpl.parentNode.removeChild(_tpl));
            }
            div.innerHTML = VTM.get(config.tpl).innerHTML;
            me.set('tpl', div);
            return me;
        },
        /**
         * @returns {View}
         */
        initModels: function () {
            var me = this,
                models,
                model;
            if (!me.getModels) {
                return me;
            }

            models = me.getModels();
            for (model in models) {
                if (models.hasOwnProperty(model)) {
                    me.setModel(model, models[model]);
                }
            }
            return me;
        },
        /**
         * @returns {View}
         */
        setModel: function (namespace, model) {
            var me = this,
                models = me.getModels();
            models[model.getNamespace()] = model;
            me.setModels(models);
            return me;
        },
        /**
         * @param namespace
         * @returns {yamvc.Model}
         */
        getModel: function (namespace) {
            var me = this,
                models = me.getModels();
            return models[namespace];
        },
        /**
         * @param data
         * @returns {Node}
         */
        render: function (data) {
            var me = this,
                tpl = me.get('tpl'),
                parsedTpl = document.createElement('div'),
                config = me.get('config'),
                id = config.renderTo,
                models = data || config.models,
                parent = config.parent,
                parentView = config.parent,
                el,
                headers,
                domToText;

            if (parent) {
                if (id && parent.queryEl(id)) {
                    parent = parent.queryEl(id);
                } else {
                    parent = parent.get('el');
                }
            } else {
                if (id) {
                    parent = document.querySelector(id);
                }
            }

            domToText = tpl.innerHTML;
            if (models) {
                headers = domToText.match(/\{\{(.*?)\}\}/gi);
                if (headers) {
                    for (var i = 0, len = headers.length; i < len; i++) {
                        var fullHeader = headers[i],
                            header = fullHeader.substr(2, (fullHeader.length - 4)).split('.');
                        if (
                            typeof models[header[0]] !== 'undefined' &&
                                typeof models[header[0]] !== 'function'
                            ) {
                            domToText = domToText.replace(fullHeader, models[header[0]].data(header[1]));
                        } else {
                            domToText = domToText.replace(fullHeader, "");
                        }
                    }
                }
            }
            parsedTpl.innerHTML = domToText;
            var j = 0;
            while (j < tpl.childNodes.length && tpl.childNodes.item(j).nodeType !== 1) {
                j++;
            }
            el = parsedTpl.childNodes.item(j);
            el.setAttribute('yamvc-id', config.id);
            me.set('el', el);
            if (parent) {
                parent.appendChild(el);
                if (parentView) {
                    parentView.views = parentView.views || {};
                    parentView.views[config.id] = me;
                }
                me.set('isInDOM', true);
                me.reAppendChildren();
                me.fireEvent('render', null, me);
            }
            return el;
        },
        /**
         * @param selector
         * @returns {Node}
         */
        partialRender: function (selector) {
            var me = this,
                tpl = me.get('tpl'),
                elementTpl = tpl.querySelector(selector),
                element = me.queryEl(selector),
                domToText = elementTpl.innerHTML,
                models = me.getModels(),
                headers;

            headers = domToText.match(/\{\{(.*?)\}\}/gi);
            if (headers) {
                for (var i = 0, len = headers.length; i < len; i++) {
                    var fullHeader = headers[i],
                        header = fullHeader.substr(2, (fullHeader.length - 4)).split('.');
                    if (
                        typeof models[header[0]] !== 'undefined' &&
                            typeof models[header[0]] !== 'function'
                        ) {
                        domToText = domToText.replace(fullHeader, models[header[0]].data(header[1]));
                    } else {
                        domToText = domToText.replace(fullHeader, "");
                    }
                }
            }
            element.innerHTML = domToText;
            me.fireEvent('partialRender', null, me, element);
            return element;
        },
        /**
         * @param selector
         * @returns {Node}
         */
        queryEl: function (selector) {
            return this.get('el').querySelector(selector);
        },
        /**
         * @param selector
         * @returns {NodeList}
         */
        queryEls: function (selector) {
            return this.get('el').querySelectorAll(selector);
        },
        /**
         * @param id
         * @returns {View||Boolean}
         */
        getChild: function (id) {
            var me = this,
                config = me.get('config');
            if (!config.views || config.views && !config.views[id])
                return false;
            return config.views[id];
        },
        /**
         * @param view
         * @param selector
         * @returns {View}
         */
        addChild: function (view, selector) {
            var me = this;
            view.appendTo(me, selector);
            me.fireEvent('elementAdded', me, view);
            return me;
        },
        /**
         * @returns {View}
         */
        removeChildren: function () {
            var views = this.get('config').views || [];
            for (var i = 0, len = views.length; i < len; i++) {
                views[i].clear();
            }
            return this;
        },
        /**
         * @returns {View}
         */
        clear: function () {
            var me = this, el = me.get('el');
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
                id = config.id,
                views = parent.get('config').views,
                parentEl = selector ? parent.get('el').querySelector(selector) : parent.get('el');

            if (selector) {
                config.renderTo = selector;
            }

            if (!config.parent) {
                config.parent = parent;
            }
            else if (config.parent && config.parent.get('config').id !== parent.get('config').id) {
                delete config.parent.get('config').views[id];
            }

            if (!me.isInDOM() && parent.isInDOM()) {
                if (!me.get('el')) {
                    me.render();
                } else {
                    parentEl.appendChild(me.get('el'));
                    me.set('isInDOM', true);
                    me.reAppendChildren();
                    me.fireEvent('render', null, me);
                }
            }
            views[id] = me;
            config.parent = parent;
            return me;
        },
        /**
         * @returns {View}
         */
        reAppendChildren: function () {
            var views = this.get('config').views;
            for (var key in views) {
                if (views.hasOwnProperty(key)) {
                    views[key].appendTo(this);
                }
            }
            return this;
        },
        /**
         * @returns {View}
         */
        show: function () {
            var me = this,
                style;
            if (!me.isInDOM())
                return me;
            style = me.get('el').style;
            style.display = 'block';
            me.set('visible', true);
            me.fireEvent('show', me, style);
            return me;
        },
        /**
         * @returns {View}
         */
        hide: function () {
            var me = this,
                style;
            if (!me.isInDOM())
                return me;
            style = me.get('el').style;
            style.display = 'none';
            me.set('visible', false);
            me.fireEvent('hide', me, style);
            return me;
        },
        /**
         * @returns {Boolean}
         */
        isVisible: function () {
            return this.get('visible') && this.isInDOM();
        }
    });


    yamvc.ViewManager = VM;
    window.yamvc = yamvc;
    window.yamvc.View = View;
}(window));