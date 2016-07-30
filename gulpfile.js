var gulp     = require('gulp');
var del      = require('del');
var uglify   = require("gulp-uglify");
var rename   = require("gulp-rename");
var concat   = require("gulp-concat");
var cssnano  = require("gulp-cssnano");

// Dev

gulp.task("clean", function() {
   del("app/app/lib/*"); 
});

gulp.task('lib-js', function() {
    return gulp.src([
                    
                ])
                .pipe(concat("lib.full.min.js"))
                .pipe(uglify())
                .pipe(gulp.dest("app/lib"));
});


gulp.task('lib-css', function() {
    return gulp.src([
                   
                ])
                .pipe(concat("lib.full.min.css"))
                .pipe(cssnano())
                .pipe(gulp.dest("app/lib"));
});


// Main tasks

gulp.task('default', [ "clean", "lib-js", "lib-css" ]);
