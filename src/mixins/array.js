(function (window, undefined) {
    "use strict";
    var ya = window.ya || {},
        mixins = ya.mixins || {},
        Array;

    Array = {
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
        }
    };

    mixins.Array = Array;
    window.ya = ya;
    window.ya.mixins = mixins;
}(window));