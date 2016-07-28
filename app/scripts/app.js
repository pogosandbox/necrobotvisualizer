(function() {
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
            //console.log(msg);
            if (msg.$type == necroSocket.MsgTypes.Position) {
                var lat = msg.Latitude;
                var lng = msg.Longitude;

                global.map.addToPath({ 
                    lat: lat, 
                    lng: lng 
                });
            } else if (msg.$type == necroSocket.MsgTypes.Capture) {
                // 1 == CatchSuccess
                if (msg.Status = 1) {
                    global.map.addCatch({
                        id: msg.Id,
                        name: pokemon.getName(msg.Id),
                        lvl: msg.Level
                    });
                }
            } else if (msg.$type == necroSocket.MsgTypes.FortUsed) {
                if (msg.Latitude && msg.Longitude) {
                    global.map.addPokestop({
                        lat: msg.Latitude,
                        lng: msg.Longitude
                    });
                }
            } else {
                //console.log(msg);
            }
        };
    }

    $(function() {
        $("#settingsLink").click(() => {
            global.map.saveContext();
            window.location = "config.html";
        })

        if (global.config.websocket) {
            // settings ok, let's go
            global.map = new Map("map");
            global.map.loadContext();
            listenToWebSocket();
        } else {
            // no settings, first time run?
            window.location = "config.html";
        }
    });

}());