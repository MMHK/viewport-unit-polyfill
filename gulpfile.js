var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var replace = require('gulp-replace');
var browserify = require('browserify');

gulp.task("docs", function () {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: './index.js',
        debug: false,
        standalone: "ViewPortUnitPolyfill"
    });

    return b.bundle()
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(replace(".import", '["import"]'))
        .pipe(gulp.dest("docs"));
});

gulp.task("dist", function () {
    // set up the browserify instance on a task basis
    var b = browserify({
        entries: './index.js',
        debug: false,
        standalone: "ViewPortUnitPolyfill"
    });

    return b.bundle()
        .pipe(source('viewport-unit-polyfill.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(replace(".import", '["import"]'))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("dist"));
});


gulp.task("default", ["dist"]);