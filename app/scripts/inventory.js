(function() {
    var allPokemon = null;
    var allItems = null;

    function load(locale) {
        locale = locale || "en";
        $.ajax({
            url: `assets/json/pokemon.${locale}.json`,
            async: false,
            success: (result) => { allPokemon = JSON.parse(result); }
        });
        $.ajax({
            url: `assets/json/inventory.${locale}.json`,
            async: false,
            success: (result) => { allItems = JSON.parse(result); }
        });
    }

    var service = {};

    service.init = function(locale) {
        if (allItems == null) load(locale);
    }

    service.getPokemonName = function(id) {
        return allPokemon[id];
    }

    service.getItemName = function(id) {
        return allItems[id];
    }

    window.inventoryService = service;
}());