$(function() {
    
    function cmpVersions (a, b) {
        var i, diff;
        var regExStrip0 = /(\.0+)+$/;
        var segmentsA = a.replace(regExStrip0, '').split('.');
        var segmentsB = b.replace(regExStrip0, '').split('.');
        var l = Math.min(segmentsA.length, segmentsB.length);

        for (i = 0; i < l; i++) {
            diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
            if (diff) {
                return diff;
            }
        }
        return segmentsA.length - segmentsB.length;
    }

    function check() {
        var api = "https://api.github.com/repos/nicoschmitt/necrobotvisualizer/releases";
        $.getJSON(api, (data) => {
            var ver = data[0].name;
            var url = data[0].url;
            if (cmpVersions(ver, global.version) > 0) {
                console.log("New version available: " + ver);
                $(".message .data").html(`New version available. Check on GitHub</a> to download it. <a href='${url}'>Here</a>`);
                $(".message").show();
            }
        });
    }

    check();

});