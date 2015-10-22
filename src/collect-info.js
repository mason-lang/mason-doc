import {BlockDo, BlockWrap, Class, Constructor, Fun, LocalAccess, MethodImpl, MethodImplLike,
	MethodSetter, ModuleExportDefault, ModuleExportNamed} from 'mason-compile/dist/private/MsAst'
import {opMap, type} from 'mason-compile/dist/private/util'
import {parseWarnAndThrow} from 'mason-node-util/dist/compile-warn-and-throw'
import {ArgInfo, ClassInfo, ConstructorInfo, ExportInfo, FunInfo, MethodGetSetInfo, MethodImplInfo,
	ModuleInfo} from './DocInfo'

export default function collectInfo(source, filename, opts) {
	const ast = parseWarnAndThrow(source, filename, opts)
	return new ModuleInfo(ast.name, ast.opComment, exportInfos(ast.lines))
}

function exportInfos(lines) {
	const all = []
	for (const line of lines)
		if (line instanceof ModuleExportNamed) {
			if (line.assign.assignee.name !== 'name')
				all.push(getExportInfo(line.assign))
		} else if (line instanceof ModuleExportDefault)
			all.push(getExportInfo(line.assign))
	return all
}

function getExportInfo(assign) {
	const name = assign.assignee.name
	const val = assign.value
	const {opComment, opValueInfo} =
		val instanceof Fun ?
		getFunInfo(val) :
		val instanceof Class ?
		getClassInfo(val) :
		val instanceof BlockWrap ?
		{opComment: val.block.opComment, opValueInfo: null} :
		{opComment: null, opValueInfo: null}
	return new ExportInfo(name, opComment, opValueInfo)
}

function getFunInfo(_, noDotInKind) {
	type(_, Fun)
	const opComment = _.block.opComment
	const args = _.args.map(funArg)
	const opValueInfo = new FunInfo(getFunKind(_, noDotInKind), args)
	return {opComment, opValueInfo}
}

function getFunKind(_, noDotInKind) {
	const usesThis = !noDotInKind && _.opDeclareThis !== null
	const isDo = _.block instanceof BlockDo
	const _if = (bool, str) =>
		bool ? str : ''
	return `${_if(usesThis, '.')}${_if(_.isGenerator, '~')}${_if(isDo, '!')}|`
}

function funArg(arg) {
	return new ArgInfo(arg.name, opMap(arg.opType, typeDesc))
}

function typeDesc(typeAst) {
	if (typeAst instanceof LocalAccess)
		return type.name
	else
		return null
}

function getClassInfo(_) {
	type(_, Class)
	const opSuper = opMap(_.opSuperClass, typeDesc)
	const staticInfos = _.statics.map(getMethodInfo)
	const ctrInfo = opMap(_.opConstructor, getConstructorInfo)
	const methods = _.methods.map(getMethodInfo)
	const opValueInfo = new ClassInfo(opSuper, staticInfos, ctrInfo, methods)
	return {opComment: _.opComment, opValueInfo}
}

function getMethodInfo(_) {
	type(_, MethodImplLike)
	if (_  instanceof MethodImpl) {
		const {opComment, opValueInfo} = getFunInfo(_.fun, true)
		return new MethodImplInfo(_.symbol, opComment, opValueInfo)
	} else {
		const kind = _ instanceof MethodSetter ? 'set!' : 'get'
		return new MethodGetSetInfo(_.symbol, _.block.opComment, kind)
	}
}

function getConstructorInfo(_) {
	type(_, Constructor)
	const {opComment, opValueInfo} = getFunInfo(_.fun, true)
	return new ConstructorInfo(opComment, opValueInfo)
}
