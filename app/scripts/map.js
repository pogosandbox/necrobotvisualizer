
var Map = function(parentDiv) {
    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    var osmCycle = L.tileLayer('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png');
    var osmCycleTransport = L.tileLayer('http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png');
    var toner = L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png');
    var watercolor = L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg');

    this.layerPokestops = new L.LayerGroup();
    this.layerCatches = L.markerClusterGroup({ maxClusterRadius: 30 });
    this.layerPath = new L.LayerGroup();

    this.map = L.map(parentDiv, {
        layers: [osm, this.layerPokestops, this.layerCatches, this.layerPath]
    });

   var baseLayers = {
        "OpenStreetMap": osm,
        "OpenCycleMap": osmCycle,
        "OpenCycleMap Transport": osmCycleTransport,
        "Toner": toner,
        "Watercolor": watercolor,
    };
    var overlays = {
        "Path": this.layerPath,
        "Pokestops": this.layerPokestops,
        "Catches": this.layerCatches
    };

    // save selected base map on click
    L.control.layers(baseLayers, overlays).addTo(this.map);
    this.map.on('baselayerchange', (function(ev) { 
        let name = ev.name;
        localStorage.setItem("layer", name);
    }).bind(this));

    // restore saved base map
    var base = localStorage.getItem("layer");
    if (base) {
        $(`.leaflet-control-layers-base span:contains('${base}')`).first().prev().click();
    }

    this.map.on('singleclick', (function(ev) { this.setDestination(ev.latlng) }).bind(this));

    this.path = null;
    this.route = null;
    this.destination = null;

    this.steps = [];
    this.catches = [];
    this.pokestops = [];
    this.pokemonList = [];
};

Map.prototype.saveContext = function() {
    var stops = Array.from(this.pokestops, p => {
        return {
            id: p.id,
            lat: p.lat,
            lng: p.lng,
            visited: p.visited
        }
    });

    sessionStorage.setItem("available", true);
    sessionStorage.setItem("steps", JSON.stringify(this.steps));
    sessionStorage.setItem("catches", JSON.stringify(this.catches));
    sessionStorage.setItem("pokestops", JSON.stringify(stops));
}

Map.prototype.loadContext = function() {
    try {
        if (sessionStorage.getItem("available") == "true") {
            console.log("Load data from storage to restore session");

            this.steps = JSON.parse(sessionStorage.getItem("steps")) || [];
            this.catches = JSON.parse(sessionStorage.getItem("catches")) || [];
            this.pokestops = JSON.parse(sessionStorage.getItem("pokestops")) || [];

            if (this.steps.length > 0) this.initPath();

            this.initPokestops();
            this.initCatches();

            sessionStorage.setItem("available", false);
        }
    } catch(err) { console.log(err); }
}

Map.prototype.initPath = function() {
    if (this.path != null) return true;

    if (!this.me) {
        var last = this.steps[this.steps.length - 1];
        this.map.setView([last.lat, last.lng], 16);
        this.me = L.marker([last.lat, last.lng], { zIndexOffset: 200 }).addTo(this.map).bindPopup(`${last.lat.toFixed(4)},${last.lng.toFixed(4)}`);
        $(".loading").hide();
    }

    if (this.steps.length >= 2) {
        var pts = Array.from(this.steps, pt => L.latLng(pt.lat, pt.lng));
        this.path = L.polyline(pts, { color: 'red' }).addTo(this.layerPath);
        return true;
    }

    return false;
}

Map.prototype.initCatches = function() {
    for (var i = 0; i < this.catches.length; i++) {
        var pt = this.catches[i];
        var icon = L.icon({ iconUrl: `./assets/pokemon/${pt.id}.png`, iconSize: [60, 60], iconAnchor: [30, 30]});
        var pkm = `${pt.name} <br /> Cp:${pt.cp} Iv:${pt.iv}%`;
        if (pt.lvl) {
            pkm = `${pt.name} (lvl ${pt.lvl}) <br /> Cp:${pt.cp} Iv:${pt.iv}%`;
        }
        L.marker([pt.lat, pt.lng], {icon: icon, zIndexOffset: 100}).bindPopup(pkm).addTo(this.layerCatches);
    }
}

