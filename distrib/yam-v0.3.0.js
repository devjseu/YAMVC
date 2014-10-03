/*! yam v0.3.0 - 2014-10-03 
 *  License:  */
/**
 Static object
 @module ya
 @main ya
 **/
(function (window, undefined) {
    'use strict';

    var ya = window.ya || {},
        appNamespace = 'app',
        onReadyCallbacks = [],
        readyStateCheckTimeout;

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
        checkState();
    };

    function checkState() {
        if (!readyStateCheckTimeout && document.readyState !== "complete") {
            readyStateCheckTimeout = setTimeout(function () {
                if (document.readyState === "complete") {
                    console.log('%cLOG: document ready!', 'backdround: green; color: white;');
                    run();
                } else {
                    readyStateCheckTimeout = null;
                    checkState();
                }
            }, 10);
        }
    }

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

                if (typeof obj2[property] !== 'undefined') {

                    obj1[property] = obj2[property];

                }
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
            className = arguments.length > 1 ? (module + '.' + namespace) : namespace,
            namespaces = namespace ? (
                namespace.search(/\./) > 0 ? namespace.split('.') : [namespace]
            ) : [],
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
                throw ya.Error.$create(
                    'ya.$get: Cannot find class: ' + className, 'GEN1'
                );

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

        if (!config.alias && !config.class) {

            throw ya.Error.$create('Factory method needs alias property', 'YA1');

        }

        if (config.class) {
            config.class = config.class.split('.');
            Class = ya.$get(config.class.shift(), config.class.join('.'));
        } else {
            Class = ya.$get(config.module || appNamespace, config.alias);

        }
        opts = config.methods || {};

        opts.config = config;

        delete config.alias;
        delete config.module;
        delete config.class;
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

    ya.$uuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    ya.$exec = function (fn) {
        return new Function('return ' + fn)();
    };

    window.ya = ya;
}(window));

/**
 * @namespace ya.mixins
 * @class Array
 */
ya.$set('ya', 'mixins.Array', {
    /**
     * Return an index of the record matched by key (or value)
     * @method find
     * @for ya.mixins.Array
     * @param array
     * @param key
     * @returns {Number}
     */
    find: function (array, key /*[, value]*/) {
        var len = array.length,
            argsLen = arguments.length,
            val = argsLen > 2 ? arguments[2] : null,
            tmp, rec;

        if (argsLen > 2) {

            while (len--) {

                rec = array[len];
                tmp = key.split('.');

                while (tmp.length) {

                    rec = rec[tmp.shift()];

                }

                if (rec === val) {
                    break;
                }
            }

        } else {

            while (len--) {

                rec = array[len];
                if (rec === key) {
                    break;
                }
            }

        }

        return len;
    },
    /**
     *
     * return an array of records matched by key (or value)
     * @method findAll
     * @for ya.mixins.Array
     * @param array
     * @param key
     * @returns {Array}
     */
    findAll: function (array, key /*[, value]*/) {
        var len = array.length,
            argsLen = arguments.length,
            val = argsLen > 2 ? arguments[2] : null,
            result = [],
            rec;

        while (len--) {

            rec = array[len];
            if (argsLen > 1) {

                if (rec[key] === val) {
                    result.push(len);
                }

            } else if (rec === key) {
                result.push(len);
            }
        }

        return result;
    },
    /**
     * use search function to return array of matched elements
     * @param array
     * @param {Function} fn
     * @returns {Array}
     */
    findAllByFn: function (array, fn) {
        var len = array.length,
            result = [];

        while (len--) {

            if (fn(array[len])) {

                result.push(len);

            }

        }

        return result;
    },
    /**
     * iterate trough each record in array
     * @method each
     * @for ya.mixins.Array
     * @param array
     * @param fun
     */
    each: Array.prototype.forEach ? function (array, fun) {
        Array.prototype.forEach.call(array, fun);
    } : function (array, fun) {

        if (array === void 0 || array === null)
            throw new TypeError();

        var t = Object(array);
        var len = t.length >>> 0;
        if (typeof fun !== "function")
            throw new TypeError();

        for (var i = 0; i < len; i++) {
            if (i in t)
                fun.call(array, t[i], i, t);
        }
    },
    /**
     * iterate trough each record in array until some
     * of iteration returns true
     * @method each
     * @for ya.mixins.Array
     * @param array
     * @param fun
     * @return boolean
     */
    some: Array.prototype.some ? function (array, fun) {
        return Array.prototype.some.call(array, fun);
    } : function (fun /*, thisArg */) {
        'use strict';

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function')
            throw new TypeError();

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t && fun.call(thisArg, t[i], i, t))
                return true;
        }

        return false;
    }
});

/**
 * @namespace ya.mixins
 * @class CoreStatic
 */
ya.$set('ya', 'mixins.CoreStatic', {
    /**
     * Creates definition of the new class based on old one
     * and parameters passed as argument
     * @method $extends
     * @for ya.mixins.CoreStatic
     * @param opts
     * @returns {Function}
     */
    $extend: function (opts) {
        opts = opts || {};

        var Parent = this,
            _super = this.prototype,
            mixins = (Parent.__mixins__ || []).concat(opts.mixins || []),
            statics = opts.static || {},
            fnTest = /xyz/.test(function () {
                var xyz;
            }) ? /\b__super\b/ : /.*/,
            makeSuper = function (name, fn) {
                return function () {

                    var tmp = this.__super;
                    this.__super = _super[name];
                    var ret = fn.apply(this, arguments);
                    this.__super = tmp;

                    return ret;
                };
            },
            __hasProp = {}.hasOwnProperty,
            __Object,
            __extends;

        __Object = function () {
            var defsArr = __Object.__defaults__,
                len = defsArr.length,
                i = 0, defs = {},
                def, key;
            //
            this._config = {};


            while (i < len) {

                def = defsArr[i];
                if (typeof def === 'function') {
                    def = def.call(this);
                }

                ya.$merge(defs, def);
                i++;
            }

            // Initialize defaults.
            for (key in defs) {
                if (__hasProp.call(defs, key)) this._config[key] = defs[key];
            }

            ya.Core.apply(this, arguments);
        };

        __extends = function (child, parent) {
            // inherited
            for (var key in parent) {
                if (__hasProp.call(parent, key)) child[key] = parent[key];
            }
            function Instance() {
                this.constructor = child;
            }

            Instance.prototype = parent.prototype;
            child.prototype = new Instance();
            child.prototype.__module__ = opts.module || ya.$module();
            child.prototype.__class__ = child.prototype.__module__ + '.' + opts.alias;

            for (var staticCore in ya.mixins.CoreStatic) {

                if (
                    ya
                        .mixins
                        .CoreStatic
                        .hasOwnProperty(staticCore)
                ) {
                    child[staticCore] = ya.mixins.CoreStatic[staticCore];
                }

            }

            for (var name in opts) {
                // Check if we're overwriting an existing function
                child.prototype[name] = typeof opts[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(opts[name]) ?
                    makeSuper(name, opts[name]) :
                    opts[name];
            }

            child.__mixins__ = mixins.slice();
            child.__defaults__ = parent.__defaults__.slice();
            if (opts.defaults) {

                child.__defaults__.push(opts.defaults);

            }

            // Add external mixins.
            while (mixins.length) {
                var mixin = mixins.pop();
                child.$mixin(mixin);
            }

            // Make method static.
            for (var stat in statics) {
                if (__hasProp.call(statics, stat)) {
                    child['$' + stat] = statics[stat];
                }
            }

            return child;
        };

        __extends(__Object, Parent);

        if (opts.alias) {

            ya.$set(opts.module || ya.$module(), opts.alias, opts.singleton ? __Object.$create() : __Object);

        }

        return __Object;
    },
    /**
     * Create an instance of class.
     * @method $create
     * @for ya.mixins.CoreStatic
     * @returns {Function}
     */
    $create: function () {
        /*jshint -W058 */
        var Obj = this,
            args = Array.prototype.concat.apply([Obj], arguments);

        return new (Function.prototype.bind.apply(Obj, args));
    },
    /**
     *
     * @method $create
     * @for ya.mixins.CoreStatic
     * @param obj
     * @param mixin
     * @returns {Function}
     */
    $mixin: function (obj, mixin) {
        var prototype,
            property;

        if (mixin) {
            prototype = typeof obj === 'function' ? obj.prototype : obj;
        } else {
            mixin = typeof obj === 'function' ? obj.prototype : obj;
            prototype = this.prototype;

        }

        for (property in mixin) {
            if (mixin.hasOwnProperty(property)) {
                prototype[property] = mixin[property];
            }
        }
    }
});
(function (undefined) {
    'use strict';

    var fillAttrs;

    function makeMap(str) {
        // Make object map from string.
        var obj = {}, items = str.split(",");
        for (var i = 0; i < items.length; i++)
            obj[items[i]] = true;
        return obj;
    }

    fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");


    /**
     * @namespace ya.mixins
     * @class CSSStyle
     */
    ya.$set('ya', 'mixins.CSSStyle', {
        isFillAttr: function (attr) {
            return typeof fillAttrs[attr] !== 'undefined';
        }
    });

}());
/**
 * @namespace ya.mixins
 * @class DOM
 */
ya.$set('ya', 'mixins.DOM', {
    findParent: function (el, selector) {
        var queryMatch = ya.mixins.DOM.isQueryMatch,
            parent = null;

        if (typeof selector !== 'string') {
            return null;
        }

        while (el.parentNode) {
            el = el.parentNode;
            if (queryMatch(selector, el)) {
                parent = el;
                break;
            }
        }


        return parent;
    },
    //todo: new function
    isChild: function (parent, child) {
        var isChild = false,
            walker, node;

        walker = document.createTreeWalker( // Create walker object and
            parent,
            NodeFilter.SHOW_ELEMENT,
            null,
            false
        );

        while (walker.nextNode()) {
            // walk through all nodes

            node = walker.currentNode;
            if (node === child) {
                isChild = true;
            }

        }


        return isChild;
    },
    /**
     * checks if passed selector match to root DOM element
     * @method isQueryMatch
     * @param selector String with selector
     * @param {HTMLElement} el DOM to match
     */
    isQueryMatch: function (selector, el) {
        var isElement = ya.mixins.DOM.isElement, match = true, tag, id, classes, _class;

        if (!isElement(el)) {
            match = false;
        }

        if (match && selector.search(" ") === -1) {
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

                    _class = classes
                        .pop()
                        .substring(1);

                    // check if the element have all of them.
                    if (
                        el
                            .classList && !el
                            .classList
                            .contains(
                            _class
                        )
                    ) {

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
/**
 * @namespace ya.mixins
 * @class GetSet
 */
ya.$set('ya', 'mixins.GetSet', {
    /**
     *
     * @param property
     * @param value
     * @returns {this}
     *
     */
    set: function (property, value) {
        var p = "_" + property,
            oldVal = this[p];
        if (value !== oldVal) {
            this[p] = value;
            this.fireEvent(property + 'Change', this, value, oldVal);
        }
        return this;
    },
    /**
     *
     * @param property
     * @returns {*}
     *
     */
    get: function (property) {
        return this["_" + property];
    }
});
ya.$set('ya', 'mixins.Object', {
    hash: function (s) {
        return s.split("").reduce(function (a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a
        }, 0);
    }
});
/**
 * @namespace ya.mixins
 * @class Observable
 */
ya.$set('ya', 'mixins.Observable', {
    /**
     * fire event
     * @returns {boolean}
     *
     */
    fireEvent: function (/** param1, ... */) {
        if (this._suspendEvents)
            return true;
        var ret = true,
            shift = Array.prototype.shift,
            evName = shift.call(arguments),
            listener;

        for (var i = 0, li = this._listeners[evName] || [], len = li.length; i < len; i++) {

            if (ret) {

                listener = li[i];
                ret = listener.apply(listener, arguments);
                ret = typeof ret === 'undefined' ? true : ret;
                if(listener.single) {
                    this.removeEventListener(evName, listener);
                }

            }

        }
        return ret;
    },

    /**
     * fire event
     * @param evName
     * @param callback
     * @param scope
     * @param single
     * @returns {this}
     *
     */
    addEventListener: function (evName, callback, scope, single) {
        var listeners = this._listeners[evName] || [];
        if(single) callback.single = true;
        listeners.push(scope ? callback.bind(scope) : callback);
        this._listeners[evName] = listeners;
        return this;
    },

    /**
     * fire event
     * @param evName
     * @param callback
     * @returns {this}
     *
     */
    removeEventListener: function (evName, callback) {
        var listeners = this._listeners[evName] || [],
            index;
        if (listeners) {
            if (callback) {
                if (typeof callback === "function") {
                    for (var i = 0, len = listeners.length; i < len; i++) {
                        if (listeners[i] === callback) {
                            index = i;
                        }
                    }
                } else {
                    index = callback;
                }
                listeners.splice(index, 1);
            } else {
                this._listeners[evName] = [];
            }
        }
        return this;
    },

    /**
     * suspend all events
     */
    suspendEvents: function () {
        var me = this;

        me.set('suspendEvents', (me._suspendEvents || 0) + 1);

        return this;
    },
    /**
     * resume all events
     */
    resumeEvents: function () {
        var me = this;

        me.set('suspendEvents', --me._suspendEvents);

        return me;
    }
});
ya.$set('ya', 'Core', (function () {
    "use strict";

    var ya = window.ya;

    /**
     * @namespace ya
     * @class Core
     * @constructor
     */
    function Core() {
        this.set('listeners', {});
        this.set('suspendEvents', false);
        this.bindMethods.apply(this, arguments);
        this.init.apply(this, arguments);
    }

    /**
     @method init
     @abstract
     */
    Core.prototype.init = function (opts) {
        return this
            .initConfig(opts)
            .initDefaults()
            .initRequired();
    };


    /**
     @method initDefaults
     */
    Core.prototype.initConfig = function (opts) {
        return this;
    };


    /**
     @method initDefaults
     */
    Core.prototype.initDefaults = function () {
        return this;
    };

    /**
     @method initRequired
     @abstract
     */
    Core.prototype.initRequired = function () {
        return this;
    };

    /**
     * Initialize getters and setters for each property passed
     * in `config` object.
     * To track changes assign an event on for ex. `propertyChange`
     * @example
     * var obj = ya.Core.$create({
     *   config : {
     *     value : true
     *   }
     * });
     *
     * obj.addEventListener(
     *   'valueChange',
     *   function () { alert('property changed!') }
     * );
     * @method initConfig
     * @chainable
     */
    Core.prototype.initConfig = function (opts) {
        var me = this,
            getter,
            setter,
            config,
            property,
            init = function (property) {
                getter = "get" + property.charAt(0).toUpperCase() + property.slice(1);
                setter = "set" + property.charAt(0).toUpperCase() + property.slice(1);
                me[getter] = function () {
                    return me.get('config')[property];
                };
                me[setter] = function (value) {
                    var oldVal = me.get('config')[property];
                    if (value !== oldVal) {
                        me.get('config')[property] = value;
                        me.fireEvent(property + 'Change', this, value, oldVal);
                    }

                    return this;
                };
            };

        opts = opts || {};
        config = ya.$merge(me._config, opts.config);

        me.set('initOpts', opts);
        me.set('config', config);

        for (property in config) {
            if (config.hasOwnProperty(property)) {
                init(property);
            }
        }

        return me;
    };

    // Binds custom methods from config object to class instance.
    /**
     * Include to newly created object dynamically defined methods
     * @method bindMethods
     * @param initOpts
     * @chainable
     */
    Core.prototype.bindMethods = function (initOpts) {
        var me = this;

        for (var property in initOpts) {
            if (initOpts.hasOwnProperty(property) && typeof initOpts[property] === 'function') {
                me[property] = initOpts[property].bind(me);
                delete initOpts[property];
            }
        }

        return me;
    };

    // Add callback to property change event.
    /**
     * @method onChange
     * @param property
     * @param callback
     * @chainable
     */
    Core.prototype.onChange = function (property, callback, single) {
        var me = this;

        me.addEventListener(property + 'Change', callback, me, single);

        return me;
    };

    // Unbind callback.
    /**
     * @method unbindOnChange
     * @param property
     * @param callback
     * @chainable
     */
    Core.prototype.unbindOnChange = function (property, callback) {
        var me = this,
            listeners = me._listeners[property + 'Change'] || [];
        for (var i = 0, len = listeners.length; i < len; i++) {
            if (listeners[i] === callback) {
                listeners.splice(i, 1);
            }
        }
        this._listeners[property + 'Change'] = listeners;

        return me;
    };

    Core.prototype.destroy = function () {
        var me = this,
            config = me._config,
            property;

        me.fireEvent('destroy', me);


        for (property in config) {
            if (config.hasOwnProperty(property)) {
                if (property !== 'id') {
                    config[property] = null;
                }
            }
        }


        for (property in me) {
            if (me.hasOwnProperty(property)) {
                if (property !== '_config') {
                    me[property] = null;
                }
            }
        }

        me._destroyed = true;

        return me;
    };

    // Stores all mixins initializing functions.
    Core.__mixins__ = [];

    // Stores all defaults.
    Core.__defaults__ = [];

    for (var staticCore in ya.mixins.CoreStatic) {

        if (ya.mixins.CoreStatic.hasOwnProperty(staticCore)) {
            Core[staticCore] = ya.mixins.CoreStatic[staticCore];
        }

    }

    // Add Getters and Setters.
    Core.$mixin(ya.mixins.GetSet);

    /**
     * @method set
     * @param property
     * @param value
     * @chainable
     */

    /**
     * @method get
     * @param property
     * @returns {*} value stored under passed property
     */

        // Add observable methods.
    Core.$mixin(ya.mixins.Observable);

    return Core;
}()));
/**
 * @namespace ya
 * @class Error
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Error',
    defaults: {
        id: null,
        message: null,
        stack: null
    },
    /**
     * @method
     * @param msg
     * @param id
     */
    init: function (msg, id) {
        var me = this;

        me
            .initConfig(arguments)
            .initDefaults();
    },
    /**
     *
     * @method
     * @param opts
     * @returns {*}
     */
    initConfig: function (opts) {
        var me = this;

        me.__super({
            config: {
                message: opts[0],
                id: opts[1]
            }
        });

        return me;
    },
    /**
     *
     * @method
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        me.setStack((new Error(me.getMessage())).stack);

        // Compatibility with native exception
        me.id = me.getId();
        me.message = me.getMessage();
        me.stack = me.getStack();

        return me;
    },
    toString: function () {
        var me = this;

        return 'ya.Error(' + me.getId() + '): ' + me.getMessage();
    }
});
/**
 * @namespace ya
 * @class Manager
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Manager',
    defaults: {
        items: null,
        id: null
    },
    mixins: [
        ya.mixins.Array
    ],
    /**
     *
     * @method
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        me.setItems([]);
        me.setId(0);

        return me;
    },
    getItem: function (id) {
        var me = this,
            items = me.getItems(),
            find;

        find = me
            .find(items, 'id', id);

        return find > -1 ? items[find].item : null;
    },
    getCount: function () {
        return this.getItems().length;
    },
    getUniqueId: function () {
        return this._config.id++;
    },
    register: function (id, item) {
        var me = this;

        if (
            !me.isRegistered(id)
        ) {

            me.getItems().push({id: id, item: item});
            me.fireEvent('registered', item);

        } else {

            throw ya.Error.$create(this.__class__ + ': ID ' + id + ' already registered.', 'YVTM1');

        }

        return me;

    },
    deregister: function (id) {
        var me = this,
            items = me.getItems(),
            find;

        find = me.find(items, 'id', id);

        //todo bug

        if (find > -1) {

            me.fireEvent('unregistered', items.splice(find, 1));

        }

        return me;
    },
    /**
     *
     * @param id
     * @returns {boolean}
     */
    isRegistered: function (id) {
        return this.find(this.getItems(), 'id', id) > -1;
    }
});
/**
 * Static objects which store all of the initialized collections
 * @namespace ya
 * @class collection.$manager
 * @extends ya.Manager
 */
ya.Manager.$extend({
    module: 'ya',
    alias: 'collection.$manager',
    singleton: true
});
/**
 * Static objects which store all of the initialized controllers
 * @namespace ya
 * @class controller.$manager
 * @extends ya.Manager
 */
ya.Manager.$extend({
    module: 'ya',
    alias: 'controller.$manager',
    singleton: true
});
/**
 * @namespace ya
 * @class view.$manager
 * @extends ya.Manager
 */
ya.Manager.$extend({
    module: 'ya',
    alias: 'view.$manager',
    singleton: true
});
/**
 * @namespace ya
 * @class view.template.$manager
 * @extends ya.Manager
 */
ya.Manager.$extend({
    module: 'ya',
    alias: 'view.template.$manager',
    singleton: true
});
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
/**
 * @namespace ya
 * @class Ajax
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Ajax',
    static: {
        pause: false
    },
    /**
     * return default configuration object
     * @returns {{url: null, method: string, promise: *, XhrInstance: *, mimeType: string, responseType: string, params: null, request: null}}
     */
    defaults: function () {
        return {
            url: null,
            method: 'GET',
            promise: ya.$promise.deferred(),
            XhrInstance: ya.$get('XMLHttpRequest'),
            mimeType: 'text\/plain',
            responseType: 'text',
            params: null,
            request: null
        }
    },
    onProgress: function () {
    },
    onComplete: function () {
    },
    onError: function () {
    },
    onAbort: function () {
    },
    getResponse: function () {
        return this._response || this.getRequest().response;
    },
    doFallback: function () {
    },
    /**
     *
     * @returns {ya.Promise}
     */
    doIt: function () {
        var me = this,
            deferred = me.getPromise(),
            XhrInstance = me.getXhrInstance(),
            oReq = new XhrInstance(),
            method = me.getMethod(),
            url = me.getUrl(),
            mimeType = me.getMimeType(),
            responseType = me.getResponseType(),
            params = me.getParams(),
            data = null;

        if (
            ya
                .Ajax
                .$pause
        ) {
            return;
        }

        if (method !== 'GET') {

            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    if (!data) {
                        data = new FormData();
                    }
                    data.append(key, params[key]);
                }
            }

        }

        oReq
            .open(
            method,
            url,
            true
        );

        try {

            oReq
                .overrideMimeType(
                mimeType + "; charset=x-user-defined"
            );

            oReq
                .responseType = responseType;

            if (
                oReq
                    .responseType
                !==
                responseType
            ) {
                throw ya.Error.$create('Setting response type not supported');
            }

        } catch (e) {
            me.set('notSupportedReqType', true);
        }


        oReq
            .addEventListener(
            "progress",
            function (e) {

                me
                    .onProgress(e);

                deferred
                    .notify({
                        scope: me,
                        value: e
                    });
            },
            false
        );

        oReq
            .addEventListener(
            "load",
            function (e) {

                me
                    .onComplete(e);

                deferred
                    .resolve({
                        scope: me,
                        value: e
                    });

                if (me._notSupportedReqType) {
                    me.doFallback();
                }
            },
            false
        );

        oReq
            .addEventListener(
            "error",
            function (e) {

                me
                    .onError(e);

                deferred
                    .reject(ya.Error.$create('Error during sending the data to ' + me.getUrl()));
            },
            false
        );

        oReq
            .addEventListener(
            "abort",
            function (e) {

                me
                    .onAbort(e);

                deferred
                    .reject(ya.Error.$create('Error during sending the data to ' + me.getUrl()));
            },
            false
        );

        oReq
            .send(data);

        me.setRequest(oReq);

        return deferred.promise;
    }
});
/**
 * @namespace ya
 * @class ajax.JSON
 * @extends ya.Ajax
 */
