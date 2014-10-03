/**
 * @namespace ya
 * @class data.Action
 * @extends ya.Core
 */
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
    initDefaults: function () {
        var me = this;

        me.set('response', {});
        me.set('results', null);
        me.set('status', ya.data.Action.$status.PENDING);

        return me;
    },
    /**
     * @methods init
     * @param data
     * @returns {*}
     */
    setData: function (data) {
        return this.set('data', data);
    },
    /**
     * @methods getData
     * @returns {Function}
     */
    getData: function () {
        return this._data;
    },
    /**
     * @methods setOptions
     * @param opts
     * @returns {*}
     */
    setOptions: function (opts) {
        return this.set('options', opts);
    },
    /**
     * @methods getOptions
     * @returns {Object}
     */
    getOptions: function () {
        return this._options;
    },
    /**
     * @methods getOption
     * @param name
     * @returns {*}
     */
    getOption: function (name) {
        return this._options[name];
    },
    /**
     * @methods setResponse
     * @param response
     * @returns {*|StyleSheet|this|set}
     */
    setResponse: function (response) {
        return this.set('response', response);
    },
    /**
     * @methods getResponse
     * @returns {Object}
     */
    getResponse: function () {
        return this._response;
    },
    setResultSet: function (results) {
        return this.set('results', results);
    },
    getResultSet: function () {
        return this._results;
    },
    /**
     * @methods setStatus
     * @param status
     * @returns {Number}
     */
    setStatus: function (status) {
        var statuses = ya.data.Action.$status,
            check = false, st;

        for (st in statuses) {
            if (statuses.hasOwnProperty(st) && statuses[st] === status)
                check = true;
        }

        if (!check)
            throw ya.Error.$create('ya.data.Action: Wrong status', 'ACTION1');

        return this.set('status', status);
    },
    /**
     * @methods getStatus
     * @returns {Object}
     */
    getStatus: function () {
        return this.get('status');
    }
});