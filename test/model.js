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

test("we are able to save model to db", function () {
    var model,
        proxy;

    proxy = new yamvc.data.proxy.Localstorage();

    model = new yamvc.Model({
        config: {
            namespace: 'test',
            proxy : proxy
        }
    });

    model.setData({
        age:24,
        name : 'Sebastian',
        surname: 'Widelak'
    });

    model.save();

    ok(model.getProxy() instanceof yamvc.data.Proxy, "Proxy was set");
});