ya.Ajax.$extend({
    module: 'ya',
    alias: 'ajax.JSON',
    defaults: function () {
        return {
            mimeType: 'application\/json',
            responseType: 'json'
        }
    },
    doFallback: function () {
        var me = this,
            req = me.getRequest();

        me.set('response', JSON.parse(req.responseText));

    }
});
/**
 * @namespace ya
 * @class Collection
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Collection',
    defaults: {
        id: null,
        /**
         * @attribute config.namespace
         * @type String Namespace of collection
         * @required
         */
        namespace: null,
        /**
         * @attribute config.model
         * @type ya.Model Model instance
         * @required
         */
        model: null,
        /**
         * @attribute config.namespace
         * @type ya.data.Proxy Instance of proxy for transferring data
         * @required
         */
        proxy: null,
        /**
         * @attribute config.remote
         * @type boolean if true search will be perform
         */
        remote: false
    },
    /**
     * initialize collection
     * @method init
     * @param opts
     */
    init: function (opts) {
        var me = this;

        me
            .__super(opts)
            .initData();

        ya.collection
            .$manager
            .register(
            me.getId(),
            me
        );

        return me;
    },
    /**
     * @method init
     * @returns {*}
     */
    initDefaults: function () {
        var me = this,
            model = me.getModel();

        me.setId(me.getId() || 'collection-' + ya.collection.$manager.getCount());

        if (typeof model === 'string') {
            model = ya.$get(model);
        }


        me.setModel(model || ya.$get('ya.Model'));

        me.set('set', []);
        me.set('cache', []);
        me.set('removed', []);
        me.set('filters', []);
        me.set('sorters', []);
        me.set('raw', me.getData() || []);

        return me;
    },
    /**
     * @method initData
     * initialize data
     */
    initData: function () {
        var me = this;

        me.prepareData(me._raw);

        return me;
    },
    /**
     * @method each
     * @param fn
     * @chainable
     */
    each: function (fn) {
        var me = this,
            records = me._set,
            t, len;

        t = Object(records);
        len = t.length >>> 0;
        if (typeof fn !== "function")
            throw ya.Error.$create('forEach argument should be a function', 'COL1');

        for (var i = 0; i < len; i++) {
            if (i in t)
                fn.call(me, t[i], i, t);
        }

        return me;
    },
    /**
     * @method push
     * @param records
     * @returns {*}
     * @chainable
     */
    push: function (records) {
        var me = this,
            record, raw,
            ModelDefinition = me.getModel(),
            namespace = me.getNamespace(),
            newRecords = [];

        if (!Array.isArray(records)) {
            records = [records];
        }

        while (records.length) {

            raw = record = records.shift();

            if (record) {

                if (!(record instanceof ModelDefinition)) {
                    record = new ModelDefinition(
                        {
                            config: {
                                namespace: namespace,
                                data: record
                            }
                        }
                    );
                }

                if (
                    record
                        .getNamespace() !==
                    me
                        .getNamespace()
                ) {

                    throw ya
                        .Error
                        .$create(
                        'Model should have same namespace as collection',
                        'COL2'
                    );

                }

                me
                    ._raw
                    .push(raw);

                me
                    ._cache
                    .push(record);

                newRecords
                    .push(record);
            }

        }

        me.suspendEvents();
        me.filter();
        me.sort();
        me.resumeEvents();
        me.fireEvent('push', me, newRecords);

        return me;
    },
    /**
     *
     * @param records
     * @returns {*}
     */
    remove: function (records) {
        var me = this,
            __some = ya.mixins.Array.some,
            removed = [],
            someFn, rec, idx;

        someFn = function (r, i) {

            if (r._clientId === rec._clientId) {
                idx = i;
                return true;
            }

            if (
                (
                r.data(r.getIdProperty()) && r.data(rec.getIdProperty())
                ) &&
                r.data(r.getIdProperty()) === r.data(rec.getIdProperty())
            ) {
                idx = i;
                return true;
            }

        };

        if (!Array.isArray(records)) {
            records = [records];
        }

        while (records.length) {

            rec = records.pop();
            idx = -1;
            __some(me._cache, someFn);

            if (idx >= 0) {

                me._raw.splice(idx, 1);
                removed.push(me._cache.splice(idx, 1).pop());

            }

        }

        me.suspendEvents();
        me.filter();
        me.resumeEvents();

        me.fireEvent('remove', me, removed);

        return me;
    },
    removeByField: function (field, record) {
        var me = this,
            records = me
                .getBy(function (r) {
                    return r.data(field) === record.data(key)
                });

        me
            .remove(records);

        return me;
    },
    /**
     *
     * @returns {Array}
     */
    removeAll: function () {
        var me = this,
            removed = me._cache.slice();

        me.set('set', []);
        me.set('cache', []);
        me.set('raw', []);
        me.fireEvent('remove', me, removed);

        return me;
    },
    /**
     * return number of records in collection
     *
     * @method count
     * @chainable
     * @returns {Number}
     */
    count: function () {
        return this._set.length;
    },
    /**
     * @method clearFilters
     * @chainable
     * @returns {*}
     */
    clear: function () {
        var me = this;

        me.set('set', []);
        me.set('cache', []);
        me.set('raw', []);
        me.set('removed', []);

        me.fireEvent('clear', me);

        return me;
    },
    /**
     *
     * @method filter
     * @param fn
     * @returns {*}
     * @chainable
     */
    filter: function (fn) {
        var me = this,
            filters = me._filters,
            filterFn,
            passed = true,
            filtered = [],
            records = me._cache,
            len = 0,
            id = null;

        if (arguments.length > 1) {
            id = arguments[0];
            fn = arguments[1];
        }


        if (typeof fn === 'function') {

            if (id) {

                filters.push({
                    id: id,
                    fn: fn
                });

            } else {

                filters.push(fn);

            }

            me.fireEvent('beforeFilter', me, filters);

        }

        for (var i = 0, l = records.length; i < l; i++) {

            passed = true;
            len = filters.length;
            while (len--) {

                filterFn = typeof filters[len] === 'function' ? filters[len] : filters[len].fn;
                passed = passed && filterFn(records[i]);

            }

            if (passed) {

                filtered.push(records[i]);

            }

        }

        me.set('set', filtered);
        me.set('total', filtered.length);
        me.fireEvent('filter', me, filters);

        return me;
    },
    /**
     * @method clearFilters
     * @returns {*}
     * @chainable
     */
    clearFilters: function () {
        var me = this;

        //TODO: clear by multiple filters id
        me.set('filters', []);
        me.set('set', me._cache);
        me.fireEvent('filter', me, []);

        return me;
    },
    /**
     *
     * @method clearFilter
     * @param id
     * @returns {*}
     * @chainable
     */
    clearFilter: function (id) {
        var me = this,
            filters = me._filters,
            len,
            filter;

        len = filters.length;
        while (len--) {

            filter = filters[len];
            if (typeof filter !== 'function' && filter.id === id) {

                filters.splice(len, 1);

                break;

            }

        }

        me.filter();

        return me;
    },
    /**
     *
     * @param sorters
     */
    sort: function (sorters) {
        var me = this,
            records = me._set,
            sorterFn, len, sorter, property, order;

        sorters = sorters ? me._sorters.concat(sorters) : me._sorters;
        me._sorters = me._sorters.concat(sorters);

        sorterFn = function (a, b) {
            var va = "" + a.data(property),
                vb = "" + b.data(property),
                alc = va.toLowerCase(),
                blc = vb.toLowerCase();

            return (alc > blc ? 1 : alc < blc ? -1 : va > vb ? 1 : va < vb ? -1 : 0) * (order.toLowerCase() === 'desc' ? -1 : 1);
        };

        len = sorters.length;
        while (len--) {
            sorter = sorters[len];
            property = sorter[0];
            order = sorter[1] || 'ASC';
            records.sort(sorterFn);
        }

        me.fireEvent('sort', me, sorters);
    },
    /**
     *
     * @returns {*}
     */
    clearSorters: function () {
        var me = this;

        //TODO: clear by multiple filters id
        me.set('sorters', []);
        me.sort();

        return me;
    },
    /**
     * get record at
     * @method getAt
     * @param index
     * @returns {ya.Model}
     */
    getAt: function (index) { // Return record by index.
        return this._set[index];
    },
    /**
     * @method getBy
     * @param fn
     * @returns {Array}
     */
    getBy: function (fn) { // Return all matched record.
        var me = this,
            records = me._set,
            filtered = [];

        for (var i = 0, l = records.length; i < l; i++) {

            if (fn(records[i])) {

                filtered.push(records[i]);

            }

        }
        return filtered;
    },
    /**
     * Return index of first matched record.
     * @param fn
     * @returns {Number}
     */
    findOneBy: function (fn) { //
        var me = this,
            records = me._set,
            len = records.length,
            i = 0,
            founded = -1;

        while (i < len) {

            if (fn(records[i])) {
                founded = i;
                break;
            }

            i++;
        } //todo: need to be changed in library

        return founded;
    },
    /**
     *
     * @returns {boolean}
     */
    contains: function (field, value) {
        var me = this,
            contains = false;

        me.each(function (r) {
            if (r.data(field) === value) {
                contains = true;
            }
        });

        return contains;
    },
    /**
     * @param fn
     * @returns {Array}
     */
    getOneBy: function (fn) { // Return first matched record.
        var me = this,
            records = me._set,
            record,
            i = 0, len = records.length;

        while (i < len) {

            if (fn(records[i])) {
                record = records[i];
                break;

            }

            i++;
        }

        return record;
    },
    /**
     * return real number of records
     * @returns {Number}
     */
    getTotal: function () {
        return this._total;
    },
    /**
     * load data
     * proxy need to be set
     * @param params
     */
    load: function (params) {
        var me = this,
            deferred = ya.$promise.deferred(),
            namespace = me.getNamespace(),
            action = ya.data.Action.$create(),
            callback,
            key, i = 0;

        for (key in params) i++;

        if (
            i === 0
        )
            throw ya.Error.$create('You need to pass at least one condition to load model collection', 'COL3');

        if (!me.getProxy())
            throw ya.Error.$create('To load collection you need to set proxy', 'COL4');


        callback = function () {

            if (action.getStatus() === 'success') {

                me.fireEvent('load', me, action.getResponse(), 'read');
                me.setData(action.getData());

            } else {

                me.fireEvent('error', me, 'read');

            }
        };

        action
            .setOptions({
                callback: callback,
                params: params,
                namespace: namespace
            });

        me
            .getProxy()
            .read(action);

        return deferred.promise;
    },
    /**
     *
     * @returns {promise|*|promise|Function|Promise|promise}
     */
    save: function () {
        var me = this,
            deferred = ya.$promise.deferred(),
            action,
            toCreate = [],
            toUpdate = [],
            toRemove = me._removed,
            records = me._cache,
            namespace = me.getNamespace(),
            proxy = me.getProxy(),
            toFinish = 0,
            exceptions = [],
            callback,
            record,
            byIdFn;

        for (var i = 0, l = records.length; i < l; i++) {

            record = records[i];
            if (record._isDirty) {

                if (record.hasId()) {

                    toUpdate.push(record._data);

                } else {

                    record._data.__clientId__ = record.get('clientId');
                    toCreate.push(record._data);

                }
            }

        }

        byIdFn = function (record) {
            return function (_record) {
                return record.__clientId__ ?
                _record.data('__clientId__') === record.__clientId__ :
                _record.data('id') === record.id;
            };
        };

        callback = function (proxy, action) {

            toFinish--;

            if (action.getStatus() === ya.data.Action.$status.SUCCESS) {

                var response = action.getResponse(),
                    data = response.result,
                    len;

                record = data[0];
                len = data.length;

                // If record has __clientId__ property it's create process
                // or if it has id it's an update.
                if (record && (record.__clientId__ || record.id)) {

                    while (len--) {

                        record = me.getOneBy(byIdFn(data[len]));
                        record.setDirty(false);

                        delete record._data.__clientId__;

                    }

                } else { // Else it's remove process.

                    me.set('removed', []);

                }

            } else {

                exceptions.push(action.getResponse().error);

            }

            if (toFinish === 0) {

                if (exceptions.length) {

                    me.fireEvent('error', me, exceptions);

                    deferred.reject({
                        errors: exceptions
                    });

                } else {

                    me.fireEvent('save', me);

                    deferred.resolve({scope: me});

                }

            }

        };

        if (toCreate.length) {

            toFinish++;

            action = ya.data.Action.$create();

            action
                .setOptions({
                    namespace: namespace,
                    callback: callback
                })
                .setData(toCreate);

            proxy.create(action);

        }

        if (toUpdate.length) {

            toFinish++;

            action = ya.data.Action.$create();

            action
                .setOptions({
                    namespace: namespace,
                    callback: callback
                })
                .setData(toUpdate);

            proxy.update(action);
        }

        if (toRemove.length) {

            toFinish++;

            action = ya.data.Action.$create();

            action
                .setOptions({
                    namespace: namespace,
                    callback: callback
                })
                .setData(toRemove);

            proxy.destroy(action);
        }

        return deferred.promise;
    },
    /**
     * Prepare data
     * @private
     * @param data
     * @returns {Collection}
     */
    prepareData: function (data) {
        var me = this,
            ModelInstance = me.getModel(),
            modelConfig = {namespace: me.getNamespace()},
            l = data.length,
            models = [];

        for (var i = 0; i < l; i++) {

            modelConfig.data = data[i];
            models.push(new ModelInstance({
                config: modelConfig
            }));

        }

        me.set('cache', models);

        me.suspendEvents(true);
        me.filter();
        me.sort();
        me.resumeEvents();
        me.fireEvent('prepare');

        return me;
    },
    setData: function () {
        var me = this;

        me.setRawData(data);
        me.prepareData(data);

        return me;
    },
    getData: function () {
        return this._set;
    },
    getRawData: function () {
        return this._raw;
    },
    setRawData: function (data) {

        this.set('raw', data);

        return this;
    },
    isDirty: function () {
        var records = this._cache,
            len = records.length,
            isDirty = false;

        while (len--) {
            if (records[len]._isDirty) {
                isDirty = true;
            }
        }

        if (this._remove) {
            isDirty = true;
        }

        return isDirty;
    }
});
/**
 * @description
 * ## Basic controller usage
 *
 *     @example
 *     var ctl = ya.Controller.$create({
 *         config: {
 *             name: 'Main',
 *             routes: {
 *                 "page/{\\d+}": 'onPageChange'
 *             },
 *             events : {
 *                  '$layout .btn-right' : 'onNextPage',
 *                  '$layout .btn-eft' : 'onPrevPage'
 *             }
 *         },
 *         onPageChange: function (id) {
 *             // changing page mechanism
 *         },
 *         nextPage: function () {
 *             // changing page mechanism
 *         },
 *         prevPage: function () {
 *             // changing page mechanism
 *         }
 *     });
 * @namespace ya
 * @class Controller
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Controller',
    defaults: {
        id: null,
        routes: null,
        events: null
    },
    static: {
        router: null,
        getRouter: function () {
            return ya.Controller.$router = ya.Controller.$router || new ya.Router();
        }
    },
    init: function (opts) {
        var me = this;

        me
            .__super(opts)
            .initEvents()
            .initRoutes();

        ya
            .controller
            .$manager
            .register(
            me.getId(),
            me
        );

        ya
            .$onReady(
            function () {
                me.restoreRouter();
            }
        );

        return me;
    },
    /**
     * @method initDefaults
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        me.setId(
            me.getId() ||
            'controller-' + ya
                .controller
                .$manager
                .getCount()
        );

        me
            .set(
            'router',
            ya.Controller.$getRouter()
        );

        me
            .set(
            'dispatcher',
            ya.event.$dispatcher
        );

        return me;
    },
    /**
     * @method initEvents
     * @private
     * @returns {this}
     */
    initEvents: function () {
        var me = this,
            events = me.getEvents(),
            views = [],
            rx = new RegExp('\\$([^\\s]+)'),
            rx2 = new RegExp('[id|class]+:([^\\s]+)'),
            dispatcher = me._dispatcher,
            matches, view, l, obj, current;

        if (events) {

            for (var query in events) {

                if (events.hasOwnProperty(query)) {

                    obj = {};
                    obj[query] = current = events[query];

                    for (var e in current) {

                        if (current.hasOwnProperty(e)) {

                            if (typeof current[e] !== 'function') {

                                current[e] = me[current[e]];

                            }

                        }

                    }

                    dispatcher.add(me, obj);

                    matches = query.match(rx) || query.match(rx2);
                    if (matches) {

                        if (views.indexOf(matches[1]) < 0) {

                            views.push(matches[1]);

                        }

                    } else {

                        throw ya.Error.$create(
                            me.__class__ + ': Event query should begin from id or class name of the view (current query: ' + query + ')', 'CTRL1'
                        );

                    }

                }

            }

            l = views.length;
            while (l--) {

                view = ya
                    .view.$manager
                    .getItem(views[l]);

                if (view) {

                    if (view.isInDOM()) {

                        me.resolveEvents(view);

                    }
//                    else {
//
//                        view.addEventListener('render', me.resolveEvents, me);
//
//                    }

                }
            }

        }

        return me;
    },
    /**
     * @method initRoutes
     * @private
     * @returns {this}
     */
    initRoutes: function () {
        var me = this,
            routes = me.getRoutes(),
            router = me._router;

        if (routes) {
            for (var k in routes) {
                if (routes.hasOwnProperty(k)) {
                    var callback = me[routes[k]].bind(me);
                    router.when(k, callback);
                }
            }
        }

        return me;
    },
    /**
     * @method resolveEvents
     * @private
     * @returns {this}
     */
    resolveEvents: function (view) {
        var events = this.getEvents(),
            newScope = function (func, scope, arg, arg2) {
                return func.bind(scope, arg, arg2);
            },
            rx = new RegExp('\\$([^\\s]+)'),
            matches,
            viewEvents,
            elements,
            selector,
            scope;


        for (var query in events) {
            if (events.hasOwnProperty(query)) {

                matches = query.match(rx);

                if (matches && matches[1] === view.getId()) {
                    viewEvents = events[query];
                    selector = query.split(" ").slice(1);
                    if (selector.length) {

                        elements = view.get('el').querySelectorAll(selector.join(" "));

                    } else {

                        elements = [view.get('el')];

                    }

                    for (var i = 0, l = elements.length; i < l; i++) {

                        for (var event in viewEvents) {

                            if (viewEvents.hasOwnProperty(event)) {

                                scope = newScope(viewEvents[event], this, view, elements[i]);

                                elements[i].addEventListener(event, scope);

                            }

                        }

                    }
                }


            }

        }

    },
    /**
     * Returns router object
     * @method getView
     * @returns {*}
     */
    getRouter: function () {
        return this._router;
    },
    /**
     * Returns view by id
     * @method getView
     * @returns {*}
     */
    getView: function (id) {
        return ya.view.$manager.getItem(id);
    },
    /**
     * Returns controller by id
     * @method getController
     * @returns {*}
     */
    getController: function (id) {
        return ya.controller.$manager.getItem(id);
    },
    /**
     * Returns collection by id
     * @method getCollection
     * @returns {*}
     */
    getCollection: function (id) {
        return ya.collection.$manager.getItem(id);
    },
    /**
     * Restores router state
     * @method restoreRouter
     * @private
     * @returns {*}
     */
    restoreRouter: function () {
        var me = this;

        me.getRouter().restore();

        return me;
    },
    /**
     * Redirect application to passed path
     * @param path
     * @returns {*}
     */
    redirectTo: function (path) {

        window.location.hash = path;

        return this;
    }
});
/**
 * @namespace ya
 * @class data.Action
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'data.Action',
    static: {
        status: {
            PENDING: 0,
            SUCCESS: 1,
            FAIL: 2
        }
    },
    initDefaults: function () {
        var me = this;

        me.set('response', {});
        me.set('results', null);
        me.set('status', ya.data.Action.$status.PENDING);

        return me;
    },
    /**
     * @methods init
     * @param data
     * @returns {*}
     */
    setData: function (data) {
        return this.set('data', data);
    },
    /**
     * @methods getData
     * @returns {Function}
     */
    getData: function () {
        return this._data;
    },
    /**
     * @methods setOptions
     * @param opts
     * @returns {*}
     */
    setOptions: function (opts) {
        return this.set('options', opts);
    },
    /**
     * @methods getOptions
     * @returns {Object}
     */
    getOptions: function () {
        return this._options;
    },
    /**
     * @methods getOption
     * @param name
     * @returns {*}
     */
    getOption: function (name) {
        return this._options[name];
    },
    /**
     * @methods setResponse
     * @param response
     * @returns {*|StyleSheet|this|set}
     */
    setResponse: function (response) {
        return this.set('response', response);
    },
    /**
     * @methods getResponse
     * @returns {Object}
     */
    getResponse: function () {
        return this._response;
    },
    setResultSet: function (results) {
        return this.set('results', results);
    },
    getResultSet: function () {
        return this._results;
    },
    /**
     * @methods setStatus
     * @param status
     * @returns {Number}
     */
    setStatus: function (status) {
        var statuses = ya.data.Action.$status,
            check = false, st;

        for (st in statuses) {
            if (statuses.hasOwnProperty(st) && statuses[st] === status)
                check = true;
        }

        if (!check)
            throw ya.Error.$create('ya.data.Action: Wrong status', 'ACTION1');

        return this.set('status', status);
    },
    /**
     * @methods getStatus
     * @returns {Object}
     */
    getStatus: function () {
        return this.get('status');
    }
});
/**
 * Proxy (which follow crud principles) allow you to retrieve the data from
 * different sources. Basic proxy class provides only some abstraction and need to be
 * extend.
 * @namespace ya.data
 * @class Proxy
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'data.Proxy',
    /**
     * @methods read
     * @param action
     * @returns {*}
     */
    read: function (action) {
        var me = this,
            opts,
            id;

        if (!(action instanceof ya.data.Action))
            throw ya.Error.$create('ya.data.Proxy: read argument action should be instance of ya.data.Action');

        opts = action.getOptions();
        id = opts.params && opts.params.id;

        if (!action.getOption('namespace'))
            throw ya.Error.$create('ya.data.Proxy: namespace should be set');

        if (typeof id === 'undefined') {
            me.readBy(action);
        } else {
            me.readById(action);
        }

        return me;
    },
    /**
     * @methods create
     * @param action
     * @returns {*}
     */
    create: function (action) {
        var me = this;

        if (!(action instanceof ya.data.Action))
            throw ya.Error.$create('ya.data.Proxy: create argument action should be instance of ya.data.Action');

        if (!action.getOption('namespace'))
            throw ya.Error.$create('ya.data.Proxy: namespace should be set');

        if (!action.getData() || typeof action.getData() !== 'object')
            throw ya.Error.$create('ya.data.Proxy: Data should be object');

        return me;
    },
    /**
     * @methods update
     * @param action
     * @returns {*}
     */
    update: function (action) {
        var me = this;

        if (!(action instanceof ya.data.Action))
            throw ya.Error.$create('ya.data.Proxy: update argument action should be instance of ya.data.Action');

        if (!action.getOption('namespace'))
            throw ya.Error.$create('ya.data.Proxy: namespace should be set');

        if (!action.getData() || typeof action.getData() !== 'object')
            throw ya.Error.$create('ya.data.Proxy: Data should be object');

        return me;
    },
    /**
     * @methods destroy
     * @param action
     * @returns {*}
     */
    destroy: function (action) {
        var me = this;

        if (!(action instanceof ya.data.Action))
            throw ya.Error.$create('ya.data.Proxy: destroy argument action should be instance of ya.data.Action');

        if (!action.getOption('namespace'))
            throw ya.Error.$create('ya.data.Proxy: namespace should be set');

        if (!action.getData() || typeof action.getData() !== 'object')
            throw ya.Error.$create('Data should be pass as object');

        return me;
    }
});
/**
 * @description
 * ## LocalStorage
 *   Proxy provides access to localStorage object. Gives possibility to retrieve data
 *   by id or trough parameters.
 * @namespace ya.data.proxy
 * @class LocalStorage
 * @extends ya.data.Proxy
 */
