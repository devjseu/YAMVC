/*! yamvc v0.2.0 - 2014-03-14 
 *  License:  */
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
/**
 * @namespace ya.mixins
 * @class Array
 */
ya.$set('ya', 'mixins.Array', {
    /**
     *
     * @param array
     * @param key
     * @returns {Number}
     */
    find: function (array, key /*[, value]*/) {
        var len = array.length,
            argsLen = arguments.length,
            val = argsLen > 2 ? arguments[2] : null,
            rec;

        if (argsLen > 1) {

            while (len--) {

                rec = array[len];
                if (rec[key] === val) {
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
    some: Array.prototype.some ? function (array, fun) {
        Array.prototype.some.call(array, fun);
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
     *
     * @param opts
     * @returns {Function}
     */
    $extend: function (opts) {
        opts = opts || {};

        var Parent = this,
            _super = this.prototype,
            defaults = ya.$merge(Parent.__defaults__ || {}, opts.defaults),
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
            __Class,
            __extends;

        __Class = function () {
            var key;
            //
            this._config = {};

            // Initialize defaults.
            for (key in defaults) {
                if (__hasProp.call(defaults, key)) this._config[key] = defaults[key];
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
            child.prototype.__class__ = (opts.module || ya.$module()) + '.' + opts.alias;

            for (var staticCore in ya.mixins.CoreStatic) {

                if (ya.mixins.CoreStatic.hasOwnProperty(staticCore)) {
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
            child.__defaults__ = defaults;

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

        __extends(__Class, Parent);

        if (opts.alias) {

            ya.$set(opts.module || ya.$module(), opts.alias, opts.singleton ? new __Class() : __Class);

        }

        return __Class;
    },
    $create: function () {
        /*jshint -W058 */
        var Obj = this,
            args = Array.prototype.concat.apply([Obj], arguments);

        return  new (Function.prototype.bind.apply(Obj, args));
    },
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
            obj[ items[i] ] = true;
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
        },
        get: function () {

        }
    });

}());

/**
 * @namespace ya.mixins
 * @class DOM
 */
ya.$set('ya', 'mixins.DOM', { // todo: change name to mixins.DOM
    /**
     * checks if passed selector match to main DOM element
     * @method isQueryMatch
     * @param selector String with selector
     * @param {HTMLElement} el DOM to match
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

/**
 * @namespace ya.mixins
 * @class Observable
 */
ya.$set('ya', 'mixins.Observable', {
    init: function () {
        this.set('listeners', {});
        this.set('suspendEvents', false);
    },
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
            scope;

        scope = shift.call(arguments);
        for (var i = 0, li = this._listeners[evName] || [], len = li.length; i < len; i++) {
            if (ret) {
                ret = li[i].apply(scope, arguments);
                ret = typeof ret === 'undefined' ? true : ret;
            }
        }
        return ret;
    },

    /**
     * fire event
     * @version 0.1.12
     * @param evName
     * @param callback
     * @returns {this}
     *
     */
    addEventListener: function (evName, callback) {
        var listeners = this._listeners[evName] || [];
        listeners.push(callback);
        this._listeners[evName] = listeners;
        return this;
    },

    /**
     * fire event
     * @version 0.1.12
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
        this.set('suspendEvents', true);
        return this;
    },
    /**
     * resume all events
     */
    resumeEvents: function () {
        this.set('suspendEvents', false);
        return this;
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
        this.bindMethods.apply(this, arguments);
        this.init.apply(this, arguments);
    }

    /**
     @method init
     @abstract
     */
    Core.prototype.init = function () {
    };

    /**
     @method initDefaults
     @abstract
     */
    Core.prototype.initDefaults = function () {
    };

    /**
     @method initRequired
     @abstract
     */
    Core.prototype.initRequired = function () {
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
    Core.prototype.onChange = function (property, callback) {
        var me = this;

        me.addEventListener(property + 'Change', callback);

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

    // Stores all mixins initializing functions.
    Core.__mixins__ = [];

    // Stores all defaults.
    Core.__defaults__ = {};

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

        return me;
    },
    toString: function () {
        var me = this;

        return 'ya.Error(' + me.getId() + '): ' + me.getMessage();
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
        proxy: null
    },
    /**
     * initialize collection
     * @method init
     * @param opts
     */
    init: function (opts) {
        var me = this;

        me.__super(opts);

        me.initConfig(opts)
            .initDefaults()
            .initData();

        ya.collection.$Manager.register(me.getId(), me);

        return me;
    },
    /**
     * @method init
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        me.setId(me.getId() || 'collection-' + ya.collection.$Manager.getCount());
        me.setModel(me.getModel() || ya.$get('ya.Model'));

        me.set('set', []);
        me.set('cache', []);
        me.set('removed', []);
        me.set('filters', []);
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
            record,
            ModelDefinition = me.getModel(),
            namespace = me.getNamespace();

        if (!Array.isArray(records)) {
            records = [records];
        }

        while (records.length) {

            record = records.pop();

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

            if(record.getNamespace() !== me.getNamespace()) {

                throw ya.Error.$create('Model should have same namespace as collection', 'COL2');

            }

            me._cache.push(record);

            me.fireEvent('pushed', me, record);

        }

        me.filter();

        return me;
    },
    // return number of records in collection
    /**
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
        me.set('removed', []);

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
        me.filter();

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
            filLength,
            filter;

        filLength = filters.length;
        while (filLength--) {

            filter = filters[filLength];
            if (typeof filter !== 'function' && filter.id === id) {

                filters.splice(filLength, 1);

                break;

            }

        }

        me.filter();

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
            filLength = 0,
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
            filLength = filters.length;
            while (filLength--) {

                filterFn = typeof filters[filLength] === 'function' ? filters[filLength] : filters[filLength].fn;
                passed = passed && filterFn(records[i]);

            }

            if (passed) {

                filtered.push(records[i]);

            }

        }

        me.set('set', filtered);
        me.fireEvent('afterFilter', me, filters);

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
     * @param fn
     * @returns {}
     */
    findOneBy: function (fn) { // Return index of first matched record.
        var me = this,
            records = me._set,
            len = records.length;

        while (len--) {

            if (fn(records[len])) break;

        }

        return len;
    },
    /**
     * @param fn
     * @returns {Array}
     */
    getOneBy: function (fn) { // Return first matched record.
        var me = this,
            records = me._set,
            record,
            len = records.length;

        while (len--) {

            if (fn(records[len])) {
                record = records[len];
                break;

            }

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
            data = me.get('data'),
            idProperty = me.get('idProperty'),
            deferred = ya.$Promise.deferred(),
            namespace = me.getNamespace(),
            action = ya.data.Action.$create(),
            callback,
            key, i = 0;

        for (key in params) i++;

        if (
            i === 0
            )
            throw ya.Error.$create('You need to pass at least one condition to load model collection', 'COLLECTION2');

        if (!me.getProxy())
            throw ya.Error.$create('To load collection you need to set proxy', 'COLLECTION3');


        callback = function () {

            if (me.getProxy().getStatus() === 'success') {

                me.fireEvent('loaded', me, action.getResponse(), 'read');

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

        me.getProxy().read(action);

        return deferred.promise;
    },
    save: function () {
        var me = this,
            deferred = ya.$Promise.deferred(),
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
                // or if it has id it's update.
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

                    me.fireEvent('success', me);

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
     * @param {Number||null} total
     * @returns {Collection}
     */
    prepareData: function (data, total) {
        var me = this,
            ModelInstance = me.getModel(),
            modelConfig = { namespace: me.getNamespace()},
            l = data.length,
            models = [];

        total = total || l;

        for (var i = 0; i < l; i++) {

            modelConfig.data = data[i];
            models.push(new ModelInstance({
                config: modelConfig
            }));

        }

        me.set('cache', models);
        me.set('total', total);

        me.filter();

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
 * @namespace ya
 * @class collection.$Manager
 * @extends ya.Manager
 */
ya.Manager.$extend({
    module: 'ya',
    alias: 'collection.$Manager',
    singleton: true
});
/**
 * @description
 * ## Basic controller usage
 *
 *     @example
 *     var ctl = new Controller({
 *         config: {
 *             name: 'Main',
 *             views: {
 *                 layout: ya.view.$Manager.getItem('view-0')
 *             },
 *             routes: {
 *                 "page/{\\d+}": 'changePage'
 *             },
 *         },
 *         bindElements : function (){
 *             var me = this;
 *             me.set('$arrowRight', document.querySelector('#arrow-right'));
 *             me.set('$arrowLeft', document.querySelector('#arrow-left'));
 *         },
 *         bindEvents: function () {
 *             var me = this;
 *             me.get('$arrowRight').addEventListener('click', this.nextPage.bind(this));
 *             me.get('$arrowLeft').addEventListener('click', this.prevPage.bind(this));
 *         },
 *         changePage: function (id) {
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
        routes: null,
        events: null
    },
    static: {
        router: null,
        getRouter: function () {

            ya.Controller.$router = ya.Controller.$router || new ya.Router();

            return ya.Controller.$router;
        }
    },
    init: function (opts) {
        var me = this;

        me.__super(opts);

        me
            .initConfig(opts)
            .initDefaults()
            .initEvents()
            .initRoutes();

        ya.$onReady(function () {
            me.restoreRouter();
        });

        return me;
    },
    /**
     * @method initDefaults
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        me.set('router', ya.Controller.$getRouter());
        me.set('dispatcher', ya.event.$dispatcher);

        return me;
    },
    /**
     *
     * @returns {*}
     */
    initEvents: function () {
        var me = this,
            events = me.getEvents(),
            views = [],
            rx = new RegExp('\\$([^\\s]+)'),
            dispatcher = me._dispatcher,
            matches, view, l, obj;

        if (events) {

            for (var e in events) {

                if (events.hasOwnProperty(e)) {

                    obj = {};
                    obj[e] = events[e];

                    dispatcher.add(me, obj);

                    matches = e.match(rx);
                    if (matches) {

                        if (views.indexOf(matches[1]) < 0) {

                            views.push(matches[1]);

                        }

                    } else {

                        throw ya.Error.$create(
                            'Event query should begin from id of the view (current query: ' + e + ')', 'CONTROLLER1'
                        );

                    }

                }

            }

            l = views.length;
            while (l--) {

                view = ya
                    .view.$Manager
                    .getItem(views[l]);

                if (view) {

                    if (view.isInDOM()) {

                        me.resolveEvents(view);

                    } else {

                        view.addEventListener('render', me.resolveEvents.bind(me));

                    }

                }
            }

        }

        return me;
    },
    /**
     *
     * @returns {*}
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
    resolveEvents: function (view) {
        var events = this.getEvents(),
            newScope = function (func, scope, arg) {
                return func.bind(scope, arg);
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

                                scope = newScope(viewEvents[event], this, view);

                                elements[i].addEventListener(event, scope);

                            }

                        }

                    }
                }


            }

        }

    },
    getRouter: function () {
        return router;
    },
    restoreRouter: function () {
        var me = this;

        me.getRouter().restore();

        return me;
    },
    redirectTo: function (path) {

        window.location.hash = path;

        return this;
    }
});
/**
 * @namespace ya.data
 * @class Action
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
    /**
     * @methods init
     * @param opts
     */
    init: function (opts) {
        var me = this;

        me
            .initConfig(opts)
            .initDefaults();
    },
    initDefaults: function () {
        var me = this;

        me.set('response', {});
        me.set('status', ya.data.Action.$status.PENDING);

        return me;
    },
    /**
     * @methods init
     * @param data
     * @returns {*}
     */
    setData: function (data) {
        this.set('data', data);
        return this;
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
        this.set('options', opts);
        return this;
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
        return this.get('response');
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
 * @namespace ya.data
 * @class Proxy
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'data.Proxy',
    /**
     * @methods init
     * @param opts
     */
    init: function (opts) {
        var me = this, config;

        opts = opts || {};

        me.__super(opts);

        config = ya.$merge(me._config, opts.config);

        me.set('initOpts', opts);
        me.set('config', config);

        me.initConfig();

    },
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
 * ## Localstorage
 *   Proxy provides access to localStorage object. Gives possibility to retrieve data
 *   by id or trough parameters.
 * @namespace ya.data.proxy
 * @class Localstorage
 * @extends ya.data.Proxy
 */
ya.data.Proxy.$extend({
    module: 'ya',
    alias: 'data.proxy.Localstorage',
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
     * @returns {Localstorage}
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
     * @returns {Localstorage}
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

            me.setStatus(ya.data.Action.$status.FAIL);
            response.error = ya.Error.$create("Not found");
            callback(me, action);
        };

        setTimeout(async, 0);

        return me;
    },
    /**
     * @methods create
     * @param action
     * @returns {Localstorage}
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
     * @returns {Localstorage}
     */
    update: function (action) { //
        var me = this,
            data = action.getData(),
            namespace = action.getOption('namespace'),
            callback = action.getOption('callback'),
            records = [],
            result,
            response = {},
            id, l, l2, async;

        async = function () { // update record asynchronously
            if (localStorage[namespace]) { // but only if namespace for saving object exist

                records = JSON.parse(localStorage[namespace]);

                if (Array.isArray(data)) {

                    result = [];
                    l = data.length;
                    while (l--) {
                        l2 = records.length;
                        id = data[l].id;
                        while (l2--) {
                            if (records[l2].id === id) {
                                records[l2] = data[l];
                                result.splice(0, 0, data[l]);
                            }
                        }
                    }

                } else {
                    l = records.length;
                    id = data.id;
                    while (l--) {
                        if (records[l].id === id) {
                            result = records[l] = data;
                        }
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
     * @methods destroy
     * @param action
     * @returns {Localstorage}
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
 * @namespace ya.event
 * @class $dispatcher
 * @extends ya.Core
 * @static
 */
ya.Core.$extend({
    module : 'ya',
    singleton : true,
    alias : 'event.$dispatcher',
        defaults: {
            delegates: null
        },
        /**
         * @methods init
         * @param opts
         * @returns {Dispatcher}
         */
        init: function (opts) {
            // Standard way of initialization.
            var me = this;

            me.__super();

            me
                .initConfig(opts)
                .initDefaults();

            return me;
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
                regExp = new RegExp('^\\$' + view.getId() + "[\\s]");
                // Get position for events which were matched.
                matchPos = __findAllByFn(delegates, matchIdFn);
                if (matchPos.length) {
                    /*jshint -W083 */
                    // If we found any events which need to be delegated,
                    __each(matchPos, function (r) {
                        // iterate through all of them.
                        // As first step clear the array of elements
                        els.length = 0;
                        delegate = delegates[r];
                        //
                        selector = delegate
                            .selector
                            .split(" ");
                        // Remove item id from selectors array.
                        selector.shift();

                        if (selector.length) {
                            // If still anything left get last part
                            // from query and find in new view elements
                            // which match to the selector.
                            els = newView.querySelectorAll(selector.pop());
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
                eType;

            for (eType in e) {

                if (e.hasOwnProperty(eType)) {

                    el.addEventListener(eType, e[eType].bind(delegate.scope, view), false);

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
 * @class Job
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Job',
    static: {
        id: 0
    },
    defaults: {
        id: null,
        delay: 0,
        tasks: null,
        repeat: 1,
        spawn: false
    },
    /**
     * @method init
     */
    init: function (opts) {
        var me = this;

        me
            .initConfig(opts)
            .initRequired()
            .initDefaults();

        return me;
    },
    /**
     *
     * @method initRequired
     * @returns {*}
     */
    initRequired: function () {
        var me = this;

        if (!me.getTasks() && !me._config.task) {

            throw ya.Error.$create('At least one task should be defined', 'YJ1');

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
        me.setTasks(tasks);

        return me;
    },
    doit: function () {
        var me = this,
            deferred = ya.$Promise.deferred(),
            engine, fn;

        engine = me.getRepeat() > 1 || me.getRepeat() === 'infinity' ?
        {run: function (a, b) {
            me.set('clear', setInterval(a, b));
        }, clear: function (success) {

            clearInterval(me._clear);

            if (!success) {

                deferred.reject({
                    id: 'YJ2',
                    message: 'Task terminated'
                });

            }

            return me;
        }} :
        {run: function (a, b) {
            me.set('clear', setTimeout(a, b));
        }, clear: function (success) {

            clearTimeout(me._clear);

            if (!success) {

                deferred.reject({
                    id: 'YJ2',
                    message: 'Task terminated'
                });

            }

            return me;
        }};

        me.set('engine', engine);

        fn = function () {
            var repeat = me.getRepeat(),
                tasks = me.getTasks(),
                i = 0,
                len;

            if (repeat !== 'infinity') {

                me.setRepeat(--repeat);
                if (repeat < 0) {

                    engine.clear(true);
                    return deferred.resolve({
                        success: true,
                        message: 'Task finished'
                    });

                }

            }

            len = tasks.length;
            while (i < len) {

                tasks[i]();
                i++;

            }

        };

        engine.run(fn, me.getDelay());

        return deferred.promise;
    },
    terminate: function () {

        return this._engine.clear();

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
        items: null
    },
    mixins: [
        ya.mixins.Array
    ],
    /**
     * @method
     * @param opts
     */
    init: function (opts) {
        var me = this;

        me
            .initConfig(opts)
            .initDefaults();
    },
    /**
     *
     * @method
     * @returns {*}
     */
    initDefaults: function () {
        var me = this;

        me.setItems([]);

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
    getCount : function () {
        return this.getItems().length;
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

        if (find > -1) {

            me.fireEvent('unregistered', items.slice(find, 1));

        }

        return me;
    },
    /**
     *
     * @param id
     * @returns {boolean}
     */
    isRegistered: function (id) {
        return this.find(this.getItems(), 'id', id) > -1 ? true : false;
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
     * @method init
     * @param opts
     */
    init: function (opts) {
        var me = this;

        me.__super();

        me
            .initConfig(opts)
            .initRequired()
            .initDefaults();

    },
    /**
     * @method initRequired
     * @returns {*}
     */
    initRequired: function () {
        var me = this;

        if (!me.getNamespace()){

            throw ya.Error.$create("Model need to have namespace");

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

        }
    },
    /**
     * @method getDataProperty
     * @param property
     * @returns {*}
     */
    getDataProperty: function (property) {
        return this.get('data')[property];
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
        me.set('data', {});
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
            deferred = ya.$Promise.deferred(),
            action = new ya.data.Action(),
            opts = {},
            response;

        if (
            typeof params[idProperty] === 'undefined' && typeof data[idProperty] === 'undefined'
            )
            throw ya.Error.$create('You need to pass id to load model');

        params[idProperty] = data[idProperty];

        opts.namespace = me.getNamespace();
        opts.params = params;
        opts.callback = function () {

            response = me.getProxy().getResponse();

            if (me.getProxy().getStatus() === 'success') {

                me.set('isDirty', false);
                me.set('data', response);

                deferred.resolve({scope: me, response: response, action: 'read'});
                me.fireEvent('loaded', me, response, 'read');

            } else {

                deferred.reject({scope: me, response: response, action: 'read'});
                me.fireEvent('error', me, response, 'read');

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
            deferred = ya.$Promise.deferred(),
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
            deferred = ya.$Promise.deferred(),
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
/**
 * @author angularjs
 * @contributed mkalafior
 * @namespace ya
 * @class $Promise
 * @static
 */
ya.$set('ya', '$Promise', function (undefined) {
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

        me.__super();

        me.initConfig(opts)
            .initDefaults()
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
 * @author Sebastian Widelak <sebakpl@gmail.com>
 *
 */
(function (undefined) {
    "use strict";

    var ya = window.ya,
        style = document.createElement('style'),
        __slice = Array.prototype.slice,
        VM,
        View,
        resize = 0,
        iv = 0;

    function onWindowResize(e) {
        // When resize event occur wait 32 miliseconds
        // to not firing it to often.

        if (resize === 0) {
            iv = setInterval(fireResizeEvent, 32);
        }

        resize = +new Date();
    }

    function fireResizeEvent() {
        // Fire ya resize event only on components
        // which need to be fitted to their parents.
        var views,
            l,
            i,
            now = +new Date();

        if (now - resize >= 32) {

            clearInterval(iv);

            resize = 0;
            views = ya.view.$Manager.getItems();
            l = views.length;
            i = 0;

            while (i < l) {

                if (views[i].item.getFit()) {
                    views[i].item.fireEvent('resize', views[i]);
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

    /**
     * @namespace ya
     * @class View
     * @constructor
     * @extends ya.Core
     * @uses ya.mixins.DOM
     * @params opts Object with configuration properties
     * @type {function}
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
            collections : null,
            /**
             * @attribute config.autoCreate
             * @type boolean
             */
            autoCreate: false,
            /**
             * @attribute config.autoCreate
             * @type ya.view.Template|String
             * @required
             */
            tpl: null
        },
        mixins: [
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

            me.__super();

            me
                .initConfig(opts)
                .initDefaults()
                .initRequired()
                .initTemplate()
                .initParent();

            ya.view.$Manager.register(me.getId(), me);

            return me;
        },
        initRequired: function () {
            var me = this;

            if (!me.getTpl()) {

                throw ya.Error.$create('ya.View: no tpl set for ' + config.getId());

            }

            return me;
        },
        /**
         * @method initDefaults
         * @returns {*}
         */
        initDefaults: function () {
            var me = this;

            me.setId(me.getId() || 'view-' + ya.view.$Manager.getCount());
            me.setChildren(me.getChildren() || []);
            me.setModels(me.getModels() || []);
            me.setCollections(me.getCollections() || []);

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
        initParent: function () {
            var me = this,
                parent = me.getParent();

            if (parent) {

                parent.getChildren().push(me);

            }

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

            if (!me.hasCollection(collection.getId())) {

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
         * @param id
         * @returns {ya.Collection}
         */
        getCollection: function (id) {
            var me = this,
                collections = me.getCollections(),
                collection = null,
                l;

            l = collections.length;
            while (l--) {
                if (collections[l].getNamespace() === id) {
                    collection = collections[l];
                    break;
                }
            }

            return collections;
        },
        /**
         * @version 0.2.0
         * @returns {Node}
         */
        render: function () {
            var me = this,
                config = me._config,
                parent = config.parent,
                selector = config.renderTo,
                parentEl, el;

            parentEl = me.getParentEl(selector, true);

            if (me.isInDOM()) {

                me.removeRendered();

            }

            el = me.getTpl()
                .getTDOMInstance(me)
                .getEDOM();

            me.set('el', el);

            if (me.getHidden())
                me.hide();

            if (parentEl) {

                parentEl.appendChild(el);

                if (parent) {

                    if (parent.findChild(me.getId()) < 0) {

                        parent.getChildren().push(me);

                    }

                }

                me.set('isInDOM', true);
                me.reAppendChildren();
                me.fireEvent('render', null, me);
            }

            return el;
        },
        /**
         * @version 0.1.11
         * @param binding
         */
        partialRender: function (binding) {
            var me = this,
                element = binding.type === 3,
                org = element ? binding.original : (binding.fillAttr ? true : binding.original),
                headers = binding.headers,
                len = headers.length,
                header;

            while (len--) {

                header = headers[len];

                if (element || !binding.fillAttr) {

                    org = org.replace("{{" + header.join(".") + "}}", me.getModel(header[0]).data(header[1]));

                } else {

                    org = org && me.getModel(header[0]).data(header[1]);

                }
            }

            if (element) {

                binding.pointer.textContent = org;


            } else {

                if (binding.fillAttr && !org) {

                    binding.pointer.removeAttribute(binding.attrName);

                } else {

                    binding.pointer.setAttribute(binding.attrName, org);

                }

            }

            return me;
        },
        /**
         * @version 0.1.12
         */
        removeRendered: function () {
            var me = this;

            me._el.parentNode.removeChild(me._el);
            me.set('el', null);
            me.set('isInDOM', false);

            return me;
        },
        /**
         * @param selector
         * @returns {Node}
         */
        querySelector: function (selector) {
            return this.get('el').querySelector(selector) ||
                (this.isQueryMatch(selector) ? this.get('el') : null);
        },
        /**
         * @param selector
         * @returns {Array}
         */
        querySelectorAll: function (selector) {
            var results = __slice.call(this.get('el').querySelectorAll(selector) || [], 0);

            if (this.isQueryMatch(selector)) {

                results.push(this.get('el'));

            }

            return results;
        },
        /**
         * @param view
         * @param selector
         * @returns {View}
         */
        addChild: function (view, selector) {
            var me = this;
            view.appendTo(me, selector);
            ya.event.$dispatcher.apply(view);
            me.fireEvent('elementAdded', me, view);
            return me;
        },
        /**
         * @param id
         * @returns {View||Boolean}
         */
        getChild: function (id) {
            var me = this;

            if (me.findChild(id) < 0)
                return false;

            return me.findChild(id);
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
         * @param id
         * @returns {*|null}
         */
        removeChild: function (id) {
            var views = this.getChildren(),
                l = views.length,
                view = [];

            while (l--) {
                if (views[l].getId() === id) {

                    view = views.splice(l, 1);
                    view[0].clear();

                }
            }

            return view[0] || null;
        },
        /**
         * @returns {Array}
         */
        removeChildren: function () {
            var views = this.getChildren(),
                l = views.length,
                removed = [];

            while (l--) {
                removed.push(views[l].clear());
            }


            return removed;
        },
        /**
         * @returns {View}
         */
        clear: function () {
            var me = this,
                el = me._el;

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

                parentEl = selector ? parent._el.querySelector(selector) : parent._el;

            } else if (globally) {

                parentEl = document.querySelector(selector);

            }

            return parentEl;
        },
        /**
         * @param parent
         * @param {String|HTMLElement} selector String or DOM Element
         * @returns {View}
         */
        appendTo: function (parent, selector) {
            var me = this,
                config = me.get('config'),
                id = me.getId(),
                views = parent.getChildren(),
                oldParent = config.parent,
                parentEl;

            parentEl = me.getParentEl(selector, false);

            config.renderTo = parentEl;

            if (!oldParent) {

                config.parent = parent;

            }
            else if (oldParent && oldParent.getId() !== parent.getId()) {

                if (oldParent.findChild(id) > -1) {

                    oldParent
                        .getChildren()
                        .splice(
                            oldParent.findChild(id), 1
                        );

                }

            }


            views.push(me);
            config.parent = parent;
            me.fireEvent('append', null, me, parent);


            if (!me.isInDOM() && parent.isInDOM()) {

                if (!me._el) {

                    me.render();
                    ya.event.$dispatcher.apply(me);

                } else {

                    parentEl.appendChild(me._el);
                    me.set('isInDOM', true);
                    me.reAppendChildren();
                    me.fireEvent('render', null, me);

                }

            }
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
        /**
         * @returns {View}
         */
        show: function () {
            var me = this;

            if (!me._el)
                return me;

            me._el.classList.remove('hidden');

            me.set('visible', true);
            me.fireEvent('show', me);

            return me;
        },
        /**
         * @returns {View}
         */
        hide: function () {
            var me = this;

            if (!me._el)
                return me;


            me._el.classList.add('hidden');

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
        /**
         * @returns {Boolean}
         */
        isVisible: function () {
            return this.get('visible') && this.isInDOM();
        }
    });

}());
/**
 * @namespace ya
 * @class view.$Manager
 * @extends ya.Manager
 */
ya.Manager.$extend({
    module: 'ya',
    alias: 'view.$Manager',
    singleton: true
});
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
    init: function (opts) {
        var me = this;

        me
            .initConfig(opts)
            .initRequired()
            .initTDOM();

        return me;
    },
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
    initTDOM: function () {
        var me = this,
            view = me.getView(),
            bindings = me.getBindings(),
            dom = me.getDOM(),
            $B = ya.view.Template.$BindingType,
            namespace;

        me.each(bindings, function (binding) {

            switch (binding.type) {
                case $B.ATTR :

                    binding.pointer = dom
                        .querySelector('[ya-id="' + binding.pointer + '"]')
                        .attributes
                        .getNamedItem(binding.name);

                    me.each(binding.headers, function (header) {

                        namespace = header[0];
                        model = view.getModel(namespace);
                        if (model) {

                            binding.models[namespace] = model;
                            model.addEventListener(
                                'data' + header[1].charAt(0).toUpperCase() + header[1].slice(1) + 'Change',
                                (function (binding) {
                                    return function () {
                                        me.updateAttr(binding);
                                    };
                                }(binding)));
                            me.updateAttr(binding);
                        }

                    });

                    delete binding.name;

                    break;

                case $B.TEXT :
                    var model;

                    binding.pointer = dom.querySelector('[ya-id="' + binding.pointer + '"]');

                    me.each(binding.headers, function (header) {

                        namespace = header[0];
                        model = view.getModel(namespace);
                        if (model) {

                            binding.models[namespace] = model;
                            model.addEventListener(
                                'data' + header[1].charAt(0).toUpperCase() + header[1].slice(1) + 'Change',
                                (function (binding) {
                                    return function () {
                                        me.updateTxt(binding);
                                    };
                                }(binding)));
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
                        collection.pointer = ya.collection.$Manager.getItem(collection.id);

                    } else {

                        // If not founded try match one from view,
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

                        definition = collection.class.split(".");
                        collection.pointer = ya.$factory({
                            module: definition.shift(),
                            alias: definition.join("."),
                            id: collection.id
                        });

                        view.setCollection(collection.pointer);

                    }


                    break;
                default:

                    binding.pointer = dom.querySelector('[ya-id="' + binding.pointer + '"]');

            }

        });

        me.setDOM(dom);
        me.setBindings(bindings);

        return me;
    },
    updateTxt: function (binding) {
        var me = this,
            txt = binding.original;

        me.each(binding.headers, function (header) {
            txt = txt.replace('{{' + header.join('.') + '}}', binding.models[header[0]].data(header[1]) || "");
        });

        binding.pointer.innerHTML = txt;

    },
    updateAttr: function (binding) {
        var me = this,
            txt = binding.original;

        me.each(binding.headers, function (header) {
            txt = txt.replace('{{' + header.join('.') + '}}', binding.models[header[0]].data(header[1]) || "");
        });

        binding.pointer.value = txt;

    },
    getEDOM: function () {
        var me = this,
            dom = me.getDOM(),
            div, firstChild;

        if (
            dom.childNodes.length > 1 ||
                dom.firstChild.nodeType === 3
            ) {

            div = document.createElement('div');

            while (dom.childNodes.length) {
                div.appendChild(dom.firstChild);
            }

            div
                .setAttribute(
                    'class',
                    'ya inline'
                );

            dom
                .appendChild(div);


        }

        firstChild = dom.firstChild;

        firstChild.setAttribute(
            'id',
            me.getView().getId()
        );

        return firstChild;
    }
});

/**
 * @namespace ya.view
 * @class Template
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
            CSS: 5,
            VIEW: 4,
            TEXT: 3,
            ATTR: 2,
            COL: 1
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

        me.
            __super();

        me
            .initConfig(opts)
            .initRequired()
            .initDefaults()
            .initBindings()
            .initRegister();

    },
    initRequired: function () {
        var me = this;

        if (!me.getTpl()) {

            throw ya.Error.$create('ya.view.Template: Missing tpl property', 'YVT1');

        }

        return me;
    },
    initDefaults: function () {
        var me = this,
            html = me.getTpl(),
            docFragment = document.createDocumentFragment();

        me.setId(me.getId() || 'template-' + ya.view.template.$Manager.getCount());
        me.setTDOM(me.getTDOM() || ya.view.TDOM);

        if (Array.isArray(html)) {
            html = html.join("");
        }

        if (typeof html === 'string' || html instanceof String) {
            var evaluated = document.createElement('div');

            evaluated.innerHTML = html;

            while (evaluated.hasChildNodes()) {

                docFragment.appendChild(evaluated.firstChild);

            }

        } else if (html instanceof DocumentFragment) {

            docFragment = html;

        } else {

            docFragment.appendChild(html);

        }

        me.set('html', docFragment);

        return me;
    },
    initRegister: function () {
        var me = this;

        ya.view.template
            .$Manager.register(
                me.getId(),
                me
            );

        return me;
    },
    /**
     * @method initBindings
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
     * @method findAttrsBindings
     */
    findAttrsBindings: function () {
        var me = this,
            attrs = [],
            bindings = [],
            regEx = /^ya-(.*)/i,
            nodeAttrs = [],
            __slice = Array.prototype.slice,
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

            // DOM4 polyfill - attribute no longer inherits from Node
            // so we need to set owner element manually
            if (ya.view.Template.$DOM4) {
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
                    binding = me.prepareViewBindings(attr);
                    break;
                case 'css' :
                    binding = me.prepareCSSBindings(attr);
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
    prepareTextBindings: function (node) {
        var results = node.data.match(/\{\{(.*?)\}\}/gi),// we searching for mustached text inside it
            i, len, headers, header, binding = false;

        if (results) { // and if we have positive match
            var doc = document.createElement('span'),// we create new span element
            // and id for binding
                rId = ya.view.Template.$id++;

            doc.setAttribute('ya-id', rId); // and add generated id.

            i = 0;
            len = results.length;
            headers = [];

            // In the end we replace all match via data.
            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4)).split('.');
                headers.push(header);

            }

            // We also keep founded bindings.
            binding = {
                original: node.value || node.data,
                old: node,
                doc: doc,
                models: {},
                headers: headers,
                type: 3,
                pointer: rId
            };

        }

        return binding;
    },
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

        return binding;
    },
    prepareViewBindings: function (attr) {
        var node = attr.ownerElement,
            view = node.getAttribute('ya-view') || 'ya.View',
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
    prepareCSSBindings: function (attr) {
        var node = attr.ownerElement,
            results = attr.value && attr.value.match(/\{\{(.*?)\}\}/gi),
            len = results && results.length,
            headers = [], i = 0,
            original, binding, header, rId, style;

        rId = node.getAttribute('ya-id');
        if (!rId) {

            rId = ya.view.Template.$id++;
            node.setAttribute('ya-id', rId);

        }

        if (results) {

            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4)).split('.');
                headers.push(header);

            }

        }

        original = (node.getAttribute('style') || "") + attr.value;

        node.setAttribute('style', original);

        binding = {
            original: original,
            fillAttr: false,
            headers: headers,
            models: {},
            name: 'style',
            type: ya.view.Template.$BindingType.ATTR,
            pointer: rId
        };

        return binding;
    },
    prepareAttrBindings: function (attr) {
        var node = attr.ownerElement,
            results = attr.value && attr.value.match(/\{\{(.*?)\}\}/gi),
            len = results && results.length,
            original = attr.value,
            headers = [], i = 0,
            binding, rId, header;

        if (results) {

            rId = node.getAttribute('ya-id');
            if (!rId) {

                rId = ya.view.Template.$id++;
                node.setAttribute('ya-id', rId);

            }

            while (i < len) {

                result = results[i++];
                header = result.substr(2, (result.length - 4)).split('.');
                headers.push(header);

            }

            binding = {
                fillAttr: ya.mixins.CSSStyle.isFillAttr(attr.name),
                name: attr.name,
                original: original,
                headers: headers,
                type: ya.view.Template.$BindingType.ATTR,
                pointer: rId
            };

        }

        return results ? binding : null;
    },
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

/**
 * @namespace ya
 * @class view.template.$Manager
 * @extends ya.Manager
 */
ya.Manager.$extend({
    module: 'ya',
    alias: 'view.template.$Manager',
    singleton: true
});