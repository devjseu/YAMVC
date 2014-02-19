(function (window, undefined) {
    "use strict";

    var ya = window.ya || {},
        app = window.app || {},
        Bar;

    Bar = ya.View.$extend({
        tpl : ""
    });

    app.view = app.view || {};
    app.view.Bar = Bar;
    window.app = app;

}(window));