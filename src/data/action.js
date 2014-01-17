(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Action,
        Status;

    Status = {
        PENDING: 0,
        SUCCESS: 1,
        FAIL: 2
    };

    Action = yamvc.Core.extend({
        init: function (opts) {
            var me = this, config;

            Action.Parent.init.apply(this, arguments);

            opts = opts || {};
            config = yamvc.merge(me._config, opts.config);

            me.set('initOpts', opts);
            me.set('config', config);
            me.set('response', {});
            me.set('status', Status.PENDING);

            me.initConfig();
        },
        setOptions: function (opts) {
            this.set('options', opts);
            return this;
        },
        getOptions: function () {
            return this._options;
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
                throw new Error('yamvc.data.Action: Wrong status');

            return this.set('status', status);
        },
        getStatus: function () {
            return this.get('response');
        }
    });

    // statics
    Action.Status = Status;

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.Action = Action;
}(window));
