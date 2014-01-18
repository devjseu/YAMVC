(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Model,
        config,
        id = 0;

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
            me.set('isDirty', true);
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

            me.set('clientId', config.namespace + '-' + id++);

            return me;
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
                action = new yamvc.data.Action(),
                opts = {},
                response;

            if (
                typeof params[idProperty] === 'undefined' && typeof data[idProperty] === 'undefined'
                )
                throw new Error('You need to pass id to load model');

            params[idProperty] = data[idProperty];

            opts.namespace = me.getNamespace();
            opts.params = params;
            opts.callback = function () {

                response = me.getProxy().getResponse();

                if (me.getProxy().getStatus() === 'success') {

                    me.set('isDirty', false);
                    me.set('data', response);

                    deferred.resolve({scope: me, response: response, action: 'read'});
                    me.fireEvent('loaded', me, response, 'read');

                } else {

                    deferred.reject({scope: me, response: response, action: 'read'});
                    me.fireEvent('error', me, response, 'read');

                }

            };

            action.setOptions(opts);

            me.getProxy().read(action);

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
                action = new yamvc.data.Action(),
                proxy = me.getProxy(),
                opts = {},
                response,
                type;

            if (me.get('isProcessing') || !me.get('isDirty')) {
                return false;
            }

            me.set('isProcessing', true);

            opts.namespace = me.getNamespace();
            opts.callback = function (proxy, action) {

                response = action.getResponse();

                me.set('isProcessing', false);
                if (action.getStatus() === yamvc.data.Action.Status.SUCCESS) {

                    me.set('isDirty', false);
                    me.set('data', response.result);

                    deferred.resolve({scope: me, action: action, type: type});
                    me.fireEvent('saved', me, action, type);

                } else {

                    deferred.reject({scope: me, action: action, type: type});
                    me.fireEvent('error', me, action, type);

                }

            };

            action
                .setOptions(opts)
                .setData(data);


            if (typeof data[idProperty] === 'undefined') {

                type = 'create';
                proxy.create(action);

            } else {

                type = 'update';
                proxy.update(action);

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
                action = new yamvc.data.Action(),
                proxy = me.getProxy(),
                opts = {},
                response;

            if (typeof data[idProperty] === 'undefined')
                throw new Error('Can not remove empty model');

            opts.namespace = me.getNamespace();
            opts.callback = function (proxy, action) {

                response = action.getResponse();

                if (action.getStatus() === yamvc.data.Action.Status.SUCCESS) {

                    me.set('isDirty', false);
                    me.set('data', {});

                    deferred.resolve({scope: me, action: action, type: 'remove'});
                    me.fireEvent('removed', me, 'remove');

                } else {

                    deferred.reject({scope: me, action: action, type: 'remove'});
                    me.fireEvent('error', me, 'remove');

                }

            };

            action
                .setOptions(opts)
                .setData(data);

            proxy.destroy(action);

            return deferred.promise;
        },
        hasId: function () {
            return !!this._data[this._config.idProperty];
        }
    });

    window.yamvc = yamvc;
    window.yamvc.Model = Model;
}(window));
