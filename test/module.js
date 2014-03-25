module('Module');

asyncTest("initialize", function () {

   ya.Module.$extend({
        module: 'search',
        alias: 'Module',
        defaults: {
            maxLoadingTime: 1000
        },
        onReady: function () {

            ok(true, 'Module is loaded');
            start();

        },
        onError: function (e) {

            ok(false, e.message);
            start();

        }
    });

    ok(search.Module.$create() instanceof search.Module, 'created module should be instance of ya.Module');

});

asyncTest("Dependency resolving, communication between controllers", function () {

    var counter = 0;

    ya.view.Template.$extend({
        module: 'search',
        alias: 'TplMock',
        defaults: {
            id: 'search-module-tpl',
            tpl: [
                '<div>',
                '<p>{{locale.search}}</p>',
                '<input name="s" type="text" />',
                '</div>'
            ]
        }
    });

    ya.Model.$extend({
        module: 'search',
        alias: 'ModelMock',
        defaults: {
            namespace: 'locale',
            data: {
                search: 'Search'
            }
        }
    });

    ya.View.$extend({
        module: 'search',
        alias: 'ViewMock',
        defaults: function () {
            return {
                renderTo: '#search-module-test',
                tpl: ya.view.template.$Manager.getItem('search-module-tpl'),
                models: [
                    ya.$factory({
                        module: 'search',
                        alias: 'ModelMock'
                    })
                ]
            };
        }
    });

    ya.Controller.$extend({
        module: 'search',
        alias: 'ControllerMock',
        defaults: {
            id: 'ctrl-1'
        }
    });

    ya.Controller.$extend({
        module: 'search',
        alias: 'ControllerMock2',
        defaults: {
            id: 'ctrl-2'
        },
        onEvent: function () {
            counter++;
        }
    });


    ya.Module.$extend({
        module: 'search',
        alias: 'Module',
        defaults: {
            requires: [
                'TplMock -i',
                'ModelMock -p',
                'ViewMock -ip',
                'ControllerMock -ip',
                'ControllerMock2 -i'
            ],
            bus: {
                'ControllerMock:event': 'ControllerMock2:onEvent'
            },
            maxLoadingTime: 1000
        },
        onReady: function (modelDefinition, view, ctr1) {

            ok(true, 'Module is loaded');

            view.render();
            ctr1.fireEvent('event');

            equal(counter, 1, 'events should be emitted through different controllers');
            start();

        },
        onError: function (e) {

            console.log('Error:', e.message, e.stack);

            ok(false, e.message);
            start();

        }
    });

    ok(search.Module.$create() instanceof search.Module, 'created module should be instance of ya.Module');

});


asyncTest("Load modules and communicate trough them", function () {

    ya.Module.$extend({
        module: 'search',
        alias: 'Module',
        defaults: {
            modules : [],
            maxLoadingTime: 1000
        },
        onReady: function () {

            ok(true, 'Module is loaded');
            start();

        },
        onError: function (e) {

            ok(false, e.message);
            start();

        }
    });

    ok(search.Module.$create() instanceof search.Module, 'created module should be instance of ya.Module');

});

