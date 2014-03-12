/**
 * @namespace ya.mixins
 * @class DOM
 */
ya.$set('ya', 'mixins.DOM', { // todo: change name to mixins.DOM
    /**
     * checks if passed selector match to main DOM element
     * @method isQueryMatch
     * @param selector String with selector
     * @param {HTMLElement} el DOM to match
     */
    isQueryMatch: function (selector, el) {
        var match = true, tag, id, classes;

        el = this._el || el;

        if (selector.search(" ") === -1) {
            // If selector is only for one lvl element
            // (ex. div.class and not div .class),
            // find tag,
            tag = selector.match(/^[^\.#]+/gi);
            // find id,
            id = selector.match(/#[^\.#]+/gi);
            // and find classes.
            classes = selector.match(/\.[^\.#]+/gi);

            // Check if tag of the element match to the one founded
            // in selector string.
            if (tag && el.nodeName.toLowerCase() !== tag.pop()) {

                match = false;

            }

            if (classes) {
                // If any classes were founded
                while (classes.length) {

                    // check if the element have all of them.
                    if (!el.classList.contains(classes.pop().substring(1))) {
                        match = false;
                        break;
                    }

                }
            }

            // Do the same with id.
            if (id && el.getAttribute('id') !== id.pop().substring(1)) {

                match = false;

            }

        } else {

            match = false;

        }

        // And return the result.
        return match;

    },
    /**
     * checks if object is an element
     * @method isElement
     * @param obj
     * @returns {boolean}
     */
    isElement: function (obj) {
        try {
            //Using W3 DOM2 (works for FF, Opera and Chrom)
            return obj instanceof HTMLElement;
        }
        catch (e) {
            //Browsers not supporting W3 DOM2 don't have HTMLElement and
            //an exception is thrown and we end up here. Testing some
            //properties that all elements have. (works on IE7)
            return (typeof obj === "object") &&
                (obj.nodeType === 1) && (typeof obj.style === "object") &&
                (typeof obj.ownerDocument === "object");
        }
    },
    /**
     *
     * @method removeChildren
     * @param node
     * @returns {DocumentFragment}
     */
    removeChildren: function (node) {
        var fragment = document.createDocumentFragment();

        while (node.hasChildNodes()) {

            fragment.appendChild(node.removeChild(node.firstChild));

        }

        return fragment;
    },
    /**
     *
     * @param node
     * @returns {*}
     */
    toString: function (node) {
        var fn = function (node) {
                var string;

                if (typeof(XMLSerializer) !== 'undefined') {
                    var serializer = new XMLSerializer();
                    string = serializer.serializeToString(node);
                } else if (node.xml) {
                    string = node.xml;
                }

                return string;
            },
            i = 0, string = '', len;

        if (node instanceof DocumentFragment) {

            node = node.firstChild;
            while (node) {

                string += fn(node);
                node = node.nextSibling;
            }

        } else if (node instanceof NodeList) {

            len = node.length;
            while (i < len) {
                string += fn(node);
            }

        } else if (node instanceof HTMLElement) {

            string = fn(node);

        }

        return string;
    }
});