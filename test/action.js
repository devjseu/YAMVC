module('Action');

test("after initialization", function () {
    var action;

    action = ya.data.Action.$create();

    ok(action instanceof  ya.data.Action, "is instance of ya.data.Action");
    equal(action.get('status'), ya.data.Action.Status.PENDING, "has status pending");

});

test("has method", function () {
    var action;

    action = ya.data.Action.$create();

    ok(typeof action.setOptions !== "undefined", "to set options");
    ok(typeof action.getOptions !== "undefined", "to get options");
    ok(typeof action.setResponse !== "undefined", "to set response");
    ok(typeof action.getResponse !== "undefined", "to get response");
    ok(typeof action.setStatus !== "undefined", "to set status");
    ok(typeof action.getStatus !== "undefined", "to get status");
    ok(typeof action.getOption !== "undefined", "to get one option");
    ok(typeof action.getData !== "undefined", "to get data");

});

test("shouldnt accept", function () {
    var action, err;

    action = new ya.data.Action();

    try {

        action.setStatus("pending");

    } catch (e) {

        err = e;

    }

    ok(err instanceof Error, "wrong status");


});