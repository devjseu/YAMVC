yamvc.$onReady(function () {
    "use strict";

    new yamvc.Controller({
        config: {
            name: 'Main',
            views: {
                topBar: new app.view.Bar({
                    config: {
                        autoCreate: true,
                        models: {
                            likes: new yamvc.Model({
                                config: {namespace: 'likes'},
                                data: {
                                    count: 0
                                }
                            })
                        },
                        id: 'bar',
                        tpl: new yamvc.view.Template({
                            config : {
                                id: 'tpl-bar',
                                tpl: [
                                    '<div class="bar">',
                                    'Count : {{likes.count}}',
                                    '</div>'
                                ]
                            }
                        }),
                        renderTo: '#container'
                    }
                })
            },
            events: {
            }
        }
    });

});