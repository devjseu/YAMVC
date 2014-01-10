module('Model');
test("initialize", function () {
    var model;

    model = new yamvc.Model({
        config: {
            namespace: 'test'
        }
    });

    ok(model instanceof  yamvc.Model);
});