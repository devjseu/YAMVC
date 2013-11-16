/*! YAMVC v0.1.0 - 2013-11-16 
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
    var Base = window.Base || (function () {
        function Base() {
            this.set('listeners', {});
            this.set('suspendEvents', false);
            this.bindMethods.apply(this, arguments);
            this.init.apply(this, arguments);
        }

        /**
         * abstract method
         */
        Base.prototype.init = function () {
        };

        /**
         * abstract method
         */
        Base.prototype.initConfig = function () {
        };

        /**
         * binds custom methods from config object to class instance
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
         * fire event
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
         * unbind callback
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
         * extend passed function
         * @static
         * @param Func
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
    var router = new window.Router();
    window.Controller = Base.extend(function Controller(opts) {
        Base.prototype.constructor.apply(this, arguments);
    });

    Controller.prototype.init = function (opts) {
        var config;
        opts = opts || {};
        config = opts.config || {};
        this.set('initOpts', opts);
        this.set('config', config);
        this.set('routes', config.routes || {});
        this.initConfig();
    };

    Controller.prototype.initConfig = function () {
        var routes = this.get('routes');
        if (routes) {
            for (var k in routes) {
                if (routes.hasOwnProperty(k)) {
                    var callback = this[routes[k]].bind(this);
                    router.when(k, callback);
                }
            }
        }
    };

    Controller.prototype.getRouter = function () {
        return router;
    };
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
    /**
     *
     * @type {function}
     */
    window.Router = Base.extend(function Router() {
        Base.prototype.constructor.apply(this);
    });

    /**
     *
     */
    Router.prototype.init = function () {
        this.set('routing', {});
        this.bindEvents();
    };

    /**
     *
     * @returns {*}
     */
    Router.prototype.bindEvents = function () {
        window.onhashchange = this.onHashChange.bind(this);
        return this;
    };
    /**
     *
     * @returns {*}
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
    Router.prototype.restore = function () {
        this.onHashChange();
    };
    /**
     *
     * @param path
     * @param callback
     * @returns {*}
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
    var VTM;
    window.ViewManager = {
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
    window.ViewTemplateManager = VTM = {
        tpl: {},
        add: function (id, view) {
            this.tpl[id] = view;
        },
        get: function (id) {
            return this.tpl[id];
        }
    };
    /**
     *
     * @type {function}
     */
    window.View = Base.extend(function View(opts) {
        Base.prototype.constructor.apply(this, arguments);
    });

    View.prototype.init = function (_opts) {
        var config,
            opts = _opts || {},
            id;
        config = opts.config || {};
        config.id = id = config.id || 'view-' + ViewManager.i;
        config.views = config.views || {};
        this.set('initOpts', opts);
        this.set('config', config);
        this.initConfig();
        ViewManager.add(id, this);
    };
    /**
     *
     */
    View.prototype.initConfig = function () {
        var me = this,
            config = me.get('config'),
            div = document.createElement('div'),
            _tpl,
            tpl;
        if (!config.tpl) {
            throw new Error('no tpl set');
        }
        if (!VTM.get(config.tpl)) {
            _tpl = document.getElementById(config.tpl);
            if (!_tpl)
                throw new Error('no tpl ' + config.tpl + ' found');
            VTM.add(config.tpl, _tpl.parentNode.removeChild(_tpl));
        }
        tpl = VTM.get(config.tpl).childNodes.item(1).cloneNode(true);
        div.appendChild(tpl);
        me.set('tpl', div);
    };
    /**
     *
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
                    if (model[header]) {
                        domToText = domToText.replace(fullHeader, model[header]);
                    } else {
                        domToText = domToText.replace(fullHeader, "");
                    }
                }
            }
            tpl.innerHTML = domToText;
        }
        el = tpl.childNodes.item(0);
        el.setAttribute('yamvc-id', config.id);
        me.set('el', el);
        if (parent) {
            parent.appendChild(el);
            me.set('isInDOM', true);
            me.reAppendChildren();
        }
        return tpl.childNodes.item(0);
    };
    /**
     *
     */
    View.prototype.removeChildren = function () {
        var views = this.get('config').views || [];
        for (var i = 0, len = views.length; i < len; i++) {
            views[i].clear();
        }
    };
    /**
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
     *
     * @returns {*}
     */
    View.prototype.isInDOM = function () {
        return this._isInDOM;
    };

    /**
     *
     * @param parent
     */
    View.prototype.appendTo = function (parent) {
        var me = this,
            config = me.get('config'),
            id = config.id,
            views = parent.get('config').views,
            parentEl = parent.get('el');
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
            }
        }
        views[id] = me;
        config.parent = parent;
    };


    /**
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

}(window));