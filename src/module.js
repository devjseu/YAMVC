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
            .initRequires();
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
    initRequires: function () {
        var me = this;

        ya.Job.$create({
            config: {
                task: function () {
                    var requires = me.getRequires(),
                        len = requires.length,
                        isReady = true, i = 0, initialized = [],
                        re, args, require;

                    while (i < len) {

                        require = requires[i];
                        require = ya.$get(
                            me.getModule() + '.' + require.replace(":->", "")
                        );

                        if (require === null) {
                            isReady = false;
                        }

                        i++;
                    }

                    if (isReady) {

                        re = /:->/;
                        args = [];
                        i = 0;
                        while (i < len) {

                            require = requires[i];
                            if (re.test(require)) {

                                require = ya.$get(
                                    me.getModule() + '.' + require.replace(":->", "")
                                );
                                require = require.$create();
                                args.push(
                                    require
                                );

                            } else {

                                require = ya.$get(
                                    me.getModule() + '.' + require.replace(":->", "")
                                );
                                require = require.$create();

                            }

                            initialized.push(require);

                            i++;
                        }
                        me.set('initialized', initialized);
                        me.set('args', args);

                        this.finish();

                    }

                },
                delay: 16,
                repeat: ya.Job.$INFINITY,
                maxTime: me.getMaxLoadingTime()
            }
        })
            .doit()
            .then(function () {
                me.continueInit.apply(me, arguments);
            })
            ["catch"](function () {
            me.onError.apply(me, arguments);
        });

        return me;
    },
    continueInit: function () {
        var me = this;

        me
            .initModule()
            .initBus()
            .onReady
            .apply(me, me._args);

        return me;
    },
    initModule: function () {
        var me = this;

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

                console.log('bind');

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