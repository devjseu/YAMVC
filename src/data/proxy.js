(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Proxy;

    Proxy = yamvc.Core.$extend({
        init: function (opts) {
            var me = this, config;

            Proxy.Parent.init.apply(this, arguments);

            opts = opts || {};
            config = yamvc.$merge(me._config, opts.config);

            me.set('initOpts', opts);
            me.set('config', config);

            me.initConfig();

        },
        read: function (action) {
            var me = this,
                opts,
                id;

            if (!(action instanceof yamvc.data.Action))
                throw new Error('yamvc.data.Proxy: read argument action should be instance of yamvc.data.Action');

            opts = action.getOptions();
            id = opts.params && opts.params.id;

            if (!action.getOption('namespace'))
                throw new Error('yamvc.data.Proxy: namespace should be set');

            if (typeof id === 'undefined') {
                me.readBy(action);
            } else {
                me.readById(action);
            }

            return me;
        },
        create: function (action) {
            var me = this;

            if (!(action instanceof yamvc.data.Action))
                throw new Error('yamvc.data.Proxy: create argument action should be instance of yamvc.data.Action');

            if (!action.getOption('namespace'))
                throw new Error('yamvc.data.Proxy: namespace should be set');

            if (!action.getData() || typeof action.getData() !== 'object')
                throw new Error('yamvc.data.Proxy: Data should be object');

            return me;
        },
        update: function (action) {
            var me = this;

            if (!(action instanceof yamvc.data.Action))
                throw new Error('yamvc.data.Proxy: update argument action should be instance of yamvc.data.Action');

            if (!action.getOption('namespace'))
                throw new Error('yamvc.data.Proxy: namespace should be set');

            if (!action.getData() || typeof action.getData() !== 'object')
                throw new Error('yamvc.data.Proxy: Data should be object');

            return me;
        },
        destroy: function (action) {
            var me = this;

            if (!(action instanceof yamvc.data.Action))
                throw new Error('yamvc.data.Proxy: destroy argument action should be instance of yamvc.data.Action');

            if (!action.getOption('namespace'))
                throw new Error('yamvc.data.Proxy: namespace should be set');

            if (!action.getData() || typeof action.getData() !== 'object')
                throw new Error('Data should be pass as object');

            return me;
        }
    });

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.Proxy = Proxy;
}(window));
