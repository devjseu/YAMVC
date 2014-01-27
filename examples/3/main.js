yamvc.$onReady(function () {
    "use strict";

    var models, models2, liker, app = {views: {}, ctr: {}};

    models = [
        new yamvc.Model({
            config: {
                namespace: 'likes',
                data: {
                    text: 'Likes',
                    count: 0,
                    disabled: true
                }
            },
            incrementLikes: function () {
                this.data('count', this._data.count + 1);
            },
            toggleDisabled: function () {
                this.data('disabled', !this._data.disabled);
            }
        })
    ];

    models2 = [
        new yamvc.Model({
            config: {
                namespace: 'likes',
                data: {
                    text: 'Likes',
                    count: 0,
                    disabled: false
                }
            },
            incrementLikes: function () {
                this.data('count', this.data('count') + 1);
            },
            toggleDisabled: function () {
                this.data('disabled', !this.data('disabled'));
            }
        })
    ];


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
                        view.getModel('likes').incrementLikes();
                    }
                },
                '.container-liker': {
                    click: function (view, e) {
                        view.getModel('likes').toggleDisabled();
                    }
                },
                $likeBtn: {
                    render: function (view) {
                        alert('Button 1 rendered disabled');
                    }
                },
                $likeBtn2: {
                    render: function (view) {
                        alert('Button 2 rendered enabled');
                    }
                }
            }
        }
    });

});