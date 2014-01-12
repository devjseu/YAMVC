Measure.module('Data operations');

/**
 * test 1
 */

Measure.suit('Creating data in object', function (start, stop) {
    // make some preparation before tests
    var user = {};

    // start test
    start();

    /* save 10000 records */
    for (var i = 0; i < 10000; i++) {
        user['test' + i] = {
            id: 'test' + i,
            name: 'Sebastian' + i,
            surname: 'Widelak' + i,
            age: 1 + i
        }
    }

    // finish test
    stop();
});

/**
 * test 2
 */

Measure.suit('Creating data in array', function (start, stop) {
    // make some preparation before tests
    var user = [];

    // start test
    start();

    /* save 10000 records */
    for (var i = 0; i < 10000; i++) {
        user.push({
            id: 'test' + i,
            name: 'Sebastian' + i,
            surname: 'Widelak' + i,
            age: 1 + i
        });
    }

    // finish test
    stop();
});

/**
 * test 3
 */
Measure.suit('Serializing, filtering and getting by id using object', function (start, stop) {
    // make some preparation before tests
    var user = {},
        filterFn = function (record) {
            return record.age > 5000;
        };

    localStorage["users"] = {

    };

    // start test
    start();

    /* save 10000 records */
    for (var i = 0; i < 10000; i++) {
        user['test' + i] = {
            id: 'test' + i,
            name: 'Sebastian' + i,
            surname: 'Widelak' + i,
            age: 1 + i
        }
    }

    localStorage["users"] = JSON.stringify(user);


    /* read 10000 records */
    user = JSON.parse(localStorage["users"]);

    /* using conditions */
    var results = [];
    for (var id in user) {
        if (user.hasOwnProperty(id)) {
            if (filterFn(user[id])) {
                results.push(user[id]);
            }
        }
    }

    /* by id */
    var result = {};
    result = user['test999'];

    // finish test
    stop();
});

/**
 * test 4
 */
Measure.suit('Serializing, filtering and getting by id using array', function (start, stop) {
    var user = [],
        filterFn = function (record) {
            return record.age > 5000;
        };

    localStorage["users"] = {

    };

    // start test
    start();

    /* save 10000 records */
    for (var i = 0; i < 10000; i++) {
        user.push({
            id: 'test' + i,
            name: 'Sebastian' + i,
            surname: 'Widelak' + i,
            age: 1 + i
        });
    }

    localStorage["users"] = JSON.stringify(user);

    user = JSON.parse(localStorage["users"]);

    var results = [];
    for (var i = 0, l = user.length; i < l; i++) {
        if (filterFn(user[i])) {
            results.push(user[i]);
        }
    }

    /* by id */
    var result = {};
    for (var i = 0, l = user.length; i < l; i++) {
        if (user[i].id === 'test999') {
            result = user[i];
        }
    }

    // finish test
    stop();
});