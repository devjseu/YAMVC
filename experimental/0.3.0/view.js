ya.View.$extend({
    module: 'ya',
    alias: 'experimental.View',
    /**
     * @method init
     * @param opts
     * @returns {View}
     * @chainable
     */
    init: function (opts) {
        // Initializing function in which we call parent method, merge previous
        // configuration with new one, set id of component, initialize config
        // and save reference to component in View Manager.
        var me = this;

        me
            .__super(opts)
            .initChildren();

        return me;
    },
    /**
     * @method initParent
     * @returns {View}
     * @chainable
     */
    initParent: function () {
        var me = this,
            parent = me.getParent();

        if (parent) {

            parent.getChildren().push(me);

        }

        return me;
    },
    initChildren: function () {
        var me = this,
            children = me.getChildren();

        me.each(children, function (v) {
            v.setParent(me);
        });

        return me;
    },
    addChild: function (view, selector) {
        var me = this,
            parent = view.getParent();

        if (parent && parent.getId() != me.getId()) {
            parent.removeChild(me);
        }

        if (!me.getChild(view.getId())) {

            me.getChildren().push(view);
            view.setParent(me);

        }

        view.appendTo(me, selector);
        me.fireEvent('childAdded', me, view);

        return me;
    },
    /**
     * @private
     * @param parent
     * @param selector
     * @returns {*}
     */
    appendTo: function (parent, selector) {
        var me = this;

        me.render();

        return me;
    },
    /**
     *
     * @param selector
     * @param globally
     * @returns {*}
     */
    getParentNode: function (selector, globally) {
        var me = this,
            parent = me.getParent(),
            parentEl;

        if (me.isElement(selector)) {

            parentEl = selector;

        } else if (parent) {

            parentEl = selector ?
                parent.querySelector(selector) :
                (parent.isInDOM() ? parent.get('el') : parent.get('edom').firstChild);

        } else if (globally) {

            parentEl = document.querySelector(selector);

        }

        return parentEl;
    },
    hasChildren: function () {
        return this.getChildren().length > 0;
    },
    /**
     *
     * @returns {this}
     */
    prepareElements: function () {
        var me = this;
        me.set('elements',
            me.get('edom').childNodes.length > 1 ?
                Array.prototype.slice.call(me.get('edom').childNodes) : [me.get('edom').firstChild]
        );
        return me;
    },
    /**
     * @returns {this}
     */
    render: function () {
        var me = this,
            parent = me.getParent(),
            selector = me.getRenderTo(),
            el, parentNode;

        // get parent node
        parentNode = selector instanceof HTMLElement ? selector : me.getParentNode(selector, true);

        if (!me.get('tdom')) {
            // compile template if we run render first time
            me.compile();
        }

        if (parentNode) {
            // if there is no another root view object and parent node was found

            if (me.isInDOM()) {
                // if view was already rendered
                // remove dom from document
                me.clear();

            }

            // prepare elements
            me.prepareElements();

            // set referrer to the root node
            if (me.get('elements').length === 1) {
                me.set('el', me.get('elements')[0]);
            } else {
                me.set('el', parentNode);
            }

            if (me.hasChildren()) {
                // if view has children render them also
                me.renderChildren();
            }

            // add proper class if view shoudlnt be visible
            if (me.getHidden()) {
                me.get('el').classList.add(me.getHideCls());
                me.set('visible', false);
            }

            // add element(s) to the DOM
            parentNode.insertBefore(
                me.get('edom'),
                me.getRenderAt() === null ? null : parentNode.childNodes.item(me.getRenderAt())
            );

            me.set('isInDOM', true);

            if (parent && parent.isInDOM() || !parent) {
                ya.event.$dispatcher.apply(me);
            }

            me.onRender();
            me.fireEvent('render', me, parent);

        }
    },
    renderChildren: function () {
        var me = this;

        me.each(me.getChildren(), function (r) {
            r.appendTo(me, r.getRenderTo());
        });
    },
    /**
     *
     * @param view
     * @returns {*|null}
     */
    removeChild: function (view) {
        var views = this.getChildren(),
            l = views.length,
            removed;

        while (l--) {
            if (views[l].getId() === view.getId()) {


                removed = views.splice(l, 1)[0];

                removed
                    .removeFromDOM()
                    .setParent(null);

            }
        }

        return removed;
    },
    removeFromDOM: function () {
        var me = this,
            el = me.get('el'),
            children;

        if (me.isInDOM()) {

            children = el
                .parentNode
                .removeChild(el);

            me.set('isInDOM', false);
            me.get('edom')
                .appendChild(children);

        }

        return me;
    }
});