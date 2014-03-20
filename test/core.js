module('Core');

test("initialize", function () {
    var core;

    core = ya.Core.$create();

    ok(core instanceof  ya.Core);
});

test("extend", function () {

    ya.Core.$extend({
        module: 'app',
        alias: 'foo.Bar',
        defaults: {
            too: 3
        }
    });

    ok(new app.foo.Bar() instanceof ya.Core);
});

test("defaults", function () {
    var c1, c2;

    ya.Core.$extend({
        module: 'app',
        alias: 'foo.Dee',
        defaults: function () {
            return {
                foo: [
                    {
                        name: 'boo'
                    }
                ],
                name: 'boo',
                surname : 'too'
            };
        }
    });

    c1 = app.foo.Dee.$create();
    c2 = app.foo.Dee.$create();

    equal(c1.getFoo().length, 1);
    equal(c1.getFoo().length, c2.getFoo().length);

    c1.getFoo().push({
        name: 'tea'
    });

    ok(c1.getFoo().length > c2.getFoo().length);

    app.foo.Dee.$extend({
        module: 'app',
        alias: 'foo.dee.Bar',
        defaults: {
            name: 'boo2'
        }
    });

    equal(app.foo.dee.Bar.$create().getName(), 'boo2');
    equal(app.foo.dee.Bar.$create().getSurname(), 'too');


});
