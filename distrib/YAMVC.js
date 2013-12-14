/*! YAMVC v0.1.1 - 2013-12-14 
 *  License:  */
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
        Base,
        onReadyCallbacks = [],
        readyStateCheckInterval;

    function run() {
        for (var i = 0, l = onReadyCallbacks.length; i < l; i++) {
            onReadyCallbacks[i]();
        }
    }

    Base = yamvc.Base || (function () {

        /**
         *
         * @constructor
         *
         */
        function Base() {
            this.set('listeners', {});
            this.set('suspendEvents', false);
            this.bindMethods.apply(this, arguments);
            this.init.apply(this, arguments);
        }

        /**
         * abstract method
         *
         */
        Base.prototype.init = function () {
        };

        /**
         *
         */
        Base.prototype.initConfig = function () {
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
                        me.set(property, value);
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
        Base.prototype.bindMethods = function (initOpts) {
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
        Base.prototype.set = function (property, value) {
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
        Base.prototype.get = function (property) {
            return this["_" + property];
        };

        /**
         * fire event
         * @param evName
         * @returns {boolean}
         *
         */
        Base.prototype.fireEvent = function (evName /** param1, ... */) {
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
        Base.prototype.addListener = function (evName, callback) {
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
        Base.prototype.removeListener = function (evName, callback) {
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
         * add callback to property change event
         * @param property
         * @param callback
         * @returns {this}
         *
         */
        Base.prototype.onChange = function (property, callback) {
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

        /**
         * suspend all events
         * @param {Boolean} suspend
         */
        Base.prototype.suspendEvents = function (suspend) {
            suspend = suspend || true;
            this.set('suspendEvents', suspend);
            return this;
        };


        /**
         * provide way to execute all necessary code after DOM is ready
         *
         * @param callback
         */
        Base.onReady = function (callback) {
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
         */
        Base.mixin = function (obj) {
            var Class = this,
                method;

            if (typeof obj === 'function')
                obj = obj.prototype;

            for (method in obj) {
                if (obj.hasOwnProperty(method)) {
                    Class.prototype[method] = obj[method];
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
        Base.extend = function (Func) {
            var Parent = this,
                Class = function () {
                    Func.prototype.constructor.apply(this, arguments);
                };
            for (var method in Parent.prototype) {
                if (Parent.prototype.hasOwnProperty(method)) {
                    Class.prototype[method] = Parent.prototype[method];
                }
            }
            Class.extend = Base.extend;
            return Class;
        };
        return Base;
    }());

    yamvc.Base = Base;
    window.yamvc = yamvc;
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
    Controller = yamvc.Base.extend(function(opts) {
        yamvc.Base.apply(this, arguments);
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
        yamvc.Base.prototype.initConfig.apply(this);
        var me = this,
            routes = me.get('routes'),
            events = me.get('events'),
            views = me.get('views');
        if (routes) {
            for (var k in routes) {
                if (routes.hasOwnProperty(k)) {
                    var callback = me[routes[k]].bind(me);
                    router.when(k, callback);
                }
            }
        }
        if (events && views) {
            for (var view in views) {
                if (views.hasOwnProperty(view)) {
                    views[view].addListener('render', me.resolveEvents.bind(me));
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
            viewEvents;
        for (var query in events) {
            if (events.hasOwnProperty(query)) {
                viewEvents = events[query];
                var elements = view.get('el').querySelectorAll(query);
                for (var i = 0, l = elements.length; i < l; i++) {
                    for (var event in viewEvents) {
                        if (viewEvents.hasOwnProperty(event)) {
                            elements[i].addEventListener(event, viewEvents[event].bind(this, view));
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
    Router = yamvc.Base.extend(function () {
        yamvc.Base.apply(this);
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
 * View Manager is singleton object and helps to get proper view instance based on passed id
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
    View = yamvc.Base.extend(function () {
        yamvc.Base.apply(this, arguments);
    });


    /**
     * Initialize view
     * @param opts
     */
    View.prototype.init = function (opts) {
        var config, id;
        opts = opts || {};
        config = opts.config || {};
        config.id = id = config.id || 'view-' + VM.i;
        config.views = config.views || {};
        this.set('initOpts', opts);
        this.set('config', config);
        this.initConfig();
        VM.add(id, this);
    };


    /**
     * Initialize view config
     */
    View.prototype.initConfig = function () {
        yamvc.Base.prototype.initConfig.apply(this);
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

    /**
     * Render view to DOM
     * @param data
     * @returns {Node}
     */
    View.prototype.render = function (data) {
        var me = this,
            tpl = me.get('tpl'),
            config = me.get('config'),
            id = config.renderTo,
            model = data || config.models,
            parent = config.parent,
            parentView = config.parent,
            el,
            domToText;

        if (parent) {
            if (id) {
                parent = parent.querySelectorAll(id).item(0);
            } else {
                parent = parent.get('el');
            }
        } else {
            if (id) {
                parent = document.querySelectorAll(id).item(0);
            }
        }

        if (model) {
            domToText = tpl.innerHTML;
            var headers = domToText.match(/\{\{(.*?)\}\}/gi);
            if (headers) {
                for (var i = 0, len = headers.length; i < len; i++) {
                    var fullHeader = headers[i],
                        header = fullHeader.substr(2, (fullHeader.length - 4));
                    if (typeof model[header] !== 'undefined') {
                        domToText = domToText.replace(fullHeader, model[header]);
                    } else {
                        domToText = domToText.replace(fullHeader, "");
                    }
                }
            }
            tpl.innerHTML = domToText;
        }
        var j = 0;
        while (j < tpl.childNodes.length && tpl.childNodes.item(j).nodeType !== 1) {
            j++;
        }
        el = tpl.childNodes.item(j);
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
        return tpl.childNodes.item(0);
    };

    /**
     *
     * @param view
     * @param selector
     */
    View.prototype.addChild = function (view, selector) {
        view.appendTo(this, selector);
        this.fireEvent('elementAdded', this, view);
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

        if (config.parent && config.parent.get('config').id !== parent.get('config').id) {
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