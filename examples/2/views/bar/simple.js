(function (window, undefined) {
    "use strict";

    var Simple = View.extend(function (opts) {
        View.apply(this, arguments);
        this.bindEvents();
    });

    Simple.prototype.bindEvents = function () {

    };

    window.Bar = window.Bar || {};
    window.Bar.Simple = Simple;

}(window));