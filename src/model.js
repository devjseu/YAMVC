(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Model;

    Model = yamvc.Core.extend(function () {
        yamvc.Core.apply(this, arguments);
    });

    Model.prototype.init = function (opts) {
        yamvc.Core.prototype.init.apply(this, arguments);
        var me = this, config;
        opts = opts || {};
        config = opts.config || {};
        me.set('initOpts', opts);
        me.set('config', config);
        me.initConfig();
        me.initData();
    };

    Model.prototype.initConfig = function () {
        var me = this,
            config = me.get('config');
        yamvc.Core.prototype.initConfig.apply(this);
        if (!config.namespace)
            throw new Error("Model need to have namespace property in your model configuration");
        return this;
    };

    Model.prototype.initData = function () {
        var me = this,
            opts = me.get('initOpts'),
            config = me.get('config');
        me.set('data', opts.data || {});
        me.set('idProperty', config.idProperty || 'id');
    };

    Model.prototype.$set = function (property, value) {
        var me = this,
            data = me.get('data'),
            oldVal = data[property];

        if (value !== oldVal) {
            data[property] = value;
            me.set('isDirty', true);
            me.fireEvent('data' + property.charAt(0).toUpperCase() + property.slice(1) + 'Change', me, value, oldVal);
        }
    };

    Model.prototype.$get = function (property) {
        var me = this;
        return me.get('data')[property];
    };

    Model.prototype.setData = function (newData) {
        var me = this,
            data = me.get('data'),
            key;

        for (key in newData) {
            if (newData.hasOwnProperty(key)) {
                me.$set(key, newData[key]);
            }
        }

        me.fireEvent('dataChange', me, data);
    };

    Model.prototype.clear = function () {
        var me = this,
            data = me.get('data'),
            key;

        for (key in data) {
            if (data.hasOwnProperty(key)) {
                me.$set(key, null);
            }
        }
        me.set('data', {});
        me.fireEvent('dataChange', me, data);
    };

    Model.prototype.load = function (params) {
        var me = this,
            data = me.get('data'),
            idProperty = me.get('idProperty'),
            callback,
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
                me.set('isDirty', false);
                me.set('data', me.getProxy().getResponse());
                me.fireEvent('loaded', me, me.getProxy().getResponse(), 'read');
            } else {
                me.fireEvent('error', me, 'read');
            }
        };
        me.getProxy().read(me.getNamespace(), params, callback);
    };

    Model.prototype.save = function () {
        var me = this,
            data = me.get('data'),
            idProperty = me.get('idProperty'),
            callback,
            type;
        if (me.get('isProcessing')) {
            return false;
        }
        me.set('isProcessing', true);
        callback = function () {
            me.set('isProcessing', false);
            if (me.getProxy().getStatus() === 'success') {
                me.set('isDirty', false);
                me.set('data', me.getProxy().getResponse());
                me.fireEvent('saved', me, me.getProxy().getResponse(), type);
            } else {
                me.fireEvent('error', me, type);
            }
        };

        if (typeof data[idProperty] === 'undefined') {
            type = 'create';
            me.getProxy().create(me.getNamespace(), data, callback);
        } else {
            type = 'update';
            me.getProxy().update(me.getNamespace(), data, callback);
        }
        return true;
    };

    Model.prototype.remove = function () {
        var me = this,
            data = me.get('data'),
            idProperty = me.get('idProperty'),
            callback;

        if (typeof data[idProperty] === 'undefined')
            throw new Error('Can not remove empty model');

        callback = function () {
            if (me.getProxy().getStatus() === 'success') {
                delete data[idProperty];
                me.set('isDirty', false);
                me.set('data', {});
                me.fireEvent('removed', me, 'destroy');
            } else {
                me.fireEvent('error', me, 'destroy');
            }
        };
        me.getProxy().destroy(me.getNamespace(), data, callback);
    };

    window.yamvc = yamvc;
    window.yamvc.Model = Model;
}(window));