Map.prototype.initPokestops = function() {
    for (var i = 0; i < this.pokestops.length; i++) {
        var pt = this.pokestops[i];
        var iconurl = pt.visited  ? `./assets/img/pokestop_visited.png` : `./assets/img/pokestop_available.png`;
        var icon = L.icon({ iconUrl: iconurl, iconSize: [40, 40], iconAnchor: [20, 20]});
        pt.marker = L.marker([pt.lat, pt.lng], {icon: icon, zIndexOffset: 50}).bindPopup(pt.name).addTo(this.layerPokestops);
    }
}

Map.prototype.addToPath = function(pt) {
    this.steps.push(pt);
    if (global.config.memory.limit && this.steps.length > global.config.memory.mathPath) {
        this.layerPath.clearLayers();
        this.path = null;
        var max = Math.floor(global.config.memory.mathPath * 0.7);
        this.steps = this.steps.slice(-max);
    }
    if (this.initPath()) {
        var latLng = L.latLng(pt.lat, pt.lng);
        this.path.addLatLng(latLng);
        this.me.setLatLng(latLng).getPopup().setContent(`${pt.lat.toFixed(4)},${pt.lng.toFixed(4)}`);
        if (global.config.followPlayer) {
            this.map.panTo(latLng, { animate: true });
        }
    }
}

Map.prototype.addCatch = function(pt) {
    if (!pt.lat) {
        if (this.steps.length <= 0) return;
        var last = this.steps[this.steps.length - 1];
        pt.lat = last.lat;
        pt.lng = last.lng;
    }

    var pkm = `${pt.name}<br /> CP:${pt.cp} IV:${pt.iv}%`;
    if (pt.lvl) {
        pkm = `${pt.name} (lvl ${pt.lvl}) <br /> Cp:${pt.cp} Iv:${pt.iv}%`;
    }

    this.catches.push(pt);

    if (global.config.memory.limit && this.catches.length > global.config.memory.maxCaught) {
        console.log("Clean catches");
        var max = Math.floor(global.config.memory.maxCaught * 0.7);
        this.catches = this.catches.slice(-max);
        this.layerCatches.clearLayers();
        this.initCatches();
    } else {
        var icon = L.icon({ iconUrl: `./assets/pokemon/${pt.id}.png`, iconSize: [60, 60], iconAnchor: [30, 30] });
        L.marker([pt.lat, pt.lng], {icon: icon, zIndexOffset: 100 }).bindPopup(pkm).addTo(this.layerCatches);
    }
}

Map.prototype.addVisitedPokestop = function(pt) {
    if (!pt.lat) return;

    var ps = this.pokestops.find(ps => ps.id == pt.id);
    if (!ps) {
        this.pokestops.push(pt);
        ps = pt;
        var icon = L.icon({ iconUrl: `./assets/img/pokestop_cooldown.png`, iconSize: [40, 40], iconAnchor: [20, 20] });
        pt.marker = L.marker([pt.lat, pt.lng], {icon: icon, zIndexOffset: 50}).addTo(this.layerPokestops);
    } else {
        Object.assign(ps, pt);
    }

    ps.visited = true;
    if (ps && ps.marker) {
        ps.marker.setIcon(L.icon({ iconUrl: `./assets/img/pokestop_cooldown.png`, iconSize: [40, 40], iconAnchor: [20, 20] }));
        if (ps.name) ps.marker.bindPopup(ps.name);
    }
}

Map.prototype.addPokestops = function(forts) {
    for(var i = 0; i < forts.length; i++) {
        var pt = forts[i];
        var ps = this.pokestops.find(ps => ps.id == pt.id);
        if (ps) pt = Object.assign(ps, pt);
        else this.pokestops.push(pt);

        var icon = "pokestop_available";
        if (pt.cooldown && moment(pt.cooldown).isAfter()) {
            icon = "pokestop_cooldown";
        } else if (pt.lureExpire && moment(pt.lureExpire).isAfter()) {
            icon = "pokestop_lure";
        } else if (pt.visited) {
            icon = "pokestop_visited";
        }

        if (!pt.marker) {
            var icon = L.icon({ iconUrl: `./assets/img/${icon}.png`, iconSize: [40, 40], iconAnchor: [20, 20] });
            pt.marker = L.marker([pt.lat, pt.lng], {icon: icon, zIndexOffset: 50}).addTo(this.layerPokestops);
        } else {
            pt.marker.setIcon(L.icon({ iconUrl: `./assets/img/${icon}.png`, iconSize: [40, 40], iconAnchor: [20, 20] }));
        }
    }

    if (global.config.memory.limit && this.pokestops.length > global.config.memory.maxPokestops) {
        // to much pokestops, remove some starting with unvisited ones
    }
}

