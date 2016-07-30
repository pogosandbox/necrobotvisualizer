(function() {
    var global = { snipping: false };
    window.global = global;

    const { version } = require("./package.json");
    document.title += " - " + version;
    global.version = version;

    var config = require("./scripts/config");
    global.config = config.load();

    $(function() {
        $("#pokemonLink").click(() => { global.ws.send("PokemonList"); });
        $("#eggsLink").click(() => { global.ws.send("EggsList"); });
        $("#inventoryLink").click(() => { global.ws.send("InventoryList"); });

        $("#sortByCp").click(() => global.map.displayPokemonList(null, "cp"));
        $("#sortByIv").click(() => global.map.displayPokemonList(null, "iv"));

        $(".close").click(function() {
            $(this).parent().hide();
            $(".inventory .sort").hide();
        });

        $("#recycleLink").click(() => {
            sessionStorage.setItem("available", false);
            window.location.reload();
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