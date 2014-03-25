ya.Core.$extend({
    module: 'ya',
    alias: 'Module',
    defaults: function () {
        return {
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
    initDependencies: function () {
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
                delay: me.getDelay(),
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

        // terminate function if nothing to instantiate
        if (len === 0) {

            engine.finish();
            return me;

        }

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

                    try {

                        __each(params, resolveParams);

                    } catch (e) {

                        engine.terminate(e.getId(), e.getMessage());
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
            isReady = true, i = 0, module = null, initialized = [], semaphore = 0,
            className, params;


        // terminate function if no modules need to be included
        if (len === 0) {

            engine.finish();
            return me;

        }

        /**
         * Callback which tell engine to stop particular task
         */
        function onReady() {

            semaphore--;


            if (semaphore === 0) {

                engine.run();
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
                    initialized.push(
                        module
                            .$create()
                            .addEventListener('ready', onReady)
                    );

                    semaphore++;

                    break;

            }

        }

        while (i < len) {

            module = ya.$get(
                    me.getModule() + '.' + modules[i].split(" ").shift()
            );

            if (module === null) {
                isReady = false;
            }

            i++;
        }

        if (isReady) {

            engine.suspend();

            i = 0;
            while (i < len) {

                module = modules[i].split(" ");
                className = module.shift() + ".Module";
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
                        engine.terminate(e.getId(), e.getMessage());
                        break;

                    }

                } else {

                    engine.finish();

                }

                i++;
            }

            me.set('initialized', me._initialized.concat(initialized));

        }

        return me;
    },
    continueInit: function () {
        var me = this;

        me
            .initBus()
            .fireEvent('ready', me);

        me
            .onReady
            .apply(me, me._args);

        return me;
    },
    initBus: function () {
        var me = this,
            bus = me.getBus(),
            left, right, event, callback;


        for (var connection in bus) {

            if (bus.hasOwnProperty(connection)) {

                right = bus[connection].split(':');
                left = connection.split(':');
                event = left.pop();
                callback = right.pop();
                left = me.findConn(left);
                right = me.findConn(right);

                if (left.idx < 0 || right.idx < 0) continue;

                left.obj.addEventListener(event, right.obj[callback]);

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
        found.obj = idx > -1 ? initialized[idx]: null;

        return found;
    },
    onReady: function () {
    },
    onError: function () {
    }
});