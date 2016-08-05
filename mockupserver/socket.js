(function() {
    var wss = null;
    var callbacks = {};
    var profile = null;

    send = function(ws, command, data) {
        var message = data || {};
        message.Command = command;
        ws.send(JSON.stringify(message));
    }
    module.exports.send = send;
    
    module.exports.start = function(cb) {
        var WebSocketServer = require('ws').Server
        wss = new WebSocketServer({ port: 14252 });

        wss.on('connection', function connection(ws) {

            ws.on('message', (message) => {
                try {
                    message = JSON.parse(message);
                } catch(err) {}
                var command = message.Command || message;
                if (callbacks[command]) callbacks[command](ws, message);
            });

            if (cb) cb(ws);

            if (profile) send(ws, "ProfileEvent", profile);
        });
    }

    module.exports.on = function(message, cb) {
        callbacks[message] = cb;
    }

    module.exports.setProfile = function(p) {
        profile = p;
        wss.clients.forEach(client => {
            send(client, "ProfileEvent", profile);
        });
    }

}());

