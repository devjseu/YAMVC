ya.$onReady(function () {
    "use strict";

    var Liker = ya.$get('Liker'), v, v2, tpl;

    tpl = [
        '<div>',
        '<span>{{likes.text}}</span>',
        '<div style="display: inline" class="container-liker">',
        '<button disabled="{{likes.disabled}}" class="liker">{{likes.count}}</button>',
        '</div>',
        '</div>'
    ];

    v = Liker.$create({
        config: {
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
            tpl: tpl,
            renderTo: '#container'
        }
    });

    v2 = Liker.$create({
        config: {
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
            tpl: tpl,
            renderTo: '#container'
        }
    });

    ya.Controller.$create({
        init: function () {
            var me = this, events;

            events = {
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

            ya.Controller.prototype.init.call(me, {config: {events: events}});

            return me;
        },
        onClick: function (view, e) {
            view.getModel('likes').incrementLikes();
        },
        onContainerClick: function (view, e) {
            view.getModel('likes').toggleDisabled();
        },
        onRender: function (view) {
            alert('Button ' + view.getId() + ' rendered enabled');
        }
    });

    v.render();
    v2.render();
});