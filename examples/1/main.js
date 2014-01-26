yamvc.$onReady(function () {
    "use strict";

    (new yamvc.View({
        config: {
            models: [
                new yamvc.Model({
                    config: {
                        namespace: 'names'
                    },
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
                        'Hello World!'
                    ]
                }
            }),
            renderTo: '#container'
        }
    })).render();

});