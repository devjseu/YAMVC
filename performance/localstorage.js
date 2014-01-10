Measure.init();
/**
 * test 1
 */
var filterFn = function (record) {
    return record.age > 5000;
};

localStorage["users"] = {

};

Measure.suit('Localstorage - Serializing and filtering object', function () {
    var user = {};

    /* save 10000 records */
    for (var i = 0; i < 20000; i++) {
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

    console.log('Object - results len should be equal 5000: ', results.length);
});


/**
 * test 7
 */
localStorage["users"] = {

};

Measure.suit('Localstorage - Serializing and filtering array', function () {
    var user = [];

    /* save 10000 records */
    for (var i = 0; i < 20000; i++) {
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

    console.log('Array - results len should be equal 5000: ', results.length);
});