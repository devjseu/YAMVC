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
                tpl: ya.view.template.$manager.getItem('search-module-tpl'),
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


asyncTest("Load modules, communicate between them", function () {
    var counter = 0, counter2 = 0;

    ya.Controller.$extend({
        module: 'testModule',
        alias: 'Controller',
        defaults : {
            id : 'testModule-controller'
        }
    });

    ya.Controller.$extend({
        module: 'testModule-2',
        alias: 'Controller',
        onCtrlEvent: function () {

            counter++;

        }
    });

    ya.Module.$extend({
        module: 'testModule',
        alias: 'Module',
        defaults: {
            requires: [
                'Controller -i'
            ]
        },
        onReady: function () {

            ok(true, 'Module-1 is loaded');

        },
        onError: function (e) {

            ok(false, '3: ' + e.message);

        }
    });


    ya.Module.$extend({
        module: 'testModule-2',
        alias: 'Module',
        defaults: {
            requires: [
                'Controller -i'
            ]
        },
        onParentReady : function () {

            ok(true, 'Parent ready function was executed');

        },
        onReady: function () {

            ok(true, 'Module-2 is loaded');

        },
        onError: function (e) {

            ok(false, '2: ' + e.message);

        }
    });


    ya.Module.$extend({
        module: 'mainTestModule',
        alias: 'Module',
        defaults: {
            modules : [
                'testModule -i',
                'testModule-2 -i'
            ],
            maxLoadingTime: 1000,
            bus: {
                'testModule:Controller:event': 'testModule-2:Controller:onCtrlEvent'
            }
        },
        onReady: function () {
            var ctrl;

            ctrl = ya.controller.$manager.getItem('testModule-controller');
            ctrl.fireEvent('event');

            ok(true, 'Main Module is loaded');
            equal(counter, 1, "Communication trough different module is working");
            start();

        },
        onError: function (e) {

            ok(false, '1: ' + e.message);
            start();

        }
    });

    ok(mainTestModule.Module.$create() instanceof ya.Module, 'created module should be instance of ya.Module');

});

