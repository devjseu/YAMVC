(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc,
        Liker;

    Liker = yamvc.View.extend({
        init: function () {
            Liker.Parent.init.apply(this, arguments);
            this.bindEvents();
        },
        bindEvents: function () {
            this.getModel('likes')
                .addListener('dataCountChange', this.updateLiker.bind(this));
        },
        incrementLikes: function () {
            this.getModel('likes')
                .data(
                    'count',
                    this.getModel('likes').data('count') + 1
                );
        },
        updateLiker: function () {
            this.partialRender('.liker');
        }
    });

    window.Liker = Liker;

}(window));