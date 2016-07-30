(function() {
    var fs = require("fs");

    var allPokemon = null;

    function load(locale) {
        locale = locale || "en";
        allPokemon = require(`../assets/json/pokemon.${locale}.js`);
    }

    module.exports.init = function(locale) {
        load(locale);
    }

    module.exports.getName = function(id) {
        return allPokemon[id];
    }
}());