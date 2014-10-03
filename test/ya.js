module('ya');

test("initialize", function () {

    ok(typeof ya !== 'undefined');

});

test("set object", function () {

    ya.$set('foo', {bar: 3});

    ok(app.foo.bar === 3);

});

test("get object", function () {

    var err;
    ya.$set('foo2', 'bar', 4);

    try {
        ya.$get('foo23.bar');
    } catch (e) {
        err = e;
    }

    equal(ya.$get('foo2.bar'), 4);
    equal(err.getId(), 'GEN1');


});

test("get lazy object if namespace is not defined", function () {


    ya.$set('foo3', 'bar', 4);

    equal(typeof ya.$get('foo3'), 'object');
    equal(ya.$get('foo3.bar'), 4);

});

test("return instance of class from factory", function () {

    var _class, instance;

    _class = ya.Core.$extend({
        module: 'test1',
        alias: 'Test',
        defaults: {
            a: 0,
            b: 1
        },
        testMethod: function (a) {
            return a + 1;
        }
    });

    instance = ya.$factory({
        module: 'test1',
        alias: 'Test'
    });

    ok(instance instanceof _class);

    equal(instance.testMethod(1), 2);

    instance = ya.$factory({
        module: 'test1',
        alias: 'Test',
        methods: {
            testMethod: function (a) {
                return a + 2;
            }
        }
    });

    equal(instance.testMethod(1), 3);

});