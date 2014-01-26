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
    Controller = yamvc.Core.$extend({
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

    window.yamvc.Controller = Controller;
}(window));