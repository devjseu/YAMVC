Measure.module('View');

/**
 * test 1
 */
Measure.suit('v0.1.8 View rendering', function (start, stop, loops) {
    var container = document.querySelector('#container'),
        View = yamvc.backup.View,
        views = [],
        models = {};

    loops(100);

    models.likes = new yamvc.Model({
        config: {
            namespace: 'test'
        },
        data: {
            count: 0,
            count2: 1
        }
    });

    for (var i = 0; i < 100; i++) {
        views.push(new View({
            config: {
                models: models,
                tpl: 'tpl-view',
                renderTo: '#container'
            }
        }));
    }


    start();

    for (var i = 0; i < 100; i++) {
        views[i].render();
    }

    stop();

    //clear container
    container.innerHTML = "";
});

/**
 * test 2
 */
Measure.suit('v0.1.9 view rendering', function (start, stop, loops) {
    var container = document.querySelector('#container'),
        View = yamvc.View,
        views = [],
        models = {};

    loops(100);

    models.likes = new yamvc.Model({
        config: {
            namespace: 'test'
        },
        data: {
            count: 0,
            count2: 1,
            visibility: 'show'
        }
    });

    for (var i = 0; i < 100; i++) {
        views.push(new View({
            config: {
                models: models,
                tpl: 'tpl-view-2',
                renderTo: '#container'
            }
        }));
    }

    start();

    for (var i = 0; i < 100; i++) {
        views[i].render();
    }

    stop();

    //clear container
    container.innerHTML = "";
});