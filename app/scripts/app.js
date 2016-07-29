(function() {
    var global = { };
    window.global = global;

    const { version } = require("./package.json");
    document.title += " - " + version;
    global.version = version;

    var config = require("./scripts/config");
    global.config = config.load();

    var pokemon = require("./scripts/pokemon");
    pokemon.init(global.config.locale);

    var necroSocket = require("./scripts/necro.websocket");

    function listenToWebSocket() {
        ws = new WebSocket(global.config.websocket);
        global.ws = ws;
        ws.onclose = () => { setTimeout(listenToWebSocket, 1000) };
        ws.onopen = () => { console.log("Connected to Bot"); };
        ws.onmessage = function (evt) {
            var msg = JSON.parse(evt.data);
            if (msg.$type == necroSocket.MsgTypes.Position) {
                global.map.addToPath({ 
                    lat: msg.Latitude, 
                    lng: msg.Longitude 
                });
            } else if (msg.$type == necroSocket.MsgTypes.Capture) {
                console.log(msg);
                // 1 == CatchSuccess
                if (msg.Status = 1) {
                    global.map.addCatch({
                        id: msg.Id,
                        name: pokemon.getName(msg.Id),
                        lvl: msg.Level
                    });
                }
            } else if (msg.$type == necroSocket.MsgTypes.FortUsed) {
                //console.log(msg);
                if (msg.Latitude && msg.Longitude) {
                    global.map.addVisitedPokestop({
                        id: msg.Id,
                        name: msg.Name,
                        lat: msg.Latitude,
                        lng: msg.Longitude
                    });
                }
            } else if (msg.$type == necroSocket.MsgTypes.PokestopList) {
                var forts = Array.from(msg.Forts.$values.filter(f => f.Type == 1), f => {
                    return {
                        id: f.Id,
                        lat: f.Latitude,
                        lng: f.Longitude
                    }
                });
                global.map.addPokestops(forts);
            } else if (msg.$type == necroSocket.MsgTypes.PokemonList) {
                var pkm = Array.from(msg.PokemonList.$values, p => {
                    return {
                        id: p.PokemonId,
                        cp: p.Cp,
                        name: p.Nickname || pokemon.getName(p.PokemonId),
                        realname: pokemon.getName(p.PokemonId, "en")
                    }
                });
                global.map.displayPokemonList(pkm);
            } else {
                console.log(msg);
            }
        };
    }

    $(function() {
        $("#pokemonLink").click(() => {
            global.ws.send("PokemonList");
        });

        $("#eggLink").click(() => {
            global.ws.send("EggList");
        });

        $(".close").click(function() {
            $(this).parent().hide();
        });

        $("#settingsLink").click(() => {
            global.map.saveContext();
            window.location = "config.html";
        });

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