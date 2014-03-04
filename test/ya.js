module('ya');

test("initialize", function () {

    ok(typeof ya !== 'undefined');

});

test("set object under proper namespace", function () {

    ya.$set('foo', {bar: 3});

    ok(app.foo.bar === 3);

});

test("get object under proper namespace", function () {

    ya.$set('foo2.bar', 4);

    equal(ya.$get('foo2.bar'), 4);

    equal(ya.$get('foo23.bar'), null);

});