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
(function (window, undefined) {

    var router = new window.Router;

    window.Controller = Base.extend(function Controller(opts) {
        var config;
        opts = opts || {};
        config = opts.config || {};
        Base.prototype.constructor.call(this);
        this.set('initOpts', opts);
        this.set('config', config);
        this.set('routes', config.routes || {});
        this.bindMethods();
        this.initConfig();
        this.init();
    });

    window.Controller.prototype.init = function () {

    };

    window.Controller.prototype.initConfig = function () {
        var routes = this.get('routes');
        if (routes) {
            for (var k in routes) {
                if (routes.hasOwnProperty(k)) {
                    var callback = this[routes[k]].bind(this);
                    router.when(k, callback);
                }
            }
        }
    };

    window.Controller.prototype.bindMethods = function () {
        var initOpts = this.get('initOpts');
        for (var property in initOpts) {
            if (initOpts.hasOwnProperty(property) && typeof initOpts[property] === 'function') {
                this[property] = initOpts[property].bind(this);
            }
        }
    };

    window.Controller.prototype.getRouter = function () {
        return router;
    };

}(window));