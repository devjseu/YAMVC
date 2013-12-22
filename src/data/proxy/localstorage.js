//TODO not ready!
(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc || {},
        Localstorage,
        Proxy = yamvc.data.Proxy;

    Localstorage = Proxy.extend(function () {
        Proxy.apply(this, arguments);
    });

    Localstorage.prototype.init = function (opts) {
        Proxy.prototype.init.apply(this, arguments);
        var me = this, config;
        opts = opts || {};
        config = opts.config || {};
        me.set('initOpts', opts);
        me.set('config', config);
        me.initConfig();
    };

    Localstorage.prototype.initConfig = function () {
        Proxy.prototype.initConfig.apply(this);

    };

    Localstorage.prototype.read = function (namespace, data, callback) {
        var me = this;

        Proxy.prototype.read.apply(this, arguments);

        if (typeof data === 'Object') {

        } else {
            me.readById(namespace, data, callback);
        }
    };

    Localstorage.prototype.readById = function (namespace, id, callback) {
        var me = this, records = [], result = {}, response = {};
        if (localStorage[namespace]) {
            records = JSON.parse(localStorage[namespace]);
            for (var i = 0, l = records.length; i < l; i++) {
                if (records[i].id === id) {
                    result = records[i];
                }
            }
            if (result.id) {
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

    Localstorage.prototype.filter = function () {

    };

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

    Localstorage.prototype.update = function () {

    };

    Localstorage.prototype.destroy = function () {
        delete localStorage[model.getNamespace()];
    };

    Localstorage.prototype.update = function () {

    };

    Localstorage.clear = function () {
        for (var store in localStorage) {
            delete localStorage[store];
        }
    };

    window.yamvc = yamvc;
    window.yamvc.data = window.yamvc.data || {};
    window.yamvc.data.proxy = window.yamvc.data.proxy || {};
    window.yamvc.data.proxy.Localstorage = Localstorage;
}(window));
