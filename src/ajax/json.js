/**
 * @namespace ya
 * @class ajax.JSON
 * @extends ya.Ajax
 */
ya.Ajax.$extend({
    module: 'ya',
    alias: 'ajax.JSON',
    defaults: function () {
        return {
            mimeType: 'application\/json',
            responseType: 'json'
        }
    },
    doFallback: function () {
        var me = this,
            req = me.getRequest();

        me.set('response', JSON.parse(req.responseText));

    }
});