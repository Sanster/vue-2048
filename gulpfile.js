var gulp = require('gulp');

gulp.task('default', function() {
  // place code for your default task here
});

// 执行文件拷贝
gulp.task('toBlog', function() {
   gulp.src(['./index.html'])
   .pipe(gulp.dest('/Users/cwq/Github/blog/source/projects/vue2048'));

   gulp.src(['./dist/main.js', './dist/style.css'])
   .pipe(gulp.dest('/Users/cwq/Github/blog/source/projects/vue2048/dist'));
});