module('Controller');
test("initialize", function () {
    var controller;

    controller = new ya.Controller();

    ok(controller instanceof  ya.Controller);
});

test("bind events to view",function () {
    var view, ctr;

    view = new ya.View({
        config: {
            autoCreate: true,
            models: [
                ya.Model.$create({
                    config : {
                        namespace : 'example',
                        data : {
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

    ctr = ya.Controller.$create({
        config: {
            name: 'Main',
            views: {
                test: view
            },
            events: {
                'button': {
                    click: function () {
                    }
                }
            },
            routes: {

            }
        }
    });

    ok(true);
});