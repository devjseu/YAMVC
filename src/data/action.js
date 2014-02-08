(function (window, undefined) {
    "use strict";
    var ya = window.ya || {},
        Action,
        Status;

    Status = {
        PENDING: 0,
        SUCCESS: 1,
        FAIL: 2
    };

    Action = ya.Core.$extend({
        init: function (opts) {
            var me = this, config;

            Action.Parent.init.apply(this, arguments);

            opts = opts || {};
            config = ya.$merge(me._config, opts.config);

            me.set('initOpts', opts);
            me.set('config', config);
            me.set('response', {});
            me.set('status', Status.PENDING);

            me.initConfig();
        },
        setData : function (data) {
            this.set('data', data);
            return this;
        },
        getData : function () {
            return this._data;
        },
        setOptions: function (opts) {
            this.set('options', opts);
            return this;
        },
        getOptions: function () {
            return this._options;
        },
        getOption: function (name) {
            return this._options[name];
        },
        setResponse: function (response) {
            return this.set('response', response);
        },
        getResponse: function () {
            return this.get('response');
        },
        setStatus: function (status) {
            var check = false, st;

            for (st in Status) {
                if (Status.hasOwnProperty(st) && Status[st] === status)
                    check = true;
            }

            if (!check)
                throw new Error('ya.data.Action: Wrong status');

            return this.set('status', status);
        },
        getStatus: function () {
            return this.get('status');
        }
    });

    // statics
    Action.Status = Status;

    window.ya = ya;
    window.ya.data = window.ya.data || {};
    window.ya.data.Action = Action;
}(window));
