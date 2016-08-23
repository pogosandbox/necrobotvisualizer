var gulp     = require('gulp');
var del      = require('del');
var uglify   = require("gulp-uglify");
var rename   = require("gulp-rename");
var concat   = require("gulp-concat");
var cssnano  = require("gulp-cssnano");
var sass     = require('gulp-sass');
var file     = require('gulp-file');
var ghPages  = require('gulp-gh-pages');

// Watch

gulp.task('dev-styles', function() {
    return gulp.src('app/assets/css/*.scss')
                .pipe(sass.sync().on('error', sass.logError))
                .pipe(gulp.dest(function(f) {
                    return f.base;
                }));
});

gulp.task('watch-styles', function() {
   return gulp.watch('app/assets/css/*.scss', ['dev-styles']);
});

gulp.task('watch', [ 'dev-styles', 'watch-styles' ]);

// Deploy

gulp.task('deploy', ['dev-styles'], function() {
  return gulp.src([
      './app/**/*',
      '!./app/node_modules/**/*'
    ])
    .pipe(file('CNAME', "necrovisualizer.nicontoso.eu"))
    .pipe(ghPages({remoteUrl: "https://github.com/nicoschmitt/necrobotvisualizer"}));
});

// Main tasks

gulp.task('default', [ 'dev-styles' ]);
