(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Collection;

    Collection = yamvc.Core.extend({
        defaults : {
            proxy : null
        },
        /**
         * initialize collection
         * @param opts
         */
        init: function (opts) {
            Collection.Parent.init.apply(this, arguments);
            var me = this, config;
            opts = opts || {};
            config = yamvc.merge(me._config, opts.config);
            me.set('initOpts', opts);
            me.set('config', config);
            me.set('set', []);
            me.set('cache', []);
            me.initConfig();
            me.initData();
        },
        /**
         * initialize data
         */
        initData: function () {
            var me = this,
                opts = me.get('initOpts'),
                config = me.get('config'),
                data = opts.data || [];
            me.set('raw', data);
            me.prepareData(data);
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
            return me;
        },
        clearFilterFn: function () {
            this.set('set', this._cache);
            return this;
        },
        filterFn: function (fn) {
            var me = this,
                filtered = [],
                records = me._cache;

            for (var i = 0, l = records.length; i < l; i++) {
                if (fn(records[i])) {
                    filtered.push(records[i]);
                }
            }
            me.set('set', filtered);
            return me;
        },
        /**
         * get record at
         * @param index
         * @returns {*}
         */
        getAt: function (index) {
            return this._set[index];
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
                namespace = me.getModelConfig().namespace,
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
                    me.fireEvent('loaded', me, me.getProxy().getResponse(), 'read');
                } else {
                    me.fireEvent('error', me, 'read');
                }
            };
            me.getProxy().read(namespace, params, callback);
            return me;
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
                models.push(new ModelInstance({
                    data: data[i],
                    config: modelConfig
                }));
            }
            me.set('set', models);
            me.set('cache', models);
            me.set('total', total);
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
        }
    });

    window.yamvc = yamvc;
    window.yamvc.Collection = Collection;
}(window));
