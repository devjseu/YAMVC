(function (window, undefined) {
    "use strict";

    var Bar = View.extend(function (opts) {
        View.apply(this, arguments);
        this.bindEvents();
    });

    Bar.prototype.bindEvents = function () {

    };

    window.Bar = Bar;

}(window));