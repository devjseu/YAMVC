test("basic library tests", function () {
    var model, view, ctr;

    model = {
        app: "Hello World"
    };

    view = new View({
        config: {
            models: model,
            id: 'test-view',
            tpl: 'test',
            renderTo: '#container'
        }
    });

    ctr = new Controller({
        config: {
            name: 'TestController',
            views: {
                test: view
            },
            routes: {
                "value/{\\d+}": 'changeValue'
            }
        },
        init: function () {
            Controller.prototype.init.apply(this, arguments);
            this.get('config').views.test.render();
            this.set('value', null);
        },
        changeValue: function (value) {
            this.set('value', value);
        }
    });

    ok(model instanceof Object);
    ok(view instanceof View);
    ok(ctr instanceof Controller);

});