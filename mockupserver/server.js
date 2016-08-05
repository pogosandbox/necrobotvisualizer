require('dotenv').config({silent: true});

if (!process.env.PROVIDER) {
    console.log("Configure login in .env before starting.");
    process.exit();
}

var server = require("./socket");
var pogo = require("./pogo");

// Connect to PoGo

var auth = {
    type: process.env.PROVIDER, 
    user: process.env.USER, 
    pass: process.env.PASSWORD
};

var position = {
    lat: process.env.LATITUDE,
    lng: process.env.LONGITUDE
}

pogo.login(auth, position).then(startSocketServer);

// Start WebSocket Server

function startSocketServer() {
    console.log("start socket server...");

    server.on("GetPokemonSettings", (client, msg) => {
        console.log("GetPokemonSettings");
        pogo.client.downloadItemTemplates().then(settings => {
            // Pokemon Settings
            settings = Array.from(settings.item_templates, s => s.pokemon_settings).filter(s => s != null && s.family_id != 0);
            // Format compatible with UI
            settings = Array.from(settings, s => {
                return {
                    PokemonId: s.pokemon_id,
                    EvolutionIds: { $values: s.evolution_ids },
                    CandyToEvolve: s.candy_to_evolve
                };
            });
            // Send it to client
            server.send(client, "PokemonSettings", { Data: { $values: settings } });
        })
    });

    server.on("PokemonList", (client, msg) => {

    });

    server.on("EggsList", (client, msg) => {
        pogo.getInventory().then(inventory => {
            console.log(inventory);

            var incubators = Array.from(inventory.egg_incubators, i => i.egg_incubator).filter(i => i != null);
            incubators = [].concat.apply([], incubators);
            console.log(incubators);
            incubators = Array.from(incubators, i => {
                return {
                    ItemId: i.item_id,
                    StartKmWalked: i.start_km_walked,
                    TargetKmWalked: i.target_km_walked
                }
            });

            var eggs = Array.from(inventory.pokemon).filter(p => p.is_egg);
            console.log(eggs);
            eggs = Array.from(eggs, i => {
                return {
                    EggKmWalkedTarget: i.egg_km_walked_target,
                    EggKmWalkedStart: i.egg_km_walked_start
                }
            });

            server.send(client, "EggsListEvent", { 
                PlayerKmWalked: inventory.player.km_walked,
                Incubators: { $values: incubators },
                UnusedEggs: { $values: eggs }
            });
        });
    });

    server.on("InventoryList", (client, msg) => {
        pogo.getInventory().then(inventory => {
            var items = Array.from(inventory.items, item => {
                return {
                    ItemId: item.item_id,
                    Count: item.count,
                    Unseen: item.unseen
                };
            });

            server.send(client, "InventoryListEvent", { Items: { $values: items } });
        });
    });

    server.start(client => {
        console.log("New client connected.");

        server.send(client, "UpdatePositionEvent", { Latitude: position.lat, Longitude: position.lng });
        
        pogo.client.getPlayer().then(player => {
            server.setProfile({
                Profile: {
                    PlayerData: {
                        Username: player.player_data.username,
                        MaxPokemonStorage: player.player_data.max_pokemon_storage,
                        MaxItemStorage: player.player_data.max_item_storage
                    }
                }
            });
        });
    });

}