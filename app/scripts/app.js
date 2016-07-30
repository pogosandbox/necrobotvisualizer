(function() {
    var global = { snipping: false };
    window.global = global;

    const { version } = require("./package.json");
    document.title += " - " + version;
    global.version = version;

    var config = require("./scripts/config");
    global.config = config.load();

    var pokemon = require("./scripts/pokemon");
    pokemon.init(global.config.locale);

    function listenToWebSocket() {
        ws = new WebSocket(global.config.websocket);
        global.ws = ws;
        ws.onclose = () => { setTimeout(listenToWebSocket, 1000) };
        ws.onopen = () => { console.log("Connected to Bot"); };
        ws.onmessage = function (evt) {
            var msg = JSON.parse(evt.data);
            if (msg.$type.indexOf("UpdatePositionEvent") > 0) {
                if (!global.snipping) {
                    global.map.addToPath({ 
                        lat: msg.Latitude, 
                        lng: msg.Longitude 
                    });
                }
            } else if (msg.$type.indexOf("PokemonCaptureEvent") > 0) {
                //console.log(msg);
                // 1 == CatchSuccess
                if (msg.Status = 1) {
                    var pkm = {
                        id: msg.Id,
                        name: pokemon.getName(msg.Id),
                        lvl: msg.Level
                    };
                    if (!global.snipping) {
                        global.map.addCatch(pkm);
                    }
                    pokemonToast(pkm, { snipe: global.snipping });
                }
            } else if (msg.$type.indexOf("TransferPokemonEvent") > 0) {
                // nothing
            } else if (msg.$type.indexOf("FortTargetEvent") > 0) {
                // nothing
            } else if (msg.$type.indexOf("FortUsedEvent") > 0) {
                //console.log(msg);
                if (msg.Latitude && msg.Longitude) {
                    global.map.addVisitedPokestop({
                        id: msg.Id,
                        name: msg.Name,
                        lat: msg.Latitude,
                        lng: msg.Longitude
                    });
                }
            } else if (msg.$type.indexOf("PokeStopListEvent") > 0) {
                var forts = Array.from(msg.Forts.$values.filter(f => f.Type == 1), f => {
                    return {
                        id: f.Id,
                        lat: f.Latitude,
                        lng: f.Longitude
                    }
                });
                global.map.addPokestops(forts);
            } else if (msg.$type.indexOf("SnipeModeEvent") > 0) {
                if (msg.Active) console.log("Sniper Mode");
                global.snipping = msg.Active;
            } else if (msg.$type.indexOf("PokemonListEvent") > 0) {
                //console.log(msg);
                var pkm = Array.from(msg.PokemonList.$values, p => {
                    if (!p.Item1) {
                        // temp stuff when version mismatch
                        var tmp = p;
                        p = {
                            Item1: p,
                            Item2: 0
                        };
                    }
                    return {
                        id: p.Item1.PokemonId,
                        cp: p.Item1.Cp,
                        iv: p.Item2.toFixed(1),
                        name: p.Item1.Nickname || pokemon.getName(p.Item1.PokemonId),
                        realname: pokemon.getName(p.Item1.PokemonId, "en")
                    }
                });
                global.map.displayPokemonList(pkm);
            } else if (msg.$type.indexOf("EggsListEvent") > 0) {
                var incubators = Array.from(msg.Incubators.$values, i => {
                    return {
                        type: i.ItemId == 901 ? "incubator-unlimited" : "incubator",
                        doneDist: i.StartKmWalked,
                        totalDist: i.TargetKmWalked
                    }
                });
                var eggs = Array.from(msg.UnusedEggs.$values, i => {
                    return {
                        type: "egg",
                        doneDist: i.EggKmWalkedStart,
                        totalDist: i.EggKmWalkedTarget
                    }
                });
                global.map.displayEggsList(incubators.concat(eggs));
            } else {
                console.log(msg);
            }
        };
    }

    $(function() {
        $("#pokemonLink").click(() => {
            global.ws.send("PokemonList");
        });
        $("#sortByCp").click(() => global.map.displayPokemonList(null, "cp"));
        $("#sortByIv").click(() => global.map.displayPokemonList(null, "iv"));

        $("#eggsLink").click(() => {
            global.ws.send("EggsList");
        });

        $(".close").click(function() {
            $(this).parent().hide();
            $(".inventory .sort").hide();
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

    function pokemonToast(pkm, snipe) {
        var title = snipe ? "Snipe success" : "Catch success";
        var toast = snipe ? toastr.success : toastr.info;
        var content = `<div>${pkm.name} (lvl ${pkm.lvl})</div><div><img src='./assets/pokemon/${pkm.id}.png' height='50' /></div>`;
        toast(content, title, {
            "progressBar": true,
            "positionClass": "toast-bottom-left",
            "timeOut": "5000",
            closeButton: true
        })
    }
}());