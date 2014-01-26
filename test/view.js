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