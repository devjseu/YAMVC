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
    $create: function (opts) {
        var Obj = this;
        // for jshint
        return new Obj(opts);
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
