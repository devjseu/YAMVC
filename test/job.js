module('Job', {
    setup: function () {
    }
});


asyncTest("basic", function () {
    var actions = 0,
        onFinish = function () {

            start();
            ok(job instanceof ya.Job, 'is instance of ya.Job');
            equal(actions, 2, 'action was performed 2 times');
        };

    var job = ya.Job
        .$create({
            config: {
                delay: 70,
                task: function () {
                    actions++;
                },
                repeat: 3
            }
        });

    job.doit()
        ['catch'](function () {
            onFinish();
        });

    setTimeout(function () {
        job.terminate();
    }, 150);

});