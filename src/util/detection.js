/**
 * @namespace ya
 * @class util.$detection
 * @extends ya.Core
 */
ya.Core.$extend({
    module: 'ya',
    alias: 'util.$detection',
    singleton: true,
    defaults: {
        isWorker: null,
        isCan: null
    },
    isWorkerAvail: function () {
        return this._config.isWorker = this._config.isWorker || window.Worker;
    },
    isCanvasAvail: function () {
        return this._config.isCan = this._config.isCan || (
            function () {
                var canvas = document.createElement('canvas');
                return !!(canvas.getContext && canvas.getContext('2d'));
            }()
        );
    }
});