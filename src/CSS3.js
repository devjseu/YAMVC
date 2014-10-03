(function (window, undefined) {
    "use strict";
    /**
     * css functionality tests
     *
     */
    var ya = window.ya || {},
        dom = document.createElement('div'),
        prefixes = '-webkit- -moz- -o- -ms- '.split(' '),
        omPrefixes = 'Webkit Moz O ms ',
        cssomPrefixes = omPrefixes.split(' '),
        available = {
            transform: null,
            transition: null
        },
        has3d = false,
        init;

    function testProperties() {
        var property, t;
        // Add it to the body to get the computed style
        document.body.insertBefore(dom, null);
        /**
         * Transform
         */
        property = "Transform";
        for (t in cssomPrefixes) {
            property = cssomPrefixes[t].length ? property : property.charAt(0).toLowerCase() + property.slice(1);
            if (
                (dom.style[cssomPrefixes[t] + property]) !== undefined
            ) {
                dom.style[cssomPrefixes[t] + property] = 'translate3d(1px,1px,1px)';
                has3d = window.getComputedStyle(dom).getPropertyValue(prefixes[t] + "transform");
                has3d = (has3d !== undefined && has3d.length > 0 && has3d !== "none");
                available.transform = cssomPrefixes[t] + property;
                available.transformCSS = prefixes[t] + "transform";
            }
        }
        /**
         * Transition
         */
        property = "Transition";
        for (t in cssomPrefixes) {
            property = cssomPrefixes[t].length ? property : property.charAt(0).toLowerCase() + property.slice(1);
            if (
                (dom.style[cssomPrefixes[t] + property]) !== undefined
            ) {
                available.transition = cssomPrefixes[t] + property;
                available.transitionCSS = prefixes[t] + "transition";
            }
        }
        document.body.removeChild(dom);
        return true;
    }

    ya.CSS3 = {
        init: function () {
            init = init || testProperties();
            return this;
        },
        is: function (property) {
            return (available[property] !== null);
        },
        get: function (property) {
            return available[property] || property;
        },
        getCSS: function (property) {
            return available[property + "CSS"];
        },
        has3d: function () {
            return has3d;
        }
    };

    ya.CSS3.init();

    window.ya = ya;

}(window));