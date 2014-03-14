/**
 * @namespace ya.view
 * @class Template
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
            CSS: 5,
            VIEW: 4,
            TEXT: 3,
            ATTR: 2,
            COL: 1
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

        me.
            __super();

        me
            .initConfig(opts)
            .initRequired()
            .initDefaults()
            .initBindings()
            .initRegister();

    },
    initRequired: function () {
        var me = this;

        if (!me.getTpl()) {

            throw ya.Error.$create('ya.view.Template: Missing tpl property', 'YVT1');

        }

        return me;
    },
    initDefaults: function () {
        var me = this,
            html = me.getTpl(),
            docFragment = document.createDocumentFragment();

        me.setId(me.getId() || 'template-' + ya.view.template.$Manager.getCount());
        me.setTDOM(me.getTDOM() || ya.view.TDOM);

        if (Array.isArray(html)) {
            html = html.join("");
        }

        if (typeof html === 'string' || html instanceof String) {
            var evaluated = document.createElement('div');

            evaluated.innerHTML = html;

            while (evaluated.hasChildNodes()) {

                docFragment.appendChild(evaluated.firstChild);

            }

        } else if (html instanceof DocumentFragment) {

            docFragment = html;

        } else {

            docFragment.appendChild(html);

        }

        me.set('html', docFragment);

        return me;
    },
    initRegister: function () {
        var me = this;

        ya.view.template
            .$Manager.register(
                me.getId(),
                me
            );

        return me;
    },
    /**
     * @method initBindings
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
     * @method findAttrsBindings
     */
    findAttrsBindings: function () {
        var me = this,
            attrs = [],
            bindings = [],
            regEx = /^ya-(.*)/i,
            nodeAttrs = [],
            __slice = Array.prototype.slice,
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

            // DOM4 polyfill - attribute no longer inherits from Node
            // so we need to set owner element manually
            if (ya.view.Template.$DOM4) {
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
                    binding = me.prepareViewBindings(attr);
                    break;
                case 'css' :
                    binding = me.prepareCSSBindings(attr);
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
    prepareTextBindings: function (node) {
        var results = node.data.match(/\{\{(.*?)\}\}/gi),// we searching for mustached text inside it
            i, len, headers, header, binding = false;

        if (results) { // and if we have positive match
            var doc = document.createElement('span'),// we create new span element
            // and id for binding
                rId = ya.view.Template.$id++;

            doc.setAttribute('ya-id', rId); // and add generated id.

            i = 0;
            len = results.length;
            headers = [];

            // In the end we replace all match via data.
            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4)).split('.');
                headers.push(header);

            }

            // We also keep founded bindings.
            binding = {
                original: node.value || node.data,
                old: node,
                doc: doc,
                models: {},
                headers: headers,
                type: 3,
                pointer: rId
            };

        }

        return binding;
    },
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

        return binding;
    },
    prepareViewBindings: function (attr) {
        var node = attr.ownerElement,
            view = node.getAttribute('ya-view') || 'ya.View',
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
    prepareCSSBindings: function (attr) {
        var node = attr.ownerElement,
            results = attr.value && attr.value.match(/\{\{(.*?)\}\}/gi),
            len = results && results.length,
            headers = [], i = 0,
            original, binding, header, rId, style;

        rId = node.getAttribute('ya-id');
        if (!rId) {

            rId = ya.view.Template.$id++;
            node.setAttribute('ya-id', rId);

        }

        if (results) {

            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4)).split('.');
                headers.push(header);

            }

        }

        original = (node.getAttribute('style') || "") + attr.value;

        node.setAttribute('style', original);

        binding = {
            original: original,
            fillAttr: false,
            headers: headers,
            models: {},
            name: 'style',
            type: ya.view.Template.$BindingType.ATTR,
            pointer: rId
        };

        return binding;
    },
    prepareAttrBindings: function (attr) {
        var node = attr.ownerElement,
            results = attr.value && attr.value.match(/\{\{(.*?)\}\}/gi),
            len = results && results.length,
            original = attr.value,
            headers = [], i = 0,
            binding, rId, header;

        if (results) {

            rId = node.getAttribute('ya-id');
            if (!rId) {

                rId = ya.view.Template.$id++;
                node.setAttribute('ya-id', rId);

            }

            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4)).split('.');
                headers.push(header);

            }

            binding = {
                fillAttr: ya.mixins.CSSStyle.isFillAttr(attr.name),
                name: attr.name,
                original: original,
                headers: headers,
                type: ya.view.Template.$BindingType.ATTR,
                pointer: rId
            };

        }

        return results ? binding : null;
    },
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
