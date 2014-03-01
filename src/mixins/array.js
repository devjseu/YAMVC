ya.$set('ya', 'mixins.Array', {
    /**
     *
     * @param key
     * @returns {Number}
     */
    find: function (key /*[, value]*/) {
        var len = this.length,
            argsLen = arguments.length,
            val = argsLen > 1 ? arguments[1] : null,
            rec;

        while (len--) {

            rec = this[len];
            if (argsLen > 1) {

                if (rec[key] === val) {
                    break;
                }

            } else if (rec === key) {
                break;
            }
        }

        return len;
    },
    /**
     *
     * @param key
     * @returns {Array}
     */
    findAll: function (key /*[, value]*/) {
        var len = this.length,
            argsLen = arguments.length,
            val = argsLen > 1 ? arguments[1] : null,
            result = [],
            rec;

        while (len--) {

            rec = this[len];
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
     *
     * @param {Function} fn
     * @returns {Array}
     */
    findAllByFn: function (fn) {
        var len = this.length,
            result = [];

        while (len--) {

            if (fn(this[len])) {

                result.push(len);

            }

        }

        return result;
    },
    each: Array.prototype.forEach || function (fun /*, thisArg */) {

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t)
                fun.call(thisArg, t[i], i, t);
        }
    }
});