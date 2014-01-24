(function (window, undefined) {
    "use strict";

    var yamvc = window.yamvc || {},
        Template;

    Template = yamvc.Core.$extend({
        init: function (opts) {
            var me = this, config;

            Template.Parent.init.apply(this, arguments);

            opts = opts || {};
            config = yamvc.$merge(me._config, opts.config);

            me.set('initOpts', opts);
            me.set('config', config);

            me.initConfig();
            me.initTpl();

        },
        initConfig: function () {
            var me = this,
                config = me.get('config');

            Template.Parent.initConfig.apply(this);

            if (!config.id)
                throw new Error("yamvc.data.Template: Template need to have id");

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
        getHtml : function () {
            return this._html;
        }
    });

    window.yamvc = yamvc;
    window.yamvc.view = window.yamvc.view || {};
    window.yamvc.view.Template = Template;
}(window));
