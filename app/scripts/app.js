(function() {
    // var path = require("path");
    // var fs = require("fs");

    var global = { };
    window.global = global;

    var config = require("./scripts/config");
    global.config = config.load();

    var pokemon = require("./scripts/pokemon");
    pokemon.init(global.config.locale);

    var necroSocket = require("./scripts/necro.websocket");

    function listenToWebSocket() {
        ws = new WebSocket(global.config.websocket);
        ws.onclose = () => { console.log("Connection closed, retrying in 1s"); setTimeout(listenToWebSocket, 1000) };
        ws.onopen = () => { console.log("Connected to Bot"); };
        ws.onmessage = function (evt) {
            var msg = JSON.parse(evt.data);

            if (msg.$type == necroSocket.MsgTypes.Position) {
                var lat = msg.Latitude;
                var lng = msg.Longitude;

                global.map.addToPath({ 
                    lat: lat, 
                    lng: lng 
                });
            } else if (msg.$type == necroSocket.MsgTypes.Capture) {
                global.map.addCapture({
                    id: msg.Id,
                    name: pokemon.getName(msg.Id),
                    lvl: msg.Level
                });
            }
        };
    }
    
    // function loadLogs(necrofolder) {
    //     var logfolder = path.join(necrofolder, "Logs");
    //     fs.readdir(logfolder, (err, files) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             var latest = files.sort().pop();
    //             if (latest) startWatching(path.join(logfolder, latest)); 
    //         }
    //     });
    // };

    // function startWatching(file) {
    //     console.log("Watching " + file);
    //     setInterval(() => {
    //         fs.readFile(file, "utf-8", (err, data) => {
    //             if (err) return console.log(err);
    //             getWayPoints(data);
    //         });
    //     }, 1000);
    // }

    // var line = 0, pos = null;
    // function getWayPoints(content) {
    //     var first = (line == 0);
    //     var lines = content.match(/[^\r\n]+/g);

    //     var pts = [];

    //     for (; line < lines.length; line++) {
    //         if (lines[line].indexOf("[GPS]") > 0) {
    //             var m = lines[line].match(/.+ (\d+(\.|\,)\d*) \- (\d+(\.|\,)\d*)/);
    //             if (m) {
    //                 // replace , by . (locale)
    //                 var lat = parseFloat(m[1].replace(",", "."));
    //                 var lng = parseFloat(m[3].replace(",", "."));

    //                 pos = { 
    //                     evt: 'walk',
    //                     lat: lat, 
    //                     lng: lng 
    //                 };
    //                 pts.push(pos);
    //             }
    //         } else if (lines[line].indexOf("[Caught]") > 0) {
    //             var m = lines[line].match(/\(CatchSuccess\) (\w+) Lvl\: (\d+)/);
    //             if (m && pos != null) {
    //                 pts.push({
    //                     evt: 'catch',
    //                     name: m[1],
    //                     id: pokemon.getIdFromName(m[1]),
    //                     lvl: parseInt(m[2]),
    //                     lat: pos.lat,
    //                     lng: pos.lng
    //                 })
    //             }
    //         }
    //     }

    //     if (first) global.map.initPath(pts);
    //     else if (pts.length > 0) global.map.addToPath(pts);
    // }

    $(function() {
        if (global.config.websocket) {
            // settings ok, let's go
            global.map = new Map("map");
            listenToWebSocket();
        } else {
            // no settings, first time run?
            window.location = "config.html";
        }
    });

}());