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
        divs[i].innerHTML = "<div><p>Taki <span>tekst</span> - " + i + "</p></div>";
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

Measure.suit('Appending HTML via appendChild parsed from string', function (start, stop) {

    function stringToDOM(domText) {
        var startTagBeg = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
            startTag = /<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
            endTagBeg = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
            endTag = /<\/([-A-Za-z0-9_]+)[^>]*>/,
            attr = /([-A-Za-z0-9_]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g,
            dom = document.createDocumentFragment(),
            fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected"),
            pointer,
            matchedStart,
            matchedEnd,
            element,
            matched,
            attrs;

        function makeMap(str) {
            var obj = {}, items = str.split(",");
            for (var i = 0; i < items.length; i++)
                obj[ items[i] ] = true;
            return obj;
        }

        pointer = dom;

        while (domText.length) {
            matchedStart = domText.match(startTagBeg);

            if (matchedStart && matchedStart[1]) {
                attrs = [];
                element = document.createElement(matchedStart[1]);
                matchedStart[0].replace(attr, function (match, name) {
                    var value = arguments[2] ? arguments[2] :
                        arguments[3] ? arguments[3] :
                            arguments[4] ? arguments[4] :
                                fillAttrs[name] ? name : "";

                    value && element.setAttribute(name, value.replace(/(^|[^\\])"/g, '$1\\\"'));
                });
                pointer.appendChild(element);
                pointer = element;
                domText = domText.slice(matchedStart[0].length);
                continue;
            }
            matchedEnd = domText.match(endTagBeg);

            if (matchedEnd && matchedEnd[1]) {
                pointer = pointer.parentNode;
                domText = domText.slice(matchedEnd[0].length);
                continue;
            }

            matchedStart = domText.match(startTag);
            matchedEnd = domText.match(endTag);
            matched = !matchedStart ? matchedEnd : (!matchedEnd ? matchedStart : (matchedStart.index < matchedEnd.index ? matchedStart : matchedEnd));
            if (matched) {
                element = document.createTextNode(domText.slice(0, matched.index));
                domText = domText.slice(matched.index);
                pointer.appendChild(element);
            }
        }
        return dom;
    }

    var container = document.querySelector('#container'),
        divs = [],
        el;

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
        el = stringToDOM("<div><p>Taki <span>tekst</span> - " + i + "</p></div>");
        divs[i].appendChild(el);
    }

    stop();
    //clear container
    container.innerHTML = "";
});

/**
 * test 4
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
 * test 5
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
        while (l--) {
            var el = divs[i].item(l);
            el.parentNode.removeChild(el);
        }
    }

    stop();
    //clear container
    container.innerHTML = "";
});

Measure.suit('Searching in html using TreeWalker', function (start, stop) {
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
    divs[5].innerHTML = "" +
        "<div>" +
        "<p>" +
        "Taki " +
        "<span>{{locale}}</span>" +
        " - " + 0 + "" +
        "</p>" +
        "<div>" +
        "{{locale2}}" +
        "</div>" +
        "</div>";

    function treeWalker(element) {
        var node, textNodes = [], walker;

        walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_ELEMENT,
            null,
            false
        );

        while (node = walker.nextNode()) {
            if (node.nodeType == 3) {
                textNodes.push(node.nodeValue);
            }
        }
        return textNodes;
    }

    start();
    var text = treeWalker(container);
    stop();

    //clear container
    container.innerHTML = "";
});

Measure.suit('Searching in html using recursion', function (start, stop) {
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

    divs[5].innerHTML = "" +
        "<div>" +
        "<p>" +
        "Taki " +
        "<span>{{locale}}</span>" +
        " - " + 0 + "" +
        "</p>" +
        "<div>" +
        "{{locale2}}" +
        "</div>" +
        "</div>";

    function customRecursive(element) {
        var result = [];

        (function findTextNodes(current) {
            for (var i = 0; i < current.childNodes.length; i++) {
                var child = current.childNodes[i];
                if (child.nodeType == 3) {
                    result.push(child.nodeValue);
                }
                else {
                    findTextNodes(child);
                }
            }
        })(element);
        return result;
    }

    start();
    var text = customRecursive(container);
    stop();


    //clear container
    container.innerHTML = "";
});

Measure.suit('Searching in html using iterative', function (start, stop) {
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
    divs[5].innerHTML = "" +
        "<div>" +
        "<p>" +
        "Taki " +
        "<span>{{locale}}</span>" +
        " - " + 0 + "" +
        "</p>" +
        "<div>" +
        "{{locale2}}" +
        "</div>" +
        "</div>";

    function customIterative(element) {
        var result = [];

        var node = element.childNodes[0];
        while (node !== null) {
            if (node.nodeType === 3) {
                result.push(node.nodeValue);
            }

            if (node.hasChildNodes()) {
                node = node.firstChild;
            }
            else {
                while (node.nextSibling === null) {
                    node = node.parentNode;
                    if (node === element) {
                        break;
                    }
                }
                if (node === element) {
                    break;
                }
                node = node.nextSibling;
            }
        }
        return result;
    }

    start();
    var text = customIterative(container);
    stop();


    //clear container
    container.innerHTML = "";
});