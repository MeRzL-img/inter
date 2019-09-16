var {watch, src, dest, parallel, series}  = require('gulp');
var browserSync = require('browser-sync');
var del = require('del');
var twig = require('gulp-twig');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var babel = require("gulp-babel");
var webpack = require("webpack-stream");

// Девсервер
function devServer(cb) {
  var params = {
    watch: true,
    reloadDebounce: 150,
    notify: false,
    server: { baseDir: './build' },
  };

  browserSync.create().init(params);
  cb();
}




function buildPages() {
  return src(['src/*.twig'])
    .pipe(twig())
    .pipe(dest('build'));
}

function buildStyles() {
  return src('src/styles/**/*.sass')
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      cssnano()
    ]))
    .pipe(dest('build/styles'));
}

function buildScripts() {
  return src('src/scripts/*.js')
    .pipe(webpack({ output: { filename: 'bundle.js' } }))
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(dest('build/scripts/'));
}



function buildAssets(cb) {
     src(['src/assets/**/*.*', '!src/assets/img/**/*.*'])
    .pipe(dest('build/assets'));
     src('src/assets/img/**/*.*')
    .pipe(imagemin())
    .pipe(dest('build/assets/img'));

    cb();
}




// Отслеживание
function watchFiles() {
  watch(['src/**/*.twig', 'src/**/*.html'], buildPages);
  watch('src/styles/**/*.sass', buildStyles);
  watch('src/scripts/**/*.js', buildScripts);
  watch('src/assets/**/*.*', buildAssets);
}

function clearBuild() {
  return del('build');
}

exports.default =
  series(
    clearBuild,
    parallel(
      devServer,
      series(
        parallel(buildPages, buildStyles, buildScripts, buildAssets),
        watchFiles
      )
    )
);
