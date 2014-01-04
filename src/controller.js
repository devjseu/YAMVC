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