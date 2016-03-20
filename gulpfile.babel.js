'use strict';

import path from 'path';
import gulp from 'gulp';
import del from 'del';
import autoprefixer from 'autoprefixer';
import mqpacker from 'css-mqpacker';
import mqkeyframes from 'postcss-mq-keyframes';
import willChange from 'postcss-will-change';
import browserSync from 'browser-sync';
import swPrecache from 'sw-precache';
import gulpLoadPlugins from 'gulp-load-plugins';
import pkg from './package.json';
import config from './config.json';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

function onError(error) {
  console.log(error.toString());
  this.emit('end');
};

// Generate webp images.
gulp.task('webp', () =>
  gulp.src(config.images.src.towebp)
    .pipe($.cache($.webp()))
    .pipe(gulp.dest(config.images.dist))
);

// Optimize images.
gulp.task('imagemin', () =>
  gulp.src(config.images.src.all)
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [
        {removeViewBox: false}
      ],
    })))
    .pipe(gulp.dest(config.images.dist))
    .pipe($.size({title: 'images'}))
);

// Generate images.
gulp.task('images', gulp.parallel('webp', 'imagemin'));

// Copy all files at the root level (src)
gulp.task('copy', () =>
  gulp.src([
    `${config.source}/*`,
    `!${config.source}/*.html`,
  ], {
    dot: true
  }).pipe(gulp.dest(config.destination))
    .pipe($.size({title: 'copy'}))
);

// Compile and automatically prefix stylesheets
gulp.task('styles', () => {
  const processors = [
    willChange,
    autoprefixer({cascade: false}),
    mqpacker({sort: true}),
    mqkeyframes
  ];

  return gulp.src(config.styles.src)
    .pipe($.newer('.tmp/css'))
    .pipe($.plumber({
      errorHandler: onError
    }))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: ['./src/libraries/'],
      outputStyle: 'expanded',
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.postcss(processors))
    .pipe($.webpcss())
    .pipe(gulp.dest('.tmp/css'))
    .pipe($.if('*.css', $.cssnano({
      convertValues: false,
      autoprefixer: false
    })))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest(config.styles.dist));
});

// Lint JavaScript.
gulp.task('lint', () =>
  gulp.src(config.scripts.src)
    .pipe($.eslint())
    .pipe($.eslint.format())
);

// Concatenate and minify JavaScript and transpiles ES2015 code to ES5.
gulp.task('scripts', () =>
    gulp.src(config.scripts.src)
      .pipe($.newer('.tmp/js'))
      .pipe($.plumber({
        errorHandler: onError
      }))
      .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('.tmp/js'))
      .pipe($.concat('main.min.js'))
      .pipe($.uglify({preserveComments: 'some'}))
      .pipe($.size({title: 'scripts'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(config.scripts.dist))
);

// Scan your HTML for assets & optimize them
gulp.task('html', () => 
  gulp.src(config.html.src)
    .pipe($.plumber({
      errorHandler: onError
    }))
    .pipe($.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    }))
    .pipe($.size({title: 'html', showFiles: true}))
    .pipe(gulp.dest(config.destination))
);

// Clean output directory
gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/.git'], {dot: true}));

// Watch files for changes & reload
gulp.task('serve:src', () => {
  browserSync({
    logPrefix: 'BrowserSync',
    server: ['.tmp', 'app'],
    port: 7000
  });  
});

// Build and serve the output from the dist build
gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    scrollElementMapping: ['main'],
    server: 'dist',
    port: 7007
  })
});

gulp.task('watch', () => {
  gulp.watch([config.html.src], reload);
  gulp.watch([config.styles.src], gulp.parallel('styles', reload));
  gulp.watch([config.scripts.src], gulp.parallel('lint', 'scripts'));
  gulp.watch([config.images.src.all], reload);
});

gulp.task('serve', gulp.series(
  gulp.parallel('scripts', 'styles'),
  'serve:src',
  'watch'
));

// Build production files
gulp.task('build', gulp.series(
    'clean',
    'styles',
    gulp.parallel('lint', 'html', 'scripts', 'images', 'copy')
  )
);

// Default task.
gulp.task('default', gulp.series('build', 'serve:dist'));
