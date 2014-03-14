ya.$onReady(function () {
    "use strict";

    var view = app.view.Bar.$create({
        config: {
            models: [
                ya.$factory({
                    module: 'ya',
                    alias: 'Model',
                    namespace: 'likes',
                    data: {
                        count: 0
                    },
                    methods: {
                        incrementCount: function () {
                            var me = this;
                            me.data('count', me.data('count') + 1);
                        }
                    }
                })
            ],
            id: 'bar',
            tpl: {
                id: 'tpl-bar',
                tpl: [
                    '<div class="bar">',
                    'Count : {{likes.count}}',
                    '<button css="cursor: pointer;">+</button>',
                    '</div>'
                ]
            },
            renderTo: '#container'
        }
    });

    // create main controller to
    ya.Controller.$create({
        config: {
            name: 'Main',
            events: {
                '$bar button': {
                    click: function (view, event) {
                        view.getModel('likes').incrementCount();
                    }
                }
            }
        }
    });

    view.render();

});