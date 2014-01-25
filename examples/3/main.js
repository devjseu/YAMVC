yamvc.$onReady(function () {
    "use strict";

//    new yamvc.Controller({
//        config: {
//            name: 'Main',
//            views: {
//                greetings: {}
//            },
//            events: {
//            }
//        }
//    });

    (new yamvc.View({
        config: {
            models: [
                new yamvc.Model({
                    config: {namespace: 'names'},
                    data: {
                        name: "Guest"
                    }
                })
            ],
            id: 'bar',
            tpl: new yamvc.view.Template({
                config: {
                    id: 'tpl-bar',
                    tpl: [
                        '<span>',
                        'Hello World!',
                        '</span>'
                    ]
                }
            }),
            renderTo: '#container'
        }
    })).render();

});