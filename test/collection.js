module('Collection');
test("initialize", function () {
    var collection;

    collection = new yamvc.Collection({
        config: {
            model: yamvc.Model
        }
    });

    ok(collection instanceof  yamvc.Collection);
});


test("collection has model", function () {
    var collection,
        ModelDefinition,
        modelInstance,
        namespace;

    collection = new yamvc.Collection({
        config: {
            model: yamvc.Model,
            modelConfig: {
                namespace : 'test'
            }
        }
    });

    ModelDefinition = collection.getModel();
    namespace = collection.getModelConfig().namespace;

    modelInstance = new ModelDefinition(
        {
            config: {
                namespace: namespace
            }
        }
    );

    ok(modelInstance instanceof yamvc.Model);
});

test("has data and record is turned into model", function () {
    var collection,
        ModelDefinition,
        data;

    data = [
        {id: 0, name: 'Anonymous', surname: 'Anonymous', age: 24},
        {id: 1, name: 'Anonymous 2', surname: 'Anonymous 2', age: 22},
        {id: 2, name: 'Anonymous 3', surname: 'Anonymous 3', age: 21}
    ];

    collection = new yamvc.Collection({
        config: {
            model: yamvc.Model,
            modelConfig: {
                namespace : 'test2'
            }
        },
        data: data
    });

    ModelDefinition = collection.get('config').model;

    equal(collection.getRawData().length, 3, "Data of raw array is equal to 3");

    ok(collection.getAt(0) instanceof ModelDefinition);

});


test("is countable", function () {
    var collection,
        data;

    data = [
        {id: 0, name: 'Anonymous', surname: 'Anonymous', age: 24},
        {id: 1, name: 'Anonymous 2', surname: 'Anonymous 2', age: 22},
        {id: 2, name: 'Anonymous 3', surname: 'Anonymous 3', age: 21}
    ];

    collection = new yamvc.Collection({
        config: {
            model: yamvc.Model,
            modelConfig: {
                namespace : 'test3'
            }
        },
        data: data
    });

    equal(collection.count(), 3, "Number of records in array is equal 3");

});

test("we are able to filter the collection by custom function", function () {
    var collection,
        filterFn,
        data;

    data = [
        {id: 0, name: 'Anonymous', surname: 'Anonymous', age: 24},
        {id: 1, name: 'Anonymous 2', surname: 'Anonymous 2', age: 22},
        {id: 2, name: 'Anonymous 3', surname: 'Anonymous 3', age: 21}
    ];

    collection = new yamvc.Collection({
        config: {
            model: yamvc.Model,
            modelConfig: {
                namespace : 'test4'
            }
        },
        data: data
    });

    filterFn = function (model) {
        var age = model.property('age');
        if (age > 22) {
            return true;
        }
    };

    collection.filterFn(filterFn);

    equal(collection.count(), 1, "Filtered collection length should be equal 1");

    equal(collection.getAt(0).property('id'), 0, "Available record after filter should have id 0");
});

test("we are able to clear filters from collection", function () {
    var collection,
        filterFn,
        data;

    data = [
        {id: 0, name: 'Anonymous', surname: 'Anonymous', age: 24},
        {id: 1, name: 'Anonymous 2', surname: 'Anonymous 2', age: 22},
        {id: 2, name: 'Anonymous 3', surname: 'Anonymous 3', age: 21}
    ];

    collection = new yamvc.Collection({
        config: {
            model: yamvc.Model,
            modelConfig: {
                namespace : 'test5'
            }
        },
        data: data
    });

    filterFn = function (model) {
        var age = model.property('age');
        if (age > 22) {
            return true;
        }
    };

    collection.filterFn(filterFn);

    equal(collection.count(), 1, "Filtered collection length should be equal 1");

    collection.clearFilterFn();

    equal(collection.count(), 3, "After clearing filter collection should have 3 records");

});

test("we are able to set proxy for collection", function () {
    var collection,
        proxy;

    proxy = new yamvc.data.Proxy();

    collection = new yamvc.Collection({
        config: {
            model: yamvc.Model,
            modelConfig: {
                namespace : 'test6'
            }
        }
    });

    collection.setProxy(proxy);

    ok(collection.getProxy() instanceof yamvc.data.Proxy, "Proxy was set");

});