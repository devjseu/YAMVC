module('Dispatcher');

QUnit.config.reorder = false;

test("is initialize", function () {

    ok(typeof ya.event.dispatcher !== 'undefined');
});

test("has", function () {

    ok(Array.isArray(ya.event.dispatcher.getDelegates()), 'array of events');

});

test("may adopt events which will be dispatched", function () {
    var delegates;

    ya.event.dispatcher.clear();

    ya.event.dispatcher.add(this, {
        '$list span': {
            click: function () {

            }
        }
    });

    delegates = ya.event.dispatcher.getDelegates();

    equal(delegates.length, 1);

    ya.event.dispatcher.add(this, {
        '$list2 span': {
            mouseover: function () {

            }
        }
    });

    equal(delegates.length, 2);

    ya.event.dispatcher.add(this, {
        '$list span': {
            mouseenter: function () {

            }
        }
    });

    equal(delegates[0].selector.match('^\\$(.*)[\\s]')[1], "list");
    ok(typeof delegates[0].selector !== undefined);

});


test("assign listeners for new view", function () {
    var view;

    ya.event.dispatcher.add(this, {
        '$test span': {
            click: function (view) {

                view.queryEl('span').innerHTML = '1';

            },
            mouseenter: function () {

            }
        }
    });

    ya.event.dispatcher.add(this, {
        '$test': {
            click: function () {

            }
        }
    });

    view = ya.View.$create({
        config: {
            id: 'test',
            renderTo: '#test-7',
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-test',
                    tpl: [
                        '<div>',
                        '<ul>',
                        '<li>',
                        '<span>',
                        '</span>',
                        '</li>',
                        '</ul>',
                        '</div>'
                    ]
                }
            })
        }
    });

    view.render();

    ya.event.dispatcher.apply(view);

    view.queryEl('span').click();

    equal(view.queryEl('span').innerHTML, '1');

});

test("assign listeners only for appended view", function () {
    var view, view2;

    ya.event.dispatcher.add(this, {
        '$test2 span': {
            click: function (view, e) {
                var el = e.target || e.srcElement;

                el.innerHTML = '1';

            },
            mouseenter: function () {

            }
        }
    });

    ya.event.dispatcher.add(this, {
        '$test2': {
            click: function () {

            }
        }
    });

    view = ya.View.$create({
        config: {
            id: 'test2',
            renderTo: '#test-8',
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-test',
                    tpl: [
                        '<div>',
                        '<ul>',
                        '<li>',
                        '<span>',
                        '</span>',
                        '</li>',
                        '</ul>',
                        '</div>'
                    ]
                }
            })
        }
    });

    view.render();

    view2 = ya.View.$create({
        config: {
            id: 'test2b',
            parent: view,
            renderTo: 'li',
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-test2',
                    tpl: [
                        '<span>',
                        '</span>'
                    ]
                }
            })
        }
    });

    view2.render();

    ya.event.dispatcher.apply(view2);

    view.queryEls('span')[0].click();
    view.queryEls('span')[1].click();

    equal(view.queryEls('span')[0].innerHTML, '');
    equal(view.queryEls('span')[1].innerHTML, '1');

});

test("assign listeners for multiple views", function () {

    ya.event.dispatcher.add(this, {
        '$test3b li': {
            click: function (view, e) {
                var el = e.target || e.srcElement;

                el.innerHTML = '1';

            }
        }
    });

    ya.event.dispatcher.add(this, {
        '$test3 div li': {
            click: function (view, e) {
                var el = e.target || e.srcElement;

                el.setAttribute('passed', '1');

            }
        }
    });

    ya.View.$create({
        config: {
            id: 'test3',
            renderTo: '#test-9',
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-test3a',
                    tpl: [
                        '<div>',
                        '</div>'
                    ]
                }
            })
        }
    });

    ya.View.$create({
        config: {
            id: 'test3a',
            parent: ya.viewManager.get('test3'),
            renderTo: 'div',
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-test3b',
                    tpl: [
                        '<div class="top">',
                        '</div>'
                    ]
                }
            })
        }
    });

    ya.View.$create({
        config: {
            id: 'test3b',
            parent: ya.viewManager.get('test3'),
            renderTo: 'div',
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-test3b',
                    tpl: [
                        '<div class="content">',
                        '</div>'
                    ]
                }
            })
        }
    });

    ya.View.$create({
        config: {
            id: 'test3c',
            parent: ya.viewManager.get('test3'),
            renderTo: 'div',
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-test3c',
                    tpl: [
                        '<div class="bottom">',
                        '</div>'
                    ]
                }
            })
        }
    });

    ya.View.$create({
        config: {
            id: 'test3ba',
            parent: ya.viewManager.get('test3b'),
            renderTo: '.content',
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-test3ba',
                    tpl: [
                        '<ul class="list">',
                        '</ul>'
                    ]
                }
            })
        }
    });


    ya.viewManager.get('test3').render();

    var li1, li2;

    li1 = ya.View.$create({
        config: {
            id: 'test3baa',
            renderTo: '.content',
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-test3ba',
                    tpl: [
                        '<li>',
                        '</li>'
                    ]
                }
            })
        }
    });

    li2 = ya.View.$create({
        config: {
            id: 'test3bab',
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-test3ba',
                    tpl: [
                        '<li>',
                        '</li>'
                    ]
                }
            })
        }
    });

    ya.viewManager.get('test3ba').addChild(li1, 'ul');
    li2.render();

    li1.get('el').click();
    li2.get('el').click();

    equal(li1.get('el').innerHTML, '1');
    equal(li1.get('el').getAttribute('passed'), '1');

    equal(li2.get('el').innerHTML, '');
    equal(li2.get('el').getAttribute('passed'), null);

//    ya.experimental.event.dispatcher.apply(view2);

});

QUnit.config.reorder = true;