
ya.$onReady(function () {
    "use strict";

    ya.View.$create({
        config: {
            models: [
                ya.Model.$create({
                    config: {
                        namespace: 'names'
                    },
                    data: {
                        name: "Guest"
                    }
                })
            ],
            id: 'bar',
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-bar',
                    tpl: [
                        'Hello World!'
                    ]
                }
            }),
            renderTo: '#container'
        }
    }).render();

});