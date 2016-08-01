(function() {
    var global = { snipping: false };
    window.global = global;

    const { version } = require("./package.json");
    document.title += " - " + version;
    global.version = version;

    var config = require("./scripts/config");
    global.config = config.load();

    var wssend = function(obj) { 
        var data = typeof(obj) != "object" ? obj : JSON.stringify(obj);
        global.ws.send(data); 
    };

    $(function() {
        $("#pokemonLink").click( function() {
            if ($(".inventory").css("opacity") == "1" && $(".inventory .data .pokemon").length) {
                $(".inventory").removeClass("active");
            } else {
                wssend("PokemonList");
            }
        });
        $("#eggsLink").click( function() {
            if ($(".inventory").css("opacity") == "1" && $(".inventory .data .eggs").length) {
                $(".inventory").removeClass("active");
            } else { 
                wssend("EggsList"); 
            }
        });
        $("#inventoryLink").click( function() {
            if ($(".inventory").css("opacity") == "1" && $(".inventory .data .items").length) {
                $(".inventory").removeClass("active");
            } else {
                wssend("InventoryList"); 
            }
        });

        $("#sortById").click(() => global.map.displayPokemonList(null, "pokemonId"));
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

        $(".inventory .data").on("click", "a.transferAction", function() {
            var transfer = $(this).parent();
            wssend({
                Command: "TransferPokemon",
                PokemonId: transfer.attr("id"),
                Data: transfer.attr("id")
            });
            transfer.parent().fadeOut();
        });

        $(".inventory .data").on("click", "a.evolveAction", function() {
            var evolve = $(this).parent();
            wssend({
                Command: "EvolvePokemon",
                PokemonId: evolve.attr("id"),
                Data: evolve.attr("id")
            });
            $(".inventory").removeClass("active");
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