module('Core');
test("initialize", function () {
    var core;

    core = yamvc.Core.$create();

    ok(core instanceof  yamvc.Core);
});