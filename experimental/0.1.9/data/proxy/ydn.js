(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Ydn;

    Ydn = yamvc.data.Proxy.extend({
        init: function (opts) {
            var me = this, config;
            yamvc.data.Proxy.prototype.init.apply(this, arguments);
            opts = opts || {};
            config = opts.config || {};
            config.idProperty = 'id';
            me.set('initOpts', opts);
            me.set('config', config);
            me.initConfig();
            return me;
        },
        getStatus: function () {
            return this.get('status');
        },
        getResponse: function () {
            return this.get('response');
        },
        read: function (namespace, data, callback) {
            var me = this, fSet, idProperty, req;

            idProperty = me.getIdProperty();

            if (typeof data[idProperty] === 'object') {
                console.log(idProperty);
            }

            fSet = me.set.bind(me);
            req = me.getDb().getConnection().get(namespace, data[idProperty]);

            req.done(function (key) {
                fSet('status', 'success');
                data[idProperty] = key;
                fSet('response', data);
                callback();
            });

            req.fail(function (e) {
                fSet('status', 'error');
                fSet('response', e);
                callback();
            });

            return me;
        },
        create: function (namespace, data, callback) {
            var me = this, fSet, idProperty, req;

            fSet = me.set.bind(me);
            idProperty = me.getIdProperty();

            req = me.getDb().getConnection().put({
                name: namespace,
                keyPath: idProperty
            }, data);

            req.done(function (key) {
                fSet('status', 'success');
                data[idProperty] = key;
                fSet('response', data);
                callback();
            });

            req.fail(function (e) {
                fSet('status', 'error');
                fSet('response', e);
                callback();
            });

            return me;
        },
        update: function (namespace, data, callback) {
            var me = this, fSet, req;

            fSet = me.set.bind(me);
            req = me.getDb().getConnection().put(namespace, data);

            req.done(function () {
                fSet('status', 'success');
                fSet('response', data);
                return callback();
            });

            req.fail(function (e) {
                fSet('status', 'error');
                fSet('response', e);
                callback();
            });

            return me;
        },
        destroy: function (namespace, data, callback) {
            var me = this, fSet, idProperty, req;

            idProperty = me.getIdProperty();
            fSet = me.set.bind(me);
            req = me.getDb().getConnection().remove(namespace, data[idProperty]);

            req.done(function () {
                fSet('status', 'success');
                fSet('response', {});
                callback();
            });

            req.fail(function (e) {
                fSet('status', 'error');
                fSet('response', e);
                callback();
            });

            return me;
        }
    });

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.proxy = window.yamvc.data.proxy || {};
    window.yamvc.data.proxy.Ydn = Ydn;

}(window));

/*
 //@ sourceMappingURL=ydnDb.map
 */
