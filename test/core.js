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
