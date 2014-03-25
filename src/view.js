/**
 * @author Sebastian Widelak <sebakpl@gmail.com>
 *
 */
(function (undefined) {
    "use strict";

    var ya = window.ya,
        style = document.createElement('style'),
        __slice = Array.prototype.slice,
        View,
        resize = 0,
        iv = 0;

    function onWindowResize(e) {
        // When resize event occur wait 32 miliseconds
        // to not firing it to often.

        if (resize === 0) {
            iv = setInterval(fireResizeEvent, 32);
        }

        resize = +new Date();
    }

    function fireResizeEvent() {
        // Fire ya resize event only on components
        // which need to be fitted to their parents.
        var views,
            l,
            i,
            now = +new Date();

        if (now - resize >= 32) {

            clearInterval(iv);

            resize = 0;
            views = ya.view.$Manager.getItems();
            l = views.length;
            i = 0;

            while (i < l) {

                if (views[i].item.getFit()) {
                    views[i].item.fireEvent('resize', views[i]);
                }

                i++;
            }
        }
    }

    // Append some basic css to document.
    style.innerHTML = ".ya.inline {display:inline;} .ya.hidden {display: none !important;}";
    style.setAttribute('type', 'text/css');

    document.body.appendChild(style);
    window.addEventListener('resize', onWindowResize);

    /**
     * @namespace ya
     * @class View
     * @constructor
     * @extends ya.Core
     * @uses ya.mixins.DOM
     * @params opts Object with configuration properties
     * @type {function}
     */
    ya.Core.$extend({
        module: 'ya',
        alias: 'View',
        // `ya.View` accept few configuration properties:
        // * `parent` - pointer to parent view
        // * `fit` - if true, component will fire resize event when size
        // of window was changed
        // * `hidden` - if true, component will be hidden after render
        defaults: {
            id: null,
            /**
             * @attribute config.parent
             * @type ya.View
             */
            parent: null,
            /**
             * @attribute config.children
             * @type Array
             */
            children: null,
            /**
             * @attribute config.fit
             * @type boolean
             */
            fit: false,
            /**
             * @attribute config.hidden
             * @type boolean
             */
            hidden: false,
            /**
             * @attribute config.models
             * @type ya.Model
             */
            models: null,
            /**
             * @attribute config.collections
             * @type ya.Collection
             */
            collections: null,
            /**
             * @attribute config.autoCreate
             * @type boolean
             */
            autoCreate: false,
            /**
             * @attribute config.autoCreate
             * @type ya.view.Template|String
             * @required
             */
            tpl: null
        },
        mixins: [
            ya.mixins.Array,
            ya.mixins.DOM
        ],
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
                .initModels()
                .initTemplate()
                .initParent();

            ya.view.$Manager.register(me.getId(), me);

            return me;
        },
        initRequired: function () {
            var me = this;

            if (!me.getTpl()) {

                throw ya.Error.$create(me.__class__ + ': no tpl set for ' + me.getId(), 'YV1');

            }

            return me;
        },
        /**
         * @method initDefaults
         * @returns {*}
         */
        initDefaults: function () {
            var me = this;

            me.setId(me.getId() || 'view-' + ya.view.$Manager.getCount());
            me.setChildren(me.getChildren() || []);
            me.setModels(me.getModels() || []);
            me.setCollections(me.getCollections() || []);

            return me;
        },
        /**
         * @method initTemplate
         * @returns {View}
         * @chainable
         */
        initModels: function () {
            var me = this;

            me.each(me.getModels(), function (model, i, array) {

                if (!(model instanceof ya.Model)) {

                    if (!model.alias) {

                        model.module = 'ya';
                        model.alias = 'Model';

                    }

                    try {

                        array[i] = ya.$factory(model);

                    } catch (e) {

                        throw ya.Error.$create(me.__class__ + ': Can not create model', 'YV2');

                    }
                }
            });

            return me;
        },
        /**
         * @method initTemplate
         * @returns {View}
         * @chainable
         */
        initTemplate: function () {
            var me = this,
                tpl = me.getTpl(),
                div = document.createElement('div');

            if (!(tpl instanceof ya.view.Template)) {
                // If tpl is not a ya.view.Template object

                if (
                    tpl instanceof Array || typeof tpl === 'array' ||
                    typeof tpl == 'string' || tpl instanceof String
                    ) {
                    // if its an array with html def
                    // prepare configuration object and
                    // instantiate it via factory method.
                    tpl = ya.$factory({
                        module: 'ya',
                        alias: 'view.Template',
                        tpl: tpl
                    });

                } else if (tpl instanceof Object || typeof tpl === 'object') {
                    // Or if its a configuration object
                    // do the same.
                    if (!tpl.alias) {
                        tpl.module = 'ya';
                        tpl.alias = 'view.Template';
                    }

                    tpl = ya.$factory(tpl);
                }


            }

            me.setTpl(tpl);

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

        },
        /**
         * @returns {View}
         */
        setModel: function (model) {
            var me = this,
                models = me.getModels();

            if (!(model instanceof ya.Model)) {

                if (!model.alias) {

                    model.module = 'ya';
                    model.alias = 'Model';

                }

                model = ya.$factory(model);
            }

            if (!me.hasModel(model.getNamespace())) {

                models.push(model);
                me.setModels(models);

            }

            return me;
        },
        hasModel: function (namespace) {
            var models = this.getModels(),
                l;

            l = models.length;
            while (l--) {
                if (models[l].getNamespace() === namespace) {
                    return true;
                }
            }

            return false;
        },
        /**
         * @param namespace
         * @returns {ya.Model}
         */
        getModel: function (namespace) {
            var me = this,
                models = me.getModels(),
                model = null,
                l;

            l = models.length;
            while (l--) {
                if (models[l].getNamespace() === namespace) {
                    model = models[l];
                    break;
                }
            }

            return model;
        },
        /**
         * @returns {View}
         */
        setCollection: function (collection) {
            var me = this,
                collections = me.getCollections();

            if (!(collection instanceof ya.Collection)) {

                if (!collection.alias) {

                    collection.module = 'ya';
                    collection.alias = 'Model';

                }

                collection = ya.$factory(collection);
            }

            if (!me.hasCollection(collection.getId())) {

                collections.push(collection);
                me.setCollections(collections);

            }

            return me;
        },
        hasCollection: function (id) {
            var collections = this.getCollections(),
                l;

            l = collections.length;
            while (l--) {
                if (collections[l].getId() === id) {
                    return true;
                }
            }

            return false;
        },
        /**
         * @param id
         * @returns {ya.Collection}
         */
        getCollection: function (id) {
            var me = this,
                collections = me.getCollections(),
                collection = null,
                l;

            l = collections.length;
            while (l--) {
                if (collections[l].getNamespace() === id) {
                    collection = collections[l];
                    break;
                }
            }

            return collections;
        },
        /**
         * @version 0.2.0
         * @returns {Node}
         */
        render: function () {
            var me = this,
                config = me._config,
                parent = config.parent,
                selector = config.renderTo,
                parentEl, tdom, el;

            parentEl = selector instanceof HTMLElement ? selector : me.getParentEl(selector, true);

            if (me.isInDOM()) {

                me.clear();

            }

            tdom = me.getTpl()
                .getTDOMInstance(me);

            el = tdom.getEDOM();

            me.set('tdom', tdom);
            me.set('el', el);

            if (me.getHidden())
                me.hide();

            if (parentEl) {

                parentEl.appendChild(el);

                if (parent) {

                    if (parent.findChild(me.getId()) < 0) {

                        parent.getChildren().push(me);

                    }

                }

                me.set('isInDOM', true);
                me.reAppendChildren();
                me.fireEvent('render', me, parent);
            }

            return el;
        },
        /**
         * @version 0.1.12
         */
        clear: function () {
            var me = this;

            me.removeFromDOM();
            me._tdom.clear();
            me.set('el', null);

            return me;
        },
        /**
         * @param selector
         * @returns {Node}
         */
        querySelector: function (selector) {
            return this.get('el').querySelector(selector) ||
                (this.isQueryMatch(selector) ? this.get('el') : null);
        },
        /**
         * @param selector
         * @returns {Array}
         */
        querySelectorAll: function (selector) {
            var results = __slice.call(this.get('el').querySelectorAll(selector) || [], 0);

            if (this.isQueryMatch(selector)) {

                results.push(this.get('el'));

            }

            return results;
        },
        /**
         * @param view
         * @param selector
         * @returns {View}
         */
        addChild: function (view, selector) {
            var me = this;

            view.appendTo(me, selector);

            if (me.isInDOM()) {

                ya.event.$dispatcher.apply(view);

            }

            me.fireEvent('childAdded', me, view);

            return me;
        },
        /**
         * @param id
         * @returns {View||Boolean}
         */
        getChild: function (id) {
            var me = this;

            if (me.findChild(id) < 0)
                return false;

            return me.findChild(id);
        },
        /**
         *
         * @param id
         * @returns {*|length|length|Function|length|length}
         */
        findChild: function (id) {
            var views = this.getChildren(),
                l = views.length;

            while (l--) {
                if (views[l].getId() === id)
                    break;
            }

            return l;
        },
        /**
         *
         * @param id
         * @returns {*|null}
         */
        removeChild: function (view) {
            var views = this.getChildren(),
                l = views.length,
                removed = [];

            while (l--) {
                if (views[l].getId() === view.getId()) {

                    removed = views.splice(l, 1);
                    removed[0].removeFromDOM();

                }
            }

            return removed[0] || null;
        },
        /**
         * @returns {Array}
         */
        removeChildren: function () {
            var views = this.getChildren(),
                l = views.length,
                removed = [];

            while (l--) {
                removed.push(views[l].removeFromDOM());
            }


            return removed;
        },
        /**
         * @returns {View}
         */
        removeFromDOM: function () {
            var me = this,
                el = me._el;

            if (me.isInDOM()) {
                el.parentNode.removeChild(el);
                me.set('isInDOM', false);
            }

            return me;
        },
        /**
         * @returns {Boolean}
         */
        isInDOM: function () {
            return this._isInDOM;
        },
        /**
         *
         * @param selector
         * @param globally
         */
        getParentEl: function (selector, globally) {
            var me = this,
                parent = me._config.parent,
                parentEl;

            if (me.isElement(selector)) {

                parentEl = selector;

            } else if (parent) {

                parentEl = selector ? parent._el.querySelector(selector) : parent._el;

            } else if (globally) {

                parentEl = document.querySelector(selector);

            }

            return parentEl;
        },
        /**
         * @param parent
         * @param {String|HTMLElement} selector String or DOM Element
         * @returns {View}
         */
        appendTo: function (parent, selector) {
            var me = this,
                config = me._config,
                id = me.getId(),
                views = parent.getChildren(),
                oldParent = config.parent,
                parentEl;

            selector = selector || config.renderTo;

            parentEl = selector instanceof HTMLElement ? selector : me.getParentEl(selector, false);


            config.renderTo = parentEl;

            if (!oldParent) {

                config.parent = parent;

                views.push(me);

            }
            else if (oldParent && oldParent.getId() !== parent.getId()) {

                if (oldParent.findChild(id) > -1) {

                    oldParent
                        .getChildren()
                        .splice(
                        oldParent.findChild(id), 1
                    );

                }

                views.push(me);

            }

            config.parent = parent;


            if (!me.isInDOM() && parent.isInDOM()) {

                if (!me._el) {

                    me.render();

                } else {

                    parentEl.appendChild(me._el);
                    me.set('isInDOM', true);
                    me.reAppendChildren();
                    me.fireEvent('render', me, parent);

                }

            }

            me.fireEvent('append', me, parent);

            return me;
        },
        /**
         * @returns {View}
         */
        reAppendChildren: function () {
            var views = this.getChildren(),
                l = views.length,
                i = 0;

            for (; i < l; i++) {
                views[i].appendTo(this);
            }

            return this;
        },
        /**
         * @returns {View}
         */
        show: function () {
            var me = this;

            if (!me._el)
                return me;

            me._el.classList.remove('hidden');

            me.set('visible', true);
            me.fireEvent('show', me);

            return me;
        },
        /**
         * @returns {View}
         */
        hide: function () {
            var me = this;

            if (!me._el)
                return me;


            me._el.classList.add('hidden');

            me.set('visible', false);
            me.fireEvent('hide', me);

            return me;
        },
        toggle: function () {
            var me = this;

            if (me._visible) {

                me.hide();

            } else {

                me.show();

            }

        },
        /**
         * @returns {Boolean}
         */
        isVisible: function () {
            return this.get('visible') && this.isInDOM();
        }
    });

}());