ya.data.Proxy.$extend({
    module: 'ya',
    alias: 'data.proxy.LocalStorage',
    static: {
        /**
         *
         * @param tables
         */
        clear: function (tables) {
            var len = 0, table;
            if (!tables) {
                for (var store in localStorage) {
                    delete localStorage[store];
                    delete localStorage[store + '$Sequence'];
                }
            } else {
                if (!Array.isArray(tables)) {
                    tables = [tables];
                }
                len = tables.length;
                while (len--) {
                    table = tables[len];
                    delete localStorage[table];
                    delete localStorage[table + '$Sequence'];
                }
            }
        }
    },
    /**
     * @method readBy
     * @param action
     * @returns {LocalStorage}
     */
    readBy: function (action) {
        var me = this,
            opts = action.getOptions(),
            namespace = opts.namespace,
            callback = opts.callback,
            limit = opts.limit || null,
            offset = opts.offset || 0,
            filters = opts.filters || [],
            sorters = opts.sorters || [],
            response = {},
            filtered = [],
            records = [],
            meet = true,
            total = 0,
            async,
            operator,
            property,
            sorter,
            sorterFn,
            order,
            len;

        sorterFn = function (a, b) {
            var va = "" + a[property],
                vb = "" + b[property],
                alc = va.toLowerCase(), blc = vb.toLowerCase();
            return (alc > blc ? 1 : alc < blc ? -1 : va > vb ? 1 : va < vb ? -1 : 0) * (order.toLowerCase() === 'desc' ? -1 : 1);
        };

        async = function () {

            if (localStorage[namespace]) {
                records = JSON.parse(localStorage[namespace]);

                // firstly we need to filter records
                for (var i = 0, l = records.length; i < l; i++) {
                    meet = true;
                    len = filters.length;
                    while (len--) {
                        if (filters[len].length > 3) {
                            operator = filters[len][0];
                        } else {
                            operator = '&&';
                        }
                        if (operator === '&&') {
                            meet = me.executeCondition(records[i], filters[len]) && meet;
                        } else if (operator === '||') {
                            meet = me.executeCondition(records[i], filters[len]) || meet;
                        }
                    }

                    if (meet) {
                        filtered.push(records[i]);
                    }

                }

                records = filtered;
                total = filtered.length;

                // next we do sorting
                len = sorters.length;
                while (len--) {
                    sorter = sorters[len];
                    property = sorter[0];
                    order = sorter[1] || 'ASC';
                    records.sort(sorterFn);
                }
                // and take care about offset and limit
                if (!limit) {
                    limit = records.length - offset;
                }

                if (offset > 0 || limit) {
                    records = records.splice(offset, limit);
                }
            }

            response.total = total;
            response.result = records;

            action
                .setStatus(ya.data.Action.$status.SUCCESS)
                .setResponse(response);

            callback(me, action);

        };

        setTimeout(function () {

            try {

                async();

            } catch (e) {

                response.error = e;
                callback(me, action);

            }
        }, 0);

        return me;
    },
    /**
     *
     * @method readById
     * @param action
     * @returns {LocalStorage}
     */
    readById: function (action) {
        var me = this,
            opts = action.getOptions(),
            params = opts.params,
            namespace = opts.namespace,
            callback = opts.callback,
            id = params.id,
            records = [],
            result = {},
            response = {},
            async;

        async = function () {

            if (localStorage[namespace]) {

                records = JSON.parse(localStorage[namespace]);
                for (var i = 0, l = records.length; i < l; i++) {

                    if (records[i].id === id) {
                        result = records[i];
                    }

                }

                if (typeof result.id !== 'undefined') {

                    response.total = 1;
                    response.result = result;

                    action
                        .setStatus(ya.data.Action.$status.SUCCESS)
                        .setResponse(response);

                    callback(me, action);

                    return me;
                }
            }


            response.error = ya.Error.$create('Not found', 'APP_NAMESPACE_NOT_FOUND');
            action
                .setStatus(
                ya
                    .data
                    .Action
                    .$status
                    .FAIL
            )
                .setResponse(response);

            callback(me, action);
        };

        setTimeout(async, 0);

        return me;
    },
    /**
     * @methods create
     * @param action
     * @returns {LocalStorage}
     */
    create: function (action) {
        var me = this,
            data = action.getData(),
            namespace = action.getOption('namespace'),
            callback = action.getOption('callback'),
            records = [],
            sequence = 1,
            response = {},
            result,
            async;

        me.__super.apply(this, arguments);

        if (localStorage[namespace]) {

            records = JSON.parse(localStorage[namespace]);
            sequence = localStorage[namespace + "$Sequence"];

        }

        if (Array.isArray(data)) {

            result = [];
            for (var i = 0, l = data.length; i < l; i++) {

                // Add id to the new record,
                data[i].id = sequence++;

                // remove client id,
                delete data[i].__clientId__;

                // push to records
                records.push(data[i]);

                // and to return array.
                result.push(data[i]);
            }

        } else {

            data.id = sequence++;

            delete data.__clientId__;

            records.push(data);

            result = data;

        }

        async = function () {
            try {

                localStorage[namespace] = JSON.stringify(records);
                localStorage[namespace + "$Sequence"] = sequence;

                response.result = result;

                action
                    .setStatus(ya.data.Action.$status.SUCCESS)
                    .setResponse(response);

            } catch (e) {

                response.error = e;

                action
                    .setStatus(ya.data.Action.$status.FAIL)
                    .setResponse(response);

            }

            callback(me, action);
        };

        setTimeout(async, 0);

        return me;
    },
    /**
     * @methods update
     * @param action
     * @returns {LocalStorage}
     */
    update: function (action) { //
        var me = this,
            data = action.getData(),
            namespace = action.getOption('namespace'),
            callback = action.getOption('callback'),
            records = [],
            result,
            response = {},
            id, l, l2, async, match;

        async = function () { // update record asynchronously

            records = JSON.parse(localStorage[namespace] || '[]');

            if (Array.isArray(data)) {

                result = [];
                l = data.length;
                while (l--) {
                    l2 = records.length;
                    id = data[l].id;
                    match = false;
                    while (l2--) {
                        if (records[l2].id === id) {
                            records[l2] = data[l];
                            result.splice(0, 0, data[l]);
                            match = true;
                        }
                    }
                    if (!match) {

                        records.push(data[l]);
                        result.splice(0, 0, data[l]);

                    }
                }

            } else {
                l = records.length;
                id = data.id;
                match = false;
                while (l--) {
                    if (records[l].id === id) {
                        match = true;
                        result = records[l] = data;

                    }
                }

                if (!match) {
                    records.push(data);
                    result = data;
                }

            }

            try {

                localStorage[namespace] = JSON.stringify(records);
                response.success = true;
                response.result = result;

                action
                    .setStatus(ya.data.Action.$status.SUCCESS)
                    .setResponse(response);

            } catch (e) {

                response.success = false;
                response.error = e;

                action
                    .setStatus(ya.data.Action.$status.FAIL)
                    .setResponse(response);

            }

            callback(me, action);

            return me;
        };

        setTimeout(async, 0);
        return me;
    },
    /**
     * @methods destroy
     * @param action
     * @returns {LocalStorage}
     */
    destroy: function (action) {
        var me = this,
            data = action.getData(),
            namespace = action.getOption('namespace'),
            callback = action.getOption('callback'),
            records = [],
            response = {},
            id, l, l2, async;

        async = function () {

            if (localStorage[namespace]) {

                records = JSON.parse(localStorage[namespace]);

                if (Array.isArray(data)) {

                    l = data.length;
                    while (l--) {
                        l2 = records.length;
                        id = data[l].id;
                        while (l2--) {
                            if (records[l2].id === id) {
                                records.splice(l2, 1);
                            }
                        }
                    }

                } else {

                    l = records.length;
                    id = data.id;
                    while (l--) {
                        if (records[l].id === id) {
                            records.splice(l, 1);
                        }
                    }

                }

                try {

                    localStorage[namespace] = JSON.stringify(records);
                    response.success = true;

                    action
                        .setStatus(ya.data.Action.$status.SUCCESS)
                        .setResponse(response);

                } catch (e) {

                    response.success = false;
                    response.error = e;

                    action
                        .setStatus(ya.data.Action.$status.FAIL)
                        .setResponse(response);

                }
                callback(me, action);
                return me;
            }

            response.success = false;
            response.error = ya.Error.$create("Not found");

            action
                .setStatus(ya.data.Action.$status.FAIL)
                .setResponse(response);

            callback(me, action);

        };

        setTimeout(async, 0);

        return me;
    },
    /**
     * @methods executeCondition
     * @param record
     * @param filter
     * @returns {boolean}
     */
    executeCondition: function (record, filter) {
        var result = false, condition, property, value, regex;
        if (filter.length > 3) {
            property = filter[1];
            condition = filter[2];
            value = filter[3];
        } else {
            property = filter[0];
            condition = filter[1];
            value = filter[2];
        }
        switch (condition) {
            case '>' :
                if (record[property] > value) {
                    result = true;
                }
                break;
            case '<' :
                if (record[property] < value) {
                    result = true;
                }
                break;
            case '>=' :
                if (record[property] >= value) {
                    result = true;
                }
                break;
            case '<=' :
                if (record[property] <= value) {
                    result = true;
                }
                break;
            case 'like' :
                if (value.charAt(0) !== '%') {
                    value = "^" + value;
                }
                if (value.charAt(value.length - 1) !== '%') {
                    value = value + "$";
                }
                value = value.replace(/%/g, "");
                regex = new RegExp(value);
                if (regex.test(record[property])) {
                    result = true;
                }
                break;
        }
        return result;
    }
});
/**
 * Dispatcher class allow you to delegates events across
 * newly generated views
 * @namespace ya
 * @class event.$dispatcher
 * @extends ya.Core
 * @static
 */
