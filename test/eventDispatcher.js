module('Dispatcher');
test("is initialize", function () {

    ok(typeof ya.event.dispatcher !== 'undefined');
});

test("has", function () {

    ok(Array.isArray(ya.event.dispatcher.getDelegates()), 'array of events');

});

test("may adopt events which will be dispatched", function () {
    var delegates;

    ya.event.dispatcher.add(this, {
        '$list span': {
            click: function () {

            }
        }
    });

    delegates = ya.event.dispatcher.getDelegates();

    equal(delegates.length, 1);

    ya.event.dispatcher.add(this, {
        '$list2 span': {
            mouseover: function () {

            }
        }
    });

    equal(delegates.length, 2);

    ya.event.dispatcher.add(this, {
        '$list span': {
            mouseenter: function () {

            }
        }
    });

    equal(delegates.length, 2);
    equal(delegates[0].viewId, "list");
    equal(delegates[0].selectors.length, 1);
    equal(delegates[0].selectors[0].events.length, 2);

});
