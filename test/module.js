module('Module');

asyncTest("initialize", function () {

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
                'TplMock',
                'ModelMock',
                'ViewMock:->',
                'ControllerMock:->',
                'ControllerMock2'
            ],
            bus: {
                'ControllerMock:event': 'ControllerMock2:onEvent'
            },
            maxLoadingTime: 1000
        },
        onReady: function (view, ctr1) {

            view.render();
            ctr1.fireEvent('event');

            start();
            equal(counter, 1, 'events should be emitted through different controllers');

        },
        onError: function (e) {

            console.log('Error:', e.message, e.stack);

            throw ya.Error.$create('Test failed');

        }
    });

    ok(search.Module.$create() instanceof search.Module, 'created module should be instance of ya.Module');

});

