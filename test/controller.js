module('Controller');
test("initialize", function () {
    var controller;

    controller = new ya.Controller();

    ok(controller instanceof  ya.Controller);
});

test("bind events to view", function () {
    var alerted = 0;

    ya.View.$create({
        config: {
            id: 'controller-test',
            autoCreate: true,
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
                    id: 'tpl-example-4',
                    tpl: [
                        '<div>Who are you ?</div>',
                        '<button style="margin: 10px;">answer</button>',
                        '<div class="example" css="display: {{example.display}};">Hi {{example.name}}</div>'
                    ]
                }
            }),
            renderTo: '#test-6'
        }
    });

    ya.Controller.$create({
        config: {
            name: 'Main',
            events: {
                '$controller-test button': {
                    click: function () {
                        var value = prompt("Insert answer", "");
                    }
                }
            },
            routes: {

            }
        }
    });

    var oldPrompt = window.prompt;

    window.prompt = function MockPrompt() {
        alerted++;
    };

    click(ya.view.Manager.get('controller-test').querySelector('button'));

    equal(alerted, 1, "Event fired!");

    window.prompt = oldPrompt;

});