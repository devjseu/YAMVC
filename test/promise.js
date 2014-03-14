module('Promises');

test("initialize", function () {

    equal(typeof ya.$Promise, 'object');
    equal(typeof ya.$Promise.deferred, 'function', 'Promise provide a then function');
    equal(typeof ya.$Promise.when, 'function', 'Promise provide a when function');
    equal(typeof ya.$Promise.reject, 'function', 'Promise provide a reject function');
    equal(typeof ya.$Promise.all, 'function', 'Promise provide a all function');

});

asyncTest("deferred", function () {
    var Calc = function (start) {
        this._start = start;
        this.add = function (number) {
            var me = this,
                deferred = ya.$Promise.deferred();

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

//asyncTest("all", function () {
//    var all = ya.$Promise.all();
//
//
//
//});

asyncTest("reject", function () {
    var Calc = function (start) {
        this._start = start;
        this.add = function (number) {
            var me = this,
                deferred = ya.$Promise.deferred();

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