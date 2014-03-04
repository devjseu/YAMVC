/**
 * @description
 * ## Router
 * Router is used internally in controller, so don't instantiated it again.
 * @namespace ya
 * @class Router
 * @extends ya.Core
 * @constructor
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Router',
    /**
     * @method init
     */
    init: function () {
        var me = this;

        me.set('routing', {});
        me.bindEvents();

        return me;
    },
    /**
     * @method bindEvents
     * @chainable
     */
    bindEvents: function () {
        var me = this;

        window.onhashchange = me.onHashChange.bind(me);

        return this;
    },
    /**
     * @method onHashChange
     * @chainable
     */
    onHashChange: function () {
        var routing = this.get('routing'),
            hash = window.location.hash.substr(1),
            paths = hash.split("/"),
            action = paths.shift();

        if (routing[action]) {
            var args = [];
            if (routing[action].params) {
                for (var i = 0, len = routing[action].params.length; i < len; i++) {
                    var param = routing[action].params[i],
                        hashParam = paths[i],
                        regEx = new RegExp(param.substr(1, param.length - 2));
                    args.push(hashParam.match(regEx).input);
                }
            }
            routing[action].callback.apply(null, args);
        }
        return this;
    },
    /**
     * @method restore
     * @chainable
     */
    restore: function () {
        this.onHashChange();
        return this;
    },
    /**
     * @method when
     * @param path
     * @param callback
     * @returns {*}
     * @chainable
     */
    when: function (path, callback) {
        var routing = this.get('routing'),
            paths = path.split("/"),
            action = paths.shift();
        routing[action] = {
            callback: callback,
            params: paths
        };
        this.set('routing', routing);
        return this;
    }
});