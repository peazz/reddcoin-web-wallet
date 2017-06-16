var gulp = require('gulp');
var sass = require('gulp-sass');
var webpack = require('webpack-stream');

/**
 * Compile our styles
 */
gulp.task('sass', function () {
  return gulp.src('./app/assets/sass/style.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('./dist/assets/css'));
});

gulp.task('sass:watch', function () {
  gulp.watch([
    './app/assets/sass/*.scss'
    './app/assets/sass/**/*.scss'
  ], ['sass']);
});

/**
 * Let webpack handle js, its awesome
 * NOTE: it also creates the dist folder, moves the index
 * includes the js file url in the file as well
 */
gulp.task('js', function () {
  return gulp.src('app/index.js')
    .pipe(webpack( require('./webpack.config.js') ))
    .pipe(gulp.dest('dist/'));
});

gulp.task('js:watch', function () {
  gulp.watch([
    './app/index.js',
    './app/**/*.js',
    './app/**/*.jsx'
  ], ['js']);
});

/**
 * Build Task
 */
gulp.task('build', ['js', 'sass'], function(done){
  done();
});

/**
 * Default task
 */
gulp.task('default', ['build','js:watch','sass:watch']);