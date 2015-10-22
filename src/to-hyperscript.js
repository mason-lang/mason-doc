import h from 'hyperscript'
import {isEmpty, opIf, opMap} from 'mason-compile/dist/private/util'
import {ClassInfo, FunInfo, MethodGetSetInfo, MethodImplInfo} from './DocInfo'

// TODO: computed
const root = '.'

export default function all(moduleInfo) {
	return h('html', [
		h('head', [
			h('title', 'TITLE'),
			h('link', {rel: 'icon', href: 'http://mason-lang.org/icon.svg'}),
			h('link', {rel: 'stylesheet', href: `${root}/style/layout.css`}),
			h('link', {rel: 'stylesheet', href: `${root}/style/mason-doc.css`}),
			h('script', {src: `${root}/lib/requirejs/require.js`}),
			h('script', `require(['${root}/script/main'])`)
		]),
		h('body', [
			h('main', docModule(moduleInfo))
		])
	])
}

function docModule(moduleInfo) {
	const {name, opComment, exports} = moduleInfo
	return h('.mason-doc-module', [
		h('.name', name),
		hOp('.comment.module', opComment),
		h('.exports', exports.map(docExport))
	])
}

function detailsIfNeeded(className, summary, body) {
	if (body === null)
		return h(`.${className}`, h('summary', summary))
	else
		return h(`details.${className}`, {open: true},
			h('summary', summary),
			body)
}

function hOp(name, val) {
	return opMap(val, _ => h(name, val))
}

function docExport(moduleExport) {
	const {name, opComment, opValueInfo} = moduleExport
	const {opBrief, opDetail} = opValueBriefAndDetail(opValueInfo)
	return detailsIfNeeded('mason-doc-export',
		[h('.name', name), hOp('.brief', opBrief)],
		opIf(opComment !== null || opDetail !== null, () => [
			hOp('.comment', opComment),
			hOp('.value', opDetail)
		]))
}

function opValueBriefAndDetail(_) {
	if (_ instanceof FunInfo)
		return {opBrief: docFun(_), opDetail: null}
	else if (_ instanceof ClassInfo)
		return {
			opBrief: opMap(_.opSuper, docSuper),
			opDetail: docClass(_)
		}
	else
		return {opBrief: null, opDetail: null}
}

function docClass({statics, opConstructor, methods}) {
	const docMethods = (_, name) =>
		opIf(!isEmpty(_), () =>
			h(`details.${name}`, {open:true}, [
				h('summary', name),
				_.map(docMethod)
			]))

	return h('.mason-doc-class', [
		docMethods(statics, 'statics'),
		opMap(opConstructor, docConstructor),
		docMethods(methods, 'methods')
	])
}

function docFun({kind, args}) {
	return h('.mason-doc-fun', [
		h('.kind', kind),
		h('.args', args.map(docArg))
	])
}

function docArg({name, opType}) {
	return h('.mason-doc-arg', [
		h('.name', name),
		hOp('.type', opType)
	])
}

function docMethod(_) {
	const summary = [
		opIf(_ instanceof MethodGetSetInfo, () =>
			h('.kind', _.kind)),
		h('.name', _.name),
		opIf(_ instanceof MethodImplInfo, () =>
			h('.fun', docFun(_.fun))),
	]
	return detailsIfNeeded('mason-doc-method',
		summary,
		hOp('.comment', _.opComment))
}

function docConstructor({opComment, fun}) {
	return h('.mason-doc-constructor', [
		docFun(fun),
		hOp('.comment', opComment)
	])
}

function docSuper(_) {
	return h('.mason-doc-super', _)
}