ya.Core.$extend({
    module: 'ya',
    singleton: true,
    alias: 'event.$dispatcher',
    defaults: {
        delegates: null
    },
    /**
     * @methods initDefaults
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        // set defaults.
        me.setDelegates([]);

        return me;
    },
    /**
     * @methods add
     * @param scope
     * @param e
     * @returns {Dispatcher}
     */
    add: function (scope, e) {
        var me = this,
            selector = Object.keys(e).pop();

        me.getDelegates().push({
            selector: selector,
            scope: scope,
            events: e[selector]
        });

        return me;
    },
    /**
     * @methods apply
     * @methods apply
     * @param view
     */
    apply: function (view) {
        // Apply delegated events.
        var me = this,
        // Get all delegated events.
            delegates = me.getDelegates(),
        // Define array in which matched events from delegation array
        // will be stored.
            matchPos = [],
        // Cache new view in other variable.
            newView = view,
        // Define array for elements which match to last part
        // of query from delegated event object
            els = [],
        // Function which will be used to match if there are any
        // delegated events for particular view.
            matchIdFn = function (r) {

                return r.selector.search(regExp) >= 0;

            },
            isQueryMatch = ya.mixins.DOM.isQueryMatch,
            __findAllByFn = ya.mixins.Array.findAllByFn,
            __each = ya.mixins.Array.each,
        // Other variables which need to be defined.
            selector, delegate, regExp, cpSelector, e;


        while (view) {
            // If view is not null define regexp for
            // searching view id in delegated event
            // query.
            regExp = view.hasCustomId() ?
                new RegExp('^\\$' + view.getId() + "[\\s]") :
                new RegExp('^class:' + view.__class__ + "[\\s]");

            // Get position for events which were matched.
            matchPos = __findAllByFn(delegates, matchIdFn);
            if (matchPos.length) {
                /*jshint -W083 */
                // If we found any events which need to be delegated,
                __each(matchPos, function (r) {
                    // iterate through all of them.
                    // At first step clear the array of elements
                    els.length = 0;

                    delegate = delegates[r];
                    //
                    selector = delegate
                        .selector
                        .split(" ");
                    // Remove item id from selectors array.
                    selector.shift();

                    if (selector.length) {
                        // If still something left get last part
                        // from query and search in the new view
                        // elements which could match to the selector.
                        var last = selector.pop();
                        els = newView.querySelectorAll(last);

                        // Copy array with rest of them
                        cpSelector = selector.slice();
                        __each(els, function (el) {
                            // and iterate through all founded elements.
                            if (cpSelector.length) {

                                var node = el,
                                    lastSelector = cpSelector.pop();
                                while (view.getId() !== node.getAttribute('id')) {

                                    if (isQueryMatch(lastSelector, node)) {

                                        if (cpSelector.length === 0) {

                                            me.assignEvents(el, delegate, view);

                                            break;
                                        }
                                        lastSelector = cpSelector.pop();

                                    }
                                    node = node.parentNode;

                                }

                            } else {

                                me.assignEvents(el, delegate, view);

                            }

                        });

                    }

                });

            }

            view = view.getParent();


        }


    },
    assignEvents: function (el, delegate, view) {
        var e = delegate.events,
            eType, eHand, eHandLen, exists = false;

        for (eType in e) {

            if (e.hasOwnProperty(eType)) {


                eHandLen = view._eventHandlers.length;
                while(eHandLen--){
                    eHand = view._eventHandlers[eHandLen];
                    if(
                        eHand.event === eType &&
                        eHand.el === el &&
                        eHand.listener === e[eType] &&
                        eHand.scope === delegate.scope
                    ) {
                        exists = true;
                    }
                }

                if(!exists){

                    // todo: pass element to which event was bind as 2th argument
                    el.addEventListener(eType, e[eType].bind(delegate.scope, view, el), false);
                    view.get('eventHandlers').push({
                        event: eType,
                        listener: e[eType],
                        scope: delegate.scope,
                        el: el
                    });

                }

            }

        }
    },
    /**
     * Clear delegates array
     * @returns {Dispatcher}
     */
    clear: function () {
        this.getDelegates().length = 0;
        return this;
    }
});
/**
 * @namespace ya
 * @class ya.Job
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Job',
    static: {
        id: 0,
        INFINITY: 'infinity'
    },
    defaults: function () {
        return {
            id: null,
            delay: 0,
            tasks: null,
            repeat: 1,
            spawn: false,
            results: null,
            maxTime: null
        };
    },
    /**
     *
     * @method initRequired
     * @returns {*}
     */
    initRequired: function () {
        var me = this;

        if (!me.getTasks() && !me._config.task) {

            throw ya.Error.$create('At least one task should be defined', 'YJ1', (new Error).stack);

        }

        return me;
    },
    /**
     *
     * @method initDefaults
     * @returns {*}
     */
    initDefaults: function () {
        var me = this,
            config = me._config,
            tasks = config.tasks || [],
            task = config.task;

        if (task) {

            tasks.push(task);

        }

        me.setId(ya.Job.$id++);
        me.setTasks(tasks.reverse());
        me.setResults([]);
        me.set('semaphore', tasks.length);

        return me;
    },
    doIt: function () {
        var me = this,
            deferred = ya.$promise.deferred(),
            engine, fn, taskIdx;

        engine = me.getRepeat() > 1 || me.getRepeat() === ya.Job.$INFINITY ?
        {
            terminate: function (code, msg) {

                console.log('%cLOG: TERMINATE: ' + me.__class__, 'color: red; background: silver;');
                clearInterval(me._clear);

                return deferred.reject(ya.Error.$create(msg, code));
            }
        } :
        {
            terminate: function (code, msg) {

                console.log('%cLOG: TERMINATE: ' + me.__class__, 'color: red; background: silver;');
                clearInterval(me._clear);

                return deferred.reject(ya.Error.$create(msg, code));
            }
        };

        engine.run = function (a, b) {
            me.set('clear', setInterval(a, b));
        };

        engine.finish = function () {

            me.getTasks().splice(taskIdx, 1);

            me._semaphore--;

            if (me._semaphore === 0 || me.getRepeat() < 0) {

                clearInterval(me._clear);

                return deferred.resolve({
                    success: true,
                    message: 'Task finished',
                    results: me.getResults()
                });

            }


        };

        engine.suspend = function () {

            clearInterval(me._clear);

        };

        fn = function () {
            var repeat = me.getRepeat(),
                tasks = me.getTasks(),
                maxTime = me.getMaxTime(),
                results = [],
                i;

            if (
                maxTime &&
                (+new Date() - me._start) > maxTime
            ) {

                return engine.terminate('YJ3', 'Timeout', (new Error).stack);

            }
            if (repeat !== ya.Job.$INFINITY) {

                me.setRepeat(--repeat);
                if (repeat < 0) {

                    engine.finish();

                }

            }

            i = tasks.length;
            while (i--) {

                taskIdx = i;
                results.push(tasks[i].call(engine, engine));

            }

            me.getResults().push(results);

        };

        me.set('engine', engine);
        me.set('start', +new Date());

        engine.run(fn, me.getDelay());

        return deferred.promise;
    },
    terminate: function () {

        return this
            ._engine
            .terminate(
            'YJ2',
            'Task terminated after ' + ((+new Date() - this._start) / 1000) + ' seconds of execution',
            (new Error).stack
        );

    }
});
/**
 * @namespace ya
 * @class Model
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Model',
    static: {
        id: 0,
        /**
         * @for Model
         * @method $idGenerator
         * @static
         * @returns {number}
         */
        idGenerator: function () {
            return ya.Model.$id++;
        }
    },
    defaults: {
        /**
         * @attribute config.idProperty
         * @type String key under which id is stored
         * @default id
         * @required
         */
        idProperty: 'id',
        /**
         * @attribute config.proxy
         * @type ya.data.Proxy
         */
        proxy: null,
        /**
         * @attribute config.namespace
         * @type String tell us what type of data is stored in model, can be the same us ex. table name in database
         * @default id
         * @required
         */
        namespace: null,
        /**
         * @attribute config.data
         * @type Array stores raw data
         * @default {}
         * @required
         */
        data: null
    },
    /**
     * @method initRequired
     * @returns {*}
     */
    initRequired: function () {
        var me = this;

        if (!me.getNamespace()) {

            throw ya.Error.$create("Model need to has a namespace");

        }

        return me;
    },
    /**
     * @method initDefaults
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        me.set('isDirty', true);
        me.set('clientId', me.getNamespace() + '-' + ya.Model.$idGenerator());
        me.set('data', me.getData() || {});

        return me;
    },
    /**
     * @method setDataProperty
     * @param property
     * @param value
     */
    setDataProperty: function (property, value) {
        var me = this,
            data = me._data,
            oldVal = data[property];

        if (value !== oldVal) {

            data[property] = value;

            me.set('isDirty', true);
            me.fireEvent('data' + property.charAt(0).toUpperCase() + property.slice(1) + 'Change', me, value, oldVal);
            me.fireEvent('dataChange', me, data);

        }
    },
    /**
     * @method getDataProperty
     * @param property
     * @returns {*}
     */
    getDataProperty: function (property) {
        var value = this.get('data')[property];

        if (typeof value === "undefined") {
            value = "";
        }

        return value;
    },
    /**
     * @method data
     * @param property name of property in data
     * @param data Optional | if passed data will be set
     * @returns {*}
     *
     */
    data: function (property, data) {
        // `data` function is an alias for `setDataProperty` and `getDataProperty` methods.
        // If two arguments are passed data will be set and
        // in other case data will be returned.
        var me = this,
            len = arguments.length,
            key;

        if (len > 1) {

            this.setDataProperty.apply(this, arguments);

        } else {

            if (typeof property === 'object') {

                for (key in property) {

                    if (property.hasOwnProperty(key)) {

                        me.setDataProperty(key, property[key]);

                    }

                }

            } else {
                return this.getDataProperty.apply(this, arguments);
            }

        }

        return me;
    },
    /**
     * @method clear
     */
    clear: function () {
        var me = this,
            data = me.get('data'),
            key;

        for (key in data) {
            if (data.hasOwnProperty(key)) {
                me.data(key, null);
            }
        }
        me.fireEvent('dataChange', me, data);
    },
    /**
     * @method load
     * @param params
     */
    load: function (params) {
        var me = this,
            data = me.get('data'),
            idProperty = me.getIdProperty(),
            deferred = ya.$promise.deferred(),
            action = new ya.data.Action(),
            opts = {},
            response;

        if (
            typeof params[idProperty] === 'undefined' &&
            typeof data[idProperty] === 'undefined'
        )
            throw ya.Error.$create('You need to pass id to load model');

        params[idProperty] = data[idProperty];

        opts.namespace = me.getNamespace();
        opts.params = params;
        opts.callback = function () {

            response = action
                .getResponse();

            if (
                action
                    .getStatus() === ya
                    .data
                    .Action
                    .$status
                    .SUCCESS
            ) {

                me
                    .set(
                    'isDirty',
                    false
                );

                me
                    .set(
                    'data',
                    response
                        .result
                );

                deferred
                    .resolve({
                        scope: me,
                        response: response,
                        action: 'read'
                    });

                me
                    .fireEvent(
                    'loaded',
                    me,
                    response,
                    'read'
                );

            } else {

                deferred
                    .reject({
                        scope: me,
                        response: response,
                        action: 'read'
                    });

                me
                    .fireEvent(
                    'error',
                    me,
                    response,
                    'read'
                );

            }

        };

        action.setOptions(opts);

        me.getProxy().read(action);

        return deferred.promise;
    },
    /**
     * @method save
     * @returns {boolean}
     */
    save: function () {
        var me = this,
            data = me.get('data'),
            idProperty = me.getIdProperty(),
            deferred = ya.$promise.deferred(),
            action = new ya.data.Action(),
            proxy = me.getProxy(),
            opts = {},
            response,
            type;

        if (me.get('isProcessing') || !me.get('isDirty')) {
            return false;
        }

        me.set('isProcessing', true);

        opts.namespace = me.getNamespace();
        opts.callback = function (proxy, action) {

            response = action.getResponse();

            me.set('isProcessing', false);
            if (action.getStatus() === ya.data.Action.$status.SUCCESS) {

                me.set('isDirty', false);
                me.set('data', response.result);

                deferred.resolve({scope: me, action: action, type: type});
                me.fireEvent('saved', me, action, type);

            } else {

                deferred.reject({scope: me, action: action, type: type});
                me.fireEvent('error', me, action, type);

            }

        };

        action
            .setOptions(opts)
            .setData(data);

        if (typeof data[idProperty] === 'undefined') {

            type = 'create';
            proxy.create(action);

        } else {

            type = 'update';
            proxy.update(action);

        }

        return deferred.promise;
    },
    /**
     * @method remove
     */
    remove: function () {
        var me = this,
            data = me.get('data'),
            idProperty = me.getIdProperty(),
            deferred = ya.$promise.deferred(),
            action = new ya.data.Action(),
            proxy = me.getProxy(),
            opts = {},
            response;

        if (typeof data[idProperty] === 'undefined')
            throw ya.Error.$create('Can not remove empty model');

        opts.namespace = me.getNamespace();
        opts.callback = function (proxy, action) {

            response = action.getResponse();

            if (action.getStatus() === ya.data.Action.$status.SUCCESS) {

                me.set('isDirty', false);
                me.set('data', {});

                deferred.resolve({scope: me, action: action, type: 'remove'});
                me.fireEvent('removed', me, 'remove');

            } else {

                deferred.reject({scope: me, action: action, type: 'remove'});
                me.fireEvent('error', me, 'remove');

            }

        };

        action
            .setOptions(opts)
            .setData(data);

        proxy.destroy(action);
        proxy.destroy(action);

        return deferred.promise;
    },
    /**
     * @method hasId
     * @returns {boolean}
     */
    hasId: function () {
        return !!this._data[this._config.idProperty];
    },
    /**
     * @method setDirty
     * @param dirty
     * @returns {*}
     */
    setDirty: function (dirty) {
        this.set('isDirty', !!dirty);
        return this;
    },
    /**
     * @method isDirty
     * @returns {*}
     */
    isDirty: function () {
        return this._isDirty;
    }
});
/**
 * @namespace ya
 * @class Module
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Module',
    defaults: function () {
        return {
            configs: null,
            launcher: true,
            delay: 16,
            maxLoadingTime: 10000,
            module: null,
            requires: [],
            modules: [],
            bus: {}
        };
    },
    /**
     * @method init
     * @param opts
     * @returns {*}
     */
    init: function (opts) {

        return this
            .__super(opts)
            .initDependencies();
    },
    /**
     *
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        me.setModule(me.getModule() || me.__module__);
        me.set('initialized', []);

        return me.__super();
    },
    /**
     *
     * @returns {*}
     */
    initRequired: function () {
        var me = this;

        if (!me.getModule()) {
            throw ya.Error.$create(me.__class__ + ': Module name is required', 'YM1');
        }

        return me;
    },
    /**
     * init required dependencies
     * @returns {*}
     */
    initDependencies: function () {
        var me = this,
            tasks = [],
            modLen = me.getModules().length,
            reqLen = me.getRequires().length,
            job;

        console.log('%cLOG: initDependencies: ' + me.__class__, 'color: yellow; background: green;');

        tasks.push(function (engine) {
            // terminate function if no modules need to be included
            if (modLen + reqLen === 0) {

                engine.finish();
                return me;

            }

            if(reqLen) {
                me.initRequires(engine);
            }

            if(modLen) {
                me.initModules(engine);
            }
        });

        job = ya.Job.$create({
            config: {
                tasks: tasks,
                delay: me.getDelay(),
                repeat: ya.Job.$INFINITY,
                maxTime: me.getMaxLoadingTime()
            }
        });


        job
            .doIt()
            .then(function () {

                me.continueInit();

            })
            ["catch"](function (e) {
            if (me._unresolved.length) {
                console.warn('Can\'t resolve class ' + me._unresolved.join(', '));
            }
            me.onError.apply(me, arguments);

        });

        return me;
    },
    initRequires: function (engine) {
        var me = this,
            __each = ya.mixins.Array.each,
            requires = me.getRequires(),
            len = requires.length,
            isReady = true, i = 0, initialized = [], config = {}, configs = null, unresolved = [], require = null,
            resolveParams, args, className, params, instance, requireName;

        resolveParams = function (param) {
            configs = me.getConfigs();
            config = configs ? (configs[className] ? configs[className] : {}) : {};

            switch (param) {
                case '-i' :

                    console.log('%cINIT: ' + me.__class__ + ':' + className, 'background: yellow; color: black;');

                    initialized
                        .push(
                        require
                            .$create({
                                config: config
                            })
                    );

                    break;
                case '-p' :

                    args.push(require);

                    break;
                case '-ip' :

                    instance = require
                        .$create({
                            config: config
                        });

                    args
                        .push(instance);
                    initialized
                        .push(instance);

                    break;

            }
        };


        while (i < len) {

            requireName = me.getModule() + '.' + requires[i].split(" ").shift();

            try {

                require = ya.$get(
                    requireName
                );

            } catch (e) {

                require = null;

            }

            if (require === null) {
                isReady = false;
                unresolved.push(requireName);
            }

            i++;
        }

        //todo
        me.set('unresolved', unresolved);

        if (isReady) {

            args = [];
            i = 0;
            while (i < len) {

                require = requires[i].split(" ");
                className = require.shift();
                params = require.join("").match(/-(\w+)/g);

                require = ya.$get(
                    me.getModule() + '.' + className
                );

                if (params) {

                    try {

                        __each(params, resolveParams);

                    } catch (e) {

                        engine.terminate(e.id, e.message, e.stack);
                        break;

                    }

                }

                i++;
            }

            me.set('initialized', me._initialized.concat(initialized));
            me.set('args', args);

            engine.finish();

        }

        return me;
    },
    initModules: function (engine) {
        var me = this,
            __each = ya.mixins.Array.each,
            modules = me.getModules(),
            len = modules.length,
            isReady = true, i = 0, module = null, initialized = [], semaphore = 0, unresolved = [],
            className, params, moduleName, configs = null, config;

        /**
         * Callback which tells engine to stop particular task
         */
        function onReady() {

            semaphore--;


            if (semaphore === 0) {

                engine.finish();

            }

        }

        /**
         * Helper function for resolving parameters.
         * Instantiate the module.
         * @param param
         */
        function resolveParams(param) {

            switch (param) {
                case '-i' :

                    configs = me.getConfigs();
                    config = configs && configs[moduleName] || {};
                    config.launcher = false;

                    initialized.push(
                        module
                            .$create({
                                config: config
                            })
                            .addEventListener('ready', onReady)
                    );

                    semaphore++;

                    break;

            }

        }

        while (i < len) {

            moduleName = modules[i].split(" ").shift();

            try {

                module = ya.$get(
                    moduleName
                );

            } catch (e) {

                module = null;

            }

            if (module === null) {
                isReady = false;
                unresolved.push(moduleName);
            }

            i++;
        }

        //todo
        me.set('unresolved', unresolved);

        if (isReady) {

            engine.suspend();

            i = 0;
            while (i < len) {

                module = modules[i].split(" ");
                moduleName = module.shift();
                className = moduleName + ".Module";
                params = module.join("").match(/-(\w+)/g);

                module = ya.$get(
                    me.getModule() + '.' + className
                );

                if (params) {

                    // if we have any parameters

                    try {

                        //try to resolve it
                        __each(params, resolveParams);

                    } catch (e) {

                        // if any error occurred terminate the task
                        // and return reason of that
                        //todo
                        engine
                            .terminate(
                            e.getId() || e.id,
                            e.getMessage() || e.message,
                            e.getStack() || e.stack
                        );
                        break;

                    }

                }

                i++;
            }

            me.set('initialized', me._initialized.concat(initialized));

        }

        return me;
    },
    continueInit: function () {
        var me = this;

        // initialize bus communication between
        // different objects
        me
            .initBus()
            .fireEvent('ready', me);

        //
        me
            .onReady
            .apply(me, me._args);


        if (me.getLauncher()) {

            me
                .notifyChildren();

        }

        return me;
    },
    initBus: function () {
        var me = this,
            bus = me.getBus(),
            left, right, event, callback;


        if (Array.isArray(bus)) {

            while (bus.length) {
                var pop = bus.pop();

                for (var connection2 in pop) {

                    if (pop.hasOwnProperty(connection2)) {

                        right = pop[connection2].split(':');
                        left = connection2.split(':');
                        event = left.pop();
                        callback = right.pop();
                        left = me.findConn(left);
                        right = me.findConn(right);

                        if (left.idx < 0 || right.idx < 0) continue;

                        left
                            .obj
                            .addEventListener(
                            event,
                            right.obj[callback],
                            right.obj
                        );

                    }

                }

            }


        } else {

            for (var connection in bus) {

                if (bus.hasOwnProperty(connection)) {

                    right = bus[connection].split(':');
                    left = connection.split(':');
                    event = left.pop();
                    callback = right.pop();
                    left = me.findConn(left);
                    right = me.findConn(right);

                    if (left.idx < 0 || right.idx < 0) continue;

                    left
                        .obj
                        .addEventListener(
                        event,
                        right.obj[callback],
                        right.obj
                    );

                }

            }

        }

        return me;
    },
    findConn: function (conn) {
        var me = this,
            __find = ya.mixins.Array.find,
            alias, module, name, initialized = [], found = {}, idx;

        alias = conn.pop();
        module = conn.pop() || me.__module__;
        name = [module, alias].join('.');


        if (module !== me.__module__) {

            idx = __find(me._initialized, '__class__', module + '.Module');
            if (idx > -1) {

                initialized = me._initialized[idx]._initialized;

            }

        } else {

            initialized = me._initialized;

        }

        found.idx = idx = __find(initialized, '__class__', name);
        found.obj = idx > -1 ? initialized[idx] : null;

        return found;
    },
    notifyChildren: function () {
        var me = this,
            len = me._initialized.length,
            i = 0, rx = /\.Module$/,
            init;

        while (i < len) {
            init = me._initialized[i];

            if (rx.test(init.__class__)) {

                init.onParentReady();
                init.notifyChildren();

            }

            i++;
        }

    },
    onReady: function () {
    },
    onParentReady: function () {

    },
    onError: function () {
    }
});

