module('Controller');
test("initialize", function () {
    var controller;

    controller = new ya.Controller();

    ok(controller instanceof  ya.Controller);
});

test("bind events to view", function () {
    var alerted = 0, alerted2 = 0;

    var v = ya.View.$create({
        config: {
            id: 'controller-test',
            models: [
                ya.Model.$create({
                    config: {
                        namespace: 'example',
                        data: {
                            display: false,
                            name: ''
                        }
                    }
                })
            ],
            tpl: ya.view.Template.$create({
                config: {
                    id: 'tpl-example-4b',
                    tpl: [
                        '<div>Who are you ?</div>',
                        '<button style="margin: 10px;">answer</button>',
                        '<div class="example" ya-css="display: {{example.display}};">Hi {{example.name}}</div>'
                    ]
                }
            }),
            renderTo: '#test-6'
        }
    });

    ya.Controller.$create({
        config: {
            events: {
                '$controller-test button': {
                    click: function () {
                        MockPrompt();
                    }
                },
                '$controller-test .example' : {
                    click : 'onExampleClick'
                }
            },
            routes: {

            }
        },
        onExampleClick : function () {
            alerted2++;
        }
    });

    v.render();

    function MockPrompt() {
        alerted++;
    }

    click(ya.view.$manager.getItem('controller-test').querySelector('button'));

    equal(alerted, 1, "Event fired!");

    click(ya.view.$manager.getItem('controller-test').querySelector('.example'));

    equal(alerted2, 1, "Event fired!");

});