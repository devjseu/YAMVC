Measure.module('DOM');
/**
 * test 1
 */

Measure.suit('Appending content via innerHTML', function (start, stop) {
    var container = document.querySelector('#container'),
        divs = [];

    // create dom elements
    for (var i = 0; i < 10000; i++) {
        var div = document.createElement('div');
        div.className = "kw";
        div.id = "kw" + i;
        div.innerHTML = " ";
        container.appendChild(div);
        divs.push(div);
    }

    start();

    for (var i = 0; i < 10000; i++) {
        divs[i] = "<div><p>Taki <span>tekst</span> - " + i + "</p></div>";
    }

    stop();
    //clear container
    container.innerHTML = "";
});


/**
 * test 2
 */

Measure.suit('Appending content via appendChild', function (start, stop) {
    var container = document.querySelector('#container'),
        divs = [];

    // create dom elements
    for (var i = 0; i < 10000; i++) {
        var div = document.createElement('div');
        div.className = "kw";
        div.id = "kw" + i;
        div.innerHTML = " ";
        container.appendChild(div);
        divs.push(div);
    }

    start();

    for (var i = 0; i < 10000; i++) {
        var div = document.createElement('div'),
            p = document.createElement('p'),
            txt1 = document.createTextNode("Taki "),
            span = document.createElement("span"),
            text2 = document.createTextNode("tekst"),
            text3 = document.createTextNode(" - " + i);
        span.appendChild(text2);
        p.appendChild(txt1);
        p.appendChild(span);
        p.appendChild(text3);
        div.appendChild(p);
        divs[i].appendChild(div);
    }

    stop();
    //clear container
    container.innerHTML = "";
});


/**
 * test 3
 */

Measure.suit('Appending content via createTextNode', function (start, stop) {
    var container = document.querySelector('#container'),
        divs = [];

    // create dom elements
    for (var i = 0; i < 10000; i++) {
        var div = document.createElement('div');
        div.className = "kw";
        div.id = "kw" + i;
        div.innerHTML = " ";
        container.appendChild(div);
        divs.push(div);
    }

    start();

    for (var i = 0; i < 10000; i++) {
        var el = document.createTextNode("<div><p>Taki <span>tekst</span> - " + i + "</p></div>");
        divs[i].appendChild(el);
    }

    stop();
    //clear container
    container.innerHTML = "";
});

/**
 * test 5
 */

Measure.suit('Appending content via data', function (start, stop) {
    var container = document.querySelector('#container'),
        divs = [];

    // create dom elements
    for (var i = 0; i < 10000; i++) {
        var div = document.createElement('div');
        div.className = "kw";
        div.id = "kw" + i;
        div.innerHTML = " ";
        container.appendChild(div);
        divs.push(div);
    }

    start();

    for (var i = 0; i < 10000; i++) {
        var h = document.createTextNode("<div><p>Taki <span>tekst</span> - " + i + "</p></div>");
        var v = divs[i];
        v.replaceChild(h, v.firstChild);
    }

    stop();
    //clear container
    container.innerHTML = "";
});

/**
 * test 6
 */

Measure.suit('Removing content via innerHTML', function (start, stop) {
    var container = document.querySelector('#container'),
        divs = [];

    // create dom elements
    for (var i = 0; i < 10000; i++) {
        var div = document.createElement('div');
        div.className = "kw";
        div.id = "kw" + i;
        div.innerHTML = "<div><p>Taki <span>tekst</span> - " + i + "</p></div>";
        container.appendChild(div);
        divs.push(div);
    }

    start();

    for (var i = 0; i < 10000; i++) {
        divs[i].innerHTML = "";
    }
    stop();
    //clear container
    container.innerHTML = "";
});

/**
 * test 7
 */

Measure.suit('Removing content via removeChild', function (start, stop) {
    var container = document.querySelector('#container'),
        divs = [];

    // create dom elements
    for (var i = 0; i < 10000; i++) {
        var div = document.createElement('div');
        div.className = "kw";
        div.id = "kw" + i;
        div.innerHTML = "<div><p>Taki <span>tekst</span> - " + i + "</p></div>";
        container.appendChild(div);
        divs.push(div);
    }

    start();

    for (var i = 0; i < 10000; i++) {
        var l = divs[i].length;
        while(l--){
            var el = divs[i].item(l);
            el.parentNode.removeChild(el);
        }
    }

    stop();
    //clear container
    container.innerHTML = "";
});