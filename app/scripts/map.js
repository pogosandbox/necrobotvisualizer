
var Map = function(parentDiv) {
    var leafmap = L.map(parentDiv);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { }).addTo(leafmap);
    this.map = leafmap;
    this.steps = [];
    this.path = null;
};


Map.prototype.initPath = function() {
    if (this.path != null) return true;
    if (this.steps.length < 2) return false;

    console.log("Init path and markers.");

    this.map.setView([this.steps[0].lat, this.steps[0].lng], 16);

    var pts = Array.from(this.steps, pt => L.latLng(pt.lat, pt.lng));
    this.path = L.polyline(pts, { color: 'red' }).addTo(this.map);

    this.me = L.marker([this.steps[1].lat, this.steps[1].lng]).addTo(this.map);

    return true;
}

Map.prototype.addToPath = function(pt) {
    console.log(`Walk to (${pt.lat},${pt.lng})`);

    if (this.initPath()) {
        var latLng = L.latLng(pt.lat, pt.lng);
        this.path.addLatLng(latLng);
        this.me.setLatLng(L.latLng(pt.lat, pt.lng));
    }
    this.steps.push(pt);
}

Map.prototype.addCatch = function(pt) {
    if (this.steps.length > 0) {
        var pos = this.steps.pop();
        var pkm = `${pt.name} (lvl ${pt.lvl})`;
        console.log("Catch " + pkm);

        var icon = L.icon({ iconUrl: `./assets/icons/${pt.id}.png`, iconSize: [50, 50]});
        L.marker([pos.lat, pos.lng], {icon: icon}).addTo(this.map).bindPopup(`${pt.name} (lvl ${pt.lvl})`);
    } else {
        // ?
    }
}