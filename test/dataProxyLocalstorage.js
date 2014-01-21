module('Local proxy');

test("initialize", function () {
    var proxy;

    proxy = new yamvc.data.proxy.Localstorage();

    ok(proxy instanceof  yamvc.data.proxy.Localstorage);
});

asyncTest("clear database", function () {
    var records = [], proxy, action, opts;

    expect(2);

    action = new yamvc.data.Action();

    opts = {
        callback: function (proxy, response) {

            equal(!response.error, true, "Records read");

            equal(response.result.length, 0, "No records exists");

            start();
        },
        namespace: 'test'
    };

    action.setOptions(opts);


    yamvc.data.proxy.Localstorage.$clear('test');

    proxy = new yamvc.data.proxy.Localstorage();

    proxy.read(action);
});

test("execute passed conditions", function () {
    var proxy, record;

    proxy = new yamvc.data.proxy.Localstorage();

    record = {
        name: "Sebastian",
        surname: "Widelak",
        age: 40
    };

    ok(!proxy.executeCondition(record, ['name', 'like', 'Seb']), "like Seb should not match");
    ok(proxy.executeCondition(record, ['name', 'like', 'Seb%']), "like Seb% should match");
    ok(proxy.executeCondition(record, ['name', 'like', '%Seb%']), "like %eb% should match");
    ok(proxy.executeCondition(record, ['age', '>', 35]), "Should meet age > 35");
    ok(!proxy.executeCondition(record, ['age', '<', 35]), "Should not meet age < 35");
});

asyncTest("CRUD: proxy read data by id", function () {
    var record, callback, callback2, proxy, action, action2;

    expect(2);

    /**
     * clear storage
     */
    yamvc.data.proxy.Localstorage.$clear('test2');

    record = {
        name: 'Anonymous',
        surname: 'Anonymous',
        age: 23
    };

    proxy = new yamvc.data.proxy.Localstorage();

    callback = function (proxy, response) {

        action2 = new yamvc.data.Action();

        action2.setOptions({
            params: {id: record.id},
            namespace: 'test2',
            callback: callback2
        });

        record = response.result;

        proxy.read(action2);
    };

    callback2 = function (proxy, response) {

        equal(!response.error, true, "Record added to storage");

        record = response.result;

        console.log(response);

        ok(typeof record.id !== 'undefined', "Record has it id");

        start();
    };

    action = new yamvc.data.Action();

    action
        .setOptions({
            namespace: 'test2',
            callback: callback
        })
        .setData(record);

    proxy.create(action);
});

asyncTest("CRUD: proxy read data sorted by name", function () {
    var record, records, callback, callback2, proxy, action, action2;

    expect(2);

    yamvc.data.proxy.Localstorage.$clear('test8');

    records = [
        {
            name: 'Andrzej',
            surname: 'Anonymous',
            age: 28
        },
        {
            name: 'Adam',
            surname: 'Anonymous 2',
            age: 25
        },
        {
            name: 'Bartek',
            surname: 'Anonymous 3',
            age: 27
        },
        {
            name: 'Tomasz',
            surname: 'Anonymous 4',
            age: 21
        }
    ];

    proxy = new yamvc.data.proxy.Localstorage();

    callback = function () {

        action2 = new yamvc.data.Action();

        action2
            .setOptions({
                namespace: 'test8',
                callback: callback2,
                sorters: [
                    ['name', 'DESC']
                ]
            });

    };

    callback2 = function (proxy, response) {

        equal(!response.error, true, "Record added to storage");

        records = response.result;

        equal(records[0].name, "Tomasz", "2 records was returned");

        start();
    };

    action = new yamvc.data.Action();

    action
        .setOptions({
            namespace: 'test8',
            callback: callback
        })
        .setData(records);

    proxy.create(action);
});

asyncTest("CRUD: proxy read data sorted by age", function () {
    var record, records, callback, callback2, proxy;

    expect(2);

    yamvc.data.proxy.Localstorage.$clear('test8');

    record = [
        {
            name: 'Anonymous',
            surname: 'Anonymous',
            age: 21
        },
        {
            name: 'Anonymous 2',
            surname: 'Anonymous 2',
            age: 25
        },
        {
            name: 'Anonymous 3',
            surname: 'Anonymous 3',
            age: 27
        },
        {
            name: 'Anonymous 4',
            surname: 'Anonymous 4',
            age: 28
        }
    ];

    proxy = new yamvc.data.proxy.Localstorage();

    callback = function (proxy, response) {
        if (response.success === true) {
            record = response.result;
        }

        proxy.read('test8', {sorters: [
            ['age', 'DESC']
        ]}, callback2);
    };

    callback2 = function (proxy, response) {

        equal(response.success, true, "Record added to storage");

        if (response.success === true) {
            records = response.result;
        }

        equal(records[0].age, 28, "2 records was returned");

        start();
    };

    proxy.create('test8', record, callback);
});

