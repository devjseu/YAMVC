/**
 * @namespace ya
 * @class Model
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Model',
    static: {
        id: 0,
        /**
         * @for Model
         * @method $idGenerator
         * @static
         * @returns {number}
         */
        idGenerator: function () {
            return ya.Model.$id++;
        }
    },
    defaults: {
        /**
         * @attribute config.idProperty
         * @type String key under which id is stored
         * @default id
         * @required
         */
        idProperty: 'id',
        /**
         * @attribute config.proxy
         * @type ya.data.Proxy
         */
        proxy: null,
        /**
         * @attribute config.namespace
         * @type String tell us what type of data is stored in model, can be the same us ex. table name in database
         * @default id
         * @required
         */
        namespace: null,
        /**
         * @attribute config.data
         * @type Array stores raw data
         * @default {}
         * @required
         */
        data: null
    },
    /**
     * @method init
     * @param opts
     */
    init: function (opts) {
        var me = this;

        me.__super();

        me
            .initConfig(opts)
            .initRequired()
            .initDefaults();

    },
    /**
     * @method initRequired
     * @returns {*}
     */
    initRequired: function () {
        var me = this;

        if (!me.getNamespace()){

            throw ya.Error.$create("Model need to have namespace");

        }

        return me;
    },
    /**
     * @method initDefaults
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        me.set('isDirty', true);
        me.set('clientId', me.getNamespace() + '-' + ya.Model.$idGenerator());
        me.set('data', me.getData() || {});

        return me;
    },
    /**
     * @method setDataProperty
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
     * @method getDataProperty
     * @param property
     * @returns {*}
     */
    getDataProperty: function (property) {
        return this.get('data')[property];
    },
    /**
     * @method data
     * @param property name of property in data
     * @param data Optional | if passed data will be set
     * @returns {*}
     *
     */
    data: function (property, data) {
        // `data` function is an alias for `setDataProperty` and `getDataProperty` methods.
        // If two arguments are passed data will be set and
        // in other case data will be returned.
        var me = this,
            len = arguments.length,
            key;

        if (len > 1) {

            this.setDataProperty.apply(this, arguments);

        } else {

            if (typeof property === 'object') {

                for (key in property) {

                    if (property.hasOwnProperty(key)) {

                        me.setDataProperty(key, property[key]);

                    }

                }

            } else {
                return this.getDataProperty.apply(this, arguments);
            }

        }

        return me;
    },
    /**
     * @method clear
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
     * @method load
     * @param params
     */
    load: function (params) {
        var me = this,
            data = me.get('data'),
            idProperty = me.getIdProperty(),
            deferred = ya.$promise.deferred(),
            action = new ya.data.Action(),
            opts = {},
            response;

        if (
            typeof params[idProperty] === 'undefined' && typeof data[idProperty] === 'undefined'
            )
            throw ya.Error.$create('You need to pass id to load model');

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
     * @method save
     * @returns {boolean}
     */
    save: function () {
        var me = this,
            data = me.get('data'),
            idProperty = me.getIdProperty(),
            deferred = ya.$promise.deferred(),
            action = new ya.data.Action(),
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
            if (action.getStatus() === ya.data.Action.$status.SUCCESS) {

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
     * @method remove
     */
    remove: function () {
        var me = this,
            data = me.get('data'),
            idProperty = me.getIdProperty(),
            deferred = ya.$promise.deferred(),
            action = new ya.data.Action(),
            proxy = me.getProxy(),
            opts = {},
            response;

        if (typeof data[idProperty] === 'undefined')
            throw ya.Error.$create('Can not remove empty model');

        opts.namespace = me.getNamespace();
        opts.callback = function (proxy, action) {

            response = action.getResponse();

            if (action.getStatus() === ya.data.Action.$status.SUCCESS) {

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
        proxy.destroy(action);

        return deferred.promise;
    },
    /**
     * @method hasId
     * @returns {boolean}
     */
    hasId: function () {
        return !!this._data[this._config.idProperty];
    },
    /**
     * @method setDirty
     * @param dirty
     * @returns {*}
     */
    setDirty: function (dirty) {
        this.set('isDirty', !!dirty);
        return this;
    },
    /**
     * @method isDirty
     * @returns {*}
     */
    isDirty: function () {
        return this._isDirty;
    }
});
