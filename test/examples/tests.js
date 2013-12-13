Base.onReady(function () {
    "use strict";
    var model, liker, ctr;

    QUnit.config.reorder = false;

    module("start");
    test("instantiate liker", function () {

        model = {
            likes: 0
        };

        liker = new Liker({
            config: {
                models: model,
                id: 'test-liker',
                tpl: 'tpl-liker',
                renderTo: '#container'
            }
        });

        ctr = new Controller({
            config: {
                name: 'Main',
                views: {
                    likeBtn: liker
                },
                control : {
                    '#liker' : {
                        click : function () {
                            this.incrementLikes();
                        }
                    }
                }
            }
        });

        liker.render();

        ok(liker.getModels().likes === 0, "Likes should be equal 0");
    });


    module("step 2");
    asyncTest("increase liker counter", function () {
        var linkerBtn = document.getElementById('liker'),
            expectation;

        expect(1);

        expectation = function () {
            equal(parseInt(linkerBtn.innerHTML), 1);
            start();
        };

        linkerBtn.addEventListener('click', expectation);
        linkerBtn.click();
    });

});