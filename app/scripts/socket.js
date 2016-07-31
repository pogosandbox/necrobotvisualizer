var inventory = require("./scripts/inventory");

function listenToWebSocket() {
    inventory.init(global.config.locale);

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
            if (msg.Status = 1 && msg.Exp > 0) {
                var pkm = {
                    id: msg.Id,
                    name: inventory.getPokemonName(msg.Id),
                    lvl: msg.Level,
                    lat: msg.Latitude,
                    lng: msg.Longitude
                };
                if (!global.snipping) {
                    global.map.addCatch(pkm);
                }
                pokemonToast(pkm);
            }
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
            var pkm = Array.from(msg.PokemonList.$values, p => {
                return {
                    id: p.Item1.PokemonId,
                    cp: p.Item1.Cp,
                    iv: p.Item2.toFixed(1),
                    name: p.Item1.Nickname || inventory.getPokemonName(p.Item1.PokemonId),
                    realname: inventory.getPokemonName(p.Item1.PokemonId, "en")
                }
            });
            global.map.displayPokemonList(pkm);
        } else if (msg.$type.indexOf("EggsListEvent") > 0) {
            console.log(msg);
            var incubators = Array.from(msg.Incubators.$values, i => {
                if (i.TargetKmWalked != 0 || i.StartKmWalked != 0) {
                    msg.PlayerKmWalked = msg.PlayerKmWalked || 0;
                    return {
                        type: i.ItemId == 901 ? "incubator-unlimited" : "incubator",
                        totalDist: i.TargetKmWalked - i.StartKmWalked,
                        doneDist: msg.PlayerKmWalked - i.StartKmWalked
                    }
                }
            });
            var eggs = Array.from(msg.UnusedEggs.$values, i => {
                return {
                    type: "egg",
                    totalDist: i.EggKmWalkedTarget,
                    doneDist: i.EggKmWalkedStart
                }
            });
            global.map.displayEggsList(incubators.concat(eggs));
        } else if (msg.$type.indexOf("InventoryListEvent") > 0) {
            console.log(msg);
            var items = Array.from(msg.Items.$values, item => {
                return {
                    name: inventory.getItemName(item.ItemId),
                    itemId: item.ItemId,
                    count: item.Count,
                    unseen: item.Unseen
                }
            });
            global.map.displayInventory(items);
        } else if (msg.$type.indexOf("PokemonEvolveEvent") > 0) {
            // toast ?
            console.log(msg);
            var pkm = {
                id: msg.Id,
                name: inventory.getPokemonName(msg.id)
            };
            pokemonToast(pkm, { title: "A Pokemon Evolved" });
        } else if (msg.$type.indexOf("TransferPokemonEvent") > 0) {
            // nothing
        } else if (msg.$type.indexOf("FortTargetEvent") > 0) {
            // nothing
        } else if (msg.$type.indexOf("NoticeEvent") > 0) {
            // nothing
        } else if (msg.$type.indexOf("WarnEvent") > 0) {
            // nothing
        } else if (msg.$type.indexOf("SnipeScanEvent") > 0) {
            // nothing
        } else if (msg.$type.indexOf("ItemRecycledEvent") > 0) {
            // nothing
        } else {
            console.log(msg);
        }
    };
}

function pokemonToast(pkm, options) {
    if (global.config.noPopup) return;

    options = options || {};
    var title = options.title || ( global.snipping ? "Snipe success" : "Catch success" );
    var toast = global.snipping ? toastr.success : toastr.info;
    var info = pkm.name;
    if (pkm.lvl) info += ` (lvl ${pkm.lvl})`;

    var content = `<div>${info}</div><div><img src='./assets/pokemon/${pkm.id}.png' height='50' /></div>`;
    toast(content, title, {
        "progressBar": true,
        "positionClass": "toast-bottom-left",
        "timeOut": "5000",
        "closeButton": true
    })
}