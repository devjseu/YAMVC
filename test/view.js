module('View');
test("initialize", function () {
    var view;

    view = new yamvc.View({
        config: {
            tpl: 'container'
        }
    });

    ok(view instanceof  yamvc.View);
});