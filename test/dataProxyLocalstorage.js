module('Local proxy');

test("initialize", function () {
    var proxy;

    proxy = new yamvc.data.proxy.Localstorage();

    ok(proxy instanceof  yamvc.data.proxy.Localstorage);
});

asyncTest("clear database", function () {
    var records = [], callback, proxy;

    expect(2);

    yamvc.data.proxy.Localstorage.clear();

    callback = function (proxy, response) {

        equal(response.success, true, "Records read");

        if (response.success === true) {
            records = response.result;
        }

        equal(records.length, 0, "No records exists");

        start();
    };

    proxy = new yamvc.data.proxy.Localstorage();

    proxy.read('test', {}, callback);
});

test("execute passed conditions", function () {
    var proxy, record;

    proxy = new yamvc.data.proxy.Localstorage();

    record = {
        name : "Sebastian",
        surname : "Widelak",
        age : 40
    };

    ok(!proxy.executeCondition(record, ['name','like', 'Seb']), "like Seb should not match");
    ok(proxy.executeCondition(record, ['name','like', 'Seb%']), "like Seb% should match");
    ok(proxy.executeCondition(record, ['name','like', '%Seb%']), "like %Seb% should match");
    ok(proxy.executeCondition(record, ['age','>', 35]), "Should meet age > 35");
    ok(!proxy.executeCondition(record, ['age','<', 35]), "Should not meet age < 35");
});

asyncTest("CRUD: proxy read data by id", function () {
    var record, callback, callback2, proxy;

    expect(2);

    record = {
        name: 'Anonymous',
        surname: 'Anonymous',
        age: 23
    };

    proxy = new yamvc.data.proxy.Localstorage();

    callback = function (proxy, response) {
        if (response.success === true) {
            record = response.result;
        }

        proxy.read('test', record.id, callback2);
    };

    callback2 = function (proxy, response) {

        equal(response.success, true, "Record added to storage");

        if (response.success === true) {
            record = response.result;
        }

        ok(typeof record.id !== 'undefined', "Record has it id");

        start();
    };

    proxy.create('test', record, callback);
});

asyncTest("CRUD: proxy read data filtered by passed properties", function () {
    var record, callback, callback2, proxy;

    expect(2);

    yamvc.data.proxy.Localstorage.clear();

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

        proxy.read('test', {filters: [
            ["age", ">", 24],
            ["or","age", ">", 24]
        ]}, callback2);
    };

    callback2 = function (proxy, response) {

        equal(response.success, true, "Record added to storage");

        if (response.success === true) {
            record = response.result;
        }

        ok(typeof record.id !== 'undefined', "Record has it id");

        start();
    };

    proxy.create('test', record, callback);
});

asyncTest("CRUD: proxy create records", function () {
    var record, records, callback, proxy;

    expect(2);

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

    proxy.create('test', record, callback);
});

asyncTest("CRUD: proxy create batch of records", function () {
    var records, records2 = [], callback, proxy;

    expect(4);

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

    proxy.create('test', records, callback);
});

test("CRUD: proxy update data", function () {

});

test("CRUD: proxy destroy data", function () {

});
