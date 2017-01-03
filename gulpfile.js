var args = require('yargs').argv
var gulp = require('gulp')
var pkg = require('./package.json')
var paths = pkg.paths
var _ = require('lodash')
var wiredep = require('wiredep').stream
var bowerFiles = require('main-bower-files')
var del = require('del')
var es = require('event-stream')
var sort = require('gulp-filename-sort')
var Q = require('q')
var ngconfig = require('gulp-ng-config')

var $ = require('gulp-load-plugins')()

var paths = pkg.paths

var config = {
  validate: false,
  sourceMap: false,
  isProd: false,
  imgmin: args.img,
  cssmin: args.css,
  ngConfigModule: 'koala.config',
  env: 'production',
  testEnv: 'local',
  prodEnv: 'production',
}

var lazyLoadVendorFiles = [
  "vendor/echarts/build/dist/echarts-all.js",
  "vendor/angular-echarts/dist/angular-echarts.min.js"
]

var preFiles = ['bootstrap.css', 'font-awesome.css', 'chosen.min.css' , 'chosen.min.css','jquery.js', 'moment.js', 'bignumber.js','lodash.js', 'angular.js']


var pipes = {}

pipes.ngconfig = function () {
  return gulp.src('package.json')
    .pipe(ngconfig(config.ngConfigModule, {environment: 'config.' + config.env}))
    .pipe($.rename(paths.src.configFile))
    .pipe(gulp.dest(paths.dist.base))
}

gulp.task('config', function () {
  pipes.ngconfig()
})

pipes.es5files = function () {
  var es5Files = paths.src.scripts.concat(_.map(paths.src.es6, function (path) {
    return '!' + path
  }))

  return gulp.src(es5Files)
    .pipe($.if(config.validate, $.eslint()))
    .pipe($.if(config.validate, $.eslint.format()))
}

pipes.es6files = function () {
  return gulp.src(paths.src.es6)
    .pipe($.if(config.validate, $.eslint()))
    .pipe($.if(config.validate, $.eslint.format()))
    .pipe($.if(config.sourceMap, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(config.sourceMap, $.sourcemaps.write()))
}

pipes.buildScripts = function () {
  log('Build scripts...')

  var es5files = pipes.es5files()
  var es6files = pipes.es6files()

  return es.merge(es5files, es6files)
    .pipe($.if(!config.isProd, gulp.dest(paths.dist.base)))
}

pipes.buildStyles = function () {
  log('Build styles...')
  var css = gulp.src(paths.src.css)
    .pipe($.autoprefixer({
            browsers: ['last 2 versions']
        }))

  var less = gulp.src(paths.src.less)
    .pipe($.if(config.sourceMap, $.sourcemaps.init()))
    .pipe($.less())
    .pipe($.if(config.sourceMap, $.sourcemaps.write()))

  return es.merge(less, css)
    .pipe(sort({previous: preFiles}))
    .pipe($.if(!config.isProd, gulp.dest(paths.dist.css)))
}

pipes.buildVendors = function () {
  log('Build bower files...')
  return gulp.src(bowerFiles())
    .pipe($.filter('**/*.{js,css}'))
    .pipe(sort({previous: preFiles}))
    .pipe($.if(!config.isProd, gulp.dest(paths.dist.vendor)))
}

pipes.buildPartials = function () {
  log('partials process...')
  return gulp.src(paths.src.partials)
    .pipe(gulp.dest(paths.dist.base))
}

pipes.buildTemplateCache = function () {
  log('Generate templateCache...')
  return gulp.src(paths.src.partials)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache(paths.dist.templateCache, {
      module: 'koala'
    }))
    .pipe($.if(!config.isProd, gulp.dest(paths.dist.js)))
}

