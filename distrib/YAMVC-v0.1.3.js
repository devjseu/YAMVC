/*! YAMVC v0.1.3 - 2013-12-16 
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

    /**
     * provide way to execute all necessary code after DOM is ready
     *
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
         *
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
                if (property === 'init') {
                    if (typeof this === 'function') {
                        this._mixins.push(mixin.init);
                    }
                    continue;
                }
                if (mixin.hasOwnProperty(property)) {
                    prototype[property] = mixin[property];
                }
            }

        };

        /**
         *
         * @type {Array}
         * @private
         */
        Core._mixins = [];

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
                Class,
                __hasProp = {}.hasOwnProperty,
                __extends = function (child, parent) {
                    for (var key in parent) {
                        if (__hasProp.call(parent, key)) child[key] = parent[key];
                    }
                    function Instance() {
                        this.constructor = child;
                    }

                    Instance.prototype = parent.prototype;
                    child.prototype = new Instance();
                    child.__super__ = parent.prototype;
                    return child;
                };

            Class = (function (_super) {
                __extends(Func, _super);
                return Func;
            }(Parent));

            Class.extend = Core.extend;
            Class.mixin = Core.mixin;
            Class._mixins = [];
            return Class;
        };

        Core.mixin(yamvc.mixins.GetSet);
        Core.mixin(yamvc.mixins.Observable);

        return Core;
    }());

    yamvc.Core = Core;
    window.yamvc = yamvc;
}(window));
(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Collection;

    Collection = yamvc.Core.extend(function () {
        yamvc.Core.apply(this, arguments);
    });

    Collection.prototype.init = function (opts) {
        yamvc.Core.prototype.init.apply(this, arguments);
        var me = this, config;
        opts = opts || {};
        config = opts.config || {};
        me.set('initOpts', opts);
        me.set('config', config);
        me.set('set', []);
        me.set('cache', []);
        me.initConfig();
    };

    Collection.prototype.initConfig = function () {
        yamvc.Core.prototype.initConfig.apply(this);
        if (!config.model) {
            throw new Error("Set model type for collection");
        }
        if (!config.model instanceof yamvc.Model) {
            throw new Error("Set proper model type for collection");
        }
    };

    Collection.prototype.load = function (params) {
        var me = this,
            data = me.get('data'),
            idProperty = me.get('idProperty'),
            callback,
            key, i = 0;

        for (key in params) i++;

        if (
            i === 0
            )
            throw new Error('You need to pass at least one condition to load model collection');

        callback = function () {
            if (me.getProxy().getStatus() === 'success') {
                me.set('isDirty', false);
                me.prepareData();
                me.fireEvent('loaded', me, me.getProxy().getResponse(), 'read');
            } else {
                me.fireEvent('error', me, 'read');
            }
        };
        me.getProxy().read(me.getNamespace(), params, callback);
    };

    Collection.prototype.prepareData = function () {
        var me = this,
            ModelInstance = me.getModel(),
            results = me.getProxy().getResult(),
            rows = results.rows,
            models = [];
        for (var i = 0, l = rows.length; i < l; i++) {
            models.push(new ModelInstance({
                data : rows[i]
            }));
        }
        me.set('set', models);
        me.set('total', results.total);
    };

    window.yamvc = yamvc;
    window.yamvc.Collection = Collection;
}(window));

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
    Controller = yamvc.Core.extend(function (opts) {
        yamvc.Core.apply(this, arguments);
    });

    /**
     * Initialize controller
     *
     * @param opts
     *
     */
    Controller.prototype.init = function (opts) {
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
        return me;
    };

    /**
     * Initialize controller config
     *
     */
    Controller.prototype.initConfig = function () {
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
    };

    Controller.prototype.renderViews = function () {
        var me = this,
            views = me.get('views');
        for (var view in views) {
            if (views.hasOwnProperty(view)) {
                if (views[view].getAutoCreate && views[view].getAutoCreate()) {
                    views[view].render();
                }
            }
        }
    };

    /**
     *
     * @param view
     */
    Controller.prototype.resolveEvents = function (view) {
        var events = this.get('events'),
            viewEvents,
            scope;
        for (var query in events) {
            if (events.hasOwnProperty(query)) {
                viewEvents = events[query];
                var elements = view.get('el').querySelectorAll(query);
                for (var i = 0, l = elements.length; i < l; i++) {
                    for (var event in viewEvents) {
                        if (viewEvents.hasOwnProperty(event)) {
                            scope = (function (func, scope, arg) {
                                return func.bind(scope, arg);
                            }(viewEvents[event], this, view));
                            elements[i].addEventListener(event, scope);
                        }
                    }
                }
            }
        }
    };


    /**
     *
     * @returns {window.Router}
     */
    Controller.prototype.getRouter = function () {
        return router;
    };

    /**
     * Redirect to different location
     *
     * @param path
     * @returns {Controller}
     *
     */
    Controller.prototype.redirectTo = function (path) {
        window.location.hash = path;
        return this;
    };

    window.yamvc.Controller = Controller;
}(window));
//TODO not ready!
(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Proxy;

    Proxy = yamvc.Core.extend(function () {
        yamvc.Core.apply(this, arguments);
    });

    Proxy.prototype.init = function (opts) {
        yamvc.Core.prototype.init.apply(this, arguments);
        var me = this, config;
        opts = opts || {};
        config = opts.config || {};
        me.set('initOpts', opts);
        me.set('config', config);
        me.initConfig();
    };

    Proxy.prototype.initConfig = function () {
        var me = this;
        yamvc.Core.prototype.initConfig.apply(this);
        me.set('lastResponse', {});
    };

    /**
     * abstract
     */
    Proxy.prototype.read = function () {
    };

    /**
     * abstract
     */
    Proxy.prototype.create = function () {
    };

    /**
     * abstract
     */
    Proxy.prototype.update = function () {

    };

    /**
     * abstract
     */
    Proxy.prototype.destroy = function () {
    };

    /**
     * abstract
     */
    Proxy.prototype.update = function () {

    };

    /**
     * abstract
     */
    Proxy.prototype.getResult = function () {
        var me = this;
        return me.get('lastResponse');
    };

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.Proxy = Proxy;
}(window));

