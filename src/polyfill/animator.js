
(function (window) {
    'use strict';

    var nativeRequestAnimationFrame,
        nativeCancelAnimationFrame,
        AnimationFrame = {
            _callbacks: [],
            FRAME_RATE: 60,
            hasNative: false,
            options: {
                useNative: true
            }
        };

// Grab the native request and cancel functions.
    (function () {
        var i,
            vendors = ['webkit', 'moz', 'ms', 'o'],
            top;

        // Test if we are within a foreign domain. Use raf from the top if possible.
        try {
            // Accessing .name will throw SecurityError within a foreign domain.
            window.top.name;
            top = window.top;
        } catch (e) {
            top = window;
        }

        nativeRequestAnimationFrame = top.requestAnimationFrame;
        nativeCancelAnimationFrame = top.cancelAnimationFrame || top.cancelRequestAnimationFrame;


        // Grab the native implementation.
        for (i = 0; i < vendors.length && !nativeRequestAnimationFrame; i++) {
            nativeRequestAnimationFrame = top[vendors[i] + 'RequestAnimationFrame'];
            nativeCancelAnimationFrame = top[vendors[i] + 'CancelAnimationFrame'] ||
            top[vendors[i] + 'CancelRequestAnimationFrame'];
        }

        // Test if native implementation works.
        // There are some issues on ios6
        // http://shitwebkitdoes.tumblr.com/post/47186945856/native-requestanimationframe-broken-on-ios-6
        // https://gist.github.com/KrofDrakula/5318048
        nativeRequestAnimationFrame && nativeRequestAnimationFrame(function () {
            AnimationFrame.hasNative = true;
        });
    }());

    /**
     * Crossplatform Date.now()
     *
     * @return {Number} time in ms
     * @api public
     */
    AnimationFrame.now = Date.now || function () {
        return (new Date).getTime();
    };

    /**
     * Replacement for PerformanceTiming.navigationStart for the case when
     * performance.now is not implemented.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/PerformanceTiming.navigationStart
     *
     * @type {Number}
     * @api public
     */
    AnimationFrame.navigationStart = AnimationFrame.now();

    /**
     * Crossplatform performance.now()
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/Performance.now()
     *
     * @return {Number} relative time in ms
     * @api public
     */
    AnimationFrame.perfNow = function () {
        if (window.performance && window.performance.now) return window.performance.now();
        return AnimationFrame.now() - AnimationFrame.navigationStart;
    };

    AnimationFrame.start = function () {
        var me = AnimationFrame;

        if (!me.run) {

            me.run = true;
            me.update(me.perfNow());

        }

        return me;
    };

    AnimationFrame.update = function () {
        var me = AnimationFrame,
            callbacks = me._callbacks,
            delay;

        if (!me.run) {
            return;
        }

        for (var i = 0, l = callbacks.length; i < l; i++) {
            try {
                callbacks[i]();
            } catch (e) {
                callbacks.splice(i, 1);
                console.error(e);
            }
        }

        if (me.hasNative && me.options.useNative && !me._isCustomFrameRate) {
            nativeRequestAnimationFrame(me.update);
            return me;
        }

        if (me._timeoutId == null) {
            // Much faster than Math.max
            // http://jsperf.com/math-max-vs-comparison/3
            // http://jsperf.com/date-now-vs-date-gettime/11
            delay = me._frameLength + me._lastTickTime - me.now();
            if (delay < 0) delay = 0;

            me._timeoutId = window.setTimeout(function () {

                me._lastTickTime = me.now();
                me._timeoutId = null;

                if (me.hasNative && me.options.useNative) {
                    nativeRequestAnimationFrame(me.update);
                } else {
                    me.update(me.perfNow());
                }

            }, delay);
        }


    };

    AnimationFrame.stop = function () {

        AnimationFrame.run = false;

    };

    AnimationFrame.addCallback = function (callback) {
        var me = AnimationFrame;

        me
            ._callbacks
            .push(callback);

        me
            .start();

        return me
            ._callbacks
            .length;
    };

    /**
     * Cancel animation frame.
     */
    AnimationFrame.removeCallback = function (id) {
        var me = AnimationFrame,
            callbacks = me
                ._callbacks;

        callbacks
            .slice(id, 1);

        if (callbacks.length === 0) {
            me.stop();
        }

        return void 0;
    };


    window.requestAnimationFrame = AnimationFrame.addCallback;
    window.cancelAnimationFrame = AnimationFrame.removeCallback;

}(window));
