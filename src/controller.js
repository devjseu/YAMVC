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
        add: function (id, controller) {
            this.controller.push(controller);
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
            CM.add(id, me);

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
                views = me.get('views'),
                rx = new RegExp('^\\$(.*)[\\s]'),
                matches, view;

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

                        matches = e.match(rx);
                        if (matches) {
                            view = ya
                                .viewManager
                                .get(matches[1]);

                            if (view.isInDOM()) {

                                me.resolveEvents(view);

                            } else {

                                view.addEventListener('render', me.resolveEvents.bind(me));

                            }


                        }else{

                            throw new Error('Event query should begin from id of the view (current query: ' + e + ')');

                        }

                    }
                }

            }
            return this;
        },
        resolveEvents: function (view) {
            var events = this.get('events'),
                viewEvents,
                newScope = function (func, scope, arg) {
                    return func.bind(scope, arg);
                },
                elements,
                selector,
                scope;

            for (var query in events) {

                if (events.hasOwnProperty(query)) {

                    viewEvents = events[query];
                    selector = query.split(" ").slice(1);
                    elements = view.get('el').querySelectorAll(selector.join(" "));
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