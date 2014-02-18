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
            // Get all delegated events.
                delegates = me.getDelegates(),
            // Define array in which matched events from delegation array
            // will be stored.
                matchPos = [],
            // Cache new view in other variable.
                newView = view,
            // Define array for elements which match to last part
            // of query from delegated event object
                els = [],
            // Function which will be used to match if there are any
            // delegated events for particular view.
                matchIdFn = function (r) {
                    return r.selector.search(regExp) >= 0;

                },
            // Other variables which need to be defined.
                selector, delegate, regExp, cpSelector, e;


            while (view) {
                // If view is not null define regexp for
                // searching view id in delegated event
                // query.
                regExp = new RegExp('^\\$' + view.getId() + "[\\s]");
                // Get position for events which were matched.
                matchPos = __findAllByFn.call(delegates, matchIdFn);
                if (matchPos.length) {
                    // If we found any events which need to be delegated,
                    __each.call(matchPos, function (r) {
                        // iterate through all of them.
                        // As first step clear the array of elements
                        els.length = 0;
                        delegate = delegates[r];
                        //
                        selector = delegate
                            .selector
                            .split(" ");
                        // Remove item id from selectors array.
                        selector.shift();

                        if (selector.length) {
                            // If still anything left get last part
                            // from query and find in new view elements
                            // which match to the selector.
                            els = newView.queryEls(selector.pop());
                            // Copy array with rest of them
                            cpSelector = selector.slice();
                            __each.call(els, function (el) {
                                // and iterate through all founded elements.
                                if (cpSelector.length) {

                                    var node = el,
                                        lastSelector = cpSelector.pop();
                                    while (view.getId() !== node.getAttribute('id')) {

                                        if (node.tagName.toLowerCase() === lastSelector) {

                                            if (cpSelector.length === 0) {

                                                e = delegate.events;
                                                for (var eType in e) {
                                                    if (e.hasOwnProperty(eType)) {

                                                        el.addEventListener(eType, e[eType].bind(delegate.scope, view), false);

                                                    }
                                                }

                                                break;
                                            }
                                            lastSelector = cpSelector.pop();

                                        }
                                        node = node.parentNode;

                                    }

                                } else {

                                    e = delegate.events;
                                    for (var eType in e) {
                                        if (e.hasOwnProperty(eType)) {

                                            el.addEventListener(eType, e[eType].bind(delegate.scope, view), false);

                                        }
                                    }
                                }

                            });

                        }

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

function getNearestWeight(value) {
    var values = [2, 4, 6, 8, 9, 10, 12.5, 20],
        nearest = values[0],
        len, h;

    for (var i = 0; i < values.length; i++) {

        len = i + 1 >= values.length ? values.length - 1 : i + 1;
        if (value >= values[i] && value <= values[len]) {

            h = (values[i] + values[len]) / 2;
            if (value > h) {

                nearest = values[len];

            } else {

                nearest = values[i];

            }

        } else if (value > values[len]) {

            nearest = values[len];

        }
    }

    return nearest;
}

getNearestWeight(9.542);