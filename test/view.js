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

test("render with children", function () {
    var view, el;

    (view = new yamvc.View({
        config: {
            tpl: new yamvc.view.Template({
                config: {
                    id: 'tpl-test-1',
                    tpl: [
                        '<div class="multilevel"></div>'
                    ]
                }
            }),
            children: [
                new yamvc.View({
                    config: {
                        tpl: new yamvc.view.Template({
                            config: {
                                id: 'tpl-child',
                                tpl: [
                                    'Hello World!'
                                ]
                            }
                        }),
                        renderTo: '.multilevel'
                    }
                })
            ],
            renderTo: '#test-2'
        }
    })).render();

    el = document.querySelector('[yamvc-id="' + view.getId() + '"]');

    equal(el.innerText, 'Hello World!');
});

test("remove child", function () {
    var view;

    (view = new yamvc.View({
        config: {
            tpl: new yamvc.view.Template({
                config: {
                    id: 'tpl-test-2',
                    tpl: [
                        '<div class="multilevel"></div>'
                    ]
                }
            }),
            children: [
                new yamvc.View({
                    config: {
                        id: 'child',
                        tpl: new yamvc.view.Template({
                            config: {
                                id: 'tpl-child',
                                tpl: [
                                    'Hello World!'
                                ]
                            }
                        }),
                        renderTo: '.multilevel'
                    }
                })
            ],
            renderTo: '#test-3'
        }
    })).render();

    view.removeChild('child');

    equal(view.getChildren().length, 0, 'from parent');
});


test("bind with data", function () {
    var view, model;

    model = new yamvc.Model({
        config: {
            namespace: 'example',
            data: {
                name: "Seba",
                display: "none"
            }
        }
    });

    view = new yamvc.View({
        config: {
            models: [
                model
            ],
            tpl: new yamvc.view.Template({
                config: {
                    id: 'tpl-example-3',
                    tpl: [
                        '<div>Who are you ?</div>',
                        '<button style="margin: 10px;">answer</button>',
                        '<div class="example" style="display: {{example.display}}">Hi {{example.name}}</div>'
                    ]
                }
            }),
            renderTo: '#example-4-result'
        }
    });
    view.render();

    equal(view.queryEl('.example').innerText, 'Hi Seba');

    equal(view.queryEl('.example').getAttribute('style'), 'display: none');

    model.data('display', 'block');

    equal(view.queryEl('.example').getAttribute('style'), 'display: block');
});