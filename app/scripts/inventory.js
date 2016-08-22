(function() {
    var allPokemon = null;
    var allItems = null;

    function load(locale) {
        locale = locale || "en";
        $.ajax({
            url: `assets/json/pokemon.${locale}.json`,
            async: false,
            success: (result) => { allPokemon = (typeof result == "string" ? JSON.parse(result) : result); }
        });
        $.ajax({
            url: `assets/json/inventory.${locale}.json`,
            async: false,
            success: (result) => { allItems = (typeof result == "string" ? JSON.parse(result) : result); }
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

    const lvlMap = {93:1, 94:1, 135:1.5, 166:2, 192:2.5, 215:3, 236: 3.5, 255: 4, 273: 4.5, 290:5,
                    306:5.5, 321:6, 335:6.5, 349:7, 362:7.5, 375:8, 387:8.5, 399:9, 411:9.5, 422:10,
                    432:10.5, 443:11, 453:11.5, 462:12, 472:12.5, 481:13, 490:13.5, 499:14, 508:14.5,
                    517:15, 525:15.5, 534:16, 542:16.5, 550:17, 558:17.5, 566:18, 574:18.5, 582: 19,
                    589:19.5, 597:20, 604:20.5, 612:21, 619:21.5, 626:22, 633: 22.5, 640:23, 647:23.5,
                    654:24, 661:24.5, 667:25, 674:25.5, 681:26, 687:26.5, 694:27, 700:27.5, 706:28,
                    713:28.5, 719:29, 725:29.5, 731:30, 734:30.5, 737:31, 740:31.5, 743:32, 746:32.5,
                    749:33, 752:33.5, 755:34, 758:34.5, 761:35, 764:35.5, 767:36, 770:36.5, 773:37,
                    776: 37.5, 778:38, 781:38.5, 784:39, 790:40};
    service.getPokemonLevel = function(pokemon) {
        var p = (pokemon.CpMultiplier + pokemon.AdditionalCpMultiplier)*1000;
        return lvlMap[p|0];
    }

    window.inventoryService = service;
}());