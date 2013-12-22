module('Proxy');
test("proxy initialize", function () {
    var proxy;

    proxy = new yamvc.data.Proxy();

    ok(proxy instanceof yamvc.data.Proxy);
});

test("Defaults was set", function () {
    var proxy;

    proxy = new yamvc.data.Proxy();

    equal(proxy._config.propertyResults, 'results');

});

