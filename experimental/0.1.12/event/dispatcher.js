(function (window, undefined) {
    "use strict";
    var ya = window.ya || {},
        __findAllByFn = ya.mixins.Array.findAllByFn,
        __each = ya.mixins.Array.each,
        __slice = Array.prototype.slice,
        Dispatcher;

    /**
     * @type {Dispatcher}
     */
    Dispatcher = ya.event.Dispatcher.$extend({
        /**
         * @param scope
         * @param e
         * @returns {Dispatcher}
         */
        add: function (scope, e) {
            var me = this,
                selector = Object.keys(e).pop();

            me.getDelegates().push({
                selector: selector,
                scope: scope,
                events: e[selector]
            });

            return me;
        },
        /**
         * @param view
         */
        apply: function (view) {
            // Apply delegated events.
            var me = this,
                delegates = me.getDelegates(),
                matchPos = [],
                newView = view,
                els = [],
                newScope = function (func, scope, arg) {
                    return func.bind(scope, arg);
                },
                matchIdFn = function (r) {

                    return r.selector.search(view.getId()) >= 0;

                },
                selector, delegate, e;

            while (view) {

                matchPos = __findAllByFn.call(delegates, matchIdFn);
                if (matchPos.length) {

                    __each.call(matchPos, function (r) {

                        els.length = 0;
                        delegate = delegates[r];
                        selector = delegate
                            .selector
                            .split(" ");
                        selector.shift();

                        if (selector.length) {

                            els = __slice.call(newView.queryEls(selector.join(" ")), 0);
                            if (selector.length === 1 && newView.get('el').nodeName.toLowerCase() === selector[0]) {
                                els.push(newView.get('el'));
                            }

                        } else {

                            els.push(view.get('el'));

                        }

                        if (els.length) {

                            __each.call(els, function (node) {

                                e = delegate.events;
                                for (var eType in e) {
                                    if (e.hasOwnProperty(eType)) {

                                        node.addEventListener(eType, newScope(e[eType], delegate.scope, view), false);

                                    }
                                }

                            });

                        }

                        console.log(delegates[r]
                            .selector, els);

                    });

                }


                view = view.getParent();

            }

        }
    });

    window.ya = ya;
    window.ya.experimental = window.ya.experimental || {};
    window.ya.experimental.event = window.ya.experimental.event || {};
    window.ya.experimental.event.dispatcher = Dispatcher.$create();
}(window));
