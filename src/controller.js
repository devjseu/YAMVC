/**
 * @description
 * ## Basic controller usage
 *
 *     @example
 *     var ctl = ya.Controller.$create({
 *         config: {
 *             name: 'Main',
 *             routes: {
 *                 "page/{\\d+}": 'onPageChange'
 *             },
 *             events : {
 *                  '$layout .btn-right' : 'onNextPage',
 *                  '$layout .btn-eft' : 'onPrevPage'
 *             }
 *         },
 *         onPageChange: function (id) {
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
    defaults: {
        id: null,
        routes: null,
        events: null
    },
    static: {
        router: null,
        getRouter: function () {

            ya.Controller.$router = ya.Controller.$router || new ya.Router();

            return ya.Controller.$router;
        }
    },
    init: function (opts) {
        var me = this;

        me
            .__super(opts)
            .initEvents()
            .initRoutes();

        ya.controller.$Manager.register(me.getId(), me);

        ya.$onReady(function () {
            me.restoreRouter();
        });

        return me;
    },
    /**
     * @method initDefaults
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        me.setId(me.getId() || 'controller-' + ya.controller.$Manager.getCount());

        me.set('router', ya.Controller.$getRouter());
        me.set('dispatcher', ya.event.$dispatcher);

        return me;
    },
    /**
     * @method initEvents
     * @private
     * @returns {this}
     */
    initEvents: function () {
        var me = this,
            events = me.getEvents(),
            views = [],
            rx = new RegExp('\\$([^\\s]+)'),
            dispatcher = me._dispatcher,
            matches, view, l, obj, current;

        if (events) {

            for (var query in events) {

                if (events.hasOwnProperty(query)) {

                    obj = {};
                    obj[query] = current = events[query];

                    for (var e in current) {

                        if (current.hasOwnProperty(e)) {

                            if (typeof current[e] !== 'function') {

                                current[e] = me[current[e]];

                            }

                        }

                    }

                    dispatcher.add(me, obj);

                    matches = query.match(rx);
                    if (matches) {

                        if (views.indexOf(matches[1]) < 0) {

                            views.push(matches[1]);

                        }

                    } else {

                        throw ya.Error.$create(
                            me.__class__ + ': Event query should begin from id of the view (current query: ' + e + ')', 'CTRL1'
                        );

                    }

                }

            }

            l = views.length;
            while (l--) {

                view = ya
                    .view.$Manager
                    .getItem(views[l]);

                if (view) {

                    if (view.isInDOM()) {

                        me.resolveEvents(view);

                    } else {

                        view.addEventListener('render', me.resolveEvents, me);

                    }

                }
            }

        }

        return me;
    },
    /**
     * @method initRoutes
     * @private
     * @returns {this}
     */
    initRoutes: function () {
        var me = this,
            routes = me.getRoutes(),
            router = me._router;

        if (routes) {
            for (var k in routes) {
                if (routes.hasOwnProperty(k)) {
                    var callback = me[routes[k]].bind(me);
                    router.when(k, callback);
                }
            }
        }

        return me;
    },
    /**
     * @method resolveEvents
     * @private
     * @returns {this}
     */
    resolveEvents: function (view) {
        var events = this.getEvents(),
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
    /**
     * Returns router object
     * @method getView
     * @returns {*}
     */
    getRouter: function () {
        return router;
    },
    /**
     * Returns view by id
     * @method getView
     * @returns {*}
     */
    getView: function (id) {
        return ya.view.$Manager.getItem(id);
    },
    /**
     * Returns controller by id
     * @method getController
     * @returns {*}
     */
    getController: function (id) {
        return ya.controller.$Manager.getItem(id);
    },
    /**
     * Returns collection by id
     * @method getCollection
     * @returns {*}
     */
    getCollection: function (id) {
        return ya.collection.$Manager.getItem(id);
    },
    /**
     * Restores router state
     * @method restoreRouter
     * @private
     * @returns {*}
     */
    restoreRouter: function () {
        var me = this;

        me.getRouter().restore();

        return me;
    },
    /**
     * Redirect application to passed path
     * @param path
     * @returns {*}
     */
    redirectTo: function (path) {

        window.location.hash = path;

        return this;
    }
});