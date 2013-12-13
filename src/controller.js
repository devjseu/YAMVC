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

    var router;

    /**
     *
     * @type {*}
     */
    window.Controller = Base.extend(function Controller(opts) {
        Base.apply(this, arguments);
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
        router = router || new Router();
        me.set('initOpts', opts);
        me.set('config', config);
        me.set('routes', config.routes || {});
        me.set('control', config.events || {});
        me.set('views', config.views || {});
        me.initConfig();
        return me;
    };

    /**
     * Initialize controller config
     *
     */
    Controller.prototype.initConfig = function () {
        Base.prototype.initConfig.apply(this);
        var me = this,
            routes = me.get('routes'),
            events = me.get('control'),
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

    /**
     *
     * @param view
     */
    Controller.prototype.resolveEvents = function (view) {
        var events = this.get('control'),
            viewEvents;
        for (var query in events) {
            if (events.hasOwnProperty(query)) {
                viewEvents = events[query];
                var elements = view.get('el').querySelectorAll(query);
                for (var i = 0, l = elements.length; i < l; i++) {
                    for (var event in viewEvents) {
                        if (viewEvents.hasOwnProperty(event)) {
                            elements[i].addEventListener(event, viewEvents[event].bind(view));
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
}(window));