(function (window) {
    'use strict';

    var nativeRequestAnimationFrame,
        nativeCancelAnimationFrame,
        AnimationFrame = {
            _callbacks: [],
            FRAME_RATE: 60,
            hasNative: false,
            options: {
                useNative: true
            }
        };

// Grab the native request and cancel functions.
    (function () {
        var i,
            vendors = ['webkit', 'moz', 'ms', 'o'],
            top;

        // Test if we are within a foreign domain. Use raf from the top if possible.
        try {
            // Accessing .name will throw SecurityError within a foreign domain.
            window.top.name;
            top = window.top;
        } catch (e) {
            top = window;
        }

        nativeRequestAnimationFrame = top.requestAnimationFrame;
        nativeCancelAnimationFrame = top.cancelAnimationFrame || top.cancelRequestAnimationFrame;


        // Grab the native implementation.
        for (i = 0; i < vendors.length && !nativeRequestAnimationFrame; i++) {
            nativeRequestAnimationFrame = top[vendors[i] + 'RequestAnimationFrame'];
            nativeCancelAnimationFrame = top[vendors[i] + 'CancelAnimationFrame'] ||
            top[vendors[i] + 'CancelRequestAnimationFrame'];
        }

        // Test if native implementation works.
        // There are some issues on ios6
        // http://shitwebkitdoes.tumblr.com/post/47186945856/native-requestanimationframe-broken-on-ios-6
        // https://gist.github.com/KrofDrakula/5318048
        nativeRequestAnimationFrame && nativeRequestAnimationFrame(function () {
            AnimationFrame.hasNative = true;
        });
    }());

    /**
     * Crossplatform Date.now()
     *
     * @return {Number} time in ms
     * @api public
     */
    AnimationFrame.now = Date.now || function () {
        return (new Date).getTime();
    };

    /**
     * Replacement for PerformanceTiming.navigationStart for the case when
     * performance.now is not implemented.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming.navigationStart
     *
     * @type {Number}
     * @api public
     */
    AnimationFrame.navigationStart = AnimationFrame.now();

    /**
     * Crossplatform performance.now()
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/Performance.now()
     *
     * @return {Number} relative time in ms
     * @api public
     */
    AnimationFrame.perfNow = function () {
        if (window.performance && window.performance.now) return window.performance.now();
        return AnimationFrame.now() - AnimationFrame.navigationStart;
    };

    AnimationFrame.start = function () {
        var me = AnimationFrame;

        if (!me.run) {

            me.run = true;
            me.update(me.perfNow());

        }

        return me;
    };

    AnimationFrame.update = function () {
        var me = AnimationFrame,
            callbacks = me._callbacks,
            delay;

        if (!me.run) {
            return;
        }

        for (var i = 0, l = callbacks.length; i < l; i++) {
            try {
                callbacks[i]();
            } catch (e) {
                callbacks.splice(i, 1);
                console.error(e);
            }
        }

        if (me.hasNative && me.options.useNative && !me._isCustomFrameRate) {
            nativeRequestAnimationFrame(me.update);
            return me;
        }

        if (me._timeoutId == null) {
            // Much faster than Math.max
            // http://jsperf.com/math-max-vs-comparison/3
            // http://jsperf.com/date-now-vs-date-gettime/11
            delay = me._frameLength + me._lastTickTime - me.now();
            if (delay < 0) delay = 0;

            me._timeoutId = window.setTimeout(function () {

                me._lastTickTime = me.now();
                me._timeoutId = null;

                if (me.hasNative && me.options.useNative) {
                    nativeRequestAnimationFrame(me.update);
                } else {
                    me.update(me.perfNow());
                }

            }, delay);
        }


    };

    AnimationFrame.stop = function () {

        AnimationFrame.run = false;

    };

    AnimationFrame.addCallback = function (callback) {
        var me = AnimationFrame;

        me
            ._callbacks
            .push(callback);

        me
            .start();

        return me
            ._callbacks
            .length;
    };

    /**
     * Cancel animation frame.
     */
    AnimationFrame.removeCallback = function (id) {
        var me = AnimationFrame,
            callbacks = me
                ._callbacks;

        callbacks
            .slice(id, 1);

        if (callbacks.length === 0) {
            me.stop();
        }

        return void 0;
    };


    window.requestAnimationFrame = AnimationFrame.addCallback;
    window.cancelAnimationFrame = AnimationFrame.removeCallback;

}(window));

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {
            },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-01-07
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

if ("document" in self && !("classList" in document.createElement("_"))) {

    (function (view) {

        "use strict";

        if (!('Element' in view)) return;

        var
            classListProp = "classList",
            protoProp = "prototype",
            elemCtrProto = view.Element[protoProp],
            objCtr = Object,
            strTrim = String[protoProp].trim || function () {
                    return this.replace(/^\s+|\s+$/g, "");
                },
            arrIndexOf = Array[protoProp].indexOf || function (item) {
                    var
                        i = 0,
                        len = this.length;

                    for (; i < len; i++) {
                        if (i in this && this[i] === item) {
                            return i;
                        }
                    }
                    return -1;
                },
        // Vendors: please allow content code to instantiate DOMExceptions

            DOMEx = function (type, message) {
                this.name = type;
                this.code = DOMException[type];
                this.message = message;
            },
            checkTokenAndGetIndex = function (classList, token) {
                if (token === "") {
                    throw new DOMEx(
                        "SYNTAX_ERR",
                        "An invalid or illegal string was specified"
                    );
                }
                if (/\s/.test(token)) {
                    throw new DOMEx(
                        "INVALID_CHARACTER_ERR",
                        "String contains an invalid character"
                    );
                }
                return arrIndexOf.call(classList, token);
            },
            ClassList = function (elem) {
                var
                    trimmedClasses = strTrim.call(elem.getAttribute("class") || ""),
                    classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [],
                    i = 0,
                    len = classes.length;

                for (; i < len; i++) {
                    this.push(classes[i]);
                }

                this._updateClassName = function () {
                    elem.setAttribute("class", this.toString());
                };
            },
            classListProto = ClassList[protoProp] = [],
            classListGetter = function () {
                return new ClassList(this);
            };
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
        DOMEx[protoProp] = Error[protoProp];
        classListProto.item = function (i) {
            return this[i] || null;
        };
        classListProto.contains = function (token) {
            token += "";
            return checkTokenAndGetIndex(this, token) !== -1;
        };
        classListProto.add = function () {
            var
                tokens = arguments, i = 0, l = tokens.length, token, updated = false;
            do {
                token = tokens[i] + "";
                if (checkTokenAndGetIndex(this, token) === -1) {
                    this.push(token);
                    updated = true;
                }
            }
            while (++i < l);

            if (updated) {
                this._updateClassName();
            }
        };
        classListProto.remove = function () {
            var
                tokens = arguments, i = 0, l = tokens.length, token, updated = false;

            do {
                token = tokens[i] + "";
                var index = checkTokenAndGetIndex(this, token);
                if (index !== -1) {
                    this.splice(index, 1);
                    updated = true;
                }
            }
            while (++i < l);

            if (updated) {
                this._updateClassName();
            }
        };
        classListProto.toggle = function (token, forse) {
            token += "";

            var
                result = this.contains(token),
                method = result ?
                forse !== true && "remove"
                    :
                forse !== false && "add"
                ;

            if (method) {
                this[method](token);
            }

            return !result;
        };
        classListProto.toString = function () {
            return this.join(" ");
        };

        if (objCtr.defineProperty) {
            var classListPropDesc = {
                get: classListGetter, enumerable: true, configurable: true
            };
            try {
                objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
            } catch (ex) { // IE 8 doesn't support enumerable:true
                if (ex.number === -0x7FF5EC54) {
                    classListPropDesc.enumerable = false;
                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                }
            }
        } else if (objCtr[protoProp].__defineGetter__) {
            elemCtrProto.__defineGetter__(classListProp, classListGetter);
        }

    }(self));

}

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

if (!window.matchMedia) {
    window.matchMedia = (function () {
        "use strict";

        // For browsers that support matchMedium api such as IE 9 and webkit
        var styleMedia = (window.styleMedia || window.media);

        // For those that don't support matchMedium
        if (!styleMedia) {
            var style = document.createElement('style'),
                script = document.getElementsByTagName('script')[0],
                info = null;

            style.type = 'text/css';
            style.id = 'matchmediajs-test';

            script.parentNode.insertBefore(style, script);

            // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
            info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

            styleMedia = {
                matchMedium: function (media) {
                    var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

                    // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
                    if (style.styleSheet) {
                        style.styleSheet.cssText = text;
                    } else {
                        style.textContent = text;
                    }

                    // Test if media query is true or false
                    return info.width === '1px';
                }
            };
        }

        return function (media) {
            return {
                matches: styleMedia.matchMedium(media || 'all'),
                media: media || 'all'
            };
        };
    })();
}

/*! matchMedia() polyfill addListener/removeListener extension. Author & copyright (c) 2012: Scott Jehl. Dual MIT/BSD license */
(function () {
    "use strict";
    // Bail out for browsers that have addListener support
    if (window.matchMedia && window.matchMedia('all').addListener) {
        return false;
    }

    var localMatchMedia = window.matchMedia,
        hasMediaQueries = localMatchMedia('only all').matches,
        isListening = false,
        timeoutID = 0,    // setTimeout for debouncing 'handleChange'
        queries = [],   // Contains each 'mql' and associated 'listeners' if 'addListener' is used
        handleChange = function (evt) {
            // Debounce
            clearTimeout(timeoutID);

            timeoutID = setTimeout(function () {
                for (var i = 0, il = queries.length; i < il; i++) {
                    var mql = queries[i].mql,
                        listeners = queries[i].listeners || [],
                        matches = localMatchMedia(mql.media).matches;

                    // Update mql.matches value and call listeners
                    // Fire listeners only if transitioning to or from matched state
                    if (matches !== mql.matches) {
                        mql.matches = matches;

                        for (var j = 0, jl = listeners.length; j < jl; j++) {
                            listeners[j].call(window, mql);
                        }
                    }
                }
            }, 30);
        };

    window.matchMedia = function (media) {
        var mql = localMatchMedia(media),
            listeners = [],
            index = 0;

        mql.addListener = function (listener) {
            // Changes would not occur to css media type so return now (Affects IE <= 8)
            if (!hasMediaQueries) {
                return;
            }

            // Set up 'resize' listener for browsers that support CSS3 media queries (Not for IE <= 8)
            // There should only ever be 1 resize listener running for performance
            if (!isListening) {
                isListening = true;
                window.addEventListener('resize', handleChange, true);
            }

            // Push object only if it has not been pushed already
            if (index === 0) {
                index = queries.push({
                    mql: mql,
                    listeners: listeners
                });
            }

            listeners.push(listener);
        };

        mql.removeListener = function (listener) {
            for (var i = 0, il = listeners.length; i < il; i++) {
                if (listeners[i] === listener) {
                    listeners.splice(i, 1);
                }
            }
        };

        return mql;
    };
}());
/**
 * @author angularjs
 * @contributed mkalafior
 * @namespace ya
 * @class $promise
 * @static
 */
