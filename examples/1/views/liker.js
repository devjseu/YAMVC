(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc,
        Liker;

    Liker = yamvc.View.extend(function (opts) {
        yamvc.View.apply(this, arguments);
        this.bindEvents();
    });

    Liker.prototype.bindEvents = function () {
        this.getModel('likes').addListener('propertyCountChange', this.updateLiker.bind(this));
    };

    Liker.prototype.incrementLikes = function () {
        this.getModel('likes')
            .$set(
                'count',
                this.getModel('likes').$get('count') + 1
            );
    };

    Liker.prototype.updateLiker = function () {
        this.partialRender('#liker');
    };

    window.Liker = Liker;

}(window));