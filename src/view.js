/**
 * @author Sebastian Widelak <sebakpl@gmail.com>
 *
 */
(function (undefined) {
    "use strict";

    var ya = window.ya,
        style = document.createElement('style'),
        __slice = Array.prototype.slice,
        VM,
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
            views = ya.view.$manager.getItems();
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

            me.__super();

            me
                .initConfig(opts)
                .initDefaults()
                .initRequired()
                .initTemplate()
                .initParent();

            ya.view.$manager.register(me.getId(), me);

            return me;
        },
        initRequired: function () {
            var me = this;

            if (!me.getTpl()) {

                throw ya.Error.$create('ya.View: no tpl set for ' + config.getId());

            }

            return me;
        },
        /**
         * @method initDefaults
         * @returns {*}
         */
        initDefaults: function () {
            var me = this;

            me.setId(me.getId() || 'view-' + ya.view.$manager.getCount());
            me.setChildren(me.getChildren() || []);
            me.setModels(me.getModels() || []);

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
            me.set('tdom', tpl.getTDOMInstance(me));

            return me;
        },
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
                me.observeModel(model);

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
        observeModel: function () {

        },
        /**
         * @version 0.1.11
         * @returns {Node}
         */
        render: function () {
            var me = this,
                config = me._config,
                parent = config.parent,
                selector = config.renderTo,
                parentEl, el;

            parentEl = me.getParentEl(selector, true);

            if (me.isInDOM()) {

                me.removeRendered();

            }

            el = me._tdom.getDOM();

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
                me.fireEvent('render', null, me);
            }

            return el;
        },
        /**
         * @version 0.1.12
         * @param model
         */
        resolveModelBindings: function (model) {
            var me = this,
                bindings = me._bindings,
                bindFnFactory,
                headers,
                header,
                binding,
                eventName,
                lenM = 0,
                len = 0;

            bindFnFactory = function (binding) {
                return function () {
                    me.partialRender(binding);
                };
            };

            len = bindings.length;
            while (len--) {

                binding = bindings[len];
                headers = binding.headers;
                lenM = headers.length;
                while (lenM--) {

                    if (model.getNamespace() === headers[lenM][0]) {

                        header = headers[lenM][1];
                        eventName = 'data' + header.charAt(0).toUpperCase() + header.slice(1) + 'Change';
                        binding.fn = bindFnFactory(binding);

                        model.addEventListener(eventName, binding.fn);

                        binding.fn();

                    }

                }
            }
        },
        /**
         * @version 0.1.12
         */
        resolveBindings: function () {
            var me = this,
                bindings = me._bindings,
                bindFnFactory,
                model,
                headers,
                header,
                binding,
                eventName,
                lenM = 0,
                len = 0;

            bindFnFactory = function (binding) {
                return function () {
                    me.partialRender(binding);
                };
            };

            len = bindings.length;
            while (len--) {

                binding = bindings[len];
                headers = binding.headers;

                if (binding.type === 3 && binding.oldDOM) {
                    binding.oldDOM.parentNode.replaceChild(binding.pointer, binding.oldDOM);
                    delete binding.oldDOM;
                }

                lenM = headers.length;
                while (lenM--) {

                    model = me.getModel(headers[lenM][0]);
                    header = headers[lenM][1];

                    if (model) {

                        binding.fn = bindFnFactory(binding);
                        eventName = 'data' + header.charAt(0).toUpperCase() + header.slice(1) + 'Change';

                        model.addEventListener(eventName, binding.fn);

                    }

                }
            }
        },
        /**
         * @version 0.1.11
         * @param binding
         */
        partialRender: function (binding) {
            var me = this,
                element = binding.type === 3,
                org = element ? binding.original : (binding.fillAttr ? true : binding.original),
                headers = binding.headers,
                len = headers.length,
                header;

            while (len--) {

                header = headers[len];

                if (element || !binding.fillAttr) {

                    org = org.replace("{{" + header.join(".") + "}}", me.getModel(header[0]).data(header[1]));

                } else {

                    org = org && me.getModel(header[0]).data(header[1]);

                }
            }

            if (element) {

                binding.pointer.textContent = org;


            } else {

                if (binding.fillAttr && !org) {

                    binding.pointer.removeAttribute(binding.attrName);

                } else {

                    binding.pointer.setAttribute(binding.attrName, org);

                }

            }

            return me;
        },
        /**
         * @version 0.1.12
         */
        removeBindings: function () {
            var me = this,
                bindings = me._bindings,
                l = bindings.length,
                binding,
                model,
                header,
                l2,
                eventName;

            while (l--) {

                binding = bindings[l];
                l2 = binding.headers.length;
                while (l2--) {

                    header = binding.headers[l2];
                    model = me.getModel(header[0]);
                    eventName = 'data' + header[1].charAt(0).toUpperCase() + header[1].slice(1) + 'Change';

                    model.removeEventListener(eventName, binding.fn);

                }

            }

            return me;
        },
        /**
         * @version 0.1.12
         */
        removeRendered: function () {
            var me = this;

            me._el.parentNode.removeChild(me._el);
            me.set('el', null);
            me.set('isInDOM', false);

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
            ya.event.$dispatcher.apply(view);
            me.fireEvent('elementAdded', me, view);
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
        removeChild: function (id) {
            var views = this.getChildren(),
                l = views.length,
                view = [];

            while (l--) {
                if (views[l].getId() === id) {

                    view = views.splice(l, 1);
                    view[0].clear();

                }
            }

            return view[0] || null;
        },
        /**
         * @returns {Array}
         */
        removeChildren: function () {
            var views = this.getChildren(),
                l = views.length,
                removed = [];

            while (l--) {
                removed.push(views[l].clear());
            }


            return removed;
        },
        /**
         * @returns {View}
         */
        clear: function () {
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
                config = me.get('config'),
                id = me.getId(),
                views = parent.getChildren(),
                oldParent = config.parent,
                parentEl;

            parentEl = me.getParentEl(selector, false);

            config.renderTo = parentEl;

            if (!oldParent) {

                config.parent = parent;

            }
            else if (oldParent && oldParent.getId() !== parent.getId()) {

                if (oldParent.findChild(id) > -1) {

                    oldParent
                        .getChildren()
                        .splice(
                            oldParent.findChild(id), 1
                        );

                }

            }


            views.push(me);
            config.parent = parent;
            me.fireEvent('append', null, me, parent);


            if (!me.isInDOM() && parent.isInDOM()) {

                if (!me._el) {

                    me.render();
                    ya.event.$dispatcher.apply(me);

                } else {

                    parentEl.appendChild(me._el);
                    me.set('isInDOM', true);
                    me.reAppendChildren();
                    me.fireEvent('render', null, me);

                }

            }
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