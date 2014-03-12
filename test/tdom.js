(function (undefined) {

    var viewMock, tplMock;

    tplMock = ya.$factory({
        module: 'ya',
        alias: 'view.Template',
        id: 'tdom-test',
        tpl: [
            '<div>',
            '<p class="{{example.class}}">',
            '{{example.value}}',
            '</p>',
            '<ul ya-collection="$examples list">' ,
            '<li>{{list.value}}</li>' ,
            '</ul>',
            '</div>'
        ]
    });

    module('TDOM', {
        setup: function () {

            viewMock = ya.View.$create({
                init: function () {
                }
            });

        }
    });


    test("initialize", function () {
        var tDOM;

        try {

            ya.view.TDOM.$create();

        } catch (e) {

            ok(e.getId());

        }

        tDOM = ya.view.TDOM.$create({
            config: {
                tpl: tplMock,
                view: viewMock
            }
        });

        ok(tDOM instanceof ya.view.TDOM, 'is instance of ya.view.TDOM');

    });

    test("bind model to bindings", function () {
        var tDOM;

        try {

            ya.view.TDOM.$create();

        } catch (e) {

            ok(e.getId());

        }

        tDOM = ya.view.TDOM.$create({
            config: {
                tpl: tplMock,
                view: viewMock
            }
        });

        tDOM.update([
            {
                path: 'example.class',
                value: 'hidden'
            },
            {
                path: 'example.value',
                value: 'Value!'
            },
            {
                path: '$'
            }
        ]);

        ok(tDOM instanceof ya.view.TDOM, 'is instance of ya.view.TDOM');

    });


}());