Map.prototype.updatePokestopsStatus = function() {
    this.pokestops.forEach(pt => {
        var needUpdate = false;
        if (pt.cooldown && moment(pt.cooldown).isBefore()) {
            pt.cooldown = null;
            needUpdate = true;
        } else if (pt.lureExpire && moment(pt.lureExpire).isBefore()) {
            pt.lureExpire = null;
            needUpdate = true;
        }

        if (needUpdate) {
            var icon = "pokestop_available";
            if (pt.cooldown && moment(pt.cooldown).isAfter()) {
                icon = "pokestop_cooldown";
            } else if (pt.lureExpire && moment(pt.lureExpire).isAfter()) {
                icon = "pokestop_lure";
            } else if (pt.visited) {
                icon = "pokestop_visited";
            }
            pt.marker.setIcon(L.icon({ iconUrl: `./assets/img/${icon}.png`, iconSize: [40, 40], iconAnchor: [20, 20] }));
        }
    });
}

Map.prototype.setRoute = function(route) {
    var points = Array.from(route, pt => L.latLng(pt.lat, pt.lng));
    if (this.route != null) {
        this.route.setLatLngs(points);
    } else {
        this.route = L.polyline(points, { dashArray: "5, 5", color: 'red', opacity: 0.4 }).addTo(this.layerPath);
    }

}

Map.prototype.displayPokemonList = function(all, sortBy, eggs) {
    console.log("Pokemon list");
    global.active = "pokemon";
    this.pokemonList = all || this.pokemonList;
    this.eggsCount = (eggs || this.eggsCount) || 0;
    if (!sortBy) {
        sortBy = localStorage.getItem("sortPokemonBy") || "cp";
    } else {
        localStorage.setItem("sortPokemonBy", sortBy);
    }

    if (sortBy == "pokemonId") {
        this.pokemonList = this.pokemonList.sort((p1, p2) => {
            if (p1[sortBy] != p2[sortBy]) {
                return p1[sortBy] - p2[sortBy];
            }
            var sort2 = p2["cp"] != p1["cp"] ? "cp" : "iv";
            return p2[sort2] - p1[sort2];
        });
    } else {
        this.pokemonList = this.pokemonList.sort((p1, p2) => {
            if (p1[sortBy] != p2[sortBy]) {
                return p2[sortBy] - p1[sortBy];
            } else if (p1["pokemonId"] != p2["pokemonId"]) {
                return p1["pokemonId"] - p2["pokemonId"];
            } else {
                var sort2 = (sortBy == "cp") ? "iv" : "cp";
                return p2[sort2] - p1[sort2];
            }
        });
    }

    var total = this.eggsCount + this.pokemonList.length;
    $(".inventory .numberinfo").text(`${total}/${global.storage.pokemon}`);
    var div = $(".inventory .data");
    div.html(``);
    this.pokemonList.forEach(function(elt) {
        var canEvolve = elt.canEvolve && !elt.inGym && elt.candy >= elt.candyToEvolve;
        var evolveStyle = canEvolve ? "" : "hide";
        var evolveClass = canEvolve ? "canEvolve" : "";
        var transferClass = elt.favorite ? "hide" : "";
        var candyStyle = elt.canEvolve ? "" : "style='display:none'";
        var fav = elt.favorite ? "set" : "unset";
        div.append(`
            <div class="pokemon">
                <div class="transfer" data-id='${elt.id}'>
                    <a title='(Un)Favorite' href="#" class="favoriteAction"><img src="./assets/img/favorite_${fav}.png" /></a>
                    <a title='Transfer' href="#" class="transferAction ${transferClass}"><img src="./assets/img/recyclebin.png" /></a>
                    <a title='Evolve' href="#" class="evolveAction ${evolveStyle}"><img src="./assets/img/evolve.png" /></a>
                </div>
                <span class="imgspan ${evolveClass}"><img src="./assets/pokemon/${elt.pokemonId}.png" /></span>
                <span class="name">${elt.name} lvl ${elt.lvl}</span>
                <span class="info">CP: <strong>${elt.cp}</strong> IV: <strong>${elt.iv}%</strong></span>
                <span class="info hide-on-small-only">ATK: <strong>${elt.stats.atk}</strong> DEF: <strong>${elt.stats.def}</strong> STA: <strong>${elt.stats.sta}</strong></span>
                <span class="info">Candy: ${elt.candy}<span ${candyStyle}>/${elt.candyToEvolve}</span></span>
            </div>
        `);
    });
    $(".pokemonsort").show();
    $(".inventory").show().addClass("active");
}

