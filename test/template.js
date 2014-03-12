(function (undefined) {

    var htmlMock;

    module('Template', {
        setup: function () {

            htmlMock = document.createElement('div');
            htmlMock.innerHTML =
                '<div ya-css="backround: red">' +
                    '<button disabled="{{options.disabled}}">Disabled!</button>' +
                    '{{example.value}} <p class="{{options.classes}}">{{text.value}}</p>' +
                    '<ul ya-collection="$examples list">' +
                    '<li>{{list.value}}</li>' +
                    '</ul>' +
                    '{{text.node}}' +
                    '<div ya-view="$todos [alias=app.view.Todos]">' +
                    '</div>' +
                    '</div>';

        }
    });


    test("initialize", function () {
        var Template;

        Template = ya.view.Template.$create({
            config: {
                tpl: htmlMock,
                id: 'tpl-id-0'
            }
        });

        ok(Template instanceof ya.view.Template, 'is instance of ya.view.Template');

        ok(typeof Template.initBindings !== 'undefined', 'has findBindings method');

    });

    test("find bindings", function () {
        var Template, called = 0, called2 = 0, called3 = 0, called4 = 0, called5 = 0;

        Template = ya.view.Template.$create({
            config: {
                tpl: htmlMock,
                id: 'tpl-id-1'
            },
            init: function (opts) {
                this
                    .initConfig(opts)
                    .initDefaults();
            }
        });

        Template.prepareColBindings = function () {
            called++;
        };

        Template.prepareViewBindings = function () {
            called2++;
        };

        Template.prepareCSSBindings = function () {
            called3++;
        };

        Template.prepareAttrBindings = function () {
            called4++;
        };

        Template.prepareTextBindings = function () {
            called5++;
        };

        Template.initBindings();

        equal(called, 1, 'prepareColBindings should be called ones');
        equal(called2, 1, 'prepareViewBindings should be called');
        equal(called3, 1, 'prepareCssBindings should be called');
        equal(called4, 2, 'prepareAttrBindings should be called');
        equal(called5, 5, 'prepareTextBindings should be called');


    });

    test("prepare collection bindings", function () {
        var Template, attr, binding, div = document.createElement('div'), p = document.createElement('p');

        Template = ya.view.Template.$create({
            config: {
                tpl: htmlMock,
                id: 'tpl-id-2'
            }
        });

        div.setAttribute('ya-collection', 'alias:app.collection.Todos id:todos namespace:todo model:ya.Model view:app.todos.element');

        attr = {
            name: 'ya-collection',
            value: div.getAttribute('ya-collection'),
            ownerElement: div
        };

        binding = Template.prepareColBindings(attr);

        equal(binding.pointer, div.getAttribute('ya-id'), 'binding contains node element');
        equal(binding.collection.id, 'todos', 'binding contains id of collection');
        equal(binding.collection.alias, 'app.collection.Todos', 'binding contains an alias of collection');
        equal(binding.collection.namespace, 'todo', 'binding contains collection namespace');
        equal(binding.collection.model, 'ya.Model', 'binding contains model');
        equal(binding.collection.view, 'app.todos.element', 'view was read from attribute');

        p.innerText = '{{todo.name}}';
        div.innerHTML = "{{todo.id}}: ";


        div.setAttribute('ya-collection', 'id:todos');
        div.appendChild(p);

        attr = {
            name: 'ya-collection',
            value: div.getAttribute('ya-collection'),
            ownerElement: div
        };

        binding = Template.prepareColBindings(attr);

        equal(binding.collection.view, 'ya.View', 'binding should have default view');

        var tpl = ya.view.template.$manager.getItem(binding.collection.tpl);

        equal(tpl.getTpl().hasChildNodes(), true, 'template retrieved from DOM');


    });

    test("prepare view bindings", function () {
        var Template, attr, binding, div = document.createElement('div');

        Template = ya.view.Template.$create({
            config: {
                tpl: htmlMock,
                id: 'tpl-id-6'
            }
        });

        div.setAttribute('ya-view', 'alias:ya.View');

        attr = {
            name: 'ya-collection',
            value: 'alias:app.collection.Todos id:todos namespace:todo model:ya.Model',
            ownerElement: div
        };

        binding = Template.prepareViewBindings(attr);

        equal(binding.pointer, div.getAttribute('ya-id'));
        equal(binding.view.id, 'todos');
        equal(binding.view.alias, 'app.collection.Todos');

    });

    test("prepare css bindings", function () {
        var Template, attr, binding, div = document.createElement('div');

        Template = ya.view.Template.$create({
            config: {
                tpl: htmlMock,
                id: 'tpl-id-3'
            }
        });

        div.setAttribute('ya-css', 'width: {{options.width}}');

        attr = {
            name: 'ya-css',
            value: div.getAttribute('ya-css'),
            ownerElement: div
        };

        binding = Template.prepareCSSBindings(attr);

        equal(binding.pointer, div.getAttribute('ya-id'));

    });

    test("prepare attr bindings", function () {
        var Template, attr, binding, div = document.createElement('div');

        Template = ya.view.Template.$create({
            config: {
                tpl: htmlMock,
                id: 'tpl-id-4'
            }
        });

        attr = {
            name: 'disabled',
            value: '{{options.disabled}}',
            ownerElement: div
        };

        binding = Template.prepareAttrBindings(attr);

        equal(binding.pointer, div.getAttribute('ya-id'));

    });

    test("clone DOM and bindings", function () {
        var template, instance;

        template = ya.view.Template.$create({
            config: {
                tpl: htmlMock,
                id: 'tpl-id-4b'
            }
        });

        instance = template.prepareInstance();

        ok(instance.dom instanceof DocumentFragment);

    });

    test("return TDOM instance", function () {
        var tpl = ya.view.Template.$create({
                config: {
                    tpl: htmlMock,
                    id: 'tpl-id-5'
                }
            }),
            view = ya.View.$create({
                config: {
                    tpl: tpl
                },
                init: function () {
                }
            }),
            tDOM;

        tDOM = tpl.getTDOMInstance(view);

        ok(tDOM instanceof ya.view.TDOM);

    });

}());