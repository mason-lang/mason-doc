'use strict'

const
	babel = require('gulp-babel'),
	createServer = require('http-server').createServer,
	eslint = require('gulp-eslint'),
	gulp = require('gulp'),
	jade = require('gulp-jade'),
	plumber = require('gulp-plumber'),
	sourceMaps = require('gulp-sourcemaps'),
	stylus = require('gulp-stylus'),
	watch = require('gulp-watch')

gulp.task('default', [ 'view', 'style', 'static', 'script', 'lib', 'serve' ])

const watchStream = name => {
	const glob = `assets/${name}/**/*`
	return gulp.src(glob)
	.pipe(watch(glob, { verbose: true }))
	.pipe(plumber())
}

const simple = (name, stream, outName) => {
	if (outName === undefined)
		outName = name
	let _ = watchStream(name)
	if (stream)
		_ = _.pipe(stream)
	return _.pipe(gulp.dest(`public/${outName}`))
}

gulp.task('view', () => simple('view', jade({ pretty: true }), ''))

gulp.task('style', () => simple('style', stylus()))

gulp.task('static', () => watchStream('static').pipe(gulp.dest('public')))

gulp.task('script', () =>
	watchStream('script')
	.pipe(sourceMaps.init())
	// TODO: module style option: amdefine, amd, commonjs
	.pipe(babel({
		modules: 'amd',
		nonStandard: true,
		whitelist: [
			'es6.destructuring',
			'es6.modules',
			'es6.parameters',
			'asyncToGenerator', 'es7.asyncFunctions',
			// This is needed for async to work; see https://github.com/babel/babel/issues/2341
			'es6.properties.shorthand',
			'strict'
		]
	}))
	.pipe(sourceMaps.write('.'))
	.pipe(gulp.dest('public/script')))

gulp.task('lib', () =>
	gulp.src('bower_components/**/*')
	.pipe(gulp.dest('public/lib')))

gulp.task('lint', () =>
	gulp.src([ './gulpfile.js', 'assets/script/**/*' ]).pipe(eslint()).pipe(eslint.format()))

gulp.task('serve', () => { createServer({ root: 'public' }).listen(8000) })
