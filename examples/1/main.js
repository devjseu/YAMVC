


var tree = [
    {
        type: 'directory',
        name: 'usr',
        child: [
            {
                type: 'directory',
                name: 'local',
                child: [
                    {
                        name: 'foo.sh',
                        type: 'file',
                        extension: 'bash'
                    }
                ]
            }
        ]
    }
];


function printPath(node, fileName) {
    var path = [],
        findFile;

    findFile = function (obj, fileName) {
        var len = obj.length,
            i = 0,
            isMatched = false,
            current;

        while (i < len) {

            current = obj[i];
            if (current.type === 'directory') {
                isMatched = findFile(current.child, fileName);
                if (isMatched) {
                    path.push(current.name);
                }
            } else {
                if (current.name === fileName) {
                    path.push(current.name);
                    return true;
                }
            }
            i++;
        }

        return isMatched;
    };

    findFile(node, fileName);


    console.log(path.reverse().join("/"));
}

printPath(tree, "foo.sh");

//
//ya.$onReady(function () {
//    "use strict";
//
//    ya.View.$create({
//        config: {
//            models: [
//                ya.Model.$create({
//                    config: {
//                        namespace: 'names'
//                    },
//                    data: {
//                        name: "Guest"
//                    }
//                })
//            ],
//            id: 'bar',
//            tpl: ya.view.Template.$create({
//                config: {
//                    id: 'tpl-bar',
//                    tpl: [
//                        'Hello World!'
//                    ]
//                }
//            }),
//            renderTo: '#container'
//        }
//    }).render();
//
//});