(function (window, undefined) {
    "use strict";

    var Button = View.extend(function (opts) {
        View.apply(this, arguments);
        this.bindEvents();
    });

    Button.prototype.bindEvents = function () {

    };

    window.Bar = window.Bar || {};
    window.Bar.Button = Button;

}(window));