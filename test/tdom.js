(function (undefined) {

    var viewMock, bindingsMock, domMock;

    module('TDOM', {
        setup: function () {
            var html;

            viewMock = ya.View.$create({
                init: function () {
                    this
                        .initConfig()
                        .initDefaults();
                }
            });

            bindingsMock = [
                {"pointer": 0, "type": 4, "view": {"class": "app.view.Todos", "id": "todos"}},
                {"pointer": 1, "type": 1, "collection": {"view": "ya.View", "class": "ya.Collection", "tpl": "collection-test-0"}},
                {"fillAttr": false, callbacks: [], "name": "class", "original": "{{options.classes}}", "models": {}, "headers": [
                    ["options", "classes"]
                ], "type": 2, "pointer": 3},
                {"fillAttr": true, callbacks: [], "name": "disabled", "original": "{{options.disabled}}", "models": {}, "headers": [
                    ["options", "disabled"]
                ], "type": 2, "pointer": 4},
                {"original": "background: red", "fillAttr": false, callbacks: [], "headers": [], "name": "style", "models": {}, "type": 2, "pointer": 5},
                {"original": "{{example.value}} ", callbacks: [], "models": {}, "headers": [
                    ["example", "value"]
                ], "type": 3, "pointer": 6},
                {"original": "{{text.value}}", callbacks: [], "models": {}, "headers": [
                    ["text", "value"]
                ], "type": 3, "pointer": 7},
                {"original": "{{text.node}} sialalala {{text.node2}}", callbacks: [], "models": {}, "headers": [
                    ["text", "node"],
                    ["text", "node2"]
                ], "type": 3, "pointer": 8}
            ];

            html = document.createElement('div');
            html.innerHTML =
                '<div><div ya-css="background: red" style="background: red" ya-id="5"><button disabled="{{options.disabled}}" ya-id="4">Disabled!</button><span ya-id="6"></span><p class="{{options.classes}}" ya-id="3"><span ya-id="7"></span></p><ul ya-collection="$examples list" ya-id="1"></ul><span ya-id="8"></span><div ya-view="id:todos class:app.view.Todos" ya-id="0"></div></div></div>';

            domMock = document.createDocumentFragment();
            domMock.appendChild(html.firstChild);

        }
    });


    test("initialize", function () {
        var tDOM;

        try {

            ya.view.TDOM.$create();

        } catch (e) {

            ok(e.getId());

        }

        tDOM = ya.view.TDOM.$create({
            config: {
                bindings: bindingsMock,
                DOM: domMock,
                view: viewMock
            }
        });

        ok(tDOM instanceof ya.view.TDOM, 'is instance of ya.view.TDOM');

    });


    test("prepare bindings", function () {
        var view, tdom, bindings, dom;

        view = ya.View.$create({
            config: {
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
            initRequired: function () {
                return this;
            },
            initTemplate: function () {
                return this;
            }
        });

        tdom = ya.view.TDOM.$create({
            config: {
                view: view,
                bindings: bindingsMock,
                DOM: domMock
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


}());
