/**
 * @author Sebastian Widelak <sebakpl@gmail.com>
 * @module ya
 * @class ya.View
 *
 *
 */

/*
 * TODO: wywalic namespacey! zamiast tego dodac wartosc property ktora bedzie mowila by pod jakim kluczem znajduje sie model
 * TODO: lub kolekcja. Modele przetrzymywac w obiekcie zamiast tablicy. models:{klucz:model}
 */
(function (undefined) {
    "use strict";
    // todo: focus and blur implemented here
    var ya = window.ya,
        style = document.createElement('style'),
        __slice = Array.prototype.slice,
        focused = [],
        resize = 0,
        iv = 0,
        View;

    function onWindowResize(e) {
        // When resize event occur wait 32 miliseconds
        // to not firing it to often.

        if (resize === 0) {
            iv = setInterval(function () {
                fireResizeEvent(e);
            }, 32);
        }

        resize = +new Date();
    }

    // todo: focus and blur implemented here
    function onWindowClick(e) {
        var el = e.toElement || e.relatedTarget || e.target,
            _el = el,
            DOMmixin = ya.mixins.DOM,
            __isChild = DOMmixin.isChild,
            __isElement = DOMmixin.isElement,
            view, _view, toIterate;

        while (_el && __isElement(_el)) {

            if (_el.hasAttribute('ya-class')) {

                view = ya.view.$manager.getItem(_el.getAttribute('id'));
                view.focus();

                break;

            }

            _el = _el.parentNode;

        }

        if (!view) {

            toIterate = focused.length;
            while (toIterate--) {

                _view = focused[toIterate];
                _view.blur();

            }

            return void 0;
        }

        toIterate = focused.length;
        while (__isElement(el) && toIterate--) {

            _view = focused[toIterate];
            if (view.getId() !== _view.getId()) {

                if (!__isChild(_view._el, el)) {

                    _view.blur();

                }

            }

        }


    }

    function fireResizeEvent(e) {
        // Fire ya resize event only on components
        // which need to be fitted to their parents.
        var views,
            view,
            l,
            i,
            now = +new Date();

        if (now - resize >= 32) {

            clearInterval(iv);

            resize = 0;
            views = ya.view.$manager.getItems();
            l = views.length;
            i = 0;

            while (i < l) {
                view = views[i];

                if (view && view.item.getFit()) {

                    if (view.item.isInDOM()) {

                        view
                            .item.
                            fireEvent('resize', views[i], e);

                    }

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
    window.addEventListener('mouseup', onWindowClick);

    /**
     * @namespace ya
     * @class View
     * @constructor
     * @extends ya.Core
     * @uses ya.mixins.DOM
     * @params opts Object with configuration properties
     * @type {function}
     * TODO: to samo co dla modeli, mamy obiekt widoków views:{view1:{class:ya.grid.row.View, arguments:[]}}, a pozniej w html bindujemy tak ya-view="view1"
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
             * @attribute config.renderTo
             * @type boolean
             */
            renderTo: null,
            /**
             * @attribute config.renderAt
             * @type boolean
             */
            renderAt: null,
            /**
             * @attribute config.tpl
             * @type ya.view.Template|String
             * @required
             */
            tpl: null,
            /**
             * @attribute config.hideCls
             * @type String
             */
            hideCls: 'hidden'
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
                .initParent()
                .initChildren();

            ya.view.$manager.register(me.getId(), me);

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

            if (me.getId()) {

                me.setId(me.getId());

                me.set('customId', true);

            } else {

                me.setId('view-' + ya.view.$manager.getUniqueId());
                me.set('customId', false);

            }

            me
                .setChildren(
                me.getChildren() || []
            );

            me
                .setModels(
                me.getModels() || []
            );

            me
                .setCollections(
                me.getCollections() || []
            );


            me
                .set('eventHandlers', []);
            return me;
        },
        /**
         * @method initTemplate
         * @returns {View}
         * @chainable
         */
        initModels: function () {
            var me = this;

            me.each(
                me.getModels(),
                function (model, i, array) {

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

            return me;
        },
        /**
         *
         * @returns {*}
         */
        initChildren: function () {
            var me = this,
                children = me.getChildren();

            me.each(children, function (v) {
                v.setParent(me);
            });

            return me;
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

            if (
                !me
                    .hasCollection(collection.getId())
            ) {

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
         * @param namespace
         * @returns {ya.Collection}
         */
        getCollection: function (namespace) {
            var me = this,
                collections = me.getCollections(),
                collection = null,
                l;

            l = collections.length;
            while (l--) {
                if (collections[l].getNamespace() === namespace) {
                    collection = collections[l];
                    break;
                }
            }

            return collection;
        },
        compile: function () {
            var me = this, tdom, edom;

            tdom = me.getTpl()
                .getTDOMInstance(me);

            edom = tdom
                .getEDOM();

            me.set('tdom', tdom);
            me.set('edom', edom);

            if (me.getHidden()) {
                me.hide();
            }

            me
                .onCompile();

            me
                .fireEvent('compile', me, tdom);

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
         * @version 0.1.12
         */
        clear: function () {
            var me = this;

            //todo: blur when cleared
            me
                .blur();

            me
                .removeFromDOM();

            return me;
        },
        /**
         * @param selector
         * @returns {Node}
         */
        querySelector: function (selector) {
            var me = this,
                el = me.isInDOM() ? me.get('el') : me.get('edom');

            return el.querySelector(selector) ||
            (me.isQueryMatch(selector, el) ? el : null);
        },
        /**
         * @param selector
         * @returns {Array}
         */
        querySelectorAll: function (selector) {
            var me = this,
                el = me.isInDOM() ? me.get('el') : me.get('edom'),
                results = __slice.call(el.querySelectorAll(selector) || [], 0);

            if (me.isQueryMatch(selector, el)) {

                results.push(el);

            }

            return results;
        },
        /**
         * @param view
         * @param selector
         * @returns {View}
         */
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
         * @param id
         * @returns {View||Boolean}
         */
        getChild: function (id) {
            var me = this,
                views = this.getChildren();

            if (me.findChild(id) < 0)
                return null;

            return views[me.findChild(id)];
        },
        getChildByClass: function (className) {
            var me = this,
                views = me.getChildren(),
                some = ya.mixins.Array.some,
                idx;

            if (!some(views, function (child, i) {
                    if (child.__class__ === className) {
                        idx = i;
                        return true;
                    }
                })) {
                return null;
            }

            return views[idx];
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
        },
        /**
         * @returns {Boolean}
         */
        isInDOM: function () {
            return this._isInDOM === true;
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

                parentEl = selector ? parent.querySelector(selector) : parent._el;

            } else if (globally) {

                parentEl = document.querySelector(selector);

            }

            return parentEl;
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
        //todo: focus and blur
        focus: function () {
            var me = this,
                Array = ya.mixins.Array,
                __find = Array.find;

            if (me._destroyed) {
                return false;
            }

            var idx = __find(focused, '_config.id', me.getId());

            if (idx < 0 && me.isInDOM()) {

                focused
                    .push(me);

                me
                    .set('focused', true);

                me
                    .fireEvent(
                    'focus',
                    me
                );
            }

            return me;
        },
        blur: function () {
            var me = this,
                __find = ya.mixins.Array.find,
                idx = __find(focused, '_config.id', me.getId());

            if (idx >= 0) {

                focused
                    .splice(idx, 1);

                me
                    .set('focused', false);
                me
                    .fireEvent('blur');

            }

            return me;
        },
        isFocus: function () {
            return this._focused;
        },
        /**
         * @returns {Boolean}
         */
        isVisible: function () {
            return this._visible && this.isInDOM();
        },
        /**
         *
         * @returns {Boolean}
         */
        hasCustomId: function () {
            return this._customId;
        },
        /**
         * @returns {View}
         */
        show: function () {
            var me = this;


            if (!me._el)
                return me;

            me
                ._el
                .classList
                .remove(
                me.getHideCls()
            );

            me
                .set('visible', true);
            me
                .fireEvent('show', me);

            ya.Job
                .$create({
                    config: {
                        repeat: 1,
                        task: function () {

                            me.focus();

                        }
                    }
                }).doIt();

            return me;
        },
        /**
         * @returns {View}
         */
        hide: function () {
            var me = this;

            if (!me._el)
                return me;

            //todo: added blur action
            me.blur();

            me._el.classList.add(me.getHideCls());

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
        onCompile: function () {
        },
        // abstract
        onRender: function () {
        },
        //todo : destory
        destroy: function () {
            var me = this,
                $colManager = ya
                    .collection
                    .$manager;

            //todo: blur when cleared
            me
                .blur();


            // unbind from parent
            if (me.getParent()) {

                me
                    .getParent()
                    .removeChild(me);

            }

            // clear dom
            if (me.isInDOM()) {

                me
                    .clear();

            }

            // deregister from manager
            ya
                .view
                .$manager
                .deregister(
                me.getId()
            );


            // kill all collection connected with view
            // TODO: we should kill only those which were created by view
            me.each(
                me.getCollections(),
                function (c) {
                    $colManager
                        .deregister(
                        c.getId()
                    );
                }
            );

            me
                .__super();

            return me;
        }
    });

}());