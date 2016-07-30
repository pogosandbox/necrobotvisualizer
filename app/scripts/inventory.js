(function() {
    var allPokemon = null;
    var allItems = null;

    function load(locale) {
        locale = locale || "en";
        allPokemon = require(`../assets/json/pokemon.${locale}.js`);
        allItems = require(`../assets/json/inventory.${locale}.js`);
    }

    module.exports.init = function(locale) {
        if (allItems == null) load(locale);
    }

    module.exports.getPokemonName = function(id) {
        return allPokemon[id];
    }

    module.exports.getItemName = function(id) {
        return allItems[id];
    }
}());