//TODO not ready!
(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Localstorage;

    Localstorage = yamvc.Core.extend(function (){
        yamvc.Core.apply(this, arguments);
    });

    Localstorage.prototype.init = function (opts) {
        yamvc.Core.prototype.init.apply(this, arguments);
        var me = this, config;
        opts = opts || {};
        config = opts.config || {};
        me.set('initOpts', opts);
        me.set('config', config);
        me.initConfig();
    };

    Localstorage.prototype.initConfig = function () {
        yamvc.Core.prototype.initConfig.apply(this);

    };

    Localstorage.prototype.read = function () {
        var property, prModel = localStorage[model.getNamespace()] || {};
        for (property in prModel) {
            if (prModel.hasOwnProperty(property)) {
                model[property] = prModel[property];
            }
        }

    };

    Localstorage.prototype.create = function () {
        var property, model;
        localStorage[model.getNamespace()] = {};
        for (property in model) {
            if (model.hasOwnProperty(property)) {
                if (typeof model[property] !== 'function') {
                    localStorage[model.getNamespace()][property] = model[property];
                }
            }
        }
    };

    Localstorage.prototype.update = function () {

    };

    Localstorage.prototype.destroy = function () {
        delete localStorage[model.getNamespace()];
    };

    Localstorage.prototype.update = function () {

    };

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.proxy = window.yamvc.data.proxy || {};
    window.yamvc.data.proxy.Localstorage = Localstorage;
}(window));

