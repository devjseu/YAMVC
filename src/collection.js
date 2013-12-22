(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Collection;

    Collection = yamvc.Core.extend(function () {
        yamvc.Core.apply(this, arguments);
    });

    Collection.prototype.init = function (opts) {
        yamvc.Core.prototype.init.apply(this, arguments);
        var me = this, config;
        opts = opts || {};
        config = opts.config || {};
        me.set('initOpts', opts);
        me.set('config', config);
        me.set('set', []);
        me.set('cache', []);
        me.initConfig();
    };

    Collection.prototype.initConfig = function () {
        yamvc.Core.prototype.initConfig.apply(this);
        var me = this,
            config = me.get('config'),
            testModel;
        if (!config.model) {
            throw new Error("Set model for collection");
        }
        testModel = new (config.model)({config: {namespace: 'test'}});
        if (!(testModel instanceof yamvc.Model)) {
            throw new Error("Set proper model for collection");
        }
    };

    Collection.prototype.load = function (params) {
        var me = this,
            data = me.get('data'),
            idProperty = me.get('idProperty'),
            callback,
            key, i = 0;

        for (key in params) i++;

        if (
            i === 0
            )
            throw new Error('You need to pass at least one condition to load model collection');

        callback = function () {
            if (me.getProxy().getStatus() === 'success') {
                me.set('isDirty', false);
                me.prepareData();
                me.fireEvent('loaded', me, me.getProxy().getResponse(), 'read');
            } else {
                me.fireEvent('error', me, 'read');
            }
        };
        me.getProxy().read(me.getNamespace(), params, callback);
    };

    Collection.prototype.prepareData = function () {
        var me = this,
            ModelInstance = me.getModel(),
            results = me.getProxy().getResult(),
            rows = results.rows,
            models = [];
        for (var i = 0, l = rows.length; i < l; i++) {
            models.push(new ModelInstance({
                data: rows[i]
            }));
        }
        me.set('set', models);
        me.set('total', results.total);
    };

    Collection.prototype.getRawData = function () {

    };

    window.yamvc = yamvc;
    window.yamvc.Collection = Collection;
}(window));
