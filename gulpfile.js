var gulp = require('gulp');
var uglify = require('gulp-uglifyjs');
 
gulp.task('uglify', function() {
  gulp.src('lokesh_pushup.js')
    .pipe(uglify('lokesh_pushup.min.js'))
    .pipe(gulp.dest('dist/'))
});

gulp.task('default',['uglify']);