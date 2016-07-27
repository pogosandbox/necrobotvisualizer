(function() {
    var fs = require("fs");

    var allPokemon = null;

    function load(local) {
        local = local || "en";
        var content = require(`../assets/json/pokemon.${local}.js`);
        allPokemon = {
            "en": content
        }
    }

    module.exports.init = function() {
        load("en");
    }

    module.exports.getIdFromName = function(name) {
        if (!allPokemon) load("en");

        return allPokemon['en'][name];
    }

}());