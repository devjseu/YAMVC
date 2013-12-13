/*
 The MIT License (MIT)

 Copyright (c) 2013 Sebastian Widelak

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


 */

/**
 *
 * ## Router
 * Router is used internally in controller, so don't instantiated it again.
 */
(function (window, undefined) {
    "use strict";

    /**
     * @constructor
     * @type {function}
     */
    window.Router = Base.extend(function Router() {
        Base.apply(this);
    });

    /**
     * Initialize router
     */
    Router.prototype.init = function () {
        this.set('routing', {});
        this.bindEvents();
    };

    /**
     * Bind all necessary events
     * @returns {Router}
     *
     */
    Router.prototype.bindEvents = function () {
        window.onhashchange = this.onHashChange.bind(this);
        return this;
    };

    /**
     * When hash change occurs match routes and run proper callback
     * @returns {Router}
     *
     */
    Router.prototype.onHashChange = function () {
        var routing = this.get('routing'),
            hash = window.location.hash.substr(1),
            paths = hash.split("/"),
            action = paths.shift();

        if (routing[action]) {
            var args = [];
            if (routing[action].params) {
                for (var i = 0, len = routing[action].params.length; i < len; i++) {
                    var param = routing[action].params[i],
                        hashParam = paths[i],
                        regEx = new RegExp(param.substr(1, param.length - 2));
                    args.push(hashParam.match(regEx).input);
                }
            }
            routing[action].callback.apply(null, args);
        }
        return this;
    };

    /**
     * Restore state
     *
     * @returns {Router}
     *
     */
    Router.prototype.restore = function () {
        this.onHashChange();
        return this;
    };

    /**
     * Define new route
     *
     * @param path
     * @param callback
     * @returns {Router}
     *
     */
    Router.prototype.when = function (path, callback) {
        var routing = this.get('routing'),
            paths = path.split("/"),
            action = paths.shift();
        routing[action] = {
            callback: callback,
            params: paths
        };
        this.set('routing', routing);
        return this;
    };

}(window));