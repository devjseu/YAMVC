module('Controller');
test("initialize", function () {
    var controller;

    controller = new yamvc.Controller();

    ok(controller instanceof  yamvc.Controller);
});