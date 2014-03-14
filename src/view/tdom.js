/**
 * @namespace ya.view
 * @class TDOM
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'view.TDOM',
    defaults: {
        /**
         * @attribute config.view
         * @type ya.View
         * @required
         */
        view: null,
        /**
         * @attribute config.DOM
         * @type Node
         * @required
         */
        DOM: null,
        bindings: null
    },
    mixins: [
        ya.mixins.Array
    ],
    init: function (opts) {
        var me = this;

        me
            .initConfig(opts)
            .initRequired()
            .initTDOM();

        return me;
    },
    initRequired: function () {
        var me = this;

        if (!me.getView()) {
            throw ya.Error.$create('ya.view.TDOM requires view object', 'T2DOM1');
        }

        if (!me.getDOM()) {
            throw ya.Error.$create('ya.view.TDOM requires DOM cloned from template', 'T2DOM2');
        }

        if (!me.getBindings()) {
            throw ya.Error.$create('ya.view.TDOM requires bindings cloned from template', 'T2DOM3');
        }

        return me;
    },
    initTDOM: function () {
        var me = this,
            view = me.getView(),
            bindings = me.getBindings(),
            dom = me.getDOM(),
            $B = ya.view.Template.$BindingType,
            namespace;

        me.each(bindings, function (binding) {

            switch (binding.type) {
                case $B.ATTR :

                    binding.pointer = dom
                        .querySelector('[ya-id="' + binding.pointer + '"]')
                        .attributes
                        .getNamedItem(binding.name);

                    me.each(binding.headers, function (header) {

                        namespace = header[0];
                        model = view.getModel(namespace);
                        if (model) {

                            binding.models[namespace] = model;
                            model.addEventListener(
                                'data' + header[1].charAt(0).toUpperCase() + header[1].slice(1) + 'Change',
                                (function (binding) {
                                    return function () {
                                        me.updateAttr(binding);
                                    };
                                }(binding)));
                            me.updateAttr(binding);
                        }

                    });

                    delete binding.name;

                    break;

                case $B.TEXT :
                    var model;

                    binding.pointer = dom.querySelector('[ya-id="' + binding.pointer + '"]');

                    me.each(binding.headers, function (header) {

                        namespace = header[0];
                        model = view.getModel(namespace);
                        if (model) {

                            binding.models[namespace] = model;
                            model.addEventListener(
                                'data' + header[1].charAt(0).toUpperCase() + header[1].slice(1) + 'Change',
                                (function (binding) {
                                    return function () {
                                        me.updateTxt(binding);
                                    };
                                }(binding)));
                            me.updateTxt(binding);
                        }

                    });


                    break;

                case $B.COL :
                    var collection, collections, definition;

                    binding.pointer = dom.querySelector('[ya-id="' + binding.pointer + '"]');
                    collection = binding.collection;

                    if (collection.id) {

                        // Try to find collection by its id
                        collection.pointer = ya.collection.$Manager.getItem(collection.id);

                    } else {

                        // If not founded try match one from view,
                        // by namespace (if exist) or by class name
                        collections = view.getCollections();
                        me.some(collections, collection.namespace ?
                            function (_collection) {

                                if (_collection.getNamespace() === collection.namespace) {
                                    collection.pointer = _collection;

                                    return true;
                                }

                            } : function (_collection) {

                            if (_collection.__class__ === collection.class) {
                                collection.pointer = _collection;

                                return true;
                            }

                        });

                    }

                    if (!collection.pointer) {

                        definition = collection.class.split(".");
                        collection.pointer = ya.$factory({
                            module: definition.shift(),
                            alias: definition.join("."),
                            id: collection.id
                        });

                        view.setCollection(collection.pointer);

                    }


                    break;
                default:

                    binding.pointer = dom.querySelector('[ya-id="' + binding.pointer + '"]');

            }

        });

        me.setDOM(dom);
        me.setBindings(bindings);

        return me;
    },
    updateTxt: function (binding) {
        var me = this,
            txt = binding.original,
            value;

        me.each(binding.headers, function (header) {

            value = binding.models[header[0]].data(header[1]);
            if(typeof value === 'undefined') {
                value = "";
            }

            txt = txt.replace('{{' + header.join('.') + '}}', value);
        });

        binding.pointer.innerHTML = txt;

    },
    updateAttr: function (binding) {
        var me = this,
            txt = binding.original,
            value;


        me.each(binding.headers, function (header) {

            value = binding.models[header[0]].data(header[1]);
            if(typeof value === 'undefined') {
                value = "";
            }

            txt = txt.replace('{{' + header.join('.') + '}}', value);

        });

        binding.pointer.value = txt;

    },
    getEDOM: function () {
        var me = this,
            dom = me.getDOM(),
            div, firstChild;

        if (
            dom.childNodes.length > 1 ||
                dom.firstChild.nodeType === 3
            ) {

            div = document.createElement('div');

            while (dom.childNodes.length) {
                div.appendChild(dom.firstChild);
            }

            div
                .setAttribute(
                    'class',
                    'ya inline'
                );

            dom
                .appendChild(div);


        }

        firstChild = dom.firstChild;

        firstChild.setAttribute(
            'id',
            me.getView().getId()
        );

        return firstChild;
    }
});
