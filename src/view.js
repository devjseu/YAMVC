/**
 *
 * ## View Manager usage
 * View Manager is singleton object and helps to get proper view instance Cored on passed id
 *
 *      @example
 *      VM
 *          .get('layout')
 *          .render();
 *
 * ## Basic view
 * Views are an excellent way to bind template with the data from proper models.
 *
 *     @example
 *     var view = new View({
 *         config: {
 *             id: 'users',
 *             tpl: 'user-lists',
 *             models : window.users
 *             renderTo: '#body'
 *         }
 *     });
 *
 * ## Configuration properties
 *
 * @cfg config.id {String} Unique id of the view. If not passed id will be assigned automatically
 * @cfg config.tpl {String} Id of the template
 * @cfg config.models {String} Simple object storing appropriate data
 * @cfg config.renderTo {String} Selector to which view should be rendered
 *
 * ## Extending views
 * Views are easily expendable, so you can fell free to add more awesome functionality to it.
 *
 *     @example
 *     window.OverlayView = View.$extend({
 *
 *     });
 *
 *
 */
(function (window, undefined) {
    "use strict";

    var yamvc = window.yamvc || {},
        style = document.createElement('style'),
        VM,
        VTM,
        View,
        renderId = 0,
        fillAttrs;

    function makeMap(str) {
        var obj = {}, items = str.split(",");
        for (var i = 0; i < items.length; i++)
            obj[ items[i] ] = true;
        return obj;
    }

    fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

    style.innerHTML = ".yamvc {display:inline;}; .yamvc-hidden {display: none;}";

    document.body.appendChild(style);

    // Object that stores all views
    /**
     * @type {{views: {}, i: number, add: Function, get: Function}}
     */
    VM = {
        views: {},
        i: 0,
        // Add view to manager
        /**
         * @param id
         * @param view
         */
        add: function (id, view) {
            this.views[id] = view;
            this.i++;
        },
        // Get view by its id
        /**
         * @param id
         * @returns {View}
         */
        get: function (id) {
            return this.views[id];
        }
    };

    //Private object, keeps all templates in one place
    /**
     * @type {{tpl: {}, add: Function, get: Function}}
     */
    VTM = {
        tpl: {},
        add: function (id, view) {
            this.tpl[id] = view;
        },
        get: function (id) {
            return this.tpl[id];
        }
    };
    // Definition of View object
    /**
     * @constructor
     * @params opts Object with configuration properties
     * @type {function}
     */
    View = yamvc.Core.$extend({
        defaults: {
            parent: null
        },
        // Initializing function in which we call parent method, merge previous
        // configuration with new one, set id of component, initialize config
        // and save reference to component in View Manager.
        /**
         *
         * @param opts
         * @returns {View}
         */
        init: function (opts) {

            yamvc.Core.prototype.init.apply(this);

            var me = this, config, id;

            opts = opts || {};
            config = yamvc.$merge(me._config, opts.config);
            config.id = id = config.id || 'view-' + VM.i;
            config.children = config.children || [];

            me.set('initOpts', opts);
            me.set('config', config);

            me.initConfig();
            VM.add(id, me);

            return me;
        },
        /**
         * @returns {View}
         */
        initConfig: function () {

            yamvc.Core.prototype.initConfig.apply(this);

            this.initTemplate();
            this.initModels();

            return this;
        },
        /**
         * @returns {View}
         */
        initTemplate: function () {
            var me = this,
                config = me.get('config'),
                div = document.createElement('div'),
                _tpl;

            if (!config.tpl) {

                throw new Error(config.id + ': no tpl set');

            }

            if (config.tpl instanceof yamvc.view.Template) {

                div.innerHTML = config.tpl.getHtml().innerHTML;

            } else if (VTM.get(config.tpl)) {

                div.innerHTML = VTM.get(config.tpl).innerHTML;

            } else {

                _tpl = document.getElementById(config.tpl);

                if (!_tpl)
                    throw new Error('no tpl ' + config.tpl + ' found');

                VTM.add(config.tpl, _tpl.parentNode.removeChild(_tpl));
                div.innerHTML = VTM.get(config.tpl).innerHTML;

            }

            me.set('tpl', div);

            return me;
        },
        /**
         * @returns {View}
         */
        initModels: function () {
            var me = this;

            return me;
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
         * @returns {yamvc.Model}
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
         * @param {Boolean} force
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

                if (id && parent.queryEl(id)) { // search for element to which we will append component.
                    parent = parent.queryEl(id);
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


            while (j < tpl.childNodes.length && tpl.childNodes.item(j).nodeType !== 1) {
                j++;
            }

            if (j > 1)
                el = parsedTpl.childNodes.item(j);
            else
                el = parsedTpl;

            el.setAttribute('id', config.id);
            el.setAttribute('class', 'yamvc');

            me.set('el', el);
            me.set('bindings', bindings);

            me.resolveBindings();

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

                        model.addEventListener(eventName,  binding.fn);

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

                        model.addEventListener( eventName, binding.fn);

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
        removeBindings : function () {
            var me = this,
                bindings = me._bindings,
                l = bindings.length,
                binding,
                model,
                header,
                l2,
                eventName;

            while(l--) {

                binding = bindings[l];
                l2 = binding.headers.length;
                while(l2--) {

                    header = binding.headers[l2];
                    model = me.getModel(header[0]);
                    eventName ='data' + header[1].charAt(0).toUpperCase() + header[1].slice(1) + 'Change';

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
        queryEl: function (selector) {
            return this.get('el').querySelector(selector);
        },
        /**
         * @param selector
         * @returns {NodeList}
         */
        queryEls: function (selector) {
            return this.get('el').querySelectorAll(selector);
        },
        /**
         * @param view
         * @param selector
         * @returns {View}
         */
        addChild: function (view, selector) {
            var me = this;
            view.appendTo(me, selector);
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
        findChild: function (id) {
            var views = this.getChildren(),
                l = views.length;

            while (l--) {
                if (views[l].getId() === id)
                    break;
            }

            return l;
        },
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
                el = me.get('el');

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
                parentEl = selector ? parent.get('el').querySelector(selector) : parent.get('el');

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

            if (!me.isInDOM() && parent.isInDOM()) {

                if (!me.get('el')) {

                    me.render();

                } else {

                    parentEl.appendChild(me.get('el'));
                    me.set('isInDOM', true);
                    me.reAppendChildren();
                    me.fireEvent('render', null, me);

                }

            }


            views.push(me);

            config.parent = parent;
            return me;
        },
        /**
         * @returns {View}
         */
        reAppendChildren: function () {
            var views = this.getChildren(),
                l = views.length;

            while (l--) {
                views[l].appendTo(this);
            }

            return this;
        },
        /**
         * @returns {View}
         */
        show: function () {
            var me = this;

            if (!me.isInDOM())
                return me;

            me.get('el').classList.remove('yamvc-hidden');

            me.set('visible', true);
            me.fireEvent('show', me);

            return me;
        },
        /**
         * @returns {View}
         */
        hide: function () {
            var me = this;

            if (!me.isInDOM())
                return me;


            me.get('el').classList.add('yamvc-hidden');

            me.set('visible', false);
            me.fireEvent('hide', me);

            return me;
        },
        /**
         * @returns {Boolean}
         */
        isVisible: function () {
            return this.get('visible') && this.isInDOM();
        }
    });


    yamvc.ViewManager = VM;
    window.yamvc = yamvc;
    window.yamvc.View = View;
}(window));