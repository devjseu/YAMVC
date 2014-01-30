module('Controller');
test("initialize", function () {
    var controller;

    controller = new yamvc.Controller();

    ok(controller instanceof  yamvc.Controller);
});

test("bind events to view",function () {
    var view, ctr;

    view = new yamvc.View({
        config: {
            autoCreate: true,
            models: [
                new yamvc.Model({
                    config : {
                        namespace : 'example',
                        data : {
                            display: false,
                            name: ''
                        }
                    }
                })
            ],
            tpl: new yamvc.view.Template({
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

    ctr = new yamvc.Controller({
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