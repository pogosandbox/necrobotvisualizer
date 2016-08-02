(function() {

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

        service.load = function() {
            var config = {};
            var json = localStorage.getItem("config");
            if (json) {
                config = JSON.parse(json);
                config = Object.assign({}, defaultConfig, config);$
                config.version = "v0.0.0";
                console.log("load ok using storage");
                console.log(config);
            }
            return config;
        }

        service.save = function(config) {
            localStorage.setItem("config", JSON.stringify(config));
        }

    }

    window.configService = service;

}());