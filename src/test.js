import {copyAsync, emptyDirAsync, writeFileAsync} from 'fs-extra-promise'
import {join} from 'path'
import {install} from 'source-map-support'
import docModule from './doc-module'
install()

async function writeModule() {
	const src = `
| My awesome module

a. |x
	x

x. |a:String b
	| Returns 1
	a b

two:Number.
	| Number 2!
	2

Y. class
	| Awesome class
	static
		'foo |
			1

	construct! .x:Number .y
		| Construct you a Y!
		pass

	'bar |y
		| Keeps returnin'
		y

	get 'baz
		| Get you some baz
		3
`
	const html = docModule(src, 'sample.ms')
	await writeFileAsync('out/sample.html', html)
}

const assetsDir = join(__dirname, '../public')
const outDir = join(__dirname, '../out')

async function foo() {
	await emptyDirAsync(outDir)
	await copyAsync(assetsDir, outDir)
	await writeModule()
	console.log('done')
}

function promiseDone(promise) {
	promise.catch(error => {
		console.log(error.stack)
	})
}

promiseDone(foo())
