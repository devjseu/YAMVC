Measure.module('Localstorage');

/**
 * test 1
 */
Measure.suit('Saving object', function (start, stop) {
    // make some preparation before tests
    var user = {};

    localStorage["users"] = {

    };

    /* save 10000 records */
    for (var i = 0; i < 10000; i++) {
        user['test' + i] = {
            id: 'test' + i,
            name: 'Sebastian' + i,
            surname: 'Widelak' + i,
            age: 1 + i
        }
    }

    user = JSON.stringify(user);

    // start test
    start();
    /* save 10000 records */
    for (var i = 0; i < 100; i++) {

        localStorage["users"] = user;

    }

    stop();

});

/**
 * test 2
 */
Measure.suit('Saving array', function (start, stop) {
    // make some preparation before tests
    var user = [];

    localStorage["users"] = {

    };

    /* save 10000 records */
    for (var i = 0; i < 10000; i++) {
        user.push({
            id: 'test' + i,
            name: 'Sebastian' + i,
            surname: 'Widelak' + i,
            age: 1 + i
        });
    }

    user = JSON.stringify(user);

    // start test
    start();
    /* save 10000 records */
    for (var i = 0; i < 100; i++) {

        localStorage["users"] = user;

    }

    stop();

});
