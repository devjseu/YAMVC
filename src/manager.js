/**
 * @namespace ya
 * @class Manager
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Manager',
    defaults: {
        items: null,
        id: null
    },
    mixins: [
        ya.mixins.Array
    ],
    /**
     *
     * @method
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        me.setItems([]);
        me.setId(0);

        return me;
    },
    getItem: function (id) {
        var me = this,
            items = me.getItems(),
            find;

        find = me
            .find(items, 'id', id);

        return find > -1 ? items[find].item : null;
    },
    getCount: function () {
        return this.getItems().length;
    },
    getUniqueId: function () {
        return this._config.id++;
    },
    register: function (id, item) {
        var me = this;

        if (
            !me.isRegistered(id)
        ) {

            me.getItems().push({id: id, item: item});
            me.fireEvent('registered', item);

        } else {

            throw ya.Error.$create(this.__class__ + ': ID ' + id + ' already registered.', 'YVTM1');

        }

        return me;

    },
    deregister: function (id) {
        var me = this,
            items = me.getItems(),
            find;

        find = me.find(items, 'id', id);

        //todo bug

        if (find > -1) {

            me.fireEvent('unregistered', items.splice(find, 1));

        }

        return me;
    },
    /**
     *
     * @param id
     * @returns {boolean}
     */
    isRegistered: function (id) {
        return this.find(this.getItems(), 'id', id) > -1;
    }
});