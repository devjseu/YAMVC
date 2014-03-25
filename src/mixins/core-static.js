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
            __Class,
            __extends;

        __Class = function () {
            var defsArr = __Class.__defaults__,
                len = defsArr.length,
                i = 0, defs = {},
                def, key;
            //
            this._config = {};


            while (i < len) {

                def = defsArr[i];
                if (typeof def === 'function') {
                    def = def();
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

        __extends(__Class, Parent);

        if (opts.alias) {

            ya.$set(opts.module || ya.$module(), opts.alias, opts.singleton ? new __Class() : __Class);

        }

        return __Class;
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

        return  new (Function.prototype.bind.apply(Obj, args));
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
