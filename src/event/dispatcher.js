/**
 * Dispatcher class allow you to delegates events across
 * newly generated views
 * @namespace ya.event
 * @class $dispatcher
 * @extends ya.Core
 * @static
 */
ya.Core.$extend({
    module: 'ya',
    singleton: true,
    alias: 'event.$dispatcher',
    defaults: {
        delegates: null
    },
    /**
     * @methods initDefaults
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        // set defaults.
        me.setDelegates([]);

        return me;
    },
    /**
     * @methods add
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
     * @methods apply
     * @methods apply
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
            isQueryMatch = ya.mixins.DOM.isQueryMatch,
            __findAllByFn = ya.mixins.Array.findAllByFn,
            __each = ya.mixins.Array.each,
        // Other variables which need to be defined.
            selector, delegate, regExp, cpSelector, e;


        while (view) {
            // If view is not null define regexp for
            // searching view id in delegated event
            // query.
            regExp = new RegExp('^\\$' + view.getId() + "[\\s]");
            // Get position for events which were matched.
            matchPos = __findAllByFn(delegates, matchIdFn);
            if (matchPos.length) {
                /*jshint -W083 */
                // If we found any events which need to be delegated,
                __each(matchPos, function (r) {
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
                        els = newView.querySelectorAll(selector.pop());
                        // Copy array with rest of them
                        cpSelector = selector.slice();
                        __each(els, function (el) {
                            // and iterate through all founded elements.
                            if (cpSelector.length) {

                                var node = el,
                                    lastSelector = cpSelector.pop();
                                while (view.getId() !== node.getAttribute('id')) {

                                    if (isQueryMatch(lastSelector, node)) {

                                        if (cpSelector.length === 0) {

                                            me.assignEvents(el, delegate, view);

                                            break;
                                        }
                                        lastSelector = cpSelector.pop();

                                    }
                                    node = node.parentNode;

                                }

                            } else {

                                me.assignEvents(el, delegate, view);

                            }

                        });

                    }

                });

            }

            view = view.getParent();


        }


    },
    assignEvents: function (el, delegate, view) {
        var e = delegate.events,
            eType;

        for (eType in e) {

            if (e.hasOwnProperty(eType)) {

                el.addEventListener(eType, e[eType].bind(delegate.scope, view), false);

            }

        }
    },
    /**
     * Clear delegates array
     * @returns {Dispatcher}
     */
    clear: function () {
        this.getDelegates().length = 0;
        return this;
    }
});
