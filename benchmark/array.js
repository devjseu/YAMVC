Measure.module('Array');

/**
 * test 1
 */

Measure.suit('iterate and compare', function (start, stop) {
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

Measure.suit('indexOf', function (start, stop) {
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