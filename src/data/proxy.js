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
        me.initConfig();
    };

    Proxy.prototype.initConfig = function () {
        var me = this;
        yamvc.Core.prototype.initConfig.apply(this);
        me.set('lastResponse', {});
    };

    /**
     * abstract
     */
    Proxy.prototype.read = function () {
    };

    /**
     * abstract
     */
    Proxy.prototype.create = function () {
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

    /**
     * abstract
     */
    Proxy.prototype.getResult = function () {
        var me = this;
        return me.get('lastResponse');
    };

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.Proxy = Proxy;
}(window));