ya.$set('ya', '$promise', function (undefined) {
    "use strict";

    var ya = window.ya || {},
        isFunction = function (func) {
            return typeof func === 'function';
        },
        each = ya.mixins.Array.each,
        _promise;


    /**
     * Constructs a promise manager.
     * @returns {object} Promise manager.
     */
    function promise(exceptionHandler) {

        /**
         * @method deferred
         * @static
         * @description
         * Creates a `Deferred` object which represents a task which will finish in the future.
         *
         * @returns {Deferred} Returns a new instance of deferred.
         */
        var defer = function () {
            var pending = [],
                value, deferred;

            deferred = {
                resolve: function (val) {
                    if (pending) {
                        var callbacks = pending;
                        pending = undefined;
                        value = ref(val);

                        if (callbacks.length) {
                            setTimeout(function () {
                                var callback;
                                for (var i = 0, ii = callbacks.length; i < ii; i++) {
                                    callback = callbacks[i];
                                    value.then(callback[0], callback[1], callback[2]);
                                }
                            }, 0);
                        }
                    }
                },
                reject: function (reason) {
                    if (reason instanceof Error || reason instanceof ya.Error) {
                        console.log('%cError: ', 'background: red; color: white;', reason, reason.stack || reason.getStack());
                    }
                    deferred.resolve(createInternalRejectedPromise(reason));
                },
                notify: function (progress) {
                    if (pending) {
                        var callbacks = pending;

                        if (pending.length) {
                            setTimeout(function () {
                                var callback;
                                for (var i = 0, ii = callbacks.length; i < ii; i++) {
                                    callback = callbacks[i];
                                    callback[2](progress);
                                }
                            }, 0);
                        }
                    }
                },


                promise: {
                    then: function (callback, errback, progressback) {
                        var result = defer();

                        var wrappedCallback = function (value) {
                            try {
                                result.resolve((isFunction(callback) ? callback : defaultCallback)(value));
                            } catch (e) {
                                result.reject(e);
                                exceptionHandler(e);
                            }
                        };

                        var wrappedErrback = function (reason) {
                            try {
                                result.resolve((isFunction(errback) ? errback : defaultErrback)(reason));
                            } catch (e) {
                                result.reject(e);
                                exceptionHandler(e);
                            }
                        };

                        var wrappedProgressback = function (progress) {
                            try {
                                result.notify((isFunction(progressback) ? progressback : defaultCallback)(progress));
                            } catch (e) {
                                exceptionHandler(e);
                            }
                        };

                        if (pending) {
                            pending.push([wrappedCallback, wrappedErrback, wrappedProgressback]);
                        } else {
                            value.then(wrappedCallback, wrappedErrback, wrappedProgressback);
                        }

                        return result.promise;
                    },

                    "catch": function (callback) {
                        return this.then(null, callback);
                    },

                    "finally": function (callback) {

                        function makePromise(value, resolved) {
                            var result = defer();
                            if (resolved) {
                                result.resolve(value);
                            } else {
                                result.reject(value);
                            }
                            return result.promise;
                        }

                        function handleCallback(value, isResolved) {
                            var callbackOutput = null;
                            try {
                                callbackOutput = (callback || defaultCallback)();
                            } catch (e) {
                                return makePromise(e, false);
                            }
                            if (callbackOutput && isFunction(callbackOutput.then)) {
                                return callbackOutput.then(function () {
                                    return makePromise(value, isResolved);
                                }, function (error) {
                                    return makePromise(error, false);
                                });
                            } else {
                                return makePromise(value, isResolved);
                            }
                        }

                        return this.then(function (value) {
                            return handleCallback(value, true);
                        }, function (error) {
                            return handleCallback(error, false);
                        });
                    }
                }
            };

            return deferred;
        };


        var ref = function (value) {
            if (value && isFunction(value.then)) return value;
            return {
                then: function (callback) {
                    var result = defer();
                    setTimeout(function () {
                        result.resolve(callback(value));
                    }, 0);
                    return result.promise;
                }
            };
        };


        /**
         * @static
         * @method reject
         * @description
         * Creates a promise that is resolved as rejected with the specified `reason`. This api should be
         * used to forward rejection in a chain of promises. If you are dealing with the last promise in
         * a promise chain, you don't need to worry about it.
         *
         * When comparing deferreds/promises to the familiar behavior of try/catch/throw, think of
         * `reject` as the `throw` keyword in JavaScript. This also means that if you "catch" an error via
         * a promise error callback and you want to forward the error to the promise derived from the
         * current promise, you have to "rethrow" the error by returning a rejection constructed via
         * `reject`.
         *
         * ```js
         *   promiseB = promiseA.then(function(result) {
         *     // success: do something and resolve promiseB
         *     //          with the old or a new result
         *     return result;
         *   }, function(reason) {
         *     // error: handle the error if possible and
         *     //        resolve promiseB with newPromiseOrValue,
         *     //        otherwise forward the rejection to promiseB
         *     if (canHandle(reason)) {
         *      // handle the error and recover
         *      return newPromiseOrValue;
         *     }
         *     return promise.reject(reason);
         *   });
         * ```
         *
         * @param {*} reason Constant, message, exception or an object representing the rejection reason.
         * @returns {Promise} Returns a promise that was already resolved as rejected with the `reason`.
         */
        var reject = function (reason) {
            var result = defer();
            result.reject(reason);
            return result.promise;
        };

        var createInternalRejectedPromise = function (reason) {
            return {
                then: function (callback, errback) {
                    var result = defer();
                    setTimeout(function () {
                        try {
                            result.resolve((isFunction(errback) ? errback : defaultErrback)(reason));
                        } catch (e) {
                            result.reject(e);
                            exceptionHandler(e);
                        }
                    });
                    return result.promise;
                }
            };
        };


        /**
         * @static
         * @method when
         * @description
         * Wraps an object that might be a value or a (3rd party) then-able promise into a new promise.
         * This is useful when you are dealing with an object that might or might not be a promise, or if
         * the promise comes from a source that can't be trusted.
         *
         * @param {*} value Value or a promise
         * @returns {Promise} Returns a promise of the passed value or promise
         */
        var when = function (value, callback, errback, progressback) {
            var result = defer(),
                done;

            var wrappedCallback = function (value) {
                try {
                    return (isFunction(callback) ? callback : defaultCallback)(value);
                } catch (e) {
                    exceptionHandler(e);
                    return reject(e);
                }
            };

            var wrappedErrback = function (reason) {
                try {
                    return (isFunction(errback) ? errback : defaultErrback)(reason);
                } catch (e) {
                    exceptionHandler(e);
                    return reject(e);
                }
            };

            var wrappedProgressback = function (progress) {
                try {
                    return (isFunction(progressback) ? progressback : defaultCallback)(progress);
                } catch (e) {
                    exceptionHandler(e);
                }
            };

            setTimeout(function () {
                ref(value).then(function (value) {
                    if (done) return;
                    done = true;
                    result.resolve(ref(value).then(wrappedCallback, wrappedErrback, wrappedProgressback));
                }, function (reason) {
                    if (done) return;
                    done = true;
                    result.resolve(wrappedErrback(reason));
                }, function (progress) {
                    if (done) return;
                    result.notify(wrappedProgressback(progress));
                });
            });

            return result.promise;
        };


        function defaultCallback(value) {
            return value;
        }


        function defaultErrback(reason) {
            return reject(reason);
        }


        /**
         * @static
         * @method all
         * @description
         * Combines multiple promises into a single promise that is resolved when all of the input
         * promises are resolved.
         *
         * @param {Array.<Promise>|Object.<Promise>} promises An array or hash of promises.
         * @returns {Promise} Returns a single promise that will be resolved with an array/hash of values,
         *   each value corresponding to the promise at the same index/key in the `promises` array/hash.
         *   If any of the promises is resolved with a rejection, this resulting promise will be rejected
         *   with the same rejection value.
         */
        function all(promises) {
            var deferred = defer(),
                counter = 0,
                results = isArray(promises) ? [] : {};

            each(promises, function (promise, key) {
                counter++;
                ref(promise).then(function (value) {
                    if (results.hasOwnProperty(key)) return;
                    results[key] = value;
                    if (!(--counter)) deferred.resolve(results);
                }, function (reason) {
                    if (results.hasOwnProperty(key)) return;
                    deferred.reject(reason);
                });
            });

            if (counter === 0) {
                deferred.resolve(results);
            }

            return deferred.promise;
        }

        return {
            deferred: defer,
            reject: reject,
            when: when,
            all: all
        };
    }

    var stack = [];

    _promise = promise(function (e) {
        stack.push(e);
    });

    _promise.getStack = function () {
        return stack;
    };

    return _promise;

}());
/**
 * @description
 * ## Router
 * Router is used internally in controller, so don't instantiated it again.
 * @namespace ya
 * @class Router
 * @extends ya.Core
 * @constructor
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Router',
    /**
     * @method init
     */
    init: function (opts) {
        var me = this;

        me
            .__super(opts)
            .bindEvents();

        return me;
    },
    /**
     * @method initDefaults
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        me.set('routing', {});

        return me;
    },
    /**
     * @method bindEvents
     * @chainable
     */
    bindEvents: function () {
        var me = this;

        window.onhashchange = me.onHashChange.bind(me);


        return this;
    },
    /**
     * @method onHashChange
     * @chainable
     */
    onHashChange: function () {
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
    },
    /**
     * @method restore
     * @chainable
     */
    restore: function () {
        this.onHashChange();
        return this;
    },
    /**
     * @method when
     * @param path
     * @param callback
     * @returns {*}
     * @chainable
     */
    when: function (path, callback) {
        var me = this,
            routing = me.get('routing'),
            paths = path.split("/"),
            action = paths.shift();

        routing[action] = {
            callback: callback,
            params: paths
        };

        me.set('routing', routing);

        return me;
    }
});

/**
 * @namespace ya
 * @class util.$detection
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'util.$detection',
    singleton: true,
    defaults: {
        isWorker: null,
        isCan: null
    },
    isWorkerAvail: function () {
        return this._config.isWorker = this._config.isWorker || window.Worker;
    },
    isCanvasAvail: function () {
        return this._config.isCan = this._config.isCan || (
            function () {
                var canvas = document.createElement('canvas');
                return !!(canvas.getContext && canvas.getContext('2d'));
            }()
        );
    }
});
/**
 * @namespace ya
 * @class util.Parallel
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'util.Parallel',
    defaults: function () {
        return {
            data: null,
            options: {},
            job: function () {
                this.addEventListener('message', function (e) {
                    console.warn('ya.util.Parallel: Please override default job.');

                    this.postMessage(e.data);

                });
            },
            worker: null,
            blob: null,
            promise: null
        }
    },
    init: function (config) {
        var me = this,
            blobURL,
            worker,
            deferred;

        me
            .__super(config);

        blobURL = URL
            .createObjectURL(
            new Blob(
                [
                    '(',
                    me.getJob().toString(),
                    ')()'
                ],
                {
                    type: 'application/javascript'
                }
            )
        );

        deferred = ya.$promise.deferred();

        worker = new Worker(blobURL);
        URL.revokeObjectURL(me.getBlob());

        worker.addEventListener('message', function (data) {
            deferred.resolve({data: data});
        }, false);

        worker.addEventListener('error', function (data) {
            deferred.reject({data: data});
        }, false);

        me
            .setBlob(blobURL);

        me
            .setWorker(worker);

        me
            .setPromise(deferred.promise);

        return me;
    },
    spawn: function () {
        var me = this;

        me
            .getWorker().
            postMessage(me.getData());


        return me.getPromise();
    }
});
/**
 * @author Sebastian Widelak <sebakpl@gmail.com>
 * @module ya
 * @class ya.View
 *
 *
 */

/*
 * TODO: wywalic namespacey! zamiast tego dodac wartosc property ktora bedzie mowila by pod jakim kluczem znajduje sie model
 * TODO: lub kolekcja. Modele przetrzymywac w obiekcie zamiast tablicy. models:{klucz:model}
 */
