(function (undefined) {

    var viewMock, tplMock;

    module('T2DOM', {
        setup: function () {

            tplMock = ya.view.Template.$create({
                init: function () {

                },
                getHtml: function () {
                    var div = document.createElement('div');

                    div.innerHTML =
                        '<div ya-css="backround: red">' +
                            '<button disabled="{{options.disabled}}">Disabled!</button>' +
                            '{{example.value}} <p class="{{options.classes}}"></p>' +
                            '<ul ya-collection="$examples list">' +
                            '<li>{{list.value}}</li>' +
                            '</ul>' +
                            '<div ya-view="$todos [alias=app.view.Todos]">' +
                            '</div>' +
                            '</div>';

                    return div;
                }
            });

            viewMock = ya.View.$create({
                init: function () {
                }
            });

        }
    });


    test("initialize", function () {
        var t2DOM;

        try {

            ya.view.T2DOM.$create();

        } catch (e) {

            ok(e.getId());

        }

        t2DOM = ya.view.T2DOM.$create({
            config: {
                tpl: tplMock,
                view: viewMock
            }
        });

        ok(t2DOM instanceof ya.view.T2DOM, 'is instance of ya.view.T2DOM');

        ok(typeof t2DOM.findBindings !== 'undefined', 'has findBindings method');

    });

    test("find bindings", function () {
        var t2DOM, called = 0, called2 = 0, called3 = 0, called4 = 0, called5 = 0;

        t2DOM = ya.view.T2DOM.$create({
            config: {
                tpl: tplMock,
                view: viewMock
            }
        });

        t2DOM.prepareColBindings = function () {
            called++;
        };

        t2DOM.prepareViewBindings = function () {
            called2++;
        };

        t2DOM.prepareCssBindings = function () {
            called3++;
        };

        t2DOM.prepareAttrBindings = function () {
            called4++;
        };

        t2DOM.prepareTextBindings = function () {
            called5++;
        };

        t2DOM.findBindings();

        equal(called, 1, 'prepareColBindings should be called ones');
        equal(called2, 1, 'prepareViewBindings should be called');
        equal(called3, 1, 'prepareCssBindings should be called');
        equal(called4, 2, 'prepareAttrBindings should be called');
        equal(called5, 3, 'prepareTextBindings should be called');
    });

    test("prepare collection bindings", function () {
        var t2DOM, attr, binding, div = document.createElement('div'), p = document.createElement('p');

        t2DOM = ya.view.T2DOM.$create({
            config: {
                tpl: tplMock,
                view: viewMock
            }
        });

        div.setAttribute('ya-collection', 'alias:app.collection.Todos id:todos namespace:todo model:ya.Model view:app.todos.element');

        attr = {
            name: 'ya-collection',
            value: div.getAttribute('ya-collection'),
            ownerElement: div
        };

        binding = t2DOM.prepareColBindings(attr);

        equal(binding.pointer, div, 'binding contains node element');
        equal(binding.collection.id, 'todos', 'binding contains id of collection');
        equal(binding.collection.alias, 'app.collection.Todos', 'binding contains an alias of collection');
        equal(binding.collection.namespace, 'todo', 'binding contains collection namespace');
        equal(binding.collection.model, 'ya.Model', 'binding contains model');
        equal(binding.collection.view, 'app.todos.element', 'view was read from attribute');

        p.innerText = '{{todo.name}}';
        div.innerHTML = "{{todo.id}}: ";


        div.setAttribute('ya-collection', 'id:todos');
        div.appendChild(p);

        var toString = div.innerHTML;

        attr = {
            name: 'ya-collection',
            value: div.getAttribute('ya-collection'),
            ownerElement: div
        };

        binding = t2DOM.prepareColBindings(attr);

        equal(binding.collection.view, 'ya.View', 'binding should have default view');
        equal(ya.mixins.DOM.toString(binding.collection.tpl), toString, 'template retrieved from DOM');


    });

    test("prepare view bindings", function () {
        var t2DOM, attr, binding, div = document.createElement('div');

        t2DOM = ya.view.T2DOM.$create({
            config: {
                tpl: tplMock,
                view: viewMock
            }
        });

        div.setAttribute('ya-view', 'alias:ya.View');

        attr = {
            name: 'ya-collection',
            value: 'alias:app.collection.Todos id:todos namespace:todo model:ya.Model',
            ownerElement: div
        };

        binding = t2DOM.prepareViewBindings(attr);

        equal(binding.pointer, div);
        equal(binding.view.id, 'todos');
        equal(binding.view.alias, 'app.collection.Todos');

    });

    test("prepare css bindings", function () {
        var t2DOM, attr, binding, div = document.createElement('div');

        t2DOM = ya.view.T2DOM.$create({
            config: {
                tpl: tplMock,
                view: viewMock
            }
        });

        div.setAttribute('ya-css', 'width: {{options.width}}');

        attr = {
            name: 'ya-css',
            value: div.getAttribute('ya-css'),
            ownerElement: div
        };

        binding = t2DOM.prepareCSSBindings(attr);

        equal(binding.pointer, div);

    });

    test("prepare attr bindings", function () {
        var t2DOM, attr, binding, div = document.createElement('div');

        t2DOM = ya.view.T2DOM.$create({
            config: {
                tpl: tplMock,
                view: viewMock
            }
        });

        attr = {
            name: 'disabled',
            value: '{{options.disabled}}',
            ownerElement: div
        };

        binding = t2DOM.prepareAttrBindings(attr);

        equal(binding.pointer, div);

    });

//test("update binding", function () {
//    var t2DOM,
//        div = document.createElement('div');
//
//    div.innerHTML = '<div>' +
//        '<div css="backround: red">' +
//        '<button disabled="{{options.disabled}}">Disabled!</button>' +
//        '<span id="here">{{example.value}} : {{example.value2}}</span> <p class="{{options.classes}}"></p>' +
//        '</div>' +
//        '</div>';
//
//    t2DOM = ya.view.T2DOM.$create({
//        config: {
//            html: div
//        }
//    });
//
//    t2DOM.findBindings();
//
//
//    t2DOM.update();
//
//    equal(t2DOM.getHtml().querySelector('#here').innerText, 'works : works2', 'value should be replaced');
//
//    ok(t2DOM.getHtml().querySelector('button').getAttribute('disabled') !== null, 'value should be replaced');
//
//    ok(t2DOM.getHtml().querySelector('p').classList.contains('hidden'), 'value should be replaced');
//
//    t2DOM.partialUpdate('example.works', 'works3');
//
//    equal(t2DOM.getHtml().querySelector('#here').innerText, 'works : works3', 'values should be replaced');
//
//    console.log(t2DOM.getHtml());
//
//
//});

}());
