module('View');
test("initialize", function () {
    var view;

    view = ya.View.$create({
        config: {
            tpl: 'container'
        }
    });

    ok(view instanceof ya.View);
});

test("render", function () {
    var view, el;

    view = ya.View.$create({
        config: {
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-bar',
                    tpl: [
                        'Hello World!'
                    ]
                }
            }),
            renderTo: '#test-1'
        }
    });

    view.render();

    el = document.querySelector('#' + view.getId());

    equal(el.innerText, 'Hello World!');
});

test("render with children", function () {
    var view, el;

    view = ya.View.$create({
        config: {
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-test-1',
                    tpl: [
                        '<div class="multilevel"></div>'
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
                        renderTo: '.multilevel'
                    }
                })
            ],
            renderTo: '#test-2'
        }
    });

    view.render();

    el = document.querySelector('#' + view.getId());

    equal(el.innerText, 'Hello World!');
});

test("remove child", function () {
    var view;

    view = ya.View.$create({
        config: {
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-test-2',
                    tpl: [
                        '<div class="multilevel"></div>'
                    ]
                }
            }),
            children: [
                ya.View.$create({
                    config: {
                        id: 'child',
                        tpl: ya.view.Template.$create({
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
    });
    
    view.render();

    view.removeChild('child');

    equal(view.getChildren().length, 0, 'from parent');
});


test("bind with model", function () {
    var view, model;

    model = ya.Model.$create({
        config: {
            namespace: 'example',
            data: {
                name: "Seba",
                display: "none"
            }
        }
    });

    view = ya.View.$create({
        config: {
            models: [
                model
            ],
            tpl: ya.view.Template.$create({
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

    equal(view.querySelector('.example').innerText, 'Hi Seba');

    equal(view.querySelector('.example').getAttribute('style'), 'display: none;');

    model.data('display', 'block');

    equal(view.querySelector('.example').getAttribute('style'), 'display: block;');
});


test("rendered two times", function () {
    var view, model;

    model = ya.Model.$create({
        config: {
            namespace: 'example',
            data: {
                name: "Seba",
                display: "none"
            }
        }
    });

    view = ya.View.$create({
        config: {
            models: [
                model
            ],
            tpl: ya.view.Template.$create({
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

    equal(view.querySelector('.example').innerText, 'Hi Seba');

    equal(view.querySelector('.example').getAttribute('style'), 'display: none;');

    view.render();

    model.data('display', 'block');

    equal(view.querySelector('.example').getAttribute('style'), 'display: block;');
});

test("check if query match", function () {

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

    ok(ya.view.$Manager.get('selector-test').isQueryMatch('div#selector-test.employee.senior'));

    ok(!ya.view.$Manager.get('selector-test').isQueryMatch('span'));

    ok(ya.view.$Manager.get('selector-test').isQueryMatch('#selector-test.senior'));
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
//    view = ya.View.$create({
//        config: {
//            collections: [
//                collection
//            ],
//            tpl: ya.view.Template.$create({
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
//    equal(view.querySelector('.example').innerText, 'Hi Seba');
//});