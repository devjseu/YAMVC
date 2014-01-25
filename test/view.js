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

test("render", function () {
    var view, el;

    (view = new yamvc.View({
        config: {
            tpl: new yamvc.view.Template({
                config: {
                    id: 'tpl-bar',
                    tpl: [
                        'Hello World!'
                    ]
                }
            }),
            renderTo: '#test-1'
        }
    })).render();

    el = document.querySelector('[yamvc-id="' + view.getId() + '"]');

    equal(el.innerText, 'Hello World!');
});