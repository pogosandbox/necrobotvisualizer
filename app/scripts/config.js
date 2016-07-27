(function() {
    var path = require("path");
    var fs = require("fs");
    var { remote } = require("electron");

    var configfile = path.join(remote.app.getPath("userData"), "settings.json");

    var defaultConfig = {
        locale: "en"
    };

    var load = function() {
        var config = defaultConfig;
        try {
            config = JSON.parse(fs.readFileSync(configfile, 'utf-8')); 
        } catch(err) {
            save(defaultConfig);
        }
        return config;
    }
    module.exports.load = load;

    var save = function(config) {
        fs.writeFileSync(configfile, JSON.stringify(config));
    }
    module.exports.save = save;

}());