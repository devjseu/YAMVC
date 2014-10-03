/**
 * @namespace ya
 * @class util.Parallel
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'util.Parallel',
    defaults: function () {
        return {
            data: null,
            options: {},
            job: function () {
                this.addEventListener('message', function (e) {
                    console.warn('ya.util.Parallel: Please override default job.');

                    this.postMessage(e.data);

                });
            },
            worker: null,
            blob: null,
            promise: null
        }
    },
    init: function (config) {
        var me = this,
            blobURL,
            worker,
            deferred;

        me
            .__super(config);

        blobURL = URL
            .createObjectURL(
            new Blob(
                [
                    '(',
                    me.getJob().toString(),
                    ')()'
                ],
                {
                    type: 'application/javascript'
                }
            )
        );

        deferred = ya.$promise.deferred();

        worker = new Worker(blobURL);
        URL.revokeObjectURL(me.getBlob());

        worker.addEventListener('message', function (data) {
            deferred.resolve({data: data});
        }, false);

        worker.addEventListener('error', function (data) {
            deferred.reject({data: data});
        }, false);

        me
            .setBlob(blobURL);

        me
            .setWorker(worker);

        me
            .setPromise(deferred.promise);

        return me;
    },
    spawn: function () {
        var me = this;

        me
            .getWorker().
            postMessage(me.getData());


        return me.getPromise();
    }
});