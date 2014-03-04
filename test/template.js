module('Template');

test("initialize", function () {
    var tpl = ya.view.Template.$create({
        config : {
            id : 'tpl-test',
            tpl : [
                '{{Test}}'
            ]
        }
    });

    ok(tpl instanceof ya.view.Template);

//    ok(tpl.getViewDOM() instanceof ya.view.DOM, "DOM object was generated");

});