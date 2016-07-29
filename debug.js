const fs = require("fs");
const path = require("path");

var folder = `app\\assets\\icons\\big`;
fs.readdir(folder, (err, files) => {
    if (err) {
        console.log(err);
        return;
    }

    files.forEach(file => {
        var newfile = file.replace(/0*(\d+) .*/g, "$1.png");
        console.log(file + " " + newfile);
        fs.rename(path.join(folder, file), path.join(folder, newfile), () => {});
    })
})