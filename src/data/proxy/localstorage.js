/**
 * @description
 * ## Localstorage
 *   Proxy provides access to localStorage object. Gives possibility to retrieve data
 *   by id or trough parameters.
 * @namespace ya.data.proxy
 * @class Localstorage
 * @extends ya.data.Proxy
 */
ya.data.Proxy.$extend({
    module: 'ya',
    alias: 'data.proxy.Localstorage',
    static: {
        /**
         *
         * @param tables
         */
        clear: function (tables) {
            var len = 0, table;
            if (!tables) {
                for (var store in localStorage) {
                    delete localStorage[store];
                    delete localStorage[store + '$Sequence'];
                }
            } else {
                if (!Array.isArray(tables)) {
                    tables = [tables];
                }
                len = tables.length;
                while (len--) {
                    table = tables[len];
                    delete localStorage[table];
                    delete localStorage[table + '$Sequence'];
                }
            }
        }
    },
    /**
     * @method readBy
     * @param action
     * @returns {Localstorage}
     */
    readBy: function (action) {
        var me = this,
            opts = action.getOptions(),
            namespace = opts.namespace,
            callback = opts.callback,
            limit = opts.limit || null,
            offset = opts.offset || 0,
            filters = opts.filters || [],
            sorters = opts.sorters || [],
            response = {},
            filtered = [],
            records = [],
            meet = true,
            total = 0,
            async,
            operator,
            property,
            sorter,
            sorterFn,
            order,
            len;

        sorterFn = function (a, b) {
            var va = "" + a[property],
                vb = "" + b[property],
                alc = va.toLowerCase(), blc = vb.toLowerCase();
            return (alc > blc ? 1 : alc < blc ? -1 : va > vb ? 1 : va < vb ? -1 : 0) * (order.toLowerCase() === 'desc' ? -1 : 1);
        };

        async = function () {

            if (localStorage[namespace]) {
                records = JSON.parse(localStorage[namespace]);

                // firstly we need to filter records
                for (var i = 0, l = records.length; i < l; i++) {
                    meet = true;
                    len = filters.length;
                    while (len--) {
                        if (filters[len].length > 3) {
                            operator = filters[len][0];
                        } else {
                            operator = '&&';
                        }
                        if (operator === '&&') {
                            meet = me.executeCondition(records[i], filters[len]) && meet;
                        } else if (operator === '||') {
                            meet = me.executeCondition(records[i], filters[len]) || meet;
                        }
                    }

                    if (meet) {
                        filtered.push(records[i]);
                    }

                }

                records = filtered;
                total = filtered.length;

                // next we do sorting
                len = sorters.length;
                while (len--) {
                    sorter = sorters[len];
                    property = sorter[0];
                    order = sorter[1] || 'ASC';
                    records.sort(sorterFn);
                }
                // and take care about offset and limit
                if (!limit) {
                    limit = records.length - offset;
                }

                if (offset > 0 || limit) {
                    records = records.splice(offset, limit);
                }
            }

            response.total = total;
            response.result = records;

            action
                .setStatus(ya.data.Action.$status.SUCCESS)
                .setResponse(response);

            callback(me, action);

        };

        setTimeout(function () {

            try {

                async();

            } catch (e) {

                response.error = e;
                callback(me, action);

            }
        }, 0);

        return me;
    },
    /**
     *
     * @method readById
     * @param action
     * @returns {Localstorage}
     */
    readById: function (action) {
        var me = this,
            opts = action.getOptions(),
            params = opts.params,
            namespace = opts.namespace,
            callback = opts.callback,
            id = params.id,
            records = [],
            result = {},
            response = {},
            async;

        async = function () {

            if (localStorage[namespace]) {

                records = JSON.parse(localStorage[namespace]);
                for (var i = 0, l = records.length; i < l; i++) {

                    if (records[i].id === id) {
                        result = records[i];
                    }

                }

                if (typeof result.id !== 'undefined') {

                    response.total = 1;
                    response.result = result;

                    action
                        .setStatus(ya.data.Action.$status.SUCCESS)
                        .setResponse(response);

                    callback(me, action);

                    return me;
                }
            }

            me.setStatus(ya.data.Action.$status.FAIL);
            response.error = new Error("Not found");
            callback(me, action);
        };

        setTimeout(async, 0);

        return me;
    },
    /**
     * @methods create
     * @param action
     * @returns {Localstorage}
     */
    create: function (action) {
        var me = this,
            data = action.getData(),
            namespace = action.getOption('namespace'),
            callback = action.getOption('callback'),
            records = [],
            sequence = 1,
            response = {},
            result,
            async;

        me.__super.apply(this, arguments);

        if (localStorage[namespace]) {

            records = JSON.parse(localStorage[namespace]);
            sequence = localStorage[namespace + "$Sequence"];

        }

        if (Array.isArray(data)) {

            result = [];
            for (var i = 0, l = data.length; i < l; i++) {

                // Add id to the new record,
                data[i].id = sequence++;

                // remove client id,
                delete data[i].__clientId__;

                // push to records
                records.push(data[i]);

                // and to return array.
                result.push(data[i]);
            }

        } else {

            data.id = sequence++;

            delete data.__clientId__;

            records.push(data);

            result = data;

        }

        async = function () {
            try {

                localStorage[namespace] = JSON.stringify(records);
                localStorage[namespace + "$Sequence"] = sequence;

                response.result = result;

                action
                    .setStatus(ya.data.Action.$status.SUCCESS)
                    .setResponse(response);

            } catch (e) {

                response.error = e;

                action
                    .setStatus(ya.data.Action.$status.FAIL)
                    .setResponse(response);

            }

            callback(me, action);
        };

        setTimeout(async, 0);

        return me;
    },
    /**
     * @methods update
     * @param action
     * @returns {Localstorage}
     */
    update: function (action) { //
        var me = this,
            data = action.getData(),
            namespace = action.getOption('namespace'),
            callback = action.getOption('callback'),
            records = [],
            result,
            response = {},
            id, l, l2, async;

        async = function () { // update record asynchronously
            if (localStorage[namespace]) { // but only if namespace for saving object exist

                records = JSON.parse(localStorage[namespace]);

                if (Array.isArray(data)) {

                    result = [];
                    l = data.length;
                    while (l--) {
                        l2 = records.length;
                        id = data[l].id;
                        while (l2--) {
                            if (records[l2].id === id) {
                                records[l2] = data[l];
                                result.splice(0, 0, data[l]);
                            }
                        }
                    }

                } else {
                    l = records.length;
                    id = data.id;
                    while (l--) {
                        if (records[l].id === id) {
                            result = records[l] = data;
                        }
                    }

                }

                try {

                    localStorage[namespace] = JSON.stringify(records);
                    response.success = true;
                    response.result = result;

                    action
                        .setStatus(ya.data.Action.$status.SUCCESS)
                        .setResponse(response);

                } catch (e) {

                    response.success = false;
                    response.error = e;

                    action
                        .setStatus(ya.data.Action.$status.FAIL)
                        .setResponse(response);

                }

                callback(me, action);

                return me;
            }

            response.success = false;
            response.error = new Error("Not found");

            action
                .setStatus(ya.data.Action.$status.FAIL)
                .setResponse(response);

            callback(me, action);
        };

        setTimeout(async, 0);
        return me;
    },
    /**
     * @methods destroy
     * @param action
     * @returns {Localstorage}
     */
    destroy: function (action) {
        var me = this,
            data = action.getData(),
            namespace = action.getOption('namespace'),
            callback = action.getOption('callback'),
            records = [],
            response = {},
            id, l, l2, async;

        async = function () {

            if (localStorage[namespace]) {

                records = JSON.parse(localStorage[namespace]);

                if (Array.isArray(data)) {

                    l = data.length;
                    while (l--) {
                        l2 = records.length;
                        id = data[l].id;
                        while (l2--) {
                            if (records[l2].id === id) {
                                records.splice(l2, 1);
                            }
                        }
                    }

                } else {

                    l = records.length;
                    id = data.id;
                    while (l--) {
                        if (records[l].id === id) {
                            records.splice(l, 1);
                        }
                    }

                }

                try {

                    localStorage[namespace] = JSON.stringify(records);
                    response.success = true;

                    action
                        .setStatus(ya.data.Action.$status.SUCCESS)
                        .setResponse(response);

                } catch (e) {

                    response.success = false;
                    response.error = e;

                    action
                        .setStatus(ya.data.Action.$status.FAIL)
                        .setResponse(response);

                }
                callback(me, action);
                return me;
            }

            response.success = false;
            response.error = new Error("Not found");

            action
                .setStatus(ya.data.Action.$status.FAIL)
                .setResponse(response);

            callback(me, action);

        };

        setTimeout(async, 0);

        return me;
    },
    /**
     * @methods executeCondition
     * @param record
     * @param filter
     * @returns {boolean}
     */
    executeCondition: function (record, filter) {
        var result = false, condition, property, value, regex;
        if (filter.length > 3) {
            property = filter[1];
            condition = filter[2];
            value = filter[3];
        } else {
            property = filter[0];
            condition = filter[1];
            value = filter[2];
        }
        switch (condition) {
            case '>' :
                if (record[property] > value) {
                    result = true;
                }
                break;
            case '<' :
                if (record[property] < value) {
                    result = true;
                }
                break;
            case '>=' :
                if (record[property] >= value) {
                    result = true;
                }
                break;
            case '<=' :
                if (record[property] <= value) {
                    result = true;
                }
                break;
            case 'like' :
                if (value.charAt(0) !== '%') {
                    value = "^" + value;
                }
                if (value.charAt(value.length - 1) !== '%') {
                    value = value + "$";
                }
                value = value.replace(/%/g, "");
                regex = new RegExp(value);
                if (regex.test(record[property])) {
                    result = true;
                }
                break;
        }
        return result;
    }
});
