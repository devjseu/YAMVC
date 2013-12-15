yamvc.Core.onReady(function () {
    "use strict";
    var models, liker, ctr, app = {views: {}, ctr: {}};

    models = {
        likes: new yamvc.Model({
            config: {
                namespace: 'likes'
            },
            data: {
                count: 0
            }
        })
    };

    app.views.liker = new Liker({
        config: {
            autoCreate: true,
            models: models,
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