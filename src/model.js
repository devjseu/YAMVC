(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Model,
        config;

    Model = yamvc.Core.extend({
        /**
         * @defaults
         */
        defaults: {
            idProperty: 'id',
            proxy: null
        },
        /**
         *
         * @param opts
         */
        init: function (opts) {
            yamvc.Core.prototype.init.apply(this, arguments);
            var me = this, config;
            opts = opts || {};
            config = yamvc.merge(me._config, opts.config);
            me.set('initOpts', opts);
            me.set('config', config);
            me.initConfig();
            me.initData();
        },
        /**
         *
         * @returns {Model}
         */
        initConfig: function () {
            var me = this,
                config = me.get('config');
            yamvc.Core.prototype.initConfig.apply(this);
            if (!config.namespace)
                throw new Error("Model need to have namespace property in your model configuration");
            return this;
        },
        /**
         *
         */
        initData: function () {
            var me = this,
                opts = me.get('initOpts'),
                config = me.get('config');
            me.set('data', opts.data || {});
        },
        /**
         *
         * @param property
         * @param value
         */
        setDataProperty: function (property, value) {
            var me = this,
                data = me._data,
                oldVal = data[property];
            if (value !== oldVal) {
                data[property] = value;
                me.set('isDirty', true);
                me.fireEvent('data' + property.charAt(0).toUpperCase() + property.slice(1) + 'Change', me, value, oldVal);
            }
        },
        /**
         *
         * @param property
         * @returns {*}
         */
        getDataProperty: function (property) {
            var me = this;
            return me.get('data')[property];
        },
        // alias for set and get data property
        // if two arguments are passed data will be set
        // in other case data will be returned
        /**
         * @param property name of property in data
         * @param data Optional | if passed data will be set
         * @returns {*}
         *
         */
        data: function (property, data) {
            var len = arguments.length;
            if (len > 1) {
                return this.setDataProperty.apply(this, arguments);
            } else {
                return this.getDataProperty.apply(this, arguments);
            }
        },
        /**
         * @param newData
         */
        setData: function (newData) {
            var me = this,
                data = me.get('data'),
                key;

            for (key in newData) {
                if (newData.hasOwnProperty(key)) {
                    me.setDataProperty(key, newData[key]);
                }
            }

            me.fireEvent('dataChange', me, data);
        },
        /**
         *
         */
        clear: function () {
            var me = this,
                data = me.get('data'),
                key;

            for (key in data) {
                if (data.hasOwnProperty(key)) {
                    me.data(key, null);
                }
            }
            me.set('data', {});
            me.fireEvent('dataChange', me, data);
        },
        /**
         *
         * @param params
         */
        load: function (params) {
            var me = this,
                data = me.get('data'),
                idProperty = me.getIdProperty(),
                deferred = yamvc.Promise.deferred(),
                callback,
                response,
                key, i = 0;

            for (key in params) i++;

            if (
                i === 0 &&
                    typeof data[idProperty] === 'undefined'
                )
                throw new Error('You need to pass at least one condition to load model');

            if (i === 0) {
                params[idProperty] = data[idProperty];
            }

            callback = function () {
                if (me.getProxy().getStatus() === 'success') {
                    response = me.getProxy().getResponse();
                    me.set('isDirty', false);
                    me.set('data', response);
                    deferred.resolve({scope: me, response: response, action: 'read'});
                    me.fireEvent('loaded', me, response, 'read');
                } else {
                    deferred.reject({scope: me, action: 'read'});
                    me.fireEvent('error', me, 'read');
                }
            };
            me.getProxy().read(me.getNamespace(), params, callback);
            return deferred.promise;
        },
        /**
         *
         * @returns {boolean}
         */
        save: function () {
            var me = this,
                data = me.get('data'),
                idProperty = me.getIdProperty(),
                deferred = yamvc.Promise.deferred(),
                response,
                callback,
                type;

            if (me.get('isProcessing') || !me.get('isDirty')) {
                return false;
            }

            me.set('isProcessing', true);
            callback = function () {
                me.set('isProcessing', false);
                if (me.getProxy().getStatus() === yamvc.data.Proxy.Status.SUCCESS) {
                    response = me.getProxy().getResponse();
                    me.set('isDirty', false);
                    me.set('data', response.result);
                    deferred.resolve({scope: me, response: response, action: type});
                    me.fireEvent('saved', me, response, type);
                } else {
                    me.fireEvent('error', me, type);
                    deferred.reject({scope: me, action: type});
                }
            };

            if (typeof data[idProperty] === 'undefined') {
                type = 'create';
                me.getProxy().create(me.getNamespace(), data, callback);
            } else {
                type = 'update';
                me.getProxy().update(me.getNamespace(), data, callback);
            }
            return deferred.promise;
        },
        /**
         *
         */
        remove: function () {
            var me = this,
                data = me.get('data'),
                idProperty = me.getIdProperty(),
                deferred = yamvc.Promise.deferred(),
                callback;

            if (typeof data[idProperty] === 'undefined')
                throw new Error('Can not remove empty model');

            callback = function () {
                if (me.getProxy().getStatus() === yamvc.data.Proxy.Status.SUCCESS) {
                    me.set('isDirty', false);
                    me.set('data', {});
                    deferred.resolve({scope: me, action: 'destroy'});
                    me.fireEvent('removed', me, 'destroy');
                } else {
                    me.fireEvent('error', me, 'destroy');
                    deferred.reject({scope: me, action: 'destroy'});
                }
            };

            me.getProxy().destroy(me.getNamespace(), data, callback);
            return deferred.promise;
        }
    });

    window.yamvc = yamvc;
    window.yamvc.Model = Model;
}(window));
