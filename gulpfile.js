var gulp = require('gulp'),
    uglifycss = require('gulp-uglifycss'),
    minify = require('gulp-minify'),
    copy = require('gulp-copy'),
    concat = require('gulp-concat');

var dest = './dist/';

gulp.task('uglify:js', function() {
    gulp.src('./src/scripts/**/*.js')
        .pipe(concat('script.js'))
        .pipe(minify({
            compress: true,
        }))
        .pipe(gulp.dest(dest + 'js'));
});

gulp.task('uglify:css', function () {
    gulp.src('./src/styles/**/*.css')
        .pipe(concat('style.css'))
        .pipe(uglifycss({
            "maxLineLen": 80,
            "uglyComments": true
        }))
        .pipe(gulp.dest(dest + 'css'));
});

gulp.task('copy:html', function() {
    gulp.src(['./*.html'])
        .pipe(gulp.dest(dest));
});

gulp.task('copy:images', function() {
    gulp.src(['./src/images/*.gif'])
        .pipe(gulp.dest(dest));
});

gulp.task('default', ['uglify:css', 'uglify:js', 'copy:html', 'copy:images']);

gulp.task('watch', function() {
    gulp.watch(['./src/js/**/*.js'], ['uglify:js']).on('change', function(e) {
        console.log('JS file ' + e.path + ' has been changed, compiling ...');
    });
    gulp.watch(['./src/css/**/*.css'], ['uglify:css']).on('change', function(e) {
        console.log('CSS file ' + e.path + ' has been changed, compiling ...');
    });
    gulp.watch(['./src/*.html'], ['copy:html']).on('change', function(e) {
        console.log('HTML file ' + e.path + ' has been changed, compiling ...');
    });
});
    