(function (window, undefined) {
    "use strict";
    var ya = window.ya || {},
        __find = ya.mixins.Array.find,
        Dispatcher;

    /**
     * @type {Dispatcher}
     */
    Dispatcher = ya.Core.$extend({
        defaults: {
            delegates: null
        },
        init: function (opts) {
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

            Dispatcher.Parent.initConfig.apply(this, arguments);

            me.setDelegates([]);

            return me;
        },
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

                    dGroup = me.getDelegatesGroup(pos);
                    pos = __find.call(dGroup.selectors, 'selector', query);
                    if (pos >= 0) {
                        dGroup.selectors[0].events.push(event);
                    }else{

                        dGroup.selectors.push({
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
        findGroup: function (viewId) {
            var delegates = this.getDelegates(),
                len = delegates.length,
                del;

            while (len--) {

                del = delegates[len];
                if (del.viewId === viewId) {

                    break;

                }

            }

            return len;
        },
        getDelegatesGroup: function (pos) {
            return this.getDelegates()[pos];
        },
        dispatch: function (view) {

        }
    });

    window.ya = ya;
    window.ya.event = window.ya.event || {};
    window.ya.event.dispatcher = Dispatcher.$create();
}(window));
