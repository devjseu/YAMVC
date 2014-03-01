ya.Core.$extend({
    module: 'ya',
    alias: 'data.Action',
    static: {
        status: {
            PENDING: 0,
            SUCCESS: 1,
            FAIL: 2
        }
    },
    init: function (opts) {
        var me = this, config;

        opts = opts || {};

        me.__super(opts);
        config = ya.$merge(me._config, opts.config);

        me.set('initOpts', opts);
        me.set('config', config);
        me.set('response', {});
        me.set('status', ya.data.Action.$status.PENDING);

        me.initConfig();
    },
    setData: function (data) {
        this.set('data', data);
        return this;
    },
    getData: function () {
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
        var statuses = ya.data.Action.$status,
            check = false, st;

        for (st in statuses) {
            if (statuses.hasOwnProperty(st) && statuses[st] === status)
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
