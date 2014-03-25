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
                    id: 'tpl-test-1b',
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
                                id: 'tpl-child-c',
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
                                id: 'tpl-child-b',
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

    view.removeChild(ya.view.$Manager.getItem('child'));

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
                        '<div class="example" ya-css="display: {{example.display}};">Hi {{example.name}}</div>'
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

test("initialize models if passed as objects", function () {
    var view;

    view = ya.View.$create({
        config: {
            models: [
                {
                    namespace : 'example',
                    data : {
                        name : 'Seba',
                        display : 'none'
                    }
                }
            ],
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-example-3b',
                    tpl: [
                        '<div>Who are you ?</div>',
                        '<button style="margin: 10px;">answer</button>',
                        '<div class="example" ya-css="display: {{example.display}};">Hi {{example.name}}</div>'
                    ]
                }
            })
        }
    });

    view.render();

    equal(view.querySelector('.example').innerText, 'Hi Seba');

    equal(view.querySelector('.example').getAttribute('style'), 'display: none;');

    view.getModel('example').data('display', 'block');

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
                        '<div class="example" ya-css="display: {{example.display}};">Hi {{example.name}}</div>'
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

    var v = ya.View.$create({
        config: {
            id: 'selector-test',
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-test-1',
                    tpl: [
                        '<div class="employee senior">',
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
    });

    v.render();

    ok(ya.view.$Manager.getItem('selector-test').isQueryMatch('div#selector-test.employee.senior'), 'selector should match');

    ok(!ya.view.$Manager.getItem('selector-test').isQueryMatch('span'), 'selector shouldn\'t match');

    ok(ya.view.$Manager.getItem('selector-test').isQueryMatch('#selector-test.senior'), 'selector should match');
});

test("initialize template in shorter way", function () {
    var view;

    view = ya.View.$create({
        config: {
            id: 'tpl-short-test-b',
            tpl: {
                id: 'tpl-test-99',
                tpl: [
                    '<div class="employee senior" id="selector-test">',
                    '<p class="target">',
                    '</p>',
                    '</div>'
                ]
            }
        }
    });

    view.render();

    ok(view.querySelector('.target') !== null);

});

test("fires an event when new model is appended", function () {

    var view, modelChange = 0;

    view = ya.View.$create({
        config: {
            id: 'tpl-short-test',
            tpl: {
                id: 'tpl-test-999',
                tpl: [
                    '<div>',
                    '</div>'
                ]
            }
        }
    });

    view.addEventListener('modelChange', function () {
        modelChange++;
    });

    view.setModel({ namespace: 'test' });

    ok(true);

});
