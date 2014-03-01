ya.$set('ya', 'mixins.Selector', {
    /**
     * check if passed selector match to main DOM element
     * @param selector String with selector
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

    }
});