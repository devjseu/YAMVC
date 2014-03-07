/**
 * @namespace ya.view
 * @class T2DOM
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'view.T2DOM',
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
    defaults: {
        /**
         * @attribute config.view
         * @type ya.View
         * @required
         */
        view: null,
        /**
         * @attribute config.tpl
         * @type ya.view.Template
         * @required
         */
        tpl: null,
        /**
         * @attribute config.bindings array with dom - model bindings
         * @type Array
         */
        bindings: null,
        /**
         * @attribute config.isDOM describes if DOM which need to be evaluated was
         * retrieved from the document or from `ya.view.Template` obejct
         * @type boolean
         */
        isDOM: false
    },
    init: function (opts) {
        var me = this;

        me.__super();

        me
            .initConfig(opts)
            .initRequired()
            .initDefaults();

        return me;
    },
    initRequired: function () {
        var me = this;

        if (!me.getTpl()) {
            throw ya.Error.$create('ya.view.T2DOM requires template object', 'T2DOM1');
        }

        if (!me.getView()) {
            throw ya.Error.$create('ya.view.T2DOM requires view object', 'T2DOM2');
        }

        return me;
    },
    initDefaults: function () {
        var me = this;

        me.setBindings([]);
        /**
         * @attribute _html
         * @type HTMLElement
         * @private
         */
        me.set(
            'html',
            me.getTpl()
                .getHtml()
        );

        return me;
    },
    /***
     * @method findBindings
     * @returns {*}
     */
    findBindings: function () {
        var me = this,
            texts,
            attrs;


        attrs = me.findAttrsBindings();
        texts = me.findTextBindings();

        me.setBindings(attrs.concat(texts));

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
            __each = ya.mixins.Array.each,
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
            // so we need to set node manually
            if (ya.view.T2DOM.$DOM4) {
                /*jshint -W083 */
                __each.call(nodeAttrs, function (attr) {
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
                    binding = me.prepareCssBindings(attr);
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

        return bindings;
    },
    prepareTextBindings: function (node) {
        var results = node.data.match(/\{\{(.*?)\}\}/gi),// we searching for mustached text inside it
            i, len, headers, header, binding = false;

        if (results) { // and if we have positive match
            var doc = document.createElement('span'),// we create new span element
                rId = "v-r-b-" + ya.view.T2DOM.$id++;

            i = 0;
            len = results.length;
            headers = [];

            doc.setAttribute('id', rId); // and add generated id.

            // In the end we replace all match via data.
            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4)).split('.');
                headers.push(header);

            }

            // We also keep founded bindings.
            binding = {
                original: node.value || node.data,
                headers: headers,
                type: 3,
                pointer: doc,
                oldDOM: node
            };

        }

        return binding;
    },
    prepareColBindings: function (attr) {
        var options = attr.value.match(/(?:alias|id|namespace|model|view)[?!:]([\S]+)/gi),
            node = attr.ownerElement,
            collection = {
                view: 'ya.View',
                alias: 'ya.Collection'
            },
            binding = {
                pointer: node,
                type: ya.view.T2DOM.$BindingType.COL,
                collection: collection
            },
            option;

        while (options && options.length) {
            option = options.pop().split(':');
            collection[option[0]] = option[1];
        }

        if (node.hasChildNodes()) {
            collection.tpl = ya.mixins.DOM.removeChildren(node);
        }

        return binding;
    },
    prepareViewBindings: function (attr) {
        var view = attr.ownerElement.getAttribute('ya-view') || 'ya.View',
            options = attr.value.match(/(?:alias|id)[?!:]([\w\.]+)/gi),
            binding = {
                pointer: attr.ownerElement,
                type: ya.view.T2DOM.$BindingType.VIEW,
                view: {
                    alias: 'ya.View'
                }
            },
            option;

        while (options && options.length) {
            option = options.pop().split(':');
            binding.view[option[0]] = option[1];
        }

        return binding;
    },
    prepareCSSBindings: function (attr) {
        var results = attr.value && attr.value.match(/\{\{(.*?)\}\}/gi),
            len = results && results.length,
            original = attr.value,
            headers = [], i = 0,
            header, binding = {};

        if (results) {

            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4)).split('.');
                headers.push(header);

            }

            binding = {
                original: original,
                headers: headers,
                type: ya.view.T2DOM.$BindingType.CSS,
                pointer: attr.ownerElement
            };

        }

        return binding;
    },
    prepareAttrBindings: function (attr) {
        var results = attr.value && attr.value.match(/\{\{(.*?)\}\}/gi),
            len = results && results.length,
            original = attr.value,
            headers = [], i = 0,
            binding;

        if (results) {

            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4)).split('.');
                headers.push(header);

            }

            binding = {
                fillAttr: ya.mixins.CSSStyle.isFillAttr(attr.name),
                original: original,
                headers: headers,
                type: ya.view.T2DOM.$BindingType.ATTR,
                pointer: attr.ownerElement
            };

        }

        return results ? binding : null;
    }
});
