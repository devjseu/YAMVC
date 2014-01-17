module('Action');

test("after initialization", function () {
    var action;

    action = new yamvc.data.Action();

    ok(action instanceof  yamvc.data.Action, "is instance of yamvc.data.Action");
    equal(action.get('status'), yamvc.data.Action.Status.PENDING, "has status pending");

});

test("has methods", function () {
    var action;

    action = new yamvc.data.Action();

    ok(typeof action.setOptions !== "undefined", "to set options");
    ok(typeof action.getOptions !== "undefined", "to get options");
    ok(typeof action.setResponse !== "undefined", "to set response");
    ok(typeof action.getResponse !== "undefined", "to get response");
    ok(typeof action.setStatus !== "undefined", "to set status");
    ok(typeof action.getStatus !== "undefined", "to get status");

});

test("shouldnt accept", function () {
    var action, err;

    action = new yamvc.data.Action();

    try {

        action.setStatus("pending");

    } catch (e) {

        err = e;

    }

    ok(err instanceof Error, "wrong status");


});