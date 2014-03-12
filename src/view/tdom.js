/**
 * @namespace ya.view
 * @class TDOM
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'view.TDOM',
    defaults: {
        tpl: null,
        /**
         * @attribute config.view
         * @type ya.View
         * @required
         */
        view: null
    },
    init: function (opts) {
        var me = this;

        me
            .initConfig(opts)
            .initRequired();

        return me;
    },
    initRequired: function () {
        var me = this;

        if (!me.getView()) {
            throw ya.Error.$create('ya.view.TDOM requires view object', 'T2DOM1');
        }

        if (!me.getTpl()) {
            throw ya.Error.$create('ya.view.TDOM requires template object', 'T2DOM2');
        }

        return me;
    },
    update: function () {

    },
    getDOM: function () {
        var me = this,
            instance = this.getTpl().prepareInstance(),
            dom = instance.dom,
            div, firstChild;

        if (
            dom.childNodes.length > 1 ||
                dom.firstChild.nodeType === 3
            ) {

            div = document.createElement('div');

            while (dom.childNodes.length) {
                div.appendChild(dom.firstChild);
            }

            div
                .setAttribute(
                    'class',
                    'ya inline'
                );

            dom
                .appendChild(div);


        }

        firstChild = dom.firstChild;

        firstChild.setAttribute(
            'id',
            me.getView().getId()
        );

        me.set('bindings', instance.bindings);

        return dom.firstChild;
    }
});
