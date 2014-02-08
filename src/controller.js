/**
 * ## Basic controller usage
 *
 *     @example
 *     var ctl = new Controller({
 *         config: {
 *             name: 'Main',
 *             views: {
 *                 layout: viewManager.get('view-0')
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

    var ya = window.ya || {},
        Controller,
        router,
        CM;

    // `ya.ControllerManager` stores all created views and allow as to
    // use `get` method (with id as argument) to return requested view.
    CM = {
        controller: [],
        i: 0,
        // Add view to manager
        /**
         * @param id
         * @param view
         */
        add: function (id, view) {
            this.controller.push(view);
            this.i++;
        },
        // Get view by its id
        /**
         * @param id
         * @returns {View}
         */
        get: function (id) {
            var len = this.controller.length;

            while (len--) {

                if (this.controller[len].getId() === id) break;

            }

            return this.controller[len];
        }
    };

    /**
     *
     * @type {*}
     */
    Controller = ya.Core.$extend({
        init: function (opts) {
            var me = this, config, id;

            opts = opts || {};
            config = ya.$merge(me._config, opts.config);
            config.id = id = config.id || 'controller-' + CM.i;
            router = router || new ya.Router();

            me.set('initOpts', opts);
            me.set('config', config);
            me.set('routes', config.routes || {});
            me.set('events', config.events || {});
            me.set('views', config.views || {});

            me.initConfig();
            me.renderViews();
            me.restoreRouter();
            CM.add(id, me);

            return me;
        },
        initConfig: function () {
            ya.Core.prototype.initConfig.apply(this);
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

                        views[view].addEventListener('render', me.resolveEvents.bind(me));

                    }

                }

                for (query in events) {

                    if (events.hasOwnProperty(query)) {

                        if (rx.test(query)) {

                            view = views[query.substr(1)];

                            if (view) {

                                for (var event in events[query]) {

                                    if (events[query].hasOwnProperty(event)) {
                                        view.addEventListener(event, events[query][event].bind(me, view));
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
                elements,
                scope;

            for (var query in events) {

                if (events.hasOwnProperty(query)) {

                    viewEvents = events[query];
                    elements = view.get('el').querySelectorAll(query);
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
        },
        redirectTo: function (path) {

            window.location.hash = path;

            return this;
        }
    });
    window.ya.controllerManager = CM;
    window.ya.Controller = Controller;
}(window));