var gulp = require('gulp');
var typescript = require('gulp-tsc');

gulp.task('build', function() {
  gulp.src(['*.ts'])
    .pipe(typescript())
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['build']);
gulp.task('test', ['build']);

