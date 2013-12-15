//TODO not ready!
(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Localstorage;

    Localstorage = yamvc.Core.extend(function (){
        yamvc.Core.apply(this, arguments);
    });

    Localstorage.prototype.init = function (opts) {
        yamvc.Core.prototype.init.apply(this, arguments);
        var me = this, config;
        opts = opts || {};
        config = opts.config || {};
        me.set('initOpts', opts);
        me.set('config', config);
        me.initConfig();
    };

    Localstorage.prototype.initConfig = function () {
        yamvc.Core.prototype.initConfig.apply(this);

    };

    Localstorage.prototype.read = function () {
        var property, prModel = localStorage[model.getNamespace()] || {};
        for (property in prModel) {
            if (prModel.hasOwnProperty(property)) {
                model[property] = prModel[property];
            }
        }

    };

    Localstorage.prototype.create = function () {
        var property, model;
        localStorage[model.getNamespace()] = {};
        for (property in model) {
            if (model.hasOwnProperty(property)) {
                if (typeof model[property] !== 'function') {
                    localStorage[model.getNamespace()][property] = model[property];
                }
            }
        }
    };

    Localstorage.prototype.update = function () {

    };

    Localstorage.prototype.destroy = function () {
        delete localStorage[model.getNamespace()];
    };

    Localstorage.prototype.update = function () {

    };

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.proxy = window.yamvc.data.proxy || {};
    window.yamvc.data.proxy.Localstorage = Localstorage;
}(window));
