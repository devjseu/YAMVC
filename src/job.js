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