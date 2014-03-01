module('Local proxy');

test("initialize", function () {
    var proxy;

    proxy = new ya.data.proxy.Localstorage();

    ok(proxy instanceof  ya.data.proxy.Localstorage);
});

asyncTest("clear database", function () {
    var records = [], proxy, action, opts, response, n = 'test';

    expect(2);

    action = new ya.data.Action();

    opts = {
        callback: function (proxy, action) {

            response = action.getResponse();

            equal(!response.error, true, "Records read");

            equal(response.result.length, 0, "No records exists");

            start();
        },
        namespace: n
    };

    action.setOptions(opts);


    ya.data.proxy.Localstorage.$clear(n);

    proxy = new ya.data.proxy.Localstorage();

    proxy.read(action);
});

test("execute passed conditions", function () {
    var proxy, record;

    proxy = new ya.data.proxy.Localstorage();

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
    var record, callback, callback2, proxy, action, action2, response, n = 'test2';

    expect(2);

    /**
     * clear storage
     */
    ya.data.proxy.Localstorage.$clear(n);

    record = {
        name: 'Anonymous',
        surname: 'Anonymous',
        age: 23
    };

    proxy = new ya.data.proxy.Localstorage();

    callback = function (proxy, action) {

        response = action.getResponse();
        action2 = new ya.data.Action();

        action2.setOptions({
            params: {id: record.id},
            namespace: n,
            callback: callback2
        });

        record = response.result;

        proxy.read(action2);
    };

    callback2 = function (proxy, action) {

        response = action.getResponse();

        equal(!response.error, true, "Record added to storage");

        record = response.result;

        ok(typeof record.id !== 'undefined', "Record has it id");

        start();
    };

    action = new ya.data.Action();

    action
        .setOptions({
            namespace: 'test2',
            callback: callback
        })
        .setData(record);

    proxy.create(action);
});

asyncTest("CRUD: proxy read data sorted by name", function () {
    var record, records, callback, callback2, proxy, action, action2, response, n = 'test3';

    expect(2);

    ya.data.proxy.Localstorage.$clear(n);

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

    proxy = new ya.data.proxy.Localstorage();

    callback = function () {

        action2 = new ya.data.Action();

        action2
            .setOptions({
                namespace: n,
                callback: callback2,
                sorters: [
                    ['name', 'DESC']
                ]
            });

        proxy.read(action2);

    };

    callback2 = function (proxy, action) {

        response = action.getResponse();

        equal(action.getStatus(), ya.data.Action.$status.SUCCESS, "Record added to storage");

        records = response.result;

        equal(records[0].name, "Tomasz", "2 records was returned");

        start();
    };

    action = new ya.data.Action();

    action
        .setOptions({
            namespace: n,
            callback: callback
        })
        .setData(records);

    proxy.create(action);
});

asyncTest("CRUD: proxy read data sorted by age", function () {
    var records, callback, callback2, proxy, action, action2, response, n = 'test4';

    expect(1);

    ya.data.proxy.Localstorage.$clear(n);

    records = [
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
            age: 28
        },
        {
            name: 'Anonymous 4',
            surname: 'Anonymous 4',
            age: 27
        }
    ];

    proxy = new ya.data.proxy.Localstorage();

    callback = function (proxy, action) {

        action2 = new ya.data.Action();

        action2
            .setOptions({
                namespace: n,
                callback: callback2,
                sorters: [
                    ['age', 'DESC']
                ]
            });

        proxy.read(action2);
    };

    callback2 = function (proxy, action) {

        response = action.getResponse();

        records = response.result;

        equal(records[0].age, 28, "Data was sorted");

        start();
    };

    action = new ya.data.Action();

    action
        .setOptions({
            namespace: n,
            callback: callback
        })
        .setData(records);

    proxy.create(action);
});

asyncTest("CRUD: proxy read data filtered by passed conditions", function () {
    var record, records, callback, callback2, proxy, action, action2, response, n = 'test5';

    expect(2);

    ya.data.proxy.Localstorage.$clear(n);

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

    proxy = new ya.data.proxy.Localstorage();

    callback = function (proxy, action) {

        response = action.getResponse();

        action2 = new ya.data.Action();

        action2
            .setOptions({
                namespace: n,
                callback: callback2,
                filters: [
                    ["age", ">", 24],
                    ["or", "age", ">", 24]
                ]
            });

        proxy.read(action2);

    };

    callback2 = function (proxy, action) {

        response = action.getResponse();
        records = response.result;

        equal(action.getStatus(), ya.data.Action.$status.SUCCESS, "Record added to storage");

        ok(records.length === 2, "2 records was returned");

        start();
    };

    action = new ya.data.Action();

    action
        .setOptions({
            namespace: n,
            callback: callback
        })
        .setData(records);

    proxy.create(action);
});

