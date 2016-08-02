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
        console.log("Load config from storage + server");

        service.load = function() {
            var config = Object.assign({}, defaultConfig);
            var json = localStorage.getItem("config");
            if (json) Object.assign(config, JSON.parse(json));
            $.ajax({
                url: `/api/config`,
                async: false,
                success: (result) => { Object.assign(config, result); }
            });
            return config;
        }

        service.save = function(config) {
            console.log(config);
            localStorage.setItem("config", JSON.stringify(config));
        }

    }

    window.configService = service;

}());