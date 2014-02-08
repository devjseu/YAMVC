/**
 *
 * ## View Manager usage
 * View Manager is singleton object and helps to get proper view instance Cored on passed id
 *
 *      @example
 *      VM
 *          .get('layout')
 *          .render();
 *
 * ## Basic view
 * Views are an excellent way to bind template with the data from proper models.
 *
 *     @example
 *     var view = new View({
 *         config: {
 *             id: 'users',
 *             tpl: 'user-lists',
 *             models : window.users
 *             renderTo: '#body'
 *         }
 *     });
 *
 * ## Configuration properties
 *
 * @cfg config.id {String} Unique id of the view. If not passed id will be assigned automatically
 * @cfg config.tpl {String} Id of the template
 * @cfg config.models {String} Simple object storing appropriate data
 * @cfg config.renderTo {String} Selector to which view should be rendered
 *
 * ## Extending views
 * Views are easily expendable, so you can fell free to add more awesome functionality to it.
 *
 *     @example
 *     window.OverlayView = View.extend(function OverlayView(opts) {
 *         View.prototype.constructor.call(this, opts);
 *     });
 *     OverlayView.prototype.show = function (callback) {
 *         var me = this,
 *             dom = me.get('el'),
 *         config = me.get('config');
 *         if (me.get('isAnimated')) {
 *             jQuery(dom).stop();
 *         }
 *         me.set('isAnimated', true);
 *         jQuery(dom).css({
 *             display: 'block',
 *             opacity: 0
 *         }).animate({
 *             opacity: 1
 *         }, config.showDuration || 500, function () {
 *             me.set('isAnimated', false);
 *             if (callback)
 *                 callback(me, this);
 *             });
 *     };
 *
 *     OverlayView.prototype.hide = function (callback) {
 *             var me = this,
 *                 dom = me.get('el'),
 *                 config = me.get('config');
 *             if (me.get('isAnimated')) {
 *                 jQuery(dom).stop();
 *             }
 *             me.set('isAnimated', true);
 *             jQuery(dom).animate({
 *                 opacity: 0
 *             }, config.hideDuration || 500, function () {
 *                 jQuery(dom).css({
 *                     display: 'none'
 *                 });
 *                 me.set('isAnimated', false);
 *                 if (callback)
 *                     callback(me, this);
 *             });
 *     };
 *     var overlay = new OverlayView({
 *       config: {
 *          tpl: 'container',
 *          renderTo: '#body',
 *          models: window.models
 *     });
 *     overlay.render();
 *     overlay.show();
 *
 *
 */
