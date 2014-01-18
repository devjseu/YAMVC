(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Proxy,
        Status;

    Status = {
        PENDING: 0,
        SUCCESS: 1,
        FAIL: 2
    };

    Proxy = yamvc.Core.extend({
        init: function (opts) {
            var me = this, config;

            Proxy.Parent.init.apply(this, arguments);

            opts = opts || {};
            config = yamvc.merge(me._config, opts.config);

            me.set('initOpts', opts);
            me.set('config', config);

            me.initConfig();

        },
        read: function (action) {

            if (!(action instanceof yamvc.data.Action))
                throw new Error('yamvc.data.Proxy: read argument action should be instance of yamvc.data.Action');

            if (!action.getOption('namespace'))
                throw new Error('yamvc.data.Proxy: namespace should be set');

        },
        create: function (action) {

            if (!(action instanceof yamvc.data.Action))
                throw new Error('yamvc.data.Proxy: create argument action should be instance of yamvc.data.Action');

            if (!action.getOption('namespace'))
                throw new Error('yamvc.data.Proxy: namespace should be set');

            if (!action.getData() || typeof action.getData() !== 'object')
                throw new Error('yamvc.data.Proxy: Data should be object');

        },
        update: function (action) {

            if (!(action instanceof yamvc.data.Action))
                throw new Error('yamvc.data.Proxy: update argument action should be instance of yamvc.data.Action');

            if (!action.getOption('namespace'))
                throw new Error('yamvc.data.Proxy: namespace should be set');

            if (!action.getData() || typeof action.getData() !== 'object')
                throw new Error('yamvc.data.Proxy: Data should be object');

        },
        destroy: function (action) {

            if (!(action instanceof yamvc.data.Action))
                throw new Error('yamvc.data.Proxy: destroy argument action should be instance of yamvc.data.Action');

            if (!action.getOption('namespace'))
                throw new Error('yamvc.data.Proxy: namespace should be set');

            if (!action.getData() || typeof action.getData() !== 'object')
                throw new Error('Data should be pass as object');

        }
    });

    // statics
    Proxy.Status = Status;

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.Proxy = Proxy;
}(window));
