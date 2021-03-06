/**
 * @namespace ya
 * @class Collection
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Collection',
    defaults: {
        id: null,
        /**
         * @attribute config.namespace
         * @type String Namespace of collection
         * @required
         */
        namespace: null,
        /**
         * @attribute config.model
         * @type ya.Model Model instance
         * @required
         */
        model: null,
        /**
         * @attribute config.namespace
         * @type ya.data.Proxy Instance of proxy for transferring data
         * @required
         */
        proxy: null
    },
    /**
     * initialize collection
     * @method init
     * @param opts
     */
    init: function (opts) {
        var me = this;

        me
            .__super(opts)
            .initData();

        ya.collection.$Manager.register(me.getId(), me);

        return me;
    },
    /**
     * @method init
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        me.setId(me.getId() || 'collection-' + ya.collection.$Manager.getCount());
        me.setModel(me.getModel() || ya.$get('ya.Model'));

        me.set('set', []);
        me.set('cache', []);
        me.set('removed', []);
        me.set('filters', []);
        me.set('sorters', []);
        me.set('raw', me.getData() || []);

        return me;
    },
    /**
     * @method initData
     * initialize data
     */
    initData: function () {
        var me = this;

        me.prepareData(me._raw);

        return me;
    },
    /**
     * @method each
     * @param fn
     * @chainable
     */
    each: function (fn) {
        var me = this,
            records = me._set,
            t, len;

        t = Object(records);
        len = t.length >>> 0;
        if (typeof fn !== "function")
            throw ya.Error.$create('forEach argument should be a function', 'COL1');

        for (var i = 0; i < len; i++) {
            if (i in t)
                fn.call(me, t[i], i, t);
        }

        return me;
    },
    /**
     * @method push
     * @param records
     * @returns {*}
     * @chainable
     */
    push: function (records) {
        var me = this,
            record,
            ModelDefinition = me.getModel(),
            namespace = me.getNamespace(),
            newRecords = [];

        if (!Array.isArray(records)) {
            records = [records];
        }

        while (records.length) {

            record = records.shift();

            if (!(record instanceof ModelDefinition)) {
                record = new ModelDefinition(
                    {
                        config: {
                            namespace: namespace,
                            data: record
                        }
                    }
                );
            }

            if (record.getNamespace() !== me.getNamespace()) {

                throw ya.Error.$create('Model should have same namespace as collection', 'COL2');

            }

            me._cache.push(record);
            newRecords.push(record);

        }

        me.suspendEvents();
        me.filter();
        me.sort();
        me.resumeEvents();
        me.fireEvent('push', me, newRecords);

        return me;
    },
    /**
     *
     * @param records
     * @returns {*}
     */
    remove: function (records) {
        var me = this,
            __some = ya.mixins.Array.some,
            removed = [],
            someFn, rec, idx;

        someFn = function (r, i) {

            if (r._clientId === rec._clientId) {
                idx = i;
                return true;
            }

        };

        if (!Array.isArray(records)) {
            records = [records];
        }

        while (records.length) {

            rec = records.pop();
            idx = -1;
            __some(me._cache, someFn);

            if (idx >= 0) {

                removed.push(me._cache.splice(idx, 1).pop());

            }

        }

        me.suspendEvents();
        me.filter();
        me.resumeEvents();

        me.fireEvent('remove', me, removed);

        return me;
    },
    /**
     *
     * @returns {Array}
     */
    removeAll: function () {
        var me = this,
            removed = me._cache.slice();

        me.set('set', []);
        me.set('cache', []);
        me.fireEvent('remove', me, removed);

        return me;
    },
    /**
     * return number of records in collection
     *
     * @method count
     * @chainable
     * @returns {Number}
     */
    count: function () {
        return this._set.length;
    },
    /**
     * @method clearFilters
     * @chainable
     * @returns {*}
     */
    clear: function () {
        var me = this;

        me.set('set', []);
        me.set('cache', []);
        me.set('removed', []);

        me.fireEvent('clear', me);

        return me;
    },
    /**
     *
     * @method filter
     * @param fn
     * @returns {*}
     * @chainable
     */
    filter: function (fn) {
        var me = this,
            filters = me._filters,
            filterFn,
            passed = true,
            filtered = [],
            records = me._cache,
            len = 0,
            id = null;

        if (arguments.length > 1) {
            id = arguments[0];
            fn = arguments[1];
        }


        if (typeof fn === 'function') {

            if (id) {

                filters.push({
                    id: id,
                    fn: fn
                });

            } else {

                filters.push(fn);

            }

            me.fireEvent('beforeFilter', me, filters);

        }

        for (var i = 0, l = records.length; i < l; i++) {

            passed = true;
            len = filters.length;
            while (len--) {

                filterFn = typeof filters[len] === 'function' ? filters[len] : filters[len].fn;
                passed = passed && filterFn(records[i]);

            }

            if (passed) {

                filtered.push(records[i]);

            }

        }

        me.set('set', filtered);
        me.set('total', filtered.length);
        me.fireEvent('filter', me, filters);

        return me;
    },
    /**
     * @method clearFilters
     * @returns {*}
     * @chainable
     */
    clearFilters: function () {
        var me = this;

        //TODO: clear by multiple filters id
        me.set('filters', []);
        me.filter();

        return me;
    },
    /**
     *
     * @method clearFilter
     * @param id
     * @returns {*}
     * @chainable
     */
    clearFilter: function (id) {
        var me = this,
            filters = me._filters,
            len,
            filter;

        len = filters.length;
        while (len--) {

            filter = filters[len];
            if (typeof filter !== 'function' && filter.id === id) {

                filters.splice(len, 1);

                break;

            }

        }

        me.filter();

        return me;
    },
    /**
     *
     * @param sorters
     */
    sort: function (sorters) {
        var me = this,
            records = me._set,
            sorterFn, len, sorter, property, order;

        sorters = sorters ? me._sorters.concat(sorters) : me._sorters;
        me._sorters = me._sorters.concat(sorters);

        sorterFn = function (a, b) {
            var va = "" + a.data(property),
                vb = "" + b.data(property),
                alc = va.toLowerCase(),
                blc = vb.toLowerCase();

            return (alc > blc ? 1 : alc < blc ? -1 : va > vb ? 1 : va < vb ? -1 : 0) * (order.toLowerCase() === 'desc' ? -1 : 1);
        };

        len = sorters.length;
        while (len--) {
            sorter = sorters[len];
            property = sorter[0];
            order = sorter[1] || 'ASC';
            records.sort(sorterFn);
        }

        me.fireEvent('sort', me, sorters);
    },
    /**
     *
     * @returns {*}
     */
    clearSorters: function () {
        var me = this;

        //TODO: clear by multiple filters id
        me.set('sorters', []);
        me.sort();

        return me;
    },
    /**
     * get record at
     * @method getAt
     * @param index
     * @returns {ya.Model}
     */
    getAt: function (index) { // Return record by index.
        return this._set[index];
    },
    /**
     * @method getBy
     * @param fn
     * @returns {Array}
     */
    getBy: function (fn) { // Return all matched record.
        var me = this,
            records = me._set,
            filtered = [];

        for (var i = 0, l = records.length; i < l; i++) {

            if (fn(records[i])) {

                filtered.push(records[i]);

            }

        }
        return filtered;
    },
    /**
     * Return index of first matched record.
     * @param fn
     * @returns {Number}
     */
    findOneBy: function (fn) { //
        var me = this,
            records = me._set,
            i = 0, len = records.length;

        while (i < len) {

            if (fn(records[i])) break;

            i++;
        }

        return len;
    },
    /**
     * @param fn
     * @returns {Array}
     */
    getOneBy: function (fn) { // Return first matched record.
        var me = this,
            records = me._set,
            record,
            i = 0, len = records.length;

        while (i<len) {

            if (fn(records[i])) {
                record = records[i];
                break;

            }

            i++;
        }

        return record;
    },
    /**
     * return real number of records
     * @returns {Number}
     */
    getTotal: function () {
        return this._total;
    },
    /**
     * load data
     * proxy need to be set
     * @param params
     */
    load: function (params) {
        var me = this,
            deferred = ya.$Promise.deferred(),
            namespace = me.getNamespace(),
            action = ya.data.Action.$create(),
            callback,
            key, i = 0;

        for (key in params) i++;

        if (
            i === 0
            )
            throw ya.Error.$create('You need to pass at least one condition to load model collection', 'COL3');

        if (!me.getProxy())
            throw ya.Error.$create('To load collection you need to set proxy', 'COL4');


        callback = function () {

            if (me.getProxy().getStatus() === 'success') {

                me.fireEvent('load', me, action.getResponse(), 'read');
                me.setData(action.getData());

            } else {

                me.fireEvent('error', me, 'read');

            }
        };

        action
            .setOptions({
                callback: callback,
                params: params,
                namespace: namespace
            });

        me.getProxy().read(action);

        return deferred.promise;
    },
    /**
     *
     * @returns {promise|*|promise|Function|Promise|promise}
     */
    save: function () {
        var me = this,
            deferred = ya.$Promise.deferred(),
            action,
            toCreate = [],
            toUpdate = [],
            toRemove = me._removed,
            records = me._cache,
            namespace = me.getNamespace(),
            proxy = me.getProxy(),
            toFinish = 0,
            exceptions = [],
            callback,
            record,
            byIdFn;

        for (var i = 0, l = records.length; i < l; i++) {

            record = records[i];
            if (record._isDirty) {

                if (record.hasId()) {

                    toUpdate.push(record._data);

                } else {

                    record._data.__clientId__ = record.get('clientId');
                    toCreate.push(record._data);

                }
            }

        }

        byIdFn = function (record) {
            return function (_record) {
                return record.__clientId__ ?
                    _record.data('__clientId__') === record.__clientId__ :
                    _record.data('id') === record.id;
            };
        };

        callback = function (proxy, action) {

            toFinish--;

            if (action.getStatus() === ya.data.Action.$status.SUCCESS) {

                var response = action.getResponse(),
                    data = response.result,
                    len;

                record = data[0];
                len = data.length;

                // If record has __clientId__ property it's create process
                // or if it has id it's an update.
                if (record && (record.__clientId__ || record.id)) {

                    while (len--) {

                        record = me.getOneBy(byIdFn(data[len]));
                        record.setDirty(false);

                        delete record._data.__clientId__;

                    }

                } else { // Else it's remove process.

                    me.set('removed', []);

                }

            } else {

                exceptions.push(action.getResponse().error);

            }

            if (toFinish === 0) {

                if (exceptions.length) {

                    me.fireEvent('error', me, exceptions);

                    deferred.reject({
                        errors: exceptions
                    });

                } else {

                    me.fireEvent('save', me);

                    deferred.resolve({scope: me});

                }

            }

        };

        if (toCreate.length) {

            toFinish++;

            action = ya.data.Action.$create();

            action
                .setOptions({
                    namespace: namespace,
                    callback: callback
                })
                .setData(toCreate);

            proxy.create(action);

        }

        if (toUpdate.length) {

            toFinish++;

            action = ya.data.Action.$create();

            action
                .setOptions({
                    namespace: namespace,
                    callback: callback
                })
                .setData(toUpdate);

            proxy.update(action);
        }

        if (toRemove.length) {

            toFinish++;

            action = ya.data.Action.$create();

            action
                .setOptions({
                    namespace: namespace,
                    callback: callback
                })
                .setData(toRemove);

            proxy.destroy(action);
        }

        return deferred.promise;
    },
    /**
     * Prepare data
     * @private
     * @param data
     * @returns {Collection}
     */
    prepareData: function (data) {
        var me = this,
            ModelInstance = me.getModel(),
            modelConfig = { namespace: me.getNamespace()},
            l = data.length,
            models = [];

        for (var i = 0; i < l; i++) {

            modelConfig.data = data[i];
            models.push(new ModelInstance({
                config: modelConfig
            }));

        }

        me.set('cache', models);

        me.suspendEvents(true);
        me.filter();
        me.sort()
        ;
        me.resumeEvents();
        me.fireEvent('prepare');

        return me;
    },
    setData: function () {
        var me = this;

        me.setRawData(data);
        me.prepareData(data);

        return me;
    },
    getData: function () {
        return this._set;
    },
    getRawData: function () {
        return this._raw;
    },
    setRawData: function (data) {

        this.set('raw', data);

        return this;
    },
    isDirty: function () {
        var records = this._cache,
            len = records.length,
            isDirty = false;

        while (len--) {
            if (records[len]._isDirty) {
                isDirty = true;
            }
        }

        if (this._remove) {
            isDirty = true;
        }

        return isDirty;
    }
});
