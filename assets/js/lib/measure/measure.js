(function (window, undefined) {
    "use strict";

    var elements = {},
        ready = false,
        measurements = {},
        running = [],
        startTime = 0,
        i = 0;

    startTime = (new Date()).getTime();
    window.performance = window.performance || {};
    window.performance.now = window.performance.now || function () {
        return (new Date()).getTime() - startTime;
    };

    function bindElements() {
        elements['body'] = document.querySelector('body');
    }

    function createElements() {
        var container,
            header,
            list;
    }

    function runMeasurements() {

    }

    window.Measure = {
        init: function () {
            bindElements();
            createElements();
            runMeasurements();
        },
        start: function (id, description) {
            id = id || 'measure-' + i++;
            measurements[id] = {};
            measurements[id].description = description || "";
            measurements[id].start = performance.now();
            return id;
        },
        stop: function (id) {
            var returned;
            if (id) {
                measurements[id].stop = performance.now();
                measurements[id].duration = measurements[id].stop - measurements[id].start;
                returned = measurements[id];
            } else {
                for (var i = 0, l = running.length; i < l; i++) {
                    var key = running[i];
                    measurements[key].stop = performance.now();
                    measurements[key].duration = measurements[key].stop - measurements[running[i]].start;
                }
                returned = measurements;
            }
            return returned;
        },
        suit: function (id, callback) {
            var start = function () {
                    Measure.start(id);
                },
                stop = function () {
                    Measure.stop(id);
                };

            callback(start, stop);
            Measure.log(id + ': ' + Measure.getMeasurements()[id].duration);
        },
        asyncSuit: function (id, callback) {
            var expect = 0,
                expectFn = function (counter) {
                    expect = counter;
                },
                start = function () {
                    expect--;
                    if (expect < 1) {
                        Measure.stop(id);
                        console.log(id + ': ' + Measure.getMeasurements()[id].duration);
                    }
                };
            Measure.start(id);
            callback.call(callback, expectFn, start);
        },
        getMeasurements: function () {
            return measurements;
        },
        module: function (id) {
            document.write('=========================== ' + id + ' =========================== <br>')
        },
        log: function (text) {
            document.write(text + '<br>')
        }
    };
}(window));