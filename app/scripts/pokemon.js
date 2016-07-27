(function() {
    var fs = require("fs");

    var allPokemon = null;

    function load(locale) {
        locale = locale || "en";
        var content = require(`../assets/json/pokemon.${locale}.js`);
        allPokemon = content;
    }

    module.exports.init = function(locale) {
        load(locale);
    }

    module.exports.getName = function(id) {
        if (!allPokemon) load("en");
        return allPokemon[id];
    }

}());