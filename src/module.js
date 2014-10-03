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