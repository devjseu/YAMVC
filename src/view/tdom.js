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
            namespace, callback, event, model;

        me.each(bindings, function (binding) {

            switch (binding.type) {
                case $B.IF :
                    binding.pointer = dom
                        .querySelector('[ya-id="' + binding.pointer + '"]');

                    me.each(binding.headers, function (header) {
                        namespace = header[0];
                        model = view.getModel(namespace);
                        if (model) {
                            binding.models[namespace] = model;

                            // put callback in variable
                            callback = (function (binding) {
                                return function () {
                                    me.updateCond(binding);
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


                            me.updateCond(binding);
                        }

                    });

                    break;
                case $B.ATTR :

                    //todo: different binging action when attribute does not have value
                    if (binding.fillAttr) {

                        binding.pointer = dom
                            .querySelector('[ya-id="' + binding.pointer + '"]');

                    } else {

                        binding.pointer = dom
                            .querySelector('[ya-id="' + binding.pointer + '"]')
                            .attributes
                            .getNamedItem(binding.name);

                    }

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

                    break;

                case $B.TEXT :

                    binding.pointer = dom.querySelector('[ya-id="' + binding.pointer + '"]');

                    me.each(binding.headers, function (header) {

                        namespace = header[0];
                        model = view.getModel(namespace);
                        if (model) {

                            binding.models[namespace] = model;

                            // assign callback to the variable
                            callback = (function (binding) {
                                return function () {
                                    me.updateTxt(binding);
                                };
                            }(binding));

                            // and push it to the callbacks array
                            // which will be useful when the view
                            // will be destroyed (for remove
                            // unnecessary listeners)
                            binding.callbacks.push({
                                namespace: model.getNamespace(),
                                event: event,
                                callback: callback
                            });

                            // build event name
                            event = 'data' + header[1].charAt(0).toUpperCase() + header[1].slice(1) + 'Change';

                            // and add listener on it
                            model.addEventListener(
                                event,
                                callback
                            );

                            // update DOM
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
                        collection.pointer = ya.collection.$manager.getItem(collection.id);

                    } else {

                        // If not founded try match one from view object,
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

                        // if still collection is not founded
                        // create new one
                        definition = collection.class.split(".");
                        collection.pointer = ya.$factory({
                            module: definition.shift(),
                            alias: definition.join("."),
                            //todo : binding fix
                            namespace: collection.namespace,
                            id: collection.id
                        });

                    }

                    if (collection.pointer) {
                        // and assign it to the view
                        view.setCollection(collection.pointer);
                    }

                    // setup connection between view and collection
                    me.setupCollection(binding);

                    break;
                case $B.MODEL :

                    binding.pointer = dom.querySelector('[ya-id="' + binding.pointer + '"]');
                    model = binding.model;

                    model.pointer = view.getModel(model.namespace);

                    if (!model.pointer) {

                        definition = model.class.split('.');
                        model.pointer = ya.$factory({
                            module: definition.shift(),
                            alias: definition.join('.'),
                            namespace: model.namespace
                        });

                        view.setModel(model.pointer);

                    }

                    me.setupModel(binding);

                    break;
                default:
                    binding.pointer = dom.querySelector('[ya-id="' + binding.pointer + '"]');

                    me.setupView(binding);

            }

        });

        me.setDOM(dom);
        me.setBindings(bindings);

        return me;
    },
    setupModel: function (binding) {
        var me = this,
            element = binding.pointer,
            bindModel = binding.model,
            model = bindModel.pointer,
            property = bindModel.property,
            callback, event;

        callback = (function (binding) {
            return function () {
                me.updateModel(binding);
            };
        }(binding));

        event = property + 'Change';

        // todo: clear listeners when model removed from view
        model.addEventListener(event, callback, me);
        element.addEventListener('keyup', function (e) {

            model.data(property, element.value);

        });

        me.updateModel(binding);
    },
    updateCond: function (binding) {
        var me = this,
            txt = binding.condition,
            model, value, method, view;

        me.each(binding.headers, function (header, idx) {
            model = binding.models[header[0]];
            value = model.data(header[1]);
            if (typeof value === 'undefined') {
                value = '"undefined"';
            }

            txt = txt.replace('{{' + header.join('.') + '}}', value);

        });

        if (!!ya.exec(txt)) {
            console.log('TRUE:')
        } else {
            console.log('FALSE:')
        }

    },
    updateModel: function (binding) {
        var element = binding.pointer,
            bindModel = binding.model;

        element.value = bindModel.pointer.data(bindModel.property);

    },
    setupView: function (binding) {
        var me = this,
            viewInstance,
            definition = binding.view.class.split('.'),
            config = {
                module: definition.shift(),
                alias: definition.join('.'),
                renderTo: binding.pointer
            };

        if (binding.view.id) {
            config.id = binding.view.id;
        }

        viewInstance = ya.$factory(config);


        me
            .getView()
            .addChild(
            viewInstance,
            binding.pointer
        );

        binding.view = viewInstance;
    },
    /**
     * setup all connection between collection and view
     * and generate new elements for all records from it
     * @method setupCollection
     * @private
     * @param binding
     */
    setupCollection: function (binding) {
        var me = this,
            bindCol = binding.collection,
            collection = bindCol.pointer,
            callback, remCallback;

        callback = (function (binding) {
            return function () {
                console.log('update', binding);
                me.updateCollection(binding);
            };
        }(binding));

        remCallback = (function (binding) {
            return function (col, records) {
                console.log('remove', binding);
                me.removeFromCollection(binding, records);
            };
        }(binding));

        binding.collection.connections = [];

        // generates new view
        collection.each(function (record, idx) {

            record.set('index', idx);

            me.generateView(binding, record, idx);

        });

        me.updateCollection(binding);

        //todo: clear all of this things
        collection.addEventListener('prepare', callback, me);
        collection.addEventListener('filter', callback, me);
        collection.addEventListener('sort', callback, me);
        collection.addEventListener('push', callback, me);
        collection.addEventListener('remove', remCallback, me);

    },
    /**
     * Update DOM connected with collection
     * @method updateCollection
     * @private
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

        if (me.getView().isInDOM()) {

            collection.each(function (record, index) {

                idx = __find(
                    connections,
                    'model._clientId',
                    record
                        ._clientId
                );

                if (idx >= 0) {

                    conn = connections[idx];


                    viewIdx = __indexOf.call(childNodes, conn.view._el);
                    if (viewIdx > -1 && viewIdx !== index) {

                        if (childNodes.length - 1 > index) {

                            parent.insertBefore(childNodes[index], childNodes[viewIdx]);

                        } else {

                            parent.appendChild(childNodes[viewIdx]);

                        }

                    }

                } else {

                    me.generateView(binding, record, index).render();

                }

            });

            len = connections.length;
            while (len--) {

                conn = connections[len];
                idx = __find(collection._set, '_clientId', conn.model._clientId);
                if (idx < 0) {

                    connections
                        .splice(len, 1)
                        .pop();
                    conn
                        .view
                        .clear();

                }

            }

        }

        return me;
    },
    /**
     * Clear dependencies between view and model which
     * was removed from collection
     *
     * @method removeFromCollection
     * @private
     * @param binding
     * @param records
     * @returns {*}
     */
    removeFromCollection: function (binding, records) {
        var me = this,
            __find = ya.mixins.Array.find,
            connections, idx, conn, record;

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

            // remove it from connections array
            connections.splice(idx, 1);

            // destroy view
            conn.view.destroy();

        }

        return me;
    },
    /**
     * @method generateView
     * @private
     * @param binding
     * @param record
     * @param idx deprecated
     * @returns {*}
     */
    generateView: function (binding, record, idx) {
        var me = this,
            collection = binding.collection,
            tpl = ya.view.template.$manager.getItem(collection.tpl),
            definition = collection.view.split('.'),
            viewInstance;

        viewInstance = ya.$factory({
            module: definition.shift(),
            alias: definition.join('.'),
            renderTo: binding.pointer,
            parent: me.getView(),
            tpl: tpl || undefined,
            models: [
                record
            ]
        });

        collection.connections.push({
            view: viewInstance,
            model: record
        });

        return viewInstance;
    },
    /**
     * @method updateTxt
     * @private
     * @returns {*}
     */
    updateTxt: function (binding) {
        var me = this,
            txt = binding.original,
            model, value, method, view, filters, filter;

        me.each(binding.headers, function (header, idx) {
            var filterHeader = '';

            model = binding.models[header[0]];
            if (header[1].search(/\$/) === 0) {
                value = model.get(header[1].substring(1));
            } else {
                value = model.data(header[1]);
                if (typeof value === 'undefined') {
                    value = "";
                }
            }

            view = me.getView();
            if (binding.filters[idx].length) {
                filters = binding.filters[idx];
                view = me.getView();
                for (var i = 0, l = filters.length; i < l; i++) {
                    filter = filters[i];
                    filterHeader += '||' + filter;
                    filter = filter.split('.');
                    var scope;
                    if (filter.length > 1) {
                        scope = view._config[filter[0]];
                        method = scope[filter[1]];
                    } else {
                        scope = view;
                        method = view[filter[0]];
                    }
                    if (method) {
                        value = method.call(scope, value, model, view);
                    }
                }
            }

            txt = txt.replace('{{' + header.join('.') + filterHeader + '}}', value);
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
            txt, view, filters, filter, method,
            filterHeader = '',
            model, value = true;

        //todo: fill attribute binding
        if (binding.fillAttr) {

            me.each(binding.headers, function (header) {

                value = value && binding.models[header[0]].data(header[1]);
                if (typeof value === 'undefined') {
                    value = false;
                }

            });

            if (value) {

                binding.pointer.setAttribute(binding.name, true);

            } else {

                binding.pointer.removeAttribute(binding.name);

            }

        } else {

            txt = binding.original;

            me.each(binding.headers, function (header, idx) {

                model = binding.models[header[0]];
                if (header[1].search(/\$/) === 0) {
                    value = model.get(header[1].substring(1));
                } else {
                    value = model.data(header[1]);
                    if (typeof value === 'undefined' || value === null) {
                        value = "";
                    }
                }

                view = me.getView();
                if (binding.filters[idx].length) {
                    filters = binding.filters[idx];
                    view = me.getView();
                    for (var i = 0, l = filters.length; i < l; i++) {
                        filter = filters[i];
                        filterHeader += '||' + filter;
                        filter = filter.split('.');
                        if (filter.length > 1) {
                            var property = view._config[filter[0]];
                            method = property[filter[1]];
                        } else {
                            method = view[filter[0]];
                        }
                        if (method) {
                            value = method.call(view.getParent(), value, model, view);
                        }
                    }
                }

                txt = txt
                    .replace(
                    '{{' + header.join('.') + filterHeader + '}}',
                    value
                );

            });

            binding.pointer.value = txt;

        }

    },
    /**
     * Remove all connections between view and models
     * @method clear
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
            if (callbacks) {

                __each(binding.callbacks, function (options) {

                    model = binding.models[options.namespace];

                    model.removeEventListener(options.event, options.callback);

                });

            }

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
            node;

        if (
            dom.childNodes.length > 1
        ) {

            node = dom.firstChild;
            while (node) {
                if (node.nodeType !== 3) {
                    node.classList.add(
                        me.getView().getId()
                    );
                }
                node = node.nextSibling;
            }

        } else if (dom.firstChild.nodeType !== 3) {
            dom.firstChild.setAttribute(
                'id',
                me.getView().getId()
            );
        }

        return dom;
    }
});