asyncTest("CRUD: proxy read data filtered by passed conditions", function () {
    var record, records, callback, callback2, proxy;

    expect(2);

    yamvc.data.proxy.Localstorage.$clear('test3');

    record = [
        {
            name: 'Anonymous',
            surname: 'Anonymous',
            age: 23
        },
        {
            name: 'Anonymous 2',
            surname: 'Anonymous 2',
            age: 24
        },
        {
            name: 'Anonymous 3',
            surname: 'Anonymous 3',
            age: 25
        },
        {
            name: 'Anonymous 4',
            surname: 'Anonymous 4',
            age: 26
        }
    ];

    proxy = new yamvc.data.proxy.Localstorage();

    callback = function (proxy, response) {
        if (response.success === true) {
            record = response.result;
        }

        proxy.read('test3', {filters: [
            ["age", ">", 24],
            ["or", "age", ">", 24]
        ]}, callback2);
    };

    callback2 = function (proxy, response) {

        equal(response.success, true, "Record added to storage");

        if (response.success === true) {
            records = response.result;
        }

        ok(records.length === 2, "2 records was returned");

        start();
    };

    proxy.create('test3', record, callback);
});

asyncTest("CRUD: proxy create records", function () {
    var record, records, callback, proxy;

    expect(2);

    yamvc.data.proxy.Localstorage.$clear('test4');

    proxy = new yamvc.data.proxy.Localstorage();

    record = {
        name: 'Anonymous',
        surname: 'Anonymous',
        age: 23
    };

    callback = function (proxy, response) {

        equal(response.success, true, "Record added to storage");

        if (response.success === true) {
            records = response.result;
        }

        ok(typeof records.id !== 'undefined', "Record has it id");

        start();
    };

    proxy.create('test4', record, callback);
});

asyncTest("CRUD: proxy create batch of records", function () {
    var records, records2 = [], callback, proxy;

    expect(4);

    yamvc.data.proxy.Localstorage.$clear('test5');

    proxy = new yamvc.data.proxy.Localstorage();

    records = [
        {
            name: 'Anonymous',
            surname: 'Anonymous',
            age: 23
        },
        {
            name: 'Anonymous 2',
            surname: 'Anonymous 2',
            age: 24
        }
    ];

    callback = function (proxy, response) {

        equal(response.success, true, "Records added to storage");

        if (response.success === true) {
            records2 = response.result;
        }

        equal(records2.length, 2, "Record has it id");

        for (var i = 0, l = records2.length; i < l; i++) {

            ok(typeof records2[i] !== 'undefined');

        }

        start();
    };

    proxy.create('test5', records, callback);
});

asyncTest("CRUD: proxy update data", function () {
    var record, records, callback, callback2, proxy;

    expect(2);

    yamvc.data.proxy.Localstorage.$clear('test5');

    proxy = new yamvc.data.proxy.Localstorage();

    records = [
        {
            name: 'Anonymous',
            surname: 'Anonymous',
            age: 23
        },
        {
            name: 'Anonymous 2',
            surname: 'Anonymous 2',
            age: 24
        }
    ];

    callback = function (proxy, response) {

        if (response.success === true) {
            records = response.result;
        }

        records[1].name = "Anonymous Edited";

        proxy.update('test5', records[1], callback2);
    };

    callback2 = function (proxy, response) {

        ok(response.success, "Record was edit and saved");

        if (response.success === true) {
            record = response.result;
        }
        equal(record.name, "Anonymous Edited", "Name was updated");

        start();
    };

    proxy.create('test5', records, callback);


});

asyncTest("CRUD: proxy destroy data", function () {

    var records, callback, callback2, proxy;

    expect(1);

    yamvc.data.proxy.Localstorage.$clear('test6');

    proxy = new yamvc.data.proxy.Localstorage();

    records = [
        {
            name: 'Anonymous',
            surname: 'Anonymous',
            age: 23
        },
        {
            name: 'Anonymous 2',
            surname: 'Anonymous 2',
            age: 24
        }
    ];

    callback = function (proxy, response) {

        if (response.success === true) {
            records = response.result;
        }

        proxy.destroy('test6', records[1], callback2);
    };

    callback2 = function (proxy, response) {

        ok(response.success, "Record was removed");

        start();

    };

    proxy.create('test6', records, callback);
});

asyncTest("CRUD: proxy batch destroy data", function () {

    var records, callback, callback2, proxy;

    expect(1);

    yamvc.data.proxy.Localstorage.$clear('test7');

    proxy = new yamvc.data.proxy.Localstorage();

    records = [
        {
            name: 'Anonymous',
            surname: 'Anonymous',
            age: 23
        },
        {
            name: 'Anonymous 2',
            surname: 'Anonymous 2',
            age: 24
        }
    ];

    callback = function (proxy, response) {

        if (response.success === true) {
            records = response.result;
        }

        proxy.destroy('test6', records, callback2);
    };

    callback2 = function (proxy, response) {

        ok(response.success, "Record was removed");

        start();

    };

    proxy.create('test7', records, callback);
});
