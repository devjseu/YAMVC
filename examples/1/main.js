Base.onReady(function (){
    "use script";

    var model, liker, ctr;

    model = {
        likes: 0
    };

    liker = new Liker({
        config: {
            models: model,
            id: 'test-liker',
            tpl: 'tpl-liker',
            renderTo: '#container'
        }
    });

    ctr = new Controller({
        config: {
            name: 'Main',
            views: {
                likeBtn: liker
            },
            events : {
                '#liker' : {
                    click : function () {
                        this.incrementLikes();
                    }
                }
            }
        }
    });

    liker.render();

});