Map.prototype.displayEggsList = function(eggs) {
    console.log("Eggs list");
    global.active = "eggs";
    $(".inventory .sort").hide();
    $(".inventory .numberinfo").text(eggs.length + "/9");
    var div = $(".inventory .data");
    div.html("");
    eggs.forEach(function(elt) {
        if (elt) {
            div.append(`
                <div class="egg">
                    <span class="imgspan"><img src="./assets/inventory/${elt.type}.png" /></span>
                    <span>${elt.doneDist.toFixed(1)} / ${elt.totalDist.toFixed(1)} km</span>
                </div>
            `);
        }
    });
    $(".inventory").show().addClass("active");
};

Map.prototype.displayInventory = function(items) {
    console.log("Inventory list");
    global.active = "inventory";
    $(".inventory .sort").hide();
    var count = items.filter(i => i.itemId != 901).reduce((prev, cur) => prev + cur.count, 0);
    $(".inventory .numberinfo").text(`${count}/${global.storage.items}`);
    var div = $(".inventory .data");
    div.html(``);
    items.forEach(function(elt) {
        var dropStyle = elt.itemId == 901 ? "hide" : "";
        div.append(`
            <div class="item">
                <div class="transfer" data-id='${elt.itemId}' data-count='${elt.count}'>
                    <a title='Drop' href="#" class="dropItemAction ${dropStyle}"><img src="./assets/img/recyclebin.png" /></a>
                </div>

                <span class="count">x${elt.count}</span>
                <span class="imgspan"><img src="./assets/inventory/${elt.itemId}.png" /></span>
                <span class="info">${elt.name}</span>
            </div>
        `);
    });
    $(".inventory").show().addClass("active");
};

Map.prototype.setDestination = function(latlng) {
    var popup = L.popup().setLatLng(latlng)
                 .setContent(`<div class='dest'>${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}</div><div class="center-align"><a class="destBtn waves-effect waves-light btn">Go?</a></div>`)
                 .openOn(this.map);

    $(".destBtn").click((function() {
        this.map.closePopup(popup);
        console.log(`Set destination: ${latlng.lat}, ${latlng.lng}`);
        if (this.destination) {
            this.layerPath.removeLayer(this.destination);
        }

        this.destination = L.marker(latlng, { zIndexOffset: 199, icon: new RedIcon() }).bindPopup(`${latlng.lat}, ${latlng.lng}`).addTo(this.layerPath);
        global.ws.emit("set_destination", latlng);
    }).bind(this));
}

Map.prototype.manualDestinationReached = function() {
    this.layerPath.removeLayer(this.destination);
    this.destination = null;
}

// Red icon

var RedIcon = L.Icon.Default.extend({
    options: {
        iconUrl: 'assets/img/marker-icon-red.png' 
    }
});

// Fix zindex for groups

L.MarkerCluster.prototype.true_initialize = L.MarkerCluster.prototype.initialize;
L.MarkerCluster.prototype.initialize = function (group, zoom, a, b) {
    this.true_initialize(group, zoom, a, b);
    this.setZIndexOffset(200);
}

// Add event for single click

L.Evented.addInitHook( function () {
    this._singleClickTimeout = null;
    this.on('click', this._scheduleSingleClick, this);
    this.on('dblclick dragstart zoomstart', this._clearSingleClickTimeout.bind(this), this);
});

L.Evented.include({
    _scheduleSingleClick: function(e) {
        this._clearSingleClickTimeout();
        this._singleClickTimeout = setTimeout(this._fireSingleClick.bind(this, e), 500)
    },

    _fireSingleClick: function(e){
        if (!e.originalEvent._stopped) {
            this.fire('singleclick', L.Util.extend(e, { type : 'singleclick' }));
        }
    },

    _clearSingleClickTimeout: function(){
        if (this._singleClickTimeout != null) {
            clearTimeout(this._singleClickTimeout);
            this._singleClickTimeout = null;
        }
    }
});
