module('ya');

test("initialize", function () {

    ok(typeof ya !== 'undefined');

});

test("set object", function () {

    ya.$set('foo', {bar: 3});

    ok(app.foo.bar === 3);

});

test("get object", function () {

    ya.$set('foo2.bar', 4);

    equal(ya.$get('foo2.bar'), 4);

    equal(ya.$get('foo23.bar'), null);

});

test("get lazy object if namespace is not defined", function () {

    equal(typeof ya.$get('foo3.bar'), 'object');

    ya.$set('foo3.bar', 4);

    equal(ya.$get('foo3.bar'), 4);

});