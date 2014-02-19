module('View');
test("initialize", function () {
    var view;

    view = new ya.View({
        config: {
            tpl: 'container'
        }
    });

    ok(view instanceof  ya.View);
});

test("render", function () {
    var view, el;

    (view = new ya.View({
        config: {
            tpl: new ya.view.Template({
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

    el = document.querySelector('#' + view.getId());

    equal(el.innerText, 'Hello World!');
});

test("render with children", function () {
    var view, el;

    (view = new ya.View({
        config: {
            tpl: new ya.view.Template({
                config: {
                    id: 'tpl-test-1',
                    tpl: [
                        '<div class="multilevel"></div>'
                    ]
                }
            }),
            children: [
                new ya.View({
                    config: {
                        tpl: new ya.view.Template({
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

    el = document.querySelector('#' + view.getId());

    equal(el.innerText, 'Hello World!');
});

test("remove child", function () {
    var view;

    (view = new ya.View({
        config: {
            tpl: new ya.view.Template({
                config: {
                    id: 'tpl-test-2',
                    tpl: [
                        '<div class="multilevel"></div>'
                    ]
                }
            }),
            children: [
                new ya.View({
                    config: {
                        id: 'child',
                        tpl: new ya.view.Template({
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


test("bind with model", function () {
    var view, model;

    model = new ya.Model({
        config: {
            namespace: 'example',
            data: {
                name: "Seba",
                display: "none"
            }
        }
    });

    view = new ya.View({
        config: {
            models: [
                model
            ],
            tpl: new ya.view.Template({
                config: {
                    id: 'tpl-example-3',
                    tpl: [
                        '<div>Who are you ?</div>',
                        '<button style="margin: 10px;">answer</button>',
                        '<div class="example" css="display: {{example.display}};">Hi {{example.name}}</div>'
                    ]
                }
            }),
            renderTo: '#test-4'
        }
    });
    view.render();

    equal(view.queryEl('.example').innerText, 'Hi Seba');

    equal(view.queryEl('.example').getAttribute('style'), 'display: none;');

    model.data('display', 'block');

    equal(view.queryEl('.example').getAttribute('style'), 'display: block;');
});


test("rendered two times", function () {
    var view, model;

    model = new ya.Model({
        config: {
            namespace: 'example',
            data: {
                name: "Seba",
                display: "none"
            }
        }
    });

    view = new ya.View({
        config: {
            models: [
                model
            ],
            tpl: new ya.view.Template({
                config: {
                    id: 'tpl-example-4',
                    tpl: [
                        '<div>Who are you ?</div>',
                        '<button style="margin: 10px;">answer</button>',
                        '<div class="example" css="display: {{example.display}};">Hi {{example.name}}</div>'
                    ]
                }
            }),
            renderTo: '#test-5'
        }
    });

    view.render();

    equal(view.queryEl('.example').innerText, 'Hi Seba');

    equal(view.queryEl('.example').getAttribute('style'), 'display: none;');

    view.render();

    model.data('display', 'block');

    equal(view.queryEl('.example').getAttribute('style'), 'display: block;');
});

test("check if query match", function () {
    var view, el;

    ya.View.$create({
        config: {
            id: 'selector-test',
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-test-1',
                    tpl: [
                        '<div class="employee senior" id="selector-test">',
                        '<p>',
                        '</p>',
                        '</div>'
                    ]
                }
            }),
            children: [
                ya.View.$create({
                    config: {
                        tpl: ya.view.Template.$create({
                            config: {
                                id: 'tpl-child',
                                tpl: [
                                    'Hello World!'
                                ]
                            }
                        }),
                        renderTo: 'p'
                    }
                })
            ],
            renderTo: '#test-2'
        }
    }).render();

    el = ya.viewManager.get('selector-test').isQueryMatch('div#selector-test.employee.senior');

    ok(el);

    el = ya.viewManager.get('selector-test').isQueryMatch('span');

    ok(!el);

    el = ya.viewManager.get('selector-test').isQueryMatch('#selector-test.senior');

    ok(el);
});


//test("bind with collection", function () {
//    var view, collection;
//
//    collection = new ya.Collection({
//        config: {
//            namespace: 'example',
//            data: [
//                {
//                    name: "Seba",
//                    display: "true"
//                },
//                {
//                    name: "Seba 2",
//                    display: "none"
//                },
//                {
//                    name: "Seba 3",
//                    display: "true"
//                }
//            ]
//        }
//    });
//
//    view = new ya.View({
//        config: {
//            collections: [
//                collection
//            ],
//            tpl: new ya.view.Template({
//                config: {
//                    id: 'tpl-example-5',
//                    tpl: [
//                        '<div>',
//                        '<ul reapeat="">',
//                        '<li>{{}}</li>',
//                        '</ul>',
//                        '</div>'
//                    ]
//                }
//            }),
//            renderTo: '#test-6'
//        }
//    });
//
//    view.render();
//
//    equal(view.queryEl('.example').innerText, 'Hi Seba');
//});