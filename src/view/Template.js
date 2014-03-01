ya.Core.$extend({
    module : 'ya',
    alias : 'view.Template',
    defaults: {
        tpl: null
    },
    init: function (opts) {
        var me = this, config;

        me.__super(opts);

        opts = opts || {};
        config = ya.$merge(me._config, opts.config);

        me.set('initOpts', opts);
        me.set('config', config);

        me.initConfig();
        me.initTpl();

    },
    initConfig: function () {
        var me = this,
            config = me.get('config');

        me.__super();

        if (!config.id)
            throw new Error("ya.view.Template: Template need to have id");

        return me;
    },
    initTpl: function () {
        var me = this,
            html = me.getTpl(),
            tpl = document.createElement('div');

        if (Array.isArray(html)) {
            html = html.join("");
        }

        tpl.innerHTML = html;

        me.set('html', tpl);
    },
    getHtml: function () {
        return this._html;
    }
});
