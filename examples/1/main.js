yamvc.onReady(function () {
    "use strict";
    var models, models2, liker, ctr, app = {views: {}, ctr: {}};

    models = {
        likes: new yamvc.Model({
            config: {
                namespace: 'likes'
            },
            data: {
                text: 'Likes',
                count: 0,
                disabled : true
            }
        })
    };

    models2 = {
        likes: new yamvc.Model({
            config: {
                namespace: 'likes'
            },
            data: {
                text: 'Likes',
                count: 0,
                disabled : false
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

    app.views.liker2 = new Liker({
        config: {
            autoCreate: true,
            models: models2,
            id: 'test-liker-2',
            tpl: 'tpl-liker',
            renderTo: '#container'
        }
    });

    app.ctr.main = new yamvc.Controller({
        config: {
            name: 'Main',
            views: {
                likeBtn: yamvc.ViewManager.get('test-liker'),
                likeBtn2: yamvc.ViewManager.get('test-liker-2')
            },
            events: {
                '.liker': {
                    click: function (view, e) {
                        view.incrementLikes();
                    }
                },
                $likeBtn : {
                    render : function (view) {
                    }
                },
                $likeBtn2 : {
                    render : function (view) {
                    }
                }
            }
        }
    });

});