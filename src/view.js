/**
 * @author Sebastian Widelak <sebakpl@gmail.com>
 *
 */
(function (undefined) {
    "use strict";

    var ya = window.ya || {},
        style = document.createElement('style'),
        __slice = Array.prototype.slice,
        VM,
        VTM,
        View,
        renderId = 0,
        fillAttrs,
        resize = 0,
        iv = 0;

    function makeMap(str) {
        // Make object map from string.
        var obj = {}, items = str.split(",");
        for (var i = 0; i < items.length; i++)
            obj[ items[i] ] = true;
        return obj;
    }

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
            views = VM.views;
            l = views.length;
            i = 0;

            while (i < l) {

                if (views[i].getFit()) {
                    views[i].fireEvent('resize', views[i]);
                }

                i++;
            }
        }
    }

    // Make object with attributes that not need any value.
    fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

    // Append some basic css to document.
    style.innerHTML = ".ya.inline {display:inline;} .ya.hidden {display: none !important;}";
    style.setAttribute('type', 'text/css');

    document.body.appendChild(style);
    window.addEventListener('resize', onWindowResize);

    /**
     * @class $Manager
     * @namespace ya.view
     * @static
     */
    VM = {
        // `ya.view.$Manager` stores all created views and allow as to
        // use `get` method (with id as argument) to return requested view.
        views: [],
        toRender: [],
        i: 0,
        /**
         * @method add
         * @for ya.view.$Manager
         * @param id
         * @param view
         */
        add: function (id, view) {
            // Add view to manager.
            var me = this;

            if (view.getAutoCreate()) {

                view.render();

            }

            me.views.push(view);
            me.i++;
        },
        /**
         * @method get
         * @for ya.view.$Manager
         * @param id
         * @returns {View}
         */
        get: function (id) {
            // Get view by its id.
            var me = this,
                len = me.views.length;

            while (len--) {

                if (me.views[len].getId() === id) break;

            }

            return me.views[len];
        }
    };

    ya.$set('ya', 'view.$Manager', VM);


    VTM = {
        // `VTM` is a private object that stores all templates used
        // in application.
        tpl: {},
        add: function (id, view) {
            var me = this;

            me.tpl[id] = view;
        },
        get: function (id) {
            var me = this;

            return me.tpl[id];
        }
    };

    /**
     * @namespace ya
     * @class View
     * @constructor
     * @extends ya.Core
     * @uses ya.mixins.Selector
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
            /**
             * @attribute config.parent
             * @type ya.View
             */
            parent: null,
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
            autoCreate: false
        },
        mixins: [
            ya.mixins.Selector
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

            me.initDefaults(opts);
            me.initConfig();
            me.initTemplate();
            me.initParent();
            VM.add(me.getId(), me);

            return me;
        },
        /**
         *
         * @method initDefaults
         * @param opts
         * @chainable
         */
        initDefaults: function (opts) {
            var me = this, config;

            opts = opts || {};
            config = ya.$merge(me._config, opts.config);
            config.id = config.id || 'view-' + VM.i;
            config.children = config.children || [];

            me.set('initOpts', opts);
            me.set('config', config);

            return me;
        },
        /**
         * @method initTemplate
         * @returns {View}
         * @chainable
         */
        initTemplate: function () {
            var me = this,
                config = me.get('config'),
                div = document.createElement('div'),
                Instance,
                _tpl;

            if (!config.tpl) {

                throw new Error(config.id + ': no tpl set');

            }

            if (config.tpl instanceof ya.view.Template) {

                div.innerHTML = config.tpl.getHtml().innerHTML;

            } else if (typeof config.tpl === 'object') {

                Instance = ya.$get(config.tpl.alias);
                config.tpl = Instance ? Instance.$create({config: config}) : ya.view.Template.$create({config: config});
                div.innerHTML = config.tpl.getHtml().innerHTML;

            } else if (typeof config.tpl == 'string' || config.tpl instanceof String) {

                if (VTM.get(config.tpl)) {

                    div.innerHTML = VTM.get(config.tpl).innerHTML;

                } else {

                    _tpl = document.getElementById(config.tpl);

                    if (!_tpl)
                        throw new Error('no tpl ' + config.tpl + ' found');

                    VTM.add(config.tpl, _tpl.parentNode.removeChild(_tpl));
                    div.innerHTML = VTM.get(config.tpl).innerHTML;

                }
            }

            me.set('tpl', div);

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
        setModel: function (namespace, model) {
            var me = this,
                models = me.getModels();

            models.push(model);
            me.setModels(models);
            me.resolveModelBindings(model);

            return me;
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
         * @version 0.1.11
         * @returns {Node}
         */
        render: function () {
            var me = this,
                tpl = me._tpl,
                config = me._config,
                id = config.renderTo,
                parent = config.parent,
                parentView = config.parent,
                bindings = [],
                headers = [],
                results,
                result,
                header,
                ret,
                value,
                parsedTpl,
                walker,
                node,
                el,
                i = 0,
                l = 0,
                j = 0,
                len = 0,
                attrs = [],
                attr;

            if (me.isInDOM()) {

                me.removeRendered();

            }

            if (parent) {// If parent is set,

                if (id && parent.querySelector(id)) { // search for element to which we will append component.
                    parent = parent.querySelector(id);
                } else {// If not found, append to parent root element.
                    parent = parent._el;
                }

            } else {// If parent not set,

                if (id) { // but we have an id of element to which we want render new one,
                    parent = document.querySelector(id);// we search for it in the whole document.
                }

            }

            parsedTpl = tpl.cloneNode(true); // Next, clone template.

            walker = document.createTreeWalker( // Create walker object and
                parsedTpl,
                NodeFilter.SHOW_ALL,
                null,
                false
            );

            node = walker.nextNode();
            while (node) { // walk through all nodes.

                if (node.nodeType === 3) { // If our element is text node
                    results = node.data.match(/\{\{(.*?)\}\}/gi);// we searching for mustached text inside it
                    if (results) { // and if we have positive match
                        var text = node.value || node.data,
                            doc = document.createElement('span'),// we create new span element
                            rId = "v-r-b-" + renderId++;

                        i = 0;
                        len = results.length;
                        headers = [];

                        doc.setAttribute('id', rId); // and add generated id.

                        // In the end we replace all match via data.
                        while (i < len) {

                            result = results[i++];
                            header = result.substr(2, (result.length - 4)).split('.');

                            if (me.getModel(header[0])) {
                                ret = me.getModel(header[0]).data(header[1]);
                                if (ret === undefined) {
                                    ret = "";
                                }
                            } else {
                                ret = "";
                            }

                            text = text.replace(result, ret);
                            headers.push(header);

                        }

                        doc.appendChild(
                            document.createTextNode(text)
                        );

                        // We also keep founded bindings.
                        bindings.push({
                            original: node.value || node.data,
                            headers: headers,
                            type: 3,
                            pointer: doc,
                            oldDOM: node
                        });

                    }
                    /*node.value = node.value.replace(bindRegEx, function (match) {
                     return replaceFn(match, 1, node);
                     });*/
                }
                else {

                    attrs = node.attributes;
                    l = attrs.length;

                    while (l--) {

                        attr = attrs.item(l);
                        results = attr.value && attr.value.match(/\{\{(.*?)\}\}/gi);

                        if (results) {
                            var original = attr.value,
                                fillAttr = fillAttrs[attr.nodeName];

                            i = 0;
                            len = results.length;
                            headers = [];

                            ret = fillAttr ? true : "";

                            while (i < len) {

                                result = results[i++];
                                header = result.substr(2, (result.length - 4)).split('.');

                                if (!fillAttr) {

                                    if (me.getModel(header[0])) {
                                        ret = me.getModel(header[0]).data(header[1]) || "";
                                    }

                                    attr.value = attr.value.replace(result, ret);

                                } else {

                                    ret = ret && me.getModel(header[0]).data(header[1]);

                                }

                                headers.push(header);

                            }

                            if (fillAttr) {

                                if (!ret) {

                                    node.removeAttribute(attr.nodeName);

                                } else {

                                    node.setAttribute(attr.nodeName, ret);

                                }

                            } else {

                                if (attr.nodeName === 'css') {

                                    value = attr.value;

                                    attr = document.createAttribute("style");

                                    attr.value = value;

                                    node.removeAttribute('css');

                                    attrs.setNamedItem(attr);

                                }

                            }

                            bindings.push({
                                original: original,
                                headers: headers,
                                fillAttr: fillAttr || false,
                                type: 2,
                                attrName: attr.nodeName,
                                pointer: node
                            });

                        } else {

                            if (attr.nodeName === 'css') {

                                value = attr.value;

                                attr = document.createAttribute("style");

                                attr.value = value;

                                node.removeAttribute('css');

                                attrs.setNamedItem(attr);

                            }

                        }

                        /*attrs.item(l).value = attrs[l].value.replace(bindRegEx, function (match) {
                         return replaceFn(match, 0, attrs[l]);
                         });*/
                    }
                }

                node = walker.nextNode();

            }

            if (parsedTpl.childNodes.length === 1 && parsedTpl.childNodes.item(0).nodeType === 1) {
                el = parsedTpl.childNodes.item(0);
            } else {
                el = parsedTpl;
                el.classList.add('inline');
            }

            el.setAttribute('id', config.id);
            el.classList.add('ya');

            me.set('el', el);
            me.set('bindings', bindings);

            me.resolveBindings();

            if (me.getHidden())
                me.hide();

            if (parent) {

                parent.appendChild(el);

                if (parentView) {

                    if (parentView.findChild(me.getId()) < 0) {

                        parentView.getChildren().push(me);

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
            me.removeBindings();
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
         * @param parent
         * @param selector
         * @returns {View}
         */
        appendTo: function (parent, selector) {
            var me = this,
                config = me.get('config'),
                id = me.getId(),
                views = parent.getChildren(),
                oldParent = config.parent,
                parentEl = selector ? parent._el.querySelector(selector) : parent._el;

            if (selector) {

                config.renderTo = selector;

            }

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