(function (undefined) {

    var tplMock, viewMock, domMock;

    module('TDOM', {
        setup: function () {
            var html;

            viewMock = ya.View.$create({
                config: {
                    tpl: '<div>' +
                    '<p>{{example.value}}</p>' +
                    '<p>{{example.value}}</p>' +
                    '<p>{{text.value}}<p>{{text.node}} - {{text.node2}}</p></p>' +
                    '</div>'
                }
            })
        }
    });


    test("initialize", function () {
        var tDOM, err;

        try {

            ya.view.TDOM.$create();

        } catch (e) {
            err = e;
        }

        ok(err && err.getId && err.getId());

        tDOM = ya.view.TDOM.$create({
            config: {
                view: viewMock,
                bindings: ya.$clone(viewMock.getTpl().get('bindings')),
                DOM: viewMock.getTpl().get('html').cloneNode(true)
            }
        });

        ok(tDOM instanceof ya.view.TDOM, 'is instance of ya.view.TDOM');

    });


    test("prepare bindings", function () {
        var view, tdom, bindings, dom;

        view = ya.View.$create({
            config: {
                tpl : viewMock.getTpl(),
                models: [
                    ya.$factory({
                        module: 'ya',
                        alias: 'Model',
                        namespace: 'example',
                        data: {
                            value: 'Test'
                        }
                    }),
                    ya.$factory({
                        module: 'ya',
                        alias: 'Model',
                        namespace: 'text',
                        data: {
                            value: 'Test 2',
                            node: 'Test 3',
                            node2: 'Test 4'
                        }
                    })
                ]
            },
            checkRequired: function () {
                return this;
            },
            initTemplate: function () {
                return this;
            }
        });

        tdom = ya.view.TDOM.$create({
            config: {
                view: view,
                bindings: ya.$clone(view.getTpl().get('bindings')),
                DOM: view.getTpl().get('html').cloneNode(true)
            }
        });

        bindings = tdom.getBindings();
        dom = tdom.getDOM();

        var pointer = true;
        ya.mixins.Array.each(bindings, function (binding) {
            if (!binding.pointer) {
                pointer = false;
            }
        });

        ok(pointer);
        ok(dom instanceof DocumentFragment);

    });


    test("update DOM bind with collection", function () {
        var view, collection;

        collection = ya.$factory({
            id: 'list-2',
            module: 'ya',
            alias: 'Collection',
            namespace: 'list',
            data: [
                {
                    id: 0,
                    value: 'new value'
                },
                {
                    id: 1,
                    value: 'new value 2'
                }
            ]
        });

        view = ya.View.$create({
            config: {
                renderTo: '#test-11',
                tpl: [

                    '<ul></ul>',
                    '<ul class="two" ya-collection="id:list-2">',
                    '<li>',
                    '{{list.value}}',
                    '</li>',
                    '</ul>'
                ],
                collections: [
                    collection
                ]
            }
        });

        view.render();

        equal(view.querySelectorAll('.two li span')[0].innerHTML, 'new value');

        collection.push({
            id: 2,
            value: 'new value 3'
        });

        equal(view.getChildren().length, 3);

        collection.filter(function (record) {

            return record.data('id') > 1;


        });

        equal(view.querySelectorAll('.two li span').length, 1);
        equal(view.querySelectorAll('.two li span')[0].innerHTML, 'new value 3');


        collection.clearFilters();
//
        equal(view.querySelectorAll('.two li span')[0].innerHTML, 'new value');
        equal(view.querySelectorAll('.two li span')[2].innerHTML, 'new value 3');

        collection.sort([
            ['id', 'DESC']
        ]);


        equal(view.querySelectorAll('.two li span')[2].innerHTML, 'new value');

        collection.remove(collection.getAt(1));
//
        equal(view.querySelectorAll('.two li span')[2], undefined);

    });

    test("update DOM Elements like inputs or textareas bind with model", function () {
        var view, model;

        model = ya.$factory({
            module: 'ya',
            alias: 'Model',
            namespace: 'editor',
            data: {
                value: 'Test1'
            }
        });

        view = ya.View.$create({
            config: {
                renderTo: '#test-12',
                tpl: [
                    '<div>',
                    '<input ya-model="namespace:editor" name="value" value="" />',
                    '<textarea ya-model="namespace:editor" name="value2" value=""></textarea>',
                    '</div>'
                ],
                models: [
                    model
                ]
            }
        });

        view.render();

        equal(view.querySelector('input').value, model.data('value'));
        equal(view.querySelector('textarea').value, "");

        view.querySelector('textarea').value = "Test2";
        keyup(view.querySelector('textarea'), "");

        equal(model.data('value2'), "Test2");
        ok(true);

    });
}());
