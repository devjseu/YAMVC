/**
 * @namespace ya
 * @class Job
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Job',
    static: {
        id: 0,
        INFINITY: 'infinity'
    },
    defaults: {
        id: null,
        delay: 0,
        tasks: null,
        repeat: 1,
        spawn: false,
        results: null,
        maxTime: null
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
        me.setResults([]);

        return me;
    },
    doit: function () {
        var me = this,
            deferred = ya.$Promise.deferred(),
            engine, fn;


        engine = me.getRepeat() > 1 || me.getRepeat() === ya.Job.$INFINITY ?
        {terminate: function (code, msg) {

            clearInterval(me._clear);

            return deferred.reject({
                id: code,
                message: msg
            });
        }} :
        {terminate: function (code, msg) {

            clearInterval(me._clear);

            return deferred.reject({
                id: code,
                message: msg
            });
        }};

        engine.run = function (a, b) {
            me.set('clear', setInterval(a, b));
        };

        engine.finish = function () {

            clearInterval(me._clear);

            return deferred.resolve({
                success: true,
                message: 'Task finished',
                results: me.getResults()
            });


        };

        fn = function () {
            var repeat = me.getRepeat(),
                tasks = me.getTasks(),
                results = [],
                i = 0,
                len;


            if (
                me.getMaxTime() &&
                    (+new Date() - me._start) > me.getMaxTime()
                ) {

                return engine.terminate('YJ3', 'Timeout');

            }
            if (repeat !== ya.Job.$INFINITY) {

                me.setRepeat(--repeat);
                if (repeat < 0) {

                    engine.finish();

                }

            }

            len = tasks.length;

            while (i < len) {

                results.push(tasks[i].call(engine));
                i++;

            }

            me.getResults().push(results);

        };

        me.set('engine', engine);
        me.set('start', +new Date());

        engine.run(fn, me.getDelay());

        return deferred.promise;
    },
    terminate: function () {

        return this._engine.terminate('YJ2', 'Task terminated after ' + ((+new Date() - this._start) / 1000) + ' seconds of execution');

    }
});