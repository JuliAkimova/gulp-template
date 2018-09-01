const gulp         = require('gulp');
const sass         = require('gulp-sass');
const browserSync  = require('browser-sync');
const useref       = require('gulp-useref');
const uglify       = require('gulp-uglify-es').default;
const gulpIf       = require('gulp-if');
const cssnano      = require('gulp-cssnano');
const imagemin     = require('gulp-imagemin');
const cache        = require('gulp-cache');
const del          = require('del');
const runSequence  = require('run-sequence');


/* Development Tasks*/

// Start browserSync server
gulp.task('browserSync', () => {
    browserSync({
      server: {
        baseDir: 'src'
      }
    })
  })
  
  gulp.task('sass', () => {
       gulp.src('src/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
      .pipe(sass().on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
      .pipe(gulp.dest('src/css')) // Outputs it in the css folder
      .pipe(browserSync.reload({ // Reloading with Browser Sync
        stream: true
      }));
  })
  
  // Watchers
  gulp.task('watch', () => {
    gulp.watch('src/scss/**/*.scss', ['sass']);
    gulp.watch('src/*.html', browserSync.reload);
    gulp.watch('src/js/**/*.js', browserSync.reload);
  })
  
  /* Optimization Tasks */
  
  // Optimizing CSS and JavaScript 
  gulp.task('useref', () => {
    return gulp.src('src/*.html')
      .pipe(useref())
      .pipe(gulpIf('*.js', uglify()))
      .pipe(gulpIf('*.css', cssnano()))
      .pipe(gulp.dest('prod'));
  });
  
  // Optimizing Images 
  gulp.task('images', () => {
    return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
      // Caching images that ran through imagemin
      .pipe(cache(imagemin({
        interlaced: true,
      })))
      .pipe(gulp.dest('prod/images'))
  });
  
  // Copying fonts 
  gulp.task('fonts', () => {
    return gulp.src('src/fonts/**/*')
      .pipe(gulp.dest('prod/fonts'))
  })
  
  // Cleaning 
  gulp.task('clean', () => {
    return del.sync('dist').then(function(cb) {
      return cache.clearAll(cb);
    });
  })
  
  gulp.task('clean:dist', () => {
    return del.sync(['prod/**/*', '!prod/images', '!prod/images/**/*']);
  });
  
  /* Build Sequences */
    
  gulp.task('default', (callback) => {
    runSequence(['sass', 'browserSync'], 'watch',
      callback
    )
  })
  
  gulp.task('build', (callback) =>  {
    runSequence(
      'clean:dist',
      'sass',
      ['useref', 'images', 'fonts'],
      callback
    )
  })