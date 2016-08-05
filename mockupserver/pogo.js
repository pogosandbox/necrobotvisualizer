(function() {
    const pogobuf = require('pogobuf');
    const moment = require("momentjs");

    class Pogo {
        constructor() {
            this.client = new pogobuf.Client();
            this.inventory = null;
            this.inventoryAge = null;
        }

        login(auth, pos) {
            var login = new pogobuf.PTCLogin();
            if (auth.type == "google") login = new pogobuf.GoogleLogin();

            console.log("Login with " + auth.user + "...");
            return login.login(auth.user, auth.pass).then(token => {
                console.log("login ok, init...");
                this.client.setAuthInfo(auth.type, token);
                this.client.setPosition(pos.lat, pos.lng);
                return this.client.init();
            });
        }
        
        getInventory() {
            var tooOld = moment().seconds(-30); 
            if (this.inventoryAge != null && tooOld.isBefore(this.inventoryAge)) {
                console.log("inventory from cache");
                //return new Promise((resolve, reject) => { resolve(this.inventory) });
                return new Promise((resolve, reject) => {
                    return resolve(this.inventory);
                })
            } else {
                // get data from server
                console.log("inventory from server");
                return this.client.getInventory(0).then(inv => {
                    this.inventory = pogobuf.Utils.splitInventory(inv);
                    this.inventoryAge = moment();
                    return this.inventory;
                });
                
            }
        }
    }

    module.exports = new Pogo();

}());