(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Model;

    Model = yamvc.Core.extend(function () {
        yamvc.Core.apply(this, arguments);
    });

    Model.prototype.init = function (opts) {
        yamvc.Core.prototype.init.apply(this, arguments);
        var me = this, config;
        opts = opts || {};
        config = opts.config || {};
        me.set('initOpts', opts);
        me.set('config', config);
        me.initConfig();
        me.initData();
    };

    Model.prototype.initConfig = function () {
        var me = this,
            config = me.get('config');
        yamvc.Core.prototype.initConfig.apply(this);
        if (!config.namespace)
            throw new Error("Model need to have namespace property in your model configuration");
        return this;
    };

    Model.prototype.initData = function () {
        var me = this,
            opts = me.get('initOpts'),
            config = me.get('config');
        me.set('data', opts.data || {});
        me.set('idProperty', config.idProperty || 'id');
    };

    Model.prototype.$set = function (property, value) {
        var me = this,
            data = me.get('data'),
            oldVal = data[property];

        if (value !== oldVal) {
            data[property] = value;
            me.set('isDirty', true);
            me.fireEvent('data' + property.charAt(0).toUpperCase() + property.slice(1) + 'Change', me, value, oldVal);
        }
    };

    Model.prototype.$get = function (property) {
        var me = this;
        return me.get('data')[property];
    };

    Model.prototype.setData = function (newData) {
        var me = this,
            data = me.get('data'),
            key;

        for (key in newData) {
            if (newData.hasOwnProperty(key)) {
                me.$set(key, newData[key]);
            }
        }

        me.fireEvent('dataChange', me, data);
    };

    Model.prototype.load = function (params) {
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
    };

    Model.prototype.save = function () {
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
    };

    Model.prototype.remove = function () {
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
    };

    window.yamvc = yamvc;
    window.yamvc.Model = Model;
}(window));

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
    Router = yamvc.Core.extend(function () {
        yamvc.Core.apply(this);
    });

    /**
     * Initialize router
     */
    Router.prototype.init = function () {
        this.set('routing', {});
        this.bindEvents();
    };

    /**
     * Bind all necessary events
     * @returns {Router}
     *
     */
    Router.prototype.bindEvents = function () {
        window.onhashchange = this.onHashChange.bind(this);
        return this;
    };

    /**
     * When hash change occurs match routes and run proper callback
     * @returns {Router}
     *
     */
    Router.prototype.onHashChange = function () {
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
    };

    /**
     * Restore state
     *
     * @returns {Router}
     *
     */
    Router.prototype.restore = function () {
        this.onHashChange();
        return this;
    };

    /**
     * Define new route
     *
     * @param path
     * @param callback
     * @returns {Router}
     *
     */
    Router.prototype.when = function (path, callback) {
        var routing = this.get('routing'),
            paths = path.split("/"),
            action = paths.shift();
        routing[action] = {
            callback: callback,
            params: paths
        };
        this.set('routing', routing);
        return this;
    };

    window.yamvc.Router = Router;
}(window));
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
    /**
     * Allows to get proper with by id
     * @type {{views: {}, i: number, add: Function, get: Function}}
     */
    VM = {
        views: {},
        i: 0,
        add: function (id, view) {
            this.views[id] = view;
            this.i++;
        },
        get: function (id) {
            return this.views[id];
        }
    };
    /**
     *
     * Private object, keeping all templates in one place
     *
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
    /**
     * @constructor
     * @params opts Object with configuration properties
     * @type {function}
     */
    View = yamvc.Core.extend(function () {
        yamvc.Core.apply(this, arguments);
    });


    /**
     * Initialize view
     * @param opts
     */
    View.prototype.init = function (opts) {
        yamvc.Core.prototype.init.apply(this);
        var me = this, config, id;
        opts = opts || {};
        config = opts.config || {};
        config.id = id = config.id || 'view-' + VM.i;
        config.views = config.views || {};
        me.set('initOpts', opts);
        me.set('config', config);
        me.initConfig();
        VM.add(id, me);
    };


    /**
     * Initialize view config
     */
    View.prototype.initConfig = function () {
        yamvc.Core.prototype.initConfig.apply(this);
        this.initTemplate();
        this.initModels();
    };

    View.prototype.initTemplate = function () {
        var me = this,
            config = me.get('config'),
            div = document.createElement('div'),
            _tpl;
        if (!config.tpl) {
            throw new Error('no tpl set');
        }
        if (!VTM.get(config.tpl)) {
            _tpl = document.getElementById(config.tpl);
            if (!_tpl)
                throw new Error('no tpl ' + config.tpl + ' found');
            VTM.add(config.tpl, _tpl.parentNode.removeChild(_tpl));
        }
        div.innerHTML = VTM.get(config.tpl).innerHTML;
        me.set('tpl', div);
    };

    View.prototype.initModels = function () {
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
    };
    /**
     *
     * @param namespace
     * @param model
     */
    View.prototype.setModel = function (namespace, model) {
        var me = this,
            models = me.getModels();
        models[model.getNamespace()] = model;
        me.setModels(models);
        return me;
    };

    /**
     *
     * @param namespace
     * @returns {*}
     */
    View.prototype.getModel = function (namespace) {
        var me = this,
            models = me.getModels();
        return models[namespace];
    };

    /**
     * Render view to DOM
     * @param data
     * @returns {Node}
     */
    View.prototype.render = function (data) {
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
                        domToText = domToText.replace(fullHeader, models[header[0]].$get(header[1]));
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
    };

    /**
     *
     * @param selector
     */
    View.prototype.partialRender = function (selector) {
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
                    domToText = domToText.replace(fullHeader, models[header[0]].$get(header[1]));
                } else {
                    domToText = domToText.replace(fullHeader, "");
                }
            }
        }
        element.innerHTML = domToText;
        me.fireEvent('partialRender', null, me, element);
        return me;
    };

    /**
     *
     * @param selector
     */
    View.prototype.queryEl = function (selector) {
        return this.get('el').querySelector(selector);
    };

    /**
     *
     * @param selector
     */
    View.prototype.queryEls = function (selector) {
        return this.get('el').querySelectorAll(selector);
    };

    /**
     *
     * @param id
     * @returns {*}
     */
    View.prototype.getChild = function (id) {
        var me = this,
            config = me.get('config');
        if(config.views && !config.views[id] || !config.view)
            return false;
        return config.views[id];
    };

    /**
     *
     * @param view
     * @param selector
     */
    View.prototype.addChild = function (view, selector) {
        var me = this;
        view.appendTo(me, selector);
        me.fireEvent('elementAdded', me, view);
        return me;
    };

    /**
     * Remove all children from DOM
     *
     */
    View.prototype.removeChildren = function () {
        var views = this.get('config').views || [];
        for (var i = 0, len = views.length; i < len; i++) {
            views[i].clear();
        }
    };

    /**
     * Remove view from DOM
     *
     */
    View.prototype.clear = function () {
        var me = this, el = me.get('el');
        if (me.isInDOM()) {
            el.parentNode.removeChild(el);
            me.set('isInDOM', false);
        }
        return me;
    };

    /**
     * Return if view is in DOM
     * @returns {Boolean}
     *
     */
    View.prototype.isInDOM = function () {
        return this._isInDOM;
    };

    /**
     * Append view to proper element in passed parent
     *
     * @param parent
     * @param selector
     *
     */
    View.prototype.appendTo = function (parent, selector) {
        var me = this,
            config = me.get('config'),
            id = config.id,
            views = parent.get('config').views,
            parentEl = selector ? parent.get('el').querySelector(selector) : parent.get('el');

        if (selector) {
            config.renderTo = selector;
        }

        if(!config.parent){
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
    };


    /**
     * Force reapend when parent was render to DOM
     *
     */
    View.prototype.reAppendChildren = function () {
        var views = this.get('config').views;
        for (var key in views) {
            if (views.hasOwnProperty(key)) {
                views[key].appendTo(this);
            }
        }
    };

    yamvc.ViewManager = VM;
    window.yamvc = yamvc;
    window.yamvc.View = View;
}(window));