'use strict';

var gulp         = require('gulp')
var rimraf       = require('gulp-rimraf')
var concat       = require('gulp-concat')
var less         = require('gulp-less')
var replace      = require('gulp-replace')
var sourcemaps   = require('gulp-sourcemaps')
var typescript   = require('gulp-typescript')
var tslint       = require('gulp-tslint')
var stylish      = require('gulp-tslint-stylish')
var ngAnnotate   = require('gulp-ng-annotate')
var minifyHtml   = require('gulp-minify-html')
var ngTemplate   = require('gulp-ng-template')
var sequence     = require('gulp-sequence')
var uglify       = require('gulp-uglify')
var minifyCss    = require('gulp-minify-css')
var RevAll       = require('gulp-rev-all')
var plumber      = require('gulp-plumber')
var autoprefixer = require('gulp-autoprefixer')
var util         = require('gulp-util')
var order        = require('gulp-order')
var merge2       = require('merge2')
var through      = require('through2')
var cdnUploader  = require('cdn-uploader')
var clientId     = require('./package.json').ACCOUNT_CLIENTID
var wrench       = require('wrench')
var ET           = require('et-template')
var through      = require('through2')

var cdnPrefix = 'https://dn-st.teambition.net/tb-weixin'

//将gulp 文件夹里面所有的gulp 任务load进来
wrench.readdirSyncRecursive('./gulp').filter(function(file) {
  return (/\.(js|coffee)$/i).test(file);
}).map(function(file) {
  require('./gulp/' + file);
})

var catchError = true
var logError  = function(stream) {
  if(!catchError) return stream
  return stream.on('error', console.log.bind(console))
}

var paths = {
  images: ['src/images/*'],
  less: [
    'src/app.less',
    'src/scripts/**/*.less',
    'src/views/**/*.less'
  ],
  html: [
    'src/views/**/*.html',
    'src/scripts/directives/**/*.html'
  ],
  'app': [
    'src/**/*.ts',
    '!src/scripts/interface/zone.d.ts'
  ],
  tbui: [
    'src/less/tb-fonts-variables.less',
    'bower_components/UI/less/teambition-ui-variables.less',
    'bower_components/UI/less/teambition-ui-icons.less'
  ]
}

gulp.task('clean', ['tsd:purge'], function() {
  gulp.src('www/*')
    .pipe(rimraf({force: true}))

  gulp.src("dist/*")
    .pipe(rimraf({force: true}))

  gulp.src('.tmp/*')
    .pipe(rimraf({force: true}))
})

gulp.task('less', function() {
  return merge2(
    gulp.src(paths.tbui)
      .pipe(concat('tbui.less'))
      .pipe(logError(less()))
      .pipe(autoprefixer({
        browsers: ['last 2 versions']
      })),
    gulp.src(paths.less)
      .pipe(sourcemaps.init())
      .pipe(logError(less()))
      .pipe(autoprefixer({
        browsers: ['last 2 versions']
      }))
      .pipe(sourcemaps.write())
  )
  .pipe(concat('app.css'))
  .pipe(gulp.dest('www/css/'))
})

function compileTypescript(resources, dest) {
  var _dest = dest ? dest : '.tmp/scripts'
  console.log('compile resource', resources);
  console.log('compile dest', _dest);
  return gulp.src(resources)
    .pipe(sourcemaps.init())
    .pipe(tslint())
    .pipe(tslint.report(stylish, {
      emitError: false,
      sort: true,
      bell: true
    }))
    .pipe(typescript({
      'module': 'umd',
      'experimentalDecorators': true,
      'target': 'ES5'
    }))
    .pipe(sourcemaps.write())
    .pipe(ngAnnotate())
    .pipe(gulp.dest(_dest))
}

function compileTemplate() {
  return gulp.src(paths.html)
    .pipe(minifyHtml({empty: true, quotes: true}))
    .pipe(ngTemplate({
      moduleName: 'tbTemplates',
      standalone: true,
      filePath: 'templates.js'
    }))
    .pipe(gulp.dest('.tmp/scripts/template/'))
}

// function compileET() {
//   var option = {
//     modelType: 'object'
//   }
//   var et = new ET(option)
//   var compile = function() {
//     return through.obj(function (file, enc, next) {
//       if (!file.isBuffer()) {
//         return next()
//       }
//       var contents = et.compile(file.contents.toString())
//       file.contents = new Buffer(contents)
//       file.path = file.path.replace(/\.html/, '.js')
//       this.push(file)
//       next()
//     })
//   }
//   return gulp.src('src/scripts/components/**/*.html')
//     .pipe(compile())
// }

gulp.task('compile-ts', function() {
  return compileTypescript(paths.app)
})

gulp.task('compile-template', function() {
  return compileTemplate()
})

gulp.task('concat-app', function() {
  return gulp.src('.tmp/scripts/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(order([
      'src/app.js',
      'src/config.js',
      'src/run.js',
      'src/View.js',
      'src/views/**/*.js',
      'src/scripts/**/*.js'
    ]))
    .pipe(concat('app.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('www/js/'))
})

