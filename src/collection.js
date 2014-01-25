(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Collection;

    Collection = yamvc.Core.$extend({
        defaults: {
            proxy: null
        },
        /**
         * initialize collection
         * @param opts
         */
        init: function (opts) {

            Collection.Parent.init.apply(this, arguments);

            var me = this, config;

            opts = opts || {};
            config = yamvc.$merge(me._config, opts.config);

            me.set('initOpts', opts);
            me.set('config', config);
            me.set('set', []);
            me.set('cache', []);
            me.set('removed', []);
            me.set('filters', []);

            me.initConfig();
            me.initData();

            return me;
        },
        /**
         * initialize data
         */
        initData: function () {
            var me = this,
                data = me.getData() || [];

            me.set('raw', data);
            me.prepareData(data);

            return me;
        },
        add: function (records) {
            var me = this,
                record,
                ModelDefinition = me.getModel(),
                namespace = me.getModelConfig().namespace;

            if (!Array.isArray(records)) {
                records = [records];
            }

            while (records.length) {

                record = records.pop();
                record = new ModelDefinition(
                    {
                        config: {
                            namespace: namespace,
                            data: record
                        }
                    }
                );

                me._cache.push(record);
                me.fireEvent('cacheChanged');

            }

            me.filter();

            return me;
        },
        // return number of records in collection
        /**
         * @returns {Number}
         */
        count: function () {
            return this._set.length;
        },
        clear: function () {
            var me = this;

            me.set('set', []);
            me.set('cache', []);
            me.set('removed', []);

            return me;
        },
        clearFilters: function () {
            var me = this;

            me.set('filters', []);
            me.filter();

            return me;
        },
        filter: function (fn) {
            var me = this,
                filters = me._filters,
                filterFn,
                passed = true,
                filtered = [],
                records = me._cache,
                filLength = 0;

            if (typeof fn === 'function') {

                filters.push(fn);
                me.fireEvent('filtersChanged');

            }

            for (var i = 0, l = records.length; i < l; i++) {

                passed = true;
                filLength = filters.length;
                while (filLength--) {

                    filterFn = filters[filLength];
                    passed = passed && filterFn(records[i]);

                }

                if (passed) {

                    filtered.push(records[i]);

                }

            }

            me.set('set', filtered);

            return me;
        },
        /**
         * get record at
         * @param index
         * @returns {yamvc.Model}
         */
        getAt: function (index) { // Return record by index.
            return this._set[index];
        },
        /**
         *
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
         * @param fn
         * @returns {Array}
         */
        getOneBy: function (fn) { // Return first matched record.
            var me = this,
                records = me._set,
                record,
                len = records.length;

            while (len--) {

                if (fn(records[len])) {
                    record = records[len];
                    break;

                }

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
                data = me.get('data'),
                idProperty = me.get('idProperty'),
                deferred = yamvc.Promise.$deferred(),
                namespace = me.getModelConfig().namespace,
                action = new yamvc.data.Action(),
                callback,
                key, i = 0;

            for (key in params) i++;

            if (
                i === 0
                )
                throw new Error('You need to pass at least one condition to load model collection');

            if (!me.getProxy())
                throw new Error('To load collection you need to set proxy');


            callback = function () {

                if (me.getProxy().getStatus() === 'success') {

                    me.fireEvent('loaded', me, action.getResponse(), 'read');

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
        save: function () {
            var me = this,
                deferred = yamvc.Promise.$deferred(),
                action,
                toCreate = [],
                toUpdate = [],
                toRemove = me._removed,
                records = me._cache,
                modelConfig = me.getModelConfig(),
                namespace = modelConfig.namespace,
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

                if (action.getStatus() === yamvc.data.Action.Status.SUCCESS) {

                    var response = action.getResponse(),
                        data = response.result,
                        len;

                    record = data[0];
                    len = data.length;

                    // If record has __clientId__ property it's create process
                    // or if it has id it's update.
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

                        me.fireEvent('success', me);

                        deferred.resolve({scope: me});

                    }

                }

            };

            if (toCreate.length) {

                toFinish++;

                action = new yamvc.data.Action();

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

                action = new yamvc.data.Action();

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

                action = new yamvc.data.Action();

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
         * @param total
         * @returns {Collection}
         */
        prepareData: function (data, total) {
            var me = this,
                ModelInstance = me.getModel(),
                modelConfig = me.getModelConfig ? me.getModelConfig() : {},
                l = data.length,
                models = [];

            total = total || l;
            for (var i = 0; i < l; i++) {

                modelConfig.data = data[i];
                models.push(new ModelInstance({
                    data: data[i],
                    config: modelConfig
                }));

            }

            me.set('cache', models);
            me.set('total', total);

            me.filter();

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

    window.yamvc = yamvc;
    window.yamvc.Collection = Collection;
}(window));
