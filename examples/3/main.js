ya.$onReady(function () {
    "use strict";

    var Liker = ya.$get('Liker');

    Liker.$create({
        config: {
            autoCreate: true,
            models: [
                ya.Model.$create({
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
            ],
            id: 'test-liker',
            tpl: 'tpl-liker',
            renderTo: '#container'
        }
    });

    Liker.$create({
        config: {
            autoCreate: true,
            models: [
                ya.Model.$create({
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
            ],
            id: 'test-liker-2',
            tpl: 'tpl-liker',
            renderTo: '#container'
        }
    });

    ya.Controller.$create({
        config: {
            name: 'Main'
        },
        init: function (opts) {
            var me = this;

            opts.config.events = {
                '$test-liker .liker': {
                    click: me.onClick
                },
                '$test-liker .container-liker': {
                    click: me.onContainerClick
                },
                '$test-liker-2 .liker': {
                    click: me.onClick
                },
                '$test-liker-2 .container-liker': {
                    click: me.onContainerClick
                },
                '$test-liker': {
                    render: me.onRender
                },
                '$test-liker-2': {
                    render: me.onRender
                }
            };

            ya.Controller.prototype.init.call(this, opts);
        },
        onClick : function (view, e) {
            view.getModel('likes').incrementLikes();
        },
        onContainerClick: function (view, e) {
            view.getModel('likes').toggleDisabled();
        },
        onRender: function (view) {
            alert('Button ' + view.getId() + ' rendered enabled');
        }
    });

});