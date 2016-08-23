var gulp     = require('gulp');
var del      = require('del');
var uglify   = require("gulp-uglify");
var rename   = require("gulp-rename");
var concat   = require("gulp-concat");
var cssnano  = require("gulp-cssnano");
var sass     = require('gulp-sass');

// Watch

gulp.task('dev-styles', function() {
    return gulp.src('src/assets/css/*.scss')
                .pipe(sass.sync().on('error', sass.logError))
                .pipe(gulp.dest(function(f) {
                    return f.base;
                }));
});

gulp.task('watch-styles', function() {
   return gulp.watch('src/assets/css/*.scss', ['dev-styles']);
});

gulp.task('watch', [ 'dev-styles', 'watch-styles' ]);

// Deploy

gulp.task('deploy', ['build'], function() {
  return gulp.src([
      './app/**/*',
      '!./app/node_modules'
    ])
    .pipe(file('CNAME', "necrovisualizer.nicontoso.eu"))
    .pipe(ghPages({remoteUrl: "https://github.com/nicoschmitt/necrovisualizer"}));
});

// Main tasks

gulp.task('default', [ 'dev-styles' ]);
