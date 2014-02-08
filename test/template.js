module('Template');

test("initialize", function () {
    var tpl = new ya.view.Template({
        config : {
            id : 'tpl-test',
            tpl : [
                '{{Test}}'
            ]
        }
    });

    ok(tpl instanceof ya.view.Template);
    ok(tpl.getHtml().hasChildNodes(), "Template was read");

});