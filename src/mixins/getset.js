(function (window, undefined) {
    "use strict";
    var ya = window.ya || {},
        mixins = ya.mixins || {},
        GetSet;

    GetSet = {
        /**
         *
         * @param property
         * @param value
         * @returns {this}
         *
         */
        set: function (property, value) {
            var p = "_" + property,
                oldVal = this[p];
            if (value !== oldVal) {
                this[p] = value;
                this.fireEvent(property + 'Change', this, value, oldVal);
            }
            return this;
        },
        /**
         *
         * @param property
         * @returns {*}
         *
         */
        get: function (property) {
            return this["_" + property];
        }
    };

    mixins.GetSet = GetSet;
    window.ya = ya;
    window.ya.mixins = mixins;
}(window));
