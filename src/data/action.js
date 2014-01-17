(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Container,
        Status;

    Status = {
        PENDING: 0,
        SUCCESS: 1,
        FAIL: 2
    };

    Container = yamvc.Core.extend({
        defaults: {
            propertyResults: 'results',
            status: Status.PENDING
        },
        init: function (opts) {
            var me = this, config;
            Container.Parent.init.apply(this, arguments);
            opts = opts || {};
            config = yamvc.merge(me._config, opts.config);
            me.set('initOpts', opts);
            me.set('config', config);
            me.initConfig();
        },
        initConfig: function () {
            var me = this;
            Container.Parent.initConfig.call(this);
            me.set('lastResponse', {});
        },
        setResponse: function (response) {
            return this.set('response', response);
        },
        getResponse: function () {
            return this.get('response');
        }
    });

    // statics
    Proxy.Status = Status;

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.Container = Container;
}(window));
