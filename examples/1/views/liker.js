(function (window, undefined) {
    "use strict";

    var Liker = View.extend(function (opts) {
        View.apply(this, arguments);
        this.bindEvents();
    });

    Liker.prototype.bindEvents = function () {
        this.addListener('liked', this.updateLiker);
    };

    Liker.prototype.incrementLikes = function () {
        this.getModels().likes++;
        this.fireEvent('liked', this);
    };

    Liker.prototype.updateLiker = function () {
        var liker = this.get('el').querySelector('#liker');
        liker.innerHTML = this.getModels().likes;
    };

    window.Liker = Liker;

}(window));