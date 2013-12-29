//TODO not ready!
(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Localstorage,
        Proxy = yamvc.data.Proxy;

    /**
     * Extend Proxy class
     *
     * @type {*}
     */
    Localstorage = Proxy.extend(function () {
        Proxy.apply(this, arguments);
    });

    /**
     * Initialize options
     *
     * @param opts
     */
    Localstorage.prototype.init = function (opts) {
        Proxy.prototype.init.apply(this, arguments);
        var me = this, config;
        opts = opts || {};
        config = opts.config || {};
        me.set('initOpts', opts);
        me.set('config', config);
        me.initConfig();
    };

    /**
     * Initialize config
     */
    Localstorage.prototype.initConfig = function () {
        Proxy.prototype.initConfig.apply(this);

    };

    /**
     * Read data from local storage
     *
     * @param namespace
     * @param data
     * @param callback
     */
    Localstorage.prototype.read = function (namespace, data, callback) {
        var me = this;

        Proxy.prototype.read.apply(this, arguments);


        if (typeof data === 'object') {
            me.readBy(namespace, data, callback);
        } else {
            me.readById(namespace, data, callback);
        }
    };

    /**
     * Read data from localstorage by passed parameters
     *
     * @param namespace
     * @param opts
     * @param callback
     */
    Localstorage.prototype.readBy = function (namespace, opts, callback) {
        var me = this,
            limit = opts.limit || null,
            offset = opts.offset || 0,
            filters = opts.filters || [],
            sorters = opts.sorters || [],
            response = {},
            filtered = [],
            records = [],
            meet = true,
            operator,
            property,
            sorter,
            order,
            len;
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

            // next we do sorting
            len = sorters.length;
            while (len--) {
                sorter = sorters[len];
                property = sorter[0];
                order = sorter[1] || 'ASC';
                records.sort(function (a, b) {
                    var va = "" + a[property],
                        vb = "" + b[property],
                        alc = va.name.toLowerCase(), blc = vb.name.toLowerCase();
                    return (alc > blc ? 1 : alc < blc ? -1 : va.name > vb.name ? 1 : va.name < vb.name ? -1 : 0)
                        * (order.toLowerCase() === 'desc' ? -1 : 1);
                });
            }
            if (!limit) {
                limit = records.length - offset;
            }

            if (offset > 0 || limit) {
                records = records.splice(offset, limit);
            }
        }

        response.success = true;
        response.result = records;
        callback(me, response);
        return me;
    };

    /**
     * Read single record by id
     *
     * @param namespace
     * @param id
     * @param callback
     * @returns {Localstorage}
     */
    Localstorage.prototype.readById = function (namespace, id, callback) {
        var me = this, records = [], result = {}, response = {};
        if (localStorage[namespace]) {
            records = JSON.parse(localStorage[namespace]);
            for (var i = 0, l = records.length; i < l; i++) {
                if (records[i].id === id) {
                    result = records[i];
                }
            }
            if (typeof result.id !== 'undefined') {
                response.success = true;
                response.result = result;
                callback(me, response);
                return me;
            }
        }

        response.success = false;
        response.error = new Error("Not found");
        callback(me, response);
        return me;
    };


    /**
     * execute condition on record
     *
     * @param record
     * @param filter
     * @returns {boolean}
     */
    Localstorage.prototype.executeCondition = function (record, filter) {
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
    };

    Localstorage.prototype.create = function (namespace, data, callback) {
        var me = this, records = [], sequence = 0, response = {};
        Proxy.prototype.create.apply(this, arguments);
        if (localStorage[namespace]) {
            records = JSON.parse(localStorage[namespace]);
            sequence = localStorage[namespace + "$Sequence"];
        }
        if (Array.isArray(data)) {
            for (var i = 0, l = data.length; i < l; i++) {
                data[i].id = sequence++;
                records.push(data[i]);
            }
        } else {
            data.id = sequence++;
            records.push(data);
        }
        try {
            localStorage[namespace] = JSON.stringify(records);
            localStorage[namespace + "$Sequence"] = sequence;
            response.success = true;
            response.result = data;
        } catch (e) {
            response.success = false;
            response.error = e;
        }
        me.setResponse(response);
        callback(me, response);
        return me;
    };

    Localstorage.prototype.update = function (namespace, data, callback) {
        var me = this, records = [], result = {}, response = {}, id, l, l2;

        if (localStorage[namespace]) {

            records = JSON.parse(localStorage[namespace]);

            if (Array.isArray(data)) {

                l = data.length;
                while (l--) {
                    l2 = records.length;
                    id = data[l].id;
                    while (l2--) {
                        if (records[l2].id === id) {
                            records[l2] = data[l];
                        }
                    }
                }
                result = records;

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
            } catch (e) {
                response.success = false;
                response.error = e;
            }
            callback(me, response);
            return me;
        }

        response.success = false;
        response.error = new Error("Not found");
        callback(me, response);
        return me;
    };

    Localstorage.prototype.destroy = function (namespace, data, callback) {
        var me = this, records = [], response = {}, id, l, l2;

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
            } catch (e) {
                response.success = false;
                response.error = e;
            }
            callback(me, response);
            return me;
        }

        response.success = false;
        response.error = new Error("Not found");
        callback(me, response);
        return me;
    };

    Localstorage.clear = function (tables) {
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
    };

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.proxy = window.yamvc.data.proxy || {};
    window.yamvc.data.proxy.Localstorage = Localstorage;
}(window));
