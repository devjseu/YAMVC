module('Template');

test("initialize", function () {
    var tpl = new yamvc.view.Template({
        config : {
            id : 'tpl-test'
        },
        html : [
            '{{Test}}'
        ]
    });

    ok(tpl instanceof yamvc.view.Template);
    ok(tpl.getHtml().hasChildNodes(), "Template was read");

});