/**
 * @namespace ya
 * @class Error
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Error',
    defaults: {
        id: null,
        message: null,
        stack: null
    },
    /**
     * @method
     * @param msg
     * @param id
     */
    init: function (msg, id) {
        var me = this;

        me
            .initConfig(arguments)
            .initDefaults();
    },
    /**
     *
     * @method
     * @param opts
     * @returns {*}
     */
    initConfig: function (opts) {
        var me = this;

        me.__super({
            config: {
                message: opts[0],
                id: opts[1]
            }
        });

        return me;
    },
    /**
     *
     * @method
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        me.setStack((new Error(me.getMessage())).stack);

        // Compatibility with native exception
        me.id = me.getId();
        me.message = me.getMessage();
        me.stack = me.getStack();

        return me;
    },
    toString: function () {
        var me = this;

        return 'ya.Error(' + me.getId() + '): ' + me.getMessage();
    }
});