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
    /**
     * @method init
     * @param opts
     * @private
     * @returns {*}
     */
    init: function (opts) {
        var me = this;

        me
            .__super(opts)
            .initTDOM();

        return me;
    },
    /**
     * @method initRequired
     * @private
     * @returns {*}
     */
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
    /**
     * @method initTDOM
     * @private
     * @returns {*}
     */
    initTDOM: function () {
        var me = this,
            view = me.getView(),
            bindings = me.getBindings(),
            dom = me.getDOM(),
            $B = ya.view.Template.$BindingType,
            namespace, callback, event;

        me.each(bindings, function (binding) {

            switch (binding.type) {
                case $B.ATTR :

                    binding.pointer = dom
                        .querySelector('[ya-id="' + binding.pointer + '"]')
                        .attributes
                        .getNamedItem(binding.name);

                    // iterate trough each header
                    me.each(binding.headers, function (header) {

                        namespace = header[0];
                        // search for model
                        model = view.getModel(namespace);
                        if (model) {

                            binding.models[namespace] = model;

                            // put callback in variable
                            callback = (function (binding) {
                                return function () {
                                    me.updateAttr(binding);
                                };
                            }(binding));

                            event = 'data' + header[1].charAt(0).toUpperCase() + header[1].slice(1) + 'Change';

                            // and push it to callbacks array
                            // which will be useful when the view
                            // will be destroyed (for remove
                            // unnecessary listeners)
                            binding.callbacks.push({
                                namespace: model.getNamespace(),
                                event: event,
                                callback: callback
                            });

                            // add callback to the model
                            model.addEventListener(
                                event,
                                callback
                            );


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

                            // put callback in variable
                            callback = (function (binding) {
                                return function () {
                                    me.updateTxt(binding);
                                };
                            }(binding));

                            event = 'data' + header[1].charAt(0).toUpperCase() + header[1].slice(1) + 'Change';

                            // and push it to callbacks array
                            // which will be useful when the view
                            // will be destroyed (for remove
                            // unnecessary listeners)
                            binding.callbacks.push({
                                namespace: model.getNamespace(),
                                event: event,
                                callback: callback
                            });

                            model.addEventListener(
                                event,
                                callback
                            );

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


                    me.setupCollection(binding);

                    break;
                default:

                    binding.pointer = dom.querySelector('[ya-id="' + binding.pointer + '"]');

            }

        });

        me.setDOM(dom);
        me.setBindings(bindings);

        return me;
    },
    /**
     * setup all connection between collection and view
     * and generate new elements for all records from it
     * @param binding
     */
    setupCollection: function (binding) {

        var me = this,
            bindCol = binding.collection,
            collection = bindCol.pointer,
            callback, remCallback;

        callback = (function (binding) {
            return function () {
                me.updateCollection(binding);
            };
        }(binding));

        remCallback = (function (binding) {
            return function (col, records) {
                me.removeFromCollection(binding, records);
            };
        }(binding));

        binding.collection.connections = [];

        // generates new view
        collection.each(function (record) {

            me.generateView(binding, record);

        });

        me.updateCollection(binding);

        collection.addEventListener('prepare', callback, me);
        collection.addEventListener('filter', callback, me);
        collection.addEventListener('sort', callback, me);
        collection.addEventListener('push', callback, me);
        collection.addEventListener('remove', remCallback, me);

    },
    generateView: function (binding, record) {
        var me = this,
            collection = binding.collection,
            tpl = ya.view.template.$Manager.getItem(collection.tpl),
            viewInstance;

        viewInstance = ya.$factory({
            alias: collection.view,
            renderTo: binding.pointer,
            tpl: tpl || undefined,
            models: [
                record
            ]
        });


        me
            .getView()
            .addChild(
            viewInstance,
            binding.pointer
        );

        collection.connections.push({
            view: viewInstance,
            model: record
        });

        return me;
    },
    /**
     * Update DOM connected with collection
     * @param binding
     * @returns {*}
     */
    updateCollection: function (binding) {
        var me = this,
            __indexOf = Array.prototype.indexOf,
            __find = ya.mixins.Array.find,
            collection = binding.collection.pointer,
            parent = binding.pointer,
            childNodes = parent.childNodes,
            connections = binding.collection.connections,
            len, conn, idx, viewIdx;


        collection.each(function (record, index) {

            idx = __find(connections, 'model._clientId', record._clientId);

            if (idx >= 0) {

                conn = connections[idx];
                if (me.getView().isInDOM()) {

                    viewIdx = __indexOf.call(childNodes, conn.view._el);
                    if (viewIdx > -1 && viewIdx !== index) {

                        if (childNodes.length - 1 > index) {

                            parent.insertBefore(childNodes[index], childNodes[viewIdx]);


                        } else {

                            parent.appendChild(childNodes[viewIdx]);

                        }

                    }

                }

            } else {
                me.generateView(binding, record);

            }

        });

        len = connections.length;
        while (len--) {

            conn = connections[len];
            idx = __find(collection._set, '_clientId', conn.model._clientId);
            if (idx < 0) {

                connections.splice(len, 1).pop();
                conn.view.clear();

            }

        }

        return me;
    },
    removeFromCollection: function (binding, records) {
        var me = this,
            __find = ya.mixins.Array.find,
            connections, idx, conn, record, view;

        // get array of connections between collection
        // and generated child views
        connections = binding.collection.connections;

        while (records.length) {
            // iterate trough all removed records
            // get one
            record = records.pop();
            // find same model in connections array
            idx = __find(connections, 'model._clientId', record._clientId);

            // put connection object into variable
            conn = connections[idx];

            // remove from connections array founded one
            connections.splice(idx, 1).pop();

            conn.view.clear();

            conn.view = null;

        }

        return me;
    },
    /**
     * @method updateTxt
     * @private
     * @returns {*}
     */
    updateTxt: function (binding) {
        var me = this,
            txt = binding.original,
            value;

        me.each(binding.headers, function (header) {

            value = binding.models[header[0]].data(header[1]);
            if (typeof value === 'undefined') {
                value = "";
            }

            txt = txt.replace('{{' + header.join('.') + '}}', value);
        });

        binding.pointer.innerHTML = txt;

    },
    /**
     * @method updateAttr
     * @private
     * @returns {*}
     */
    updateAttr: function (binding) {
        var me = this,
            txt = binding.original,
            value;


        me.each(binding.headers, function (header) {

            value = binding.models[header[0]].data(header[1]);
            if (typeof value === 'undefined') {
                value = "";
            }

            txt = txt.replace('{{' + header.join('.') + '}}', value);

        });

        binding.pointer.value = txt;

    },
    /**
     * @method removeBindings
     * @private
     */
    clear: function () {
        var __each = ya.mixins.Array.each,
            me = this,
            bindings = me.getBindings(),
            model,
            callbacks;

        __each(bindings, function (binding) {

            callbacks = binding.callbacks;
            if(callbacks) {

                __each(binding.callbacks, function (options) {

                    model = binding.models[options.namespace];

                    model.removeEventListener(options.event, options.callback);

                });

            }

            binding.pointer = null;
            binding.callbacks.length = 0;
            binding.models = null;

        });

        bindings.length = 0;

        return me;
    },
    /**
     * Returns
     * @method getEDOM
     * @returns {Function|Node|TestNode|firstChild|*|firstChild}
     */
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
