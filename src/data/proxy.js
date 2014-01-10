(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Proxy;

    Proxy = yamvc.Core.extend({
        defaults: {
            propertyResults: 'results'
        },
        init: function (opts) {
            var me = this, config;
            Proxy.Parent.init.apply(this, arguments);
            opts = opts || {};
            config = yamvc.merge(me._config, opts.config);
            me.set('initOpts', opts);
            me.set('config', config);
            me.initConfig();
        },
        initConfig: function () {
            var me = this;
            Proxy.Parent.initConfig.call(this);
            me.set('lastResponse', {});
        },
        read: function (namespace, data, callback) {
            if (!namespace)
                throw new Error('namespace should be set');

        },
        create: function (namespace, data, callback) {
            if (!namespace)
                throw new Error('namespace should be set');
            if (!data || typeof data !== 'object')
                throw new Error('Data should be pass as object');
        },
        update: function () {

        },
        destroy: function () {
        },
        setResponse: function (response) {
            return this.set('response', response);
        },
        getResponse: function () {
            return this.get('response');
        }
    });


    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.Proxy = Proxy;
}(window));
