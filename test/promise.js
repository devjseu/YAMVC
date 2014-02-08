module('Promises');

test("initialize", function () {
    var promise = new ya.Promise();

    equal(typeof promise.then, 'function', 'Promise provide a then function');
    equal(promise.getState(), ya.Promise.State.PENDING, 'Promise has status pending');

});

asyncTest("fulfill", function () {
    var Calc = function (start) {
        this._start = start;
        this.add = function (number) {
            var me = this,
                deferred = ya.Promise.$deferred();

            setTimeout(function () {
                me._start += number;
                deferred.resolve(me._start);
            }, 50);
            return deferred.promise;
        };
    }, calc, p;

    calc = new Calc(5);

    p = calc.add(5);

    p.then(function (v) {
        equal(v, 10, "Result of adding should be 10");
        start();
    }, function () {
        start();
    });

});

asyncTest("reject", function () {
    var Calc = function (start) {
        this._start = start;
        this.add = function (number) {
            var me = this,
                deferred = ya.Promise.$deferred();

            setTimeout(function () {
                me._start += number;
                deferred.reject({code: 1, msg: "wrong calculation"});
            }, 50);
            return deferred.promise;
        };
    }, calc, p;

    calc = new Calc(5);

    p = calc.add(5);

    p.then(function () {
        start();
    }, function (err) {
        equal(err.code, 1, "Promise should return error");
        start();
    });

});