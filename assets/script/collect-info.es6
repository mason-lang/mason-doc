import CompileError from 'mason-compile/CompileError'
import CompileContext from 'mason-compile/private/CompileContext'
import CompileOptions from 'mason-compile/private/CompileOptions'
import lex from 'mason-compile/private/lex'
import { BlockDo, BlockObj, BlockWrap, Class, Constructor, Fun, LocalAccess, MethodImplLike,
	ModuleExportDefault, ModuleExportNamed } from 'mason-compile/private/MsAst'
import parse from 'mason-compile/private/parse/parse'
import { opMap, type } from 'mason-compile/private/util'
import { ArgInfo, ClassInfo, ConstructorInfo, ExportInfo, FunInfo, MethodInfo, ModuleInfo }
	from './types'

export default (source, opts) => {
	type(source, String)
	const context = new CompileContext(new CompileOptions(opts))
	let ast
	try {
		ast = parse(context, lex(context, source))
	} catch (err) {
		if (err instanceof CompileError)
			console.log(err.warning.loc)
		throw err
	}
	return new ModuleInfo(context.opts.moduleName(), ast.opComment, exportInfos(ast.lines))
}

const exportInfos = lines => {
	const all = [ ]
	for (const line of lines)
		if (line instanceof ModuleExportNamed) {
			if (line.assign.assignee.name !== 'name')
				all.push(getExportInfo(line.assign))
		} else if (line instanceof ModuleExportDefault)
			all.push(getExportInfo(line.assign))
	return all
}

const getExportInfo = assign => {
	const name = assign.assignee.name
	const getCommentAndValue = () => {
		const val = assign.value
		if (val instanceof Fun)
			return getFunInfo(val)
		else if (val instanceof Class)
			return getClassInfo(val)
		else if (val instanceof BlockWrap) {
			const block = val.block
			if (block instanceof BlockObj && block.opObjed instanceof Fun) {
				let { opComment, opValueInfo } = getFunInfo(block.opObjed)
				if (opComment === null)
					opComment = block.opComment
				return { opComment, opValueInfo }
			} else
				return { opComment: block.opComment, opValueInfo: null }
		}
		return { opComment: null, opValueInfo: null }
	}
	const { opComment, opValueInfo } = getCommentAndValue()
	return new ExportInfo(name, opComment, opValueInfo)
}

const getFunInfo = (_, noDotInKind) => {
	type(_, Fun)
	const opComment = _.block.opComment
	const args = _.args.map(funArg)
	const opValueInfo = new FunInfo(getFunKind(_, noDotInKind), args)
	return { opComment, opValueInfo }
}

const getFunKind = (_, noDotInKind) => {
	const usesThis = !noDotInKind && _.opDeclareThis !== null
	const isDo = _.block instanceof BlockDo
	const _if = (bool, str) =>
		bool ? str : ''
	return `${_if(usesThis, '.')}${_if(_.isGenerator, '~')}${_if(isDo, '!')}|`
}

const funArg = arg =>
	new ArgInfo(arg.name, opMap(arg.opType, typeDesc))

const typeDesc = type => {
	if (type instanceof LocalAccess)
		return type.name
	else
		return null
}

const getClassInfo = _ => {
	type(_, Class)
	const opSuper = opMap(_.opSuperClass, typeDesc)
	const staticInfos = _.statics.map(getMethodInfo)
	const ctrInfo = opMap(_.opConstructor, getConstructorInfo)
	const methods = _.methods.map(getMethodInfo)
	const opValueInfo = new ClassInfo(opSuper, staticInfos, ctrInfo, methods)
	return { opComment: _.opComment, opValueInfo }
}

const getMethodInfo = _ => {
	type(_, MethodImplLike)
	//TODO: handle getters and setters
	const { opComment, opValueInfo } = getFunInfo(_.fun, true)
	return new MethodInfo(_.symbol, opComment, opValueInfo)
}

const getConstructorInfo = _ => {
	type(_, Constructor)
	const { opComment, opValueInfo } = getFunInfo(_.fun, true)
	return new ConstructorInfo(opComment, opValueInfo)
}
