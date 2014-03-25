ya.Core.$extend({
    module: 'ya',
    alias: 'Module',
    defaults: function () {
        return {
            maxLoadingTime: 10000,
            module: null,
            requires: [],
            modules: [],
            bus: {}
        };
    },
    init: function (opts) {
        return this
            .__super(opts)
            .initDependencies();
    },
    initDefaults: function () {
        var me = this;

        me.setModule(me.getModule() || me.__module__);

        return me.__super();
    },
    initRequired: function () {
        var me = this;

        if (!me.getModule()) {
            throw ya.Error.$create(me.__class__ + ': Module name is required', 'YM1');
        }

        return me;
    },
    initDependencies : function () {
        var me = this,
            tasks = [];

        tasks.push(function () {
            me.initRequires(this);
        });
        tasks.push(function () {
            me.initModules(this);
        });

        ya.Job.$create({
            config: {
                tasks: tasks,
                delay: 16,
                repeat: ya.Job.$INFINITY,
                maxTime: me.getMaxLoadingTime()
            }
        })
            .doit()
            .then(function () {
                me.continueInit();
            })
            ["catch"](function () {
            me.onError.apply(me, arguments);
        });

        return me;
    },
    initRequires: function (engine) {
        var me = this,
            __each = ya.mixins.Array.each,
            requires = me.getRequires(),
            len = requires.length,
            isReady = true, i = 0, initialized = [],
            resolveParams, args, require, className, params, instance;

        resolveParams = function (param) {
            switch (param) {
                case '-i' :

                    initialized.push(require.$create());

                    break;
                case '-p' :

                    args.push(require);

                    break;
                case '-ip' :

                    instance = require.$create();

                    args.push(instance);
                    initialized.push(instance);

                    break;

            }
        };

        while (i < len) {

            require = ya.$get(
                    me.getModule() + '.' + requires[i].split(" ").shift()
            );

            if (require === null) {
                isReady = false;
            }

            i++;
        }

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

                    __each(params, resolveParams);

                }

                i++;
            }
            me.set('initialized', initialized);
            me.set('args', args);

            engine.finish();

        }

    },
    initModules: function (engine) {
        var me = this;

        engine.finish();

        return me;
    },
    continueInit: function () {
        var me = this;

        me
            .initBus()
            .onReady
            .apply(me, me._args);

        return me;
    },
    initBus: function () {
        var me = this,
            bus = me.getBus(),
            leftIdx, rightIdx, left, right, event, callback;


        for (var connection in bus) {
            if (bus.hasOwnProperty(connection)) {

                right = bus[connection].split(':');
                left = connection.split(':');
                event = left.pop();
                callback = right.pop();
                leftIdx = me.findConn(left);
                rightIdx = me.findConn(right);

                if (leftIdx < 0 || rightIdx < 0) continue;

                left = me._initialized[leftIdx];
                right = me._initialized[rightIdx];

                left.addEventListener(event, right[callback]);

            }

        }

        return me;
    },
    findConn: function (conn) {
        var me = this,
            alias, module, name;

        alias = conn.pop();
        module = conn.pop() || me.__module__;
        name = [module, alias].join('.');

        return ya.mixins.Array.find(me._initialized, '__class__', name);
    },
    onReady: function () {
    },
    onError: function () {
    }
});