var gulp        = require('gulp');
var compass     = require('gulp-compass');
var gulpif      = require('gulp-if');
var sprite      = require('css-sprite').stream;
var minifyCss   = require('gulp-minify-css');
var concat      = require('gulp-concat');
var freeze      = require("gulp-freeze");
var uglify      = require('gulp-uglify');
var connect     = require('gulp-connect-php');
var clean       = require('gulp-clean');
var browserSync = require('browser-sync');

var src = {
  scss: 'assets/scss/',
  css: 'assets/css/',
  js: 'assets/js/*.js',
  img: 'assets/img/',
  sprites: 'assets/sprites/',
  fonts: 'assets/fonts/'
};

var dest = {
  css: 'public_html/css',
  js: 'public_html/js/',
  img: 'public_html/img/',
  fonts: 'public_html/fonts/'
};

gulp.task('cleanCss', function() {
  return gulp.src(dest.css + '*', {read: false, force: true})
      .pipe(clean());
});

gulp.task('compass', ['cleanCss'], function() {
  gulp.src(src.scss + '*.scss')
    .pipe(compass({
      css: src.css,
      sass: src.scss,
      image: src.img
    }))
    .on('error', function(err) {
      // Would like to catch the error here
    });

  gulp.src(src.css + '*.css')
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(concat('style.css'))
    .pipe(freeze())
    .pipe(gulp.dest(dest.css))
    .on('error', function(err) {
      // Would like to catch the error here
    });
});


gulp.task('cleanJs', function() {
  return gulp.src(dest.js + '*', {read: false, force: true})
      .pipe(clean());
});

gulp.task('js', ['cleanJs'], function() {
  gulp.src(src.js)
    .pipe(concat('script.js'))
    .pipe(freeze())
    .pipe(uglify({
        outSourceMap: false,
    }))
    .pipe(gulp.dest(dest.js))
    .on('error', function(err) {
      // Would like to catch the error here
    });
});

gulp.task('cleanFonts', function() {
  return gulp.src(dest.fonts + '*', {read: false, force: true})
      .pipe(clean());
});

gulp.task('fonts', ['cleanFonts'], function() {
  gulp.src(src.fonts + '*')
    .pipe(gulp.dest(dest.fonts));
});

gulp.task('cleanImg', function() {
  return gulp.src(dest.img + '*', {read: false, force: true})
    .pipe(clean());
});

gulp.task('img', ['cleanImg'], function() {
  gulp.src(src.img + '**')
    .pipe(gulp.dest(dest.img))
    .on('error', function(err) {
      // Would like to catch the error here
    });
});

// generate sprite.png and _sprite.scss
gulp.task('sprites', function () {
  return gulp.src(src.sprites + '*.png')
    .pipe(sprite({
      name: 'sprite',
      style: '_sprite.scss',
      cssPath: '../img/',
      processor: 'scss',
      retina: true
    }))
    .pipe(gulpif('*.png', gulp.dest(dest.img), gulp.dest(src.scss)))
});
// generate scss with base64 encoded images
gulp.task('base64', function () {
  return gulp.src(src.img + '*.png')
    .pipe(sprite({
      base64: true,
      style: '_base64.scss',
      processor: 'scss'
    }))
    .pipe(gulp.dest(src.scss));
});

gulp.task('watch', [
      'compass',
      'sprites',
      'img',
      'js',
      'fonts'
    ], function() {
  gulp.watch([src.scss + '*.scss', src.css + '*.css'], ['compass']);
  gulp.watch(src.sprites, ['sprites']);
  gulp.watch(src.img, ['img']);
  gulp.watch(src.js, ['js']);
  gulp.watch(src.fonts, ['fonts']);
});

gulp.task('reload', function() {
  gulp.watch([
    "public_html/css/*.css",
    "public_html/js/*.js",
    "public_html/img/*",
    "public_html/fonts/*"
  ]).on('change', browserSync.reload);
});

gulp.task('connect', ['watch'], function() {
  connect.server({
    base: 'public_html',
    port: 8888,
    open: true
  }, function (){
    browserSync();
  });
});

gulp.task('default', ['connect', 'reload']);
