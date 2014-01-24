yamvc.$onReady(function () {
    "use strict";


    var model, bar, ctr;

    model = new yamvc.Model({
        config: {namespace: 'likes'},
        data: {
            count: 0
        }
    });

    bar = new app.view.Bar({
        config: {
            autoCreate: true,
            models: {
                likes: model
            },
            id: 'bar',
            tpl: 'tpl-bar',
            renderTo: '#container'
        }
    });

    ctr = new yamvc.Controller({
        config: {
            name: 'Main',
            views: {
                topBar: yamvc.ViewManager.get('bar')
            },
            events: {
            }
        }
    });

});