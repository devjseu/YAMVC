module('Error');


test("initialize", function () {

    try {

        throw ya.Error.$create(
            'test exception',
            123
        );

    } catch (e) {

        ok(e instanceof ya.Error, 'Error was catched');
        equal(e.getId(), 123, 'Error code match');
        equal(e.getMessage(), 'test exception', 'Error message match');

    }

});