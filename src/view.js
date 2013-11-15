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
    window.ViewManager = {
        views: {},
        i: 0,
        add: function (id, view) {
            this.views[id] = view;
            this.i++;
        },
        get: function (id) {
            return this.views[id];
        }
    };
    window.ViewTemplateManager = {
        tpl: {},
        add: function (id, view) {
            this.tpl[id] = view;
        },
        get: function (id) {
            return this.tpl[id];
        }
    };
    /**
     *
     * @type {function}
     */
    window.View = Base.extend(function View(opts) {
        var config,
            opts = opts || {},
            id;
        config = opts.config || {};
        config.id = id = config.id || 'view-' + ViewManager.i;
        config.views = config.views || [];
        Base.prototype.constructor.call(this);
        this.set('initOpts', opts);
        this.set('config', config);
        this.bindMethods();
        this.initConfig();
        this.init();
        ViewManager.add(id, this);
    });
    /**
     *
     */
    window.View.prototype.initConfig = function () {
        var config = this.get('config'),
            div = document.createElement('div'),
            _tpl,
            tpl;
        if (!config.tpl) {
            throw new Error('no tpl set');
        }
        if (!ViewTemplateManager.get(config.tpl)) {
            _tpl = document.getElementById(config.tpl);
            ViewTemplateManager.add(config.tpl, _tpl.parentNode.removeChild(_tpl));
        }
        tpl = ViewTemplateManager.get(config.tpl).childNodes.item(1).cloneNode(true);
        div.appendChild(tpl);
        this.set('tpl', div);
    };
    /**
     *
     */
    window.View.prototype.init = function () {
    };
    /**
     *
     */
    window.View.prototype.bindMethods = function () {
        var initOpts = this.get('initOpts');
        for (var property in initOpts) {
            if (initOpts.hasOwnProperty(property) && typeof initOpts[property] === 'function') {
                this[property] = initOpts[property].bind(this);
            }
        }
    };
    /**
     *
     * @param data
     * @returns {Node}
     */
    window.View.prototype.render = function (data) {
        var tpl = this.get('tpl'),
            id = this.get('config').renderTo,
            model = data || this.get('config').models,
            parent,
            el,
            domToText;
        if (this.get('config').fullscreen) {
            parent = document.querySelectorAll(id).item(0);
        } else if (this.get('config').parent) {
            parent = this.get('config').parent.querySelectorAll(id).item(0);
        }
        if (model) {
            domToText = tpl.innerHTML;
            var headers = domToText.match(/\{\{(.*?)\}\}/gi);
            if (headers) {
                for (var i = 0, len = headers.length; i < len; i++) {
                    var fullHeader = headers[i],
                        header = fullHeader.substr(2, (fullHeader.length - 4));
                    if (model[header]) {
                        domToText = domToText.replace(fullHeader, model[header]);
                    }else{
                        domToText = domToText.replace(fullHeader, "inherit");
                    }
                }
            }
            tpl.innerHTML = domToText;
        }
        el = tpl.childNodes.item(0);

        this.set('el', el);
        this.set('isInDOM', true);
        if (parent) {
            parent.appendChild(el);
        }
        return tpl.childNodes.item(1);
    };
    /**
     *
     */
    window.View.prototype.removeChildren = function () {
        var views = this.get('config').views || [];
        for (var i = 0, len = views.length; i < len; i++) {
            views[i].clear();
        }
    };
    /**
     *
     */
    window.View.prototype.clear = function () {
        var el = this.get('el');
        if (this.isInDOM()) {
            el.parentNode.removeChild(el);
            this.set('isInDOM', false);
        }
    };
    window.View.prototype.isInDOM = function () {
        return this._isInDOM;
    }
}(window));