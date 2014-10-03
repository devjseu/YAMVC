/**
 * Proxy (which follow crud principles) allow you to retrieve the data from
 * different sources. Basic proxy class provides only some abstraction and need to be
 * extend.
 * @namespace ya.data
 * @class Proxy
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'data.Proxy',
    /**
     * @methods read
     * @param action
     * @returns {*}
     */
    read: function (action) {
        var me = this,
            opts,
            id;

        if (!(action instanceof ya.data.Action))
            throw ya.Error.$create('ya.data.Proxy: read argument action should be instance of ya.data.Action');

        opts = action.getOptions();
        id = opts.params && opts.params.id;

        if (!action.getOption('namespace'))
            throw ya.Error.$create('ya.data.Proxy: namespace should be set');

        if (typeof id === 'undefined') {
            me.readBy(action);
        } else {
            me.readById(action);
        }

        return me;
    },
    /**
     * @methods create
     * @param action
     * @returns {*}
     */
    create: function (action) {
        var me = this;

        if (!(action instanceof ya.data.Action))
            throw ya.Error.$create('ya.data.Proxy: create argument action should be instance of ya.data.Action');

        if (!action.getOption('namespace'))
            throw ya.Error.$create('ya.data.Proxy: namespace should be set');

        if (!action.getData() || typeof action.getData() !== 'object')
            throw ya.Error.$create('ya.data.Proxy: Data should be object');

        return me;
    },
    /**
     * @methods update
     * @param action
     * @returns {*}
     */
    update: function (action) {
        var me = this;

        if (!(action instanceof ya.data.Action))
            throw ya.Error.$create('ya.data.Proxy: update argument action should be instance of ya.data.Action');

        if (!action.getOption('namespace'))
            throw ya.Error.$create('ya.data.Proxy: namespace should be set');

        if (!action.getData() || typeof action.getData() !== 'object')
            throw ya.Error.$create('ya.data.Proxy: Data should be object');

        return me;
    },
    /**
     * @methods destroy
     * @param action
     * @returns {*}
     */
    destroy: function (action) {
        var me = this;

        if (!(action instanceof ya.data.Action))
            throw ya.Error.$create('ya.data.Proxy: destroy argument action should be instance of ya.data.Action');

        if (!action.getOption('namespace'))
            throw ya.Error.$create('ya.data.Proxy: namespace should be set');

        if (!action.getData() || typeof action.getData() !== 'object')
            throw ya.Error.$create('Data should be pass as object');

        return me;
    }
});