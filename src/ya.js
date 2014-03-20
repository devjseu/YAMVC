/**
 Main framework object...

 @module ya
 @main ya
 **/
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

    /**
     @class ya
     */

    // Provide way to execute all necessary code after DOM is ready.
    /**
     * @method $onReady
     * @for ya
     * @static
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
     * @method $merge
     * @static
     * @param obj1
     * @param obj2
     * @returns {*}
     */
    ya.$merge = function (obj1, obj2) {
        var property;

        for (property in obj2) {
            if (obj2.hasOwnProperty(property)) {
                obj1[property] = obj2[property];
            }
        }

        return obj1;
    };

    // clone data object
    /**
     *
     * @method $clone
     * @static
     * @param obj
     * @returns {*}
     */
    ya.$clone = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    /**
     * Set new namespace
     * @method $set
     * @static
     * @param {null||String} module
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
     * @method $get
     * @static
     * @param module
     * @param namespace
     * @returns {*}
     */
    ya.$get = function () {
        var module = arguments.length < 2 ? appNamespace : arguments[0],
            namespace = arguments.length < 2 ? arguments[0] : arguments[1],
            namespaces = namespace ? (namespace.search(/\./) > 0 ? namespace.split('.') : [namespace]) : [],
            pointer = null,
            current;

        if (namespaces.length) {

            pointer = window[module] = window[module] || {};

        }

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

    /**
     * @method $factory
     * @static
     * @param config
     * @returns {*}
     */
    ya.$factory = function (config) {
        var Class, instance, opts;

        if (!config.alias) {

            throw ya.Error.$create('Factory method needs alias property', 'YA1');

        }

        Class = ya.$get(config.module || appNamespace, config.alias);
        opts = config.methods || {};

        opts.config = config;

        delete config.alias;
        delete config.module;
        delete config.methods;

        instance = Class.$create(opts);

        return instance;
    };

    /**
     *
     * @method $module
     * @static
     * @returns {string}
     */
    ya.$module = function () {
        var module = arguments.length ? arguments [0] : null;

        if (module) {
            appNamespace = module;
        }

        return appNamespace;

    };

    window.ya = ya;
}());