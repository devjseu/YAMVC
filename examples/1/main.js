yamvc.Base.onReady(function () {
    "use script";

    var model, liker, ctr, app = {views: {}, ctr: {}};

    model = {
        likes: 0
    };

    app.views.liker = new Liker({
        config: {
            autoCreate: true,
            models: model,
            id: 'test-liker',
            tpl: 'tpl-liker',
            renderTo: '#container'
        }
    });

    app.ctr.main = new yamvc.Controller({
        config: {
            name: 'Main',
            views: {
                likeBtn: yamvc.ViewManager.get('test-liker')
            },
            events: {
                '#liker': {
                    click: function (view, e) {
                        view.incrementLikes();
                    }
                }
            }
        }
    });

});