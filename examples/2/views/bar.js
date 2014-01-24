(function (window, undefined) {
    "use strict";

    var yamvc = window.yamvc || {},
        app = window.app || {},
        Bar;

    Bar = yamvc.View.$extend({
        tpl : ""
    });

    app.view = app.view || {};
    app.view.Bar = Bar;
    window.app = app;

}(window));