(function (undefined) {
    "use strict";
    // todo: focus and blur implemented here
    var ya = window.ya,
        style = document.createElement('style'),
        __slice = Array.prototype.slice,
        focused = [],
        resize = 0,
        iv = 0,
        View;

    function onWindowResize(e) {
        // When resize event occur wait 32 miliseconds
        // to not firing it to often.

        if (resize === 0) {
            iv = setInterval(function () {
                fireResizeEvent(e);
            }, 32);
        }

        resize = +new Date();
    }

    // todo: focus and blur implemented here
    function onWindowClick(e) {
        var el = e.toElement || e.relatedTarget || e.target,
            _el = el,
            DOMmixin = ya.mixins.DOM,
            __isChild = DOMmixin.isChild,
            __isElement = DOMmixin.isElement,
            view, _view, toIterate;

        while (_el && __isElement(_el)) {

            if (_el.hasAttribute('ya-class')) {

                view = ya.view.$manager.getItem(_el.getAttribute('id'));
                view.focus();

                break;

            }

            _el = _el.parentNode;

        }

        if (!view) {

            toIterate = focused.length;
            while (toIterate--) {

                _view = focused[toIterate];
                _view.blur();

            }

            return void 0;
        }

        toIterate = focused.length;
        while (__isElement(el) && toIterate--) {

            _view = focused[toIterate];
            if (view.getId() !== _view.getId()) {

                if (!__isChild(_view._el, el)) {

                    _view.blur();

                }

            }

        }


    }

    function fireResizeEvent(e) {
        // Fire ya resize event only on components
        // which need to be fitted to their parents.
        var views,
            view,
            l,
            i,
            now = +new Date();

        if (now - resize >= 32) {

            clearInterval(iv);

            resize = 0;
            views = ya.view.$manager.getItems();
            l = views.length;
            i = 0;

            while (i < l) {
                view = views[i];

                if (view && view.item.getFit()) {

                    if (view.item.isInDOM()) {

                        view
                            .item.
                            fireEvent('resize', views[i], e);

                    }

                }

                i++;
            }
        }
    }

    // Append some basic css to document.
    style.innerHTML = ".ya.inline {display:inline;} .ya.hidden {display: none !important;}";
    style.setAttribute('type', 'text/css');

    document.body.appendChild(style);
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mouseup', onWindowClick);

    /**
     * @namespace ya
     * @class View
     * @constructor
     * @extends ya.Core
     * @uses ya.mixins.DOM
     * @params opts Object with configuration properties
     * @type {function}
     * TODO: to samo co dla modeli, mamy obiekt widoków views:{view1:{class:ya.grid.row.View, arguments:[]}}, a pozniej w html bindujemy tak ya-view="view1"
     */
    ya.Core.$extend({
        module: 'ya',
        alias: 'View',
        // `ya.View` accept few configuration properties:
        // * `parent` - pointer to parent view
        // * `fit` - if true, component will fire resize event when size
        // of window was changed
        // * `hidden` - if true, component will be hidden after render
        defaults: {
            id: null,
            /**
             * @attribute config.parent
             * @type ya.View
             */
            parent: null,
            /**
             * @attribute config.children
             * @type Array
             */
            children: null,
            /**
             * @attribute config.fit
             * @type boolean
             */
            fit: false,
            /**
             * @attribute config.hidden
             * @type boolean
             */
            hidden: false,
            /**
             * @attribute config.models
             * @type ya.Model
             */
            models: null,
            /**
             * @attribute config.collections
             * @type ya.Collection
             */
            collections: null,
            /**
             * @attribute config.autoCreate
             * @type boolean
             */
            autoCreate: false,
            /**
             * @attribute config.renderTo
             * @type boolean
             */
            renderTo: null,
            /**
             * @attribute config.renderAt
             * @type boolean
             */
            renderAt: null,
            /**
             * @attribute config.tpl
             * @type ya.view.Template|String
             * @required
             */
            tpl: null,
            /**
             * @attribute config.hideCls
             * @type String
             */
            hideCls: 'hidden'
        },
        mixins: [
            ya.mixins.Array,
            ya.mixins.DOM
        ],
        /**
         * @method init
         * @param opts
         * @returns {View}
         * @chainable
         */
        init: function (opts) {
            // Initializing function in which we call parent method, merge previous
            // configuration with new one, set id of component, initialize config
            // and save reference to component in View Manager.
            var me = this;

            me
                .__super(opts)
                .initModels()
                .initTemplate()
                .initParent()
                .initChildren();

            ya.view.$manager.register(me.getId(), me);

            return me;
        },
        initRequired: function () {
            var me = this;

            if (!me.getTpl()) {

                throw ya.Error.$create(me.__class__ + ': no tpl set for ' + me.getId(), 'YV1');

            }

            return me;
        },
        /**
         * @method initDefaults
         * @returns {*}
         */
        initDefaults: function () {
            var me = this;

            if (me.getId()) {

                me.setId(me.getId());

                me.set('customId', true);

            } else {

                me.setId('view-' + ya.view.$manager.getUniqueId());
                me.set('customId', false);

            }

            me
                .setChildren(
                me.getChildren() || []
            );

            me
                .setModels(
                me.getModels() || []
            );

            me
                .setCollections(
                me.getCollections() || []
            );


            me
                .set('eventHandlers', []);
            return me;
        },
        /**
         * @method initTemplate
         * @returns {View}
         * @chainable
         */
        initModels: function () {
            var me = this;

            me.each(
                me.getModels(),
                function (model, i, array) {

                    if (!(model instanceof ya.Model)) {

                        if (!model.alias) {

                            model.module = 'ya';
                            model.alias = 'Model';

                        }

                        try {

                            array[i] = ya.$factory(model);

                        } catch (e) {

                            throw ya.Error.$create(me.__class__ + ': Can not create model', 'YV2');

                        }
                    }
                });

            return me;
        },
        /**
         * @method initTemplate
         * @returns {View}
         * @chainable
         */
        initTemplate: function () {
            var me = this,
                tpl = me.getTpl(),
                div = document.createElement('div');

            if (!(tpl instanceof ya.view.Template)) {
                // If tpl is not a ya.view.Template object

                if (
                    tpl instanceof Array || typeof tpl === 'array' ||
                    typeof tpl == 'string' || tpl instanceof String
                ) {
                    // if its an array with html def
                    // prepare configuration object and
                    // instantiate it via factory method.
                    tpl = ya.$factory({
                        module: 'ya',
                        alias: 'view.Template',
                        tpl: tpl
                    });

                } else if (tpl instanceof Object || typeof tpl === 'object') {
                    // Or if its a configuration object
                    // do the same.
                    if (!tpl.alias) {
                        tpl.module = 'ya';
                        tpl.alias = 'view.Template';
                    }

                    tpl = ya.$factory(tpl);
                }


            }

            me.setTpl(tpl);

            return me;
        },
        /**
         * @method initParent
         * @returns {View}
         * @chainable
         */
        initParent: function () {
            var me = this,
                parent = me.getParent();

            if (parent) {

                parent.getChildren().push(me);

            }

            return me;
        },
        /**
         *
         * @returns {*}
         */
        initChildren: function () {
            var me = this,
                children = me.getChildren();

            me.each(children, function (v) {
                v.setParent(me);
            });

            return me;
        },
        /**
         * @returns {View}
         */
        setModel: function (model) {
            var me = this,
                models = me.getModels();

            if (!(model instanceof ya.Model)) {

                if (!model.alias) {

                    model.module = 'ya';
                    model.alias = 'Model';

                }

                model = ya.$factory(model);
            }

            if (!me.hasModel(model.getNamespace())) {

                models.push(model);
                me.setModels(models);

            }

            return me;
        },
        hasModel: function (namespace) {
            var models = this.getModels(),
                l;

            l = models.length;
            while (l--) {
                if (models[l].getNamespace() === namespace) {
                    return true;
                }
            }

            return false;
        },
        /**
         * @param namespace
         * @returns {ya.Model}
         */
        getModel: function (namespace) {
            var me = this,
                models = me.getModels(),
                model = null,
                l;

            l = models.length;
            while (l--) {
                if (models[l].getNamespace() === namespace) {
                    model = models[l];
                    break;
                }
            }

            return model;
        },
        /**
         * @returns {View}
         */
        setCollection: function (collection) {
            var me = this,
                collections = me.getCollections();

            if (!(collection instanceof ya.Collection)) {

                if (!collection.alias) {

                    collection.module = 'ya';
                    collection.alias = 'Model';

                }

                collection = ya.$factory(collection);
            }

            if (
                !me
                    .hasCollection(collection.getId())
            ) {

                collections.push(collection);
                me.setCollections(collections);

            }

            return me;
        },
        hasCollection: function (id) {
            var collections = this.getCollections(),
                l;

            l = collections.length;
            while (l--) {
                if (collections[l].getId() === id) {
                    return true;
                }
            }

            return false;
        },
        /**
         * @param namespace
         * @returns {ya.Collection}
         */
        getCollection: function (namespace) {
            var me = this,
                collections = me.getCollections(),
                collection = null,
                l;

            l = collections.length;
            while (l--) {
                if (collections[l].getNamespace() === namespace) {
                    collection = collections[l];
                    break;
                }
            }

            return collection;
        },
        compile: function () {
            var me = this, tdom, edom;

            tdom = me.getTpl()
                .getTDOMInstance(me);

            edom = tdom
                .getEDOM();

            me.set('tdom', tdom);
            me.set('edom', edom);

            if (me.getHidden()) {
                me.hide();
            }

            me
                .onCompile();

            me
                .fireEvent('compile', me, tdom);

            return me;
        },
        /**
         * @returns {this}
         */
        render: function () {
            var me = this,
                parent = me.getParent(),
                selector = me.getRenderTo(),
                el, parentNode;

            // get parent node
            parentNode = selector instanceof HTMLElement ? selector : me.getParentNode(selector, true);

            if (!me.get('tdom')) {
                // compile template if we run render first time
                me.compile();
            }

            if (parentNode) {
                // if there is no another root view object and parent node was found

                if (me.isInDOM()) {
                    // if view was already rendered
                    // remove dom from document
                    me.clear();

                }

                // prepare elements
                me.prepareElements();

                // set referrer to the root node
                if (me.get('elements').length === 1) {
                    me.set('el', me.get('elements')[0]);
                } else {
                    me.set('el', parentNode);
                }

                if (me.hasChildren()) {
                    // if view has children render them also
                    me.renderChildren();
                }

                // add proper class if view shoudlnt be visible
                if (me.getHidden()) {
                    me.get('el').classList.add(me.getHideCls());
                    me.set('visible', false);
                }

                // add element(s) to the DOM
                parentNode.insertBefore(
                    me.get('edom'),
                    me.getRenderAt() === null ? null : parentNode.childNodes.item(me.getRenderAt())
                );

                me.set('isInDOM', true);

                if (parent && parent.isInDOM() || !parent) {
                    ya.event.$dispatcher.apply(me);
                }

                me.onRender();
                me.fireEvent('render', me, parent);

            }
        },
        renderChildren: function () {
            var me = this;

            me.each(me.getChildren(), function (r) {
                r.appendTo(me, r.getRenderTo());
            });
        },
        /**
         * @version 0.1.12
         */
        clear: function () {
            var me = this;

            //todo: blur when cleared
            me
                .blur();

            me
                .removeFromDOM();

            return me;
        },
        /**
         * @param selector
         * @returns {Node}
         */
        querySelector: function (selector) {
            var me = this,
                el = me.isInDOM() ? me.get('el') : me.get('edom');

            return el.querySelector(selector) ||
            (me.isQueryMatch(selector, el) ? el : null);
        },
        /**
         * @param selector
         * @returns {Array}
         */
        querySelectorAll: function (selector) {
            var me = this,
                el = me.isInDOM() ? me.get('el') : me.get('edom'),
                results = __slice.call(el.querySelectorAll(selector) || [], 0);

            if (me.isQueryMatch(selector, el)) {

                results.push(el);

            }

            return results;
        },
        /**
         * @param view
         * @param selector
         * @returns {View}
         */
        addChild: function (view, selector) {
            var me = this,
                parent = view.getParent();

            if (parent && parent.getId() != me.getId()) {
                parent.removeChild(me);
            }

            if (!me.getChild(view.getId())) {

                me.getChildren().push(view);
                view.setParent(me);

            }

            view.appendTo(me, selector);
            me.fireEvent('childAdded', me, view);

            return me;
        },
        /**
         * @param id
         * @returns {View||Boolean}
         */
        getChild: function (id) {
            var me = this,
                views = this.getChildren();

            if (me.findChild(id) < 0)
                return null;

            return views[me.findChild(id)];
        },
        getChildByClass: function (className) {
            var me = this,
                views = me.getChildren(),
                some = ya.mixins.Array.some,
                idx;

            if (!some(views, function (child, i) {
                    if (child.__class__ === className) {
                        idx = i;
                        return true;
                    }
                })) {
                return null;
            }

            return views[idx];
        },
        /**
         *
         * @param id
         * @returns {*|length|length|Function|length|length}
         */
        findChild: function (id) {
            var views = this.getChildren(),
                l = views.length;

            while (l--) {
                if (views[l].getId() === id)
                    break;
            }

            return l;
        },
        /**
         *
         * @param view
         * @returns {*|null}
         */
        removeChild: function (view) {
            var views = this.getChildren(),
                l = views.length,
                removed;

            while (l--) {
                if (views[l].getId() === view.getId()) {


                    removed = views.splice(l, 1)[0];

                    removed
                        .removeFromDOM()
                        .setParent(null);

                }
            }

            return removed;
        },
        /**
         * @returns {Array}
         */
        removeChildren: function () {
            var views = this.getChildren(),
                l = views.length,
                removed = [];

            while (l--) {
                removed.push(views[l].removeFromDOM());
            }


            return removed;
        },
        /**
         * @returns {View}
         */
        removeFromDOM: function () {
            var me = this,
                el = me.get('el'),
                children;

            if (me.isInDOM()) {

                children = el
                    .parentNode
                    .removeChild(el);

                me.set('isInDOM', false);
                me.get('edom')
                    .appendChild(children);

            }

            return me;
        },
        /**
         * @returns {Boolean}
         */
        isInDOM: function () {
            return this._isInDOM === true;
        },
        /**
         *
         * @param selector
         * @param globally
         */
        getParentEl: function (selector, globally) {
            var me = this,
                parent = me._config.parent,
                parentEl;

            if (me.isElement(selector)) {

                parentEl = selector;

            } else if (parent) {

                parentEl = selector ? parent.querySelector(selector) : parent._el;

            } else if (globally) {

                parentEl = document.querySelector(selector);

            }

            return parentEl;
        },
        /**
         * @private
         * @param parent
         * @param selector
         * @returns {*}
         */
        appendTo: function (parent, selector) {
            var me = this;

            me.render();

            return me;
        },
        /**
         *
         * @param selector
         * @param globally
         * @returns {*}
         */
        getParentNode: function (selector, globally) {
            var me = this,
                parent = me.getParent(),
                parentEl;

            if (me.isElement(selector)) {

                parentEl = selector;

            } else if (parent) {

                parentEl = selector ?
                    parent.querySelector(selector) :
                    (parent.isInDOM() ? parent.get('el') : parent.get('edom').firstChild);

            } else if (globally) {

                parentEl = document.querySelector(selector);

            }

            return parentEl;
        },
        hasChildren: function () {
            return this.getChildren().length > 0;
        },
        /**
         *
         * @returns {this}
         */
        prepareElements: function () {
            var me = this;
            me.set('elements',
                me.get('edom').childNodes.length > 1 ?
                    Array.prototype.slice.call(me.get('edom').childNodes) : [me.get('edom').firstChild]
            );
            return me;
        },
        /**
         * @returns {View}
         */
        reAppendChildren: function () {
            var views = this.getChildren(),
                l = views.length,
                i = 0;

            for (; i < l; i++) {
                views[i].appendTo(this);
            }

            return this;
        },
        //todo: focus and blur
        focus: function () {
            var me = this,
                Array = ya.mixins.Array,
                __find = Array.find;

            if (me._destroyed) {
                return false;
            }

            var idx = __find(focused, '_config.id', me.getId());

            if (idx < 0 && me.isInDOM()) {

                focused
                    .push(me);

                me
                    .set('focused', true);

                me
                    .fireEvent(
                    'focus',
                    me
                );
            }

            return me;
        },
        blur: function () {
            var me = this,
                __find = ya.mixins.Array.find,
                idx = __find(focused, '_config.id', me.getId());

            if (idx >= 0) {

                focused
                    .splice(idx, 1);

                me
                    .set('focused', false);
                me
                    .fireEvent('blur');

            }

            return me;
        },
        isFocus: function () {
            return this._focused;
        },
        /**
         * @returns {Boolean}
         */
        isVisible: function () {
            return this._visible && this.isInDOM();
        },
        /**
         *
         * @returns {Boolean}
         */
        hasCustomId: function () {
            return this._customId;
        },
        /**
         * @returns {View}
         */
        show: function () {
            var me = this;


            if (!me._el)
                return me;

            me
                ._el
                .classList
                .remove(
                me.getHideCls()
            );

            me
                .set('visible', true);
            me
                .fireEvent('show', me);

            ya.Job
                .$create({
                    config: {
                        repeat: 1,
                        task: function () {

                            me.focus();

                        }
                    }
                }).doIt();

            return me;
        },
        /**
         * @returns {View}
         */
        hide: function () {
            var me = this;

            if (!me._el)
                return me;

            //todo: added blur action
            me.blur();

            me._el.classList.add(me.getHideCls());

            me.set('visible', false);

            me.fireEvent('hide', me);

            return me;
        },
        toggle: function () {
            var me = this;

            if (me._visible) {

                me.hide();

            } else {

                me.show();

            }

        },
        onCompile: function () {
        },
        // abstract
        onRender: function () {
        },
        //todo : destory
        destroy: function () {
            var me = this,
                $colManager = ya
                    .collection
                    .$manager;

            //todo: blur when cleared
            me
                .blur();


            // unbind from parent
            if (me.getParent()) {

                me
                    .getParent()
                    .removeChild(me);

            }

            // clear dom
            if (me.isInDOM()) {

                me
                    .clear();

            }

            // deregister from manager
            ya
                .view
                .$manager
                .deregister(
                me.getId()
            );


            // kill all collection connected with view
            // TODO: we should kill only those which were created by view
            me.each(
                me.getCollections(),
                function (c) {
                    $colManager
                        .deregister(
                        c.getId()
                    );
                }
            );

            me
                .__super();

            return me;
        }
    });

}());
/**
 * @namespace ya.view
 * @class TDOM
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'view.TDOM',
    defaults: {
        /**
         * @attribute config.view
         * @type ya.View
         * @required
         */
        view: null,
        /**
         * @attribute config.DOM
         * @type Node
         * @required
         */
        DOM: null,
        bindings: null
    },
    mixins: [
        ya.mixins.Array
    ],
    /**
     * @method init
     * @param opts
     * @private
     * @returns {*}
     */
    init: function (opts) {
        var me = this;

        me
            .__super(opts)
            .initTDOM();

        return me;
    },
    /**
     * @method initRequired
     * @private
     * @returns {*}
     */
    initRequired: function () {
        var me = this;

        if (!me.getView()) {
            throw ya.Error.$create('ya.view.TDOM requires view object', 'T2DOM1');
        }

        if (!me.getDOM()) {
            throw ya.Error.$create('ya.view.TDOM requires DOM cloned from template', 'T2DOM2');
        }

        if (!me.getBindings()) {
            throw ya.Error.$create('ya.view.TDOM requires bindings cloned from template', 'T2DOM3');
        }

        return me;
    },
    /**
     * @method initTDOM
     * @private
     * @returns {*}
     */
    initTDOM: function () {
        var me = this,
            view = me.getView(),
            bindings = me.getBindings(),
            dom = me.getDOM(),
            $B = ya.view.Template.$BindingType,
            namespace, callback, event, model;

        me.each(bindings, function (binding) {

            switch (binding.type) {
                case $B.IF :
                    binding.pointer = dom
                        .querySelector('[ya-id="' + binding.pointer + '"]');

                    me.each(binding.headers, function (header) {
                        namespace = header[0];
                        model = view.getModel(namespace);
                        if (model) {
                            binding.models[namespace] = model;

                            // put callback in variable
                            callback = (function (binding) {
                                return function () {
                                    me.updateCond(binding);
                                };
                            }(binding));

                            event = 'data' + header[1].charAt(0).toUpperCase() + header[1].slice(1) + 'Change';

                            // and push it to callbacks array
                            // which will be useful when the view
                            // will be destroyed (for remove
                            // unnecessary listeners)
                            binding.callbacks.push({
                                namespace: model.getNamespace(),
                                event: event,
                                callback: callback
                            });

                            // add callback to the model
                            model.addEventListener(
                                event,
                                callback
                            );


                            me.updateCond(binding);
                        }

                    });

                    break;
                case $B.ATTR :

                    //todo: different binging action when attribute does not have value
                    if (binding.fillAttr) {

                        binding.pointer = dom
                            .querySelector('[ya-id="' + binding.pointer + '"]');

                    } else {

                        binding.pointer = dom
                            .querySelector('[ya-id="' + binding.pointer + '"]')
                            .attributes
                            .getNamedItem(binding.name);

                    }

                    // iterate trough each header
                    me.each(binding.headers, function (header) {

                        namespace = header[0];
                        // search for model
                        model = view.getModel(namespace);
                        if (model) {

                            binding.models[namespace] = model;

                            // put callback in variable
                            callback = (function (binding) {
                                return function () {
                                    me.updateAttr(binding);
                                };
                            }(binding));

                            event = 'data' + header[1].charAt(0).toUpperCase() + header[1].slice(1) + 'Change';

                            // and push it to callbacks array
                            // which will be useful when the view
                            // will be destroyed (for remove
                            // unnecessary listeners)
                            binding.callbacks.push({
                                namespace: model.getNamespace(),
                                event: event,
                                callback: callback
                            });

                            // add callback to the model
                            model.addEventListener(
                                event,
                                callback
                            );

                            me.updateAttr(binding);
                        }

                    });

                    break;

                case $B.TEXT :

                    binding.pointer = dom.querySelector('[ya-id="' + binding.pointer + '"]');

                    me.each(binding.headers, function (header) {

                        namespace = header[0];
                        model = view.getModel(namespace);
                        if (model) {

                            binding.models[namespace] = model;

                            // assign callback to the variable
                            callback = (function (binding) {
                                return function () {
                                    me.updateTxt(binding);
                                };
                            }(binding));

                            // and push it to the callbacks array
                            // which will be useful when the view
                            // will be destroyed (for remove
                            // unnecessary listeners)
                            binding.callbacks.push({
                                namespace: model.getNamespace(),
                                event: event,
                                callback: callback
                            });

                            // build event name
                            event = 'data' + header[1].charAt(0).toUpperCase() + header[1].slice(1) + 'Change';

                            // and add listener on it
                            model.addEventListener(
                                event,
                                callback
                            );

                            // update DOM
                            me.updateTxt(binding);
                        }

                    });


                    break;

                case $B.COL :
                    var collection, collections, definition;

                    binding.pointer = dom.querySelector('[ya-id="' + binding.pointer + '"]');
                    collection = binding.collection;

                    if (collection.id) {

                        // Try to find collection by its id
                        collection.pointer = ya.collection.$manager.getItem(collection.id);

                    } else {

                        // If not founded try match one from view object,
                        // by namespace (if exist) or by class name
                        collections = view.getCollections();
                        me.some(collections, collection.namespace ?
                            function (_collection) {

                                if (_collection.getNamespace() === collection.namespace) {
                                    collection.pointer = _collection;

                                    return true;
                                }

                            } : function (_collection) {

                            if (_collection.__class__ === collection.class) {
                                collection.pointer = _collection;

                                return true;
                            }

                        });

                    }

                    if (!collection.pointer) {

                        // if still collection is not founded
                        // create new one
                        definition = collection.class.split(".");
                        collection.pointer = ya.$factory({
                            module: definition.shift(),
                            alias: definition.join("."),
                            //todo : binding fix
                            namespace: collection.namespace,
                            id: collection.id
                        });

                    }

                    if (collection.pointer) {
                        // and assign it to the view
                        view.setCollection(collection.pointer);
                    }

                    // setup connection between view and collection
                    me.setupCollection(binding);

                    break;
                case $B.MODEL :

                    binding.pointer = dom.querySelector('[ya-id="' + binding.pointer + '"]');
                    model = binding.model;

                    model.pointer = view.getModel(model.namespace);

                    if (!model.pointer) {

                        definition = model.class.split('.');
                        model.pointer = ya.$factory({
                            module: definition.shift(),
                            alias: definition.join('.'),
                            namespace: model.namespace
                        });

                        view.setModel(model.pointer);

                    }

                    me.setupModel(binding);

                    break;
                default:
                    binding.pointer = dom.querySelector('[ya-id="' + binding.pointer + '"]');

                    me.setupView(binding);

            }

        });

        me.setDOM(dom);
        me.setBindings(bindings);

        return me;
    },
    setupModel: function (binding) {
        var me = this,
            element = binding.pointer,
            bindModel = binding.model,
            model = bindModel.pointer,
            property = bindModel.property,
            callback, event;

        callback = (function (binding) {
            return function () {
                me.updateModel(binding);
            };
        }(binding));

        event = property + 'Change';

        // todo: clear listeners when model removed from view
        model.addEventListener(event, callback, me);
        element.addEventListener('keyup', function (e) {

            model.data(property, element.value);

        });

        me.updateModel(binding);
    },
    updateCond: function (binding) {
        var me = this,
            txt = binding.condition,
            model, value, method, view;

        me.each(binding.headers, function (header, idx) {
            model = binding.models[header[0]];
            value = model.data(header[1]);
            if (typeof value === 'undefined') {
                value = '"undefined"';
            }

            txt = txt.replace('{{' + header.join('.') + '}}', value);

        });

        if (!!ya.exec(txt)) {
            console.log('TRUE:')
        } else {
            console.log('FALSE:')
        }

    },
    updateModel: function (binding) {
        var element = binding.pointer,
            bindModel = binding.model;

        element.value = bindModel.pointer.data(bindModel.property);

    },
    setupView: function (binding) {
        var me = this,
            viewInstance,
            definition = binding.view.class.split('.'),
            config = {
                module: definition.shift(),
                alias: definition.join('.'),
                renderTo: binding.pointer
            };

        if (binding.view.id) {
            config.id = binding.view.id;
        }

        viewInstance = ya.$factory(config);


        me
            .getView()
            .addChild(
            viewInstance,
            binding.pointer
        );

        binding.view = viewInstance;
    },
    /**
     * setup all connection between collection and view
     * and generate new elements for all records from it
     * @method setupCollection
     * @private
     * @param binding
     */
    setupCollection: function (binding) {
        var me = this,
            bindCol = binding.collection,
            collection = bindCol.pointer,
            callback, remCallback;

        callback = (function (binding) {
            return function () {
                console.log('update', binding);
                me.updateCollection(binding);
            };
        }(binding));

        remCallback = (function (binding) {
            return function (col, records) {
                console.log('remove', binding);
                me.removeFromCollection(binding, records);
            };
        }(binding));

        binding.collection.connections = [];

        // generates new view
        collection.each(function (record, idx) {

            record.set('index', idx);

            me.generateView(binding, record, idx);

        });

        me.updateCollection(binding);

        //todo: clear all of this things
        collection.addEventListener('prepare', callback, me);
        collection.addEventListener('filter', callback, me);
        collection.addEventListener('sort', callback, me);
        collection.addEventListener('push', callback, me);
        collection.addEventListener('remove', remCallback, me);

    },
    /**
     * Update DOM connected with collection
     * @method updateCollection
     * @private
     * @param binding
     * @returns {*}
     */
    updateCollection: function (binding) {
        var me = this,
            __indexOf = Array.prototype.indexOf,
            __find = ya.mixins.Array.find,
            collection = binding.collection.pointer,
            parent = binding.pointer,
            childNodes = parent.childNodes,
            connections = binding.collection.connections,
            len, conn, idx, viewIdx;

        if (me.getView().isInDOM()) {

            collection.each(function (record, index) {

                idx = __find(
                    connections,
                    'model._clientId',
                    record
                        ._clientId
                );

                if (idx >= 0) {

                    conn = connections[idx];


                    viewIdx = __indexOf.call(childNodes, conn.view._el);
                    if (viewIdx > -1 && viewIdx !== index) {

                        if (childNodes.length - 1 > index) {

                            parent.insertBefore(childNodes[index], childNodes[viewIdx]);

                        } else {

                            parent.appendChild(childNodes[viewIdx]);

                        }

                    }

                } else {

                    me.generateView(binding, record, index).render();

                }

            });

            len = connections.length;
            while (len--) {

                conn = connections[len];
                idx = __find(collection._set, '_clientId', conn.model._clientId);
                if (idx < 0) {

                    connections
                        .splice(len, 1)
                        .pop();
                    conn
                        .view
                        .clear();

                }

            }

        }

        return me;
    },
    /**
     * Clear dependencies between view and model which
     * was removed from collection
     *
     * @method removeFromCollection
     * @private
     * @param binding
     * @param records
     * @returns {*}
     */
    removeFromCollection: function (binding, records) {
        var me = this,
            __find = ya.mixins.Array.find,
            connections, idx, conn, record;

        // get array of connections between collection
        // and generated child views
        connections = binding.collection.connections;

        while (records.length) {
            // iterate trough all removed records
            // get one
            record = records.pop();
            // find same model in connections array
            idx = __find(connections, 'model._clientId', record._clientId);

            // put connection object into variable
            conn = connections[idx];

            // remove it from connections array
            connections.splice(idx, 1);

            // destroy view
            conn.view.destroy();

        }

        return me;
    },
    /**
     * @method generateView
     * @private
     * @param binding
     * @param record
     * @param idx deprecated
     * @returns {*}
     */
    generateView: function (binding, record, idx) {
        var me = this,
            collection = binding.collection,
            tpl = ya.view.template.$manager.getItem(collection.tpl),
            definition = collection.view.split('.'),
            viewInstance;

        viewInstance = ya.$factory({
            module: definition.shift(),
            alias: definition.join('.'),
            renderTo: binding.pointer,
            parent: me.getView(),
            tpl: tpl || undefined,
            models: [
                record
            ]
        });

        collection.connections.push({
            view: viewInstance,
            model: record
        });

        return viewInstance;
    },
    /**
     * @method updateTxt
     * @private
     * @returns {*}
     */
    updateTxt: function (binding) {
        var me = this,
            txt = binding.original,
            model, value, method, view, filters, filter;

        me.each(binding.headers, function (header, idx) {
            var filterHeader = '';

            model = binding.models[header[0]];
            if (header[1].search(/\$/) === 0) {
                value = model.get(header[1].substring(1));
            } else {
                value = model.data(header[1]);
                if (typeof value === 'undefined') {
                    value = "";
                }
            }

            view = me.getView();
            if (binding.filters[idx].length) {
                filters = binding.filters[idx];
                view = me.getView();
                for (var i = 0, l = filters.length; i < l; i++) {
                    filter = filters[i];
                    filterHeader += '||' + filter;
                    filter = filter.split('.');
                    var scope;
                    if (filter.length > 1) {
                        scope = view._config[filter[0]];
                        method = scope[filter[1]];
                    } else {
                        scope = view;
                        method = view[filter[0]];
                    }
                    if (method) {
                        value = method.call(scope, value, model, view);
                    }
                }
            }

            txt = txt.replace('{{' + header.join('.') + filterHeader + '}}', value);
        });

        binding.pointer.innerHTML = txt;

    },
    /**
     * @method updateAttr
     * @private
     * @returns {*}
     */
    updateAttr: function (binding) {
        var me = this,
            txt, view, filters, filter, method,
            filterHeader = '',
            model, value = true;

        //todo: fill attribute binding
        if (binding.fillAttr) {

            me.each(binding.headers, function (header) {

                value = value && binding.models[header[0]].data(header[1]);
                if (typeof value === 'undefined') {
                    value = false;
                }

            });

            if (value) {

                binding.pointer.setAttribute(binding.name, true);

            } else {

                binding.pointer.removeAttribute(binding.name);

            }

        } else {

            txt = binding.original;

            me.each(binding.headers, function (header, idx) {

                model = binding.models[header[0]];
                if (header[1].search(/\$/) === 0) {
                    value = model.get(header[1].substring(1));
                } else {
                    value = model.data(header[1]);
                    if (typeof value === 'undefined' || value === null) {
                        value = "";
                    }
                }

                view = me.getView();
                if (binding.filters[idx].length) {
                    filters = binding.filters[idx];
                    view = me.getView();
                    for (var i = 0, l = filters.length; i < l; i++) {
                        filter = filters[i];
                        filterHeader += '||' + filter;
                        filter = filter.split('.');
                        if (filter.length > 1) {
                            var property = view._config[filter[0]];
                            method = property[filter[1]];
                        } else {
                            method = view[filter[0]];
                        }
                        if (method) {
                            value = method.call(view.getParent(), value, model, view);
                        }
                    }
                }

                txt = txt
                    .replace(
                    '{{' + header.join('.') + filterHeader + '}}',
                    value
                );

            });

            binding.pointer.value = txt;

        }

    },
    /**
     * Remove all connections between view and models
     * @method clear
     * @private
     */
    clear: function () {
        var __each = ya.mixins.Array.each,
            me = this,
            bindings = me.getBindings(),
            model,
            callbacks;

        __each(bindings, function (binding) {

            callbacks = binding.callbacks;
            if (callbacks) {

                __each(binding.callbacks, function (options) {

                    model = binding.models[options.namespace];

                    model.removeEventListener(options.event, options.callback);

                });

            }

        });

        bindings.length = 0;

        return me;
    },
    /**
     * Returns
     * @method getEDOM
     * @returns {Function|Node|TestNode|firstChild|*|firstChild}
     */
    getEDOM: function () {
        var me = this,
            dom = me.getDOM(),
            node;

        if (
            dom.childNodes.length > 1
        ) {

            node = dom.firstChild;
            while (node) {
                if (node.nodeType !== 3) {
                    node.classList.add(
                        me.getView().getId()
                    );
                }
                node = node.nextSibling;
            }

        } else if (dom.firstChild.nodeType !== 3) {
            dom.firstChild.setAttribute(
                'id',
                me.getView().getId()
            );
        }

        return dom;
    }
});
/**
 * @namespace ya
 * @class ya.view.Template
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'view.Template',
    static: {
        id: 0,
        DOM4: (function () {
            return !document.createAttribute('rel') instanceof Node;
        }),
        BindingType: {
            IF: 7,
            MODEL: 6,
            CSS: 5,
            VIEW: 4,
            TEXT: 3,
            ATTR: 2,
            COL: 1
        },
        types: {
            td: 'tr',
            tr: 'tbody',
            thead: 'table',
            tfooter: 'table',
            tbody: 'table'
        }
    },
    mixins: [
        ya.mixins.Array
    ],
    defaults: {
        id: null,
        /**
         * @attribute config.tpl
         * @type HTMLElement
         * @required
         */
        tpl: null,
        /**
         * @attribute config.tDOM TDOM object definition
         * @type {Object}
         */
        tDOM: null
    },
    init: function (opts) {
        var me = this;

        me
            .__super(opts)
            .initRegister()
            .initBindings();

    },
    initRequired: function () {
        var me = this;

        if (!me.getTpl()) {

            throw ya.Error.$create('ya.view.Template: Missing tpl property in configuration object', 'YVT1');

        }

        if (!me._html.hasChildNodes()) {

            throw ya.Error.$create(me.__class__ + ': Its seems that object doesnt contain any template', 'YVT2');

        }

        return me;
    },
    initDefaults: function () {
        var me = this,
            html = me.getTpl(),
            docFragment = document.createDocumentFragment(),
            types = ya.view.Template.$types,
            tmp;

        me.setId(me.getId() || 'template-' + ya.view.template.$manager.getUniqueId());
        me.setTDOM(me.getTDOM() || ya.view.TDOM);

        if (Array.isArray(html)) {
            tmp = '';
            // for and concatenating is faster than Array.join
            for (var i = 0, l = html.length; i < l; i++) {

                tmp = tmp + html[i];

            }

            html = tmp;

        }

        if (typeof html === 'string' || html instanceof String) {
            var firstElMat = html.match(/\<(.*?)[\s|>]/),
                firstEl = firstElMat ? firstElMat[1] : '',
                container = types[firstEl] ? types[firstEl] : 'div',
                evaluated = document.createElement(container),
                el;

            evaluated.innerHTML = html;

            while (evaluated.hasChildNodes()) {

                if(evaluated.firstChild.nodeType === 3){
                    el = document.createElement('span');
                    el.appendChild(evaluated.firstChild);
                    docFragment.appendChild(el);
                }else{
                    docFragment.appendChild(evaluated.firstChild);
                }

            }

        } else if (html instanceof DocumentFragment) {

            docFragment = html;

        } else if (html instanceof HTMLElement) {

            docFragment.appendChild(html.firstChild);

        }

        me.set('html', docFragment);

        return me;
    },
    initRegister: function () {
        var me = this;

        ya.view.template.$manager.register(
            me.getId(),
            me
        );

        return me;
    },
    /**
     * @method initBindings
     * @private
     * @returns {*}
     */
    initBindings: function () {
        var me = this,
            texts,
            attrs;


        attrs = me.findAttrsBindings();
        texts = me.findTextBindings();

        me.set('bindings', attrs.concat(texts));

        return me;
    },
    /**
     * Finds all attribute bindings
     * @method findAttrsBindings
     * @private
     */
    findAttrsBindings: function () {
        var me = this,
            attrs = [],
            bindings = [],
            regEx = /^ya-(.*)/i,
            nodeAttrs = [],
            __slice = Array.prototype.slice,
            $DOM4 = ya.view.Template.$DOM4,
            binding,
            walker,
            match,
            attr,
            node;

        walker = document.createTreeWalker( // Create walker object and
            me._html,
            NodeFilter.SHOW_ELEMENT,
            null,
            false
        );

        while (walker.nextNode()) {
            // walk through all nodes

            node = walker.currentNode;
            // HTMLElement node
            // get all attributes
            // and push to array
            nodeAttrs = __slice.call(node.attributes);

            // check if parent contents ya attributes
            // if yes it means that current element is
            // a template and we dont want to check it
            if (me.isTemplate(node)) {
                continue;
            }
            // DOM4 polyfill - attribute no longer inherits from Node
            // so we need to set owner element manually
            if ($DOM4) {
                /*jshint -W083 */
                me.each(nodeAttrs, function (attr) {
                    attr.ownerElement = node;
                });

            }

            attrs = attrs.concat(nodeAttrs);

        }
        // execute attribute processing

        while (attrs.length) {

            attr = attrs.pop();

            match = attr.nodeName.match(regEx);

            switch (match && match[1]) {
                case 'collection' :
                    binding = me.prepareColBindings(attr);
                    break;
                case 'view' :
                    if (attr.ownerElement.hasAttribute('ya-if')) continue;
                    binding = me.prepareViewBindings(attr);
                    break;
                case 'model' :
                    binding = me.prepareModelBindings(attr);
                    break;
                case 'css' :
                    binding = me.prepareCSSBindings(attr);
                    break;
                case 'if' :
                    binding = me.prepareIfBindings(attr);
                    break;
                default :
                    binding = me.prepareAttrBindings(attr);

            }

            if (binding) {
                bindings.push(binding);
            }

        }

        return bindings;
    },
    /**
     * @method isTemplate
     * @private
     * @param node
     * @returns {boolean}
     */
    isTemplate: function (node) {

        node = node.parentNode;
        while (node.parentNode) {
            if (
                node.attributes.getNamedItem('ya-view') ||
                node.attributes.getNamedItem('ya-collection')
            ) {
                return true;

            }

            node = node.parentNode;
        }

        return false;
    },
    /**
     *
     * @method findTextBindings
     * @private
     * @returns {Array}
     */
    findTextBindings: function () {
        var me = this,
            bindings = [],
            binding,
            walker;

        walker = document.createTreeWalker( // Create walker object and
            me._html,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        while (walker.nextNode()) {
            // walk through all nodes

            binding = me.prepareTextBindings(walker.currentNode);
            if (binding) {
                bindings.push(binding);
            }

        }

        // we cant mess with DOM when we walking through it
        // so we need to replace text nodes after we found all
        // matches
        me.each(bindings, function (binding) {

            binding.old.parentNode.replaceChild(binding.doc, binding.old);

            delete binding.doc;
            delete binding.old;

        });

        return bindings;
    },
    /**
     * @method findTextBindings
     * @private
     * @param node
     * @returns {boolean}
     */
    prepareTextBindings: function (node) {
        var results = node.data.match(/\{\{(.*?)\}\}/gi),// we searching for mustached text inside it
            i, len, headers, header, binding = false, result, parts, headerFilters, filters;

        if (results) { // and if we have positive match
            var doc = document.createElement('span'),// we create new span element
            // and id for binding
                rId = ya.view.Template.$id++;

            doc.setAttribute('ya-id', rId); // and add generated id.

            i = 0;
            len = results.length;
            headers = [];
            filters = [];

            // In the end we replace all match via data.
            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4));
                parts = header.split('||');
                header = parts[0].split('.');
                if (parts.length > 1) {
                    headerFilters = parts.splice(1);
                } else {
                    headerFilters = [];
                }

                filters.push(headerFilters);
                headers.push(header);

            }

            // We also keep founded bindings.
            binding = {
                original: node.value || node.data,
                old: node,
                doc: doc,
                models: {},
                callbacks: [],
                headers: headers,
                filters: filters,
                type: 3,
                pointer: rId
            };

        }

        return binding;
    },
    prepareModelBindings: function (attr) {
        var node = attr.ownerElement,
            rId = node.getAttribute('ya-id') || ya.view.Template.$id++,
            options = attr.value.match(/(?:class|namespace)[?!:]([\w\.]+)/gi),
            property = node.getAttribute('name') || null,
            binding = {
                pointer: rId,
                type: ya.view.Template.$BindingType.MODEL,
                model: {
                    class: 'ya.Model',
                    property: property
                }
            },
            option;

        if (!property) {

            throw ya.Error.$create('Missing name property in node', 'YVT3');

        }

        node.setAttribute('ya-id', rId);

        while (options && options.length) {
            option = options.pop().split(':');
            binding.model[option[0]] = option[1];
        }

        return binding;
    },
    prepareIfBindings: function (attr) {
        var condition = attr.value,
            results = condition.match(/\{\{(.*?)\}\}/gi),// we searching for mustached text inside it
            node = attr.ownerElement,
            rId = node.getAttribute('ya-id') || ya.view.Template.$id++,
            binding = {
                pointer: rId,
                type: ya.view.Template.$BindingType.IF,
                condition: condition,
                models: {},
                callbacks: []
            },
            DOM = ya.mixins.DOM,
            headers = [], header, result, i = 0, len;

        node.setAttribute('ya-id', rId);

        if (node.hasChildNodes()) {

            binding.tpl = ya.$factory({
                module: 'ya',
                alias: 'view.Template',
                tpl: DOM.removeChildren(node)
            }).getId();

        }

        if (results) {

            len = results.length;
            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4));
                header = header.split('.');
                headers.push(header);

            }

            binding.headers = headers;
        }

        return binding;
    },
    /**
     * @method prepareColBindings
     * @private
     * @param attr
     * @returns {{pointer: (number), type: (Template.static.BindingType.COL), collection: {view: string, class: string}}}
     */
    prepareColBindings: function (attr) {
        var options = attr.value.match(/(?:class|id|namespace|model|view)[?!:]([\S]+)/gi),
            node = attr.ownerElement,
            rId = node.getAttribute('ya-id') || ya.view.Template.$id++,
            collection = {
                view: 'ya.View',
                class: 'ya.Collection'
            },
            binding = {
                pointer: rId,
                type: ya.view.Template.$BindingType.COL,
                collection: collection
            },
            DOM = ya.mixins.DOM,
            option;

        node.setAttribute('ya-id', rId);

        while (options && options.length) {

            option = options.pop().split(':');
            collection[option[0]] = option[1];

        }

        if (node.hasChildNodes()) {


            var tpl = ya.$factory({
                module: 'ya',
                alias: 'view.Template',
                tpl: DOM.removeChildren(node)
            });

            collection.tpl = tpl.getId();

        }

        //console.log(binding);

        return binding;
    },
    /**
     * @method prepareViewBindings
     * @private
     * @param attr
     * @returns {{pointer: (string|number), type: (number|.static.BindingType.VIEW|Template.static.BindingType.VIEW), view: {class: string}}}
     */
    prepareViewBindings: function (attr) {
        var node = attr.ownerElement,
            rId = node.getAttribute('ya-id') || ya.view.Template.$id++,
            options = attr.value.match(/(?:class|id)[?!:]([\w\.]+)/gi),
            binding = {
                pointer: rId,
                type: ya.view.Template.$BindingType.VIEW,
                view: {
                    class: 'ya.View'
                }
            },
            option;

        node.setAttribute('ya-id', rId);

        while (options && options.length) {
            option = options.pop().split(':');
            binding.view[option[0]] = option[1];
        }

        return binding;
    },
    /**
     *
     * @method prepareCSSBindings
     * @private
     * @param attr
     * @returns {{original: *, fillAttr: boolean, headers: Array, callbacks: Array, models: {}, name: string, type: *, pointer: string}}
     */
    prepareCSSBindings: function (attr) {
        var node = attr.ownerElement,
            results = attr.value && attr.value.match(/\{\{(.*?)\}\}/gi),
            len = results && results.length,
            headers = [], i = 0,
            original, binding, header, rId, style, parts, headerFilters, filters, result;

        rId = node.getAttribute('ya-id');
        if (!rId) {

            rId = ya.view.Template.$id++;
            node.setAttribute('ya-id', rId);

        }

        if (results) {

            filters = [];
            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4));
                parts = header.split('||');
                header = parts[0].split('.');
                if (parts.length > 1) {
                    headerFilters = parts.splice(1);
                } else {
                    headerFilters = [];
                }
                filters.push(headerFilters);
                headers.push(header);

            }

        }

        original = (node.getAttribute('style') || "") + attr.value;

        node.setAttribute('style', original);

        binding = {
            original: original,
            fillAttr: false,
            headers: headers,
            callbacks: [],
            filters: filters,
            models: {},
            name: 'style',
            type: ya.view.Template.$BindingType.ATTR,
            pointer: rId
        };

        return binding;
    },
    /**
     *
     * @method prepareAttrBindings
     * @private
     * @param attr
     * @returns {*}
     */
    prepareAttrBindings: function (attr) {
        var node = attr.ownerElement,
            results = attr.value && attr.value.match(/\{\{(.*?)\}\}/gi),
            len = results && results.length,
            original = attr.value,
            headers = [], i = 0,
            binding, rId, header, result, parts, headerFilters, filters;

        if (results) {

            rId = node.getAttribute('ya-id');
            if (!rId) {

                rId = ya.view.Template.$id++;
                node.setAttribute('ya-id', rId);

            }

            filters = [];
            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4));
                parts = header.split('||');
                header = parts[0].split('.');
                if (parts.length > 1) {
                    headerFilters = parts.splice(1);
                } else {
                    headerFilters = [];
                }
                filters.push(headerFilters);
                headers.push(header);

            }

            binding = {
                fillAttr: ya.mixins.CSSStyle.isFillAttr(attr.name),
                name: attr.name,
                original: original,
                models: {},
                callbacks: [],
                headers: headers,
                filters: filters,
                type: ya.view.Template.$BindingType.ATTR,
                pointer: rId
            };

        }

        return results ? binding : null;
    },
    /**
     * Returns instance of TDOM object with cloned DOM
     * and biding array
     * @method getTDOMInstance
     * @param view
     * @returns {Function|*}
     */
    getTDOMInstance: function (view) {
        var me = this;

        return me.getTDOM().$create({
            config: {
                view: view,
                bindings: ya.$clone(me.get('bindings')),
                DOM: me.get('html').cloneNode(true)
            }
        });
    }
});