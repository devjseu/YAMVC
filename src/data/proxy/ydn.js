(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Ydn;

    Ydn = yamvc.data.Proxy.extend(function () {
        var me = this;
        yamvc.data.Proxy.apply(me, arguments);
        return me;
    });

    Ydn.prototype.init = function (opts) {
        var me = this, config;
        yamvc.data.Proxy.prototype.init.apply(this, arguments);
        opts = opts || {};
        config = opts.config || {};
        config.idProperty = 'id';
        me.set('initOpts', opts);
        me.set('config', config);
        me.initConfig();
        return me;
    };

    Ydn.prototype.getStatus = function () {
        return this.get('status');
    };

    Ydn.prototype.getResponse = function () {
        return this.get('response');
    };

    Ydn.prototype.read = function (namespace, data, callback) {
        var me = this, $set, idProperty, req;
        idProperty = me.getIdProperty();
        if (typeof data[idProperty] === 'object') {
            console.log(idProperty);
        }
        $set = me.set.bind(me);
        req = me.getDb().getConnection().get(namespace, data[idProperty]);
        req.done(function (key) {
            $set('status', 'success');
            data[idProperty] = key;
            $set('response', data);
            callback();
        });
        req.fail(function (e) {
            $set('status', 'error');
            $set('response', e);
            callback();
        });
        return me;
    };

    Ydn.prototype.create = function (namespace, data, callback) {
        var me = this, $set, idProperty, req;
        $set = me.set.bind(me);
        idProperty = me.getIdProperty();
        req = me.getDb().getConnection().put({
            name: namespace,
            keyPath: idProperty
        }, data);
        req.done(function (key) {
            $set('status', 'success');
            data[idProperty] = key;
            $set('response', data);
            callback();
        });
        req.fail(function (e) {
            $set('status', 'error');
            $set('response', e);
            callback();
        });
        return me;
    };

    Ydn.prototype.update = function (namespace, data, callback) {
        var me = this, $set, req;
        $set = me.set.bind(me);
        req = me.getDb().getConnection().put(namespace, data);
        req.done(function () {
            $set('status', 'success');
            $set('response', data);
            return callback();
        });
        req.fail(function (e) {
            $set('status', 'error');
            $set('response', e);
            callback();
        });
        return me;
    };

    Ydn.prototype.destroy = function (namespace, data, callback) {
        var me = this, $set, idProperty, req;
        idProperty = me.getIdProperty();
        $set = me.set.bind(me);
        req = me.getDb().getConnection().remove(namespace, data[idProperty]);
        req.done(function () {
            $set('status', 'success');
            $set('response', {});
            callback();
        });
        req.fail(function (e) {
            $set('status', 'error');
            $set('response', e);
            callback();
        });
        return me;
    };

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.proxy = window.yamvc.data.proxy || {};
    window.yamvc.data.proxy.Ydn = Ydn;

}(window));

/*
 //@ sourceMappingURL=ydnDb.map
 */
