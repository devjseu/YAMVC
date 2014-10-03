/**
 * @namespace ya
 * @class ya.view.Template
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'view.Template',
    static: {
        id: 0,
        DOM4: (function () {
            return !document.createAttribute('rel') instanceof Node;
        }),
        BindingType: {
            IF: 7,
            MODEL: 6,
            CSS: 5,
            VIEW: 4,
            TEXT: 3,
            ATTR: 2,
            COL: 1
        },
        types: {
            td: 'tr',
            tr: 'tbody',
            thead: 'table',
            tfooter: 'table',
            tbody: 'table'
        }
    },
    mixins: [
        ya.mixins.Array
    ],
    defaults: {
        id: null,
        /**
         * @attribute config.tpl
         * @type HTMLElement
         * @required
         */
        tpl: null,
        /**
         * @attribute config.tDOM TDOM object definition
         * @type {Object}
         */
        tDOM: null
    },
    init: function (opts) {
        var me = this;

        me
            .__super(opts)
            .initRegister()
            .initBindings();

    },
    initRequired: function () {
        var me = this;

        if (!me.getTpl()) {

            throw ya.Error.$create('ya.view.Template: Missing tpl property in configuration object', 'YVT1');

        }

        if (!me._html.hasChildNodes()) {

            throw ya.Error.$create(me.__class__ + ': Its seems that object doesnt contain any template', 'YVT2');

        }

        return me;
    },
    initDefaults: function () {
        var me = this,
            html = me.getTpl(),
            docFragment = document.createDocumentFragment(),
            types = ya.view.Template.$types,
            tmp;

        me.setId(me.getId() || 'template-' + ya.view.template.$manager.getUniqueId());
        me.setTDOM(me.getTDOM() || ya.view.TDOM);

        if (Array.isArray(html)) {
            tmp = '';
            // for and concatenating is faster than Array.join
            for (var i = 0, l = html.length; i < l; i++) {

                tmp = tmp + html[i];

            }

            html = tmp;

        }

        if (typeof html === 'string' || html instanceof String) {
            var firstElMat = html.match(/\<(.*?)[\s|>]/),
                firstEl = firstElMat ? firstElMat[1] : '',
                container = types[firstEl] ? types[firstEl] : 'div',
                evaluated = document.createElement(container),
                el;

            evaluated.innerHTML = html;

            while (evaluated.hasChildNodes()) {

                if(evaluated.firstChild.nodeType === 3){
                    el = document.createElement('span');
                    el.appendChild(evaluated.firstChild);
                    docFragment.appendChild(el);
                }else{
                    docFragment.appendChild(evaluated.firstChild);
                }

            }

        } else if (html instanceof DocumentFragment) {

            docFragment = html;

        } else if (html instanceof HTMLElement) {

            docFragment.appendChild(html.firstChild);

        }

        me.set('html', docFragment);

        return me;
    },
    initRegister: function () {
        var me = this;

        ya.view.template.$manager.register(
            me.getId(),
            me
        );

        return me;
    },
    /**
     * @method initBindings
     * @private
     * @returns {*}
     */
    initBindings: function () {
        var me = this,
            texts,
            attrs;


        attrs = me.findAttrsBindings();
        texts = me.findTextBindings();

        me.set('bindings', attrs.concat(texts));

        return me;
    },
    /**
     * Finds all attribute bindings
     * @method findAttrsBindings
     * @private
     */
    findAttrsBindings: function () {
        var me = this,
            attrs = [],
            bindings = [],
            regEx = /^ya-(.*)/i,
            nodeAttrs = [],
            __slice = Array.prototype.slice,
            $DOM4 = ya.view.Template.$DOM4,
            binding,
            walker,
            match,
            attr,
            node;

        walker = document.createTreeWalker( // Create walker object and
            me._html,
            NodeFilter.SHOW_ELEMENT,
            null,
            false
        );

        while (walker.nextNode()) {
            // walk through all nodes

            node = walker.currentNode;
            // HTMLElement node
            // get all attributes
            // and push to array
            nodeAttrs = __slice.call(node.attributes);

            // check if parent contents ya attributes
            // if yes it means that current element is
            // a template and we dont want to check it
            if (me.isTemplate(node)) {
                continue;
            }
            // DOM4 polyfill - attribute no longer inherits from Node
            // so we need to set owner element manually
            if ($DOM4) {
                /*jshint -W083 */
                me.each(nodeAttrs, function (attr) {
                    attr.ownerElement = node;
                });

            }

            attrs = attrs.concat(nodeAttrs);

        }
        // execute attribute processing

        while (attrs.length) {

            attr = attrs.pop();

            match = attr.nodeName.match(regEx);

            switch (match && match[1]) {
                case 'collection' :
                    binding = me.prepareColBindings(attr);
                    break;
                case 'view' :
                    if (attr.ownerElement.hasAttribute('ya-if')) continue;
                    binding = me.prepareViewBindings(attr);
                    break;
                case 'model' :
                    binding = me.prepareModelBindings(attr);
                    break;
                case 'css' :
                    binding = me.prepareCSSBindings(attr);
                    break;
                case 'if' :
                    binding = me.prepareIfBindings(attr);
                    break;
                default :
                    binding = me.prepareAttrBindings(attr);

            }

            if (binding) {
                bindings.push(binding);
            }

        }

        return bindings;
    },
    /**
     * @method isTemplate
     * @private
     * @param node
     * @returns {boolean}
     */
    isTemplate: function (node) {

        node = node.parentNode;
        while (node.parentNode) {
            if (
                node.attributes.getNamedItem('ya-view') ||
                node.attributes.getNamedItem('ya-collection')
            ) {
                return true;

            }

            node = node.parentNode;
        }

        return false;
    },
    /**
     *
     * @method findTextBindings
     * @private
     * @returns {Array}
     */
    findTextBindings: function () {
        var me = this,
            bindings = [],
            binding,
            walker;

        walker = document.createTreeWalker( // Create walker object and
            me._html,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        while (walker.nextNode()) {
            // walk through all nodes

            binding = me.prepareTextBindings(walker.currentNode);
            if (binding) {
                bindings.push(binding);
            }

        }

        // we cant mess with DOM when we walking through it
        // so we need to replace text nodes after we found all
        // matches
        me.each(bindings, function (binding) {

            binding.old.parentNode.replaceChild(binding.doc, binding.old);

            delete binding.doc;
            delete binding.old;

        });

        return bindings;
    },
    /**
     * @method findTextBindings
     * @private
     * @param node
     * @returns {boolean}
     */
    prepareTextBindings: function (node) {
        var results = node.data.match(/\{\{(.*?)\}\}/gi),// we searching for mustached text inside it
            i, len, headers, header, binding = false, result, parts, headerFilters, filters;

        if (results) { // and if we have positive match
            var doc = document.createElement('span'),// we create new span element
            // and id for binding
                rId = ya.view.Template.$id++;

            doc.setAttribute('ya-id', rId); // and add generated id.

            i = 0;
            len = results.length;
            headers = [];
            filters = [];

            // In the end we replace all match via data.
            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4));
                parts = header.split('||');
                header = parts[0].split('.');
                if (parts.length > 1) {
                    headerFilters = parts.splice(1);
                } else {
                    headerFilters = [];
                }

                filters.push(headerFilters);
                headers.push(header);

            }

            // We also keep founded bindings.
            binding = {
                original: node.value || node.data,
                old: node,
                doc: doc,
                models: {},
                callbacks: [],
                headers: headers,
                filters: filters,
                type: 3,
                pointer: rId
            };

        }

        return binding;
    },
    prepareModelBindings: function (attr) {
        var node = attr.ownerElement,
            rId = node.getAttribute('ya-id') || ya.view.Template.$id++,
            options = attr.value.match(/(?:class|namespace)[?!:]([\w\.]+)/gi),
            property = node.getAttribute('name') || null,
            binding = {
                pointer: rId,
                type: ya.view.Template.$BindingType.MODEL,
                model: {
                    class: 'ya.Model',
                    property: property
                }
            },
            option;

        if (!property) {

            throw ya.Error.$create('Missing name property in node', 'YVT3');

        }

        node.setAttribute('ya-id', rId);

        while (options && options.length) {
            option = options.pop().split(':');
            binding.model[option[0]] = option[1];
        }

        return binding;
    },
    prepareIfBindings: function (attr) {
        var condition = attr.value,
            results = condition.match(/\{\{(.*?)\}\}/gi),// we searching for mustached text inside it
            node = attr.ownerElement,
            rId = node.getAttribute('ya-id') || ya.view.Template.$id++,
            binding = {
                pointer: rId,
                type: ya.view.Template.$BindingType.IF,
                condition: condition,
                models: {},
                callbacks: []
            },
            DOM = ya.mixins.DOM,
            headers = [], header, result, i = 0, len;

        node.setAttribute('ya-id', rId);

        if (node.hasChildNodes()) {

            binding.tpl = ya.$factory({
                module: 'ya',
                alias: 'view.Template',
                tpl: DOM.removeChildren(node)
            }).getId();

        }

        if (results) {

            len = results.length;
            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4));
                header = header.split('.');
                headers.push(header);

            }

            binding.headers = headers;
        }

        return binding;
    },
    /**
     * @method prepareColBindings
     * @private
     * @param attr
     * @returns {{pointer: (number), type: (Template.static.BindingType.COL), collection: {view: string, class: string}}}
     */
    prepareColBindings: function (attr) {
        var options = attr.value.match(/(?:class|id|namespace|model|view)[?!:]([\S]+)/gi),
            node = attr.ownerElement,
            rId = node.getAttribute('ya-id') || ya.view.Template.$id++,
            collection = {
                view: 'ya.View',
                class: 'ya.Collection'
            },
            binding = {
                pointer: rId,
                type: ya.view.Template.$BindingType.COL,
                collection: collection
            },
            DOM = ya.mixins.DOM,
            option;

        node.setAttribute('ya-id', rId);

        while (options && options.length) {

            option = options.pop().split(':');
            collection[option[0]] = option[1];

        }

        if (node.hasChildNodes()) {


            var tpl = ya.$factory({
                module: 'ya',
                alias: 'view.Template',
                tpl: DOM.removeChildren(node)
            });

            collection.tpl = tpl.getId();

        }

        //console.log(binding);

        return binding;
    },
    /**
     * @method prepareViewBindings
     * @private
     * @param attr
     * @returns {{pointer: (string|number), type: (number|.static.BindingType.VIEW|Template.static.BindingType.VIEW), view: {class: string}}}
     */
    prepareViewBindings: function (attr) {
        var node = attr.ownerElement,
            rId = node.getAttribute('ya-id') || ya.view.Template.$id++,
            options = attr.value.match(/(?:class|id)[?!:]([\w\.]+)/gi),
            binding = {
                pointer: rId,
                type: ya.view.Template.$BindingType.VIEW,
                view: {
                    class: 'ya.View'
                }
            },
            option;

        node.setAttribute('ya-id', rId);

        while (options && options.length) {
            option = options.pop().split(':');
            binding.view[option[0]] = option[1];
        }

        return binding;
    },
    /**
     *
     * @method prepareCSSBindings
     * @private
     * @param attr
     * @returns {{original: *, fillAttr: boolean, headers: Array, callbacks: Array, models: {}, name: string, type: *, pointer: string}}
     */
    prepareCSSBindings: function (attr) {
        var node = attr.ownerElement,
            results = attr.value && attr.value.match(/\{\{(.*?)\}\}/gi),
            len = results && results.length,
            headers = [], i = 0,
            original, binding, header, rId, style, parts, headerFilters, filters, result;

        rId = node.getAttribute('ya-id');
        if (!rId) {

            rId = ya.view.Template.$id++;
            node.setAttribute('ya-id', rId);

        }

        if (results) {

            filters = [];
            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4));
                parts = header.split('||');
                header = parts[0].split('.');
                if (parts.length > 1) {
                    headerFilters = parts.splice(1);
                } else {
                    headerFilters = [];
                }
                filters.push(headerFilters);
                headers.push(header);

            }

        }

        original = (node.getAttribute('style') || "") + attr.value;

        node.setAttribute('style', original);

        binding = {
            original: original,
            fillAttr: false,
            headers: headers,
            callbacks: [],
            filters: filters,
            models: {},
            name: 'style',
            type: ya.view.Template.$BindingType.ATTR,
            pointer: rId
        };

        return binding;
    },
    /**
     *
     * @method prepareAttrBindings
     * @private
     * @param attr
     * @returns {*}
     */
    prepareAttrBindings: function (attr) {
        var node = attr.ownerElement,
            results = attr.value && attr.value.match(/\{\{(.*?)\}\}/gi),
            len = results && results.length,
            original = attr.value,
            headers = [], i = 0,
            binding, rId, header, result, parts, headerFilters, filters;

        if (results) {

            rId = node.getAttribute('ya-id');
            if (!rId) {

                rId = ya.view.Template.$id++;
                node.setAttribute('ya-id', rId);

            }

            filters = [];
            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4));
                parts = header.split('||');
                header = parts[0].split('.');
                if (parts.length > 1) {
                    headerFilters = parts.splice(1);
                } else {
                    headerFilters = [];
                }
                filters.push(headerFilters);
                headers.push(header);

            }

            binding = {
                fillAttr: ya.mixins.CSSStyle.isFillAttr(attr.name),
                name: attr.name,
                original: original,
                models: {},
                callbacks: [],
                headers: headers,
                filters: filters,
                type: ya.view.Template.$BindingType.ATTR,
                pointer: rId
            };

        }

        return results ? binding : null;
    },
    /**
     * Returns instance of TDOM object with cloned DOM
     * and biding array
     * @method getTDOMInstance
     * @param view
     * @returns {Function|*}
     */
    getTDOMInstance: function (view) {
        var me = this;

        return me.getTDOM().$create({
            config: {
                view: view,
                bindings: ya.$clone(me.get('bindings')),
                DOM: me.get('html').cloneNode(true)
            }
        });
    }
});