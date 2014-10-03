/**
 * @namespace ya
 * @class Ajax
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'Ajax',
    static: {
        pause: false
    },
    /**
     * return default configuration object
     * @returns {{url: null, method: string, promise: *, XhrInstance: *, mimeType: string, responseType: string, params: null, request: null}}
     */
    defaults: function () {
        return {
            url: null,
            method: 'GET',
            promise: ya.$promise.deferred(),
            XhrInstance: ya.$get('XMLHttpRequest'),
            mimeType: 'text\/plain',
            responseType: 'text',
            params: null,
            request: null
        }
    },
    onProgress: function () {
    },
    onComplete: function () {
    },
    onError: function () {
    },
    onAbort: function () {
    },
    getResponse: function () {
        return this._response || this.getRequest().response;
    },
    doFallback: function () {
    },
    /**
     *
     * @returns {ya.Promise}
     */
    doIt: function () {
        var me = this,
            deferred = me.getPromise(),
            XhrInstance = me.getXhrInstance(),
            oReq = new XhrInstance(),
            method = me.getMethod(),
            url = me.getUrl(),
            mimeType = me.getMimeType(),
            responseType = me.getResponseType(),
            params = me.getParams(),
            data = null;

        if (
            ya
                .Ajax
                .$pause
        ) {
            return;
        }

        if (method !== 'GET') {

            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    if (!data) {
                        data = new FormData();
                    }
                    data.append(key, params[key]);
                }
            }

        }

        oReq
            .open(
            method,
            url,
            true
        );

        try {

            oReq
                .overrideMimeType(
                mimeType + "; charset=x-user-defined"
            );

            oReq
                .responseType = responseType;

            if (
                oReq
                    .responseType
                !==
                responseType
            ) {
                throw ya.Error.$create('Setting response type not supported');
            }

        } catch (e) {
            me.set('notSupportedReqType', true);
        }


        oReq
            .addEventListener(
            "progress",
            function (e) {

                me
                    .onProgress(e);

                deferred
                    .notify({
                        scope: me,
                        value: e
                    });
            },
            false
        );

        oReq
            .addEventListener(
            "load",
            function (e) {

                me
                    .onComplete(e);

                deferred
                    .resolve({
                        scope: me,
                        value: e
                    });

                if (me._notSupportedReqType) {
                    me.doFallback();
                }
            },
            false
        );

        oReq
            .addEventListener(
            "error",
            function (e) {

                me
                    .onError(e);

                deferred
                    .reject(ya.Error.$create('Error during sending the data to ' + me.getUrl()));
            },
            false
        );

        oReq
            .addEventListener(
            "abort",
            function (e) {

                me
                    .onAbort(e);

                deferred
                    .reject(ya.Error.$create('Error during sending the data to ' + me.getUrl()));
            },
            false
        );

        oReq
            .send(data);

        me.setRequest(oReq);

        return deferred.promise;
    }
});