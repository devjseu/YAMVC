/**
 * @namespace ya.data
 * @class Proxy
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'data.Proxy',
    init: function (opts) {
        var me = this, config;

        opts = opts || {};

        me.__super(opts);

        config = ya.$merge(me._config, opts.config);

        me.set('initOpts', opts);
        me.set('config', config);

        me.initConfig();

    },
    read: function (action) {
        var me = this,
            opts,
            id;

        if (!(action instanceof ya.data.Action))
            throw new Error('ya.data.Proxy: read argument action should be instance of ya.data.Action');

        opts = action.getOptions();
        id = opts.params && opts.params.id;

        if (!action.getOption('namespace'))
            throw new Error('ya.data.Proxy: namespace should be set');

        if (typeof id === 'undefined') {
            me.readBy(action);
        } else {
            me.readById(action);
        }

        return me;
    },
    create: function (action) {
        var me = this;

        if (!(action instanceof ya.data.Action))
            throw new Error('ya.data.Proxy: create argument action should be instance of ya.data.Action');

        if (!action.getOption('namespace'))
            throw new Error('ya.data.Proxy: namespace should be set');

        if (!action.getData() || typeof action.getData() !== 'object')
            throw new Error('ya.data.Proxy: Data should be object');

        return me;
    },
    update: function (action) {
        var me = this;

        if (!(action instanceof ya.data.Action))
            throw new Error('ya.data.Proxy: update argument action should be instance of ya.data.Action');

        if (!action.getOption('namespace'))
            throw new Error('ya.data.Proxy: namespace should be set');

        if (!action.getData() || typeof action.getData() !== 'object')
            throw new Error('ya.data.Proxy: Data should be object');

        return me;
    },
    destroy: function (action) {
        var me = this;

        if (!(action instanceof ya.data.Action))
            throw new Error('ya.data.Proxy: destroy argument action should be instance of ya.data.Action');

        if (!action.getOption('namespace'))
            throw new Error('ya.data.Proxy: namespace should be set');

        if (!action.getData() || typeof action.getData() !== 'object')
            throw new Error('Data should be pass as object');

        return me;
    }
});
