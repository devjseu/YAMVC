module('Model');
test("initialize", function () {
    var model;

    model = new ya.Model({
        config: {
            namespace: 'test'
        }
    });

    ok(model instanceof  ya.Model);
});

test("we are able to set proxy for model", function () {
    var model,
        proxy;

    proxy = new ya.data.Proxy();

    model = new ya.Model({
        config: {
            namespace: 'test'
        }
    });

    model.setProxy(proxy);

    ok(model.getProxy() instanceof ya.data.Proxy, "Proxy was set");

});

asyncTest("we are able to save model to db", function () {
    var model,
        proxy,
        promise;

    proxy = new ya.data.proxy.Localstorage();

    model = new ya.Model({
        config: {
            namespace: 'testModel',
            proxy: proxy
        }
    });

    model.data({
        age: 24,
        name: 'Sebastian',
        surname: 'Widelak'
    });

    promise = model.save();

    promise
        .then(function (x) {

            equal(
                x.action.getStatus(),
                ya.data.Action.$status.SUCCESS,
                "Model was saved"
            );

            ya.data.proxy.Localstorage.$clear('testModel');

            start();

        })
        .then(0, function () {

            ya.data.proxy.Localstorage.$clear('testModel');
            start();

        });

});

asyncTest("we are able to load model from db", function () {
    var model,
        proxy,
        promise;

    proxy = new ya.data.proxy.Localstorage();

    model = new ya.Model({
        config: {
            namespace: 'testModel2',
            proxy: proxy
        }
    });

    model.data({
        age: 24,
        name: 'Sebastian',
        surname: 'Widelak'
    });

    promise = model.save();

    promise
        .then(function (x) {

            equal(
                x.action.getStatus(),
                ya.data.Action.$status.SUCCESS,
                "Model was saved"
            );

            ya.data.proxy.Localstorage.$clear('testModel2');
            start();
        })
        .then(0, function () {

            ya.data.proxy.Localstorage.$clear('testModel2');
            start();

        });

});


asyncTest("we are able to update model from db", function () {
    var model,
        proxy,
        promise,
        updateFn;

    proxy = new ya.data.proxy.Localstorage();

    model = new ya.Model({
        config: {
            namespace: 'testModel3',
            proxy: proxy
        }
    });

    updateFn = function () {

        model.data('age', 35);

        promise = model.save();

        promise
            .then(function (x) {

                equal(
                    x.action.getStatus(),
                    ya.data.Action.$status.SUCCESS,
                    "Record was updated"
                );

                ya.data.proxy.Localstorage.$clear('testModel3');
                start();
            })
            .then(0, function () {

                ya.data.proxy.Localstorage.$clear('testModel');
                start();

            });

    };

    model.data({
        age: 24,
        name: 'Sebastian',
        surname: 'Widelak'
    });

    promise = model.save();

    promise
        .then(
            updateFn
        )
        .then(0, function () {

            ya.data.proxy.Localstorage.$clear('testModel3');
            start();

        });

});


asyncTest("we are able to remove model from db", function () {
    var model,
        proxy,
        promise,
        removeFn;

    proxy = new ya.data.proxy.Localstorage();

    model = new ya.Model({
        config: {
            namespace: 'testModel4',
            proxy: proxy
        }
    });

    removeFn = function () {

        promise = model.remove();

        promise
            .then(function (x) {

                equal(
                    x.action.getStatus(),
                    ya.data.Action.$status.SUCCESS,
                    "Record was removed"
                );

                start();
            })
            .then(0, function () {

                ya.data.proxy.Localstorage.$clear('testModel');
                start();

            });

    };

    model.data({
        age: 24,
        name: 'Sebastian',
        surname: 'Widelak'
    });

    promise = model.save();

    promise
        .then(
            removeFn
        )
        .then(0, function () {

            ya.data.proxy.Localstorage.$clear('testModel4');
            start();

        });

});