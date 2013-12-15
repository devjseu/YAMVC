Core.onReady(function (){
    "use script";

    var model, bar, ctr;

    model = {
        likes: 0
    };

    bar = new Bar({
        config: {
            autoCreate : true,
            models: model,
            id: 'bar',
            tpl: 'tpl-bar',
            renderTo: '#container'
        }
    });

    ctr = new yamvc.Controller({
        config: {
            name: 'Main',
            views: {
                topBar : ViewManager.get('bar')
            },
            events : {
            }
        }
    });

});