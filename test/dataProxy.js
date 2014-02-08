module('Proxy');
test("proxy initialize", function () {
    var proxy;

    proxy = new ya.data.Proxy();

    ok(proxy instanceof ya.data.Proxy);
});
