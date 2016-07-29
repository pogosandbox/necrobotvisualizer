(function() {
    var fs = require("fs");

    var defaultLocale = "en;"
    var allPokemon = {};

    function load(locale) {
        locale = locale || "en";
        allPokemon[locale] = require(`../assets/json/pokemon.${locale}.js`);
    }

    module.exports.init = function(locale) {
        load(locale);
        defaultLocale = locale;
        if (locale != "en") load("en");
    }

    module.exports.getName = function(id, locale) {
        locale = locale || defaultLocale;
        return allPokemon[locale][id];
    }
}());