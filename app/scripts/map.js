
var Map = function(parentDiv) {
    var leafmap = L.map(parentDiv);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { }).addTo(leafmap);
    this.map = leafmap;
};

Map.prototype.setView = function(lat, lng) {
    this.map.setView([lat, lng], 16);
}

Map.prototype.parseEvents = function(evts) {
    var walk = evts.filter(ev => ev.evt == "walk");
    var pkm = evts.filter(ev => ev.evt == "catch");

    return {
        walk: walk,
        pkm: pkm
    }
}

Map.prototype.initPath = function(pts) {
    this.steps = pts;

    this.setView(pts[0].lat, pts[0].lng);

    var evts = this.parseEvents(pts);
    
    var latLngs = Array.from(evts.walk, p => L.latLng(p.lat, p.lng));
    this.path = L.polyline(latLngs, { color: 'red' }).addTo(this.map);
    
    var last = pts.pop();
    this.me = L.marker([last.lat, last.lng]).addTo(this.map);

    this.addCatch(evts.pkm);
}

Map.prototype.addToPath = function(pts) {
    var last = this.steps.pop();

    var evts = this.parseEvents(pts);

    for (var i = 0; i < evts.walk.length; i++) {
        var pt = evts.walk[i];
        if (pt.lat != last.lat || pt.lng != last.lng) {
            console.log(`Add (${pt.lat},${pt.lng})`);

            var latLng = L.latLng(pt.lat, pt.lng);
            this.path.addLatLng(latLng);

            this.steps.push(pt);
            last = pt;
        }
    }

    this.me.setLatLng(L.latLng(last.lat, last.lng));

    this.addCatch(evts.pkm);
}

Map.prototype.addCatch = function(evts) {
    for (var i = 0; i < evts.length; i++) {
        var pt = evts[i];
        console.log("Catch " + pt.name + ", id=" + pt.id);

        var icon = L.icon({ iconUrl: `./assets/icons/${pt.id}.png`, iconSize: [50, 50]});
        L.marker([pt.lat, pt.lng], {icon: icon}).addTo(this.map).bindPopup(`${pt.name} (lvl ${pt.lvl})`);

        this.steps.push(pt);
    }
}