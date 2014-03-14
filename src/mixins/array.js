/**
 * @namespace ya.mixins
 * @class Array
 */
ya.$set('ya', 'mixins.Array', {
    /**
     *
     * @param array
     * @param key
     * @returns {Number}
     */
    find: function (array, key /*[, value]*/) {
        var len = array.length,
            argsLen = arguments.length,
            val = argsLen > 2 ? arguments[2] : null,
            rec;

        if (argsLen > 1) {

            while (len--) {

                rec = array[len];
                if (rec[key] === val) {
                    break;
                }
            }

        } else {

            while (len--) {

                rec = array[len];
                if (rec === key) {
                    break;
                }
            }

        }

        return len;
    },
    /**
     *
     * @param array
     * @param key
     * @returns {Array}
     */
    findAll: function (array, key /*[, value]*/) {
        var len = array.length,
            argsLen = arguments.length,
            val = argsLen > 2 ? arguments[2] : null,
            result = [],
            rec;

        while (len--) {

            rec = array[len];
            if (argsLen > 1) {

                if (rec[key] === val) {
                    result.push(len);
                }

            } else if (rec === key) {
                result.push(len);
            }
        }

        return result;
    },
    /**
     * @param array
     * @param {Function} fn
     * @returns {Array}
     */
    findAllByFn: function (array, fn) {
        var len = array.length,
            result = [];

        while (len--) {

            if (fn(array[len])) {

                result.push(len);

            }

        }

        return result;
    },
    /**
     * @param array
     * @param fun
     */
    each: Array.prototype.forEach ? function (array, fun) {
        Array.prototype.forEach.call(array, fun);
    } : function (array, fun) {

        if (array === void 0 || array === null)
            throw new TypeError();

        var t = Object(array);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();

        for (var i = 0; i < len; i++) {
            if (i in t)
                fun.call(array, t[i], i, t);
        }
    },
    some: Array.prototype.some ? function (array, fun) {
        Array.prototype.some.call(array, fun);
    } : function (fun /*, thisArg */) {
        'use strict';

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function')
            throw new TypeError();

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t && fun.call(thisArg, t[i], i, t))
                return true;
        }

        return false;
    }
});