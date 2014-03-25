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
        me.setTasks(tasks.reverse());
        me.setResults([]);
        me.set('semaphore', tasks.length);

        return me;
    },
    doit: function () {
        var me = this,
            deferred = ya.$Promise.deferred(),
            engine, fn, taskIdx;


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

        engine.suspend =function () {

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

                return engine.terminate('YJ3', 'Timeout');

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
                results.push(tasks[i].call(engine));

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