(function (window, undefined) {
    "use strict";

    var yamvc = window.yamvc || {},
        VM,
        VTM,
        View,
        bindingId = 0;

    // Object that stores all views
    /**
     * @type {{views: {}, i: number, add: Function, get: Function}}
     */
    VM = {
        views: {},
        i: 0,
        // Add view to manager
        /**
         * @param id
         * @param view
         */
        add: function (id, view) {
            this.views[id] = view;
            this.i++;
        },
        // Get view by its id
        /**
         * @param id
         * @returns {View}
         */
        get: function (id) {
            return this.views[id];
        }
    };

    //Private object, keeps all templates in one place
    /**
     * @type {{tpl: {}, add: Function, get: Function}}
     */
    VTM = {
        tpl: {},
        add: function (id, view) {
            this.tpl[id] = view;
        },
        get: function (id) {
            return this.tpl[id];
        }
    };
    // Definition of View object
    /**
     * @constructor
     * @params opts Object with configuration properties
     * @type {function}
     */
    View = yamvc.Core.extend({
        // Initializing function in which we call parent method, merge previous
        // configuration with new one, set id of component, initialize config
        // and save reference to component in View Manager.
        /**
         *
         * @param opts
         * @returns {View}
         */
        init: function (opts) {
            yamvc.Core.prototype.init.apply(this);
            var me = this, config, id;
            opts = opts || {};
            config = yamvc.merge(me._config, opts.config);
            config.id = id = config.id || 'view-' + VM.i;
            config.views = config.views || {};
            me.set('initOpts', opts);
            me.set('config', config);
            me.initConfig();
            VM.add(id, me);
            return me;
        },
        /**
         * @returns {View}
         */
        initConfig: function () {
            yamvc.Core.prototype.initConfig.apply(this);
            this.initTemplate();
            this.initModels();
            return this;
        },
        /**
         * @returns {View}
         */
        initTemplate: function () {
            var me = this,
                config = me.get('config'),
                div = document.createElement('div'),
                _tpl;
            if (!config.tpl) {
                throw new Error(config.id + ': no tpl set');
            }
            if (!VTM.get(config.tpl)) {
                _tpl = document.getElementById(config.tpl);
                if (!_tpl)
                    throw new Error('no tpl ' + config.tpl + ' found');
                VTM.add(config.tpl, _tpl.parentNode.removeChild(_tpl));
            }
            div.innerHTML = VTM.get(config.tpl).innerHTML;
            me.set('tpl', div);
            return me;
        },
        /**
         * @returns {View}
         */
        initModels: function () {
            var me = this,
                models,
                model;
            if (!me.getModels) {
                return me;
            }

            models = me.getModels();
            for (model in models) {
                if (models.hasOwnProperty(model)) {
                    me.setModel(model, models[model]);
                }
            }
            return me;
        },
        /**
         * @returns {View}
         */
        setModel: function (namespace, model) {
            var me = this,
                models = me.getModels();
            models[model.getNamespace()] = model;
            me.setModels(models);
            return me;
        },
        /**
         * @param namespace
         * @returns {yamvc.Model}
         */
        getModel: function (namespace) {
            var me = this,
                models = me.getModels();
            return models[namespace];
        },
        /**
         * @param data
         * @returns {Node}
         */
        render: function (data) {
            var me = this,
                tpl = me.get('tpl'),
                parsedTpl = document.createElement('div'),
                config = me.get('config'),
                id = config.renderTo,
                models = data || config.models,
                parent = config.parent,
                parentView = config.parent,
                el,
                tag,
                headers,
                domToText;

            if (parent) {
                if (id && parent.queryEl(id)) {
                    parent = parent.queryEl(id);
                } else {
                    parent = parent.get('el');
                }
            } else {
                if (id) {
                    parent = document.querySelector(id);
                }
            }

            domToText = tpl.innerHTML;
            if (models) {
                headers = domToText.match(/\{\{(.*?)\}\}/gi);
                if (headers) {
                    for (var i = 0, len = headers.length; i < len; i++) {
                        var fullHeader = headers[i],
                            header = fullHeader.substr(2, (fullHeader.length - 4)).split('.');
                        if (
                            typeof models[header[0]] !== 'undefined' &&
                                typeof models[header[0]] !== 'function'
                            ) {
                            tag = models[header[0]].data(header[1]);
                            domToText = domToText.replace(fullHeader, tag);
                        } else {
                            domToText = domToText.replace(fullHeader, "");
                        }
                    }
                }
            }
            parsedTpl.innerHTML = domToText;
            var j = 0;
            while (j < tpl.childNodes.length && tpl.childNodes.item(j).nodeType !== 1) {
                j++;
            }
            el = parsedTpl.childNodes.item(j);
            el.setAttribute('yamvc-id', config.id);
            me.set('el', el);
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
         * @param selector
         * @returns {Node}
         */
        partialRender: function (selector) {
            var me = this,
                tpl = me.get('tpl'),
                elementTpl = tpl.querySelector(selector),
                element = me.queryEl(selector),
                domToText = elementTpl.innerHTML,
                models = me.getModels(),
                headers;

            headers = domToText.match(/\{\{(.*?)\}\}/gi);
            if (headers) {
                for (var i = 0, len = headers.length; i < len; i++) {
                    var fullHeader = headers[i],
                        header = fullHeader.substr(2, (fullHeader.length - 4)).split('.');
                    if (
                        typeof models[header[0]] !== 'undefined' &&
                            typeof models[header[0]] !== 'function'
                        ) {
                        domToText = domToText.replace(fullHeader, models[header[0]].data(header[1]));
                    } else {
                        domToText = domToText.replace(fullHeader, "");
                    }
                }
            }
            element.innerHTML = domToText;
            me.fireEvent('partialRender', null, me, element);
            return element;
        },
        /**
         * @param selector
         * @returns {Node}
         */
        queryEl: function (selector) {
            return this.get('el').querySelector(selector);
        },
        /**
         * @param selector
         * @returns {NodeList}
         */
        queryEls: function (selector) {
            return this.get('el').querySelectorAll(selector);
        },
        /**
         * @param id
         * @returns {View||Boolean}
         */
        getChild: function (id) {
            var me = this,
                config = me.get('config');
            if (!config.views || config.views && !config.views[id])
                return false;
            return config.views[id];
        },
        /**
         * @param view
         * @param selector
         * @returns {View}
         */
        addChild: function (view, selector) {
            var me = this;
            view.appendTo(me, selector);
            me.fireEvent('elementAdded', me, view);
            return me;
        },
        /**
         * @returns {View}
         */
        removeChildren: function () {
            var views = this.get('config').views || [];
            for (var i = 0, len = views.length; i < len; i++) {
                views[i].clear();
            }
            return this;
        },
        /**
         * @returns {View}
         */
        clear: function () {
            var me = this, el = me.get('el');
            if (me.isInDOM()) {
                el.parentNode.removeChild(el);
                me.set('isInDOM', false);
            }
            return me;
        },
        /**
         * @returns {Boolean}
         */
        isInDOM: function () {
            return this._isInDOM;
        },
        /**
         * @param parent
         * @param selector
         * @returns {View}
         */
        appendTo: function (parent, selector) {
            var me = this,
                config = me.get('config'),
                id = config.id,
                views = parent.get('config').views,
                parentEl = selector ? parent.get('el').querySelector(selector) : parent.get('el');

            if (selector) {
                config.renderTo = selector;
            }

            if (!config.parent) {
                config.parent = parent;
            }
            else if (config.parent && config.parent.get('config').id !== parent.get('config').id) {
                delete config.parent.get('config').views[id];
            }

            if (!me.isInDOM() && parent.isInDOM()) {
                if (!me.get('el')) {
                    me.render();
                } else {
                    parentEl.appendChild(me.get('el'));
                    me.set('isInDOM', true);
                    me.reAppendChildren();
                    me.fireEvent('render', null, me);
                }
            }
            views[id] = me;
            config.parent = parent;
            return me;
        },
        /**
         * @returns {View}
         */
        reAppendChildren: function () {
            var views = this.get('config').views;
            for (var key in views) {
                if (views.hasOwnProperty(key)) {
                    views[key].appendTo(this);
                }
            }
            return this;
        },
        /**
         * @returns {View}
         */
        show: function () {
            var me = this,
                style;
            if (!me.isInDOM())
                return me;
            style = me.get('el').style;
            style.display = 'block';
            me.set('visible', true);
            me.fireEvent('show', me, style);
            return me;
        },
        /**
         * @returns {View}
         */
        hide: function () {
            var me = this,
                style;
            if (!me.isInDOM())
                return me;
            style = me.get('el').style;
            style.display = 'none';
            me.set('visible', false);
            me.fireEvent('hide', me, style);
            return me;
        },
        /**
         * @returns {Boolean}
         */
        isVisible: function () {
            return this.get('visible') && this.isInDOM();
        }
    });


    yamvc.viewManager = VM;
    window.yamvc = yamvc;
    window.yamvc.backup = window.yamvc.backup || {};
    window.yamvc.backup.View = View;
}(window));