Measure.module('Array');

/**
 * test 1
 */

Measure.suit('iterate through arrays and compare values', function (start, stop) {
    // make some preparation before tests
    var user = [],
        user2 = [],
        len;

    /* create 10000 rec */
    for (var i = 0; i < 100000; i++) {
        user.push(Math.random().toString(36).substr(2, 5));
    }

    user[99999] = '$test5';

    user2 = ['$test1', '$test2', '$test3', '$test4', '$test5'];


    // start test
    start();


    len = user2.length;
    while (len--) {

        for (var i = 0; i < user.length; i++) {

            if (user2[len] === user[i]) break;


        }

    }

    // finish test
    stop();
});

Measure.suit('iterate through arrays and search for values using indexOf', function (start, stop) {
    // make some preparation before tests
    var user = [],
        user2 = [],
        len;

    /* create 10000 rec */
    for (var i = 0; i < 100000; i++) {
        user.push(Math.random().toString(36).substr(2, 5));
    }

    user[99999] = '$test5';

    user2 = ['$test1', '$test2', '$test3', '$test4', '$test5'];


    // start test
    start();


    len = user2.length;
    while (len--) {

        if (user.indexOf(user2[len]) >= 0) break;

    }

    // finish test
    stop();
});


Measure.suit('iterate array and compare strings', function (start, stop, loop) {
    // make some preparation before tests
    var user = [],
        compare = [
            'test',
            'test2'
        ].join("."),
        len;

    /* create 10000 rec */
    for (var i = 0; i < 100000; i++) {
        user.push([
            Math.random().toString(36).substr(2, 5),
            Math.random().toString(36).substr(2, 5)
        ]);
    }

    user[17] = ['test', 'test2'];


    loop(10);

    // start test
    start();


    len = user.length;
    while (len--) {

        if (user[len].join(".") === compare) {
            //match
        }

    }

    // finish test
    stop();
});

Measure.suit('iterate array and compare arrays', function (start, stop, loop) {
    // make some preparation before tests
    var user = [],
        compare = [
            'test',
            'test2'
        ],
        tmp = [],
        match = false,
        len;

    /* create 10000 rec */
    for (var i = 0; i < 100000; i++) {
        user.push([
            Math.random().toString(36).substr(2, 5),
            Math.random().toString(36).substr(2, 5)
        ]);
    }

    user[17] = ['test', 'test2'];

    loop(10);

    // start test
    start();


    len = user.length;
    while (len--) {

        tmp = compare.slice();
        match = false;
        while (tmp.length) {

            if (user[len][tmp.length - 1] === tmp.pop()) {

                if (tmp.length === 0) {
                    match = true;
                }

            }

        }

        if (match) {
            //match
        }

    }

    // finish test
    stop();
});

/**
 * test 3
 */

Measure.suit('clone array using slice', function (start, stop, loop) {
    var a = [1, 2, 3, 4, 5, 6, 7, 8, 9, '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        b = [];
    //loop each test
    loop(3000);

    // start test
    start();

    b = a.slice();

    // finish test
    stop();
});
/**
 * test 4
 */

Measure.suit('clone array using concat', function (start, stop, loop) {
    var a = [1, 2, 3, 4, 5, 6, 7, 8, 9, '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        b = [];
    //loop each test
    loop(3000);

    // start test
    start();

    b = [].concat(a);

    // finish test
    stop();
});

/**
 * test 5
 */
Measure.suit('clone array using for-unshift', function (start, stop, loop) {
    var a = [1, 2, 3, 4, 5, 6, 7, 8, 9, '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        b = [];
    //loop each test
    loop(3000);

    // start test
    start();

    for (var i = a.length; i--;) {
        b.unshift(a[i]);
    }

    // finish test
    stop();
});

/**
 * test 6
 */
Measure.suit('clone array using for-push', function (start, stop, loop) {
    var a = [1, 2, 3, 4, 5, 6, 7, 8, 9, '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        b = [];
    //loop each test
    loop(3000);

    // start test
    start();

    for (var i = 0, l = a.length; i < l; i++) {
        b.push(a[i]);
    }

    // finish test
    stop();
});

/**
 * test 7
 */
Measure.suit('clone array using a.concat()', function (start, stop, loop) {
    var a = [1, 2, 3, 4, 5, 6, 7, 8, 9, '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        b = [];
    //loop each test
    loop(3000);

    // start test
    start();

    b = a.concat();

    // finish test
    stop();
});

/**
 * test 8
 */
Measure.suit('clone array using Array.apply', function (start, stop, loop) {
    var a = [1, 2, 3, 4, 5, 6, 7, 8, 9, '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        b = [];
    //loop each test
    loop(3000);

    // start test
    start();

    b = Array.apply(undefined, a);

    // finish test
    stop();
});