asyncTest("CRUD: proxy create records", function () {
    var record, records, callback, proxy, action, response, n = 'test6';

    expect(2);

    ya.data.proxy.Localstorage.$clear(n);

    proxy = new ya.data.proxy.Localstorage();

    record = {
        name: 'Anonymous',
        surname: 'Anonymous',
        age: 23
    };

    callback = function (proxy, action) {

        response = action.getResponse();

        equal(action.getStatus(), ya.data.Action.$status.SUCCESS, "Record added to storage");

        if (response.success === true) {
            record = response.result;
        }

        ok(typeof record.id !== 'undefined', "Record has it id");

        start();
    };

    action = new ya.data.Action();

    action
        .setOptions({
            namespace: n,
            callback: callback
        })
        .setData(record);

    proxy.create(action);
});

asyncTest("CRUD: proxy create batch of records", function () {
    var records, callback, proxy, action, response, n = 'test7';

    expect(4);

    ya.data.proxy.Localstorage.$clear(n);

    proxy = new ya.data.proxy.Localstorage();

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

    callback = function (proxy, action) {

        response = action.getResponse();
        records = response.result;

        equal(action.getStatus(), ya.data.Action.$status.SUCCESS, "Records added to storage");
        equal(records.length, 2, "2 records were created");

        for (var i = 0, l = records.length; i < l; i++) {

            ok(typeof records[i].id !== 'undefined', "Record has it id");

        }

        start();
    };

    action = new ya.data.Action();

    action
        .setOptions({
            namespace: n,
            callback: callback
        })
        .setData(records);

    proxy.create(action);
});

asyncTest("CRUD: proxy update data", function () {
    var record, records, callback, callback2, proxy, action, action2, response, n = 'test8';

    expect(2);

    ya.data.proxy.Localstorage.$clear(n);

    proxy = new ya.data.proxy.Localstorage();

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

    callback = function (proxy, action) {

        response = action.getResponse();
        records = response.result;
        records[1].name = "Anonymous Edited";

        action2 = new ya.data.Action();

        action2
            .setOptions({
                namespace: n,
                callback: callback2
            })
            .setData(records);

        proxy.update(action2);
    };

    callback2 = function (proxy, action) {

        response = action.getResponse();
        record = response.result[1];

        equal(action.getStatus(), ya.data.Action.$status.SUCCESS, "Record was edit and saved");
        equal(record.name, "Anonymous Edited", "Name was updated");

        start();
    };

    action = new ya.data.Action();

    action
        .setOptions({
            namespace: n,
            callback: callback
        })
        .setData(records);

    proxy.create(action);


});

asyncTest("CRUD: proxy destroy data", function () {

    var records, callback, callback2, proxy, action, action2, response, n = 'test9';

    expect(1);

    ya.data.proxy.Localstorage.$clear('test6');

    proxy = new ya.data.proxy.Localstorage();

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

    callback = function (proxy, action) {

        response = action.getResponse();
        records = response.result;

        action2 = new ya.data.Action();

        action2
            .setOptions({
                namespace: n,
                callback: callback2
            })
            .setData(records[1]);

        proxy.destroy(action2);
    };

    callback2 = function (proxy, action) {

        response = action.getResponse();

        equal(action.getStatus(), ya.data.Action.$status.SUCCESS, "Record was removed");

        start();

    };

    action = new ya.data.Action();

    action
        .setOptions({
            namespace: n,
            callback: callback
        })
        .setData(records);

    proxy.create(action);
});

asyncTest("CRUD: proxy batch destroy data", function () {

    var records, callback, callback2, proxy, action, action2, response, n = 'test10';

    expect(1);

    ya.data.proxy.Localstorage.$clear('test7');

    proxy = new ya.data.proxy.Localstorage();

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

    callback = function (proxy, action) {

        response = action.getResponse();
        records = response.result;

        action2 = new ya.data.Action();

        action2
            .setOptions({
                namespace: n,
                callback: callback2
            })
            .setData(records);

        proxy.destroy(action2);
    };

    callback2 = function (proxy, action) {

        equal(action.getStatus(), ya.data.Action.$status.SUCCESS, "Record was removed");

        start();

    };

    action = new ya.data.Action();

    action
        .setOptions({
            namespace: n,
            callback: callback
        })
        .setData(records);

    proxy.create(action);
});
