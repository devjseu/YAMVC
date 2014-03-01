ya.$set('ya', 'mixins.GetSet', {
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
});