pipes.buildImages = function () {
  log('Images process...')
  return gulp.src(paths.src.images)
    .pipe($.if(config.imgmin, $.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(paths.dist.images))
}

pipes.buildFonts = function () {
  return gulp.src(paths.src.fonts)
    .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe($.flatten())
    .pipe(gulp.dest(paths.dist.fonts))
}

pipes.buildOther = function () {
  log('Copy other file...')
  var fileFilter = $.filter(function (file) {
    return file.stat.isFile()
  })

  return gulp.src(paths.src.other, {base: paths.src.base})
    .pipe(fileFilter)
    .pipe(gulp.dest(paths.dist.base))
}

pipes.buildLazyLoadFiles = function () {
  log('Copy lazy load files...')

  return gulp.src(lazyLoadVendorFiles)
    .pipe($.flatten())
    .pipe(gulp.dest(paths.dist.vendor))
}

pipes.processDev = function () {

  var styles = pipes.buildStyles()

  var scripts = pipes.buildScripts()
    .pipe($.ngAnnotate())
    .pipe($.angularFilesort())
    .on('error', handleError)

  var ngconfig = pipes.ngconfig()

  var mergeScript = es.merge(scripts, ngconfig)

  var vendor = pipes.buildVendors()

  var injectOptions = {
    ignorePath: paths.dist.base,
    addRootSlash: false
  }

  var inejectBowerOptions = {
    name: 'bower',
    ignorePath: paths.dist.base,
    addRootSlash: false
  }

  log('Index inject styles and scripts...')
  var injectedIndex = gulp.src(paths.src.index)
    .pipe($.inject(vendor, inejectBowerOptions))
    .pipe($.inject(styles, injectOptions))
    .pipe($.inject(mergeScript, injectOptions))
    .pipe(gulp.dest(paths.dist.base))

  return es.merge(styles, scripts, vendor, injectedIndex)
}

pipes.processProd = function () {

  var styles = pipes.buildStyles()
    .pipe(gulp.dest(paths.tmp.css))

  var scripts = pipes.buildScripts()
    .pipe($.ngAnnotate())
    .pipe($.angularFilesort())
    .on('error', handleError)
    .pipe(gulp.dest(paths.tmp.base))

  var ngconfig = pipes.ngconfig()
    .pipe(gulp.dest(paths.tmp.base))

  var mergeScript = es.merge(scripts, ngconfig)

  var vendor = pipes.buildVendors()
    .pipe(gulp.dest(paths.tmp.vendor))

  var templateCache = pipes.buildTemplateCache()
    .pipe(gulp.dest(paths.tmp.js))

  var injectOptions = {
    ignorePath: paths.tmp.base,
    addRootSlash: false
  }

  var inejectBowerOptions = {
    name: 'bower',
    ignorePath: paths.tmp.base,
    addRootSlash: false
  }

  var partialsInjectOptions = {
    starttag: '<!-- inject:partials -->',
    ignorePath: paths.tmp.base,
    addRootSlash: false
  }

  var injectedIndex = gulp.src(paths.src.index)
    .pipe($.inject(templateCache, partialsInjectOptions))
    .pipe($.inject(vendor, inejectBowerOptions))
    .pipe($.inject(styles, injectOptions))
    .pipe($.inject(mergeScript, injectOptions))
    .pipe(gulp.dest(paths.tmp.base))

  return injectedIndex
}

pipes.processIndex = function () {
  var jsFilter = $.filter('**/*.js', { restore: true })
  var cssFilter = $.filter('**/*.css', { restore: true })
  var assets

  return pipes.processProd()
    .pipe(assets = $.useref.assets())
    .pipe($.rev())
    .pipe(jsFilter)
    .pipe($.uglify({ preserveComments: $.uglifySaveLicense }))
    .on('error', handleError)
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe($.if(config.cssmin,$.csso()))
    .pipe(cssFilter.restore)
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(gulp.dest(paths.dist.base))
    .pipe($.size({ title: '/', showFiles: true }))
}

gulp.task('setProd', function () {
  config.isProd = true
})

gulp.task('setDev', function () {
  config.isProd = false
})

gulp.task('setTestEnv', function () {
  log('这是测试环境哦！！随便搞')
  config.env = config.testEnv
})

gulp.task('setProdEnv', function () {
  log('这是生产环境哦！！！')
  config.env = config.prodEnv
})

gulp.task('clean', function () {
  log("Delete dist and tmp...")
  var deferred = Q.defer()
  del([paths.dist.base, paths.tmp.base], function () {
    deferred.resolve()
  })
  return deferred.promise
})

gulp.task('build:dev', ['clean', 'setTestEnv'], function () {
  return es.merge(pipes.processDev(), pipes.buildPartials(), pipes.buildImages(), pipes.buildOther(), pipes.buildFonts(), pipes.buildLazyLoadFiles())
})

gulp.task('build:localDebugOnline', ['clean', 'setProdEnv'], function () {
  return es.merge(pipes.processDev(), pipes.buildPartials(), pipes.buildImages(), pipes.buildOther(), pipes.buildFonts(), pipes.buildLazyLoadFiles())
})

gulp.task('build:test', ['clean', 'setDev', 'setTestEnv'], function () {
  log('我的征途是星辰大海，贼哈哈哈哈哈！！！')
  return es.merge(pipes.processIndex(), pipes.buildImages(), pipes.buildOther(),pipes.buildFonts(), pipes.buildLazyLoadFiles())
})

gulp.task('build:prod',['clean', 'setProd', 'setProdEnv'], function() {
  log('我的征途是星辰大海，贼哈哈哈哈哈！！！')
  return es.merge(pipes.processIndex(), pipes.buildImages(), pipes.buildOther(),pipes.buildFonts(), pipes.buildLazyLoadFiles())
})


gulp.task('watch', ['build:dev'], function () {
  watch()
  takeoff()
})

gulp.task('watch:prod', ['build:localDebugOnline'], function () {
  watch()
  takeoff()
})

gulp.task('test',['build:test'], function() {
  takeoff()
})

gulp.task('build',['build:prod'], function() {
  takeoff()
})

gulp.task('live', function() {
  takeoff()
})

gulp.task('default', ['clean'])

// watch
function watch() {
  $.livereload.listen({ start: true })

  gulp.watch(paths.src.index, function () {
    return pipes.processDev()
      .pipe($.livereload())
  })

  gulp.watch(paths.src.scripts, function () {
    return pipes.buildScripts()
      .pipe($.livereload())
  })

  gulp.watch(paths.src.css, function () {
    return pipes.buildStyles()
      .pipe($.livereload())
  })

  gulp.watch(paths.src.less, function () {
    return pipes.buildStyles()
      .pipe($.livereload())
  })

  gulp.watch(paths.src.partials, function () {
    return pipes.buildPartials()
      .pipe($.livereload())
  })

  gulp.watch(paths.src.images, function () {
    return pipes.buildImages()
      .pipe($.livereload())
  })

  gulp.watch(paths.src.other, function () {
    return pipes.buildOther()
      .pipe($.livereload())
  })

  log('已侦测到在途的核聚变打击！！！')
}
// start production
function takeoff() {
  $.nodemon({
    script: 'server/app.js',
    ext: 'js',
    watch: ['server/'],
    env: { NODE_ENV: 'production' },
    execMap: {
      js: "node --harmony"
    }})
    .on('restart', function () {
      console.log('restarted')
    })
  log('跃迁引擎已启动。')
}

// Log
function log(msg) {
  $.util.log($.util.colors.blue(msg))
}

// Error handler
function handleError(err) {
  log(err.toString())
  this.emit('end')
}