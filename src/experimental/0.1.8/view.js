(function (window, undefined) {
    "use strict";

    var yamvc = window.yamvc || {},
        View,
        renderId = 0,
        fillAttrs;

    function makeMap(str) {
        var obj = {}, items = str.split(",");
        for (var i = 0; i < items.length; i++)
            obj[ items[i] ] = true;
        return obj;
    }

    fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

    /**
     * @constructor
     * @params opts Object with configuration properties
     * @type {function}
     */
    View = yamvc.View.extend({
        /**
         * @version 0.1.8
         * @param data
         * @returns {Node}
         */
        render: function (data) {
            var me = this,
                tpl = me._tpl,
                config = me._config,
                id = config.renderTo,
                models = data || config.models,
                parent = config.parent,
                parentView = config.parent,
                bindings = [],
                headers = [],
//                bindRegEx = /({{.+?}})/gi,
                results,
                result,
                header,
                ret,
//                replaceFn,
                parsedTpl,
                walker,
                node,
                el,
                i = 0,
                l = 0,
                j = 0,
                len = 0,
                attrs = [],
                attr;

            /*replaceFn = function (match, type, pointer) {
             var header = match.substr(2, (match.length - 4)).split('.'),
             ret;
             if (models[header[0]]) {
             ret = models[header[0]].data(header[1]) || "";
             } else {
             ret = "";
             }
             bindings.push({
             header: header,
             type: type,
             pointer: pointer
             });
             return ret;  // and replace it with value from model.
             };*/

            if (parent) {// If parent is set,
                if (id && parent.queryEl(id)) { // search for element to which we will append component.
                    parent = parent.queryEl(id);
                } else {// If not found, append to parent root element.
                    parent = parent._el;
                }
            } else {// If parent not set,
                if (id) { // but we have an id of element to which we want render new one,
                    parent = document.querySelector(id);// we search for it in the whole document.
                }
            }

            parsedTpl = tpl.cloneNode(true); // Next, clone template.

            walker = document.createTreeWalker( // Create walker object and
                parsedTpl,
                NodeFilter.SHOW_ALL,
                null,
                false
            );

            node = walker.nextNode();
            while (node) { // walk through all nodes.

                if (node.nodeType === 3) { // If our element is text node
                    results = node.data.match(/\{\{(.*?)\}\}/gi);// we searching for mustached text inside it
                    if (results) { // and if we have positive match
                        var text = node.nodeValue,
                            doc = document.createElement('span'),// we create new span element
                            rId = "v-r-b-" + renderId++;

                        i = 0;
                        len = results.length;
                        headers = [];

                        doc.setAttribute('id', rId); // and add generated id.

                        // In the end we replace all match via data.
                        while (i < len) {

                            result = results[i++];
                            header = result.substr(2, (result.length - 4)).split('.');

                            if (models[header[0]]) {
                                ret = models[header[0]].data(header[1]);
                                if (ret === undefined) {
                                    ret = "";
                                }
                            } else {
                                ret = "";
                            }

                            text = text.replace(result, ret);
                            headers.push(header);

                        }

                        doc.appendChild(
                            document.createTextNode(text)
                        );

                        // We also keep founded bindings.
                        bindings.push({
                            original: node.nodeValue,
                            headers: headers,
                            type: 3,
                            pointer: doc,
                            oldDOM: node
                        });

                    }
                    /*node.nodeValue = node.nodeValue.replace(bindRegEx, function (match) {
                     return replaceFn(match, 1, node);
                     });*/
                }
                else {

                    attrs = node.attributes;
                    l = attrs.length;

                    while (l--) {

                        attr = attrs.item(l);
                        results = attr.nodeValue && attr.nodeValue.match(/\{\{(.*?)\}\}/gi);

                        if (results) {
                            var original = attr.nodeValue,
                                fillAttr = fillAttrs[attr.nodeName];

                            i = 0;
                            len = results.length;
                            headers = [];

                            ret = fillAttr ? true : "";

                            while (i < len) {

                                result = results[i++];
                                header = result.substr(2, (result.length - 4)).split('.');


                                if (!fillAttr) {

                                    if (models[header[0]]) {
                                        ret = models[header[0]].data(header[1]) || "";
                                    }

                                    attr.nodeValue = attr.nodeValue.replace(result, ret);

                                } else {

                                    ret = ret && models[header[0]].data(header[1]);

                                }

                                headers.push(header);

                            }

                            if (fillAttr && !ret) {

                                node.removeAttribute(attr.nodeName);

                            }else{

                                node.setAttribute(attr.nodeName, ret);

                            }

                            bindings.push({
                                original: original,
                                headers: headers,
                                fillAttr: fillAttr || false,
                                type: 2,
                                attrName: attr.nodeName,
                                pointer: node
                            });

                        }

                        /*attrs.item(l).nodeValue = attrs[l].nodeValue.replace(bindRegEx, function (match) {
                         return replaceFn(match, 0, attrs[l]);
                         });*/
                    }
                }

                node = walker.nextNode();

            }


            while (j < tpl.childNodes.length && tpl.childNodes.item(j).nodeType !== 1) {
                j++;
            }

            el = parsedTpl.childNodes.item(j);

            el.setAttribute('yamvc-id', config.id);

            me.set('el', el);
            me.set('bindings', bindings);

            me.resolveBindings();

            if (parent) {
                parent.appendChild(el);

                if (parentView) {
                    parentView.views = parentView.views || {};
                    parentView.views[config.id] = me;
                }

                me.set('isInDOM', true);
                me.reAppendChildren();
                me.fireEvent('render', null, me);
            }

            return el;
        },
        /**
         * @version 0.1.8
         */
        resolveBindings: function () {
            var me = this,
                bindings = me._bindings,
                models = me._config.models,
                bindFactory,
                model,
                headers,
                header,
                binding,
                property,
                lenM = 0,
                len = 0;

            bindFactory = function (binding) {
                return function () {
                    me.partialRender(binding);
                };
            };

            len = bindings.length;
            while (len--) {

                binding = bindings[len];
                headers = binding.headers;

                if (binding.type === 3) {
                    binding.oldDOM.parentNode.replaceChild(binding.pointer, binding.oldDOM);
                    delete binding.oldDOM;
                }

                lenM = headers.length;
                while (lenM--) {

                    model = models[headers[lenM][0]];
                    header = headers[lenM][1];

                    if (model) {
                        property = header.charAt(0).toUpperCase() + header.slice(1);
                        model.addListener('data' + property + 'Change', bindFactory(binding));
                    }

                }
            }
        },
        /**
         * @version 0.1.8
         * @param binding
         */
        partialRender: function (binding) {
            var element = binding.type === 3,
                org = element ? binding.original : true,
                models = this._config.models,
                headers = binding.headers,
                len = headers.length,
                header;

            while (len--) {

                header = headers[len];

                if (element || !binding.fillAttr) {

                    org = org.replace("{{" + header.join(".") + "}}", models[header[0]].data(header[1]));

                } else {

                    org = org && models[header[0]].data(header[1]);

                }
            }

            if (element) {

                binding.pointer.textContent = org;


            } else {

                if (binding.fillAttr && !org) {

                    binding.pointer.removeAttribute(binding.attrName);

                } else {

                    binding.pointer.setAttribute(binding.attrName, org);

                }

            }

        }
    });


    window.yamvc = yamvc;
    window.yamvc.experimental = window.yamvc.experimental || {};
    window.yamvc.experimental.View = View;
}(window));