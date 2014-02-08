module('Core');
test("initialize", function () {
    var core;

    core = ya.Core.$create();

    ok(core instanceof  ya.Core);
});