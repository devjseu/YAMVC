(function (undefined) {
    'use strict';

    var ya = window.ya || {},
        appNamespace = 'app',
        onReadyCallbacks = [],
        readyStateCheckInterval;

    // Run all method when ready
    function run() {
        for (var i = 0, l = onReadyCallbacks.length; i < l; i++) {
            onReadyCallbacks[i]();
        }
    }

    // Provide way to execute all necessary code after DOM is ready.
    /**
     * @param callback
     */
    ya.$onReady = function (callback) {
        onReadyCallbacks.push(callback);
        if (!readyStateCheckInterval && document.readyState !== "complete") {
            readyStateCheckInterval = setInterval(function () {
                if (document.readyState === "complete") {
                    clearInterval(readyStateCheckInterval);
                    run();
                }
            }, 10);
        }
    };

    // Merge two objects.
    /**
     * @param obj1
     * @param obj2
     * @returns {*}
     */
    ya.$merge = function (obj1, obj2) {
        var nObj = {},
            property;

        for (property in obj1) {
            if (obj1.hasOwnProperty(property)) {
                nObj[property] = obj1[property];
            }
        }

        for (property in obj2) {
            if (obj2.hasOwnProperty(property)) {
                nObj[property] = obj2[property];
            }
        }

        return nObj;
    };

    // clone data object
    ya.$clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    /**
     * Set new namespace
     * @param {null||} module
     * @param {String} namespace
     * @param {*} value
     * @returns {namespace}
     */
    ya.$set = function () {
        var module = arguments.length < 3 ? appNamespace : arguments[0],
            namespaces = arguments.length < 3 ? arguments[0].split('.') : arguments[1].split('.'),
            value = arguments.length < 3 ? arguments[1] : arguments[2],
            pointer = window[module] = window[module] || {},
            current;

        while (namespaces.length) {

            current = namespaces.shift();
            if (namespaces.length === 0) {

                pointer[current] = value;

            } else {

                pointer = pointer[current] = pointer[current] || {};

            }
        }

        return this;
    };

    /**
     *
     * @param module
     * @param namespace
     * @returns {*}
     */
    ya.$get = function () {
        var module = arguments.length < 3 ? appNamespace : arguments[0],
            namespace = arguments.length < 2 ? arguments[0] : arguments[1],
            namespaces = namespace.search(/\./) > 0 ? namespace.split('.') : [namespace],
            pointer = window[module],
            current;

        while (namespaces.length) {

            current = namespaces.shift();
            if (pointer[current]) {

                pointer = pointer[current];

            } else if (current in window) {

                pointer = window[current];
            } else {

                pointer = null;
                break;

            }


        }

        return pointer;
    };

    ya.$module = function () {
        var module = arguments.length ? arguments [0] : null;

        if (module) {
            appNamespace = module;
        }

        return appNamespace;

    };

    window.ya = ya;
}());