gulp.task('compile', sequence(['compile-ts', 'compile-template'], 'concat-app'))

gulp.task('html', function() {
  return gulp.src('src/index.html')
    .pipe(gulp.dest('www/'))
})

gulp.task('images', function() {
  return gulp.src(paths.images)
    .pipe(gulp.dest('www/images/'))
})

gulp.task('lib-css', function() {
  return gulp.src([
      'bower_components/ionic/release/css/ionic.css'
    ])
    .pipe(concat('lib.css'))
    .pipe(gulp.dest('www/css/'))
})

gulp.task('lib-font', function() {
  return gulp.src([
    'bower_components/ionic/release/fonts/*',
    'bower_components/UI/fonts/teambition*'
  ])
    .pipe(gulp.dest('www/fonts/'))
})

gulp.task('lib-js', function() {
  gulp.src([
    'bower_components/ionic/release/js/ionic.bundle.js',
    'bower_components/angular-resource/angular-resource.js',
    'bower_components/zone.js/dist/zone.js',
    'bower_components/marked/lib/marked.js',
    'bower_components/store2/dist/store2.js',
    'bower_components/moment/moment.js',
    'bower_components/gta/lib/index.js',
    'bower_components/ng-file-upload/ng-file-upload.js',
    'bower_components/gta/lib/index.js'
  ])
    .pipe(concat('lib.js'))
    .pipe(gulp.dest('www/js/'))
})

function replaceForPublish() {
  return gulp.src('www/index.html')
    .pipe(replace('8fadf360-fe9d-11e4-b300-55a8b3ba5938', '59fd91e0-9af6-11e4-aece-1bc583a1d7d7'))
    .pipe(replace('http://m.wx.project.ci', 'https://weixin.teambition.com'))
    .pipe(replace('http://project.ci/api', 'https://www.teambition.com/api'))
    .pipe(replace('wx48744c9444d9824a', 'wx3197516ac7a4c96b'))
    .pipe(replace('http://account.project.ci', 'https://account.teambition.com'))
}

gulp.task('revall', function() {
  var revall = new RevAll({
    prefix: cdnPrefix,
    dontGlobal: [/\/favicon\.ico$/],
    dontRenameFile: [/\.html$/],
    dontUpdateReference: [/\.html$/],
    dontSearchFile: [/\.js$/, /images/]
  })

  return merge2([
    replaceForPublish(),
    gulp.src([
      'www/fonts/**',
      'www/images/**'
    ]),
    gulp.src([
      'www/js/**'
    ])
      .pipe(uglify())
      .pipe(replace('/weixin/dev/signature', '/weixin/signature'))
      .pipe(replace('/weixin/dev/tpl/message', '/weixin/tpl/message'))
      .pipe(replace('/weixin/dev/', '/weixin/')),
    gulp.src([
      'www/css/**'
    ]).pipe(minifyCss({rebase: false})),
  ])
    .pipe(revall.revision())
    .pipe(gulp.dest('dist'))
})

function watchTs(event) {
  var regViews = /src\/views/
  var regScripts = /src\/scripts/
  var path = event.path
  var dest
  if (regViews.test(path)) {
    var _test = 'src/views'
    var _pos = path.indexOf(_test)
    var _subLength = path.length - _pos - _test.length
    var _subPos = _pos + _test.length + 1
    var _subStr = path.substr(_subPos, _subLength)
    var _subPath = _subStr.split('/')
    dest = '.tmp/scripts/views/' + _subPath[0] + '/'
  }else if(regScripts.test(path)) {
    var test = 'src/scripts'
    var pos = path.indexOf(test)
    var subLength = path.length - pos - test.length
    var subPos = pos + test.length + 1
    var subStr = path.substr(subPos, subLength)
    var subPath = subStr.split('/')
    if (subPath.length <= 1) {
      dest = '.tmp/scripts/scripts/'
    }else {
      dest = '.tmp/scripts/scripts/' + subPath[0] + '/'
    }
  }
  compileTypescript(path, dest)
}

gulp.task('watch', function() {
  gulp.watch(paths.less, ['less'])
  gulp.watch(paths.app, watchTs)
  gulp.watch(paths.html, compileTemplate)
  gulp.watch(paths.images, ['images'])
  gulp.watch('.tmp/scripts/**/*.js', ['concat-app'])
})

gulp.task('cdn', function() {
  return gulp.src(['dist/**', '!dist/index.html'])
    .pipe(cdnUploader('/tb-weixin', CDNs))
})

gulp.task('before:build', sequence('clean', 'tsd:install',
  ['lib-css', 'lib-font', 'lib-js', 'less', 'compile', 'html', 'images']
))

gulp.task('default', ['before:build'], function() {
  return replaceForPublish()
    .pipe(gulp.dest('www'))
})

gulp.task('build', sequence('before:build', 'revall'))
