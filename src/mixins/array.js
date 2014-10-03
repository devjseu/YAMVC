
/**
 * @namespace ya.mixins
 * @class Array
 */
ya.$set('ya', 'mixins.Array', {
    /**
     * Return an index of the record matched by key (or value)
     * @method find
     * @for ya.mixins.Array
     * @param array
     * @param key
     * @returns {Number}
     */
    find: function (array, key /*[, value]*/) {
        var len = array.length,
            argsLen = arguments.length,
            val = argsLen > 2 ? arguments[2] : null,
            tmp, rec;

        if (argsLen > 2) {

            while (len--) {

                rec = array[len];
                tmp = key.split('.');

                while (tmp.length) {

                    rec = rec[tmp.shift()];

                }

                if (rec === val) {
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
     * return an array of records matched by key (or value)
     * @method findAll
     * @for ya.mixins.Array
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
     * use search function to return array of matched elements
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
     * iterate trough each record in array
     * @method each
     * @for ya.mixins.Array
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
    /**
     * iterate trough each record in array until some
     * of iteration returns true
     * @method each
     * @for ya.mixins.Array
     * @param array
     * @param fun
     * @return boolean
     */
    some: Array.prototype.some ? function (array, fun) {
        return Array.prototype.some.call(array, fun);
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