(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Collection;

    Collection = yamvc.Core.extend(function (){
        yamvc.Core.apply(this, arguments);
    });

    Collection.prototype.init = function (opts) {
        yamvc.Core.prototype.init.apply(this, arguments);
        var me = this, config;
        opts = opts || {};
        config = opts.config || {};
        me.set('initOpts', opts);
        me.set('config', config);
        me.initConfig();
    };

    Collection.prototype.initConfig = function () {
        yamvc.Core.prototype.initConfig.apply(this);
        if(!config.model){
            throw new Error("Set model type for collection");
        }
    };



    window.yamvc = yamvc;
    window.yamvc.Collection = Collection;
}(window));
