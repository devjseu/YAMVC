(function (undefined) {
    'use strict';

    var fillAttrs;

    function makeMap(str) {
        // Make object map from string.
        var obj = {}, items = str.split(",");
        for (var i = 0; i < items.length; i++)
            obj[items[i]] = true;
        return obj;
    }

    fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");


    /**
     * @namespace ya.mixins
     * @class CSSStyle
     */
    ya.$set('ya', 'mixins.CSSStyle', {
        isFillAttr: function (attr) {
            return typeof fillAttrs[attr] !== 'undefined';
        }
    });

}());