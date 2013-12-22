//TODO not ready!
(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Proxy;

    Proxy = yamvc.Core.extend(function () {
        yamvc.Core.apply(this, arguments);
    });

    Proxy.prototype.init = function (opts) {
        yamvc.Core.prototype.init.apply(this, arguments);
        var me = this, config;
        opts = opts || {};
        config = opts.config || {};
        me.set('initOpts', opts);
        me.set('config', config);
        me.initDefaults();
        me.initConfig();
    };

    Proxy.prototype.initConfig = function () {
        var me = this;
        yamvc.Core.prototype.initConfig.apply(this);
        me.set('lastResponse', {});
    };

    /**
     *
     */
    Proxy.prototype.initDefaults = function () {
        var me = this,
            config = me.get('config');
        config.propertyResults = 'results';
    };

    /**
     * abstract
     */
    Proxy.prototype.read = function (namespace, data, callback) {
        if (!namespace)
            throw new Error('namespace should be set');

    };

    /**
     * abstract
     */
    Proxy.prototype.create = function (namespace, data, callback) {
        if (!namespace)
            throw new Error('namespace should be set');
        if (!data || typeof data !== 'object')
            throw new Error('Data should be pass as object');
    };

    /**
     * abstract
     */
    Proxy.prototype.update = function () {

    };

    /**
     * abstract
     */
    Proxy.prototype.destroy = function () {
    };

    /**
     * abstract
     */
    Proxy.prototype.update = function () {

    };


    Proxy.prototype.setResponse = function (response) {
        return this.set('response', response);
    };


    Proxy.prototype.getResponse = function () {
        return this.get('response');
    };

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.Proxy = Proxy;
}(window));
