(function (window, undefined) {
    "use strict";
    var yamvc = window.yamvc,
        Liker;

    Liker = yamvc.experimental.View.extend({
        init: function () {
            Liker.Parent.init.apply(this, arguments);
        },
        incrementLikes: function () {
            var model = this.getModel('likes');

            model.data(
                'count',
                model.data('count') + 1
            );

            model.data(
                'disabled',
                !model.data('disabled')
            );
        }
    });

    window.Liker = Liker;

}(window));