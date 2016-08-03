(function() {

    function getURLParameter(sParam) {
        var sPageURL = window.location.search.substring(1);
        var sURLVariables = sPageURL.split('&');
        for (var i = 0; i < sURLVariables.length; i++)
        {
            var sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] == sParam)
            {
                return sParameterName[1];
            }
        }
    }

    var defaultConfig = {
        locale: "en",
        websocket: "wss://localhost:14251",
        followPlayer: false,
        noPopup: false
    };

    var service = {};

    if (typeof require === 'function') {
        console.log("Load config from disk");

        var path = require("path");
        var fs = require("fs"); 
        var { remote } = require("electron");

        var configfile = path.join(remote.app.getPath("userData"), "settings.json");

        const { version } = require("./package.json");

        service.save = function(config) {
            fs.writeFileSync(configfile, JSON.stringify(config));
        }

        service.load = function() {
            var config = defaultConfig;
            try {
                config = JSON.parse(fs.readFileSync(configfile, 'utf-8')); 
                config = Object.assign({}, defaultConfig, config);
                config.version = version;
            } catch(err) {
                configService.save(defaultConfig);
            }
            return config;
        }

    } else {
        console.log("Load config from storage");
        defaultConfig.websocket = "ws://localhost:14252";

        service.load = function() {
            var config = Object.assign({}, defaultConfig);
            var json = localStorage.getItem("config");
            if (json) Object.assign(config, JSON.parse(json));

            var host = getURLParameter("websocket");
            if (host) {
                console.log(host);
                config.websocket = host;
            }

            config.version = "online";

            return config;
        }

        service.save = function(config) {
            console.log(config);
            localStorage.setItem("config", JSON.stringify(config));
        }

    }

    window.configService = service;

}());