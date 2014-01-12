/**
 * @author rhysbrettbowen
 * @contributed devjseu
 */
(function (window, undefined) {
    "use strict";

    var yamvc = window.yamvc || {},
        Promise,
        State,
        resolve;


    /**
     * @type {{PENDING: number, FULFILLED: number, REJECTED: number}}
     */
    State = {
        PENDING: 0,
        FULFILLED: 1,
        REJECTED: 2
    };

    /**
     * @param fn
     * @constructor
     */
    Promise = function (fn) {
        var me = this,
            onResolve,
            onReject;

        me._state = State.PENDING;
        me._queue = [];

        onResolve = function (value) {
            resolve(me, value);
        };

        onReject = function (reason) {
            me.transition(State.REJECTED, reason);
        };

        if (fn) fn(onResolve, onReject);
    };

    /**
     * @param state
     * @param value
     * @returns {boolean}
     */
    Promise.prototype.transition = function (state, value) {
        var me = this;

        if (me._state == state ||          // must change the state
            me._state !== State.PENDING || // can only change from pending
            (state != State.FULFILLED &&    // can only change to fulfill or reject
                state != State.REJECTED) ||
            arguments.length < 2) {         // must provide value/reason
            return false;
        }

        me._state = state;                 // change state
        me._value = value;
        me.run();
    };


    Promise.prototype.run = function () {
        var me = this,
            value,
            fulfill,
            reject;

        fulfill = function (x) {
            return x;
        };

        reject = function (x) {
            throw x;
        };

        if (me._state == State.PENDING) return;
        setTimeout(function () {
            while (me._queue.length) {
                var obj = me._queue.shift();
                try {
                    // resolve returned promise based on return
                    value = (me._state == State.FULFILLED ?
                        (obj.fulfill || fulfill) :
                        (obj.reject || reject))
                        (me._value);
                } catch (e) {
                    // reject if an error is thrown
                    obj.promise.transition(State.REJECTED, e);
                    continue;
                }
                resolve(obj.promise, value);
            }
        }, 0);
    };

    /**
     * @param onFulfilled
     * @param onRejected
     * @returns {Promise}
     */
    Promise.prototype.then = function (onFulfilled, onRejected) {
        // need to return a promise
        var me = this,
            promise = new Promise();

        me._queue.push({
            fulfill: typeof onFulfilled == 'function' && onFulfilled,
            reject: typeof onRejected == 'function' && onRejected,
            promise: promise
        });
        me.run();

        return promise;
    };

    /**
     * @param promise
     * @param x
     */
    Promise.prototype.resolve = function (promise, x) {
        if (promise === x) {
            promise.transition(State.REJECTED, new TypeError());
        } else if (x && x.constructor == Promise) { // must know it’s implementation
            if (x.state == State.PENDING) { // 2.3.2.1
                x.then(function (value) {
                    resolve(promise, value);
                }, function (reason) {
                    promise.transition(State.REJECTED, reason);
                });
            } else {
                promise.transition(x.state, x.value);
            }
        } else if ((typeof x == 'object' || typeof x == 'function') && x !== null) {
            var called = false;
            try {
                var then = x.then;
                if (typeof then == 'function') {
                    then.call(x, function (y) {
                        if (!called) {
                            resolve(promise, y);
                            called = true;
                        }
                    }, function (r) {
                        if (!called) {
                            promise.transition(State.REJECTED, r);
                            called = true;
                        }
                    });
                } else {
                    promise.transition(State.FULFILLED, x);
                }
            } catch (e) {
                if (!called) {
                    promise.transition(State.REJECTED, e);
                }
            }
        } else {
            promise.transition(State.FULFILLED, x);
        }
    };

    /**
     * @returns {number}
     */
    Promise.prototype.getState = function () {
        return this._state;
    };

    resolve = Promise.prototype.resolve;

    // static
    Promise.State = State;

    /**
     * @param value
     * @returns {Promise}
     */
    Promise.resolved = function (value) {
        return new Promise(function (res) {
            res(value);
        });
    };

    /**
     * @param reason
     * @returns {Promise}
     */
    Promise.rejected = function (reason) {
        return new Promise(function (res, rej) {
            rej(reason);
        });
    };

    /**
     * @returns {{promise: Promise, resolve: (Function|resolve|resolve), reject: (*|Function|reject|reject|reject|reject)}}
     */
    Promise.deferred = function () {
        var resolve, reject;
        return {
            promise: new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            }),
            resolve: resolve,
            reject: reject
        };
    };

    yamvc.Promise = Promise;
    window.yamvc = yamvc;
}(window));