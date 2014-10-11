var gulp = require('gulp');
var typescript = require('gulp-tsc');

gulp.task('default', function() {
  gulp.src(['*.ts'])
    .pipe(typescript())
    .pipe(gulp.dest('.'));
});
