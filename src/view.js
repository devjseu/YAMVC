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
    var VTM;
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
    window.ViewTemplateManager = VTM = {
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
        Base.prototype.constructor.apply(this, arguments);
    });

    View.prototype.init = function (_opts) {
        var config,
            opts = _opts || {},
            id;
        config = opts.config || {};
        config.id = id = config.id || 'view-' + ViewManager.i;
        config.views = config.views || {};
        this.set('initOpts', opts);
        this.set('config', config);
        this.initConfig();
        ViewManager.add(id, this);
    };
    /**
     *
     */
    View.prototype.initConfig = function () {
        var me = this,
            config = me.get('config'),
            div = document.createElement('div'),
            _tpl,
            tpl;
        if (!config.tpl) {
            throw new Error('no tpl set');
        }
        if (!VTM.get(config.tpl)) {
            _tpl = document.getElementById(config.tpl);
            if (!_tpl)
                throw new Error('no tpl ' + config.tpl + ' found');
            VTM.add(config.tpl, _tpl.parentNode.removeChild(_tpl));
        }
        tpl = VTM.get(config.tpl).childNodes.item(1).cloneNode(true);
        div.appendChild(tpl);
        me.set('tpl', div);
    };
    /**
     *
     * @param data
     * @returns {Node}
     */
    View.prototype.render = function (data) {
        var me = this,
            tpl = me.get('tpl'),
            config = me.get('config'),
            id = config.renderTo,
            model = data || config.models,
            parent = config.parent,
            el,
            domToText;

        if (parent) {
            if (id) {
                parent = parent.querySelectorAll(id).item(0);
            } else {
                parent = parent.get('el');
            }
        } else {
            if (id) {
                parent = document.querySelectorAll(id).item(0);
            }
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
                    } else {
                        domToText = domToText.replace(fullHeader, "");
                    }
                }
            }
            tpl.innerHTML = domToText;
        }
        el = tpl.childNodes.item(0);
        el.setAttribute('yamvc-id', config.id);
        me.set('el', el);
        if (parent) {
            parent.appendChild(el);
            me.set('isInDOM', true);
            me.reAppendChildren();
        }
        return tpl.childNodes.item(0);
    };
    /**
     *
     */
    View.prototype.removeChildren = function () {
        var views = this.get('config').views || [];
        for (var i = 0, len = views.length; i < len; i++) {
            views[i].clear();
        }
    };
    /**
     *
     */
    View.prototype.clear = function () {
        var me = this, el = me.get('el');
        if (me.isInDOM()) {
            el.parentNode.removeChild(el);
            me.set('isInDOM', false);
        }
    };

    /**
     *
     * @returns {*}
     */
    View.prototype.isInDOM = function () {
        return this._isInDOM;
    };

    /**
     *
     * @param parent
     */
    View.prototype.appendTo = function (parent) {
        var me = this,
            config = me.get('config'),
            id = config.id,
            views = parent.get('config').views,
            parentEl = parent.get('el');
        if (config.parent && config.parent.get('config').id !== parent.get('config').id) {
            delete config.parent.get('config').views[id];
        }
        if (!me.isInDOM() && parent.isInDOM()) {
            if (!me.get('el')) {
                me.render();
            } else {
                parentEl.appendChild(me.get('el'));
                me.set('isInDOM', true);
                me.reAppendChildren();
            }
        }
        views[id] = me;
        config.parent = parent;
    };


    /**
     *
     */
    View.prototype.reAppendChildren = function () {
        var views = this.get('config').views;
        for (var key in views) {
            if (views.hasOwnProperty(key)) {
                views[key].appendTo(this);
            }
        }
    };

}(window));