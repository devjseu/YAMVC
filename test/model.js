module('Model');
test("initialize", function () {
    var model;

    model = new yamvc.Model({
        config: {
            namespace: 'test'
        }
    });

    ok(model instanceof  yamvc.Model);
});

test("we are able to set proxy for model", function () {
    var model,
        proxy;

    proxy = new yamvc.data.Proxy();

    model = new yamvc.Model({
        config: {
            namespace: 'test'
        }
    });

    model.setProxy(proxy);

    ok(model.getProxy() instanceof yamvc.data.Proxy, "Proxy was set");

});

asyncTest("we are able to save model to db", function () {
    var model,
        proxy,
        promise;

    proxy = new yamvc.data.proxy.Localstorage();

    model = new yamvc.Model({
        config: {
            namespace: 'testModel',
            proxy: proxy
        }
    });

    model.setData({
        age: 24,
        name: 'Sebastian',
        surname: 'Widelak'
    });

    promise = model.save();

    promise.then(function (x) {

        equal(
            x.scope.getProxy().getStatus(),
            yamvc.data.proxy.Localstorage.Status.SUCCESS,
            "Model was saved"
        );

        yamvc.data.proxy.Localstorage.$clear('testModel');
        start();
    }, function () {

        yamvc.data.proxy.Localstorage.$clear('testModel');
        start();
    });

});

asyncTest("we are able to load model from db", function () {
    var model,
        proxy,
        promise;

    proxy = new yamvc.data.proxy.Localstorage();

    model = new yamvc.Model({
        config: {
            namespace: 'testModel2',
            proxy: proxy
        }
    });

    model.setData({
        age: 24,
        name: 'Sebastian',
        surname: 'Widelak'
    });

    promise = model.save();

    promise.then(function (x) {

        equal(
            x.scope.getProxy().getStatus(),
            yamvc.data.proxy.Localstorage.Status.SUCCESS,
            "Model was saved"
        );

        yamvc.data.proxy.Localstorage.$clear('testModel2');
        start();
    }, function () {

        yamvc.data.proxy.Localstorage.$clear('testModel2');
        start();
    });

});


asyncTest("we are able to update model from db", function () {
    var model,
        proxy,
        promise,
        updateFn;

    proxy = new yamvc.data.proxy.Localstorage();

    model = new yamvc.Model({
        config: {
            namespace: 'testModel3',
            proxy: proxy
        }
    });

    updateFn = function () {

        model.data('age', 35);

        promise = model.save();

        promise.then(function(x){

            equal(
                model.getProxy().getStatus(),
                yamvc.data.Proxy.Status.SUCCESS,
                "Record was updated"
            );

            yamvc.data.proxy.Localstorage.$clear('testModel3');
            start();
        }, function(){

            yamvc.data.proxy.Localstorage.$clear('testModel3');
            start();
        });

    };

    model.setData({
        age: 24,
        name: 'Sebastian',
        surname: 'Widelak'
    });

    promise = model.save();

    promise.then(
        updateFn,
        function () {
            start();
        }
    );

});


asyncTest("we are able to remove model from db", function () {
    var model,
        proxy,
        promise,
        removeFn;

    proxy = new yamvc.data.proxy.Localstorage();

    model = new yamvc.Model({
        config: {
            namespace: 'testModel4',
            proxy: proxy
        }
    });

    removeFn = function () {

        promise = model.remove();

        promise.then(function(x){

            equal(
                model.getProxy().getStatus(),
                yamvc.data.Proxy.Status.SUCCESS,
                "Record was removed"
            );

            start();
        }, function(){
            start();
        });

    };

    model.setData({
        age: 24,
        name: 'Sebastian',
        surname: 'Widelak'
    });

    promise = model.save();

    promise.then(
        removeFn,
        function () {
            start();
        }
    );

});