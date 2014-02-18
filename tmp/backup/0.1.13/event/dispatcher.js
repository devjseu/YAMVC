(function (window, undefined) {
    "use strict";
    var ya = window.ya || {},
        __find = ya.mixins.Array.find,
        __each = ya.mixins.Array.each,
        Dispatcher;

    /**
     * @type {Dispatcher}
     */
    Dispatcher = ya.Core.$extend({
        defaults: {
            delegates: null
        },
        /**
         * @param opts
         * @returns {Dispatcher}
         */
        init: function (opts) {
            // Standard way of initialization.
            var me = this, config;

            Dispatcher.Parent.init.apply(this, arguments);

            opts = opts || {};
            config = ya.$merge(me._config, opts.config);

            me.set('initOpts', opts);
            me.set('config', config);

            me.initConfig();

            return me;
        },
        initConfig: function () {
            var me = this;

            // After calling parent method
            Dispatcher.Parent.initConfig.apply(this, arguments);

            // set defaults.
            me.setDelegates([]);

            return me;
        },
        /**
         * @param scope
         * @param e
         * @returns {Dispatcher}
         */
        add: function (scope, e) {
            var me = this,
                query = Object.keys(e).pop(),
                event = e[query],
                dGroup = {},
                pos, view;

            query = query.split(" ");
            view = query.shift();
            if (view.search(/\$/) === 0) {

                view = view.replace("$", "");
                query = query.join(" ");
                pos = me.findGroup(view);
                if (pos >= 0) {

                    dGroup = me.getGroup(pos);
                    pos = __find.call(dGroup.selectors, 'selector', query);
                    if (pos >= 0) {
                        dGroup.selectors[0].events.push(event);
                    } else {

                        dGroup.selectors.push({
                            scope: scope,
                            selector: query,
                            events: [
                                event
                            ]
                        });

                    }

                } else {

                    dGroup.viewId = view;
                    dGroup.selectors = [
                        {
                            scope: scope,
                            selector: query,
                            events: [
                                event
                            ]
                        }
                    ];

                    me.getDelegates().push(dGroup);

                }

            }

            return me;
        },
        /**
         * @param viewId
         * @returns {number}
         */
        findGroup: function (viewId) {
            return __find.call(this.getDelegates(), 'viewId', viewId);
        },
        /**
         * @param pos
         * @returns {*}
         */
        getGroup: function (pos) {
            return this.getDelegates()[pos];
        },
        /**
         * @param view
         */
        apply: function (view) {
            /*jshint -W083 */
            // Apply delegated events.
            var me = this,
                newScope = function (func, scope, arg) {
                    return func.bind(scope, arg);
                },
                els, group;

            while (view) {

                group = me.findGroup(view.getId());
                if (group >= 0) {

                    group = me.getGroup(group);
                    __each.call(group.selectors, function (r, i, a) {

                        if (r.selector)
                            els = view.queryEls(r.selector);
                        else
                            els = [view.get('el')];

                        if (els.length) {

                            __each.call(els, function (node) {

                                __each.call(r.events, function (e) {

                                    for (var eType in e) {
                                        if (e.hasOwnProperty(eType)) {

                                            node.addEventListener(eType, newScope(e[eType], r.scope, view), false);

                                        }
                                    }

                                });

                            });

                        }

                    });

                }

                view = view.getParent();
            }

        }
    });

    window.ya = ya;
    window.ya.event = window.ya.event || {};
    window.ya.event.Dispatcher = Dispatcher;
    window.ya.event.dispatcher = Dispatcher.$create();
}(window));
