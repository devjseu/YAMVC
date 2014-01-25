yamvc.$onReady(function () {
    "use strict";

    new yamvc.Controller({
        config: {
            name: 'Main',
            views: {
                topBar: new app.view.Bar({
                    config: {
                        autoCreate: true,
                        models: [
                            new yamvc.Model({
                                config: {
                                    namespace: 'likes',
                                    data: {
                                        count: 0
                                    }
                                },
                                incrementCount: function () {
                                    var me = this;
                                    me.data('count', me.data('count') + 1);
                                }
                            })
                        ],
                        id: 'bar',
                        tpl: new yamvc.view.Template({
                            config: {
                                id: 'tpl-bar',
                                tpl: [
                                    '<div class="bar">',
                                    'Count : {{likes.count}}',
                                    '<button>+</button>',
                                    '</div>'
                                ]
                            }
                        }),
                        renderTo: '#container'
                    }
                })
            },
            events: {
                button: {
                    click: function (view, event) {
                        view.getModel('likes').incrementCount();
                    }
                }
            }
        }
    });

});